// ============================================================
// INPUT MANAGER
// ============================================================
const down = new Set();
const hit  = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', e => {
    if (e.repeat) return;
    down.add(e.code); hit.add(e.code);
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))
      e.preventDefault();
  });
  window.addEventListener('keyup',  e => down.delete(e.code));
  window.addEventListener('blur',   () => { down.clear(); hit.clear(); });
}

export const Input = {
  held:    c => down.has(c),
  pressed: c => hit.has(c),

  // Named actions
  left:      () => down.has('KeyA') || down.has('ArrowLeft'),
  right:     () => down.has('KeyD') || down.has('ArrowRight'),
  jump:      () => hit.has('Space') || hit.has('ArrowUp') || hit.has('KeyW'),
  jumpHeld:  () => down.has('Space') || down.has('ArrowUp') || down.has('KeyW'),
  gravity:   () => hit.has('KeyQ'),
  freeze:    () => hit.has('KeyE'),
  dimSwitch: () => hit.has('KeyR'),
  interact:  () => hit.has('KeyF'),
  pause:     () => hit.has('Escape'),
  confirm:   () => hit.has('Enter') || hit.has('Space'),
  up:        () => hit.has('ArrowUp') || hit.has('KeyW'),
  down:      () => hit.has('ArrowDown') || hit.has('KeyS'),

  triggerAction(code) {
    hit.add(code);
  },
  setHeld(code, isHeld) {
    if (isHeld) {
      down.add(code);
      hit.add(code);
    } else {
      down.delete(code);
    }
  },
  endFrame: () => hit.clear(),
};
