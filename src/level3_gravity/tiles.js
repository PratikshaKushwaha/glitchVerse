import { TS } from './levels.js';

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
// t > 0 lightens toward white, t < 0 darkens toward black
const mix = (h, t) => `rgb(${hex(h).map(v => Math.round(t > 0 ? v + (255 - v) * t : v * (1 + t)))})`;

const cache = {};
export function tileSet(pal) {
    const key = pal.join();
    if (cache[key]) return cache[key];
    const base = pal[2], hi = mix(base, .35), top = mix(base, .6), lo = mix(base, -.35), mid = mix(base, -.12);
    const set = [];
    for (let m = 0; m < 16; m++) {
        const c = document.createElement('canvas'); c.width = c.height = TS;
        const x = c.getContext('2d');
        x.fillStyle = base; x.fillRect(0, 0, TS, TS);
        x.fillStyle = mid;                                            // speckle texture
        for (let i = 0; i < 9; i++) x.fillRect((i * 7 + m * 3) % TS, (i * 5 + m * 11) % TS, 1, 1);
        if (!(m & 8)) { x.fillStyle = hi; x.fillRect(0, 0, 1, TS); }           // left edge is open
        if (!(m & 2)) { x.fillStyle = lo; x.fillRect(TS - 1, 0, 1, TS); }      // right edge is open
        if (!(m & 4)) { x.fillStyle = lo; x.fillRect(0, TS - 2, TS, 2); }      // bottom is open
        if (!(m & 1)) { x.fillStyle = hi; x.fillRect(0, 0, TS, 2); x.fillStyle = top; x.fillRect(0, 0, TS, 1); } // top is open
        if (!(m & 1) && !(m & 8)) x.clearRect(0, 0, 1, 1);                      // rounded corners
        if (!(m & 1) && !(m & 2)) x.clearRect(TS - 1, 0, 1, 1);
        if (!(m & 4) && !(m & 8)) x.clearRect(0, TS - 1, 1, 1);
        if (!(m & 4) && !(m & 2)) x.clearRect(TS - 1, TS - 1, 1, 1);
        set.push(c);
    }
    return (cache[key] = set);
}

// two pixel spikes per tile; flipped = hangs from the ceiling
function spike(flipped) {
    const c = document.createElement('canvas'); c.width = c.height = TS;
    const x = c.getContext('2d');
    for (let s = 0; s < 2; s++) for (let r = 0; r < 10; r++) {
        const w = 1 + Math.round(r * 7 / 9), x0 = s * 8 + ((8 - w) >> 1);
        const y = flipped ? 9 - r : TS - 10 + r;
        x.fillStyle = '#d8d4f0'; x.fillRect(x0, y, w, 1);
        x.fillStyle = '#7a74a8'; x.fillRect(x0, y, 1, 1); x.fillRect(x0 + w - 1, y, 1, 1);
    }
    return c;
}
export const SPIKES = { '^': spike(false), 'v': spike(true) };
