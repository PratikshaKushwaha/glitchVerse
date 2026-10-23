import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import RobloxRoomInterior from '../components/RobloxRoomInterior'
import RoomController from '../components/RoomController'
import RobloxHUD from '../components/RobloxHUD'
import RobloxKeypadModal from '../components/RobloxKeypadModal'
import NoteModal from '../components/NoteModal'
import { sound } from '../utils/AudioEngine'

export default function RoomScene() {
  const [diamonds, setDiamonds] = useState(0)
  const [doorOpen, setDoorOpen] = useState(false)
  const [badgeAwarded, setBadgeAwarded] = useState(false)
  const [nearObject, setNearObject] = useState(null)
  const [isKeypadOpen, setIsKeypadOpen] = useState(false)
  const [isInspectingNote, setIsInspectingNote] = useState(false)
  const [jumpTrigger, setJumpTrigger] = useState(0)

  // Handle interacting with 3D objects
  const handleInteract = (action) => {
    if (action === 'close') {
      setIsKeypadOpen(false)
      setIsInspectingNote(false)
      return
    }

    if (action === 'keypad') {
      setIsKeypadOpen(true)
      return
    }

    if (action === 'table') {
      setIsInspectingNote(true)
      sound.playTypewriter()
      return
    }

    if (action === 'poster') {
      sound.playGlitchRadio()
    }
  }

  // Handle successful code entry
  const handleCodeSuccess = () => {
    setDoorOpen(true)
    setDiamonds((d) => d + 100)
    setBadgeAwarded(true)
    sound.playDoorUnlock()
  }

  // Handle Skip Level action from Roblox HUD
  const handleSkipLevel = () => {
    handleCodeSuccess()
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#f1f5f9] font-sans">
      {/* 3D Room Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 0.2, 1.2], fov: 75, near: 0.1, far: 50 }}
        className="w-full h-full cursor-crosshair"
      >
        <Suspense fallback={null}>
          <RobloxRoomInterior
            doorOpen={doorOpen}
            codeFound={isInspectingNote}
          />
          <RoomController
            isKeypadOpen={isKeypadOpen}
            isInspectingNote={isInspectingNote}
            onInteract={handleInteract}
            setNearObject={setNearObject}
            doorOpen={doorOpen}
            jumpTrigger={jumpTrigger}
          />
        </Suspense>
      </Canvas>

      {/* Crosshair */}
      {!isKeypadOpen && !isInspectingNote && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-black/60" />
        </div>
      )}

      {/* Roblox-Style HUD matching uploaded screenshots */}
      <RobloxHUD
        diamonds={diamonds}
        onSkipLevel={handleSkipLevel}
        badgeAwarded={badgeAwarded}
        onJump={() => setJumpTrigger((t) => t + 1)}
      />

      {/* Proximity Interaction Prompt */}
      {nearObject && !isKeypadOpen && !isInspectingNote && (
        <div className="pointer-events-none absolute bottom-20 inset-x-0 flex justify-center z-30">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/80 border-2 border-white shadow-xl text-white text-sm font-bold backdrop-blur animate-bounce">
            <kbd className="px-2 py-0.5 rounded bg-[#00a2ff] border border-white text-white font-extrabold text-xs">
              E
            </kbd>
            <span>
              {nearObject.id === 'keypad'
                ? 'Type on Wall Keypad'
                : nearObject.id === 'table'
                ? 'Read Note on Table'
                : `Inspect ${nearObject.name}`}
            </span>
          </div>
        </div>
      )}

      {/* Keypad Modal */}
      <RobloxKeypadModal
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        onCodeSuccess={handleCodeSuccess}
      />

      {/* Scrap Paper Inspection Modal */}
      <NoteModal
        isOpen={isInspectingNote}
        onClose={() => setIsInspectingNote(false)}
      />
    </div>
  )
}
