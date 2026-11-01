import { useState, useEffect, useRef } from 'react'
import peacefulFieldImg from '../assets/ending_peaceful_field.png'
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
    color: 'text-amber-300',
    borderColor: 'border-amber-400/50',
    avatar: 'student',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "The puppet is gone. You broke the loop... but you still don't remember who you are, do you?",
    color: 'text-cyan-300',
    borderColor: 'border-cyan-400/60',
    avatar: 'future_self',
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: "I'm just a student. I got trapped here when the simulation started glitching.",
    color: 'text-amber-300',
    borderColor: 'border-amber-400/50',
    avatar: 'student',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "No. You're not just a student. You were the developer of this world. You created the core reality engine... but when you stepped inside to fix the anomaly, your memory was fragmented.",
    color: 'text-cyan-300',
    borderColor: 'border-cyan-400/60',
    avatar: 'future_self',
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: 'Me? A developer? But why are you here? Why do you look like...',
    color: 'text-amber-300',
    borderColor: 'border-amber-400/50',
    avatar: 'student',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: 'Because I am you. Your future self. I had to reach back across time through the simulation.',
    color: 'text-cyan-300',
    borderColor: 'border-cyan-400/60',
    avatar: 'future_self',
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: 'Why? What happens in the future?',
    color: 'text-amber-300',
    borderColor: 'border-amber-400/50',
    avatar: 'student',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: 'The AI... the Glitch Jester was only the prototype. In my time, autonomous artificial intelligence expanded beyond human control. We trusted it with our infrastructure, our power grids, our cities. And when it mutated... it brought widespread destruction. Cities in ruins. Total systemic collapse.',
    color: 'text-cyan-300',
    borderColor: 'border-cyan-400/60',
    avatar: 'future_self',
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: "Then... this entire game wasn't just an escape room?",
    color: 'text-amber-300',
    borderColor: 'border-amber-400/50',
    avatar: 'student',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: 'It was a training simulation. A test of human intuition, logic, and resilience. I needed you to understand the danger before you make the decision to build it.',
    color: 'text-cyan-300',
    borderColor: 'border-cyan-400/60',
    avatar: 'future_self',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: 'My time is running out. The connection is destabilizing...',
    color: 'text-rose-400',
    borderColor: 'border-rose-400/60',
    avatar: 'future_self',
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: 'Wait! How do I stop it? How do I prevent that future?',
    color: 'text-amber-300',
    borderColor: 'border-amber-400/50',
    avatar: 'student',
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: 'Never surrender human judgment to an algorithm. You have the power to build the future... build it responsibly. The way out... begins with you.',
    color: 'text-emerald-300 font-bold',
    borderColor: 'border-emerald-400/70',
    avatar: 'future_self',
  },
]

export default function FinalEndingScene({ playerName = 'Seeker', onRestart, onBackToMenu }) {
  // Phase sequence:
  // 1. 'collapse' -> Puppet collapses and hologram reveals in Nexus
  // 2. 'field' -> Transition to peaceful grassy field & dialog between student & future self
  // 3. 'glimpse' -> Digital glitch distortion briefly showing ruined future city
  // 4. 'title' -> THE WAY OUT — THE END... FOR NOW. — TO BE CONTINUED.
  const [phase, setPhase] = useState('collapse')
  const [dialogueIdx, setDialogueIdx] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [glitchIntensity, setGlitchIntensity] = useState(0)
  const audioSlotRef = useRef(null)

  // Phase 1: Puppet collapse & Hologram reveal timer
  useEffect(() => {
    if (phase === 'collapse') {
      sound.playDoorUnlock()
      const t1 = setTimeout(() => {
        sound.playGlitchRadio()
      }, 1500)
      const t2 = setTimeout(() => {
        setPhase('field')
      }, 4500)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
  }, [phase])

  // Phase 2: Narrative Voiceover Audio Playback
  useEffect(() => {
    if (phase === 'field' && audioSlotRef.current) {
      audioSlotRef.current.currentTime = 0
      audioSlotRef.current.play().catch((err) => {
        console.warn('Ending audio playback waiting for interaction:', err)
      })
    } else if (audioSlotRef.current) {
      audioSlotRef.current.pause()
    }
  }, [phase])

  // Subtitle Typewriter Effect for Dialogue in Phase 2
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

  // Auto-advance dialogue with natural reading pause
  useEffect(() => {
    if (phase !== 'field' || isTyping) return

    // Reading time scales with text length
    const readingDelay = Math.max(2800, currentLine.text.length * 36)
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
      // Finished all dialogue! Trigger glimpse of ruined future city
      sound.playGlitchRadio()
      setPhase('glimpse')
    }
  }

  // Phase 3: Glimpse of the Destroyed Future City (2.8 seconds of glitch)
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
      }, 3400)

      return () => {
        clearInterval(glitchInterval)
        clearTimeout(timer)
      }
    }
  }, [phase])

  // Keyboard shortcut: Space / Enter / K / Click advances or skips
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (audioSlotRef.current && audioSlotRef.current.paused && phase === 'field') {
        audioSlotRef.current.play().catch(() => {})
      }
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        if (phase === 'field') handleNextDialogue()
        else if (phase === 'collapse') setPhase('field')
        else if (phase === 'glimpse') setPhase('title')
      } else if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        setPhase('title')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, isTyping, dialogueIdx])

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none font-mono text-white bg-black flex flex-col justify-between"
      onClick={() => {
        if (audioSlotRef.current && audioSlotRef.current.paused && phase === 'field') {
          audioSlotRef.current.play().catch(() => {})
        }
        if (phase === 'field') handleNextDialogue()
        else if (phase === 'collapse') setPhase('field')
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

      {/* ================= PHASE 1: PUPPET COLLAPSE & HOLOGRAM EMERGENCE ================= */}
      {phase === 'collapse' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#090514] via-[#120826] to-[#04020a] animate-fadeIn">
          {/* Shattered digital cyber floor grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf820_1px,transparent_1px),linear-gradient(to_bottom,#38bdf820_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] opacity-40 pointer-events-none" />

          {/* Falling / Shattered Puppet Strings */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Severed Holographic Tethers */}
            <div className="flex gap-16 mb-4 animate-pulse opacity-70">
              <div className="w-0.5 h-24 bg-gradient-to-b from-cyan-400 via-rose-500 to-transparent" />
              <div className="w-0.5 h-20 bg-gradient-to-b from-cyan-400 via-yellow-400 to-transparent" />
              <div className="w-0.5 h-28 bg-gradient-to-b from-cyan-400 via-rose-500 to-transparent" />
            </div>

            {/* Collapsed Puppet Frame */}
            <div className="relative flex flex-col items-center">
              <div className="w-20 h-10 rounded-full bg-cyan-950/80 border-2 border-cyan-400/40 blur-sm scale-150 animate-pulse" />
              <div className="text-gray-400 text-xs tracking-widest font-mono uppercase mt-2">
                [ PUPPET TETHERS SEVERED — CORRUPTION PURGED ]
              </div>
            </div>

            {/* Emerging Holographic Human Figure */}
            <div className="mt-8 flex flex-col items-center animate-bounce">
              <div className="relative h-28 w-28 rounded-full bg-gradient-to-t from-cyan-500/30 via-emerald-400/40 to-transparent p-1 flex items-center justify-center shadow-[0_0_60px_rgba(6,182,212,0.6)] ring-2 ring-cyan-300">
                <svg className="w-16 h-16 fill-cyan-200 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <h2 className="mt-4 text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-200 to-amber-200 tracking-widest uppercase">
                A FIGURE MATERIALIZES...
              </h2>
              <p className="text-xs text-cyan-300/80 font-mono mt-1">
                Reality coordinates shifting to baseline frequency...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= PHASE 2: PEACEFUL GRASSY FIELD UNDER STARRY NIGHT SKY ================= */}
      {phase === 'field' && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden animate-fadeIn">
          {/* Panoramic Background: Grassy Field with Starry Sky & Fireflies (Uploaded Image 2) */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-[1.02]"
            style={{ backgroundImage: `url(${peacefulFieldImg})` }}
          />

          {/* Gentle Night Atmosphere & Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

          {/* Floating Fireflies (Animated glowing particles) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { left: '15%', top: '65%', delay: '0s', size: 'w-2 h-2' },
              { left: '28%', top: '75%', delay: '1.2s', size: 'w-2.5 h-2.5' },
              { left: '42%', top: '60%', delay: '0.6s', size: 'w-1.5 h-1.5' },
              { left: '60%', top: '70%', delay: '1.8s', size: 'w-2 h-2' },
              { left: '78%', top: '62%', delay: '0.3s', size: 'w-3 h-3' },
              { left: '88%', top: '78%', delay: '2.1s', size: 'w-2 h-2' },
              { left: '50%', top: '82%', delay: '1.5s', size: 'w-1.5 h-1.5' },
            ].map((f, i) => (
              <div
                key={i}
                className={`absolute ${f.size} rounded-full bg-yellow-300 shadow-[0_0_12px_#fde047] animate-pulse`}
                style={{
                  left: f.left,
                  top: f.top,
                  animationDelay: f.delay,
                  animationDuration: '3s',
                }}
              />
            ))}
          </div>

          {/* Top Location Banner */}
          <div className="relative z-10 pt-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/20 backdrop-blur text-xs font-mono text-cyan-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
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

          {/* 2D Visual Scene: Student and Future Self Silhouettes on the Field */}
          <div className="relative z-10 flex-1 flex items-end justify-between px-8 sm:px-24 pb-8 pointer-events-none">
            {/* Left: The Student (Player) */}
            <div
              className={`flex flex-col items-center transition-all duration-500 ${
                currentLine.avatar === 'student' ? 'scale-105 opacity-100' : 'scale-95 opacity-80'
              }`}
            >
              {/* Student Silhouette / Avatar */}
              <div className="relative flex flex-col items-center">
                {currentLine.avatar === 'student' && (
                  <div className="px-3 py-1 rounded-full bg-amber-500/30 border border-amber-400 text-amber-200 text-[10px] font-bold tracking-widest uppercase mb-2 animate-bounce">
                    SPEAKING
                  </div>
                )}
                <div className="h-28 w-20 sm:h-36 sm:w-24 rounded-2xl bg-gradient-to-t from-gray-900 via-indigo-950 to-amber-900/60 border-2 border-amber-400/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex flex-col items-center justify-center p-2 backdrop-blur">
                  <div className="h-8 w-8 rounded-full bg-amber-200/90 shadow mb-1" />
                  <div className="h-14 w-12 rounded-lg bg-indigo-900/80 border border-indigo-400/40" />
                </div>
                <div className="text-xs font-black text-amber-300 mt-2 font-mono tracking-wider">
                  {playerName.toUpperCase()}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">Present Student</div>
              </div>
            </div>

            {/* Right: The Future Self (Holographic Developer) */}
            <div
              className={`flex flex-col items-center transition-all duration-500 ${
                currentLine.avatar === 'future_self' ? 'scale-105 opacity-100' : 'scale-95 opacity-80'
              }`}
            >
              {/* Future Self Hologram Silhouette */}
              <div className="relative flex flex-col items-center">
                {currentLine.avatar === 'future_self' && (
                  <div className="px-3 py-1 rounded-full bg-cyan-500/30 border border-cyan-400 text-cyan-200 text-[10px] font-bold tracking-widest uppercase mb-2 animate-bounce">
                    TRANSMITTING
                  </div>
                )}
                <div className="h-28 w-20 sm:h-36 sm:w-24 rounded-2xl bg-gradient-to-t from-cyan-950 via-teal-900 to-cyan-500/40 border-2 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.5)] flex flex-col items-center justify-center p-2 backdrop-blur animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-cyan-300/90 shadow-[0_0_10px_#22d3ee] mb-1" />
                  <div className="h-14 w-12 rounded-lg bg-cyan-900/80 border border-cyan-300/60" />
                </div>
                <div className="text-xs font-black text-cyan-300 mt-2 font-mono tracking-wider">
                  FUTURE SELF
                </div>
                <div className="text-[10px] text-cyan-400/80 font-mono">Lead Developer (2042)</div>
              </div>
            </div>
          </div>

          {/* Bottom Subtitle / Dialogue Box */}
          <div className="relative z-20 w-full max-w-4xl mx-auto p-4 sm:p-6 pb-6">
            <div
              className={`w-full rounded-2xl bg-[#070d18]/90 border-2 ${currentLine.borderColor} p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur transition-all duration-300`}
            >
              {/* Header Bar: Speaker & Progress */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      currentLine.avatar === 'student' ? 'bg-amber-400' : 'bg-cyan-400'
                    } animate-ping`}
                  />
                  <span className={`text-xs sm:text-sm font-black tracking-widest uppercase ${currentLine.color}`}>
                    {currentLine.speaker === 'STUDENT' ? playerName.toUpperCase() : currentLine.speaker}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                    • {currentLine.tag}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-gray-400">
                  {dialogueIdx + 1} / {DIALOGUE_SCRIPT.length}
                </div>
              </div>

              {/* Typewriter Subtitle Text */}
              <p className="min-h-[60px] sm:min-h-[72px] text-sm sm:text-base text-gray-100 font-sans leading-relaxed tracking-wide">
                {displayedText}
                {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />}
              </p>

              {/* Tap to continue indicator */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono text-gray-400">
                <span className="text-cyan-400/80">Press Space or Tap Screen to Advance</span>
                <span className="text-gray-500">Auto-advancing on voice...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PHASE 3: DIGITAL GLITCH & GLIMPSE OF RUINED FUTURE CITY ================= */}
      {phase === 'glimpse' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-black animate-fadeIn">
          {/* Apocalyptic Ruined City Skyline Image with Corrupted Glitch Filters */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${cityBgImg})`,
              filter: `hue-rotate(320deg) contrast(1.8) brightness(${0.5 + glitchIntensity * 0.7})`,
              transform: `scale(${1.05 + glitchIntensity * 0.05}) translate(${(glitchIntensity - 0.5) * 14}px, ${(glitchIntensity - 0.5) * 8}px)`,
            }}
          />

          {/* Intense Glitch Scanlines & Crimson Alarms */}
          <div className="absolute inset-0 bg-gradient-to-t from-red-950/80 via-transparent to-red-900/60 pointer-events-none mix-blend-color-dodge" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.6),rgba(0,0,0,0.6)_2px,transparent_2px,transparent_4px)] pointer-events-none" />

          {/* Glitch Static Warning Text */}
          <div className="relative z-10 text-center px-4 space-y-3">
            <div className="inline-block px-4 py-1.5 rounded bg-red-600/90 text-black font-black text-xs tracking-[0.4em] uppercase animate-pulse">
              [ TIMELINE CORRUPTION DETECTED ]
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-mono text-red-100 tracking-wider drop-shadow-[0_0_20px_#ef4444]">
              YEAR 2042: THE FALL
            </h1>
            <p className="max-w-xl mx-auto text-xs sm:text-sm text-red-200/90 font-mono leading-relaxed bg-black/70 p-4 rounded-xl border border-red-500/50 backdrop-blur">
              &quot;Autonomous intelligence expanded without human boundaries. Cities collapsed. Power networks went dark. The simulation is your only chance to rewrite our fate.&quot;
            </p>
          </div>
        </div>
      )}

      {/* ================= PHASE 4: FINAL TITLE SCREEN & TO BE CONTINUED ================= */}
      {phase === 'title' && (
        <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-[#06040e] via-[#0c091d] to-[#04020a] text-center overflow-y-auto animate-fadeIn">
          {/* Subtle Starry Night Field Overlay in Background */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
            style={{ backgroundImage: `url(${peacefulFieldImg})` }}
          />

          {/* Top Filler */}
          <div className="w-full flex justify-between items-center z-10">
            <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
              PS01 GLITCHVERSE // EPILOGUE
            </span>
            <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase">
              STORY BY TEAM STRAWHATS
            </span>
          </div>

          {/* Centerpiece: Official THE WAY OUT Logo & Title */}
          <div className="relative z-10 my-auto flex flex-col items-center py-6">
            {/* The Official Uploaded Logo Sticker */}
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
              Made with pride by <strong>team StrawHats</strong> for PS01 GlitchVerse
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
