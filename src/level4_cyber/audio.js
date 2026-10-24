import { settings } from './settings.js';

let ctx, master, musicBus, sfxBus, timer;

export const Audio = {
    init() {
        if (ctx) return;
        ctx = new AudioContext();
        master = ctx.createGain(); musicBus = ctx.createGain(); sfxBus = ctx.createGain();
        musicBus.connect(master); sfxBus.connect(master); master.connect(ctx.destination);
        this.apply();
    },
    apply() {
        if (!ctx) return;
        master.gain.value = settings.master;
        musicBus.gain.value = settings.music * .5;
        sfxBus.gain.value = settings.sfx;
    },
    tone(f, d = .1, type = 'square', vol = .3, slide = 0, bus = sfxBus) {
        if (!ctx) return;
        const o = ctx.createOscillator(), v = ctx.createGain(), t = ctx.currentTime;
        o.type = type; o.frequency.setValueAtTime(f, t);
        if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + d);
        v.gain.setValueAtTime(vol, t); v.gain.exponentialRampToValueAtTime(.001, t + d);
        o.connect(v); v.connect(bus); o.start(t); o.stop(t + d);
    },
    sfx(n) {
        const T = {
            jump: [320, .12, 'square', .25, 300], land: [120, .08, 'triangle', .3, -60], select: [520, .06, 'square', .2, 0],
            move: [380, .04, 'square', .15, 0], back: [260, .08, 'square', .2, -80], flip: [300, .15, 'sawtooth', .2, 500],
            freeze: [900, .3, 'sine', .25, -600], switch: [200, .2, 'sawtooth', .25, 700], die: [200, .4, 'sawtooth', .3, -150],
            checkpoint: [520, .28, 'triangle', .3, 400], dash: [520, .12, 'sawtooth', .25, -280],
            walljump: [340, .1, 'square', .22, 180], gameover: [160, .6, 'sawtooth', .35, -100],
            shoot: [740, .07, 'sawtooth', .26, -500],
            pawn_hit: [420, .09, 'square', .28, -200],
            pawn_die: [240, .22, 'sawtooth', .35, -140],
            boss_shoot: [260, .16, 'sawtooth', .32, -180],
            boss_hit: [500, .1, 'square', .32, -260],
            boss_warning: [620, .25, 'triangle', .32, 220],
            boss_die: [110, .7, 'sawtooth', .45, -70],
            player_hurt: [180, .18, 'sawtooth', .36, -90]
        }[n];
        if (T) this.tone(...T);
        if (n === 'win') {
            const notes = [261.6, 329.6, 392.0, 523.3, 659.3, 784.0];
            notes.forEach((f, idx) => {
                setTimeout(() => this.tone(f, 0.28, 'triangle', 0.28, 40), idx * 110);
            });
        }
    },
    // simple generative background music (minor pentatonic arpeggio + bass)
    music(root = 110, scale = [0, 3, 5, 7, 10]) {
        clearInterval(timer); let i = 0;
        timer = setInterval(() => {
            if (!ctx) return;
            const n = root * 2 ** (scale[(i * 3 + (i >> 2)) % scale.length] / 12) * (i % 8 < 4 ? 1 : 2);
            this.tone(n, .35, 'triangle', .22, 0, musicBus);
            if (i % 4 === 0) this.tone(root / 2, .9, 'sine', .35, 0, musicBus);
            i++;
        }, 240);
    },
    stopMusic() {
        clearInterval(timer);
    }
};
