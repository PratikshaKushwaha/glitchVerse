export default function NoteModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs rounded-2xl bg-[#fffdf7] p-6 shadow-2xl border-4 border-[#e2d9c8] flex flex-col items-center rotate-[-2deg] transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black font-bold text-sm cursor-pointer"
        >
          ✕
        </button>

        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
          SCRAP PAPER FOUND ON TABLE
        </span>

        {/* Paper Note with Code */}
        <div className="w-full py-6 bg-white border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center shadow-inner my-2">
          <span className="text-4xl font-mono font-extrabold tracking-[0.25em] text-[#1e293b]">
            6845
          </span>
          <span className="text-[11px] text-gray-400 mt-2 font-medium">
            (Door Code)
          </span>
        </div>

        <button
          onClick={onClose}
          className="mt-3 px-6 py-2 rounded-xl bg-[#00a2ff] hover:bg-[#0090e3] text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
        >
          Got it [E]
        </button>
      </div>
    </div>
  )
}
