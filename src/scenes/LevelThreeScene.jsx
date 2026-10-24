import { useEffect, useRef, useState } from 'react'
import { Scenes } from '../level3_gravity/scene.js'
import { Input } from '../level3_gravity/input.js'
import { Audio } from '../level3_gravity/audio.js'
import { attachCanvas, resize, present } from '../level3_gravity/render.js'
import { GameScene } from '../level3_gravity/game.js'
import { MenuScene } from '../level3_gravity/menu.js'
import { sound } from '../utils/AudioEngine'

export default function LevelThreeScene({
  playerName = 'Player',
  onBackToMenu,
  onBackToLevelTwo,
  onGoToLevel4,
}) {
  const canvasRef = useRef(null)
  const reqIdRef = useRef(null)
  const [currentStage, setCurrentStage] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const [showSwordModal, setShowSwordModal] = useState(false)

  useEffect(() => {
    // 1. Attach canvas to render module
    if (!canvasRef.current) return
    attachCanvas(canvasRef.current)
    Input.init()

    // 2. Initialize Audio on first gesture
    const handleGesture = () => {
      Audio.init()
      window.removeEventListener('keydown', handleGesture)
      window.removeEventListener('pointerdown', handleGesture)
    }
    window.addEventListener('keydown', handleGesture, { once: true })
    window.addEventListener('pointerdown', handleGesture, { once: true })

    // 3. Handle level completion: trigger sword reward & transition to Level 4
    const handleCompleteAll = () => {
      sound.playVictory()
      setShowSwordModal(true)
    }

    // 4. Set initial scene to Level 3 GameScene (Level 0)
    Scenes.set(new GameScene(0, 3, handleCompleteAll))

    // 5. Game Loop
    let last = performance.now()
    let acc = 0

    const frame = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      acc += dt

      while (acc >= 1 / 60) {
        if (Scenes.top && typeof Scenes.top.update === 'function') {
          Scenes.top.update()
          if (typeof Scenes.top.li === 'number' && Scenes.top.li !== currentStage) {
            setCurrentStage(Scenes.top.li)
          }
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
      Input.cleanup()
      Audio.stopMusic()
      attachCanvas(null)
    }
  }, [onGoToLevel4])

  const selectStage = (stageIdx) => {
    sound.playKeyClick()
    setCurrentStage(stageIdx)
    Scenes.set(new GameScene(stageIdx, 3, onGoToLevel4))
  }

  const stageNames = ['1: WARM UP', '2: SPIKE RUN', '3: UPSIDE DOWN', '4: THE WAY OUT']

  return (
    <div className="relative w-screen h-screen bg-[#070514] text-white flex flex-col justify-between overflow-hidden select-none font-mono">
      {/* Top Header HUD */}
      <header className="relative z-20 w-full flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0d0922]/90 border-b border-purple-900/60 backdrop-blur shadow-md">
        {/* Left: Back & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              Audio.stopMusic()
              onBackToLevelTwo()
            }}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs text-gray-300 font-bold transition cursor-pointer"
          >
            ← Sector 2
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 hidden sm:inline">
              SECTOR 3: GRAVITY ANOMALY
            </span>
          </div>
        </div>

        {/* Center: Stage Selection Buttons */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-purple-500/30">
          <span className="text-[10px] text-purple-300 uppercase px-1.5 hidden md:inline">
            STAGE:
          </span>
          {stageNames.map((name, idx) => (
            <button
              key={idx}
              onClick={() => selectStage(idx)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                currentStage === idx
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Right: Player Name & Skip to Level 4 */}
        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold">
            CALLSIGN: <span className="text-cyan-300">{playerName}</span>
          </div>
          <button
            onClick={() => {
              Audio.stopMusic()
              if (onGoToLevel4) onGoToLevel4()
            }}
            className="px-3 py-1 rounded bg-gradient-to-r from-rose-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_0_12px_rgba(236,72,153,0.5)]"
          >
            Skip to Level 4 ➔
          </button>
          <button
            onClick={() => {
              Audio.stopMusic()
              onBackToMenu()
            }}
            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs text-gray-300 font-bold transition cursor-pointer"
          >
            Menu
          </button>
        </div>
      </header>

      {/* Center 2D Game Canvas */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
        <canvas
          id="game"
          ref={canvasRef}
          className="w-full h-full object-contain cursor-crosshair"
          tabIndex={0}
        />
      </div>

      {/* Bottom Controls Bar */}
      <footer className="relative z-20 w-full flex flex-wrap items-center justify-between px-4 py-2 bg-[#0d0922]/90 border-t border-purple-900/60 text-[11px] text-gray-400 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-cyan-400 font-bold">CONTROLS:</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">A</kbd> / <kbd className="px-1 py-0.5 bg-white/10 rounded text-white">D</kbd> Move</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">SPACE</kbd> Jump</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">SHIFT</kbd> / <kbd className="px-1 py-0.5 bg-white/10 rounded text-white">K</kbd> Dash</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">G</kbd> Flip Gravity</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">ESC</kbd> Pause</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">R</kbd> Retry</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-purple-300">
          <span>Reach the golden vortex portal to unlock Sector 4!</span>
        </div>
      </footer>

      {/* ================= SWORD REWARD UNLOCK MODAL ================= */}
      {showSwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="max-w-md w-full rounded-3xl bg-[#0e0a24] border-2 border-cyan-400 p-6 sm:p-8 shadow-[0_0_80px_rgba(6,182,212,0.5)] flex flex-col items-center text-center text-white gap-4 animate-bounce">
            
            {/* Glowing Sword Emblem */}
            <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-tr from-cyan-600 via-purple-600 to-pink-500 p-1 flex items-center justify-center shadow-2xl">
              <div className="absolute inset-0 rounded-2xl bg-cyan-400/30 animate-ping" />
              <div className="relative h-full w-full rounded-xl bg-[#090616] flex items-center justify-center">
                {/* Cyber Katana SVG */}
                <svg className="w-14 h-14 text-cyan-300 fill-current drop-shadow-[0_0_12px_#38bdf8]" viewBox="0 0 24 24">
                  <path d="M19.78 2.22c-.98-.98-2.56-.98-3.54 0l-9.9 9.9 1.41 1.41 9.9-9.9c.98-.98 2.56-.98 3.54 0 .98.98.98 2.56 0 3.54l-9.9 9.9 1.41 1.41 9.9-9.9c1.95-1.96 1.95-5.12-.02-7.08zM2.81 18.36L4.22 17l2.83 2.83-1.41 1.41-2.83-2.88zm3.54-3.53l1.41-1.41 2.83 2.83-1.41 1.41-2.83-2.83zm2.12-2.12l1.41-1.41 2.83 2.83-1.41 1.41-2.83-2.83z"/>
                </svg>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono font-bold tracking-[0.25em] text-cyan-400 uppercase">
                SECTOR 3 ANOMALY CORE CONQUERED
              </div>
              <h2 className="text-xl sm:text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 mt-1">
                CYBER SEVERANCE BLADE ACQUIRED!
              </h2>
            </div>

            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              Forged from the broken gravity matrix. This high-frequency dimensional katana allows you to cleave through corrupted glitch drones and sever the puppet strings binding the Developer in Sector 4!
            </p>

            {/* Weapon Stats Card */}
            <div className="w-full grid grid-cols-2 gap-2 text-[11px] font-mono bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 text-left">
              <div>
                <span className="text-gray-400 block">TYPE:</span>
                <span className="text-cyan-300 font-bold">Dimensional Blade</span>
              </div>
              <div>
                <span className="text-gray-400 block">DAMAGE:</span>
                <span className="text-emerald-400 font-bold">45 DMG + Arc</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-purple-500/20">
                <span className="text-gray-400 block">SPECIAL:</span>
                <span className="text-amber-300 font-bold">Severs Puppet Tethers & Drones</span>
              </div>
            </div>

            <button
              onClick={() => {
                Audio.stopMusic()
                if (onGoToLevel4) onGoToLevel4()
              }}
              className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.6)] cursor-pointer transition flex items-center justify-center gap-2"
            >
              <span>Equip Blade & Enter Sector 4 ➔</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
