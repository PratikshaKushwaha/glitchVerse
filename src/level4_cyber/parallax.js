import { W, H } from './render.js';
import cityBgUrl from './assets/city_bg.jpg';

// Load user-provided cyberpunk city background image
const bgImage = new Image();
bgImage.src = cityBgUrl;

const rng = s => () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;

export function makeParallax(seed) {
    const r = rng(seed);
    return {
        stars: Array.from({ length: 30 }, () => ({ x: r() * W, y: r() * 70, z: r() * .5 + .5 }))
    };
}

export function drawParallax(g, bg, camX, camY, pal) {
    g.save();

    if (bgImage.complete && bgImage.naturalWidth > 0) {
        // Draw the user-provided cyberpunk city image with parallax scrolling
        const targetH = H + 30;
        const scale = targetH / bgImage.height;
        const bgW = bgImage.width * scale;
        const offX = ((camX * 0.18) % bgW + bgW) % bgW;
        const dy = Math.round(camY * 0.05);

        for (let rep = -1; rep <= Math.ceil(W / bgW) + 1; rep++) {
            const drawX = Math.round(rep * bgW - offX);
            g.drawImage(bgImage, drawX, -dy, bgW, targetH);
        }

        // Atmospheric night tint so game platforms and characters remain crisp and legible
        g.fillStyle = 'rgba(8, 6, 20, 0.2)';
        g.fillRect(0, 0, W, H);
    } else {
        // Fallback gradient while loading
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, '#0d0a1f');
        gr.addColorStop(1, '#2a1650');
        g.fillStyle = gr;
        g.fillRect(0, 0, W, H);
    }

    // Gentle twinkling stars in the upper sky
    for (const s of bg.stars) {
        const x = (((s.x - camX * .03 * s.z) % W) + W) % W;
        g.fillStyle = `rgba(255,255,255,${.2 + s.z * .3})`;
        g.fillRect(x | 0, s.y | 0, 1, 1);
    }

    g.restore();
}
