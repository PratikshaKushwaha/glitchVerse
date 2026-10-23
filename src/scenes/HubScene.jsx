import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Environment from '../objects/Environment'
import Door from '../objects/Door'
import Manuscript from '../objects/Manuscript'
import FirstPersonController from '../components/FirstPersonController'
import ManuscriptModal from '../components/ManuscriptModal'
import { sound } from '../utils/AudioEngine'
import wakingVideo from '../assets/player_waking_blink_overlay.mp4'

export default function HubScene({ onEnterLevelOne }) {
  // Game state
  const [isManuscriptRead, setIsManuscriptRead] = useState(false)
  const [isReadingManuscript, setIsReadingManuscript] = useState(false)
  const [isDoorOpen, setIsDoorOpen] = useState(false)
  const [isNearManuscript, setIsNearManuscript] = useState(false)
  const [isNearDoor, setIsNearDoor] = useState(false)

  // Portal transition effect
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [wakingBlink, setWakingBlink] = useState(true)

  // Initialize sound on scene start
  useEffect(() => {
    sound.init()
    const timer = setTimeout(() => {
      setWakingBlink(false)
    }, 2400)
    return () => clearTimeout(timer)
  }, [])

  // Auto-open door when unlocked and near
  useEffect(() => {
    if (isManuscriptRead && isNearDoor && !isDoorOpen) {
      setIsDoorOpen(true)
    }
  }, [isManuscriptRead, isNearDoor, isDoorOpen])

  // Handle interacting with manuscript
  const handleManuscriptInteract = () => {
    if (!isReadingManuscript) {
      sound.playManuscriptOpen()
      setIsReadingManuscript(true)
    } else {
      setIsReadingManuscript(false)
      setIsManuscriptRead(true)
    }
  }

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

          {/* First-person camera controller */}
          <FirstPersonController
            isReading={isReadingManuscript}
            isDoorLocked={!isManuscriptRead}
            isDoorOpen={isDoorOpen}
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
                  <span className="text-base">🔒</span>
                  <span>DOOR LOCKED — Read the manuscript on the right first</span>
                </>
              ) : isDoorOpen ? (
                <>
                  <span className="text-base animate-pulse">⚡</span>
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
      <div className="pointer-events-none absolute top-5 inset-x-0 flex justify-center px-4 z-30">
        <div className="max-w-xl w-full flex items-center justify-center px-5 py-2.5 rounded-lg bg-black/75 border border-cyan-500/30 backdrop-blur text-xs sm:text-sm font-mono text-cyan-300/90 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="uppercase text-cyan-400 font-bold">Objective:</span>
            <span className="text-cyan-100">
              {!isManuscriptRead
                ? 'Approach the floating manuscript on the right and press E to read.'
                : 'The door is unlocked! Walk through the doorway.'}
            </span>
          </div>
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

      {/* Manuscript Reading Modal */}
      <ManuscriptModal
        isOpen={isReadingManuscript}
        onClose={() => {
          setIsReadingManuscript(false)
          setIsManuscriptRead(true)
        }}
      />

      {/* Waking Eye Blink Video Overlay */}
      {wakingBlink && (
        <div className="pointer-events-none absolute inset-0 z-40 bg-black transition-opacity duration-1000 flex items-center justify-center">
          <video
            className="w-full h-full object-cover mix-blend-screen opacity-90"
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
          <div className="text-center font-mono text-blue font-extrabold text-2xl tracking-widest uppercase">
            ⚡ ENTERING SECTOR 1...
          </div>
        </div>
      )}
    </div>
  )
}
