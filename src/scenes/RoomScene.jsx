import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import RoomInterior from '../components/RoomInterior'
import RoomController from '../components/RoomController'
import InspectionModal from '../components/InspectionModal'
import KeypadModal from '../components/KeypadModal'
import { sound } from '../utils/AudioEngine'

export default function RoomScene() {
  const [glitchVisionActive, setGlitchVisionActive] = useState(false)
  const [glitchEnergy, setGlitchEnergy] = useState(100)
  const [nearObject, setNearObject] = useState(null)
  const [inspectingObject, setInspectingObject] = useState(null)
  const [isKeypadOpen, setIsKeypadOpen] = useState(false)
  const [clueDiscovered, setClueDiscovered] = useState(false)
  const [exitUnlocked, setExitUnlocked] = useState(false)

  // Glitch Vision keyboard listener (Hold Q)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyQ' && glitchEnergy > 10) {
        setGlitchVisionActive(true)
        sound.playGlitchRadio()
      }
    }
    const handleKeyUp = (e) => {
      if (e.code === 'KeyQ') {
        setGlitchVisionActive(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [glitchEnergy])

  // Drain / recharge energy
  useEffect(() => {
    const interval = setInterval(() => {
      if (glitchVisionActive) {
        setGlitchEnergy((prev) => {
          if (prev <= 5) {
            setGlitchVisionActive(false)
            return 0
          }
          return prev - 4
        })
      } else {
        setGlitchEnergy((prev) => Math.min(100, prev + 2))
      }
    }, 100)
    return () => clearInterval(interval)
  }, [glitchVisionActive])

  // Handle interacting with objects in the room
  const handleInteract = (action) => {
    if (action === 'close') {
      setInspectingObject(null)
      setIsKeypadOpen(false)
      return
    }

    if (action === 'keypad') {
      setIsKeypadOpen(true)
      return
    }

    const obj = { id: action }
    setInspectingObject(obj)
    sound.playTypewriter()
    if (action === 'terminal') {
      setClueDiscovered(true)
    }
  }

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden select-none font-mono transition-colors duration-300 ${
        glitchVisionActive ? 'bg-[#bfcbbe] contrast-125' : 'bg-[#dde7f0]'
      }`}
    >
      {/* 3D Room Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 0.4, 2.8], fov: 75, near: 0.1, far: 40 }}
        className="w-full h-full cursor-crosshair"
      >
        <color attach="background" args={[glitchVisionActive ? '#0c1b29' : '#080d12']} />
        <ambientLight intensity={glitchVisionActive ? 0.6 : 0.3} color="#94a3b8" />

        <Suspense fallback={null}>
          <RoomInterior
            glitchVisionActive={glitchVisionActive}
            clueDiscovered={clueDiscovered}
            exitUnlocked={exitUnlocked}
          />
          <RoomController
            isInspecting={!!inspectingObject}
            isKeypadOpen={isKeypadOpen}
            onInteract={handleInteract}
            glitchVisionActive={glitchVisionActive}
            setNearObject={setNearObject}
            exitUnlocked={exitUnlocked}
          />
        </Suspense>
      </Canvas>

      {/* Glitch Vision Scanline Overlay */}
      {glitchVisionActive && (
        <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.18)_0%,rgba(0,0,0,0.6)_100%)]">
          <div className="absolute inset-0 bg-repeat bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:100%_4px]" />
          <div className="absolute top-16 left-6 text-xs text-yellow-300 animate-pulse font-bold tracking-widest">
            ⚡ GLITCH VISION ACTIVE — HIDDEN CIPHER REVEALED
          </div>
        </div>
      )}

      {/* Crosshair */}
      {!inspectingObject && !isKeypadOpen && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
          <div className="absolute h-6 w-6 rounded-full border border-cyan-400/30" />
        </div>
      )}

      {/* Top Objective Bar */}
      <div className="pointer-events-none absolute top-4 inset-x-4 flex justify-between items-center z-30">
        <div className="flex items-center gap-4 bg-blue/75 px-4 py-2 rounded-lg border border-cyan-500/30 backdrop-blur">
          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-400/70 tracking-widest uppercase">
              SECTOR 1
            </span>
            <span className="text-xs font-bold text-cyan-200">
              THE ABANDONED COMPLEX
            </span>
          </div>

          <div className="h-6 w-px bg-cyan-500/30" />

          {/* Glitch Vision Energy Gauge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-400/70 uppercase">
              Glitch Vision (Hold Q):
            </span>
            <div className="w-24 h-2 rounded-full bg-cyan-950 border border-cyan-500/40 overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-150"
                style={{ width: `${glitchEnergy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Objective */}
        <div className="bg-black/75 px-4 py-2 rounded-lg border border-cyan-500/30 backdrop-blur text-xs text-cyan-300 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping" />
          <span className="font-bold text-yellow-300">Objective:</span>
          <span>
            {!clueDiscovered
              ? 'Inspect objects or hold [Q] to find the hidden cipher.'
              : !exitUnlocked
              ? 'Enter the cipher [482] on the blast door keypad!'
              : 'Blast door unlocked! Sector 1 cleared!'}
          </span>
        </div>
      </div>

      {/* Proximity Interaction Prompt */}
      {nearObject && !inspectingObject && !isKeypadOpen && (
        <div className="pointer-events-none absolute bottom-20 inset-x-0 flex justify-center z-30">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/85 border border-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.4)] text-cyan-200 text-sm backdrop-blur animate-bounce">
            <kbd className="px-2 py-0.5 rounded bg-cyan-600/60 border border-cyan-300 text-cyan-100 font-bold">
              E
            </kbd>
            <span>
              {nearObject.id === 'keypad'
                ? 'Use Blast Door Keypad'
                : `Inspect ${nearObject.name}`}
            </span>
          </div>
        </div>
      )}

      {/* Controls Hint (Bottom Left) */}
      <div className="pointer-events-none absolute bottom-4 left-4 hidden sm:flex flex-col gap-1 text-[11px] text-cyan-300/60 bg-black/60 px-3 py-2 rounded border border-cyan-500/20 backdrop-blur z-30">
        <div>
          <span className="text-cyan-300">WASD</span> : Move
        </div>
        <div>
          <span className="text-cyan-300">SHIFT</span> : Sprint
        </div>
        <div>
          <span className="text-cyan-300">HOLD Q</span> : Glitch Vision (Reveal Hidden Clues)
        </div>
        <div>
          <span className="text-cyan-300">E</span> : Inspect / Use Keypad
        </div>
      </div>

      {/* Inspection Modal */}
      <InspectionModal
        object={inspectingObject}
        onClose={() => setInspectingObject(null)}
        onDiscoverClue={() => setClueDiscovered(true)}
      />

      {/* Keypad Modal */}
      <KeypadModal
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        onCodeSuccess={() => setExitUnlocked(true)}
        clueDiscovered={clueDiscovered}
      />
    </div>
  )
}
