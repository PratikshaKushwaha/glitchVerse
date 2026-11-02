import { useState, useEffect, useRef, useMemo } from 'react'
import StudentSprite from './characters/StudentSprite'
import FutureSelfSprite from './characters/FutureSelfSprite'
import endingForestBg from '../assets/ending_forest_bg.png'
import cityBgImg from '../level4_cyber/assets/city_bg.jpg'
import gameLogoImg from '../assets/the_way_out_logo.jpg'
import endingVoiceAudio from '../assets/finalscene-audio.mp3'
import { sound } from '../utils/AudioEngine'

// The exact agreed ending dialogue script between Student and Future Self
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
  // Scene Phase lifecycle:
  // 1. 'emergence' -> White/cyan light from collapsed boss puppet dissolves into peaceful night field
  // 2. 'field' -> Interactive 3D scene & dialogue sequence
  // 3. 'hologram_fade' -> Future Self flickers and dissolves into ascending blue voxels
  // 4. 'glimpse' -> Digital glitch distortion revealing ruined future city
  // 5. 'fadeout' -> Cinematic blackout transition
  // 6. 'title' -> Final title card: THE WAY OUT / THE END... FOR NOW / TO BE CONTINUED
  const [phase, setPhase] = useState('emergence')
  const [dialogueIdx, setDialogueIdx] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [glitchIntensity, setGlitchIntensity] = useState(0)
  const [glitchFlicker, setGlitchFlicker] = useState(false)
  const [audioTime, setAudioTime] = useState(0)

  const audioSlotRef = useRef(null)
  const typewriterTimerRef = useRef(null)

  // Current active dialogue line
  const currentLine = DIALOGUE_SCRIPT[dialogueIdx]
  const isFutureSelf = currentLine?.avatar === 'future_self'
  const speakerName = currentLine?.speaker === 'STUDENT' ? (playerName || 'Student') : 'Future Self'
  const fullSentence = useMemo(() => {
    if (!currentLine) return ''
    return currentLine.text.replace(/Seeker/g, playerName || 'Student')
  }, [currentLine, playerName])

  // Dynamic Character Expressions mapped to the narrative script
  const studentExpression = useMemo(() => {
    switch (dialogueIdx) {
      case 0: return 'curious'
      case 1:
      case 2: return 'confused'
      case 3:
      case 4: return 'shocked'
      case 5:
      case 6: return 'worried'
      case 7:
      case 8: return 'worried'
      case 9:
      case 10:
      case 11: return 'concerned'
      default: return 'neutral'
    }
  }, [dialogueIdx])

  const futureSelfExpression = useMemo(() => {
    switch (dialogueIdx) {
      case 0: return 'serious'
      case 1: return 'knowing'
      case 2: return 'serious'
      case 3: return 'determined'
      case 4: return 'grave'
      case 5: return 'determined'
      case 6:
      case 7: return 'grave'
      case 8:
      case 9: return 'urgent'
      case 10:
      case 11: return 'hopeful'
      default: return 'serious'
    }
  }, [dialogueIdx])

  // 1. Natural emergence from whiteout / blue boss radiance into peaceful grassy field
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('field')
    }, 1800)
    return () => clearTimeout(t)
  }, [])

  // 2. Audio Voiceover Playback & Synchronisation
  useEffect(() => {
    if (phase !== 'field' && phase !== 'emergence') {
      if (audioSlotRef.current) audioSlotRef.current.pause()
      return
    }

    const audio = audioSlotRef.current
    if (!audio) return

    const playTimer = setTimeout(() => {
      audio.currentTime = currentLine?.time || 0
      audio.play().catch((err) => {
        console.warn('Audio waiting for user gesture:', err)
      })
    }, 900)

    return () => clearTimeout(playTimer)
  }, [phase])

  // Synchronise audio timeline with dialogue progression
  useEffect(() => {
    if (phase !== 'field') return
    const nextIdx = DIALOGUE_SCRIPT.reduce((acc, line, idx) => {
      return audioTime >= line.time ? idx : acc
    }, 0)

    if (nextIdx !== dialogueIdx) {
      setDialogueIdx(nextIdx)
    }
  }, [audioTime, phase, dialogueIdx])

  // 4. Smooth Typewriter Text Animation for Active Dialogue
  useEffect(() => {
    if (phase !== 'field' || !fullSentence) return

    setIsTyping(true)
    setDisplayedText('')
    if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current)

    let charIdx = 0
    typewriterTimerRef.current = setInterval(() => {
      charIdx += 2
      if (charIdx >= fullSentence.length) {
        setDisplayedText(fullSentence)
        setIsTyping(false)
        clearInterval(typewriterTimerRef.current)
      } else {
        setDisplayedText(fullSentence.slice(0, charIdx))
        if (charIdx % 6 === 0) {
          sound.playTypewriter()
        }
      }
    }, 22)

    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current)
    }
  }, [dialogueIdx, fullSentence, phase])

  // Random micro-glitch flicker for Future Self's holographic manifestation
  useEffect(() => {
    if (phase !== 'field') return
    const interval = setInterval(() => {
      if (Math.random() < 0.35) {
        setGlitchFlicker(true)
        setTimeout(() => setGlitchFlicker(false), 80 + Math.random() * 120)
      }
    }, 2200)
    return () => clearInterval(interval)
  }, [phase])

  // 5. Interactive Advance Handler (Mouse Click, Space, or Enter)
  // Rule: If text is still typing, the first interaction completes sentence immediately.
  // Next interaction advances to the next dialogue.
  const handleDialogueAdvance = () => {
    if (phase !== 'field') return

    // If still typing -> immediately complete sentence
    if (isTyping) {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current)
      setDisplayedText(fullSentence)
      setIsTyping(false)
      return
    }

    // Advance to next dialogue or trigger ending transition
    if (dialogueIdx < DIALOGUE_SCRIPT.length - 1) {
      const nextIdx = dialogueIdx + 1
      setDialogueIdx(nextIdx)
      if (audioSlotRef.current) {
        audioSlotRef.current.currentTime = DIALOGUE_SCRIPT[nextIdx].time
        if (audioSlotRef.current.paused) {
          audioSlotRef.current.play().catch(() => {})
        }
      }
    } else {
      // Completed all dialogue lines -> initiate Future Self hologram flicker & dissolution
      startEndingTransition()
    }
  }

  // 6. Ending Transition Sequence:
  // Hologram flickers and dissolves -> Ruined city glimpse -> Fadeout -> Title card
  const startEndingTransition = () => {
    sound.playGlitchRadio()
    setPhase('hologram_fade')

    setTimeout(() => {
      sound.playDoorLocked()
      setPhase('glimpse')

      const glitchInt = setInterval(() => {
        setGlitchIntensity(Math.random())
      }, 75)

      setTimeout(() => {
        clearInterval(glitchInt)
        sound.playVictory()
        setPhase('fadeout')

        setTimeout(() => {
          setPhase('title')
        }, 2000)
      }, 4800)
    }, 2400)
  }

  // Global Keyboard Navigation (Space / Enter / K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        if (phase === 'field') {
          handleDialogueAdvance()
        } else if (phase === 'glimpse') {
          setPhase('fadeout')
          setTimeout(() => setPhase('title'), 1200)
        }
      } else if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        setPhase('title')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, isTyping, fullSentence, dialogueIdx])

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none font-mono text-white bg-[#030611] flex flex-col justify-between"
      onClick={() => {
        if (phase === 'field') handleDialogueAdvance()
      }}
    >
      {/* Background Voiceover Audio */}
      <audio
        ref={audioSlotRef}
        src={endingVoiceAudio}
        preload="auto"
        onTimeUpdate={(e) => setAudioTime(e.currentTarget.currentTime)}
        onEnded={() => {
          if (phase === 'field') {
            startEndingTransition()
          }
        }}
      />

      {/* ========================================================================= */}
      {/* 3D PEACEFUL FIELD & HOLOGRAPHIC FUTURE SELF (PHASE: EMERGENCE / FIELD / FADE) */}
      {/* ========================================================================= */}
      {(phase === 'emergence' || phase === 'field' || phase === 'hologram_fade') && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
          
          {/* Layer 1: Painted Atmospheric Night Forest Background */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat select-none pointer-events-none z-0"
            style={{
              backgroundImage: `url(${endingForestBg})`,
              backgroundPosition: 'center 45%',
            }}
          />
          {/* Soft Atmospheric Vignette for Cinematic Contrast & UI Legibility */}
          <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35" />

          {/* Layer 2: Top Navigation Header (Matching Reference Image) */}
          <header className="relative z-30 pt-4 sm:pt-6 px-4 sm:px-8 flex items-center justify-between pointer-events-auto">
            {/* Top-Left: SKIP >> Button (Matching reference) */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setPhase('title')
              }}
              className="px-3.5 py-1 rounded bg-black/40 hover:bg-black/70 border border-white/20 text-xs sm:text-sm font-sans font-bold text-gray-300 hover:text-white transition tracking-wider flex items-center gap-1.5 cursor-pointer backdrop-blur shadow"
              title="Skip to Ending Title Card"
            >
              <span>SKIP</span>
              <span className="text-cyan-400 font-mono">»</span>
            </button>

            {/* Top-Right: LOG Button & Keyboard Hint */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowLog(!showLog)
                }}
                className={`px-3 py-1 rounded text-xs sm:text-sm font-sans font-bold tracking-wider transition cursor-pointer border backdrop-blur shadow flex items-center gap-1.5 ${
                  showLog
                    ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                    : 'bg-black/40 hover:bg-black/70 text-gray-300 hover:text-white border-white/20'
                }`}
                title="Toggle Dialogue History Log"
              >
                <span>LOG</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPhase('title')
                }}
                className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold transition cursor-pointer"
                title="Skip with [K]"
              >
                <span>Skip [K] ➔</span>
              </button>
            </div>
          </header>

          {/* Layer 4: Interactive Character Staging Area (Homescapes Active Speaker Presentation) */}
          <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto flex items-end justify-between px-4 sm:px-12 pb-2 pointer-events-none select-none max-h-[66vh]">
            
            {/* --- LEFT: The Student (Present Self / Callsign Seeker) --- */}
            <div
              className={`relative flex flex-col items-center justify-end transition-all duration-700 ease-out max-w-[46%] sm:max-w-[42%] ${
                !isFutureSelf
                  ? 'scale-105 sm:scale-110 translate-y-0 opacity-100 z-20 filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] brightness-100'
                  : 'scale-90 sm:scale-95 translate-y-3 sm:translate-y-4 opacity-40 z-10 filter brightness-[0.08] contrast-125 drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]'
              }`}
            >
              {/* Pixel Art Character Sprite */}
              <StudentSprite
                expression={studentExpression}
                isSpeaking={!isFutureSelf}
                className="w-full h-auto max-h-[46vh] sm:max-h-[52vh]"
              />
            </div>

            {/* --- RIGHT: The Future Self (Holographic Lead Developer with Blue Glow) --- */}
            <div
              className={`relative flex flex-col items-center justify-end transition-all duration-700 ease-out max-w-[50%] sm:max-w-[45%] ${
                phase === 'hologram_fade'
                  ? 'opacity-0 scale-95 blur-sm transition-all duration-[2400ms]'
                  : isFutureSelf
                  ? 'scale-105 sm:scale-110 translate-y-0 opacity-100 z-20 filter brightness-110 drop-shadow-[0_0_35px_rgba(56,189,248,0.95)] drop-shadow-[0_0_65px_rgba(14,165,233,0.7)]'
                  : 'scale-90 sm:scale-95 translate-y-3 sm:translate-y-4 opacity-40 z-10 filter brightness-[0.08] contrast-125 drop-shadow-[0_0_15px_rgba(2,132,199,0.35)]'
              }`}
            >
              {/* Pixel Art Holographic Future Self Sprite */}
              <div
                className={`relative w-full flex items-end justify-center transition-transform ${
                  glitchFlicker ? 'translate-x-1.5 filter hue-rotate-90' : 'translate-x-0'
                }`}
              >
                <FutureSelfSprite
                  expression={futureSelfExpression}
                  isSpeaking={isFutureSelf}
                  isDissolving={phase === 'hologram_fade'}
                  className="w-full h-auto max-h-[46vh] sm:max-h-[52vh]"
                />
              </div>
            </div>
          </div>

          {/* Layer 5: INTERACTIVE HOMESCAPES-STYLE DIALOGUE INTERFACE */}
          <div className="relative z-30 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6 pointer-events-auto">
            <div className="relative w-full flex items-end gap-3 sm:gap-4">
              
              {/* Speaker Character Portrait (Left Box with Glossy Cyan Frame) */}
              <div className="relative flex-shrink-0 w-20 h-20 sm:w-26 sm:h-26 rounded-2xl border-4 border-[#38bdf8] bg-gradient-to-b from-[#1b3152] via-[#0d1e38] to-[#081120] shadow-[0_0_25px_rgba(56,189,248,0.65)] overflow-hidden transition-all duration-300 flex items-center justify-center">
                {isFutureSelf ? (
                  <FutureSelfSprite
                    isAvatar={true}
                    expression={futureSelfExpression}
                    isSpeaking={true}
                    className="w-full h-full"
                  />
                ) : (
                  <StudentSprite
                    isAvatar={true}
                    expression={studentExpression}
                    isSpeaking={true}
                    className="w-full h-full"
                  />
                )}
              </div>

              {/* Large Rounded Speech Bubble (Warm Cream Tone with Speech Tail) */}
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleDialogueAdvance()
                }}
                className="relative flex-1 bg-[#fffbf2] text-[#2c1d11] border-2 border-[#eedbb9] rounded-3xl p-4 sm:p-5 shadow-[0_14px_45px_rgba(0,0,0,0.6)] cursor-pointer transition active:scale-[0.99] min-h-[96px] sm:min-h-[112px] flex flex-col justify-between"
              >
                {/* Speech Bubble Tail Pointing towards Left Avatar */}
                <div
                  className="absolute -left-3 bottom-6 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-r-[13px] border-r-[#fffbf2]"
                />

                {/* Speaker Name Pill (Cyan Capsule Badge with Decorative Tape Accent) */}
                <div className="absolute -top-3.5 left-6 inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#38bdf8] text-white font-sans font-black text-xs sm:text-sm tracking-wide shadow-[0_3px_12px_rgba(56,189,248,0.6)] border border-white/70">
                  <span className="absolute -left-2 -top-1 w-5 h-2.5 bg-amber-100/75 border border-amber-300/60 rotate-[-12deg] rounded-xs pointer-events-none shadow-xs" />
                  <span className="text-[10px]">▶</span>
                  <span>{speakerName}</span>
                </div>

                {/* Dialogue Subtitle Text (Smooth Typewriter Effect) */}
                <div className="pt-2 sm:pt-1">
                  <p className="text-sm sm:text-base md:text-lg font-sans font-bold text-[#2d1a0c] leading-relaxed tracking-normal select-none">
                    {displayedText}
                    {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-[#38bdf8] animate-pulse align-middle" />}
                  </p>
                </div>

                {/* Progression Indicator: Sparkling Star in Bottom-Right when Typing Finishes */}
                <div className="w-full flex items-center justify-between pt-2">
                  <span className="text-[10px] font-mono text-[#8b6e4e]/70">
                    {dialogueIdx + 1} / {DIALOGUE_SCRIPT.length}
                  </span>

                  {!isTyping && (
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs sm:text-sm animate-pulse select-none">
                      <span>Click to continue</span>
                      <span className="text-base text-amber-400">✦</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergence Veil: White/Cyan Radiance that dissolves over 1.8s */}
          <div
            className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-[1800ms] ease-out ${
              phase === 'emergence' ? 'opacity-100 bg-white' : 'opacity-0'
            }`}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIALOGUE HISTORY LOG DRAWER (MODAL OVERLAY) */}
      {/* ========================================================================= */}
      {showLog && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation()
            setShowLog(false)
          }}
        >
          <div
            className="w-full max-w-2xl max-h-[75vh] bg-[#0c1424] border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.5)] p-5 flex flex-col justify-between overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <h3 className="font-mono font-black text-sm tracking-widest text-cyan-300 uppercase">
                // TRANSMISSION LOG: 2042 RESTORATION
              </h3>
              <button
                onClick={() => setShowLog(false)}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 font-sans text-xs sm:text-sm pr-2">
              {DIALOGUE_SCRIPT.slice(0, dialogueIdx + 1).map((line, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border ${
                    line.avatar === 'future_self'
                      ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-100'
                      : 'bg-amber-950/30 border-amber-500/30 text-amber-100'
                  }`}
                >
                  <span className="font-bold text-xs uppercase tracking-wider block mb-1">
                    {line.speaker === 'STUDENT' ? (playerName || 'Student') : 'Future Self'}
                  </span>
                  <p className="leading-relaxed">{line.text.replace(/Seeker/g, playerName || 'Student')}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center text-[10px] text-gray-400 font-mono">
              Click anywhere outside to resume dialogue
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GLIMPSE OF THE DESTROYED FUTURE CITY (YEAR 2042: THE FALL) */}
      {/* ========================================================================= */}
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
          <div className="relative z-10 p-6 sm:p-8 max-w-xl text-center bg-black/85 border-2 border-red-500 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.7)] backdrop-blur">
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

      {/* ========================================================================= */}
      {/* CINEMATIC BLACKOUT PAUSE */}
      {/* ========================================================================= */}
      {phase === 'fadeout' && (
        <div
          className="relative z-50 w-full h-full bg-black animate-fadeIn"
          aria-label="Transitioning to final title card"
        />
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL FINAL TITLE SCREEN & EPILOGUE CARD */}
      {/* ========================================================================= */}
      {phase === 'title' && (
        <div className="relative w-full h-full flex flex-col justify-between items-center p-4 sm:p-8 bg-gradient-to-b from-[#06040d] via-[#0d091a] to-[#04020a] animate-fadeIn text-center overflow-hidden">
          {/* Top Title Bar */}
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

          {/* Bottom Actions & Credits (With Clean Vector Icon, No Emojis) */}
          <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-3 pb-3">
            <div className="text-[11px] font-mono tracking-widest text-gray-400 uppercase">
              Made with pride by <span className="text-amber-300 font-bold">team StrawHats</span>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={onRestart}
                className="flex-1 py-3 px-5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:brightness-110 active:scale-95 text-black font-mono font-black text-xs uppercase tracking-[0.18em] shadow-[0_0_25px_rgba(245,158,11,0.55)] border border-amber-200/90 cursor-pointer transition flex items-center justify-center gap-2"
                title="Retry the Journey from Level 1"
              >
                <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M21 21v-5h-5" />
                </svg>
                <span>Retry</span>
              </button>
              <button
                onClick={onBackToMenu}
                className="flex-1 py-3 px-5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 font-mono font-bold text-xs uppercase tracking-[0.18em] border border-cyan-500/40 hover:border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
                title="Return to Main Menu"
              >
                <span>Main Menu</span>
                <span className="text-sm">➔</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
