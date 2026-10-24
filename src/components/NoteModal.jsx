import { useEffect } from 'react'

export default function NoteModal({ isOpen, roomData, onClose }) {
  // Exit pointer lock immediately when inspection opens so mouse is free
  useEffect(() => {
    if (isOpen) {
      if (document.pointerLockElement) {
        document.exitPointerLock()
      }
    }
  }, [isOpen])

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'KeyE') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !roomData) return null

  // Special Master Status Terminal Modal for Room 5
  if (roomData.isRoom5) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room5-terminal-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none font-sans"
        style={{ overscrollBehavior: 'contain' }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md rounded-2xl bg-[#090d16] p-6 shadow-2xl border-2 border-yellow-400/80 flex flex-col items-center cursor-default pointer-events-auto"
          style={{ overscrollBehavior: 'contain' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cipher terminal"
            className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold text-sm cursor-pointer"
          >
            ✕
          </button>

          <span
            id="room5-terminal-title"
            className="text-[11px] uppercase tracking-widest text-yellow-400 font-mono font-bold mb-2"
          >
            CORE CIPHER TERMINAL — SECTOR 05
          </span>

          <div className="w-full py-5 px-4 bg-black/60 border border-yellow-500/40 rounded-xl flex flex-col items-center justify-center my-2 font-mono">
            <span className="text-xs text-yellow-200/80 uppercase tracking-widest mb-3">
              RECOVERED GOLDEN DIGIT KEYS:
            </span>
            <div className="flex items-center gap-3">
              {roomData.digits.map((digit, idx) => (
                <div
                  key={idx}
                  className="h-14 w-14 rounded-xl bg-gradient-to-b from-amber-400 to-yellow-600 text-black border-2 border-amber-300 font-extrabold text-3xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                >
                  {digit}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-yellow-950/60 border border-yellow-500/40 text-center w-full">
              <span className="text-xs text-yellow-300 font-bold block">
                🔑 VAULT KEY COMBINATION: [{roomData.digits.join('')}]
              </span>
              <p className="text-[11px] text-gray-300 mt-1">
                Enter the 3 golden digits on the door keypad lock in the order discovered: <strong className="text-white">{roomData.digits.join('')}</strong>
              </p>
            </div>
          </div>

          <div className="w-full mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
            <span className="text-xs font-mono text-yellow-300 block">
              OPERATOR LOG: Target sequence verified in developer telemetry console.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 px-8 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md active:scale-95 transition"
          >
            Close Terminal [E]
          </button>
        </div>
      </div>
    )
  }

  const isGolden = roomData.isGoldenRoom && roomData.goldDigit !== null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`note-room-${roomData.roomNumber}-title`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 select-none font-sans"
      style={{ overscrollBehavior: 'contain' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-[#fffdf7] p-6 shadow-2xl border-4 border-[#e2d9c8] flex flex-col items-center rotate-[-1.5deg] cursor-default pointer-events-auto"
        style={{ overscrollBehavior: 'contain' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close parchment note"
          className="absolute top-3 right-3 text-gray-400 hover:text-black font-bold text-sm cursor-pointer"
        >
          ✕
        </button>

        <span
          id={`note-room-${roomData.roomNumber}-title`}
          className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 font-mono"
        >
          ROOM {roomData.roomNumber} MANUSCRIPT FRAGMENT
        </span>

        {/* Paper Note with Code */}
        <div className="w-full py-6 bg-white border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center shadow-inner my-2">
          {/* Digits Display */}
          <div className="flex items-center gap-2">
            {roomData.code.split('').map((char, index) => {
              const isGlowingGold =
                isGolden &&
                (index === roomData.goldDigitPos ||
                  index === roomData.goldIndex ||
                  char === String(roomData.goldDigit))

              return (
                <div
                  key={index}
                  className={`h-14 w-12 rounded-lg font-mono font-black text-2xl flex items-center justify-center transition-all ${
                    isGlowingGold
                      ? 'bg-amber-400 text-black border-2 border-yellow-500 scale-110 shadow-[0_0_25px_#f59e0b] animate-pulse ring-2 ring-yellow-300 font-black'
                      : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}
                >
                  {char}
                </div>
              )
            })}
          </div>

          {/* Hint Label */}
          {isGolden ? (
            <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 rounded-full text-[11px] font-bold text-amber-900 shadow-sm">
              <span>✨</span>
              <span>GOLD KEY DIGIT: [{roomData.goldDigit}]</span>
            </div>
          ) : (
            <span className="text-[10px] text-gray-400 font-mono mt-3 uppercase tracking-wider">
              Door Passcode
            </span>
          )}
        </div>

        {/* Instructions */}
        <p className="text-xs text-gray-600 text-center mt-2 leading-relaxed">
          {isGolden ? (
            <>
              Memorize the <strong className="text-amber-700">glowing golden digit</strong>! It is required for the final vault in Room 5.
            </>
          ) : (
            'Input this passcode on the door keypad lock to open the corridor.'
          )}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 px-6 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition"
        >
          Fold Note [E]
        </button>
      </div>
    </div>
  )
}
