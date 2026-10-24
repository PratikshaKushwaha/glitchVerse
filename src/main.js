
import { Scenes } from './scene.js';
import { Input } from './input.js';
import { Audio } from './audio.js';
import { present, g } from './render.js';
import { settings } from './settings.js';
import { text } from './ui.js';
import { MenuScene } from './scenes/menu.js';

const unlockAudio = () => Audio.init();
addEventListener('keydown', unlockAudio, { once: true });
addEventListener('touchstart', unlockAudio, { once: true });
addEventListener('pointerdown', unlockAudio, { once: true });
Scenes.set(new MenuScene());

let last = performance.now(), acc = 0, fps = 0, frames = 0, fpsT = 0;
function frame(now) {
    const dt = Math.min(.1, (now - last) / 1000); last = now; acc += dt;
    frames++; fpsT += dt; if (fpsT >= 1) { fps = frames; frames = 0; fpsT = 0; }
    while (acc >= 1 / 60) { Scenes.top.update(); Input.endFrame(); acc -= 1 / 60; }
    Scenes.top.draw();
    if (settings.showFps) text('FPS ' + fps, 280, 4, '#ff7', 8);
    present();
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);