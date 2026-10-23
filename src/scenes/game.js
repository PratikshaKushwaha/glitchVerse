import { g, W, H } from '../render.js';
import { Input } from '../input.js';
import { settings } from '../settings.js';
import { Audio } from '../audio.js';
import { Scenes } from '../scene.js';
import { text } from '../ui.js';
import { drawSprite, heroFrame } from '../sprites.js';
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
    constructor(li = 0) {
        this.li = li; this.lv = loadLevel(li); this.bg = makeParallax(li * 97 + 13);
        this.p = { x: 0, y: 0, w: 10, h: 16, vx: 0, vy: 0, on: false, face: 1, jb: 0, co: 0, gd: 1 };
        this.t = 0; this.shake = 0; this.parts = []; this.deaths = 0; this.clearT = 0;
        this.respawn();
        this.camX = clamp(this.p.x - W / 2, 0, this.lv.w * TS - W);
        this.camY = clamp(this.p.y - H / 2, 0, Math.max(0, this.lv.h * TS - H));
        const [root, scale] = TUNES[li % TUNES.length]; Audio.music(root, scale);
    }
    respawn() {
        const s = this.lv.spawn;
        Object.assign(this.p, { x: s.x, y: s.y, vx: 0, vy: 0, on: false, gd: 1, jb: 0, co: 0 });
    }
    at(x, y) {
        const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
        if (tx < 0 || tx >= this.lv.w) return '#';          // side walls
        return (this.lv.grid[ty] || [])[tx] || '.';          // above/below the map is open air
    }
    solid(x, y) { return this.at(x, y) === '#'; }
    hit(x, y, w, h) { return this.solid(x, y) || this.solid(x + w - 1, y) || this.solid(x, y + h - 1) || this.solid(x + w - 1, y + h - 1); }
    hazard(p) {
        const a = p.x + 3, b = p.y + 4, w = p.w - 6, h = p.h - 8;   // forgiving hitbox
        return [[a, b], [a + w - 1, b], [a, b + h - 1], [a + w - 1, b + h - 1]]
            .some(([x, y]) => { const c = this.at(x, y); return c === '^' || c === 'v'; });
    }
    step(p, dx, dy) {
        const n = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) * 2) || 1;
        for (let i = 0; i < n; i++) {
            if (dx) { if (this.hit(p.x + dx / n, p.y, p.w, p.h)) p.vx = 0; else p.x += dx / n; }
            if (dy) { if (this.hit(p.x, p.y + dy / n, p.w, p.h)) { if (Math.sign(dy) === p.gd) p.on = true; p.vy = 0; } else p.y += dy / n; }
        }
    }
    burst(x, y, n, color) {
        n *= settings.particles; for (let i = 0; i < n; i++)
            this.parts.push({ x, y, vx: (Math.random() - .5) * 60, vy: -Math.random() * 40, life: .5, c: color });
    }
    die() {
        const p = this.p;
        Audio.sfx('die'); this.shake = 8; this.deaths++;
        this.burst(p.x + 5, p.y + 8, 10, '#ff4d6d'); this.respawn();
    }
    fx(dt) {
        this.shake *= .85;
        this.parts.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 120 * dt; q.life -= dt; });
        this.parts = this.parts.filter(q => q.life > 0);
    }
    next() {
        if (this.li + 1 < LEVEL_COUNT) Scenes.set(new GameScene(this.li + 1));
        else import('./menu.js').then(m => Scenes.set(new m.MenuScene()));
    }

    update() {
        const dt = 1 / 60, p = this.p, lv = this.lv; this.t += dt;
        if (Input.rawPressed('Escape')) { import('./menu.js').then(m => Scenes.set(new m.MenuScene())); return; }
        if (Input.rawPressed('KeyR')) { this.respawn(); return; }
        if (this.clearT > 0) { this.clearT -= dt; this.fx(dt); if (this.clearT <= 0) this.next(); return; }

        const ax = Input.axis(); p.vx += (ax * 95 - p.vx) * .25; if (ax) p.face = ax;
        p.vy += 720 * dt * p.gd;
        if (Input.pressed('jump')) p.jb = .1; p.jb -= dt; p.co -= dt;
        if (p.on) p.co = settings.assist ? .12 : .04;
        if (p.jb > 0 && p.co > 0) { p.vy = -235 * p.gd; p.jb = p.co = 0; Audio.sfx('jump'); this.burst(p.x + 5, p.y + (p.gd > 0 ? 16 : 0), 4, '#9af0ff'); }
        if (Input.pressed('gravity')) { p.gd *= -1; p.vy *= .3; Audio.sfx('flip'); this.shake = 4; }
        const was = p.on; p.on = false;
        this.step(p, p.vx * dt, 0); this.step(p, 0, p.vy * dt);
        if (p.on && !was) { Audio.sfx('land'); this.burst(p.x + 5, p.y + (p.gd > 0 ? 16 : 0), 5, '#aaa'); }

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

        const e = lv.exit;                                   // exit portal
        if (e) {
            const pulse = (Math.sin(this.t * 4) + 1) * 1.5;
            g.fillStyle = 'rgba(255,210,58,.18)'; g.fillRect(e.x - 3 - pulse, e.y - 6 - pulse, 22 + pulse * 2, 22 + pulse);
            g.fillStyle = '#ffd23a'; g.fillRect(e.x + 2, e.y - 2, 12, 18);
            g.fillStyle = '#120d22'; g.fillRect(e.x + 4, e.y, 8, 16);
            g.fillStyle = '#9af0ff'; g.fillRect(e.x + 7, e.y + ((this.t * 14) % 14 | 0), 2, 2);
        }

        this.parts.forEach(q => { g.fillStyle = q.c; g.fillRect(q.x | 0, q.y | 0, 2, 2); });
        if (this.clearT <= 0) drawSprite(g, heroFrame(p, this.t), p.x - 1, p.y, p.face < 0, p.gd < 0);
        g.restore();

        text('A/D move  SPACE jump  G gravity  R restart  ESC menu', 6, 6, '#cfd', 8);
        text('DEATHS ' + this.deaths, W - 6, 6, '#ff9db0', 8, 'right');
        if (this.t < 2.2) {                                  // level title banner
            g.globalAlpha = Math.min(1, (2.2 - this.t) * 1.5);
            text(lv.name, W / 2, 70, '#9af0ff', 16, 'center'); g.globalAlpha = 1;
        }
        if (this.clearT > 0) text('LEVEL CLEAR', W / 2, 76, '#ffd23a', 16, 'center');
    }
}