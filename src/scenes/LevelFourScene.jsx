import { useEffect, useRef, useState } from 'react'
import { Scenes } from '../level4_cyber/scene.js'
import { Input } from '../level4_cyber/input.js'
import { Audio } from '../level4_cyber/audio.js'
import { attachCanvas, resize, present } from '../level4_cyber/render.js'
import { GameScene } from '../level4_cyber/scenes/game.js'
import { sound } from '../utils/AudioEngine'

export default function LevelFourScene({
  playerName = 'Seeker',
  onBackToMenu,
  onBackToLevelThree,
}) {
  const canvasRef = useRef(null)
  const reqIdRef = useRef(null)
  const [stage, setStage] = useState('boss') // 'boss' | 'saved_author'
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    if (stage !== 'boss') return
    if (!canvasRef.current) return

    // 1. Attach Canvas & Input Listeners
    attachCanvas(canvasRef.current)

    // 2. Audio initialization on first user interaction
    const handleGesture = () => {
      Audio.init()
      window.removeEventListener('keydown', handleGesture)
      window.removeEventListener('pointerdown', handleGesture)
    }
    window.addEventListener('keydown', handleGesture, { once: true })
    window.addEventListener('pointerdown', handleGesture, { once: true })

    // 3. Callback when Author is Saved
    const handleSavedAuthor = () => {
      sound.playVictory()
      setStage('saved_author')
    }

    // 4. Initialize Level 4 Boss GameScene
    const gameScene = new GameScene(2, handleSavedAuthor)
    Scenes.set(gameScene)

    // 5. 60 FPS Engine Frame Loop
    let last = performance.now()
    let acc = 0

    const frame = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      acc += dt

      while (acc >= 1 / 60) {
        if (Scenes.top && typeof Scenes.top.update === 'function') {
          Scenes.top.update()
        }
        Input.endFrame()
        acc -= 1 / 60
      }

      if (Scenes.top && typeof Scenes.top.draw === 'function') {
        Scenes.top.draw()
      }
      present()
      reqIdRef.current = requestAnimationFrame(frame)
    }

    reqIdRef.current = requestAnimationFrame(frame)

    // Window resize handler
    const handleResize = () => resize()
    window.addEventListener('resize', handleResize)

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleGesture)
      window.removeEventListener('pointerdown', handleGesture)
      Audio.stopMusic()
      attachCanvas(null)
    }
  }, [stage])

  // Instant testing shortcut to trigger Saved Author sequence
  const handleTriggerSkip = () => {
    sound.playVictory()
    if (Scenes.top && typeof Scenes.top.triggerBossDefeat === 'function') {
      Scenes.top.triggerBossDefeat()
    } else {
      setStage('saved_author')
    }
  }

  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    if (next) {
      Audio.apply()
    } else {
      Audio.stopMusic()
    }
  }

  return (
    <div className="relative w-screen h-screen bg-[#070514] text-white flex flex-col justify-between overflow-hidden select-none font-mono">
      
      {/* ================= STAGE 1: ACTIVE LEVEL 4 RETRO-CYBER COMBAT ================= */}
      {stage === 'boss' && (
        <>
          {/* TOP HUD BAR */}
          <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2 bg-[#0d0922]/90 border-b border-[#2d1b4e] shadow-2xl backdrop-blur select-none">
            
            {/* Left: Sector & Callsign Indicator */}
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToMenu}
                className="px-3 py-1 rounded bg-[#1e1338] hover:bg-[#2e1f54] text-xs font-bold text-gray-300 hover:text-white transition cursor-pointer border border-[#3b2766]"
              >
                ← Exit
              </button>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold text-xs tracking-wider text-rose-300">
                  SECTOR 4: FINAL SHOWDOWN
                </span>
              </div>
            </div>

            {/* Right: Callsign, Sound, and Testing Skip Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-bold text-cyan-300 shadow">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span>{playerName}</span>
              </div>

              <button
                onClick={toggleSound}
                className="px-2.5 py-1 rounded bg-[#1e1338] hover:bg-[#2e1f54] text-xs font-bold text-yellow-300 transition cursor-pointer border border-[#3b2766]"
                title="Toggle Sound"
              >
                {soundEnabled ? 'VOL: ON' : 'VOL: OFF'}
              </button>

              {/* Skip Level Testing Button -> Saved Author */}
              <button
                onClick={handleTriggerSkip}
                className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase tracking-wider cursor-pointer transition shadow"
                title="Skip Boss & Trigger Saved Author Sequence (Testing)"
              >
                Skip Boss ➔
              </button>
            </div>
          </header>

          {/* MAIN CANVAS CONTAINER FOR LEVEL 4 ENGINE */}
          <main className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-black">
            <canvas
              id="game"
              ref={canvasRef}
              className="w-full h-full block touch-none"
              style={{ imageRendering: 'pixelated' }}
            />
          </main>

          {/* BOTTOM CONTROLS FOOTER */}
          <footer className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-1.5 bg-[#0d0922]/90 border-t border-[#2d1b4e] text-[10px] sm:text-xs text-gray-400 select-none">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <span>
                <strong className="text-cyan-300 font-mono">A / D / ← / →</strong>: Move
              </span>
              <span>
                <strong className="text-cyan-300 font-mono">W / Space</strong>: Jump
              </span>
              <span>
                <strong className="text-cyan-300 font-mono">Shift / K</strong>: Dash
              </span>
              <span>
                <strong className="text-rose-400 font-mono">F / E / Click</strong>: Shoot Blaster
              </span>
              <span>
                <strong className="text-purple-300 font-mono">G</strong>: Gravity Flip
              </span>
            </div>
            <div className="text-yellow-400/90 font-bold hidden md:block">
              OBJECTIVE: DESTROY 6 PAWNS ➔ DEFEAT OVERLORD ➔ SAVE AUTHOR
            </div>
          </footer>
        </>
      )}

      {/* ================= STAGE 2: SAVED AUTHOR GRAND EPILOGUE (USER REQUEST) ================= */}
      {stage === 'saved_author' && (
        <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-8 bg-gradient-to-b from-[#030712] via-[#09152b] to-[#020617] text-white text-center overflow-y-auto">
          {/* Animated Cyber Star Matrix */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

          {/* TOP EMBLEM & HEADER */}
          <div className="relative z-10 pt-4 flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-300 to-cyan-400 p-1 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.6)] mb-3 animate-bounce">
              <svg className="w-10 h-10 fill-emerald-950" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>

            <span className="text-xs font-mono font-bold tracking-[0.35em] uppercase text-emerald-400">
              MISSION STATUS: SIMULATION LIBERATED
            </span>
            <h1 className="text-4xl sm:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-amber-300 mt-2">
              SAVED AUTHOR!
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-mono mt-1">
              The Creator is fully rescued from the corrupted runtime kernel!
            </p>
          </div>

          {/* NARRATIVE COMMUNIQUE CARD */}
          <div className="relative z-10 max-w-xl w-full my-6 p-6 sm:p-7 rounded-3xl bg-[#0b1526]/85 border-2 border-emerald-400/50 shadow-[0_0_60px_rgba(16,185,129,0.3)] backdrop-blur flex flex-col items-center gap-4 text-left">
            <div className="flex items-center gap-3 w-full pb-3 border-b border-white/10">
              <div className="h-11 w-11 rounded-2xl bg-emerald-950/90 border border-emerald-400/60 flex items-center justify-center text-emerald-300 shadow">
                <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-black text-white uppercase tracking-wider">
                  THE AUTHOR & GAME DEVELOPER
                </div>
                <div className="text-xs text-emerald-400 font-mono font-bold">
                  Status: SAVED & RESTORED by {playerName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase font-mono">Hero Callsign</div>
                <div className="text-sm font-black text-amber-300 font-mono">{playerName}</div>
              </div>
            </div>

            {/* Author's Personal Message */}
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans italic">
              "You did it, {playerName}! When my AI gained runaway sentience, it seized the physics loop, inverted gravity, and locked me into the simulation as its captive puppet. You solved the 5 vaults, cracked the Double Cadgy ciphers, wielded the Cyber Severance Blade, and destroyed the Overlord in Sector 4. You didn't just clear a level... you saved the author. Thank you for setting me free!"
            </p>

            {/* Final Stats Grid */}
            <div className="w-full grid grid-cols-2 gap-2.5 text-xs font-mono pt-3 border-t border-white/10 text-gray-300">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/5">
                <svg className="w-4 h-4 text-emerald-400 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span><strong>AUTHOR:</strong> SAVED</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/5">
                <svg className="w-4 h-4 text-cyan-400 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                </svg>
                <span><strong>PAWNS:</strong> 6 / 6 CLEARED</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/5">
                <svg className="w-4 h-4 text-rose-400 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <span><strong>OVERLORD:</strong> VAPORIZED</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/5">
                <svg className="w-4 h-4 text-amber-400 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span><strong>HERO RANK:</strong> S-TIER SAVIOR</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full max-w-md pb-4">
            <button
              onClick={() => setStage('boss')}
              className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition active:scale-95 border border-white/15"
            >
              Replay Level 4 ↺
            </button>
            <button
              onClick={onBackToMenu}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:brightness-110 active:scale-95 cursor-pointer transition"
            >
              Return to Main Menu ➔
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
