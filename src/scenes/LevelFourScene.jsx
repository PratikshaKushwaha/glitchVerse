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
  onGoToFinalBoss,
}) {
  const canvasRef = useRef(null)
  const reqIdRef = useRef(null)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
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

    // 3. Callback when Author is Saved — proceed directly to Paradox Chamber
    const handleSavedAuthor = () => {
      sound.playVictory()
      Audio.stopMusic()
      onGoToFinalBoss()
    }

    // 4. Callback when 6 smaller enemy pawns are cleared -> directly enter Paradox Chamber
    const handlePawnsCleared = () => {
      sound.playGlitchRadio()
      Audio.stopMusic()
      onGoToFinalBoss()
    }

    // 5. Initialize Level 4 Boss GameScene with pawns cleared callback
    const gameScene = new GameScene(2, handleSavedAuthor, handlePawnsCleared)
    Scenes.set(gameScene)

    // 6. 60 FPS Engine Frame Loop
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
  }, [onGoToFinalBoss])

  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    if (next) {
      Audio.apply()
    } else {
      Audio.stopMusic()
    }
  }

  // Universal K key to skip to Paradox Chamber
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return
      if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        Audio.stopMusic()
        onGoToFinalBoss()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onGoToFinalBoss])

  return (
    <div className="relative w-screen h-screen bg-[#070514] text-white flex flex-col justify-between overflow-hidden select-none font-mono">
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

          {/* Proceed directly to Paradox Chamber without AI bot cutscene */}
          <button
            onClick={() => {
              Audio.stopMusic()
              onGoToFinalBoss()
            }}
            className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:brightness-110 active:scale-95 text-black font-mono font-black text-xs uppercase tracking-wider cursor-pointer transition shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-200 flex items-center gap-1.5"
            title="Proceed directly to Paradox Chamber (Press K or Click)"
          >
            <span>Paradox Chamber [K] ➔</span>
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
            <strong className="text-cyan-300 font-mono">Shift</strong>: Dash
          </span>
          <span>
            <strong className="text-rose-400 font-mono">F / E / Click</strong>: Shoot Blaster
          </span>
          <span>
            <strong className="text-purple-300 font-mono">G</strong>: Gravity Flip
          </span>
          <span>
            <strong className="text-amber-300 font-mono">K</strong>: Skip
          </span>
        </div>
        <div className="text-yellow-400/90 font-bold hidden md:block">
          OBJECTIVE: DESTROY 6 PAWNS ➔ ENTER PARADOX CHAMBER
        </div>
      </footer>
    </div>
  )
}
