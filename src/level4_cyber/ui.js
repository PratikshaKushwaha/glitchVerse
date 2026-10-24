import { g, W, H, setUIRenderer, getViewport } from './render.js';
import { Input, drawTouchControls } from './input.js';
import { settings, save } from './settings.js';
import { Audio } from './audio.js';

const uiQueue = [];

export function text(str, x, y, color = '#fff', size = 8, align = 'left', stroke = true) {
    uiQueue.push({ t: 'text', str: String(str), x, y, color, size, align, stroke });
}

export function heart(x, y, filled = true, size = 7) {
    uiQueue.push({ t: 'heart', x, y, filled, size });
}

export function healthGraph(x, y, w, h, hp, maxHp, time = 0) {
    uiQueue.push({ t: 'healthGraph', x, y, w, h, hp, maxHp, time });
}

export function bossBar(x, y, w, h, hp, maxHp, name = 'FINAL BOSS: CYBER OVERLORD') {
    uiQueue.push({ t: 'bossBar', x, y, w, h, hp, maxHp, name });
}

export function box(x, y, w, h, fill = null, stroke = null, radius = 0) {
    uiQueue.push({ t: 'box', x, y, w, h, fill, stroke, radius });
}

export function flushUI(out, vp) {
    const { x: vx, y: vy, s } = vp;
    out.save();

    for (const item of uiQueue) {
        if (item.t === 'box') {
            const bx = Math.round(vx + item.x * s);
            const by = Math.round(vy + item.y * s);
            const bw = Math.round(item.w * s);
            const bh = Math.round(item.h * s);
            const br = Math.round((item.radius || 0) * s);
            out.beginPath();
            if (br > 0 && typeof out.roundRect === 'function') {
                out.roundRect(bx, by, bw, bh, br);
            } else {
                out.rect(bx, by, bw, bh);
            }
            if (item.fill) {
                out.fillStyle = item.fill;
                out.fill();
            }
            if (item.stroke) {
                out.strokeStyle = item.stroke;
                out.lineWidth = Math.max(1, Math.round(s * 0.5));
                out.stroke();
            }
        } else if (item.t === 'heart') {
            const hx = Math.round(vx + item.x * s);
            const hy = Math.round(vy + item.y * s);
            const hs = Math.round(item.size * s * 1.25);
            out.save();
            out.translate(hx, hy);
            out.beginPath();
            const topH = hs * 0.32;
            out.moveTo(0, topH);
            out.bezierCurveTo(0, 0, -hs / 2, 0, -hs / 2, topH);
            out.bezierCurveTo(-hs / 2, hs * 0.6, 0, hs * 0.88, 0, hs);
            out.bezierCurveTo(0, hs * 0.88, hs / 2, hs * 0.6, hs / 2, topH);
            out.bezierCurveTo(hs / 2, 0, 0, 0, 0, topH);
            out.closePath();

            if (item.filled) {
                const grad = out.createLinearGradient(0, 0, 0, hs);
                grad.addColorStop(0, '#ff3864');
                grad.addColorStop(1, '#bd002f');
                out.fillStyle = grad;
                out.shadowColor = '#ff3864';
                out.shadowBlur = Math.max(4, Math.round(2.5 * s));
                out.fill();
                out.shadowBlur = 0;
                out.strokeStyle = '#ffeef2';
                out.lineWidth = Math.max(1, Math.round(s * 0.35));
                out.stroke();
            } else {
                out.fillStyle = 'rgba(25, 12, 35, 0.7)';
                out.fill();
                out.strokeStyle = 'rgba(255, 70, 110, 0.5)';
                out.lineWidth = Math.max(1, Math.round(s * 0.3));
                out.stroke();
            }
            out.restore();
        } else if (item.t === 'healthGraph') {
            const gx = Math.round(vx + item.x * s);
            const gy = Math.round(vy + item.y * s);
            const gw = Math.round(item.w * s);
            const gh = Math.round(item.h * s);
            const isCritical = item.hp <= 1;
            const isWarning = item.hp <= 2;
            const accentColor = isCritical ? '#ff1744' : (isWarning ? '#ffd23a' : '#00f2fe');

            out.save();
            // Background box with glowing border
            out.beginPath();
            if (typeof out.roundRect === 'function') out.roundRect(gx, gy, gw, gh, Math.max(2, Math.round(3 * s)));
            else out.rect(gx, gy, gw, gh);
            out.fillStyle = 'rgba(8, 6, 20, 0.9)';
            out.fill();
            out.strokeStyle = isCritical ? (Math.sin(item.time * 16) > 0 ? '#ff1744' : 'rgba(255, 23, 68, 0.4)') : 'rgba(24, 183, 255, 0.4)';
            out.lineWidth = Math.max(1, Math.round(s * 0.5));
            out.stroke();

            // Label
            const fontSize = Math.max(8, Math.round(5.5 * s));
            out.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
            out.textAlign = 'left';
            out.textBaseline = 'top';
            out.fillStyle = accentColor;
            out.fillText('VITAL GRAPH', gx + Math.round(4 * s), gy + Math.round(2 * s));

            out.textAlign = 'right';
            out.fillStyle = isCritical ? '#ff6b8b' : '#ffffff';
            out.fillText(`HP: ${item.hp}/${item.maxHp}`, gx + gw - Math.round(4 * s), gy + Math.round(2 * s));

            // ECG Heartbeat wave section (left side)
            const ecgW = Math.round(gw * 0.38);
            const ecgX = gx + Math.round(4 * s);
            const ecgY = gy + Math.round(8.5 * s);
            const ecgH = gh - Math.round(11 * s);

            // Subdued grid inside ECG area
            out.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            out.lineWidth = 1;
            out.strokeRect(ecgX, ecgY, ecgW, ecgH);

            // Real-time pulse waveform
            out.beginPath();
            const pulseRate = isCritical ? 9 : (isWarning ? 5.5 : 3.5);
            const midY = ecgY + ecgH / 2;
            for (let px = 0; px <= ecgW; px += 2) {
                const phase = (px / ecgW + item.time * pulseRate) % 1;
                let waveY = 0;
                if (phase > 0.38 && phase < 0.44) {
                    waveY = -Math.sin((phase - 0.38) / 0.06 * Math.PI) * ecgH * 0.22;
                } else if (phase >= 0.44 && phase < 0.52) {
                    const qrs = (phase - 0.44) / 0.08;
                    if (qrs < 0.25) waveY = ecgH * 0.22;
                    else if (qrs < 0.65) waveY = -ecgH * 0.46;
                    else waveY = ecgH * 0.28;
                } else if (phase >= 0.52 && phase < 0.62) {
                    waveY = -Math.sin((phase - 0.52) / 0.1 * Math.PI) * ecgH * 0.18;
                }
                const drawX = ecgX + px;
                const drawY = midY + waveY;
                if (px === 0) out.moveTo(drawX, drawY);
                else out.lineTo(drawX, drawY);
            }
            out.strokeStyle = accentColor;
            out.lineWidth = Math.max(1, Math.round(s * 0.6));
            out.shadowColor = accentColor;
            out.shadowBlur = Math.round(3 * s);
            out.stroke();
            out.shadowBlur = 0;

            // Segmented Vitality Bar section (right side)
            const barX = ecgX + ecgW + Math.round(4 * s);
            const barW = gx + gw - Math.round(4 * s) - barX;
            const barY = ecgY;
            const barH = ecgH;
            const gap = Math.max(1, Math.round(1.5 * s));
            const segW = (barW - gap * (item.maxHp - 1)) / item.maxHp;

            for (let i = 0; i < item.maxHp; i++) {
                const sx = barX + i * (segW + gap);
                const filled = i < item.hp;
                out.beginPath();
                if (typeof out.roundRect === 'function') out.roundRect(sx, barY, segW, barH, Math.max(1, Math.round(s * 0.5)));
                else out.rect(sx, barY, segW, barH);
                if (filled) {
                    const segGrad = out.createLinearGradient(sx, barY, sx, barY + barH);
                    segGrad.addColorStop(0, accentColor);
                    segGrad.addColorStop(1, isCritical ? '#990022' : '#007299');
                    out.fillStyle = segGrad;
                    out.fill();
                    out.strokeStyle = '#ffffff';
                    out.lineWidth = Math.max(1, Math.round(s * 0.3));
                    out.stroke();
                } else {
                    out.fillStyle = 'rgba(255, 23, 68, 0.12)';
                    out.fill();
                    out.strokeStyle = 'rgba(255, 23, 68, 0.3)';
                    out.lineWidth = Math.max(1, Math.round(s * 0.25));
                    out.stroke();
                }
            }
            out.restore();
        } else if (item.t === 'bossBar') {
            const bx = Math.round(vx + item.x * s);
            const by = Math.round(vy + item.y * s);
            const bw = Math.round(item.w * s);
            const bh = Math.round(item.h * s);
            const hpRatio = Math.max(0, Math.min(1, item.hp / item.maxHp));

            out.save();
            out.beginPath();
            if (typeof out.roundRect === 'function') out.roundRect(bx, by, bw, bh, Math.max(2, Math.round(3 * s)));
            else out.rect(bx, by, bw, bh);
            out.fillStyle = 'rgba(15, 6, 22, 0.94)';
            out.fill();
            out.strokeStyle = '#ff1744';
            out.lineWidth = Math.max(1, Math.round(s * 0.6));
            out.stroke();

            const fSize = Math.max(8, Math.round(5.5 * s));
            out.font = `bold ${fSize}px system-ui, -apple-system, sans-serif`;
            out.textAlign = 'left';
            out.textBaseline = 'top';
            out.fillStyle = '#ff6b8b';
            out.fillText(item.name || 'FINAL BOSS: CYBER OVERLORD', bx + Math.round(5 * s), by + Math.round(2 * s));

            out.textAlign = 'right';
            out.fillStyle = '#ffd23a';
            out.fillText(`${item.hp} / ${item.maxHp} HP`, bx + bw - Math.round(5 * s), by + Math.round(2 * s));

            const barX = bx + Math.round(4 * s);
            const barY = by + Math.round(8.5 * s);
            const barW = bw - Math.round(8 * s);
            const barH = bh - Math.round(11 * s);

            out.fillStyle = 'rgba(60, 10, 20, 0.6)';
            out.fillRect(barX, barY, barW, barH);

            if (hpRatio > 0) {
                const fillW = Math.round(barW * hpRatio);
                const grad = out.createLinearGradient(barX, barY, barX + fillW, barY);
                grad.addColorStop(0, '#ff1744');
                grad.addColorStop(0.6, '#ff5252');
                grad.addColorStop(1, '#ffd23a');
                out.fillStyle = grad;
                out.fillRect(barX, barY, fillW, barH);

                out.strokeStyle = '#ffffff';
                out.lineWidth = Math.max(1, Math.round(s * 0.3));
                out.strokeRect(barX, barY, fillW, barH);
            }
            out.restore();
        } else if (item.t === 'text') {
            const tx = Math.round(vx + item.x * s);
            const ty = Math.round(vy + item.y * s);
            const fSize = Math.max(10, Math.round(item.size * s * 1.08));
            out.font = `bold ${fSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
            out.textAlign = item.align;
            out.textBaseline = 'top';

            if (item.stroke !== false) {
                out.strokeStyle = 'rgba(5, 4, 12, 0.95)';
                out.lineWidth = Math.max(2, Math.round(s * 0.8));
                out.lineJoin = 'round';
                out.strokeText(item.str, tx, ty);
            }
            out.fillStyle = item.color;
            out.fillText(item.str, tx, ty);
        }
    }
    uiQueue.length = 0;
    out.restore();
}

// Register high-res UI pass with render pipeline
setUIRenderer((out, vp) => {
    flushUI(out, vp);
    drawTouchControls(out, vp);
});

export class Menu {
    constructor(title, items, onBack) { this.title = title; this.items = items; this.i = 0; this.onBack = onBack; this.wait = false; }
    move(d) { this.i = (this.i + d + this.items.length) % this.items.length; Audio.sfx('move'); }
    update() {
        if (this.wait) return;

        // Mobile touch tap on menu items
        const tap = Input.getPointerTap && Input.getPointerTap();
        if (tap) {
            const vp = getViewport();
            const gx = (tap.clientX - (vp.x / vp.dpr)) / (vp.s / vp.dpr);
            const gy = (tap.clientY - (vp.y / vp.dpr)) / (vp.s / vp.dpr);
            const top = 44, gap = 14;
            this.items.forEach((it, idx) => {
                const iy = top + idx * gap;
                if (gx >= 35 && gx <= W - 35 && gy >= iy - 4 && gy <= iy + 14) {
                    this.i = idx;
                    if (it.t === 'button') {
                        Audio.sfx('select');
                        it.run();
                    } else if (it.t === 'toggle') {
                        it.set(!it.get()); save(); Audio.sfx('select');
                    } else if (it.t === 'choice') {
                        const k = it.opts, n = (k.indexOf(it.get()) + 1) % k.length;
                        it.set(k[n]); save(); Audio.sfx('select');
                    }
                }
            });
        }

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
            if (sel) {
                box(40, y - 2, W - 80, 13, 'rgba(24, 183, 255, 0.22)', 'rgba(154, 240, 255, 0.45)', 3);
                text('>', 46, y, '#18b7ff', 9);
            }
            text(it.label, 60, y, c, 9);
            let v = '';
            if (it.t === 'slider') {
                const f = (it.get() - it.min) / (it.max - it.min);
                box(190, y + 3, 80, 5, '#1e183a');
                box(190, y + 3, 80 * f, 5, sel ? '#18b7ff' : '#5a54a0');
            }
            if (it.t === 'toggle') v = it.get() ? 'ON' : 'OFF';
            if (it.t === 'choice') v = `< ${it.get()} >`;
            if (it.t === 'bind') v = this.wait && sel ? 'press a key...' : settings.keys[it.action];
            if (v) text(v, 272, y, sel ? '#ffd23a' : '#a09ad0', 9, 'right');
        });
        const hint = Input.isTouch() ? 'TAP TO SELECT   ESC / ⏸ BACK' : 'W/S move   A/D change   ENTER select   ESC back';
        text(hint, W / 2, H - 12, '#6a64a0', 8, 'center');
    }
}