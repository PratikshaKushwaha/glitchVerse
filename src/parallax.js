import { W, H } from './render.js';

const rng = s => () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;

function skyline(r, wMin, wMax, hMin, hMax) {
    const b = []; let total = 0;
    while (total < W + 80) {
        const w = wMin + Math.floor(r() * (wMax - wMin)), h = hMin + Math.floor(r() * (hMax - hMin));
        b.push({ w, h, win: Math.floor(r() * 1000) }); total += w;
    }
    return { b, total };
}

export function makeParallax(seed) {
    const r = rng(seed);
    return {
        stars: Array.from({ length: 40 }, () => ({ x: r() * W, y: r() * 90, z: r() * .5 + .5 })),
        layers: [
            { f: .08, base: 112, a: .16, ...skyline(r, 18, 34, 30, 70) },
            { f: .18, base: 134, a: .26, ...skyline(r, 14, 28, 24, 60) },
            { f: .35, base: 158, a: .42, ...skyline(r, 12, 24, 18, 50), lit: true }
        ]
    };
}

export function drawParallax(g, bg, camX, camY, pal) {
    g.save();
    for (const s of bg.stars) {
        const x = (((s.x - camX * .03 * s.z) % W) + W) % W;
        g.fillStyle = `rgba(255,255,255,${.25 + s.z * .4})`; g.fillRect(x | 0, s.y | 0, 1, 1);
    }
    for (const L of bg.layers) {
        const off = Math.floor(camX * L.f) % L.total, dy = Math.round(camY * L.f * .6);
        for (let rep = 0; rep < 2; rep++) {
            let x = rep * L.total - off;
            for (const b of L.b) {
                if (x < W && x + b.w > 0) {
                    const top = L.base - b.h - dy;
                    g.globalAlpha = L.a; g.fillStyle = pal[2]; g.fillRect(x, top, b.w, H - top);
                    if (L.lit && b.h > 24) {                       // lit windows on the nearest layer
                        g.globalAlpha = .7; g.fillStyle = '#ffd23a';
                        for (let j = 0, wy = top + 5; wy < L.base - dy - 6; j++, wy += 8)
                            for (let k = 0, wx = x + 3; wx < x + b.w - 4; k++, wx += 6)
                                if ((b.win + j * 7 + k * 13) % 5 < 2) g.fillRect(wx, wy, 2, 3);
                    }
                }
                x += b.w;
            }
        }
    }
    g.restore();
}