import { g, W, H } from './render.js';
import { Input } from './input.js';
import { settings, save } from './settings.js';
import { Audio } from './audio.js';

export function text(str, x, y, color = '#fff', size = 8, align = 'left') {
    g.font = `bold ${size}px monospace`; g.textBaseline = 'top'; g.textAlign = align;
    g.fillStyle = color; g.fillText(str, Math.round(x), Math.round(y));
}

export class Menu {
    constructor(title, items, onBack) { this.title = title; this.items = items; this.i = 0; this.onBack = onBack; this.wait = false; }
    move(d) { this.i = (this.i + d + this.items.length) % this.items.length; Audio.sfx('move'); }
    update() {
        if (this.wait) return;
        const it = this.items[this.i], R = c => Input.rawPressed(c);
        if (R('ArrowDown') || R('KeyS')) this.move(1);
        if (R('ArrowUp') || R('KeyW')) this.move(-1);
        const dir = (R('ArrowRight') || R('KeyD') ? 1 : 0) - (R('ArrowLeft') || R('KeyA') ? 1 : 0);
        const ok = R('Enter') || R('Space');
        if (it.t === 'button' && ok) { Audio.sfx('select'); it.run(); }
        if (it.t === 'slider' && dir) {
            const v = Math.min(it.max, Math.max(it.min, +(it.get() + dir * it.step).toFixed(2)));
            it.set(v); save(); Audio.apply(); Audio.sfx('move');
        }
        if (it.t === 'toggle' && (dir || ok)) { it.set(!it.get()); save(); Audio.sfx('select'); }
        if (it.t === 'choice' && (dir || ok)) {
            const k = it.opts, n = (k.indexOf(it.get()) + (dir || 1) + k.length) % k.length;
            it.set(k[n]); save(); Audio.sfx('select');
        }
        if (it.t === 'bind' && ok) {
            this.wait = true;
            Input.captureNext(code => { settings.keys[it.action] = code; this.wait = false; save(); Audio.sfx('select'); });
        }
        if ((R('Escape') || R('Backspace')) && this.onBack) { Audio.sfx('back'); this.onBack(); }
    }
    draw() {
        text(this.title, W / 2, 14, '#9af0ff', 16, 'center');
        const top = 44, gap = 14;
        this.items.forEach((it, n) => {
            const sel = n === this.i, y = top + n * gap, c = sel ? '#ffffff' : '#8a84b8';
            if (sel) { g.fillStyle = 'rgba(24,183,255,.18)'; g.fillRect(40, y - 2, W - 80, 12); text('>', 46, y, '#18b7ff'); }
            text(it.label, 60, y, c);
            let v = '';
            if (it.t === 'slider') {
                const f = (it.get() - it.min) / (it.max - it.min);
                g.fillStyle = '#26214a'; g.fillRect(190, y + 2, 80, 4); g.fillStyle = sel ? '#18b7ff' : '#5a54a0'; g.fillRect(190, y + 2, 80 * f, 4);
            }
            if (it.t === 'toggle') v = it.get() ? 'ON' : 'OFF';
            if (it.t === 'choice') v = `< ${it.get()} >`;
            if (it.t === 'bind') v = this.wait && sel ? 'press a key...' : settings.keys[it.action];
            if (v) text(v, 272, y, sel ? '#ffd23a' : '#a09ad0', 8, 'right');
        });
        text('W/S move   A/D change   ENTER select   ESC back', W / 2, H - 12, '#6a64a0', 8, 'center');
    }
}
