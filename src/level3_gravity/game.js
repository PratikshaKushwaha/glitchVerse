import { g, W, H, getViewport } from './render.js';
import { Input } from './input.js';
import { settings } from './settings.js';
import { Audio } from './audio.js';
import { Scenes } from './scene.js';
import { text, heart, box } from './ui.js';
import { drawSprite, heroFrame } from './sprites.js';
import { TS, LEVEL_COUNT, loadLevel } from './levels.js';
import { tileSet, SPIKES } from './tiles.js';
import { makeParallax, drawParallax } from './parallax.js';
import { MenuScene } from './menu.js';

const PAL = {
    neon: ['#0d0a1f', '#2a1650', '#4a4766'], gameboy: ['#0f380f', '#306230', '#8bac0f'],
    sunset: ['#2b0f3a', '#d9534f', '#6a3a5a'], void: ['#000', '#101018', '#303040']
};
const TUNES = [[110, [0, 3, 5, 7, 10]], [98, [0, 2, 3, 7, 8]], [87, [0, 1, 5, 7, 8]], [73, [0, 3, 6, 7, 10]]];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class GameScene {
    constructor(li = 0, initialLives = 3, onCompleteAll = null) {
        if (typeof initialLives === 'function') {
            onCompleteAll = initialLives;
            initialLives = 3;
        }
        this.li = li;
        this.onCompleteAll = onCompleteAll;
        this.lv = loadLevel(li);
        this.bg = makeParallax(li * 97 + 13);
        this.p = {
            x: 0, y: 0, w: 10, h: 16, vx: 0, vy: 0, on: false, face: 1,
            jb: 0, co: 0, gd: 1,
            dashing: 0, dashCooldown: 0, canDash: true,
            wallSlide: false,
            scaleX: 1, scaleY: 1
        };
        this.t = 0;
        this.shake = 0;
        this.parts = [];
        this.lives = initialLives;
        this.gameOver = false;
        this.paused = false;
        this.pauseIdx = 0;
        this.clearT = 0;
        this.checkpoints = (this.lv.checkpoints || []).map(cp => ({ ...cp, active: false }));
        this.activeCheckpointId = 0;
        this.respawnPoint = { ...this.lv.spawn };
        this.banner = '';
        this.bannerT = 0;
        this.respawn();
        this.camX = clamp(this.p.x - W / 2, 0, this.lv.w * TS - W);
        this.camY = clamp(this.p.y - H / 2, 0, Math.max(0, this.lv.h * TS - H));
        const [root, scale] = TUNES[li % TUNES.length];
        Audio.music(root, scale);
    }
    respawn() {
        const s = this.respawnPoint;
        Object.assign(this.p, {
            x: s.x, y: s.y, vx: 0, vy: 0, on: false, gd: 1, jb: 0, co: 0,
            dashing: 0, dashCooldown: 0, canDash: true, wallSlide: false,
            scaleX: 1, scaleY: 1
        });
        this.unstick();
    }
    solidTile(tx, ty) {
        if (tx < 0 || tx >= this.lv.w) return true;          // horizontal boundaries are solid
        if (ty < 0 || ty >= this.lv.h) return false;         // open air above/below
        return (this.lv.grid[ty] || [])[tx] === '#';
    }
    overlapsSolid(x, y, w = this.p.w, h = this.p.h) {
        const x0 = Math.floor(x / TS);
        const x1 = Math.floor((x + w - 0.001) / TS);
        const y0 = Math.floor(y / TS);
        const y1 = Math.floor((y + h - 0.001) / TS);
        for (let ty = y0; ty <= y1; ty++) {
            for (let tx = x0; tx <= x1; tx++) {
                if (this.solidTile(tx, ty)) return true;
            }
        }
        return false;
    }
    hazard(p) {
        const a = p.x + 2, b = p.y + 3, w = p.w - 4, h = p.h - 6;   // forgiving hitbox
        const x0 = Math.floor(a / TS), x1 = Math.floor((a + w - 0.001) / TS);
        const y0 = Math.floor(b / TS), y1 = Math.floor((b + h - 0.001) / TS);
        for (let ty = y0; ty <= y1; ty++) {
            for (let tx = x0; tx <= x1; tx++) {
                const c = (this.lv.grid[ty] || [])[tx];
                if (c === '^' || c === 'v') return true;
            }
        }
        return false;
    }
    unstick() {
        const p = this.p;
        if (!this.overlapsSolid(p.x, p.y)) return;
        for (let d = 1; d <= 8; d++) {
            for (let dx = -d; dx <= d; dx++) {
                for (let dy = -d; dy <= d; dy++) {
                    if (!this.overlapsSolid(p.x + dx, p.y + dy)) {
                        p.x += dx; p.y += dy;
                        return;
                    }
                }
            }
        }
    }
    moveX(dx) {
        const p = this.p;
        if (!dx) return;
        const sign = Math.sign(dx);
        let rem = Math.abs(dx);
        while (rem > 0) {
            const step = Math.min(rem, 1);
            const nextX = p.x + sign * step;
            if (this.overlapsSolid(nextX, p.y)) {
                let stepped = false;
                if (p.on) {
                    for (let stepUp = 1; stepUp <= 3; stepUp++) {
                        const testY = p.y - stepUp * p.gd;
                        if (!this.overlapsSolid(nextX, testY)) {
                            p.y = testY; p.x = nextX; stepped = true; break;
                        }
                    }
                }
                if (!stepped) {
                    if (sign > 0) {
                        const tx = Math.floor((nextX + p.w - 0.001) / TS);
                        p.x = tx * TS - p.w;
                    } else {
                        const tx = Math.floor(nextX / TS);
                        p.x = (tx + 1) * TS;
                    }
                    p.vx = 0;
                    break;
                }
            } else {
                p.x = nextX;
            }
            rem -= step;
        }
    }
    moveY(dy) {
        const p = this.p;
        if (!dy) return;
        const sign = Math.sign(dy);
        let rem = Math.abs(dy);
        while (rem > 0) {
            const step = Math.min(rem, 1);
            const nextY = p.y + sign * step;
            if (this.overlapsSolid(p.x, nextY)) {
                let nudged = false;
                if (sign !== p.gd) {
                    for (let nudge = 1; nudge <= 4; nudge++) {
                        if (!this.overlapsSolid(p.x + nudge, nextY)) {
                            p.x += nudge; nudged = true; break;
                        }
                        if (!this.overlapsSolid(p.x - nudge, nextY)) {
                            p.x -= nudge; nudged = true; break;
                        }
                    }
                }
                if (nudged) {
                    p.y = nextY;
                } else {
                    if (sign > 0) {
                        const ty = Math.floor((nextY + p.h - 0.001) / TS);
                        p.y = ty * TS - p.h;
                    } else {
                        const ty = Math.floor(nextY / TS);
                        p.y = (ty + 1) * TS;
                    }
                    if (sign === p.gd) {
                        p.on = true;
                    }
                    p.vy = 0;
                    break;
                }
            } else {
                p.y = nextY;
            }
            rem -= step;
        }
    }
    burst(x, y, n, color) {
        n *= settings.particles; for (let i = 0; i < n; i++)
            this.parts.push({ x, y, vx: (Math.random() - .5) * 70, vy: -Math.random() * 50, life: .55, c: color });
    }
    die() {
        if (this.gameOver) return;
        const p = this.p;
        Audio.sfx('die');
        this.shake = 10;
        this.burst(p.x + 5, p.y + 8, 14, '#ff4d6d');
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver = true;
            this.banner = 'GAME OVER';
            this.bannerT = 999;
            Audio.sfx('gameover');
        } else {
            this.banner = `LIVES LEFT: ${this.lives}`;
            this.bannerT = 1.4;
            this.respawn();
        }
    }
    fx(dt) {
        this.shake *= .85;
        this.parts.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 120 * dt; q.life -= dt; });
        this.parts = this.parts.filter(q => q.life > 0);
        this.p.scaleX += (1 - this.p.scaleX) * .25;
        this.p.scaleY += (1 - this.p.scaleY) * .25;
        if (this.bannerT > 0) this.bannerT -= dt;
    }
    next() {
        if (this.li + 1 < LEVEL_COUNT) {
            Scenes.set(new GameScene(this.li + 1, 3, this.onCompleteAll));
        } else {
            if (this.onCompleteAll) {
                this.onCompleteAll();
            } else {
                Scenes.set(new MenuScene());
            }
        }
    }

    restartGame() {
        this.lives = 3;
        this.gameOver = false;
        this.banner = 'LEVEL RESTARTED - 3 LIVES';
        this.bannerT = 2.0;
        this.respawnPoint = { ...this.lv.spawn };
        this.activeCheckpointId = 0;
        this.checkpoints.forEach(c => c.active = false);
        this.respawn();
        Audio.sfx('select');
    }

    choosePauseOption() {
        Audio.sfx('select');
        if (this.pauseIdx === 0) {
            this.paused = false;
        } else if (this.pauseIdx === 1) {
            this.paused = false;
            this.respawn();
        } else if (this.pauseIdx === 2) {
            this.paused = false;
            this.lives = 3;
            this.respawnPoint = { ...this.lv.spawn };
            this.activeCheckpointId = 0;
            this.checkpoints.forEach(c => c.active = false);
            this.respawn();
        } else if (this.pauseIdx === 3) {
            Scenes.set(new MenuScene());
        }
    }

    update() {
        const dt = 1 / 60, p = this.p, lv = this.lv; this.t += dt;

        // Game Over handling
        if (this.gameOver) {
            const tap = Input.getPointerTap && Input.getPointerTap();
            if (tap) {
                const vp = getViewport();
                const gx = (tap.clientX - (vp.x / vp.dpr)) / (vp.s / vp.dpr);
                const gy = (tap.clientY - (vp.y / vp.dpr)) / (vp.s / vp.dpr);
                if (gx >= W / 2 - 85 && gx <= W / 2 + 85 && gy >= 94 && gy <= 120) {
                    this.restartGame();
                    return;
                }
                if (gx >= W / 2 - 85 && gx <= W / 2 + 85 && gy >= 122 && gy <= 146) {
                    Scenes.set(new MenuScene());
                    return;
                }
            }
            if (Input.rawPressed('Space') || Input.rawPressed('KeyR') || Input.pressed('jump')) {
                this.restartGame();
                return;
            } else if (Input.rawPressed('Escape')) {
                Scenes.set(new MenuScene());
                return;
            }
            this.fx(dt);
            return;
        }

        // Pause menu toggle
        if (Input.rawPressed('Escape')) {
            this.paused = !this.paused;
            this.pauseIdx = 0;
            Audio.sfx(this.paused ? 'select' : 'back');
            return;
        }

        // Pause menu interaction
        if (this.paused) {
            const tap = Input.getPointerTap && Input.getPointerTap();
            if (tap) {
                const vp = getViewport();
                const gx = (tap.clientX - (vp.x / vp.dpr)) / (vp.s / vp.dpr);
                const gy = (tap.clientY - (vp.y / vp.dpr)) / (vp.s / vp.dpr);
                const items = ['Resume', 'Restart at Checkpoint', 'Restart Level', 'Main Menu'];
                items.forEach((it, idx) => {
                    const y = 56 + idx * 21;
                    if (gx >= W / 2 - 85 && gx <= W / 2 + 85 && gy >= y - 3 && gy <= y + 18) {
                        this.pauseIdx = idx;
                        this.choosePauseOption();
                    }
                });
            }

            if (Input.rawPressed('ArrowUp') || Input.rawPressed('KeyW')) {
                this.pauseIdx = (this.pauseIdx + 3) % 4;
                Audio.sfx('move');
            }
            if (Input.rawPressed('ArrowDown') || Input.rawPressed('KeyS')) {
                this.pauseIdx = (this.pauseIdx + 1) % 4;
                Audio.sfx('move');
            }
            if (Input.rawPressed('Enter') || Input.rawPressed('Space')) {
                this.choosePauseOption();
            }
            return;
        }

        if (Input.rawPressed('KeyR')) { this.respawn(); return; }
        if (this.clearT > 0) { this.clearT -= dt; this.fx(dt); if (this.clearT <= 0) this.next(); return; }

        const ax = Input.axis();
        if (ax) p.face = ax;

        // Dash cooldown & duration update
        p.dashCooldown -= dt;
        p.dashing -= dt;

        // Ground check resets abilities
        if (p.on) {
            p.canDash = true;
        }

        // Air Dash trigger
        if (Input.pressed('dash') && p.canDash && p.dashCooldown <= 0) {
            p.dashing = 0.15;
            p.canDash = false;
            p.dashCooldown = 0.38;
            p.vx = p.face * 260;
            p.vy = 0;
            p.scaleX = 1.4;
            p.scaleY = 0.7;
            Audio.sfx('dash');
            this.burst(p.x + 5, p.y + 8, 8, '#18b7ff');
            this.shake = 3;
        }

        // Wall Slide & Wall Kick detection
        const touchingWall = !p.on && (this.overlapsSolid(p.x + p.face * 2, p.y));
        const pressingWall = touchingWall && (ax === p.face);
        p.wallSlide = pressingWall && (p.vy * p.gd > 0);

        if (p.dashing <= 0) {
            p.vx += (ax * 95 - p.vx) * .25;
            p.vy += 720 * dt * p.gd;

            // Wall slide friction (drags down gently)
            if (p.wallSlide) {
                p.vy = clamp(p.vy, -200, 60 * p.gd);
                if (Math.random() < .2) this.burst(p.x + (p.face > 0 ? 10 : 0), p.y + (p.gd > 0 ? 14 : 2), 1, '#aaa');
            }

            // Variable jump height: releasing jump button cuts ascent
            if (p.vy * p.gd < -40 && !Input.held('jump')) {
                p.vy += 600 * dt * p.gd;
            }
        }

        if (Input.pressed('jump')) p.jb = .12;
        p.jb -= dt; p.co -= dt;
        if (p.on) p.co = settings.assist ? .14 : .06;

        // Wall Jump or Regular Jump
        if (p.jb > 0) {
            if (p.wallSlide || (touchingWall && !p.on)) {
                // Wall Kick away
                p.vx = -p.face * 160;
                p.vy = -230 * p.gd;
                p.face = -p.face;
                p.jb = p.co = 0;
                p.canDash = true;
                p.scaleX = 0.75; p.scaleY = 1.35;
                Audio.sfx('walljump');
                this.burst(p.x + (p.face > 0 ? 0 : 10), p.y + 8, 6, '#ffd23a');
            } else if (p.co > 0) {
                // Regular Jump
                p.vy = -245 * p.gd;
                p.jb = p.co = 0;
                p.scaleX = 0.8; p.scaleY = 1.3;
                Audio.sfx('jump');
                this.burst(p.x + 5, p.y + (p.gd > 0 ? 16 : 0), 4, '#9af0ff');
            }
        }

        // Gravity flip
        if (Input.pressed('gravity')) {
            p.gd *= -1;
            p.vy = -60 * p.gd;
            p.scaleX = 1.1; p.scaleY = 0.9;
            Audio.sfx('flip');
            this.shake = 4;
            this.burst(p.x + 5, p.y + 8, 6, '#b180ff');
        }

        const was = p.on;
        p.on = false;
        this.unstick();
        this.moveX(p.vx * dt);
        this.moveY(p.vy * dt);

        if (p.on && !was) {
            p.scaleX = 1.25; p.scaleY = 0.75;
            Audio.sfx('land');
            this.burst(p.x + 5, p.y + (p.gd > 0 ? 16 : 0), 5, '#aaa');
        }

        // Checkpoint trigger & activation
        this.checkpoints.forEach(cp => {
            if (!cp.active && p.x < cp.x + TS && p.x + p.w > cp.x && p.y < cp.y + TS && p.y + p.h > cp.y) {
                cp.active = true;
                this.activeCheckpointId = cp.id;
                this.respawnPoint = { x: cp.x + 3, y: cp.y };
                p.canDash = true;
                Audio.sfx('checkpoint');
                this.shake = 3;
                this.burst(cp.x + 8, cp.y + 8, 14, '#39ff14');
                this.banner = `CHECKPOINT ${cp.id}/3 ACTIVATED!`;
                this.bannerT = 2.0;
            }
        });

        if (this.hazard(p) || p.y > lv.h * TS + 40 || p.y < -60) this.die();

        const e = lv.exit;
        if (e && p.x < e.x + TS && p.x + p.w > e.x && p.y < e.y + TS && p.y + p.h > e.y) {
            this.clearT = 1.4; Audio.sfx('switch'); this.burst(e.x + 8, e.y + 8, 12, '#ffd23a');
        }

        this.camX += (clamp(p.x - W / 2, 0, lv.w * TS - W) - this.camX) * .12;
        this.camY += (clamp(p.y + 8 - H / 2, 0, Math.max(0, lv.h * TS - H)) - this.camY) * .12;
        this.fx(dt);
    }

    draw() {
        const pal = PAL[settings.palette], p = this.p, lv = this.lv, ts = tileSet(pal);
        const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, pal[0]); gr.addColorStop(1, pal[1]);
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        drawParallax(g, this.bg, this.camX, this.camY, pal);

        g.save();
        const sh = this.shake * settings.shake;
        g.translate(-Math.round(this.camX) + Math.round((Math.random() - .5) * sh),
            -Math.round(this.camY) + Math.round((Math.random() - .5) * sh));

        const sol = (x, y) => x < 0 || x >= lv.w || y < 0 || y >= lv.h || lv.grid[y][x] === '#';
        const x0 = Math.max(0, Math.floor(this.camX / TS) - 1), x1 = Math.min(lv.w - 1, x0 + W / TS + 3);
        const y0 = Math.max(0, Math.floor(this.camY / TS) - 1), y1 = Math.min(lv.h - 1, y0 + H / TS + 3);
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
            const c = lv.grid[y][x];
            if (c === '#') {
                const m = (sol(x, y - 1) ? 1 : 0) | (sol(x + 1, y) ? 2 : 0) | (sol(x, y + 1) ? 4 : 0) | (sol(x - 1, y) ? 8 : 0);
                g.drawImage(ts[m], x * TS, y * TS);
            } else if (SPIKES[c]) g.drawImage(SPIKES[c], x * TS, y * TS);
        }

        // Draw Checkpoints
        this.checkpoints.forEach(cp => {
            const bob = Math.sin(this.t * 3 + cp.id) * 2;
            const active = cp.active;
            const color = active ? '#39ff14' : '#18b7ff';
            const glow = active ? 'rgba(57, 255, 20, .28)' : 'rgba(24, 183, 255, .15)';

            // Base stand
            g.fillStyle = '#22193e'; g.fillRect(cp.x + 3, cp.y + 13, 10, 3);
            g.fillStyle = color; g.fillRect(cp.x + 4, cp.y + 13, 8, 1);

            // Pillar
            g.fillStyle = glow; g.fillRect(cp.x + 6, cp.y + 5, 4, 8);
            g.fillStyle = color; g.fillRect(cp.x + 7, cp.y + 5, 2, 8);

            // Floating beacon diamond
            const cy = cp.y + 3 + bob;
            g.fillStyle = glow;
            g.beginPath();
            g.arc(cp.x + 8, cy, active ? 6 : 4, 0, Math.PI * 2);
            g.fill();

            g.fillStyle = color;
            g.fillRect(cp.x + 6, cy - 3, 4, 6);
            g.fillRect(cp.x + 5, cy - 2, 6, 4);

            // Active energy rings
            if (active) {
                const ring = (this.t * 12) % 8;
                g.strokeStyle = `rgba(57, 255, 20, ${1 - ring / 8})`;
                g.strokeRect(cp.x + 8 - ring, cy - ring, ring * 2, ring * 2);
            }
        });

        // Exit portal
        const e = lv.exit;
        if (e) {
            const pulse = (Math.sin(this.t * 4) + 1) * 1.5;
            g.fillStyle = 'rgba(255,210,58,.18)'; g.fillRect(e.x - 3 - pulse, e.y - 6 - pulse, 22 + pulse * 2, 22 + pulse);
            g.fillStyle = '#ffd23a'; g.fillRect(e.x + 2, e.y - 2, 12, 18);
            g.fillStyle = '#120d22'; g.fillRect(e.x + 4, e.y, 8, 16);
            g.fillStyle = '#9af0ff'; g.fillRect(e.x + 7, e.y + ((this.t * 14) % 14 | 0), 2, 2);
        }

        // Particle FX
        this.parts.forEach(q => { g.fillStyle = q.c; g.fillRect(q.x | 0, q.y | 0, 2, 2); });

        // Hero sprite with squash/stretch
        if (this.clearT <= 0 && !this.gameOver) {
            drawSprite(g, heroFrame(p, this.t), p.x - 1, p.y, p.face < 0, p.gd < 0, p.scaleX, p.scaleY);
        }
        g.restore();

        // HUD: Glass Top Bar for maximum legibility and contrast
        box(0, 0, W, 25, 'rgba(8, 6, 20, 0.75)', 'rgba(154, 240, 255, 0.15)');

        // Left: Controls on desktop, Level name on touch devices
        if (!Input.isTouch()) {
            text('A/D move   SPACE jump   SHIFT dash   G flip   ESC pause', 8, 7, '#d2e8ff', 7.5);
        } else {
            box(6, 4, 46, 17, 'rgba(255, 210, 58, 0.16)', 'rgba(255, 210, 58, 0.45)', 3);
            text('⏸ PAUSE', 10, 7, '#ffd23a', 7.5);

            text(`LVL ${this.li + 1}: ${lv.name}`, 58, 7, '#9af0ff', 7.5);

            box(W / 2 - 25, 4, 50, 17, 'rgba(255, 77, 109, 0.16)', 'rgba(255, 77, 109, 0.45)', 3);
            text('↺ RETRY', W / 2, 7, '#ff4d6d', 7.5, 'center');
        }

        // Right: 3 Visual Hearts for Lives
        text('LIVES', W - 46, 7, '#ffd23a', 8, 'right');
        for (let i = 0; i < 3; i++) {
            heart(W - 34 + i * 12, 6, i < this.lives, 7);
        }
        text(`CP: ${this.activeCheckpointId}/3`, W - 8, 16, this.activeCheckpointId > 0 ? '#39ff14' : '#6a64a0', 7, 'right');

        // Banners
        if (this.t < 2.0) {
            box(W / 2 - 90, 56, 180, 26, 'rgba(10, 8, 25, 0.85)', '#18b7ff', 4);
            text(lv.name, W / 2, 62, '#9af0ff', 14, 'center');
        } else if (this.bannerT > 0 && this.banner) {
            box(W / 2 - 100, 58, 200, 22, 'rgba(10, 8, 25, 0.88)', '#ffd23a', 4);
            text(this.banner, W / 2, 64, '#ffd23a', 8, 'center');
        }

        if (this.clearT > 0) {
            box(W / 2 - 80, 62, 160, 32, 'rgba(10, 8, 25, 0.92)', '#39ff14', 5);
            text('LEVEL CLEAR!', W / 2, 67, '#39ff14', 13, 'center');
            text('Proceeding to next level...', W / 2, 82, '#9af0ff', 7, 'center');
        }

        // Pause Menu Overlay
        if (this.paused) {
            box(0, 0, W, H, 'rgba(10, 8, 24, 0.85)');
            box(W / 2 - 95, 20, 190, 140, 'rgba(18, 14, 38, 0.96)', '#18b7ff', 6);
            text('PAUSED', W / 2, 28, '#9af0ff', 15, 'center');
            const items = ['Resume', 'Restart at Checkpoint', 'Restart Level', 'Main Menu'];
            items.forEach((it, idx) => {
                const sel = idx === this.pauseIdx;
                const y = 56 + idx * 21;
                if (sel) {
                    box(W / 2 - 80, y - 2, 160, 17, 'rgba(24, 183, 255, 0.3)', '#9af0ff', 3);
                    text('> ' + it + ' <', W / 2, y + 2, '#ffd23a', 9, 'center');
                } else {
                    box(W / 2 - 80, y - 2, 160, 17, 'rgba(255, 255, 255, 0.04)', 'rgba(100, 90, 140, 0.3)', 3);
                    text(it, W / 2, y + 2, '#8a84b8', 9, 'center');
                }
            });
            const pHint = Input.isTouch() ? 'TAP OPTION TO SELECT' : 'W/S navigate   SPACE/ENTER select';
            text(pHint, W / 2, 144, '#6a64a0', 7, 'center');
        }

        // Game Over Overlay
        if (this.gameOver) {
            box(0, 0, W, H, 'rgba(25, 5, 18, 0.9)');
            box(W / 2 - 95, 18, 190, 146, 'rgba(38, 12, 24, 0.96)', '#ff4d6d', 6);
            text('GAME OVER', W / 2, 25, '#ff4d6d', 18, 'center');
            text('OUT OF LIVES', W / 2, 49, '#ff9db0', 9, 'center');
            text(`Checkpoints Claimed: ${this.activeCheckpointId}/3`, W / 2, 68, '#ffd23a', 8, 'center');

            const pulse = (Math.sin(this.t * 5) + 1) * 0.5;
            box(W / 2 - 80, 96, 160, 22, pulse > 0.3 ? 'rgba(255, 77, 109, 0.3)' : 'rgba(255, 77, 109, 0.15)', '#ff4d6d', 4);
            text('↺ RETRY LEVEL (3 LIVES)', W / 2, 102, '#ffffff', 8, 'center');

            box(W / 2 - 80, 124, 160, 20, 'rgba(255, 255, 255, 0.05)', 'rgba(138, 132, 184, 0.4)', 4);
            text('MAIN MENU', W / 2, 129, '#8a84b8', 8, 'center');
            const gHint = Input.isTouch() ? 'TAP A BUTTON ABOVE' : 'PRESS SPACE TO RETRY   ESC FOR MENU';
            text(gHint, W / 2, 150, '#6a64a0', 7, 'center');
        }
    }
}
