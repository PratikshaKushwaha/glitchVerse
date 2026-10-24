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
            className="text-gray-400 hover:text-black font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Lives Indicator for Final Room */}
        {isFinalRoom && (
          <div className="w-full mb-2 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs">
            <span className="font-bold text-red-600 font-mono">ATTEMPTS:</span>
            <span className="text-base tracking-widest" aria-label={`${lives} lives remaining`}>
              {'❤️'.repeat(Math.max(0, lives))}
              {'🖤'.repeat(Math.max(0, 3 - lives))}
            </span>
          </div>
        )}

        {/* Digital Screen at Top */}
        <div className="w-full h-14 rounded-xl bg-[#0f172a] border-2 border-gray-300 flex items-center justify-center shadow-inner mb-3 px-3">
          {isSuccess ? (
            <span className="text-emerald-400 font-extrabold text-base tracking-wider font-mono">
              ✔ {isFinalRoom ? 'VAULT BREACHED' : 'AUTHORIZED'}
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
                  {btn}
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
