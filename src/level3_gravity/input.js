import { settings } from './settings.js';

const down = new Set(), hit = new Set();
let capture = null;
let initialized = false;

function onKeyDown(e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.repeat) return;
    if (capture) { capture(e.code); capture = null; e.preventDefault(); return; }
    down.add(e.code); hit.add(e.code);
    if (/Space|Arrow/.test(e.code)) e.preventDefault();
}

function onKeyUp(e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    down.delete(e.code);
}

export function initInput() {
    if (initialized || typeof window === 'undefined') return;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    initialized = true;
}

export function cleanupInput() {
    if (!initialized || typeof window === 'undefined') return;
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    down.clear();
    hit.clear();
    capture = null;
    initialized = false;
}

// Auto-init on first load
if (typeof window !== 'undefined') {
    initInput();
}

export const Input = {
    init: initInput,
    cleanup: cleanupInput,
    held: a => down.has(settings.keys[a]),
    pressed: a => hit.has(settings.keys[a]),
    rawPressed: c => hit.has(c),          // fixed keys used by menus
    axis: () => (down.has(settings.keys.right) || down.has('ArrowRight') ? 1 : 0)
        - (down.has(settings.keys.left) || down.has('ArrowLeft') ? 1 : 0),
    captureNext: cb => { capture = cb; },  // used for key rebinding
    endFrame: () => hit.clear()
};
