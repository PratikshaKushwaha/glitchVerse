const KEY = 'wayout.settings.v1';

export const DEFAULTS = {
    // video
    scanlines: .35, bloom: .5, vignette: .5, glitch: .5, shake: 1, particles: 2,
    palette: 'neon', showFps: false, reduceFlash: false,
    // audio
    master: .8, music: .6, sfx: .9,
    // gameplay (a few unusual ones)
    difficulty: 'normal', devRadio: true, assist: true, ghost: true,
    touchControls: true,
    // accessibility
    colorblind: 'off',
    keys: {
        left: 'KeyA', right: 'KeyD', jump: 'Space', interact: 'KeyE', gravity: 'KeyG',
        freeze: 'KeyF', dash: 'ShiftLeft', dimension: 'KeyQ', surge: 'KeyC', rewind: 'KeyT'
    }
};

export const settings = structuredClone(DEFAULTS);
try { Object.assign(settings, JSON.parse(localStorage[KEY] || '{}')); } catch { }
settings.keys = { ...DEFAULTS.keys, ...settings.keys };

export const save = () => { localStorage[KEY] = JSON.stringify(settings); };
export const resetSettings = () => { Object.assign(settings, structuredClone(DEFAULTS)); save(); };
