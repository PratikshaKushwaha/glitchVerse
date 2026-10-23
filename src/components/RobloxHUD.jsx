import { useState } from 'react'

export default function RobloxHUD({
  diamonds = 0,
  onSkipLevel,
  badgeAwarded = false,
  onJump,
}) {
  const [showShop, setShowShop] = useState(false)
  const [showPet, setShowPet] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="pointer-events-none fixed inset-0 z-40 select-none font-sans overflow-hidden">
      {/* ================= 1. ROBLOX TOPBAR ================= */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-auto">
        {/* Roblox Logo Circle Button */}
        <button
          className="h-10 w-10 rounded-full bg-black/75 hover:bg-black/90 border border-white/20 flex items-center justify-center shadow-lg cursor-pointer transition active:scale-95"
          title="Roblox Menu"
        >
          {/* Tilted Roblox Square Icon */}
          <div className="h-5 w-5 bg-white rounded-[4px] rotate-12 flex items-center justify-center shadow-inner">
            <div className="h-2 w-2 bg-black/80 rounded-[2px]" />
          </div>
        </button>

        {/* Menu Pill: Hamburger, Chat, Audio */}
        <div className="h-10 px-3 rounded-full bg-black/75 border border-white/20 flex items-center gap-3.5 shadow-lg text-white">
          <button
            className="hover:text-cyan-300 cursor-pointer text-base transition"
            title="Menu"
          >
            ☰
          </button>
          <div className="h-4 w-px bg-white/20" />
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="relative hover:text-cyan-300 cursor-pointer transition"
            title="Chat"
          >
            <span className="text-base">💬</span>
            <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 rounded-full bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center border border-white">
              2
            </span>
          </button>
          <div className="h-4 w-px bg-white/20" />
          <button
            className="hover:text-cyan-300 cursor-pointer text-sm transition"
            title="Voice"
          >
            🎧
          </button>
        </div>
      </div>

      {/* ================= 2. LEFT SIDE WIDGETS ================= */}
      <div className="absolute left-4 top-28 flex flex-col items-start gap-2.5 pointer-events-auto">
        {/* Diamond Currency Pill */}
        <div className="flex items-center">
          <div className="relative -mr-3 z-10 filter drop-shadow-md">
            {/* 3D Shiny Diamond SVG */}
            <svg
              className="h-11 w-11 drop-shadow-[0_2px_6px_rgba(56,189,248,0.7)]"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 6L24 2L34 6L44 18L24 46L4 18L14 6Z"
                fill="#38BDF8"
              />
              <path
                d="M14 6L24 2V46L4 18L14 6Z"
                fill="#7DD3FC"
              />
              <path
                d="M14 6H34L44 18H4L14 6Z"
                fill="#BAE6FD"
                opacity="0.9"
              />
              <path
                d="M24 2L14 6L4 18H24V2Z"
                fill="#E0F2FE"
                opacity="0.8"
              />
              <path
                d="M24 18L44 18L24 46V18Z"
                fill="#0284C7"
                opacity="0.7"
              />
            </svg>
          </div>

          <div className="h-9 min-w-28 pl-4 pr-5 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center">
            <span className="font-extrabold text-lg text-[#0084ff] tracking-tight">
              {diamonds}
            </span>
          </div>
        </div>

        {/* Action Buttons: Shop & Pet */}
        <div className="flex items-center gap-2">
          {/* Shop Button */}
          <button
            onClick={() => setShowShop(true)}
            className="h-12 w-12 rounded-xl bg-[#00a2ff] hover:bg-[#0090e3] border-[2.5px] border-white shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex items-center justify-center text-white cursor-pointer transition active:scale-95"
            title="Shop"
          >
            {/* Shop SVG */}
            <svg
              className="h-7 w-7 fill-white"
              viewBox="0 0 24 24"
            >
              <path d="M4 4h16l1 5H3L4 4zm-1 7h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9zm6 2a3 3 0 0 0 6 0H9z" />
            </svg>
          </button>

          {/* Pet Button */}
          <button
            onClick={() => setShowPet(true)}
            className="h-12 w-12 rounded-xl bg-[#00a2ff] hover:bg-[#0090e3] border-[2.5px] border-white shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex items-center justify-center text-white cursor-pointer transition active:scale-95"
            title="Pets"
          >
            {/* Paw Print SVG */}
            <svg
              className="h-7 w-7 fill-white"
              viewBox="0 0 24 24"
            >
              <path d="M12 11c-2.2 0-4 1.8-4 4 0 1.5 1 2.8 2.3 3.5.5.3 1.1.5 1.7.5s1.2-.2 1.7-.5c1.3-.7 2.3-2 2.3-3.5 0-2.2-1.8-4-4-4zm-6-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm12 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-8.5-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm5 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
            </svg>
          </button>
        </div>

        {/* Skip Level Button */}
        <button
          onClick={onSkipLevel}
          className="px-4 py-1.5 rounded-full bg-[#22c55e] hover:bg-[#16a34a] border-[2.5px] border-white shadow-[0_4px_10px_rgba(0,0,0,0.25)] text-white font-extrabold text-sm tracking-wide cursor-pointer transition active:scale-95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
        >
          Skip Level
        </button>
      </div>

      {/* ================= 3. BOTTOM-RIGHT JUMP BUTTON ================= */}
      <div className="absolute right-6 bottom-6 pointer-events-auto">
        <button
          onClick={onJump}
          className="h-16 w-16 rounded-full bg-black/45 hover:bg-black/60 border-2 border-white/40 backdrop-blur shadow-2xl flex items-center justify-center text-white text-2xl cursor-pointer active:scale-90 transition"
          title="Jump (Space)"
        >
          ▲
        </button>
      </div>

      {/* ================= 4. BADGE AWARDED NOTIFICATION ================= */}
      {badgeAwarded && (
        <div className="absolute bottom-6 right-24 pointer-events-auto animate-bounce">
          <div className="flex items-center gap-3.5 px-5 py-3 rounded-xl bg-[#1e2024]/95 border border-white/20 shadow-2xl text-white max-w-sm backdrop-blur">
            {/* Gold Ribbon Medal Icon */}
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 flex items-center justify-center shadow-lg shrink-0">
              <div className="h-full w-full rounded-full bg-[#1e2024] flex items-center justify-center text-xl text-yellow-400">
                🏅
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 uppercase tracking-wider">
                <span>Badge Awarded</span>
              </div>
              <p className="text-xs text-gray-200 leading-tight mt-0.5">
                Player won Kikamug&apos;s &ldquo;You have completed level 1!&rdquo; award!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Bubble Popup if clicked */}
      {chatOpen && (
        <div className="absolute top-16 left-3 w-72 rounded-xl bg-black/85 border border-white/20 p-3 text-xs text-white backdrop-blur shadow-2xl pointer-events-auto">
          <div className="font-bold text-cyan-300 pb-1 border-b border-white/10 mb-2">
            [Game Chat]
          </div>
          <p className="text-gray-300">
            <span className="font-bold text-yellow-300">System: </span>
            Search the wooden table for the 4-digit code!
          </p>
          <p className="text-gray-300 mt-1">
            <span className="font-bold text-emerald-300">Developer: </span>
            Enter the code into the wall keypad to unlock the next room!
          </p>
        </div>
      )}

      {/* Shop Modal */}
      {showShop && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto p-4"
          onClick={() => setShowShop(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-extrabold text-lg text-[#00a2ff]">
                🛒 ESCAPE SHOP
              </h3>
              <button
                onClick={() => setShowShop(false)}
                className="text-gray-400 hover:text-black font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                <span className="font-bold text-sm">Flashlight Glow</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#00a2ff] text-white">
                  FREE
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                <span className="font-bold text-sm">Speed Coil</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#22c55e] text-white">
                  EQUIPPED
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowShop(false)}
              className="w-full py-2.5 rounded-xl bg-[#00a2ff] text-white font-bold cursor-pointer hover:bg-[#0090e3]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Pet Modal */}
      {showPet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto p-4"
          onClick={() => setShowPet(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-extrabold text-lg text-[#00a2ff]">
                🐾 PETS INVENTORY
              </h3>
              <button
                onClick={() => setShowPet(false)}
                className="text-gray-400 hover:text-black font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <p className="py-6 text-center text-sm text-gray-500">
              Clear Room 1 to hatch your first escape companion pet!
            </p>
            <button
              onClick={() => setShowPet(false)}
              className="w-full py-2.5 rounded-xl bg-[#00a2ff] text-white font-bold cursor-pointer hover:bg-[#0090e3]"
            >
              Awesome
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
