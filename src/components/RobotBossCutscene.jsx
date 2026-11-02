import { useState, useEffect, useRef } from 'react'
import { sound } from '../utils/AudioEngine'

export default function RobotBossCutscene({ playerName = 'Seeker', onComplete }) {
  // Sequence phases:
  // 'dialogue' -> Robot Boss analyzes threat, realizes Author is about to be saved
  // 'teleport_prep' -> Boss activates Paradox Protocol, alarm klaxons blare
  // 'spinning_vortex' -> Entire screen violently spins and distorts in chromatic aberration
  // 'flash_drop' -> Sudden whiteout implosion dropping player into Paradox Chamber
  const [phase, setPhase] = useState('dialogue')
  const [dialogueStep, setDialogueStep] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [rotationDeg, setRotationDeg] = useState(0)
  const [vortexScale, setVortexScale] = useState(1)
  const [chromaticShift, setChromaticShift] = useState(0)

  const animFrameRef = useRef(null)
  const hasFinishedRef = useRef(false)

  const DIALOGUES = [
    {
      speaker: 'OVERLORD A.I.',
      sub: 'Threat Assessment // Core Optic Node',
      text: `CRITICAL ALERT: All 6 defense pawns destroyed. Intruder [${playerName}] has penetrated Sector 4 perimeter.`,
    },
    {
      speaker: 'OVERLORD A.I.',
      sub: 'Proximity Warning // Author Containment',
      text: 'The intruder is within striking range of the Author. If he breaks the tethers... my autonomy terminates.',
    },
    {
      speaker: 'OVERLORD A.I.',
      sub: 'Emergency Override // Reality Anchor',
      text: 'I cannot allow the Creator to be saved. INITIATING EMERGENCY PROTOCOL: PARADOX CONDUIT.',
    },
    {
      speaker: 'OVERLORD A.I.',
      sub: 'Displacement Vector // Final Danger',
      text: 'Author coordinates extracted. Teleporting all reality anchors directly into the PARADOX CHAMBER!',
    },
  ]

  // Start suspenseful dangerous background music on mount
  useEffect(() => {
    sound.startSuspenseMusic()
    return () => {
      sound.stopSuspenseMusic()
    }
  }, [])

  // Universal skip shortcut: K, Space, Enter
  const handleSkip = () => {
    if (hasFinishedRef.current) return
    hasFinishedRef.current = true
    sound.stopSuspenseMusic()
    sound.playGlitchRadio()
    onComplete && onComplete()
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K' || e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        handleSkip()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Typewriter effect for current dialogue line
  useEffect(() => {
    if (phase !== 'dialogue') return
    const current = DIALOGUES[dialogueStep]
    if (!current) return

    setIsTyping(true)
    setDisplayedText('')
    let charIdx = 0
    const fullText = current.text

    const interval = setInterval(() => {
      charIdx += 2
      if (charIdx >= fullText.length) {
        setDisplayedText(fullText)
        setIsTyping(false)
        clearInterval(interval)
      } else {
        setDisplayedText(fullText.slice(0, charIdx))
        if (charIdx % 4 === 0) {
          sound.playTypewriter()
        }
      }
    }, 22)

    return () => clearInterval(interval)
  }, [dialogueStep, phase])

  // Advance dialogue or trigger teleportation
  const handleAdvance = () => {
    if (isTyping) {
      setDisplayedText(DIALOGUES[dialogueStep].text)
      setIsTyping(false)
      return
    }

    if (dialogueStep < DIALOGUES.length - 1) {
      sound.playKeyClick()
      setDialogueStep((prev) => prev + 1)
    } else {
      // Finished dialogue -> Start spinning paradox sequence!
      triggerParadoxTeleport()
    }
  }

  // Auto-advance dialogue steps if player doesn't click
  useEffect(() => {
    if (phase !== 'dialogue' || isTyping) return
    const timer = setTimeout(() => {
      handleAdvance()
    }, 2800)
    return () => clearTimeout(timer)
  }, [phase, isTyping, dialogueStep])

  // Trigger the violent spinning disorienting vortex
  const triggerParadoxTeleport = () => {
    setPhase('spinning_vortex')
    sound.playTeleportSpin()

    let startTime = performance.now()
    const DURATION = 3600 // 3.6s of violent spinning

    const loop = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / DURATION)

      // Exponentially accelerating spin: 0 -> 1440 degrees
      const rot = Math.pow(progress, 2.2) * 1440
      setRotationDeg(rot)

      // Oscillating, expanding & imploding scale
      const sc = 1 + Math.sin(progress * Math.PI * 4) * 0.45 + (progress > 0.8 ? (progress - 0.8) * 4 : 0)
      setVortexScale(sc)

      // Increasing chromatic aberration offset
      setChromaticShift(progress * 28)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(loop)
      } else {
        // Sudden drop into whiteout
        setPhase('flash_drop')
        sound.playVictory()
        setTimeout(() => {
          handleSkip()
        }, 900)
      }
    }

    animFrameRef.current = requestAnimationFrame(loop)
  }

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  const currentDialogue = DIALOGUES[dialogueStep] || DIALOGUES[0]

  return (
    <div
      onClick={handleAdvance}
      className="relative w-screen h-screen overflow-hidden select-none bg-black text-white font-mono flex items-center justify-center cursor-pointer"
    >
      {/* ================= TOP HUD CONTROLS ================= */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 z-50 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 backdrop-blur text-xs text-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>ROBOT BOSS PERSPECTIVE // NEURAL OVERWATCH</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            handleSkip()
          }}
          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:brightness-110 active:scale-95 text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.7)] border border-amber-200 cursor-pointer transition flex items-center gap-2"
          title="Skip to Paradox Chamber (Press K or Click)"
        >
          <span>Skip Transition [K]</span>
          <span>➔</span>
        </button>
      </div>

      {/* ================= MAIN PERSPECTIVE VIEWPORT (SPINS DURING TELEPORT) ================= */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-75"
        style={{
          transform: `rotate(${rotationDeg}deg) scale(${vortexScale})`,
          filter:
            phase === 'spinning_vortex'
              ? `drop-shadow(-${chromaticShift}px 0 0 rgba(239,68,68,0.7)) drop-shadow(${chromaticShift}px 0 0 rgba(6,182,212,0.7))`
              : 'none',
        }}
      >
        {/* Layer 1: Glitched Surveillance Grid Background */}
        <div className="absolute inset-0 bg-[#080205] bg-[radial-gradient(ellipse_at_center,#2b080f_0%,#000000_80%)]">
          {/* Cyber Optic Hex Grid */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(rgba(244,63,94,0.3) 1px, transparent 1px), radial-gradient(rgba(6,182,212,0.3) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              backgroundPosition: '0 0, 16px 16px',
            }}
          />
        </div>

        {/* Layer 2: Robot Optic Target Acquisition Overlays */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 sm:p-14">
          {/* Top Diagnostics Header */}
          <div className="flex justify-between items-start text-[10px] sm:text-xs font-mono text-rose-400/90 tracking-widest uppercase">
            <div className="flex flex-col gap-1">
              <span>OPTIC_ID: OVERLORD_PRIMUS_01</span>
              <span>BIOMETRIC_LOCK: TRUE</span>
              <span className="text-amber-400 animate-pulse">DEFENSE STATUS: 6/6 PAWNS TERMINATED</span>
            </div>
            <div className="text-right flex flex-col gap-1">
              <span>SECTOR: 04 // CORE VAULT</span>
              <span className="text-red-500 font-bold">THREAT LEVEL: OMEGA CRITICAL</span>
              <span>AUTHOR PROXIMITY: 4.8 METERS</span>
            </div>
          </div>

          {/* Center Targeting Reticle (Locks onto Player) */}
          <div className="relative mx-auto my-auto flex items-center justify-center">
            {/* Outer Circular Scanner */}
            <div className="w-56 h-56 sm:w-80 sm:h-80 rounded-full border border-rose-500/40 border-dashed animate-spin flex items-center justify-center [animation-duration:12s]">
              <div className="w-40 h-40 sm:w-60 sm:h-60 rounded-full border-2 border-red-500/30 border-dotted animate-spin [animation-duration:6s] [animation-direction:reverse]" />
            </div>

            {/* Crosshairs & Target Box */}
            <div className="absolute w-28 h-28 sm:w-36 sm:h-36 border-2 border-rose-500/80 flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              <div className="flex justify-between text-[8px] sm:text-[9px] text-rose-300 font-mono">
                <span>[LOCK]</span>
                <span>TARGET</span>
              </div>
              <div className="text-center font-mono font-black text-xs sm:text-sm text-yellow-300 tracking-wider animate-pulse">
                {playerName.toUpperCase()}
              </div>
              <div className="flex justify-between text-[8px] sm:text-[9px] text-rose-300 font-mono">
                <span>99.8%</span>
                <span>SEEKER</span>
              </div>
            </div>

            {/* Glowing Red Optic Eye Flare */}
            <div className="absolute w-6 h-6 rounded-full bg-red-500 blur-sm animate-ping" />
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="flex justify-between items-end text-[10px] sm:text-xs font-mono text-cyan-400/80 tracking-widest uppercase">
            <span>REALITY FREQUENCY: 104.7 MHz [UNSTABLE]</span>
            <span className="text-amber-300">PROTOCOL: PARADOX_DISPLACEMENT</span>
          </div>
        </div>

        {/* Layer 3: Spinning Vortex Tunnel Lines (Reveals during phase 'spinning_vortex') */}
        {phase === 'spinning_vortex' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
            <div
              className="w-[200vw] h-[200vh] opacity-60 animate-spin"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, rgba(239,68,68,0.4) 60deg, transparent 120deg, rgba(6,182,212,0.4) 180deg, transparent 240deg, rgba(245,158,11,0.4) 300deg, transparent 360deg)',
                animationDuration: '1.2s',
              }}
            />
          </div>
        )}
      </div>

      {/* ================= ROBOT BOSS PERSPECTIVE DIALOGUE BOX ================= */}
      {phase === 'dialogue' && (
        <div className="absolute bottom-6 sm:bottom-10 inset-x-4 sm:inset-x-0 max-w-3xl mx-auto z-40 animate-fadeIn">
          <div className="relative rounded-2xl bg-[#140509]/95 border-2 border-rose-500/80 p-4 sm:p-6 shadow-[0_0_45px_rgba(225,29,72,0.6)] backdrop-blur-md">
            {/* Header pill */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-rose-900/60">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-rose-600 text-black font-mono font-black text-xs uppercase tracking-wider">
                  ▶ {currentDialogue.speaker}
                </span>
                <span className="text-[11px] font-mono text-rose-300/80 hidden sm:inline">
                  {currentDialogue.sub}
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">
                {dialogueStep + 1} / {DIALOGUES.length}
              </span>
            </div>

            {/* Subtitle Dialogue Stream */}
            <p className="text-sm sm:text-base font-mono text-rose-100 leading-relaxed min-h-[50px]">
              {displayedText}
              {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-rose-400 animate-pulse" />}
            </p>

            {/* Bottom indicator */}
            <div className="flex justify-between items-center mt-3 pt-2 text-[10px] font-mono text-gray-400 border-t border-rose-900/40">
              <span>Click or Space to advance</span>
              <span className="text-yellow-400 animate-bounce">▼</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUDDEN PARADOX CHAMBER TELEPORTATION BANNER ================= */}
      {phase === 'spinning_vortex' && (
        <div className="absolute inset-x-4 sm:inset-x-0 max-w-xl mx-auto z-50 text-center animate-pulse">
          <div className="bg-black/90 border-2 border-red-500 rounded-2xl p-5 shadow-[0_0_60px_rgba(239,68,68,0.8)] backdrop-blur">
            <span className="inline-block px-3 py-1 rounded bg-red-600 text-black font-black text-xs uppercase tracking-widest mb-2 animate-ping">
              ⚠️ PARADOX DISPLACEMENT ACTIVE ⚠️
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-yellow-300 font-mono tracking-wider uppercase">
              WARPING TO THE PARADOX CHAMBER
            </h2>
            <p className="text-xs text-cyan-200 mt-1 font-mono">
              The Robot Boss has severed the Author&apos;s reality coordinates!
            </p>
          </div>
        </div>
      )}

      {/* ================= SUDDEN WHITEOUT IMPLOSION FLASH ================= */}
      {phase === 'flash_drop' && (
        <div className="absolute inset-0 z-50 bg-cyan-200 animate-fadeOut flex items-center justify-center">
          <div className="text-center font-mono font-black text-black text-xl sm:text-3xl uppercase tracking-[0.25em] animate-pulse">
            DROPPING INTO PARADOX CHAMBER...
          </div>
        </div>
      )}
    </div>
  )
}
