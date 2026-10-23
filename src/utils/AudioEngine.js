// Web Audio API Synthesizer for "The Way Out"
// Zero external audio dependencies - 100% reliable low-latency audio

class AudioEngine {
  constructor() {
    this.ctx = null
    this.isMuted = false
    this.ambientGain = null
    this.ambientOsc = null
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // Typewriter key click sound with subtle pitch randomness
  playTypewriter() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    // Random pitch between 800Hz and 1400Hz
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(900 + Math.random() * 400, now)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1200, now)
    filter.Q.setValueAtTime(3, now)

    // Sharp mechanical click envelope
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.045)
  }

  // Walkie-talkie / radio static burst
  playGlitchRadio() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const bufferSize = this.ctx.sampleRate * 0.15
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1500, now)
    filter.Q.setValueAtTime(4, now)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    noise.start(now)
  }

  // Manuscript interaction sound
  playManuscriptOpen() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.3)
  }

  // Door unlock sequence
  playDoorUnlock() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    // Chime 1
    const osc1 = this.ctx.createOscillator()
    const gain1 = this.ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(523.25, now) // C5
    gain1.gain.setValueAtTime(0.15, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    osc1.connect(gain1)
    gain1.connect(this.ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.4)

    // Chime 2
    const osc2 = this.ctx.createOscillator()
    const gain2 = this.ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(783.99, now + 0.15) // G5
    gain2.gain.setValueAtTime(0.18, now + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
    osc2.connect(gain2)
    gain2.connect(this.ctx.destination)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.6)

    // Heavy thud
    const osc3 = this.ctx.createOscillator()
    const gain3 = this.ctx.createGain()
    osc3.type = 'triangle'
    osc3.frequency.setValueAtTime(140, now + 0.2)
    osc3.frequency.exponentialRampToValueAtTime(50, now + 0.5)
    gain3.gain.setValueAtTime(0.2, now + 0.2)
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
    osc3.connect(gain3)
    gain3.connect(this.ctx.destination)
    osc3.start(now + 0.2)
    osc3.stop(now + 0.55)
  }

  // Door creak / opening sound
  playDoorOpen() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(80, now)
    osc.frequency.linearRampToValueAtTime(130, now + 0.8)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(320, now)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 1.1)
  }

  // Door locked reject click
  playDoorLocked() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(160, now)
    osc.frequency.setValueAtTime(120, now + 0.08)

    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.16)
  }

  // Portal transition effect
  playPortalEnter() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.8)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.9)
  }

  // Footstep sound
  playFootstep() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(70 + Math.random() * 20, now)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(200, now)

    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.09)
  }
}

export const sound = new AudioEngine()
export default sound
