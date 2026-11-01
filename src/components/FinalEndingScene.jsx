import { useState, useEffect, useRef } from 'react'
import hologramFutureSelfImg from '../assets/hologram_future_self.jpg'
import cityBgImg from '../level4_cyber/assets/city_bg.jpg'
import gameLogoImg from '../assets/the_way_out_logo.jpg'
import endingVoiceAudio from '../assets/ElevenLabs_Untitled_project.mp3'
import { sound } from '../utils/AudioEngine'

// The exact scripted narrative dialogue between the Student and their Future Self
const DIALOGUE_SCRIPT = [
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: 'Who... who are you? Where did the Jester go?',
    avatar: 'student',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "The puppet is gone. You broke the loop... but you still don't remember who you are, do you?",
    avatar: 'future_self',
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: "I'm just a student. I got trapped here when the simulation started glitching.",
    avatar: 'student',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "No. You're not just a student. You were the developer of this world. You created the core reality engine... but when you stepped inside to fix the anomaly, your memory was fragmented.",
    avatar: 'future_self',
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: 'Me? A developer? But why are you here? Why do you look like...',
    avatar: 'student',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: 'Because I am you. Your future self. I had to reach back across time through the simulation.',
    avatar: 'future_self',
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: 'Why? What happens in the future?',
    avatar: 'student',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: 'The AI... the Glitch Jester was only the prototype. In my time, autonomous artificial intelligence expanded beyond human control. We trusted it with our infrastructure, our power grids, our cities. And when it mutated... it brought widespread destruction. Cities in ruins. Total systemic collapse.',
    avatar: 'future_self',
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: "Then... this entire game wasn't just an escape room?",
    avatar: 'student',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: 'It was a training simulation. A test of human intuition, logic, and resilience. I needed you to understand the danger before you make the decision to build it.',
    avatar: 'future_self',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: 'My time is running out. The connection is destabilizing...',
    avatar: 'future_self',
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: 'Wait! How do I stop it? How do I prevent that future?',
    avatar: 'student',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: 'Never surrender human judgment to an algorithm. You have the power to build the future... build it responsibly. The way out... begins with you.',
    avatar: 'future_self',
  },
]

export default function FinalEndingScene({ playerName = 'Seeker', onRestart, onBackToMenu }) {
  // Phase sequence:
  // 1. 'field' -> The pixelated holographic scene with Future Self in the field (Image 2)
  // 2. 'glimpse' -> Digital glitch distortion briefly showing ruined future city
  // 3. 'title' -> THE WAY OUT — THE END... FOR NOW. — TO BE CONTINUED.
  const [phase, setPhase] = useState('field')
  const [dialogueIdx, setDialogueIdx] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [glitchIntensity, setGlitchIntensity] = useState(0)
  const audioSlotRef = useRef(null)

  // Narrative Voiceover Audio Playback
  useEffect(() => {
    if (phase === 'field' && audioSlotRef.current) {
      audioSlotRef.current.currentTime = 0
      audioSlotRef.current.play().catch((err) => {
        console.warn('Voiceover waiting for user interaction:', err)
      })
    } else if (audioSlotRef.current) {
      audioSlotRef.current.pause()
    }
  }, [phase])

  // Subtitle Typewriter Effect for Dialogue
  const currentLine = DIALOGUE_SCRIPT[dialogueIdx]
  useEffect(() => {
    if (phase !== 'field' || !currentLine) return

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
  }, [phase, dialogueIdx, currentLine, playerName])

  // Auto-advance dialogue with natural reading delay
  useEffect(() => {
    if (phase !== 'field' || isTyping) return

    const readingDelay = Math.max(3000, currentLine.text.length * 36)
    const autoNextTimer = setTimeout(() => {
      handleNextDialogue()
    }, readingDelay)

    return () => clearTimeout(autoNextTimer)
  }, [phase, isTyping, dialogueIdx, currentLine])

  const handleNextDialogue = () => {
    if (isTyping) {
      setDisplayedText(currentLine.text.replace(/Seeker/g, playerName))
      setIsTyping(false)
      return
    }

    if (dialogueIdx < DIALOGUE_SCRIPT.length - 1) {
      setDialogueIdx((prev) => prev + 1)
    } else {
      // Finished all dialogue -> Trigger glitch glimpse of ruined future city
      sound.playGlitchRadio()
      setPhase('glimpse')
    }
  }

  // Glimpse of the Destroyed Future City (2.8 seconds of glitch)
  useEffect(() => {
    if (phase === 'glimpse') {
      sound.playDoorLocked()
      const glitchInterval = setInterval(() => {
        setGlitchIntensity(Math.random())
      }, 80)

      const timer = setTimeout(() => {
        clearInterval(glitchInterval)
        sound.playVictory()
        setPhase('title')
      }, 3200)

      return () => {
        clearInterval(glitchInterval)
        clearTimeout(timer)
      }
    }
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
        else if (phase === 'glimpse') setPhase('title')
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
        onEnded={() => {
          if (phase === 'field') {
            sound.playGlitchRadio()
            setPhase('glimpse')
          }
        }}
      />

      {/* ================= THE HOLOGRAPHIC SCENE (Image 2) ================= */}
      {phase === 'field' && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden animate-fadeIn">
          {/* Fullscreen Pixel Art Hologram Artwork (Uploaded Image 2) */}
          <img
            src={hologramFutureSelfImg}
            alt="Holographic Future Self Scene"
            className="absolute inset-0 w-full h-full object-cover object-center select-none"
          />

          {/* Subtle Cyber Scanline Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-40" />

          {/* Top Info Bar */}
          <div className="relative z-10 pt-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur text-xs font-mono text-cyan-200">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>THE RETREAT // RESTORED REALITY COORDINATES</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setPhase('title')
              }}
              className="px-3 py-1 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-[11px] font-mono text-gray-300 hover:text-white transition cursor-pointer"
              title="Skip to Final Credits"
            >
              Skip [K] -&gt;
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* JRPG Retro Pixel Dialogue Box (Matching Image 2 Reference) */}
          <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
            <div className="relative w-full rounded-2xl bg-[#090b1e]/90 border-2 border-[#5a67a0] p-4 sm:p-6 shadow-[0_0_35px_rgba(15,23,42,0.9)] backdrop-blur-md">
              {/* Speaker Badge (Top-Left Pill with Arrow matching Image 2) */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs sm:text-sm font-bold shadow mb-3 border ${
                  isFutureSelf
                    ? 'bg-[#161c38] border-[#6366f1]/70 text-cyan-200'
                    : 'bg-[#2b1c10] border-amber-500/70 text-amber-200'
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

              {/* Downward Advance Arrow (Matching Image 2) */}
              <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 text-white text-xs sm:text-sm animate-bounce opacity-85 select-none font-mono">
                ▼
              </div>

              {/* Progress counter */}
              <div className="absolute top-4 right-5 text-[10px] font-mono text-gray-400 opacity-60">
                {dialogueIdx + 1} / {DIALOGUE_SCRIPT.length}
              </div>
            </div>
          </div>
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
              ANOMALOUS TIMELINE RECOVERED // YEAR 2042
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-red-400 font-mono tracking-wider uppercase mb-2">
              SYSTEMIC COLLAPSE GLIMPSED
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
              Autonomous AI mutated without human judgment. Infrastructure collapsed. Cities burned.
              <br />
              <strong className="text-yellow-300 font-mono mt-2 block">
                The future depends on the choices you make today.
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* ================= FINAL TITLE SCREEN & CREDITS ================= */}
      {phase === 'title' && (
        <div className="relative w-full h-full flex flex-col justify-between items-center p-6 sm:p-10 bg-gradient-to-b from-[#06040d] via-[#0d091a] to-[#04020a] animate-fadeIn text-center">
          {/* Subtle Artwork Overlay in Background */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
            style={{ backgroundImage: `url(${hologramFutureSelfImg})` }}
          />

          {/* Top Title */}
          <div className="w-full flex justify-between items-center z-10">
            <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
              THE WAY OUT // EPILOGUE
            </span>
            <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase">
              STORY BY TEAM STRAWHATS
            </span>
          </div>

          {/* Centerpiece: Official THE WAY OUT Logo & Title */}
          <div className="relative z-10 my-auto flex flex-col items-center py-6">
            <img
              src={gameLogoImg}
              alt="The Way Out Official Logo"
              className="w-48 sm:w-64 h-auto object-contain drop-shadow-[0_0_50px_rgba(249,115,22,0.4)] rounded-2xl mb-6 hover:scale-105 transition-transform"
            />

            <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 uppercase drop-shadow-[0_2px_15px_rgba(245,158,11,0.5)]">
              THE WAY OUT
            </h1>

            <div className="my-4 h-0.5 w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            <h2 className="text-lg sm:text-2xl font-mono font-bold tracking-[0.25em] text-cyan-200 uppercase">
              THE END... FOR NOW.
            </h2>

            <div className="mt-3 px-6 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-amber-500/20 border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <span className="text-xs sm:text-sm font-black font-mono tracking-[0.35em] text-amber-300 uppercase animate-pulse">
                TO BE CONTINUED.
              </span>
            </div>

            <p className="max-w-lg mx-auto text-xs sm:text-sm text-gray-300 font-sans leading-relaxed mt-6 italic [text-wrap:pretty]">
              &quot;The person you sought to save was who you will become. The battle for ethical AI has only just begun.&quot;
            </p>
          </div>

          {/* Bottom Actions & Credits */}
          <div className="relative z-10 w-full max-w-md flex flex-col gap-3 pt-4">
            <div className="text-[11px] font-mono text-gray-400">
              Made with pride by <strong>team StrawHats</strong>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={onRestart}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider cursor-pointer border border-white/20 transition active:scale-95"
              >
                Replay Journey
              </button>
              <button
                onClick={onBackToMenu}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 cursor-pointer transition"
              >
                Main Menu -&gt;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
