import { useState, useEffect, Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import FiveRoomsInterior from '../components/FiveRoomsInterior'
import RoomController from '../components/RoomController'
import RobloxHUD from '../components/RobloxHUD'
import RobloxKeypadModal from '../components/RobloxKeypadModal'
import NoteModal from '../components/NoteModal'
import { generateLevel1Data } from '../utils/LevelManager'
import { sound } from '../utils/AudioEngine'

export default function RoomScene({ onGoToLevel2 }) {
  // Generate level codes & golden digits
  const [levelData, setLevelData] = useState(() => generateLevel1Data())
  const [doorsOpen, setDoorsOpen] = useState([false, false, false, false, false])
  const [lives, setLives] = useState(3)
  const [diamonds, setDiamonds] = useState(0)
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0)
  const [foundGoldenDigits, setFoundGoldenDigits] = useState([])

  // 2-MINUTE COUNTDOWN TIMER (120 seconds)
  const [timeLeft, setTimeLeft] = useState(120)
  const isLevelCompletedRef = useRef(false)

  // Modal states
  const [activeKeypadDoor, setActiveKeypadDoor] = useState(null)
  const [activeInspectRoom, setActiveInspectRoom] = useState(null)
  const [nearObject, setNearObject] = useState(null)
  const [jumpTrigger, setJumpTrigger] = useState(0)
  const [respawnTrigger, setRespawnTrigger] = useState(0)

  // Feedback notifications
  const [badgeAwarded, setBadgeAwarded] = useState(false)
  const [badgeInfo, setBadgeInfo] = useState({
    title: 'Badge Awarded',
    subtitle: 'Player won Kikamug\'s "You have completed level 1!" award!',
  })
  const [resetMessage, setResetMessage] = useState('')

  // Print Room 5 correct 3-digit combination on console for debugging
  useEffect(() => {
    if (levelData) {
      console.log(
        '%c🔑 [FINAL ROOM 5] Correct 3-digit combination: ' + levelData.room5SecretCode,
        'background: #d97706; color: #ffffff; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
      )
      console.log('✨ Golden digits discovered across rooms:', levelData.distinctGoldDigits)
      console.log(
        '🚪 Room passcodes (Rooms 1-4):',
        levelData.rooms.filter((r) => r.roomNumber <= 4).map((r) => `Room ${r.roomNumber}: ${r.code}`)
      )
    }
  }, [levelData])

  // Also log whenever Room 5 is active, inspected, or keypad is opened
  useEffect(() => {
    if (currentRoomIndex === 4 || activeKeypadDoor === 4 || activeInspectRoom === 4) {
      console.log(
        '%c[DEBUG ROOM 5 ACTIVE] Secret 3-digit passcode is: ' + levelData.room5SecretCode,
        'background: #16a34a; color: #ffffff; font-size: 15px; font-weight: 900; padding: 4px 10px; border-radius: 4px;'
      )
    }
  }, [currentRoomIndex, activeKeypadDoor, activeInspectRoom, levelData])

  // 2-Minute Countdown Timer Loop
  useEffect(() => {
    if (isLevelCompletedRef.current) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer expired! Trigger reset back to Room 1
          handleTimeExpired()
          return 120
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Full reset helper when lives are lost or time runs out
  const resetBackToRoom1 = (message) => {
    sound.playDoorLocked()
    setActiveKeypadDoor(null)
    setActiveInspectRoom(null)
    setResetMessage(message)
    setLevelData(generateLevel1Data())
    setDoorsOpen([false, false, false, false, false])
    setLives(3)
    setCurrentRoomIndex(0)
    setFoundGoldenDigits([])
    setTimeLeft(120)
    setDiamonds((d) => Math.max(0, d - 100))
    setRespawnTrigger((t) => t + 1)

    setTimeout(() => {
      setResetMessage('')
    }, 4500)
  }

  // Handle 2-minute timer expiry
  const handleTimeExpired = () => {
    resetBackToRoom1('TIME EXPIRED! (2:00 limit). Sent back to Room 1 & codes re-randomized.')
  }

  // Handle opening keypad modal
  const handleInteractKeypad = (doorIndex) => {
    setActiveKeypadDoor(doorIndex)
    sound.playTypewriter()
  }

  // Handle inspecting note
  const handleInspectNote = (roomIndex) => {
    setActiveInspectRoom(roomIndex)
    sound.playTypewriter()

    const room = levelData.rooms[roomIndex]
    if (room && room.isGoldenRoom && room.goldDigit !== null) {
      if (!foundGoldenDigits.includes(room.goldDigit)) {
        setFoundGoldenDigits((prev) => [...prev, room.goldDigit])
      }
    }
  }

  // Handle proximity 'E' press
  const handleControllerInteract = (action) => {
    if (action === 'close') {
      setActiveKeypadDoor(null)
      setActiveInspectRoom(null)
      return
    }

    if (action.startsWith('keypad-')) {
      const idx = parseInt(action.split('-')[1], 10)
      handleInteractKeypad(idx)
      return
    }

    if (action.startsWith('note-')) {
      const idx = parseInt(action.split('-')[1], 10)
      handleInspectNote(idx)
      return
    }
  }

  // Correct passcode entered
  const handleCodeSuccess = (doorIndex) => {
    setDoorsOpen((prev) => {
      const next = [...prev]
      next[doorIndex] = true
      return next
    })

    if (doorIndex < 4) {
      // Room 1 to 4 cleared
      setDiamonds((d) => d + 50)
      setCurrentRoomIndex(doorIndex + 1)
      sound.playDoorUnlock()
    } else {
      // Final Room 5 cleared! LEVEL 1 MASTERED!
      isLevelCompletedRef.current = true
      setDiamonds((d) => d + 250)
      setBadgeInfo({
        title: '★ LEVEL 1 MASTERED! ★',
        subtitle: 'You unlocked the Master Vault and closer to free the Developer! Ready for Level 2?',
      })
      setBadgeAwarded(true)
      sound.playVictory()
    }
  }

  // Wrong guess in Room 5
  const handleWrongGuess = () => {
    setLives((prev) => {
      const newLives = prev - 1
      if (newLives <= 0) {
        // Out of lives!
        setTimeout(() => {
          resetBackToRoom1('OUT OF LIVES (3/3 Lost)! Sent back to Room 1 & codes re-randomized.')
        }, 500)
        return 0
      }
      return newLives
    })
  }

  // Skip current level button
  const handleSkipLevel = () => {
    const nextDoorToOpen = doorsOpen.findIndex((isOpen) => !isOpen)
    if (nextDoorToOpen !== -1) {
      handleCodeSuccess(nextDoorToOpen)
    }
  }

  // Current expected code for active keypad
  const expectedCode =
    activeKeypadDoor === 4
      ? levelData.room5SecretCode
      : activeKeypadDoor !== null
      ? levelData.rooms[activeKeypadDoor]?.code
      : ''

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#f1f5f9] font-sans">
      {/* 3D Canvas rendering the 5 consecutive rooms */}
      <Canvas
        shadows
        camera={{ position: [0, 0.2, 1.5], fov: 75, near: 0.1, far: 80 }}
        className="w-full h-full cursor-crosshair"
      >
        <Suspense fallback={null}>
          <FiveRoomsInterior
            levelData={levelData}
            doorsOpen={doorsOpen}
            onInteractKeypad={handleInteractKeypad}
            onInspectNote={handleInspectNote}
          />
          <RoomController
            isKeypadOpen={activeKeypadDoor !== null}
            isInspectingNote={activeInspectRoom !== null}
            onInteract={handleControllerInteract}
            setNearObject={setNearObject}
            doorsOpen={doorsOpen}
            jumpTrigger={jumpTrigger}
            respawnTrigger={respawnTrigger}
          />
        </Suspense>
      </Canvas>

      {/* Crosshair */}
      {activeKeypadDoor === null && activeInspectRoom === null && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-black/60" />
        </div>
      )}

      {/* Roblox-Style HUD with Topbar, Diamonds, 2-Min Timer, Lives, Room Tracker */}
      <RobloxHUD
        diamonds={diamonds}
        lives={lives}
        timeLeft={timeLeft}
        currentRoomIndex={currentRoomIndex}
        foundGoldenDigits={foundGoldenDigits}
        onSkipLevel={handleSkipLevel}
        badgeAwarded={badgeAwarded}
        badgeTitle={badgeInfo.title}
        badgeSubtitle={badgeInfo.subtitle}
        resetMessage={resetMessage}
        onJump={() => setJumpTrigger((t) => t + 1)}
        onGoToLevel2={onGoToLevel2}
      />

      {/* Proximity Interaction Prompt */}
      {nearObject && activeKeypadDoor === null && activeInspectRoom === null && (
        <div className="pointer-events-none absolute bottom-20 inset-x-0 flex justify-center z-30">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/85 border-2 border-white shadow-xl text-white text-sm font-bold backdrop-blur animate-bounce">
            <kbd className="px-2 py-0.5 rounded bg-[#00a2ff] border border-white text-white font-extrabold text-xs">
              E
            </kbd>
            <span>
              {nearObject.id.startsWith('keypad')
                ? `Type on ${nearObject.name}`
                : `Inspect ${nearObject.name}`}
            </span>
          </div>
        </div>
      )}

      {/* Roblox Keypad Modal (Instant mouse interaction + keyboard typing) */}
      <RobloxKeypadModal
        isOpen={activeKeypadDoor !== null}
        currentDoorIndex={activeKeypadDoor ?? 0}
        expectedCode={expectedCode}
        lives={lives}
        onClose={() => setActiveKeypadDoor(null)}
        onCodeSuccess={handleCodeSuccess}
        onWrongGuess={handleWrongGuess}
      />

      {/* Note / Clue Inspection Modal */}
      <NoteModal
        isOpen={activeInspectRoom !== null}
        roomData={activeInspectRoom !== null ? levelData.rooms[activeInspectRoom] : null}
        onClose={() => setActiveInspectRoom(null)}
      />
    </div>
  )
}
