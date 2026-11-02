import { useState, useEffect, useRef } from 'react'
import hologramFutureSelfImg from '../assets/hologram_future_self.jpg'
import peacefulFieldImg from '../assets/ending_peaceful_field.png'
import cityBgImg from '../level4_cyber/assets/city_bg.jpg'
import gameLogoImg from '../assets/the_way_out_logo.jpg'
import endingVoiceAudio from '../assets/finalscene-audio.mp3'
import { sound } from '../utils/AudioEngine'

// The exact scripted narrative dialogue matching finalscene-audio.mp3
const DIALOGUE_SCRIPT = [
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: 'Wait, who are you? And why do you look exactly like me?',
    avatar: 'student',
    time: 0.0,
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "Because I am you. I'm from the future.",
    avatar: 'future_self',
    time: 4.8,
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: 'What? But how? I was just a student. I somehow ended up inside this game.',
    avatar: 'student',
    time: 8.0,
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "You don't remember, do you? You created this place. You're the developer.",
    avatar: 'future_self',
    time: 13.5,
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: "I created this? Then why don't I remember anything?",
    avatar: 'student',
    time: 18.2,
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "Because I brought you here. I came back to change something before it's too late.",
    avatar: 'future_self',
    time: 22.0,
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: "Change what? What's happening in the future?",
    avatar: 'student',
    time: 27.2,
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "The world is falling apart. Cities are destroyed. Buildings lie in ruins, and the systems we once depended on are failing. AI has gone far beyond what we ever expected. It's destroying everything, and we're struggling to control what we've created.",
    avatar: 'future_self',
    time: 30.5,
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: 'Are you saying the world is going to be destroyed?',
    avatar: 'student',
    time: 46.5,
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "It's already happening where I come from. I don't have much time left, and I can't explain everything. Just remember this: Don't let things reach the point they have in my time.",
    avatar: 'future_self',
    time: 50.2,
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: "Wait! Don't go! Will I see you again?",
    avatar: 'student',
    time: 61.2,
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: 'I hope so. But next time, I hope things are different.',
    avatar: 'future_self',
    time: 64.8,
  },
]

export default function FinalEndingScene({ playerName = 'Seeker', onRestart, onBackToMenu }) {
  // Phase sequence:
  // 1. 'field' -> The pixelated holographic scene with Future Self in the field (Image 2)
  // 2. 'glimpse' -> Digital glitch distortion briefly showing ruined future city
  // 3. 'fadeout' -> Blank transition between the warning and final title card
  // 4. 'title' -> THE WAY OUT — THE END... FOR NOW. — TO BE CONTINUED.
  const [phase, setPhase] = useState('field')
  const [dialogueIdx, setDialogueIdx] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [glitchIntensity, setGlitchIntensity] = useState(0)
  const [materialized, setMaterialized] = useState(false)
  const [firstDialogueReady, setFirstDialogueReady] = useState(false)
  const [audioTime, setAudioTime] = useState(0)
  const audioSlotRef = useRef(null)

  // Smooth emergence of the hologram scene from white light
  useEffect(() => {
    const t1 = setTimeout(() => {
      setMaterialized(true)
    }, 150)
    const t2 = setTimeout(() => {
      setFirstDialogueReady(true)
    }, 2200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  // Narrative Voiceover Audio Playback
  useEffect(() => {
    if (phase === 'field' && audioSlotRef.current) {
      const playTimer = setTimeout(() => {
        if (audioSlotRef.current) {
          audioSlotRef.current.currentTime = 0
          audioSlotRef.current.play().catch((err) => {
            console.warn('Voiceover waiting for user interaction:', err)
          })
        }
      }, 1200)
      return () => clearTimeout(playTimer)
    } else if (audioSlotRef.current) {
      audioSlotRef.current.pause()
    }
  }, [phase])

  // Subtitle Typewriter Effect for Dialogue
  const currentLine = DIALOGUE_SCRIPT[dialogueIdx]
  useEffect(() => {
    if (phase !== 'field' || !currentLine) return
    if (dialogueIdx === 0 && !firstDialogueReady) return

    setIsTyping(true)
    setDisplayedText('')
    let charIndex = 0
    const fullText = currentLine.text.replace(/Seeker/g, playerName)

    const interval = setInterval(() => {
      charIndex += 2
      if (charIndex >= fullText.length) {
        setDisplayedText(fullText)
        setIsTyping(false)
        clearInterval(interval)
      } else {
        setDisplayedText(fullText.slice(0, charIndex))
        if (charIndex % 6 === 0) {
          sound.playTypewriter()
        }
      }
    }, 24)

    return () => clearInterval(interval)
  }, [phase, dialogueIdx, currentLine, playerName, firstDialogueReady])

  // Keep subtitles aligned with the supplied voiceover instead of advancing on
  // a separate reading timer.
  useEffect(() => {
    if (phase !== 'field') return
    const nextDialogueIdx = DIALOGUE_SCRIPT.reduce((lastIndex, line, index) => (
      audioTime >= line.time ? index : lastIndex
    ), 0)
    if (nextDialogueIdx !== dialogueIdx) {
      setDialogueIdx(nextDialogueIdx)
    }
  }, [audioTime, phase, dialogueIdx])

  const handleNextDialogue = () => {
    if (isTyping) {
      setDisplayedText(currentLine.text.replace(/Seeker/g, playerName))
      setIsTyping(false)
      return
    }

    if (dialogueIdx === DIALOGUE_SCRIPT.length - 1) {
      // Finished all dialogue -> Trigger glitch glimpse of ruined future city
      sound.playGlitchRadio()
      setPhase('glimpse')
    }
  }

  // Glimpse of the Destroyed Future City (held long enough to read)
  useEffect(() => {
    if (phase === 'glimpse') {
      sound.playDoorLocked()
      const glitchInterval = setInterval(() => {
        setGlitchIntensity(Math.random())
      }, 80)

      const timer = setTimeout(() => {
        clearInterval(glitchInterval)
        sound.playVictory()
        setPhase('fadeout')
      }, 5200)

      return () => {
        clearInterval(glitchInterval)
        clearTimeout(timer)
      }
    }
  }, [phase])

  // Give the warning card a clean, deliberate blank-out before the credits.
  useEffect(() => {
    if (phase !== 'fadeout') return
    const timer = setTimeout(() => setPhase('title'), 2200)
    return () => clearTimeout(timer)
  }, [phase])

  // Keyboard shortcut: Space / Enter / Click advances; K skips
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (audioSlotRef.current && audioSlotRef.current.paused && phase === 'field') {
        audioSlotRef.current.play().catch(() => {})
      }
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        if (phase === 'field') handleNextDialogue()
        else if (phase === 'glimpse') setPhase('fadeout')
      } else if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        setPhase('title')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, isTyping, dialogueIdx])

  const speakerName = currentLine.speaker === 'STUDENT' ? playerName : 'Future Self'
  const isFutureSelf = currentLine.avatar === 'future_self'

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none font-mono text-white bg-black flex flex-col justify-between"
      onClick={() => {
        if (audioSlotRef.current && audioSlotRef.current.paused && phase === 'field') {
          audioSlotRef.current.play().catch(() => {})
        }
        if (phase === 'field') handleNextDialogue()
      }}
    >
      {/* Scripted Narrative Voiceover Audio */}
      <audio
        ref={audioSlotRef}
        src={endingVoiceAudio}
        preload="auto"
        onTimeUpdate={(event) => setAudioTime(event.currentTarget.currentTime)}
        onEnded={() => {
          if (phase === 'field') {
            sound.playGlitchRadio()
            setPhase('glimpse')
          }
        }}
      />

      {/* ================= THE HOLOGRAPHIC SCENE ================= */}
      {phase === 'field' && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Layer 1: Living Grassy Meadow Under Starry Night Sky */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={peacefulFieldImg}
              alt="Peaceful Meadow under Starry Night Sky"
              className={`w-full h-full object-cover object-bottom select-none transition-all duration-[3200ms] ease-out ${
                materialized ? 'scale-100 filter-none opacity-100' : 'scale-105 blur-sm opacity-60'
              }`}
            />
            {/* Ambient vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(3,7,18,0.85)_100%)] pointer-events-none" />
            
            {/* Subtle atmospheric scanlines */}
            <div
              className={`absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none transition-opacity duration-[3000ms] ${
                materialized ? 'opacity-40' : 'opacity-0'
              }`}
            />
          </div>

          {/* Top Info Bar */}
          <div
            className={`relative z-20 pt-4 px-6 flex items-center justify-between transition-all duration-1000 delay-1000 ${
              materialized ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur text-xs font-mono text-cyan-200">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>THE RETREAT // RESTORED REALITY COORDINATES</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setPhase('title')
              }}
              className="px-3.5 py-1 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-xs font-mono text-gray-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              title="Skip to Final Credits"
            >
              <span>Skip [K]</span>
              <span>➔</span>
            </button>
          </div>

          {/* Layer 2: Centerstage Holographic Future Self Character */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-2 pointer-events-none select-none max-h-[64vh]">
            {/* Floating telemetry headers */}
            <div
              className={`w-full max-w-2xl flex justify-between px-6 mb-2 text-[10px] font-mono tracking-widest text-cyan-300/80 transition-opacity duration-1000 delay-[1400ms] ${
                materialized ? 'opacity-90' : 'opacity-0'
              }`}
            >
              <span className="flex items-center gap-1.5 bg-black/50 px-2.5 py-0.5 rounded border border-cyan-500/30 backdrop-blur">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                SIGNAL: 2042-PRIME // HOLO_LINK
              </span>
              <span className="hidden sm:inline-block bg-black/50 px-2.5 py-0.5 rounded border border-cyan-500/30 backdrop-blur text-cyan-400/80">
                IDENTITY: LEAD DEVELOPER
              </span>
            </div>

            {/* Hologram Avatar Container */}
            <div className="relative flex items-center justify-center max-w-xl w-full">
              {/* Glowing Hologram Projection Rings on the Grass */}
              <div className="absolute -bottom-2 w-80 h-16 rounded-full bg-cyan-500/20 blur-md border border-cyan-400/50 shadow-[0_0_50px_rgba(34,211,238,0.7)] pointer-events-none" />
              <div className="absolute -bottom-1 w-52 h-9 rounded-full border border-cyan-300/60 shadow-[0_0_25px_rgba(34,211,238,0.9)] animate-pulse pointer-events-none" />

              {/* Upward Hologram Emitter Light Beams */}
              <div
                className="absolute inset-x-12 bottom-0 top-8 pointer-events-none opacity-30"
                style={{
                  background: 'linear-gradient(to top, rgba(6,182,212,0.35) 0%, rgba(56,189,248,0.08) 60%, transparent 100%)',
                  clipPath: 'polygon(18% 100%, 82% 100%, 100% 0%, 0% 0%)',
                }}
              />

              {/* The Future Self Pixel Art Hologram (with Outstretched Hand) */}
              <div className="relative z-10 max-h-[48vh] sm:max-h-[54vh] flex items-center justify-center overflow-hidden">
                <img
                  src={hologramFutureSelfImg}
                  alt="Holographic Future Self"
                  className={`max-h-[46vh] sm:max-h-[52vh] w-auto object-contain select-none transition-all duration-[2400ms] ${
                    materialized ? 'opacity-95 scale-100' : 'opacity-0 scale-95'
                  }`}
                  style={{
                    filter:
                      'drop-shadow(0 0 25px rgba(34,211,238,0.75)) drop-shadow(0 0 50px rgba(6,182,212,0.45)) drop-shadow(-2px 0 0 rgba(239,68,68,0.3)) drop-shadow(2px 0 0 rgba(59,130,246,0.3))',
                    maskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
                  }}
                />

                {/* Animated Cyber Scanlines Layer over character */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
                  style={{
                    background:
                      'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(34,211,238,0.25) 3px, rgba(34,211,238,0.25) 5px)',
                  }}
                />

                {/* Digital glitch slice bars shifting across the hologram */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-cyan-300/40 blur-[1px] absolute top-1/4 animate-pulse" />
                  <div className="w-2/3 h-1.5 bg-sky-400/35 blur-[1px] absolute top-1/2 left-4 animate-pulse" />
                  <div className="w-3/4 h-1 bg-cyan-200/50 blur-[1px] absolute top-3/4 right-2 animate-ping" />
                </div>
              </div>
            </div>
          </div>

          {/* Layer 3: JRPG Retro Pixel Dialogue Box (Matching Image Reference) */}
          <div
            className={`relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-5 sm:pb-7 transition-all duration-1000 delay-[1800ms] ${
              firstDialogueReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
            }`}
          >
            <div className="relative w-full rounded-2xl bg-[#090b1e]/95 border-2 border-[#5a67a0] p-4 sm:p-6 shadow-[0_0_40px_rgba(10,15,35,0.95)] backdrop-blur-md">
              {/* Speaker Badge (Top-Left Pill with Arrow matching reference) */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs sm:text-sm font-bold shadow mb-3 border ${
                  isFutureSelf
                    ? 'bg-[#161c38] border-[#6366f1]/80 text-cyan-200 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                    : 'bg-[#2b1c10] border-amber-500/80 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                }`}
              >
                <span className="text-white text-[10px]">▶</span>
                <span>{speakerName}</span>
              </div>

              {/* Subtitle Dialogue Stream */}
              <p className="text-sm sm:text-lg font-mono text-white leading-relaxed tracking-wide min-h-[50px] sm:min-h-[60px] whitespace-pre-wrap">
                {displayedText}
                {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse" />}
              </p>

              {/* Downward Advance Arrow (Matching Reference) */}
              <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 text-white text-xs sm:text-sm animate-bounce opacity-85 select-none font-mono">
                ▼
              </div>

              {/* Progress counter */}
              <div className="absolute top-4 right-5 text-[10px] font-mono text-gray-400 opacity-60">
                {dialogueIdx + 1} / {DIALOGUE_SCRIPT.length}
              </div>
            </div>
          </div>

          {/* Whiteout emergence veil that slowly dissolves over 3.6s to reveal the afterlife hologram */}
          <div
            className={`absolute inset-0 z-50 bg-white pointer-events-none transition-opacity duration-[3600ms] ease-out ${
              materialized ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </div>
      )}

      {/* ================= GLIMPSE OF DESTROYED FUTURE CITY ================= */}
      {phase === 'glimpse' && (
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden animate-fadeIn">
          {/* Ruined City in background */}
          <div
            className="absolute inset-0 bg-cover bg-center filter contrast-125"
            style={{ backgroundImage: `url(${cityBgImg})` }}
          />

          {/* Crimson & Chromatic Glitch Aberration */}
          <div
            className="absolute inset-0 bg-red-600/30 mix-blend-color-burn pointer-events-none"
            style={{ opacity: glitchIntensity * 0.8 }}
          />
          <div
            className="absolute inset-0 bg-cyan-500/20 mix-blend-screen pointer-events-none"
            style={{
              transform: `translate(${(glitchIntensity - 0.5) * 16}px, ${(glitchIntensity - 0.5) * 8}px)`,
            }}
          />

          {/* Ominous Warning Overlay */}
          <div className="relative z-10 p-8 max-w-xl text-center bg-black/85 border-2 border-red-500 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.7)] backdrop-blur">
            <div className="inline-block px-3 py-1 rounded bg-red-600 text-black font-black text-xs uppercase tracking-widest mb-3 animate-pulse">
              [ TIMELINE CORRUPTION DETECTED ]
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-red-400 font-mono tracking-wider uppercase mb-2">
              YEAR 2042: THE FALL
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
              &quot;Autonomous intelligence expanded without human boundaries. Cities collapsed. Power
              networks went dark. The simulation is your only chance to rewrite our fate.&quot;
              <br />
              <strong className="text-yellow-300 font-mono mt-2 block">
                The future depends on the choices you make today.
              </strong>
            </p>
          </div>
        </div>
      )}

      {phase === 'fadeout' && (
        <div
          className="relative z-50 w-full h-full bg-black animate-fadeIn"
          aria-label="Transitioning to final title card"
        />
      )}

      {/* ================= FINAL TITLE SCREEN & CREDITS ================= */}
      {phase === 'title' && (
        <div className="relative w-full h-full flex flex-col justify-between items-center p-4 sm:p-8 bg-gradient-to-b from-[#06040d] via-[#0d091a] to-[#04020a] animate-fadeIn text-center overflow-hidden">
          {/* Peaceful Meadow Silhouette Background with Ambient Blur (No ghosted dialogue box) */}
          <div
            className="absolute inset-0 bg-cover bg-bottom opacity-20 filter blur-sm pointer-events-none"
            style={{ backgroundImage: `url(${peacefulFieldImg})` }}
          />

          {/* Top Title Bar (Removed "THE WAY OUT // EPILOGUE" as requested) */}
          <div className="w-full flex justify-end items-center z-10">
            <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase">
              STORY BY TEAM STRAWHATS
            </span>
          </div>

          {/* Centerpiece: Official THE WAY OUT Logo & Title */}
          <div className="relative z-10 my-auto flex flex-col items-center py-2 sm:py-3 max-w-xl">
            <img
              src={gameLogoImg}
              alt="The Way Out Official Logo"
              className="w-32 sm:w-44 h-auto object-contain drop-shadow-[0_0_40px_rgba(249,115,22,0.45)] rounded-2xl mb-3 sm:mb-4 hover:scale-105 transition-transform"
            />

            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 uppercase drop-shadow-[0_2px_15px_rgba(245,158,11,0.5)]">
              THE WAY OUT
            </h1>

            <div className="my-2 sm:my-3 h-0.5 w-24 sm:w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            <h2 className="text-base sm:text-xl font-mono font-bold tracking-[0.2em] text-cyan-200 uppercase">
              THE END... FOR NOW.
            </h2>

            <div className="mt-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-amber-500/20 border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <span className="text-xs sm:text-sm font-black font-mono tracking-[0.3em] text-amber-300 uppercase animate-pulse">
                TO BE CONTINUED.
              </span>
            </div>

            <p className="max-w-md mx-auto text-xs sm:text-sm text-gray-300 font-sans leading-relaxed mt-4 italic [text-wrap:pretty]">
              &quot;The person you sought to save was who you will become. The battle for ethical AI has only just begun.&quot;
            </p>
          </div>

          {/* Bottom Actions & Credits (With prominent Retry button) */}
          <div className="relative z-10 w-full max-w-md flex flex-col gap-2.5 pb-2">
            <div className="text-[11px] font-mono text-gray-400">
              Made with pride by <strong>team StrawHats</strong>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={onRestart}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:brightness-110 active:scale-95 text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.6)] border border-amber-200 cursor-pointer transition flex items-center justify-center gap-2"
                title="Retry the Journey from Level 1"
              >
                <span className="text-sm">🔄</span>
                <span>Retry</span>
              </button>
              <button
                onClick={onBackToMenu}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs uppercase tracking-wider border border-white/25 cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
                title="Return to Main Menu"
              >
                <span>Main Menu</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
