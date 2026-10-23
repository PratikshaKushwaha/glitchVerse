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

  if (!isOpen || !roomData) return null

  // Special Master Status Terminal Modal for Room 5
  if (roomData.isRoom5) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none font-sans"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md rounded-2xl bg-[#090d16] p-6 shadow-2xl border-2 border-yellow-400/80 flex flex-col items-center cursor-default pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold text-sm cursor-pointer"
          >
            ✕
          </button>

          <span className="text-[11px] uppercase tracking-widest text-yellow-400 font-mono font-bold mb-2">
            ★ FINAL ROOM 5: MASTER CIPHER STATUS ★
          </span>

          <div className="w-full py-5 px-4 bg-black/60 border border-yellow-500/40 rounded-xl flex flex-col items-center justify-center my-2 font-mono">
            <span className="text-xs text-yellow-200/80 uppercase tracking-widest mb-3">
              COLLECTED GOLDEN DIGIT KEYS:
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

            <p className="text-xs text-amber-200/90 text-center mt-4 leading-relaxed">
              Order matters! There are <span className="font-bold text-white">3! = 6</span> possible combinations.
              Enter your guess on the door keypad lock.
            </p>
          </div>

          <div className="w-full mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
            <span className="text-xs font-semibold text-yellow-300 block">
              💡 Debug Note: Correct permutation printed to browser console!
            </span>
          </div>

          <button
            onClick={onClose}
            className="mt-4 px-8 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md active:scale-95 transition"
          >
            Close Console [E]
          </button>
        </div>
      </div>
    )
  }

  const isGolden = roomData.isGoldenRoom && roomData.goldDigit !== null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-[#fffdf7] p-6 shadow-2xl border-4 border-[#e2d9c8] flex flex-col items-center rotate-[-1.5deg] cursor-default pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black font-bold text-sm cursor-pointer"
        >
          ✕
        </button>

        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
          ROOM {roomData.roomNumber} CIPHER NOTE
        </span>

        {/* Paper Note with Code */}
        <div className="w-full py-6 bg-white border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center shadow-inner my-2">
          {/* Digits Display */}
          <div className="flex items-center gap-2">
            {roomData.digits.map((digit, idx) => {
              const isThisDigitGold = isGolden && idx === roomData.goldDigitPos
              return (
                <div
                  key={idx}
                  className={`h-14 w-12 rounded-lg flex items-center justify-center font-mono font-extrabold text-3xl shadow-sm ${
                    isThisDigitGold
                      ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-black border-2 border-amber-600 ring-4 ring-yellow-300/50 scale-110 animate-pulse'
                      : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}
                >
                  {digit}
                </div>
              )
            })}
          </div>

          <span className="text-[11px] text-gray-400 mt-3 font-medium">
            Door Passcode: <span className="font-bold text-gray-700">{roomData.code}</span>
          </span>
        </div>

        {/* Golden Digit Alert Banner */}
        {isGolden ? (
          <div className="w-full mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border-2 border-yellow-500 text-center">
            <span className="text-xs font-black text-amber-700 uppercase tracking-wider block">
              ★ GOLDEN DIGIT FOUND: [ {roomData.goldDigit} ] ★
            </span>
            <span className="text-[11px] text-amber-900 font-semibold mt-0.5 block">
              Remember this digit! It is 1 of the 3 keys needed for Room 5!
            </span>
          </div>
        ) : (
          <div className="w-full mt-2 p-2 rounded-xl bg-gray-100 border border-gray-200 text-center text-[11px] text-gray-500">
            No golden digit in this room. Use this code to unlock the door!
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-8 py-2.5 rounded-xl bg-[#00a2ff] hover:bg-[#0090e3] text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md active:scale-95 transition"
        >
          Got it [E]
        </button>
      </div>
    </div>
  )
}
