import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Environment from '../objects/Environment'
import Door from '../objects/Door'
import Manuscript from '../objects/Manuscript'
import FirstPersonController from '../components/FirstPersonController'
import ManuscriptModal from '../components/ManuscriptModal'
import { sound } from '../utils/AudioEngine'
import wakingVideo from '../assets/player_waking_blink_overlay.mp4'

// Tiny component that fires the blink callback once the Suspense children have mounted
// (i.e., after Environment loads and the 3D scene is visible)
function BlinkTrigger({ onTrigger }) {
  useEffect(() => {
    onTrigger()
  }, [onTrigger])
  return null
}

export default function HubScene({ onEnterLevelOne }) {
  // Game state
  const [isManuscriptRead, setIsManuscriptRead] = useState(false)
  const [isReadingManuscript, setIsReadingManuscript] = useState(false)
  const [isDoorOpen, setIsDoorOpen] = useState(false)
  const [isNearManuscript, setIsNearManuscript] = useState(false)
  const [isNearDoor, setIsNearDoor] = useState(false)

  // Portal transition effect
  const [isTransitioning, setIsTransitioning] = useState(false)
  // Mobile virtual movement input state
  const [moveInput, setMoveInput] = useState({ forward: false, backward: false, left: false, right: false })
  // Waking blink: plays player_waking_blink_overlay.mp4 when the player is
  // transported into the game world (after the intro video, played or skipped)
  // Starts FALSE so the 3D scene renders first, then we trigger the blink
  // over the live scene for the "transmitted into this world" effect
  const [isWaking, setIsWaking] = useState(false)
  const [wakingFading, setWakingFading] = useState(false)
  // The waking moment must be perceptible: suppress skip/fade attempts that
  // arrive while the player is still being transported (stray clicks/keys)
  const wakingStartRef = useRef(null)
  const WAKE_MIN_VISIBLE_MS = 2200

  // Initialize sound on scene start & handle universal K skip key
  useEffect(() => {
    sound.init()

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        onEnterLevelOne && onEnterLevelOne()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onEnterLevelOne])

  // Called by the BlinkTrigger component (rendered inside Suspense, after scene loads)
  const startWakingBlink = () => {
    setIsWaking(true)
    wakingStartRef.current = Date.now()
  }

  // End the waking blink: video ended, player pressed a key, or after the
  // video's expected duration (fallback in case autoplay is blocked)
  useEffect(() => {
    if (!isWaking) return
    if (wakingStartRef.current === null) {
      wakingStartRef.current = Date.now()
    }

    const finish = () => {
      // Defer fade until the blink has been visible for its minimum duration
      const remaining = Math.max(0, WAKE_MIN_VISIBLE_MS - (Date.now() - wakingStartRef.current))
      setTimeout(() => setWakingFading(true), remaining)
    }
    const endTimer = setTimeout(finish, 7000)
    const wakeVideo = document.getElementById('waking-blink-video')
    wakeVideo && wakeVideo.addEventListener('ended', finish)
    const onSkipKey = (e) => {
      if (['e', 'E', ' ', 'Spacebar', 'Escape'].includes(e.key)) finish()
    }
    const onSkipClick = finish
    window.addEventListener('keydown', onSkipKey)
    window.addEventListener('mousedown', onSkipClick)
    window.addEventListener('touchstart', onSkipClick)

    return () => {
      clearTimeout(endTimer)
      wakeVideo && wakeVideo.removeEventListener('ended', finish)
      window.removeEventListener('keydown', onSkipKey)
      window.removeEventListener('mousedown', onSkipClick)
      window.removeEventListener('touchstart', onSkipClick)
    }
  }, [isWaking, wakingFading])

  // Auto-open door when unlocked and near
  useEffect(() => {
    if (isManuscriptRead && isNearDoor && !isDoorOpen) {
      setIsDoorOpen(true)
    }
  }, [isManuscriptRead, isNearDoor, isDoorOpen])

  // Handle interacting with manuscript
  const handleManuscriptInteract = () => {
    if (!isReadingManuscript) {
      if (typeof document !== 'undefined' && document.pointerLockElement) {
        document.exitPointerLock()
      }
      sound.playManuscriptOpen()
      setIsReadingManuscript(true)
    } else {
      setIsReadingManuscript(false)
      setIsManuscriptRead(true)
    }
  }

  // Release pointer lock whenever reading manuscript
  useEffect(() => {
    if (isReadingManuscript && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock()
    }
  }, [isReadingManuscript])

  // Handle interacting with door
  const handleDoorInteract = () => {
    if (!isManuscriptRead) {
      sound.playDoorLocked()
    } else {
      setIsDoorOpen(true)
      handleEnterDoor()
    }
  }

  // Trigger portal transition when walking through doorway
  const handleEnterDoor = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    sound.playPortalEnter()

    setTimeout(() => {
      onEnterLevelOne && onEnterLevelOne()
    }, 900)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#071015] select-none">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 0.1, 3.2], fov: 75, near: 0.1, far: 80 }}
        className="w-full h-full cursor-crosshair"
      >
        <color attach="background" args={['#071015']} />
        <fog attach="fog" args={['#071015', 3, 26]} />

        <Suspense fallback={null}>
          {/* World Environment using environment_collider.glb */}
          <Environment />

          {/* Trigger the waking blink AFTER the scene has loaded and rendered */}
          <BlinkTrigger onTrigger={startWakingBlink} />

          {/* Teleport Door (object_0000) */}
          <Door
            isLocked={!isManuscriptRead}
            isOpen={isDoorOpen}
            isNear={isNearDoor}
            onInteract={handleDoorInteract}
          />

          {/* Floating Manuscript (object_0001) */}
          <Manuscript
            isNear={isNearManuscript}
            isReading={isReadingManuscript}
            isRead={isManuscriptRead}
            onInteract={handleManuscriptInteract}
          />

          {/* First-person camera controller (frozen during the waking blink) */}
          <FirstPersonController
            isReading={isReadingManuscript}
            isDoorLocked={!isManuscriptRead}
            isDoorOpen={isDoorOpen}
            isFrozen={isWaking && !wakingFading}
            moveInput={moveInput}
            setIsNearManuscript={setIsNearManuscript}
            setIsNearDoor={setIsNearDoor}
            onInteractManuscript={handleManuscriptInteract}
            onInteractDoor={handleDoorInteract}
            onEnterDoor={handleEnterDoor}
          />
        </Suspense>
      </Canvas>

      {/* Crosshair */}
      {!isReadingManuscript && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <div className="absolute h-6 w-6 rounded-full border border-cyan-400/30" />
          </div>
        </div>
      )}

      {/* Dynamic Interaction HUD Prompt */}
      {!isReadingManuscript && (
        <div className="pointer-events-none absolute bottom-24 inset-x-0 flex flex-col items-center justify-center gap-2 z-30">
          {isNearManuscript && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.4)] text-cyan-200 text-sm font-mono backdrop-blur animate-bounce">
              <kbd className="px-2 py-0.5 rounded bg-cyan-600/60 border border-cyan-300 text-cyan-100 font-bold">
                E
              </kbd>
              <span>
                {isManuscriptRead
                  ? 'Inspect Ancient Manuscript'
                  : 'Read Instruction Manuscript'}
              </span>
            </div>
          )}

          {isNearDoor && (
            <div
              onClick={() => {
                if (isManuscriptRead) {
                  handleDoorInteract()
                }
              }}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-full border-2 shadow-2xl backdrop-blur text-sm font-mono font-bold transition-all duration-300 pointer-events-auto ${
                !isManuscriptRead
                  ? 'border-red-500/60 bg-red-950/80 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : isDoorOpen
                  ? 'border-cyan-400 bg-cyan-950/90 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.5)] cursor-pointer hover:bg-cyan-900 active:scale-95'
                  : 'border-emerald-400/60 bg-emerald-950/80 text-emerald-300 shadow-[0_0_20px_rgba(34,197,94,0.4)] cursor-pointer'
              }`}
            >
              {!isManuscriptRead ? (
                <>
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                  <span>DOOR LOCKED — Read the manuscript on the right first</span>
                </>
              ) : isDoorOpen ? (
                <>
                  <svg className="w-4 h-4 fill-cyan-300 animate-pulse shrink-0" viewBox="0 0 24 24">
                    <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                  </svg>
                  <span>PORTAL ACTIVE — Walk through or click to enter</span>
                  <span className="ml-1 px-2.5 py-0.5 rounded bg-cyan-400 text-black font-extrabold text-xs">
                    ENTER ↵
                  </span>
                </>
              ) : (
                <>
                  <kbd className="px-2 py-0.5 rounded bg-emerald-600/60 border border-emerald-300 text-emerald-100 font-bold">
                    E
                  </kbd>
                  <span>Open Doorway</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Top Objective Bar */}
      <div className="pointer-events-none absolute top-5 inset-x-0 flex items-center justify-between px-6 z-30">
        <div className="w-24 hidden md:block" />
        <div className="max-w-xl w-full flex items-center justify-center px-5 py-2.5 rounded-lg bg-black/75 border border-cyan-500/30 backdrop-blur text-xs sm:text-sm font-mono text-cyan-300/90 shadow-[0_0_25px_rgba(6,182,212,0.15)] pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="uppercase text-cyan-400 font-bold">Objective:</span>
            <span className="text-cyan-100">
              {!isManuscriptRead
                ? 'Approach the floating manuscript on the right [E]'
                : 'The door is unlocked! Walk through the doorway.'}
            </span>
          </div>
        </div>
        <div className="pointer-events-auto">
          <button
            onClick={onEnterLevelOne}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 hover:brightness-110 text-black font-extrabold text-xs tracking-wider cursor-pointer shadow-lg transition active:scale-95"
            title="Skip to Level 1 (Press K or Click)"
          >
            Skip [K] -&gt;
          </button>
        </div>
      </div>

      {/* Controls Hint Overlay (Bottom Left) */}
      <div className="pointer-events-none absolute bottom-4 left-4 hidden sm:flex flex-col gap-1 text-[11px] font-mono text-cyan-300/60 bg-black/60 px-3 py-2 rounded border border-cyan-500/20 backdrop-blur z-30">
        <div>
          <span className="text-cyan-300">WASD</span> : Walk
        </div>
        <div>
          <span className="text-cyan-300">SHIFT</span> : Sprint
        </div>
        <div>
          <span className="text-cyan-300">MOUSE</span> : Look around (Click to lock)
        </div>
        <div>
          <span className="text-cyan-300">E</span> : Interact
        </div>
      </div>

      {/* Mobile Touch D-Pad for Virtual Movement (Visible on Mobile/Tablet) */}
      <div className="absolute bottom-4 left-4 z-30 pointer-events-auto flex flex-col items-center select-none sm:hidden opacity-85">
        <button
          onTouchStart={(e) => { e.preventDefault(); setMoveInput((p) => ({ ...p, forward: true })) }}
          onTouchEnd={() => setMoveInput((p) => ({ ...p, forward: false }))}
          onMouseDown={() => setMoveInput((p) => ({ ...p, forward: true }))}
          onMouseUp={() => setMoveInput((p) => ({ ...p, forward: false }))}
          className="h-11 w-11 rounded-full bg-black/60 border border-cyan-400/50 text-cyan-200 flex items-center justify-center text-sm font-bold shadow active:bg-cyan-500 active:text-black mb-1"
        >
          ▲
        </button>
        <div className="flex items-center gap-4">
          <button
            onTouchStart={(e) => { e.preventDefault(); setMoveInput((p) => ({ ...p, left: true })) }}
            onTouchEnd={() => setMoveInput((p) => ({ ...p, left: false }))}
            onMouseDown={() => setMoveInput((p) => ({ ...p, left: true }))}
            onMouseUp={() => setMoveInput((p) => ({ ...p, left: false }))}
            className="h-11 w-11 rounded-full bg-black/60 border border-cyan-400/50 text-cyan-200 flex items-center justify-center text-sm font-bold shadow active:bg-cyan-500 active:text-black"
          >
            ◀
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); setMoveInput((p) => ({ ...p, backward: true })) }}
            onTouchEnd={() => setMoveInput((p) => ({ ...p, backward: false }))}
            onMouseDown={() => setMoveInput((p) => ({ ...p, backward: true }))}
            onMouseUp={() => setMoveInput((p) => ({ ...p, backward: false }))}
            className="h-11 w-11 rounded-full bg-black/60 border border-cyan-400/50 text-cyan-200 flex items-center justify-center text-sm font-bold shadow active:bg-cyan-500 active:text-black"
          >
            ▼
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); setMoveInput((p) => ({ ...p, right: true })) }}
            onTouchEnd={() => setMoveInput((p) => ({ ...p, right: false }))}
            onMouseDown={() => setMoveInput((p) => ({ ...p, right: true }))}
            onMouseUp={() => setMoveInput((p) => ({ ...p, right: false }))}
            className="h-11 w-11 rounded-full bg-black/60 border border-cyan-400/50 text-cyan-200 flex items-center justify-center text-sm font-bold shadow active:bg-cyan-500 active:text-black"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Manuscript Reading Modal */}
      <ManuscriptModal
        isOpen={isReadingManuscript}
        onClose={() => {
          setIsReadingManuscript(false)
          setIsManuscriptRead(true)
        }}
      />

      {/* Waking Eye Blink Video Overlay (player transported into the game world) */}
      {isWaking && (
        <div
          className={`pointer-events-none absolute inset-0 z-40 flex items-center justify-center transition-opacity duration-700 ${
            wakingFading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Screen blend: bright eyelid scanlines pulse OVER the live hub scene */}
          <video
            id="waking-blink-video"
            className="w-full h-full object-cover mix-blend-screen opacity-100"
            style={{ filter: 'brightness(1.35) contrast(1.1)' }}
            src={wakingVideo}
            autoPlay
            muted
            playsInline
          />
        </div>
      )}

      {/* Teleport Portal Glitch Flash Transition */}
      {isTransitioning && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-cyan-400 animate-pulse transition-opacity duration-500">
          <div className="flex items-center justify-center gap-3 text-center font-mono text-black font-extrabold text-2xl tracking-widest uppercase">
            <svg className="w-7 h-7 fill-black animate-bounce" viewBox="0 0 24 24">
              <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
            </svg>
            <span>ENTERING SECTOR 1...</span>
          </div>
        </div>
      )}
    </div>
  )
}
