import { settings } from './settings.js';

export const W = 320, H = 180;                 // internal pixel resolution
const lo = document.createElement('canvas'); lo.width = W; lo.height = H;
export const g = lo.getContext('2d'); g.imageSmoothingEnabled = false;

const cv = document.getElementById('game'), out = cv.getContext('2d');
const resize = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; };
addEventListener('resize', resize); resize();

export function present(glitchBoost = 0) {
    const s = Math.max(1, Math.floor(Math.min(cv.width / W, cv.height / H)));
    const w = W * s, h = H * s, x = (cv.width - w) >> 1, y = (cv.height - h) >> 1;
    out.imageSmoothingEnabled = false;
    out.fillStyle = '#000'; out.fillRect(0, 0, cv.width, cv.height);
    out.drawImage(lo, x, y, w, h);

    // glitch slices (reduced when "reduce flashing" is on)
    const gi = settings.glitch * (settings.reduceFlash ? .2 : 1) * (.12 + glitchBoost);
    if (Math.random() < gi) {
        const sy = y + (Math.random() * h | 0), sh = 4 + (Math.random() * 20 | 0), dx = ((Math.random() - .5) * 18 * s) | 0;
        out.drawImage(cv, x, sy, w, sh, x + dx, sy, w, sh);
    }
    // bloom: blurred copy added on top
    if (settings.bloom > 0) {
        out.save(); out.globalCompositeOperation = 'lighter'; out.globalAlpha = settings.bloom * .35;
        out.filter = `blur(${2 * s}px)`; out.drawImage(lo, x, y, w, h); out.restore();
    }
    // scanlines
    if (settings.scanlines > 0) {
        out.fillStyle = `rgba(0,0,0,${settings.scanlines * .45})`;
        const th = Math.max(1, Math.ceil(s / 3));
        for (let r = 0; r < H; r += 2) out.fillRect(x, y + r * s + s - th, w, th);
    }
    // vignette
    if (settings.vignette > 0) {
        const gr = out.createRadialGradient(x + w / 2, y + h / 2, h * .35, x + w / 2, y + h / 2, h * .95);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${settings.vignette * .8})`);
        out.fillStyle = gr; out.fillRect(x, y, w, h);
    }
}