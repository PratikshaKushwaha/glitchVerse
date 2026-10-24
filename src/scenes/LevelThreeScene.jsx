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

    // 3. Handle level completion: trigger transition to Level 4
    const handleCompleteAll = () => {
      sound.playDoorUnlocked()
      setTimeout(() => {
        if (onGoToLevel4) onGoToLevel4()
      }, 800)
    }

    // 4. Set initial scene to Level 3 GameScene (Level 0)
    Scenes.set(new GameScene(0, handleCompleteAll))

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
    Scenes.set(new GameScene(stageIdx, onGoToLevel4))
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
        <div className="flex items-center gap-4">
          <span className="text-cyan-400 font-bold">CONTROLS:</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">A</kbd> / <kbd className="px-1 py-0.5 bg-white/10 rounded text-white">D</kbd> Move</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">SPACE</kbd> Jump</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">G</kbd> Flip Gravity</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">R</kbd> Respawn</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-purple-300">
          <span>Reach the golden vortex portal to unlock Sector 4!</span>
        </div>
      </footer>
    </div>
  )
}
