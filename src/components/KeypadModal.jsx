import { useState } from 'react'
import { sound } from '../utils/AudioEngine'

export default function KeypadModal({
  isOpen,
  onClose,
  onCodeSuccess,
  clueDiscovered,
}) {
  const [code, setCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handlePress = (val) => {
    sound.playTypewriter()
    setErrorMsg('')

    if (val === 'C') {
      setCode('')
      return
    }

    if (val === 'ENTER') {
      if (code === '482') {
        sound.playDoorUnlock()
        setIsSuccess(true)
        setTimeout(() => {
          onCodeSuccess()
          onClose()
        }, 1200)
      } else {
        sound.playDoorLocked()
        setErrorMsg('INVALID PASSCODE')
        setCode('')
      }
      return
    }

    if (code.length < 3) {
      setCode((prev) => prev + val)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-cyan-500/50 bg-[#07131b] p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col items-center font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full border-b border-cyan-500/30 pb-3 mb-4">
          <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
            BLAST DOOR SECURITY TERMINAL
          </span>
          <button
            onClick={onClose}
            className="text-cyan-400/60 hover:text-cyan-200 cursor-pointer p-1"
          >
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Display Screen */}
        <div className="w-full h-14 rounded bg-cyan-950/70 border border-cyan-500/60 flex items-center justify-center text-2xl tracking-[0.5em] text-cyan-200 font-bold shadow-inner">
          {isSuccess ? (
            <span className="text-emerald-400 tracking-normal text-sm font-bold">
              [ACCESS GRANTED]
            </span>
          ) : (
            code.padEnd(3, '·')
          )}
        </div>

        <p className="min-h-5 text-xs text-red-400 mt-2 font-bold">{errorMsg}</p>

        {/* Clue Hint badge if player found the clue */}
        {clueDiscovered && (
          <div className="w-full mb-3 p-2 rounded bg-yellow-950/40 border border-yellow-500/40 text-[11px] text-yellow-300 flex items-center justify-between">
            <span>Discovered Cipher:</span>
            <span className="font-bold tracking-widest text-yellow-200 text-sm">[482]</span>
            <button
              onClick={() => setCode('482')}
              className="px-2 py-0.5 rounded bg-yellow-500 text-black text-[10px] font-bold cursor-pointer hover:bg-yellow-400"
            >
              Fill
            </button>
          </div>
        )}

        {/* Buttons Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full mt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'ENTER'].map(
            (btn) => (
              <button
                key={btn}
                onClick={() => handlePress(btn)}
                className={`h-12 rounded font-mono font-bold transition cursor-pointer active:scale-95 border ${
                  btn === 'ENTER'
                    ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] text-xs tracking-wider'
                    : btn === 'C'
                    ? 'bg-red-900/60 hover:bg-red-800 border-red-500/50 text-red-200 text-sm'
                    : 'bg-cyan-950 hover:bg-cyan-900 border-cyan-500/40 text-cyan-200 text-base'
                }`}
              >
                {btn}
              </button>
            )
          )}
        </div>

        <p className="text-[11px] text-cyan-400/60 mt-4">
          Press [E] or [Esc] to cancel
        </p>
      </div>
    </div>
  )
}
