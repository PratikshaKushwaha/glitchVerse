// ============================================================
// AUDIO MANAGER — Procedural SFX + ambient drone music
// ============================================================
let ctx = null;
let musicNodes = [];
let musicPlaying = false;

function ac() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(_) {}
  }
  return ctx;
}

function tone(freq, dur, type = 'square', vol = 0.18, delay = 0) {
  const c = ac(); if (!c) return;
  try {
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime + delay);
    g.gain.setValueAtTime(vol, c.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delay + dur);
    o.start(c.currentTime + delay);
    o.stop(c.currentTime + delay + dur + 0.05);
  } catch(_) {}
}

function crack(dur = 0.08, vol = 0.1, delay = 0) {
  const c = ac(); if (!c) return;
  try {
    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
    const src = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 1200;
    src.buffer = buf; src.connect(f); f.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(vol, c.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delay + dur);
    src.start(c.currentTime + delay);
  } catch(_) {}
}

export const Audio = {
  init() {
    const c = ac();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
  },

  sfx(id) {
    switch(id) {
      case 'jump':
        tone(300,0.07,'triangle',0.22); tone(440,0.06,'triangle',0.14,0.06); break;
      case 'land':
        crack(0.08,0.14); break;
      case 'gravity':
        tone(110,0.18,'sawtooth',0.3); tone(220,0.14,'sawtooth',0.18,0.1); tone(440,0.1,'sine',0.1,0.22); break;
      case 'freeze':
        tone(900,0.3,'triangle',0.28); tone(1200,0.2,'triangle',0.18,0.22); break;
      case 'unfreeze':
        tone(440,0.12,'triangle',0.22); tone(280,0.1,'triangle',0.16,0.1); break;
      case 'dim':
        tone(660,0.12,'square',0.22); tone(990,0.1,'square',0.18,0.1); tone(1320,0.08,'square',0.12,0.18); break;
      case 'node':
        [440,550,660,880].forEach((f,i)=>tone(f,0.1,'sine',0.25-i*0.04,i*0.07)); break;
      case 'reactor':
        [330,440,660,880].forEach((f,i)=>tone(f,0.15,'sawtooth',0.28-i*0.04,i*0.08));
        tone(1320,0.25,'sine',0.15,0.35); break;
      case 'checkpoint':
        [520,620,780].forEach((f,i)=>tone(f,0.12,'sine',0.28,i*0.1)); break;
      case 'switch':
        tone(440,0.08,'square',0.25); tone(660,0.08,'square',0.2,0.08); break;
      case 'overload':
        for(let i=0;i<5;i++){tone(80+i*30,0.32,'sawtooth',0.35,i*0.14);crack(0.28,0.18,i*0.14);} break;
      case 'die':
        crack(0.22,0.28); tone(150,0.35,'sawtooth',0.3,0.1); break;
      case 'gameover':
        [220,165,110].forEach((f,i)=>tone(f,0.45,'sawtooth',0.3,i*0.38)); break;
      case 'victory':
        [523,659,784,1047,1568].forEach((f,i)=>tone(f,0.3,'sine',0.28,i*0.13));
        tone(2093,0.5,'sine',0.2,0.7); break;
      case 'entropy':
        crack(0.1,0.07); tone(55,0.1,'sawtooth',0.08); break;
      case 'pulse':
        crack(0.08,0.22); tone(60,0.2,'square',0.3); break;
      case 'select':
        tone(440,0.06,'square',0.2); break;
      case 'error':
        tone(200,0.1,'square',0.25); tone(150,0.15,'square',0.2,0.1); break;
      case 'collapse':
        crack(0.18,0.12); tone(100,0.12,'sawtooth',0.15); break;
    }
  },

  startMusic() {
    if (musicPlaying) return;
    musicPlaying = true;
    const c = ac(); if (!c) return;
    try {
      // Ambient industrial drone: layered detuned oscillators + LFO
      const masterGain = c.createGain();
      masterGain.gain.value = 0.6;
      masterGain.connect(c.destination);

      const defs = [
        { freq:55,   type:'sawtooth', vol:0.032, lfoRate:0.12 },
        { freq:55.9, type:'sawtooth', vol:0.028, lfoRate:0.19 },
        { freq:110,  type:'triangle', vol:0.018, lfoRate:0.07 },
        { freq:82.5, type:'triangle', vol:0.014, lfoRate:0.15 },
        { freq:27.5, type:'sawtooth', vol:0.022, lfoRate:0.05 },
      ];

      musicNodes = defs.map(({ freq, type, vol, lfoRate }) => {
        const osc  = c.createOscillator();
        const gain = c.createGain();
        const lfo  = c.createOscillator();
        const lfog = c.createGain();

        lfo.frequency.value = lfoRate;
        lfog.gain.value = 1.5;
        lfo.connect(lfog); lfog.connect(osc.frequency);
        lfo.start();

        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = vol;
        osc.connect(gain); gain.connect(masterGain);
        osc.start();
        return { osc, gain, lfo, masterGain };
      });
    } catch(_) {}
  },

  stopMusic() {
    musicPlaying = false;
    musicNodes.forEach(({ osc, lfo }) => {
      try { osc.stop(); } catch(_) {}
      try { lfo.stop(); } catch(_) {}
    });
    musicNodes = [];
  },

  setIntensity(level) {
    // level: 0=calm, 1=overload
    const c = ac(); if (!c) return;
    musicNodes.forEach(({ gain }, i) => {
      try {
        const base = [0.032,0.028,0.018,0.014,0.022][i] || 0.02;
        gain.gain.linearRampToValueAtTime(base*(1+level), c.currentTime+2);
      } catch(_) {}
    });
  },
};
