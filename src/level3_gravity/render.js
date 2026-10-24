import { settings } from './settings.js';

export const W = 320, H = 180; // internal pixel resolution
const lo = document.createElement('canvas');
lo.width = W;
lo.height = H;
export const g = lo.getContext('2d');
if (g) g.imageSmoothingEnabled = false;

let cv = null;
let out = null;

export function attachCanvas(canvasEl) {
    cv = canvasEl;
    if (cv) {
        out = cv.getContext('2d');
        resize();
    } else {
        out = null;
    }
}

export const resize = () => {
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const w = rect.width || innerWidth;
    const h = rect.height || innerHeight;
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
};

export function present(glitchBoost = 0) {
    if (!cv || !out) return;
    const s = Math.max(1, Math.floor(Math.min(cv.width / W, cv.height / H)));
    const w = W * s, h = H * s, x = (cv.width - w) >> 1, y = (cv.height - h) >> 1;
    out.imageSmoothingEnabled = false;
    out.fillStyle = '#000';
    out.fillRect(0, 0, cv.width, cv.height);
    out.drawImage(lo, x, y, w, h);

    // glitch slices (reduced when "reduce flashing" is on)
    const gi = settings.glitch * (settings.reduceFlash ? 0.2 : 1) * (0.12 + glitchBoost);
    if (Math.random() < gi) {
        const sy = y + (Math.random() * h | 0), sh = 4 + (Math.random() * 20 | 0), dx = ((Math.random() - 0.5) * 18 * s) | 0;
        out.drawImage(cv, x, sy, w, sh, x + dx, sy, w, sh);
    }
    // bloom: blurred copy added on top
    if (settings.bloom > 0) {
        out.save();
        out.globalCompositeOperation = 'lighter';
        out.globalAlpha = settings.bloom * 0.35;
        out.filter = `blur(${2 * s}px)`;
        out.drawImage(lo, x, y, w, h);
        out.restore();
    }
    // scanlines
    if (settings.scanlines > 0) {
        out.fillStyle = `rgba(0,0,0,${settings.scanlines * 0.45})`;
        const th = Math.max(1, Math.ceil(s / 3));
        for (let r = 0; r < H; r += 2) out.fillRect(x, y + r * s + s - th, w, th);
    }
    // vignette
    if (settings.vignette > 0) {
        const gr = out.createRadialGradient(x + w / 2, y + h / 2, h * 0.35, x + w / 2, y + h / 2, h * 0.95);
        gr.addColorStop(0, 'rgba(0,0,0,0)');
        gr.addColorStop(1, `rgba(0,0,0,${settings.vignette * 0.8})`);
        out.fillStyle = gr;
        out.fillRect(x, y, w, h);
    }
}
