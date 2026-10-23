import { settings } from './settings.js';

const down = new Set(), hit = new Set();
let capture = null;

addEventListener('keydown', e => {
    if (e.repeat) return;
    if (capture) { capture(e.code); capture = null; e.preventDefault(); return; }
    down.add(e.code); hit.add(e.code);
    if (/Space|Arrow/.test(e.code)) e.preventDefault();
});
addEventListener('keyup', e => down.delete(e.code));

export const Input = {
    held: a => down.has(settings.keys[a]),
    pressed: a => hit.has(settings.keys[a]),
    rawPressed: c => hit.has(c),          // fixed keys used by menus
    axis: () => (down.has(settings.keys.right) || down.has('ArrowRight') ? 1 : 0)
        - (down.has(settings.keys.left) || down.has('ArrowLeft') ? 1 : 0),
    captureNext: cb => { capture = cb; },  // used for key rebinding
    endFrame: () => hit.clear()
};