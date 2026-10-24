import { g, W, H } from './render.js';
import { Menu, text } from './ui.js';
import { settings, resetSettings } from './settings.js';
import { Audio } from './audio.js';
import { Scenes } from './scene.js';
import { GameScene } from './game.js';
import { drawSprite, heroFrame } from './sprites.js';

const B = (label, run) => ({ t: 'button', label, run });
const S = (label, key, min = 0, max = 1, step = .1) => ({ t: 'slider', label, min, max, step, get: () => settings[key], set: v => settings[key] = v });
const Tg = (label, key) => ({ t: 'toggle', label, get: () => settings[key], set: v => settings[key] = v });
const C = (label, key, opts) => ({ t: 'choice', label, opts, get: () => settings[key], set: v => settings[key] = v });
const Bd = a => ({ t: 'bind', label: a, action: a });

export class MenuScene {
    constructor() {
        this.t = 0;
        this.stars = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * 1.5 + .3 }));
        this.stack = [this.main()];
        this.hero = { on: true, vx: 0 };
        Audio.music();
    }
    get menu() { return this.stack[this.stack.length - 1]; }
    sub(title, items) { this.stack.push(new Menu(title, items, () => this.stack.pop())); }

    main() {
        return new Menu('THE WAY OUT', [
            B('Start Game', () => Scenes.set(new GameScene())),
            B('Level Select', () => this.levelSelectMenu()),
            B('Settings', () => this.settingsMenu()),
            B('How To Play', () => this.sub('HOW TO PLAY', [
                B('A/D or Arrows: Move left / right', () => {}),
                B('SPACE or W: Jump (Variable height)', () => {}),
                B('SHIFT or K: Air Dash forward', () => {}),
                B('Wall Slide: Hold toward wall, Jump to Kick', () => {}),
                B('G: Flip Gravity between floor & ceiling', () => {}),
                B('Activate 3 CHECKPOINTS per level to save progress', () => {}),
                B('Survive with 3 LIVES to reach the portal!', () => {})
            ])),
            B('Credits', () => this.sub('CREDITS', [B('Made by our team for PS01 GlitchVerse', () => { })]))
        ]);
    }
    levelSelectMenu() {
        this.sub('LEVEL SELECT', [
            B('1. Warm Up', () => Scenes.set(new GameScene(0))),
            B('2. Spike Run', () => Scenes.set(new GameScene(1))),
            B('3. Upside Down', () => Scenes.set(new GameScene(2))),
            B('4. The Way Out', () => Scenes.set(new GameScene(3)))
        ]);
    }
    settingsMenu() {
        this.sub('SETTINGS', [
            B('Video', () => this.sub('VIDEO', [
                S('Scanlines', 'scanlines'), S('Bloom', 'bloom'), S('Vignette', 'vignette'),
                S('Glitch intensity', 'glitch'), S('Screen shake', 'shake', 0, 2), S('Particles', 'particles', 0, 3, 1),
                C('Palette', 'palette', ['neon', 'gameboy', 'sunset', 'void']),
                Tg('Show FPS', 'showFps'), Tg('Reduce flashing', 'reduceFlash')])),
            B('Audio', () => this.sub('AUDIO', [S('Master', 'master'), S('Music', 'music'), S('Effects', 'sfx')])),
            B('Controls', () => this.sub('CONTROLS', [
                Tg('On-Screen Buttons', 'touchControls'),
                ...Object.keys(settings.keys).map(Bd)
            ])),
            B('Gameplay', () => this.sub('GAMEPLAY', [
                C('Difficulty', 'difficulty', ['easy', 'normal', 'hard', 'glitched']),
                Tg('Developer radio', 'devRadio'), Tg('Jump assist', 'assist'), Tg('Ghost replay', 'ghost')])),
            B('Accessibility', () => this.sub('ACCESSIBILITY', [
                C('Colour-blind mode', 'colorblind', ['off', 'protanopia', 'deuteranopia', 'tritanopia']), Tg('Reduce flashing', 'reduceFlash')])),
            B('Reset to defaults', () => { resetSettings(); Audio.apply(); })
        ]);
    }
    update() { this.t += 1 / 60; this.menu.update(); }
    draw() {
        const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0d0a1f'); gr.addColorStop(1, '#2a1650');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        for (const s of this.stars) {
            s.x -= s.z * .2; if (s.x < 0) s.x = W;
            g.fillStyle = `rgba(255,255,255,${.3 + s.z / 3})`; g.fillRect(s.x | 0, s.y | 0, 1, 1);
        }
        this.menu.draw();
        if (this.stack.length === 1) drawSprite(g, heroFrame(this.hero, this.t), W - 40, H - 40 + Math.sin(this.t * 2) * 2);
    }
}
