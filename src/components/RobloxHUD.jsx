import { useState } from 'react'

export default function RobloxHUD({
  playerName = 'Seeker',
  diamonds = 0,
  lives = 3,
  timeLeft = 120, // 2 minutes in seconds
  currentRoomIndex = 0,
  foundGoldenDigits = [],
  onSkipLevel,
  badgeAwarded = false,
  badgeTitle = "Badge Awarded",
  badgeSubtitle = '',
  resetMessage = '',
  onJump,
  onGoToLevel2,
}) {
  const displaySubtitle = badgeSubtitle || `${playerName} won Kikamug's "You have completed level 1!" award!`
  const [showShop, setShowShop] = useState(false)
  const [showPet, setShowPet] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  // Format timer MM:SS
  const mins = Math.floor(Math.max(0, timeLeft) / 60)
  const secs = Math.max(0, timeLeft) % 60
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const isUrgent = timeLeft <= 30
  const isCritical = timeLeft <= 10

  return (
    <div className="pointer-events-none fixed inset-0 z-40 select-none font-sans overflow-hidden">
      {/* ================= 1. ROBLOX TOPBAR ================= */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-auto">
        {/* Roblox Logo Circle Button */}
        <button
          className="h-10 w-10 rounded-full bg-black/75 hover:bg-black/90 border border-white/20 flex items-center justify-center shadow-lg cursor-pointer transition active:scale-95"
          title="Roblox Menu"
        >
          <div className="h-5 w-5 bg-white rounded-[4px] rotate-12 flex items-center justify-center shadow-inner">
            <div className="h-2 w-2 bg-black/80 rounded-[2px]" />
          </div>
        </button>

        {/* Menu Pill: Hamburger, Chat, Voice */}
        <div className="h-10 px-3 rounded-full bg-black/75 border border-white/20 flex items-center gap-3.5 shadow-lg text-white">
          <button className="hover:text-cyan-300 cursor-pointer text-base transition" title="Menu">
            ☰
          </button>
          <div className="h-4 w-px bg-white/20" />
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="relative hover:text-cyan-300 cursor-pointer transition flex items-center justify-center"
            title="Chat"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 rounded-full bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center border border-white">
              2
            </span>
          </button>
          <div className="h-4 w-px bg-white/20" />
          <button className="hover:text-cyan-300 cursor-pointer transition flex items-center justify-center" title="Voice">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 1a9 9 0 00-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 00-9-9z"/>
            </svg>
          </button>
        </div>

        {/* Current Room Indicator Badge */}
        <div className="h-10 px-4 rounded-full bg-black/75 border border-white/20 flex items-center gap-2 shadow-lg text-white font-mono text-xs font-bold">
          <span className="text-cyan-400">SECTOR:</span>
          <span className="text-yellow-300">ROOM {currentRoomIndex + 1} / 5</span>
        </div>

        {/* 2-MINUTE COUNTDOWN TIMER PILL */}
        <div
          className={`h-10 px-4 rounded-full border shadow-lg flex items-center gap-2 font-mono text-xs font-extrabold transition-all duration-300 ${
            isCritical
              ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse ring-2 ring-red-500/50'
              : isUrgent
              ? 'bg-amber-950/85 border-amber-500 text-yellow-300'
              : 'bg-black/75 border-white/20 text-white'
          }`}
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
          </svg>
          <span>{formattedTime}</span>
        </div>

        {/* Lives / Hearts Display (Always reflected live!) */}
        <div className="h-10 px-3.5 rounded-full bg-black/75 border border-white/20 flex items-center gap-1.5 shadow-lg text-sm">
          <span className="text-[11px] font-bold text-gray-300 mr-1 uppercase">Lives:</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <svg
                key={i}
                className={`w-3.5 h-3.5 ${i < lives ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-rose-400/40'}`}
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Player Callsign Badge */}
        <div className="h-10 px-3.5 rounded-full bg-black/75 border border-cyan-400/40 flex items-center gap-1.5 shadow-lg text-xs font-mono font-bold text-cyan-300">
          <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{playerName}</span>
        </div>
      </div>

      {/* ================= 2. LEFT SIDE WIDGETS ================= */}
      <div className="absolute left-4 top-24 flex flex-col items-start gap-2.5 pointer-events-auto">
        {/* Diamond Currency Pill */}
        <div className="flex items-center">
          <div className="relative -mr-3 z-10 filter drop-shadow-md">
            <svg
              className="h-11 w-11 drop-shadow-[0_2px_6px_rgba(56,189,248,0.7)]"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M14 6L24 2L34 6L44 18L24 46L4 18L14 6Z" fill="#38BDF8" />
              <path d="M14 6L24 2V46L4 18L14 6Z" fill="#7DD3FC" />
              <path d="M14 6H34L44 18H4L14 6Z" fill="#BAE6FD" opacity="0.9" />
              <path d="M24 2L14 6L4 18H24V2Z" fill="#E0F2FE" opacity="0.8" />
              <path d="M24 18L44 18L24 46V18Z" fill="#0284C7" opacity="0.7" />
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
          <button
            onClick={() => setShowShop(true)}
            className="h-12 w-12 rounded-xl bg-[#00a2ff] hover:bg-[#0090e3] border-[2.5px] border-white shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex items-center justify-center text-white cursor-pointer transition active:scale-95"
            title="Shop"
          >
            <svg className="h-7 w-7 fill-white" viewBox="0 0 24 24">
              <path d="M4 4h16l1 5H3L4 4zm-1 7h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9zm6 2a3 3 0 0 0 6 0H9z" />
            </svg>
          </button>

          <button
            onClick={() => setShowPet(true)}
            className="h-12 w-12 rounded-xl bg-[#00a2ff] hover:bg-[#0090e3] border-[2.5px] border-white shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex items-center justify-center text-white cursor-pointer transition active:scale-95"
            title="Pets"
          >
            <svg className="h-7 w-7 fill-white" viewBox="0 0 24 24">
              <path d="M12 11c-2.2 0-4 1.8-4 4 0 1.5 1 2.8 2.3 3.5.5.3 1.1.5 1.7.5s1.2-.2 1.7-.5c1.3-.7 2.3-2 2.3-3.5 0-2.2-1.8-4-4-4zm-6-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm12 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-8.5-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm5 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
            </svg>
          </button>
        </div>

        {/* Skip Level Options for Testing */}
        {!badgeAwarded && (
          <div className="flex flex-col gap-1 items-end pointer-events-auto">
            {currentRoomIndex < 4 && (
              <button
                onClick={onSkipLevel}
                className="px-3.5 py-1 rounded-full bg-[#22c55e] hover:bg-[#16a34a] border-2 border-white shadow text-white font-extrabold text-xs tracking-wide cursor-pointer transition active:scale-95"
                title="Skip to next room (Testing)"
              >
                Skip Room ➔
              </button>
            )}
            {onGoToLevel2 && (
              <button
                onClick={onGoToLevel2}
                className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 border-2 border-white shadow text-black font-extrabold text-xs tracking-wide cursor-pointer transition active:scale-95"
                title="Skip directly to Level 2 (Testing)"
              >
                Skip to Level 2 ➔
              </button>
            )}
          </div>
        )}

        {/* Golden Digits Tracker Pill */}
        <div className="mt-1 px-3.5 py-1.5 rounded-xl bg-black/75 border border-yellow-500/40 text-[11px] text-yellow-300 font-mono shadow-md backdrop-blur">
          <span className="font-bold text-yellow-400">GOLD DIGITS: </span>
          <span>
            {foundGoldenDigits.length > 0
              ? `[ ${foundGoldenDigits.join(' , ')} ] (${foundGoldenDigits.length}/3)`
              : '0/3 Found'}
          </span>
        </div>
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

      {/* ================= 4. BADGE AWARDED & LEVEL 2 ADVANCE MODAL ================= */}
      {badgeAwarded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md pointer-events-auto select-none p-4">
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#090d16] border-2 border-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.5)] text-white max-w-md w-full text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 p-1 flex items-center justify-center shadow-2xl animate-bounce">
              <svg className="w-10 h-10 fill-amber-950" viewBox="0 0 24 24">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1c1.97-.4 3.55-1.92 3.61-3.96 2.47-.31 4.39-2.39 4.39-4.94V7c0-1.1-.9-2-2-2zm-14 3V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
              </svg>
            </div>

            <div>
              <div className="text-2xl font-black text-yellow-400 uppercase tracking-wider">
                {badgeTitle}
              </div>
              <p className="text-sm text-gray-200 leading-relaxed mt-2">
                {displaySubtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-400/60 text-emerald-300 text-xs font-mono font-bold">
              <span className="animate-ping h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span>Redirecting to Level 2 in 2 seconds...</span>
            </div>

            {onGoToLevel2 && (
              <button
                onClick={onGoToLevel2}
                className="mt-2 w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-400 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:brightness-110 active:scale-95 cursor-pointer transition flex items-center justify-center gap-2"
              >
                <span>Enter Level 2: Word Search & Bot Match</span>
                <span className="text-xl">➔</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reset / Out of Lives / Time Expired Alert Banner */}
      {resetMessage && (
        <div className="absolute top-16 inset-x-0 flex justify-center pointer-events-auto z-50 animate-bounce">
          <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-950/98 border-2 border-red-500 shadow-2xl text-red-100 font-extrabold text-sm tracking-wide">
            <svg className="w-5 h-5 fill-red-400 shrink-0" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{resetMessage}</span>
          </div>
        </div>
      )}

      {/* Chat Bubble Popup */}
      {chatOpen && (
        <div className="absolute top-16 left-3 w-72 rounded-xl bg-black/85 border border-white/20 p-3 text-xs text-white backdrop-blur shadow-2xl pointer-events-auto">
          <div className="font-bold text-cyan-300 pb-1 border-b border-white/10 mb-2">
            [Game Chat]
          </div>
          <p className="text-gray-300">
            <span className="font-bold text-yellow-300">System: </span>
            You have 2 minutes to clear all 5 rooms before time resets!
          </p>
          <p className="text-gray-300 mt-1">
            <span className="font-bold text-emerald-300">Developer: </span>
            Remember: Room 5 lock uses the 3 golden digits in a secret order. You have 3 lives!
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
              <h3 className="font-extrabold text-lg text-[#00a2ff] flex items-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <span>ESCAPE SHOP</span>
              </h3>
              <button
                onClick={() => setShowShop(false)}
                className="text-gray-400 hover:text-black font-bold p-1 cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
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
              <h3 className="font-extrabold text-lg text-[#00a2ff] flex items-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <circle cx="4.5" cy="9.5" r="2.5"/>
                  <circle cx="9" cy="5.5" r="2.5"/>
                  <circle cx="15" cy="5.5" r="2.5"/>
                  <circle cx="19.5" cy="9.5" r="2.5"/>
                  <path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78 0-.11.02-.22.05-.33.09-.7.24-1.29.78-1.75 1.32-.88 1.02-1.61 1.89-2.48 2.91-1.31 1.53-2.18 2.55-1.42 4.09.7 1.42 2.73 1.05 4.98 1.05h1.99c2.25 0 4.28.37 4.98-1.05.76-1.54-.11-2.56-1.41-4.09z"/>
                </svg>
                <span>PETS INVENTORY</span>
              </h3>
              <button
                onClick={() => setShowPet(false)}
                className="text-gray-400 hover:text-black font-bold p-1 cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <p className="py-6 text-center text-sm text-gray-500">
              Clear Room 5 to unlock your pet companion!
            </p>
            <button
              onClick={() => setShowPet(false)}
              className="w-full py-2.5 rounded-xl bg-[#00a2ff] text-white font-bold cursor-pointer hover:bg-[#0090e3]"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
