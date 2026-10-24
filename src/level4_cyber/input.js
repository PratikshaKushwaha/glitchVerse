import { settings } from './settings.js';
import { Scenes } from './scene.js';

const down = new Set(), hit = new Set();
let capture = null;

// Multi-pointer & touch tracking
let touchHeld = new Set(), touchHit = new Set();
let isTouch = true;
let activePointers = new Map();
let canvasElem = null;
let pointerTap = null;
let cachedVp = null;

export function setCanvas(c) {
    if (canvasElem === c) return;
    canvasElem = c;
    setupTouchListeners(c);
}

export function getTouchButtons(vp) {
    const v = vp || cachedVp || {};
    const w = v.cw || (canvasElem ? canvasElem.width : 320);
    const h = v.ch || (canvasElem ? canvasElem.height : 180);
    const dpr = v.dpr || (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;

    const cssMin = Math.min(w, h) / dpr;
    const s = Math.max(0.85, Math.min(1.35, cssMin / 360)) * dpr;

    const vx = v.x || 0;
    const vy = v.y || 0;
    const vs = v.s || s;

    // HUD button hit areas (Pause & Retry)
    const pauseX = vx + 28 * vs;
    const pauseY = vy + 12 * vs;
    const retryX = vx + 160 * vs;
    const retryY = vy + 12 * vs;

    return [
        // Navigation D-Pad (Bottom-Left)
        { id: 'left', label: '◀', sub: 'LEFT', x: 54 * s, y: h - 54 * s, r: 32 * s, color: '#18b7ff' },
        { id: 'right', label: '▶', sub: 'RIGHT', x: 132 * s, y: h - 54 * s, r: 32 * s, color: '#18b7ff' },

        // Action Buttons (Bottom-Right Ergonomic Cluster)
        { id: 'jump', label: '▲', sub: 'JUMP', x: w - 58 * s, y: h - 58 * s, r: 36 * s, color: '#39ff14' },
        { id: 'dash', label: '⚡', sub: 'DASH', x: w - 132 * s, y: h - 48 * s, r: 27 * s, color: '#18b7ff' },
        { id: 'gravity', label: '⇅', sub: 'FLIP', x: w - 58 * s, y: h - 132 * s, r: 27 * s, color: '#b180ff' },
        { id: 'shoot', label: '🎯', sub: 'SHOOT', x: w - 128 * s, y: h - 114 * s, r: 28 * s, color: '#ff3864' },

        // Top HUD Quick Buttons
        { id: 'pause', label: '⏸', sub: '', x: pauseX, y: pauseY, r: 24 * vs, color: '#ffd23a', isHud: true },
        ...(!Scenes.top || !Scenes.top.won ? [{ id: 'restart', label: '↺', sub: '', x: retryX, y: retryY, r: 26 * vs, color: '#ff4d6d', isHud: true }] : [])
    ];
}

function updatePointerFromEvent(e, type) {
    if (!canvasElem) return;
    isTouch = true;
    const rect = canvasElem.getBoundingClientRect();
    const scaleX = canvasElem.width / rect.width;
    const scaleY = canvasElem.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    if (type === 'down') {
        activePointers.set(e.pointerId !== undefined ? e.pointerId : 'touch', { x: px, y: py, clientX: e.clientX, clientY: e.clientY });
        try { if (canvasElem.setPointerCapture) canvasElem.setPointerCapture(e.pointerId); } catch (_) { }
    } else if (type === 'move') {
        const key = e.pointerId !== undefined ? e.pointerId : 'touch';
        if (activePointers.has(key)) {
            activePointers.set(key, { x: px, y: py, clientX: e.clientX, clientY: e.clientY });
        }
    } else if (type === 'up' || type === 'cancel') {
        const key = e.pointerId !== undefined ? e.pointerId : 'touch';
        activePointers.delete(key);
        try { if (canvasElem.releasePointerCapture) canvasElem.releasePointerCapture(e.pointerId); } catch (_) { }
    }

    const nextHeld = new Set();
    const btns = getTouchButtons(cachedVp);

    for (const [_, pos] of activePointers) {
        let hitButton = false;
        for (const btn of btns) {
            const distSq = (pos.x - btn.x) ** 2 + (pos.y - btn.y) ** 2;
            const radius = btn.r * 1.35;
            if (distSq <= radius * radius) {
                nextHeld.add(btn.id);
                hitButton = true;
            }
        }
        if (!hitButton && type === 'down') {
            pointerTap = { x: pos.x, y: pos.y, clientX: pos.clientX, clientY: pos.clientY };
        }
    }

    for (const id of nextHeld) {
        if (!touchHeld.has(id)) {
            touchHit.add(id);
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try { navigator.vibrate(14); } catch (_) { }
            }
        }
    }
    touchHeld = nextHeld;
}

function setupTouchListeners(c) {
    if (!c || !c.addEventListener) return;

    // Pointer events for universal multi-touch & mouse support
    if (typeof window !== 'undefined' && window.PointerEvent) {
        c.addEventListener('pointerdown', e => { e.preventDefault(); updatePointerFromEvent(e, 'down'); }, { passive: false });
        c.addEventListener('pointermove', e => { e.preventDefault(); updatePointerFromEvent(e, 'move'); }, { passive: false });
        c.addEventListener('pointerup', e => { e.preventDefault(); updatePointerFromEvent(e, 'up'); }, { passive: false });
        c.addEventListener('pointercancel', e => { e.preventDefault(); updatePointerFromEvent(e, 'cancel'); }, { passive: false });
    }

    // Touch events fallback & mobile browser gesture prevention
    c.addEventListener('touchstart', e => {
        if (e.cancelable) e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            updatePointerFromEvent({ pointerId: t.identifier, clientX: t.clientX, clientY: t.clientY }, 'down');
        }
    }, { passive: false });

    c.addEventListener('touchmove', e => {
        if (e.cancelable) e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            updatePointerFromEvent({ pointerId: t.identifier, clientX: t.clientX, clientY: t.clientY }, 'move');
        }
    }, { passive: false });

    c.addEventListener('touchend', e => {
        if (e.cancelable) e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            updatePointerFromEvent({ pointerId: t.identifier, clientX: t.clientX, clientY: t.clientY }, 'up');
        }
    }, { passive: false });

    c.addEventListener('touchcancel', e => {
        if (e.cancelable) e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            updatePointerFromEvent({ pointerId: t.identifier, clientX: t.clientX, clientY: t.clientY }, 'cancel');
        }
    }, { passive: false });
}

if (typeof window !== 'undefined') {
    isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 850) || true;
    window.addEventListener('keydown', e => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        if (e.repeat) return;
        if (capture) { capture(e.code); capture = null; e.preventDefault(); return; }
        down.add(e.code); hit.add(e.code);
        if (/Space|Arrow/.test(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        down.delete(e.code);
    });
    window.addEventListener('blur', () => {
        down.clear(); hit.clear();
        touchHeld.clear(); touchHit.clear();
        activePointers.clear();
    });
}

export const Input = {
    isTouch: () => Boolean(settings.touchControls !== false && isTouch),
    held: a => down.has(settings.keys[a])
        || (a === 'jump' && (down.has('ArrowUp') || down.has('KeyW')))
        || (a === 'dash' && (down.has('KeyK') || down.has('ShiftLeft') || down.has('ShiftRight')))
        || (a === 'shoot' && (down.has('KeyF') || down.has('KeyJ') || down.has('KeyX') || down.has('KeyC') || down.has('KeyE')))
        || touchHeld.has(a),
    pressed: a => hit.has(settings.keys[a])
        || (a === 'jump' && (hit.has('ArrowUp') || hit.has('KeyW')))
        || (a === 'dash' && (hit.has('KeyK') || hit.has('ShiftLeft') || hit.has('ShiftRight')))
        || (a === 'shoot' && (hit.has('KeyF') || hit.has('KeyJ') || hit.has('KeyX') || hit.has('KeyC') || hit.has('KeyE')))
        || touchHit.has(a),
    rawPressed: c => hit.has(c)
        || (c === 'Escape' && touchHit.has('pause'))
        || (c === 'KeyR' && touchHit.has('restart'))
        || (c === 'Space' && (touchHit.has('jump') || touchHit.has('dash'))),
    axis: () => ((down.has(settings.keys.right) || down.has('ArrowRight') || touchHeld.has('right')) ? 1 : 0)
        - ((down.has(settings.keys.left) || down.has('ArrowLeft') || touchHeld.has('left')) ? 1 : 0),
    captureNext: cb => { capture = cb; },
    getPointerTap: () => { const pt = pointerTap; pointerTap = null; return pt; },
    endFrame: () => {
        hit.clear();
        touchHit.clear();
    }
};

export function drawTouchControls(out, vp) {
    cachedVp = vp;
    if (settings.touchControls === false) return;
    const currentScene = Scenes.top;
    if (currentScene && currentScene.constructor && currentScene.constructor.name !== 'GameScene') return;

    const btns = getTouchButtons(vp);
    const dpr = (vp && vp.dpr) || 1;

    out.save();

    // D-Pad connection track between Left and Right
    const bL = btns.find(b => b.id === 'left');
    const bR = btns.find(b => b.id === 'right');
    if (bL && bR) {
        out.beginPath();
        const padW = (bR.x - bL.x) + bL.r * 2.2;
        const padH = bL.r * 1.9;
        const padX = bL.x - bL.r * 1.1;
        const padY = bL.y - padH / 2;
        if (typeof out.roundRect === 'function') {
            out.roundRect(padX, padY, padW, padH, padH / 2);
        } else {
            out.rect(padX, padY, padW, padH);
        }
        out.fillStyle = 'rgba(12, 10, 24, 0.55)';
        out.fill();
        out.strokeStyle = 'rgba(24, 183, 255, 0.22)';
        out.lineWidth = Math.max(1, 1.5 * dpr);
        out.stroke();
    }

    // Action buttons cluster backdrop track
    const bJ = btns.find(b => b.id === 'jump');
    if (bJ) {
        out.beginPath();
        out.arc(bJ.x, bJ.y, bJ.r * 1.25, 0, Math.PI * 2);
        out.fillStyle = 'rgba(12, 10, 24, 0.4)';
        out.fill();
    }

    // Draw buttons
    for (const b of btns) {
        if (b.isHud) continue;
        const held = touchHeld.has(b.id);
        const col = b.color || '#9af0ff';

        // Outer glow on press
        if (held) {
            out.beginPath();
            out.arc(b.x, b.y, b.r + 5 * dpr, 0, Math.PI * 2);
            out.fillStyle = 'rgba(255, 255, 255, 0.15)';
            out.fill();
        }

        // Button background
        out.beginPath();
        out.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        const bgGrad = out.createRadialGradient(b.x, b.y - b.r * 0.2, b.r * 0.1, b.x, b.y, b.r);
        if (held) {
            bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            bgGrad.addColorStop(1, col);
        } else {
            bgGrad.addColorStop(0, 'rgba(32, 24, 58, 0.7)');
            bgGrad.addColorStop(1, 'rgba(12, 9, 24, 0.82)');
        }
        out.fillStyle = bgGrad;
        out.fill();

        // Button ring
        out.strokeStyle = held ? '#ffffff' : col;
        out.lineWidth = Math.max(2, (held ? 2.8 : 1.8) * dpr);
        if (held) {
            out.shadowColor = col;
            out.shadowBlur = 10 * dpr;
        }
        out.stroke();
        out.shadowBlur = 0;

        // Button Icon
        const fontSize = Math.round(b.r * 0.62);
        out.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
        out.textAlign = 'center';
        out.textBaseline = 'middle';
        out.fillStyle = held ? '#ffffff' : col;
        out.fillText(b.label, b.x, b.y - (b.sub ? b.r * 0.18 : 0));

        // Sub label (JUMP, DASH, FLIP, LEFT, RIGHT)
        if (b.sub) {
            const subSize = Math.max(9, Math.round(b.r * 0.26));
            out.font = `bold ${subSize}px system-ui, -apple-system, sans-serif`;
            out.fillStyle = held ? '#ffffff' : 'rgba(215, 235, 255, 0.85)';
            out.fillText(b.sub, b.x, b.y + b.r * 0.48);
        }
    }

    out.restore();
}