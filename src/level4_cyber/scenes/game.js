import { g, W, H, getViewport } from '../render.js';
import { Input } from '../input.js';
import { settings } from '../settings.js';
import { Audio } from '../audio.js';
import { Scenes } from '../scene.js';
import { text, box, healthGraph, bossBar } from '../ui.js';
import { drawSprite, heroFrame, GUN_IMG, pawnFrame, bossFrame, bossGunImg } from '../sprites.js';
import { TS, LEVEL_COUNT, loadLevel } from '../levels.js';
import { tileSet, SPIKES } from '../tiles.js';
import { makeParallax, drawParallax } from '../parallax.js';

const PAL = {
    neon: ['#0d0a1f', '#2a1650', '#4a4766'], gameboy: ['#0f380f', '#306230', '#8bac0f'],
    sunset: ['#2b0f3a', '#d9534f', '#6a3a5a'], void: ['#000', '#101018', '#303040']
};
const TUNES = [[110, [0, 3, 5, 7, 10]], [98, [0, 2, 3, 7, 8]], [87, [0, 1, 5, 7, 8]], [73, [0, 3, 6, 7, 10]]];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class GameScene {
    constructor(li = 2, onSavedAuthor = null) { // Defaults to Level 3: UPSIDE DOWN from reference image!
        this.li = li;
        this.onSavedAuthor = onSavedAuthor;
        this.lv = loadLevel(li);
        this.bg = makeParallax(li * 97 + 13);
        this.p = {
            x: 0, y: 0, w: 10, h: 16, vx: 0, vy: 0, on: false, face: 1,
            jb: 0, co: 0, gd: 1,
            dashing: 0, dashCooldown: 0, canDash: true,
            wallSlide: false,
            scaleX: 1, scaleY: 1,
            gunRecoil: 0
        };

        // Player Combat & Health System (Graph based)
        this.maxHp = 6;
        this.hp = this.maxHp;
        this.invulnerableT = 0;
        this.shootCooldown = 0;
        this.bullets = [];

        // Pawns (Minions)
        this.pawnsKilled = 0;
        this.pawnsTarget = 6;
        this.pawns = [];
        this.pawnSpawnTimer = 0.5;

        // Final Boss with Gun
        this.bossState = 'inactive'; // 'inactive' | 'warning' | 'active' | 'defeated'
        this.bossWarningTimer = 0;
        this.boss = null;
        this.bossBullets = [];
        this.bossDefeatTimer = 0;
        this.victoryTimer = 0;

        this.t = 0;
        this.shake = 0;
        this.parts = [];
        this.gameOver = false;
        this.won = false;
        this.paused = false;
        this.pauseIdx = 0;
        this.clearT = 0;
        this.checkpoints = (this.lv.checkpoints || []).map(cp => ({ ...cp, active: false }));
        this.activeCheckpointId = 0;
        this.respawnPoint = { ...this.lv.spawn };
        this.banner = 'OBJECTIVE: SHOOT 6 PAWNS TO FACE BOSS';
        this.bannerT = 3.2;

        this.respawn();
        this.camX = clamp(this.p.x - W / 2, 0, this.lv.w * TS - W);
        this.camY = clamp(this.p.y - H / 2, 0, Math.max(0, this.lv.h * TS - H));

        // Initial pawn deployment
        this.spawnInitialPawns();

        const [root, scale] = TUNES[li % TUNES.length];
        Audio.music(root, scale);
    }

    getRandomPlatformSpot(minDist = 100) {
        const lv = this.lv;
        const validSpots = [];

        // Scan the entire level for valid platform locations
        for (let ty = 2; ty < lv.h; ty++) {
            for (let tx = 1; tx < lv.w - 1; tx++) {
                if (!this.solidTile(tx, ty)) continue;
                if (!this.solidTile(tx - 1, ty) && !this.solidTile(tx + 1, ty)) continue;
                if (this.solidTile(tx, ty - 1) || this.solidTile(tx, ty - 2)) continue;

                // Check for hazard/spikes
                const c = (lv.grid[ty - 1] || [])[tx];
                if (c === '^' || c === 'v') continue;

                const worldX = tx * TS + 2;
                const worldY = (ty - 1) * TS + (TS - 14);

                // Ensure pawn does not spawn on top of the player
                const dist = Math.abs(worldX - this.p.x);
                if (dist >= minDist) {
                    validSpots.push({ x: worldX, y: worldY });
                }
            }
        }

        // Fallback with smaller distance threshold if needed
        if (validSpots.length === 0) {
            for (let ty = 2; ty < lv.h; ty++) {
                for (let tx = 1; tx < lv.w - 1; tx++) {
                    if (this.solidTile(tx, ty) && (this.solidTile(tx - 1, ty) || this.solidTile(tx + 1, ty)) && !this.solidTile(tx, ty - 1)) {
                        const worldX = tx * TS + 2;
                        if (Math.abs(worldX - this.p.x) >= 60) {
                            validSpots.push({ x: worldX, y: (ty - 1) * TS + (TS - 14) });
                        }
                    }
                }
            }
        }

        if (validSpots.length === 0) return null;

        // Pick completely randomly anywhere from all available platform spots across the level
        const randomIndex = Math.floor(Math.random() * validSpots.length);
        return validSpots[randomIndex];
    }

    spawnInitialPawns() {
        this.pawns = [];
        // Spawn 2 initial pawns randomly anywhere across the platforms
        for (let i = 0; i < 2; i++) {
            const spot = this.getRandomPlatformSpot(110);
            if (spot) {
                this.spawnPawnAt(spot.x, spot.y);
            }
        }
    }

    spawnPawnAt(x, y) {
        if (this.pawns.length >= 3 || this.pawnsKilled + this.pawns.length >= this.pawnsTarget) return;
        this.pawns.push({
            id: Math.random(),
            x, y,
            w: 12, h: 14,
            vx: 0, vy: 0,
            on: true,
            face: Math.random() > 0.5 ? 1 : -1,
            patrolDir: Math.random() > 0.5 ? 1 : -1,
            reverseTimer: 0,
            gd: 1,
            flashT: 0,
            speed: 36 + Math.random() * 20
        });
        this.burst(x + 6, y + 7, 10, '#ff2d55');
    }

    respawn() {
        const s = this.respawnPoint;
        Object.assign(this.p, {
            x: s.x, y: s.y, vx: 0, vy: 0, on: false, gd: 1, jb: 0, co: 0,
            dashing: 0, dashCooldown: 0, canDash: true, wallSlide: false,
            scaleX: 1, scaleY: 1, gunRecoil: 0
        });
        this.invulnerableT = 1.0;
        this.unstick();
    }

    restartGame() {
        this.hp = this.maxHp;
        this.gameOver = false;
        this.won = false;
        this.pawnsKilled = 0;
        this.bossState = 'inactive';
        this.boss = null;
        this.bossBullets = [];
        this.bullets = [];
        this.banner = 'MISSION RESTARTED: DESTROY 6 PAWNS';
        this.bannerT = 2.5;
        this.respawnPoint = { ...this.lv.spawn };
        this.activeCheckpointId = 0;
        this.checkpoints.forEach(c => c.active = false);
        this.respawn();
        this.spawnInitialPawns();
        Audio.sfx('select');
    }

    solidTile(tx, ty) {
        if (tx < 0 || tx >= this.lv.w) return true;
        if (ty < 0 || ty >= this.lv.h) return false;
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
        const a = p.x + 2, b = p.y + 3, w = p.w - 4, h = p.h - 6;
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
        n *= settings.particles;
        for (let i = 0; i < n; i++) {
            this.parts.push({ x, y, vx: (Math.random() - .5) * 80, vy: (Math.random() - .6) * 60, life: .55, c: color });
        }
    }

    damagePlayer(amount = 1, sourceX = undefined) {
        if (this.invulnerableT > 0 || this.gameOver || this.won) return;
        this.hp -= amount;
        this.invulnerableT = 1.2;
        this.shake = 8;
        Audio.sfx('player_hurt');
        this.burst(this.p.x + 5, this.p.y + 8, 14, '#ff3864');

        if (sourceX !== undefined) {
            this.p.vx = (this.p.x >= sourceX ? 1 : -1) * 160;
            this.p.vy = -130 * this.p.gd;
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    die() {
        if (this.gameOver) return;
        const p = this.p;
        Audio.sfx('die');
        this.shake = 12;
        this.burst(p.x + 5, p.y + 8, 20, '#ff4d6d');
        this.gameOver = true;
        this.banner = 'HEALTH DEPLETED - GAME OVER';
        this.bannerT = 999;
        Audio.sfx('gameover');
    }

    fx(dt) {
        this.shake *= .85;
        this.parts.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 120 * dt; q.life -= dt; });
        this.parts = this.parts.filter(q => q.life > 0);
        this.p.scaleX += (1 - this.p.scaleX) * .25;
        this.p.scaleY += (1 - this.p.scaleY) * .25;
        if (this.p.gunRecoil > 0) this.p.gunRecoil = Math.max(0, this.p.gunRecoil - dt * 20);
        if (this.bannerT > 0) this.bannerT -= dt;
        if (this.invulnerableT > 0) this.invulnerableT -= dt;
        if (this.shootCooldown > 0) this.shootCooldown -= dt;
    }

    tryShoot() {
        if (this.shootCooldown > 0 || this.gameOver || this.paused || this.won) return;
        this.shootCooldown = 0.18;
        this.p.gunRecoil = 3.5;

        const dir = this.p.face;
        const bx = this.p.x + (dir > 0 ? this.p.w + 6 : -5);
        const by = this.p.y + (this.p.gd > 0 ? 8 : 6);

        this.bullets.push({
            x: bx,
            y: by,
            vx: dir * 420,
            vy: 0,
            life: 1.2
        });

        Audio.sfx('shoot');
        this.burst(bx, by, 4, '#18b7ff');
        this.burst(bx + dir * 3, by, 3, '#ffd23a');
    }

    triggerBossWarning() {
        this.bossState = 'warning';
        this.bossWarningTimer = 2.4;
        this.banner = '⚠️ WARNING: FINAL BOSS APPROACHING ⚠️';
        this.bannerT = 3.0;
        this.shake = 8;
        Audio.sfx('boss_warning');
    }

    spawnBoss() {
        this.bossState = 'active';
        const bx = clamp(this.p.x + (this.p.face > 0 ? 140 : -140), 60, this.lv.w * TS - 80);
        const by = Math.max(30, this.p.y - 20);

        this.boss = {
            x: bx,
            y: by,
            w: 20,
            h: 24,
            hp: 10,
            maxHp: 10,
            vx: 0,
            vy: 0,
            face: -1,
            flashT: 0,
            shootTimer: 1.2,
            hoverBaseY: by,
            gunRecoil: 0,
            patrolDir: 1
        };

        this.shake = 10;
        this.burst(bx + 10, by + 12, 24, '#ff1744');
        this.burst(bx + 10, by + 12, 16, '#ffd23a');
        Audio.sfx('boss_warning');
    }

    triggerBossDefeat() {
        this.bossState = 'defeated';
        this.won = true;
        this.victoryTimer = 5.0;
        this.shake = 16;
        this.banner = 'SAVED AUTHOR! THE CREATOR IS FREE!';
        this.bannerT = 5.0;
        Audio.sfx('boss_die');
        Audio.sfx('win');
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
            this.restartGame();
        } else if (this.pauseIdx === 3) {
            import('./menu.js').then(m => Scenes.set(new m.MenuScene()));
        }
    }

    update() {
        const dt = 1 / 60, p = this.p, lv = this.lv;
        this.t += dt;

        // Victory animation (5 seconds) & handling (NO restart option!)
        if (this.won) {
            if (this.victoryTimer > 0) {
                this.victoryTimer -= dt;

                // Phase 1 (0 to 1.5s): Boss vaporization with cascading explosions
                if (this.victoryTimer > 3.5) {
                    this.shake = Math.max(this.shake, 8);
                    if (Math.random() < 0.6) {
                        const bx = this.boss ? this.boss.x + 10 : W / 2;
                        const by = this.boss ? this.boss.y + 12 : 60;
                        this.burst(bx + (Math.random() - .5) * 40, by + (Math.random() - .5) * 40, 8,
                            ['#ff1744', '#ffd23a', '#00e5ff', '#ffffff'][Math.random() * 4 | 0]);
                    }
                }

                // Phase 2 (1.5s to 3.5s): Hero celebration & sky fireworks
                if (this.victoryTimer <= 3.5 && this.victoryTimer > 1.5) {
                    p.scaleX = 0.85 + Math.sin(this.t * 12) * 0.15;
                    p.scaleY = 1.25 - Math.sin(this.t * 12) * 0.15;
                    p.gunRecoil = 4;

                    // Celebratory skyward sparks
                    if (Math.random() < 0.35) {
                        this.burst(p.x + 5, p.y - 4, 6, '#ffd23a');
                        Audio.sfx('shoot');
                    }

                    // Golden aura around hero
                    this.burst(p.x + 5 + (Math.random() - .5) * 20, p.y + 8 + (Math.random() - .5) * 16, 2, '#39ff14');

                    // Sky fireworks across cyberpunk skyline
                    if (Math.random() < 0.45) {
                        this.burst(W * Math.random(), 20 + Math.random() * 60, 10,
                            ['#00e5ff', '#ffd23a', '#ff1744', '#39ff14', '#e056fd'][Math.random() * 5 | 0]);
                    }
                }

                // Phase 3 (3.5s to 5.0s): Atmospheric celebration
                if (this.victoryTimer <= 1.5) {
                    if (Math.random() < 0.25) {
                        this.burst(W * Math.random(), 20 + Math.random() * 50, 6,
                            ['#00e5ff', '#ffd23a', '#39ff14'][Math.random() * 3 | 0]);
                    }
                }
            } else {
                // Ambient celebration fireworks after animation
                if (Math.random() < 0.15) {
                    this.burst(W * Math.random(), 25 + Math.random() * 45, 6,
                        ['#00e5ff', '#ffd23a', '#39ff14'][Math.random() * 3 | 0]);
                }

                // Interaction: ONLY Main Menu, NO option to restart game!
                const tap = Input.getPointerTap && Input.getPointerTap();
                if (tap) {
                    const vp = getViewport();
                    const gx = (tap.clientX - (vp.x / vp.dpr)) / (vp.s / vp.dpr);
                    const gy = (tap.clientY - (vp.y / vp.dpr)) / (vp.s / vp.dpr);
                    // Click on PROCEED TO EPILOGUE / MAIN MENU button
                    if (gx >= W / 2 - 75 && gx <= W / 2 + 75 && gy >= 126 && gy <= 152) {
                        if (this.onSavedAuthor) {
                            this.onSavedAuthor();
                            return;
                        }
                        import('./menu.js').then(m => Scenes.set(new m.MenuScene()));
                        return;
                    }
                }
                if (Input.rawPressed('Escape') || Input.rawPressed('Enter') || Input.rawPressed('Space')) {
                    if (this.onSavedAuthor) {
                        this.onSavedAuthor();
                        return;
                    }
                    import('./menu.js').then(m => Scenes.set(new m.MenuScene()));
                    return;
                }
            }

            this.fx(dt);
            return;
        }

        // Game Over handling
        if (this.gameOver) {
            const tap = Input.getPointerTap && Input.getPointerTap();
            if (tap) {
                const vp = getViewport();
                const gx = (tap.clientX - (vp.x / vp.dpr)) / (vp.s / vp.dpr);
                const gy = (tap.clientY - (vp.y / vp.dpr)) / (vp.s / vp.dpr);
                if (gx >= W / 2 - 85 && gx <= W / 2 + 85 && gy >= 96 && gy <= 122) {
                    this.restartGame();
                    return;
                }
                if (gx >= W / 2 - 85 && gx <= W / 2 + 85 && gy >= 126 && gy <= 150) {
                    import('./menu.js').then(m => Scenes.set(new m.MenuScene()));
                    return;
                }
            }
            if (Input.rawPressed('Space') || Input.rawPressed('KeyR') || Input.pressed('jump')) {
                this.restartGame();
                return;
            } else if (Input.rawPressed('Escape')) {
                import('./menu.js').then(m => Scenes.set(new m.MenuScene()));
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
                const items = ['Resume', 'Restart at Checkpoint', 'Restart Mission', 'Main Menu'];
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

        if (!this.won && Input.rawPressed('KeyR')) { this.respawn(); return; }

        // Shooting input (Touch button, KeyF, KeyJ, KeyX, KeyC, or screen tap)
        if (Input.pressed('shoot') || Input.held('shoot')) {
            this.tryShoot();
        }

        // Screen tap shoots if not pressing UI controls
        const tap = Input.getPointerTap && Input.getPointerTap();
        if (tap) {
            const vp = getViewport();
            const gy = (tap.clientY - (vp.y / vp.dpr)) / (vp.s / vp.dpr);
            if (gy > 28) {
                this.tryShoot();
            }
        }

        const ax = Input.axis();
        if (ax) p.face = ax;

        // Dash cooldown & duration update
        p.dashCooldown -= dt;
        p.dashing -= dt;

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

            if (p.wallSlide) {
                p.vy = clamp(p.vy, -200, 60 * p.gd);
                if (Math.random() < .2) this.burst(p.x + (p.face > 0 ? 10 : 0), p.y + (p.gd > 0 ? 14 : 2), 1, '#aaa');
            }

            if (p.vy * p.gd < -40 && !Input.held('jump')) {
                p.vy += 600 * dt * p.gd;
            }
        }

        if (Input.pressed('jump')) p.jb = .12;
        p.jb -= dt; p.co -= dt;
        if (p.on) p.co = settings.assist ? .14 : .06;

        if (p.jb > 0) {
            if (p.wallSlide || (touchingWall && !p.on)) {
                p.vx = -p.face * 160;
                p.vy = -230 * p.gd;
                p.face = -p.face;
                p.jb = p.co = 0;
                p.canDash = true;
                p.scaleX = 0.75; p.scaleY = 1.35;
                Audio.sfx('walljump');
                this.burst(p.x + (p.face > 0 ? 0 : 10), p.y + 8, 6, '#ffd23a');
            } else if (p.co > 0) {
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
                this.banner = `CHECKPOINT ${cp.id}/3 SAVED!`;
                this.bannerT = 2.0;
            }
        });

        // Hazards check
        if (this.hazard(p)) {
            this.damagePlayer(1);
        }
        if (p.y > lv.h * TS + 40 || p.y < -60) {
            this.damagePlayer(this.maxHp);
        }

        // --- PAWNS SPAWN & AI LOGIC ---
        if (this.bossState === 'inactive') {
            if (this.pawns.length < 2 && (this.pawnsKilled + this.pawns.length) < this.pawnsTarget) {
                this.pawnSpawnTimer -= dt;
                if (this.pawnSpawnTimer <= 0) {
                    this.pawnSpawnTimer = 2.0;
                    const spot = this.getRandomPlatformSpot(100);
                    if (spot) {
                        this.spawnPawnAt(spot.x, spot.y);
                    }
                }
            }
        }

        // Update Pawns
        for (let i = this.pawns.length - 1; i >= 0; i--) {
            const pawn = this.pawns[i];
            if (pawn.flashT > 0) pawn.flashT -= dt;
            if (pawn.reverseTimer > 0) pawn.reverseTimer -= dt;

            // Apply gravity
            pawn.vy += 700 * dt * pawn.gd;

            // Feet ground check Y
            const feetY = pawn.gd > 0 ? pawn.y + pawn.h : pawn.y;
            const groundTileY = Math.floor((feetY + (pawn.gd > 0 ? 3 : -3)) / TS);
            const midTileY = Math.floor((pawn.y + pawn.h / 2) / TS);

            // Ledge and obstacle detection while grounded: reverse if no platform ahead!
            if (pawn.on) {
                if (pawn.reverseTimer <= 0) {
                    const dirToPlayer = Math.sign(p.x - (pawn.x + pawn.w / 2)) || 1;
                    const playerLookX = pawn.x + (dirToPlayer > 0 ? pawn.w + 6 : -6);
                    const playerTileX = Math.floor(playerLookX / TS);
                    const hasGroundToPlayer = this.solidTile(playerTileX, groundTileY);
                    const hasWallToPlayer = this.solidTile(playerTileX, midTileY);

                    if (hasGroundToPlayer && !hasWallToPlayer) {
                        pawn.patrolDir = dirToPlayer;
                    } else {
                        // Path to player is a pit/cliff or wall - check current patrol direction
                        const lookX = pawn.x + (pawn.patrolDir > 0 ? pawn.w + 6 : -6);
                        const lookTileX = Math.floor(lookX / TS);
                        const hasGround = this.solidTile(lookTileX, groundTileY);
                        const hasWall = this.solidTile(lookTileX, midTileY);
                        if (!hasGround || hasWall) {
                            pawn.patrolDir = -pawn.patrolDir;
                            pawn.reverseTimer = 0.5;
                        }
                    }
                } else {
                    // Currently locked in reversal away from ledge - check if other edge reached
                    const lookX = pawn.x + (pawn.patrolDir > 0 ? pawn.w + 6 : -6);
                    const lookTileX = Math.floor(lookX / TS);
                    const hasGround = this.solidTile(lookTileX, groundTileY);
                    const hasWall = this.solidTile(lookTileX, midTileY);
                    if (!hasGround || hasWall) {
                        pawn.patrolDir = -pawn.patrolDir;
                        pawn.reverseTimer = 0.5;
                    }
                }
            }

            pawn.face = pawn.patrolDir;
            pawn.vx += (pawn.patrolDir * pawn.speed - pawn.vx) * 0.2;

            // Move pawn X with absolute ledge safeguard (prevents stepping off into air)
            pawn.on = false;
            const nextX = pawn.x + pawn.vx * dt;

            let allowMoveX = true;
            if (Math.abs(pawn.vy) < 20) {
                const leftFootTileX = Math.floor((nextX + 1) / TS);
                const rightFootTileX = Math.floor((nextX + pawn.w - 1) / TS);
                const leftSolid = this.solidTile(leftFootTileX, groundTileY);
                const rightSolid = this.solidTile(rightFootTileX, groundTileY);
                if (!leftSolid && !rightSolid) {
                    allowMoveX = false;
                    pawn.patrolDir = -pawn.patrolDir;
                    pawn.face = pawn.patrolDir;
                    pawn.vx = -pawn.vx * 0.5;
                    pawn.reverseTimer = 0.6;
                }
            }

            if (allowMoveX && !this.overlapsSolid(nextX, pawn.y, pawn.w, pawn.h)) {
                pawn.x = nextX;
            } else {
                pawn.vx = -pawn.vx * 0.5;
                pawn.patrolDir = -pawn.patrolDir;
                pawn.face = pawn.patrolDir;
                pawn.reverseTimer = 0.4;
            }

            // Move pawn Y
            pawn.y += pawn.vy * dt;
            if (this.overlapsSolid(pawn.x, pawn.y, pawn.w, pawn.h)) {
                if (pawn.vy * pawn.gd > 0) {
                    pawn.on = true;
                    if (pawn.gd > 0) {
                        const ty = Math.floor((pawn.y + pawn.h) / TS);
                        pawn.y = ty * TS - pawn.h;
                    } else {
                        const ty = Math.floor(pawn.y / TS);
                        pawn.y = (ty + 1) * TS;
                    }
                }
                pawn.vy = 0;
            }

            // Fall-off-world cleanup safeguard (in case pushed by external force)
            if (pawn.y > lv.h * TS + 30 || pawn.y < -50) {
                this.pawns.splice(i, 1);
                continue;
            }

            // Pawn touch player check: drops player health by 1!
            const hitDistX = Math.abs((pawn.x + pawn.w / 2) - (p.x + p.w / 2));
            const hitDistY = Math.abs((pawn.y + pawn.h / 2) - (p.y + p.h / 2));
            if (hitDistX < (pawn.w + p.w) * 0.48 && hitDistY < (pawn.h + p.h) * 0.48) {
                this.damagePlayer(1, pawn.x);
            }
        }

        // --- BULLETS LOGIC ---
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx * dt;
            b.life -= dt;

            // Hit solid tile
            if (this.solidTile(Math.floor(b.x / TS), Math.floor(b.y / TS))) {
                this.burst(b.x, b.y, 4, '#18b7ff');
                this.bullets.splice(i, 1);
                continue;
            }

            // Hit Pawn: 1 bullet = pawn dead!
            let pawnHit = false;
            for (let j = this.pawns.length - 1; j >= 0; j--) {
                const pawn = this.pawns[j];
                if (b.x >= pawn.x && b.x <= pawn.x + pawn.w && b.y >= pawn.y && b.y <= pawn.y + pawn.h) {
                    pawnHit = true;
                    this.burst(pawn.x + 6, pawn.y + 7, 16, '#ff2d55');
                    this.burst(pawn.x + 6, pawn.y + 7, 8, '#ffd23a');
                    Audio.sfx('pawn_die');
                    this.shake = 5;
                    this.pawns.splice(j, 1);
                    this.pawnsKilled++;

                    if (this.pawnsKilled >= this.pawnsTarget && this.bossState === 'inactive') {
                        this.triggerBossWarning();
                    } else if (this.bossState === 'inactive') {
                        this.banner = `PAWN ELIMINATED! (${this.pawnsKilled}/${this.pawnsTarget})`;
                        this.bannerT = 1.4;
                    }
                    break;
                }
            }

            if (pawnHit) {
                this.bullets.splice(i, 1);
                continue;
            }

            // Hit Boss (takes 10 hits to defeat)
            if (this.bossState === 'active' && this.boss) {
                const boss = this.boss;
                if (b.x >= boss.x && b.x <= boss.x + boss.w && b.y >= boss.y && b.y <= boss.y + boss.h) {
                    boss.hp--;
                    boss.flashT = 0.15;
                    boss.vx += Math.sign(b.vx) * 35;
                    this.burst(b.x, b.y, 10, '#ffd23a');
                    this.burst(b.x, b.y, 6, '#ff1744');
                    Audio.sfx('boss_hit');
                    this.shake = 4;
                    this.bullets.splice(i, 1);

                    if (boss.hp <= 0) {
                        boss.hp = 0;
                        this.triggerBossDefeat();
                    }
                    continue;
                }
            }

            if (b.life <= 0) {
                this.bullets.splice(i, 1);
            }
        }

        // --- BOSS LOGIC ---
        if (this.bossState === 'warning') {
            this.bossWarningTimer -= dt;
            if (this.bossWarningTimer <= 0) {
                this.spawnBoss();
            }
        } else if (this.bossState === 'active' && this.boss) {
            const b = this.boss;
            if (b.flashT > 0) b.flashT -= dt;
            if (b.gunRecoil > 0) b.gunRecoil = Math.max(0, b.gunRecoil - dt * 15);

            b.face = Math.sign(p.x - b.x) || -1;

            // Boss hover motion & hovering thrusters
            b.y = b.hoverBaseY + Math.sin(this.t * 3) * 16;
            if (Math.random() < 0.3) {
                this.burst(b.x + (b.face > 0 ? 4 : 16), b.y + b.h, 2, '#ff1744');
            }

            // Horizontal combat maneuvering
            const targetDist = 110;
            const currentDist = p.x - b.x;
            if (Math.abs(currentDist) < targetDist - 20) {
                b.vx += (-Math.sign(currentDist) * 60 - b.vx) * 0.1;
            } else if (Math.abs(currentDist) > targetDist + 40) {
                b.vx += (Math.sign(currentDist) * 70 - b.vx) * 0.1;
            } else {
                b.vx *= 0.9;
            }
            b.x += b.vx * dt;
            b.x = clamp(b.x, 30, lv.w * TS - 50);

            // Boss Gun Shooting at Player
            b.shootTimer -= dt;
            if (b.shootTimer <= 0) {
                b.shootTimer = 1.9 + Math.random() * 0.6;
                b.gunRecoil = 4;

                const gx = b.x + (b.face > 0 ? b.w + 8 : -8);
                const gy = b.y + 11;

                // Aim directly at player center
                const dx = (p.x + p.w / 2) - gx;
                const dy = (p.y + p.h / 2) - gy;
                const dist = Math.hypot(dx, dy) || 1;
                const speed = 175;

                // Fire 2 spread plasma bolts
                for (const angleOffset of [-0.08, 0.08]) {
                    const angle = Math.atan2(dy, dx) + angleOffset;
                    this.bossBullets.push({
                        x: gx,
                        y: gy,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 2.2
                    });
                }

                Audio.sfx('boss_shoot');
                this.burst(gx, gy, 8, '#ff1744');
                this.burst(gx, gy, 4, '#ffd23a');
            }
        }

        // Update Boss Bullets
        for (let i = this.bossBullets.length - 1; i >= 0; i--) {
            const bb = this.bossBullets[i];
            bb.x += bb.vx * dt;
            bb.y += bb.vy * dt;
            bb.life -= dt;

            // Solid collision
            if (this.solidTile(Math.floor(bb.x / TS), Math.floor(bb.y / TS))) {
                this.burst(bb.x, bb.y, 4, '#ff1744');
                this.bossBullets.splice(i, 1);
                continue;
            }

            // Hit Player: deals 1 damage!
            if (bb.x >= p.x && bb.x <= p.x + p.w && bb.y >= p.y && bb.y <= p.y + p.h) {
                this.damagePlayer(1, bb.x);
                this.burst(bb.x, bb.y, 8, '#ff1744');
                this.bossBullets.splice(i, 1);
                continue;
            }

            if (bb.life <= 0) {
                this.bossBullets.splice(i, 1);
            }
        }

        // Camera smoothly tracks player
        this.camX += (clamp(p.x - W / 2, 0, lv.w * TS - W) - this.camX) * .12;
        this.camY += (clamp(p.y + 8 - H / 2, 0, Math.max(0, lv.h * TS - H)) - this.camY) * .12;
        this.fx(dt);
    }

    draw() {
        const pal = PAL[settings.palette], p = this.p, lv = this.lv, ts = tileSet(pal);
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, pal[0]); gr.addColorStop(1, pal[1]);
        g.fillStyle = gr;
        g.fillRect(0, 0, W, H);
        drawParallax(g, this.bg, this.camX, this.camY, pal);

        g.save();
        const sh = this.shake * settings.shake;
        g.translate(-Math.round(this.camX) + Math.round((Math.random() - .5) * sh),
            -Math.round(this.camY) + Math.round((Math.random() - .5) * sh));

        // Draw solid level tiles
        const sol = (x, y) => x < 0 || x >= lv.w || y < 0 || y >= lv.h || lv.grid[y][x] === '#';
        const x0 = Math.max(0, Math.floor(this.camX / TS) - 1), x1 = Math.min(lv.w - 1, x0 + W / TS + 3);
        const y0 = Math.max(0, Math.floor(this.camY / TS) - 1), y1 = Math.min(lv.h - 1, y0 + H / TS + 3);
        for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
                const c = lv.grid[y][x];
                if (c === '#') {
                    const m = (sol(x, y - 1) ? 1 : 0) | (sol(x + 1, y) ? 2 : 0) | (sol(x, y + 1) ? 4 : 0) | (sol(x - 1, y) ? 8 : 0);
                    g.drawImage(ts[m], x * TS, y * TS);
                } else if (SPIKES[c]) {
                    g.drawImage(SPIKES[c], x * TS, y * TS);
                }
            }
        }

        // Draw Checkpoints
        this.checkpoints.forEach(cp => {
            const bob = Math.sin(this.t * 3 + cp.id) * 2;
            const active = cp.active;
            const color = active ? '#39ff14' : '#18b7ff';
            const glow = active ? 'rgba(57, 255, 20, .28)' : 'rgba(24, 183, 255, .15)';

            g.fillStyle = '#22193e'; g.fillRect(cp.x + 3, cp.y + 13, 10, 3);
            g.fillStyle = color; g.fillRect(cp.x + 4, cp.y + 13, 8, 1);
            g.fillStyle = glow; g.fillRect(cp.x + 6, cp.y + 5, 4, 8);
            g.fillStyle = color; g.fillRect(cp.x + 7, cp.y + 5, 2, 8);

            const cy = cp.y + 3 + bob;
            g.fillStyle = glow;
            g.beginPath();
            g.arc(cp.x + 8, cy, active ? 6 : 4, 0, Math.PI * 2);
            g.fill();

            g.fillStyle = color;
            g.fillRect(cp.x + 6, cy - 3, 4, 6);
            g.fillRect(cp.x + 5, cy - 2, 6, 4);

            if (active) {
                const ring = (this.t * 12) % 8;
                g.strokeStyle = `rgba(57, 255, 20, ${1 - ring / 8})`;
                g.strokeRect(cp.x + 8 - ring, cy - ring, ring * 2, ring * 2);
            }
        });

        // Draw Pawns
        this.pawns.forEach(pawn => {
            drawSprite(g, pawnFrame(pawn, this.t), pawn.x, pawn.y, pawn.face < 0, pawn.gd < 0);
        });

        // Draw Final Boss
        if (this.bossState === 'active' || this.bossState === 'defeated') {
            const b = this.boss;
            if (b) {
                drawSprite(g, bossFrame(b), b.x, b.y, b.face < 0);

                // Boss Gun
                const gunX = b.x + (b.face > 0 ? 13 - (b.gunRecoil || 0) : -3 + (b.gunRecoil || 0));
                const gunY = b.y + 10;
                drawSprite(g, bossGunImg(), gunX, gunY, b.face < 0);

                // Laser targeting beam before shot
                if (b.shootTimer <= 0.45 && b.shootTimer > 0) {
                    g.save();
                    g.strokeStyle = Math.sin(this.t * 30) > 0 ? 'rgba(255, 23, 68, 0.9)' : 'rgba(255, 23, 68, 0.35)';
                    g.lineWidth = 1;
                    g.beginPath();
                    g.moveTo(gunX + (b.face > 0 ? 12 : 0), gunY + 3);
                    g.lineTo(p.x + p.w / 2, p.y + p.h / 2);
                    g.stroke();
                    g.restore();
                }
            }
        }

        // Draw Player Bullets
        this.bullets.forEach(b => {
            g.fillStyle = '#ffffff';
            g.fillRect(b.x - 2, b.y - 1, 6, 2);
            g.fillStyle = '#18b7ff';
            g.fillRect(b.x - 4, b.y, 10, 1);
        });

        // Draw Boss Bullets
        this.bossBullets.forEach(b => {
            g.fillStyle = '#ffffff';
            g.fillRect(b.x - 2, b.y - 2, 4, 4);
            g.fillStyle = '#ff1744';
            g.fillRect(b.x - 3, b.y - 1, 6, 2);
            g.fillRect(b.x - 1, b.y - 3, 2, 6);
        });

        // Particle FX
        this.parts.forEach(q => { g.fillStyle = q.c; g.fillRect(q.x | 0, q.y | 0, 2, 2); });

        // Draw Hero Character with Gun
        if (this.clearT <= 0 && !this.gameOver) {
            const visible = this.invulnerableT <= 0 || (Math.floor(this.t * 18) % 2 === 0);
            if (visible) {
                drawSprite(g, heroFrame(p, this.t), p.x - 1, p.y, p.face < 0, p.gd < 0, p.scaleX, p.scaleY);

                // Draw Gun in Hero's hand
                const gunX = p.x + (p.face > 0 ? 7 - (p.gunRecoil || 0) : -2 + (p.gunRecoil || 0));
                const gunY = p.y + (p.gd > 0 ? 6 : 4);
                drawSprite(g, GUN_IMG, gunX, gunY, p.face < 0, p.gd < 0);
            }
        }
        g.restore();

        // --- HUD HEADER BAR ---
        box(0, 0, W, 25, 'rgba(8, 6, 20, 0.85)', 'rgba(154, 240, 255, 0.18)');

        // Left: Pause button
        box(6, 4, 46, 17, 'rgba(255, 210, 58, 0.18)', 'rgba(255, 210, 58, 0.5)', 3);
        text('⏸ PAUSE', 10, 7, '#ffd23a', 7.5);

        // Center-Left: Level Title & Mission status
        text(`SECTOR 4: CYBER NEXUS`, 56, 4, '#9af0ff', 7.5);
        if (this.bossState === 'inactive') {
            text(`TARGET: ${this.pawnsKilled}/${this.pawnsTarget} PAWNS`, 56, 14, '#ffd23a', 6.5);
        } else if (this.bossState === 'warning') {
            text(`BOSS INCOMING!`, 56, 14, '#ff3864', 6.5);
        } else if (this.bossState === 'active') {
            text(`BOSS FIGHT!`, 56, 14, '#ff1744', 6.5);
        } else if (this.won) {
            text(`SAVED AUTHOR!`, 56, 14, '#39ff14', 6.5);
        }

        // Center: Retry Button (REMOVED when boss is defeated!)
        if (!this.won) {
            box(W / 2 - 24, 4, 48, 17, 'rgba(255, 77, 109, 0.18)', 'rgba(255, 77, 109, 0.5)', 3);
            text('↺ RETRY', W / 2, 7, '#ff4d6d', 7.5, 'center');
        } else {
            box(W / 2 - 38, 4, 76, 17, 'rgba(57, 255, 20, 0.22)', 'rgba(57, 255, 20, 0.6)', 3);
            text('SAVED AUTHOR', W / 2, 7, '#39ff14', 7.5, 'center');
        }

        // Right: HEALTH GRAPH (Replacing 3 hearts as explicitly requested!)
        healthGraph(W - 98, 3, 94, 19, this.hp, this.maxHp, this.t);

        // Boss Bar (when boss is incoming or active)
        if (this.bossState === 'active' && this.boss) {
            bossBar(W / 2 - 75, 27, 150, 16, this.boss.hp, this.boss.maxHp, 'FINAL BOSS: CYBER OVERLORD');
        } else if (this.bossState === 'warning') {
            const flash = Math.sin(this.t * 20) > 0;
            box(W / 2 - 85, 27, 170, 16, flash ? 'rgba(255, 23, 68, 0.35)' : 'rgba(30, 8, 18, 0.9)', '#ff1744', 3);
            text('BOSS DETECTED - GET READY TO DODGE & SHOOT!', W / 2, 30, '#ffd23a', 6.5, 'center');
        }

        // Banners
        if (this.bannerT > 0 && this.banner && !this.won && !this.gameOver) {
            box(W / 2 - 105, 50, 210, 22, 'rgba(10, 8, 25, 0.92)', '#ffd23a', 4);
            text(this.banner, W / 2, 55, '#ffd23a', 8, 'center');
        }

        // Pause Menu Overlay
        if (this.paused) {
            box(0, 0, W, H, 'rgba(10, 8, 24, 0.88)');
            box(W / 2 - 95, 20, 190, 140, 'rgba(18, 14, 38, 0.96)', '#18b7ff', 6);
            text('PAUSED', W / 2, 28, '#9af0ff', 15, 'center');
            const items = ['Resume', 'Restart at Checkpoint', 'Restart Mission', 'Main Menu'];
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
            box(0, 0, W, H, 'rgba(25, 5, 18, 0.92)');
            box(W / 2 - 95, 18, 190, 146, 'rgba(38, 12, 24, 0.96)', '#ff4d6d', 6);
            text('GAME OVER', W / 2, 25, '#ff4d6d', 18, 'center');
            text('HEALTH DEPLETED', W / 2, 49, '#ff9db0', 9, 'center');
            text(`Pawns Killed: ${this.pawnsKilled} / ${this.pawnsTarget}`, W / 2, 68, '#ffd23a', 8, 'center');

            const pulse = (Math.sin(this.t * 5) + 1) * 0.5;
            box(W / 2 - 80, 96, 160, 22, pulse > 0.3 ? 'rgba(255, 77, 109, 0.35)' : 'rgba(255, 77, 109, 0.18)', '#ff4d6d', 4);
            text('↺ RETRY MISSION', W / 2, 102, '#ffffff', 8, 'center');

            box(W / 2 - 80, 124, 160, 20, 'rgba(255, 255, 255, 0.05)', 'rgba(138, 132, 184, 0.4)', 4);
            text('MAIN MENU', W / 2, 129, '#8a84b8', 8, 'center');
            const gHint = Input.isTouch() ? 'TAP A BUTTON ABOVE' : 'PRESS SPACE TO RETRY   ESC FOR MENU';
            text(gHint, W / 2, 150, '#6a64a0', 7, 'center');
        }

        // Saved Author Animation (5 seconds) and Grand SAVED AUTHOR Overlay
        if (this.won) {
            if (this.victoryTimer > 0) {
                // Cinematic letterbox borders during 5 sec saved author animation
                box(0, 0, W, 18, 'rgba(0, 0, 0, 0.75)');
                box(0, H - 18, W, 18, 'rgba(0, 0, 0, 0.75)');

                // Glowing animated saved author title banner
                box(W / 2 - 110, 42, 220, 34, 'rgba(8, 20, 36, 0.94)', '#ffd23a', 5);
                text('SAVED AUTHOR!', W / 2, 47, '#ffd23a', 13, 'center');
                text(`AUTHOR / DEVELOPER LIBERATED! (${Math.ceil(this.victoryTimer)}s)`, W / 2, 64, '#00e5ff', 7.5, 'center');
            } else {
                // Final Grand Saved Author Screen
                box(0, 0, W, H, 'rgba(5, 14, 26, 0.94)');
                box(W / 2 - 105, 16, 210, 150, 'rgba(10, 26, 44, 0.96)', '#39ff14', 6);
                text('SAVED AUTHOR!', W / 2, 24, '#39ff14', 18, 'center');
                text('THE CREATOR IS RESCUED FROM THE GLITCH', W / 2, 47, '#9af0ff', 7.5, 'center');

                text('Final Boss: VAPORIZED (10/10 HP)', W / 2, 65, '#ffd23a', 7.5, 'center');
                text('Pawns Annihilated: 6 / 6', W / 2, 78, '#ffffff', 7.5, 'center');
                text(`Vital Integrity Preserved: ${this.hp} / ${this.maxHp} HP`, W / 2, 91, '#00e5ff', 7.5, 'center');
                text('SIMULATION STABILIZED • AUTHOR RESTORED', W / 2, 104, '#39ff14', 7, 'center');

                // PROCEED TO EPILOGUE BUTTON
                box(W / 2 - 75, 126, 150, 24, 'rgba(24, 183, 255, 0.25)', '#18b7ff', 4);
                text('PROCEED TO EPILOGUE ➔', W / 2, 133, '#ffffff', 8, 'center');
            }
        }
    }
}