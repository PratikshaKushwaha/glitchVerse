import { useState } from 'react'
import { sound } from '../utils/AudioEngine'

export default function RobloxKeypadModal({
  isOpen,
  onClose,
  onCodeSuccess,
}) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handlePress = (val) => {
    sound.playTypewriter()
    setStatus('')

    if (val === '✖') {
      // Clear
      setCode('')
      return
    }

    if (val === '✔') {
      // Submit
      if (code === '6845') {
        sound.playDoorUnlock()
        setIsSuccess(true)
        setStatus('CORRECT!')
        setTimeout(() => {
          onCodeSuccess()
          onClose()
        }, 800)
      } else {
        sound.playDoorLocked()
        setStatus('WRONG CODE!')
        setCode('')
      }
      return
    }

    if (code.length < 4) {
      setCode((prev) => prev + val)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 select-none font-sans"
      onClick={onClose}
    >
      {/* Keypad Container (styled like the white Roblox wall keypad) */}
      <div
        className="w-full max-w-[280px] rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-gray-200 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
            WALL KEYPAD
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Digital Screen at Top */}
        <div className="w-full h-14 rounded-xl bg-[#0f172a] border-2 border-gray-300 flex items-center justify-center shadow-inner mb-3 px-3">
          {isSuccess ? (
            <span className="text-emerald-400 font-extrabold text-base tracking-wider">
              ✔ UNLOCKED
            </span>
          ) : status ? (
            <span className="text-red-400 font-bold text-sm">{status}</span>
          ) : (
            <span className="text-white font-mono font-extrabold text-2xl tracking-[0.35em]">
              {code.padEnd(4, '·')}
            </span>
          )}
        </div>

        {/* 3x4 Button Grid matching screenshot:
            1 2 3
            4 5 6
            7 8 9
            ✔ 0 ✖
        */}
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
                  key={btn}
                  onClick={() => handlePress(btn)}
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

        <p className="text-[11px] text-gray-400 font-medium mt-3">
          Tip: Check the round wooden table!
        </p>
      </div>
    </div>
  )
}
