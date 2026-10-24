import { useState, useEffect } from 'react'
import { sound } from '../utils/AudioEngine'

export default function RobloxKeypadModal({
  isOpen,
  currentDoorIndex, // 0 to 4
  expectedCode,     // 4 digits for rooms 1-4, 3 digits for room 5
  lives = 3,
  onClose,
  onCodeSuccess,
  onWrongGuess,
}) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const isFinalRoom = currentDoorIndex === 4
  const codeLength = isFinalRoom ? 3 : 4

  // Release pointer lock immediately when keypad opens so mouse clicks work instantly!
  useEffect(() => {
    if (isOpen) {
      if (document.pointerLockElement) {
        document.exitPointerLock()
      }
      setCode('')
      setStatus('')
      setIsSuccess(false)
    }
  }, [isOpen])

  const verifyCode = (codeToVerify) => {
    const isMatch = Array.isArray(expectedCode)
      ? expectedCode.includes(codeToVerify)
      : codeToVerify === expectedCode

    if (isMatch) {
      sound.playDoorUnlock()
      setIsSuccess(true)
      setStatus('ACCESS GRANTED!')
      setTimeout(() => {
        onCodeSuccess(currentDoorIndex)
        onClose()
      }, 700)
    } else {
      sound.playDoorLocked()
      setCode('')

      if (isFinalRoom) {
        const remainingLivesAfter = lives - 1
        if (remainingLivesAfter <= 0) {
          setStatus('SHIELDS DEPLETED — REBOOTING...')
          onWrongGuess && onWrongGuess()
          setTimeout(() => {
            onClose()
          }, 650)
        } else {
          setStatus(`INVALID ORDER! ${remainingLivesAfter} ATTEMPTS LEFT`)
          onWrongGuess && onWrongGuess()
        }
      } else {
        setStatus('INVALID CIPHER CODE')
      }
    }
  }

  const handlePress = (val) => {
    if (isSuccess) return
    sound.playTypewriter()
    setStatus('')

    if (val === '✖') {
      setCode('')
      return
    }

    if (val === '✔') {
      if (code.length === codeLength) {
        verifyCode(code)
      } else {
        setStatus(`ENTER ${codeLength} DIGITS`)
      }
      return
    }

    if (code.length < codeLength) {
      const nextCode = code + val
      setCode(nextCode)

      // Automatic verification when full length reached
      if (nextCode.length === codeLength) {
        setTimeout(() => {
          verifyCode(nextCode)
        }, 150)
      }
    }
  }

  // Keyboard number keys support
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePress(e.key)
      } else if (e.key === 'Enter') {
        handlePress('✔')
      } else if (e.key === 'Backspace') {
        handlePress('✖')
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, code, expectedCode, lives])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="keypad-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-[2px] p-4 select-none font-sans"
      style={{ overscrollBehavior: 'contain' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[290px] rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-gray-200 flex flex-col items-center cursor-default pointer-events-auto"
        style={{ overscrollBehavior: 'contain' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <span
              id="keypad-modal-title"
              className="text-xs font-black text-gray-700 uppercase tracking-wider font-mono"
            >
              {isFinalRoom ? 'CORE VAULT LOCK' : `SECTOR 0${currentDoorIndex + 1} DOOR LOCK`}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close keypad lock"
            className="text-gray-400 hover:text-black font-bold p-1 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Lives Indicator for Final Room */}
        {isFinalRoom && (
          <div className="w-full mb-2 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs">
            <span className="font-bold text-red-600 font-mono">ATTEMPTS:</span>
            <div className="flex items-center gap-1.5" aria-label={`${lives} lives remaining`}>
              {[1, 2, 3].map((heartIndex) => (
                <svg
                  key={heartIndex}
                  className={`w-4 h-4 transition-all ${
                    heartIndex <= lives
                      ? 'fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                      : 'fill-gray-300'
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              ))}
            </div>
          </div>
        )}

        {/* Digital Screen at Top */}
        <div className="w-full h-14 rounded-xl bg-[#0f172a] border-2 border-gray-300 flex items-center justify-center shadow-inner mb-3 px-3">
          {isSuccess ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-base tracking-wider font-mono">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <span>{isFinalRoom ? 'VAULT BREACHED' : 'AUTHORIZED'}</span>
            </span>
          ) : status ? (
            <span className="text-red-400 font-bold text-xs text-center animate-pulse font-mono">
              {status}
            </span>
          ) : (
            <span className="text-white font-mono font-extrabold text-2xl tracking-[0.35em]">
              {code.padEnd(codeLength, '·')}
            </span>
          )}
        </div>

        {/* 3x4 Button Grid (Roblox escape room layout) */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['✔', '0', '✖'],
          ].map((row) =>
            row.map((btn) => {
              const isGreen = btn === '✔'
              const isRed = btn === '✖'
              return (
                <button
                  type="button"
                  key={btn}
                  onClick={() => handlePress(btn)}
                  aria-label={isGreen ? 'Submit code' : isRed ? 'Clear code' : `Digit ${btn}`}
                  className={`h-12 rounded-xl font-extrabold text-lg flex items-center justify-center cursor-pointer transition active:scale-95 shadow-md border ${
                    isGreen
                      ? 'bg-[#22c55e] hover:bg-[#16a34a] border-green-600 text-white shadow-green-200 text-xl'
                      : isRed
                      ? 'bg-[#ef4444] hover:bg-[#dc2626] border-red-600 text-white shadow-red-200 text-xl'
                      : 'bg-[#0f172a] hover:bg-[#1e293b] border-gray-700 text-white'
                  }`}
                >
                  {isGreen ? (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  ) : isRed ? (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  ) : (
                    btn
                  )}
                </button>
              )
            })
          )}
        </div>

        <p className="text-[11px] text-gray-500 font-medium mt-3 text-center">
          {isFinalRoom
            ? 'Input the 3 recovered golden digits in the exact order.'
            : 'Click keypad buttons or type directly via numeric keys.'}
        </p>
      </div>
    </div>
  )
}
