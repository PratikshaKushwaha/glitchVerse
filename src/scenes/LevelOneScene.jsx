import { useState, useEffect } from 'react'
import { sound } from '../utils/AudioEngine'

export default function LevelOneScene({ onReturnToHub }) {
  // Level 1 Gameplay state
  const [currentRoom, setCurrentRoom] = useState(1)
  const [glitchVisionActive, setGlitchVisionActive] = useState(false)
  const [glitchEnergy, setGlitchEnergy] = useState(100)
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(1000)
  const [timer, setTimer] = useState(0)
  const [enteredCode, setEnteredCode] = useState('')
  const [lockStatus, setLockStatus] = useState('ENTER 3-DIGIT PASSCODE')
  const [discoveredClue, setDiscoveredClue] = useState(false)

  // Room puzzle codes
  const roomCodes = {
    1: '482',
    2: '719',
    3: '356',
    4: '924',
    5: '618',
    6: '275',
    7: '831',
    8: '473',
  }

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Glitch vision key listener (Hold Q)
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

  // Drain / recharge glitch vision energy
  useEffect(() => {
    const interval = setInterval(() => {
      if (glitchVisionActive) {
        setGlitchEnergy((prev) => {
          if (prev <= 5) {
            setGlitchVisionActive(false)
            return 0
          }
          return prev - 5
        })
      } else {
        setGlitchEnergy((prev) => Math.min(100, prev + 2))
      }
    }, 100)
    return () => clearInterval(interval)
  }, [glitchVisionActive])

  // Keypad submit
  const handleKeypadPress = (val) => {
    sound.playTypewriter()
    if (val === 'C') {
      setEnteredCode('')
      setLockStatus('ENTER 3-DIGIT PASSCODE')
      return
    }

    if (val === 'E') {
      // Enter
      if (enteredCode === roomCodes[currentRoom]) {
        sound.playDoorUnlock()
        setLockStatus('ACCESS GRANTED! ADVANCING...')
        setScore((s) => s + 250)
        setTimeout(() => {
          if (currentRoom < 8) {
            setCurrentRoom((r) => r + 1)
            setEnteredCode('')
            setLockStatus('ENTER 3-DIGIT PASSCODE')
            setDiscoveredClue(false)
          } else {
            setLockStatus('SECTOR 1 CLEARED! THE WAY OUT IS OPENING!')
          }
        }, 1200)
      } else {
        sound.playDoorLocked()
        setLives((l) => Math.max(0, l - 1))
        setScore((s) => Math.max(0, s - 100))
        setLockStatus('ACCESS DENIED! WRONG PASSCODE')
        setEnteredCode('')
      }
      return
    }

    if (enteredCode.length < 3) {
      setEnteredCode((prev) => prev + val)
    }
  }

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden flex flex-col justify-between transition-colors duration-300 font-mono select-none ${
        glitchVisionActive
          ? 'bg-[#e0e3ec] text-cyan-300 contrast-125'
          : 'bg-[#b5c8d6] text-[#e2e8f0]'
      }`}
    >
      {/* Glitch Vision CRT Scanline Overlay */}
      {glitchVisionActive && (
        <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15)_0%,rgba(0,0,0,0.6)_100%)]">
          <div className="absolute inset-0 bg-repeat bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:100%_4px]" />
        </div>
      )}

      {/* Top HUD Bar */}
      <header className="relative z-30 flex items-center justify-between border-b border-cyan-500/30 bg-black/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-400/70 tracking-widest uppercase">
              Current Sector
            </span>
            <span className="text-base font-bold text-cyan-300">
              LEVEL 1: ROOM {currentRoom}/8
            </span>
          </div>

          <div className="h-8 w-px bg-cyan-500/20" />

          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-400/70 tracking-widest uppercase">
              Glitch Vision (Hold Q)
            </span>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-28 rounded-full bg-cyan-950 border border-cyan-500/40 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-150"
                  style={{ width: `${glitchEnergy}%` }}
                />
              </div>
              <span className="text-xs text-cyan-300">{glitchEnergy}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-cyan-400/70 tracking-widest uppercase">
              Lives
            </span>
            <div className="flex items-center gap-1 mt-1">
              {lives > 0 ? (
                [1, 2, 3].map((heartIndex) => (
                  <svg
                    key={heartIndex}
                    className={`w-4 h-4 ${
                      heartIndex <= lives
                        ? 'fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                        : 'fill-gray-600'
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ))
              ) : (
                <span className="text-red-400 font-bold text-xs font-mono">[TERMINATED]</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-cyan-400/70 tracking-widest uppercase">
              Time
            </span>
            <span className="text-base text-yellow-300 font-bold">
              {formatTimer(timer)}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-cyan-400/70 tracking-widest uppercase">
              Score
            </span>
            <span className="text-base text-emerald-400 font-bold">
              {score}
            </span>
          </div>

          <button
            onClick={onReturnToHub}
            className="px-4 py-1.5 text-xs uppercase tracking-wider bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/40 rounded text-cyan-200 cursor-pointer transition"
          >
            ← Return to Hub
          </button>
        </div>
      </header>

      {/* Main Gameplay Room & Keypad Area */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-around p-8 gap-8">
        {/* Left: Atmospheric Room Investigation View */}
        <div className="relative w-full max-w-xl h-80 rounded-xl border border-cyan-500/30 bg-black/60 p-6 flex flex-col justify-between overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-cyan-400 tracking-wider">
                ROOM {currentRoom}: THE ABANDONED COMPLEX
              </span>
              <span className="text-xs text-emerald-400">
                {glitchVisionActive ? '[GLITCH SCANNER ENGAGED]' : 'STANDARD VIEW'}
              </span>
            </div>
            <p className="mt-3 text-sm text-cyan-100/80 leading-relaxed">
              Flickering fluorescent lights illuminate a long corridor lined with
              scrambled storage lockers and fractured terminal screens.
              A heavy titanium security blast door blocks passage forward.
            </p>
          </div>

          {/* Glitch Clue Discovery Box */}
          <div
            className={`p-4 rounded-lg border transition-all duration-300 ${
              glitchVisionActive
                ? 'border-yellow-400/70 bg-yellow-950/30 text-yellow-200'
                : 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300/60'
            }`}
          >
            {glitchVisionActive ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest">
                    [GLITCH RESONANCE DETECTED]
                  </p>
                  <p className="text-sm mt-1">
                    Hidden UV cipher carved behind the panel:{' '}
                    <span className="text-lg font-bold text-yellow-400 tracking-widest ml-2">
                      [{roomCodes[currentRoom]}]
                    </span>
                  </p>
                </div>
                <button
                  className="px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded cursor-pointer hover:bg-amber-400"
                  onClick={() => {
                    handleCodeSuccess(currentRoom)
                  }}
                >
                  Skip Room ➔
                </button>
              </div>
            ) : (
              <div className="text-xs flex items-center justify-between">
                <span>Hold [Q] or click below to activate Glitch Vision to reveal hidden codes...</span>
                <button
                  className="px-3 py-1 bg-cyan-700/60 hover:bg-cyan-600 text-cyan-100 text-xs rounded cursor-pointer"
                  onClick={() => setGlitchVisionActive(true)}
                >
                  Hold Q (Toggle)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Interactive Roblox Escape-Room Style Keypad */}
        <div className="w-full max-w-xs rounded-xl border border-cyan-500/50 bg-[#07131b] p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col items-center">
          <div className="w-full border-b border-cyan-500/30 pb-3 mb-4 text-center">
            <span className="text-[10px] text-cyan-400 tracking-widest uppercase">
              SECURITY LOCK MATRIX
            </span>
            <div className="mt-2 h-10 w-full rounded bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center font-mono text-xl tracking-[0.4em] text-cyan-200">
              {enteredCode.padEnd(3, '·')}
            </div>
            <p className="mt-1 text-[11px] text-cyan-400/80">{lockStatus}</p>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'E'].map(
              (btn) => (
                <button
                  key={btn}
                  onClick={() => handleKeypadPress(btn)}
                  className={`h-12 rounded font-mono font-bold text-base transition-all duration-150 cursor-pointer active:scale-95 border ${
                    btn === 'E'
                      ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : btn === 'C'
                      ? 'bg-red-900/60 hover:bg-red-800 border-red-500/50 text-red-200'
                      : 'bg-cyan-950 hover:bg-cyan-800/80 border-cyan-500/40 text-cyan-200'
                  }`}
                >
                  {btn === 'E' ? 'ENTER' : btn}
                </button>
              )
            )}
          </div>
        </div>
      </main>

      {/* Trapped Developer Radio Transmission Bar */}
      <footer className="relative z-30 border-t border-cyan-500/30 bg-black/90 p-4 flex items-center justify-between text-xs text-cyan-300/80">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-bold text-cyan-400">DEVELOPER RADIO:</span>
          <span>
            "You passed through the teleport doorway! Remember: in 3 of these
            rooms, one digit will be golden. Memorize them for Room 8!"
          </span>
        </div>
        <span className="text-[11px] text-cyan-500">GLITCH PROTOCOL 1.0</span>
      </footer>
    </div>
  )
}
