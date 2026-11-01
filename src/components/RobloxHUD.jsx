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
  setMoveInput,
}) {
  const displaySubtitle = badgeSubtitle || `${playerName} won Kikamug's "You have completed level 1!" award!`

  // Format timer MM:SS
  const mins = Math.floor(Math.max(0, timeLeft) / 60)
  const secs = Math.max(0, timeLeft) % 60
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const isUrgent = timeLeft <= 30
  const isCritical = timeLeft <= 10

  return (
    <div className="pointer-events-none fixed inset-0 z-40 select-none font-sans overflow-hidden">
      {/* ================= 1. ROBLOX TOPBAR (FLUID RESPONSIVE) ================= */}
      <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-auto flex flex-wrap items-center gap-1.5 sm:gap-2 pointer-events-auto max-w-[calc(100vw-1rem)] sm:max-w-none">
        {/* Roblox Logo Circle Button */}
        <button
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/75 hover:bg-black/90 border border-white/20 flex items-center justify-center shadow-lg cursor-pointer transition active:scale-95 shrink-0"
          title="Roblox Menu"
        >
          <div className="h-4 w-4 sm:h-5 sm:w-5 bg-white rounded-[4px] rotate-12 flex items-center justify-center shadow-inner">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-black/80 rounded-[2px]" />
          </div>
        </button>

        {/* Current Room Indicator Badge */}
        <div className="h-8 sm:h-10 px-2.5 sm:px-4 rounded-full bg-black/75 border border-white/20 flex items-center gap-1.5 sm:gap-2 shadow-lg text-white font-mono text-[10px] sm:text-xs font-bold shrink-0">
          <span className="text-cyan-400 hidden xs:inline">SECTOR:</span>
          <span className="text-yellow-300">ROOM {currentRoomIndex + 1}/5</span>
        </div>

        {/* 2-MINUTE COUNTDOWN TIMER PILL */}
        <div
          className={`h-8 sm:h-10 px-2.5 sm:px-4 rounded-full border shadow-lg flex items-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-xs font-extrabold transition-all duration-300 shrink-0 ${
            isCritical
              ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse ring-2 ring-red-500/50'
              : isUrgent
              ? 'bg-amber-950/85 border-amber-500 text-yellow-300'
              : 'bg-black/75 border-white/20 text-white'
          }`}
        >
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
          </svg>
          <span>{formattedTime}</span>
        </div>

        {/* Lives / Hearts Display (Always reflected live!) */}
        <div className="h-8 sm:h-10 px-2.5 sm:px-3.5 rounded-full bg-black/75 border border-white/20 flex items-center gap-1 sm:gap-1.5 shadow-lg text-xs sm:text-sm shrink-0">
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 mr-0.5 sm:mr-1 uppercase hidden xs:inline">Lives:</span>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {[0, 1, 2].map((i) => (
              <svg
                key={i}
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < lives ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-rose-400/40'}`}
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Player Callsign Badge */}
        <div className="h-8 sm:h-10 px-2.5 sm:px-3.5 rounded-full bg-black/75 border border-cyan-400/40 flex items-center gap-1.5 shadow-lg text-[10px] sm:text-xs font-mono font-bold text-cyan-300 shrink-0">
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-none stroke-current shrink-0" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="truncate max-w-[80px] sm:max-w-none">{playerName}</span>
        </div>
      </div>

      {/* ================= 2. LEFT SIDE WIDGETS ================= */}
      <div className="absolute left-2 sm:left-4 top-[76px] sm:top-24 flex flex-col items-start gap-1.5 sm:gap-2.5 pointer-events-auto">
        {/* Diamond Currency Pill */}
        <div className="flex items-center">
          <div className="relative -mr-2.5 sm:-mr-3 z-10 filter drop-shadow-md">
            <svg
              className="h-8 w-8 sm:h-11 sm:w-11 drop-shadow-[0_2px_6px_rgba(56,189,248,0.7)]"
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

          <div className="h-7 sm:h-9 min-w-20 sm:min-w-28 pl-3 sm:pl-4 pr-3 sm:pr-5 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center">
            <span className="font-extrabold text-sm sm:text-lg text-[#0084ff] tracking-tight">
              {diamonds}
            </span>
          </div>
        </div>

        {/* Skip Level Options for Testing */}
        {!badgeAwarded && (
          <div className="flex flex-col gap-1 items-start pointer-events-auto">
            {currentRoomIndex < 4 && (
              <button
                onClick={onSkipLevel}
                className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#22c55e] hover:bg-[#16a34a] border border-white shadow text-white font-extrabold text-[10px] sm:text-xs tracking-wide cursor-pointer transition active:scale-95"
                title="Skip to next room (Press K or Click)"
              >
                Skip Room [K] -&gt;
              </button>
            )}
            {onGoToLevel2 && (
              <button
                onClick={onGoToLevel2}
                className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 border border-white shadow text-black font-extrabold text-[10px] sm:text-xs tracking-wide cursor-pointer transition active:scale-95"
                title="Skip directly to Level 2 (Testing)"
              >
                Skip to Level 2 -&gt;
              </button>
            )}
          </div>
        )}

        {/* Golden Digits Tracker Pill */}
        <div className="mt-0.5 sm:mt-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-black/75 border border-yellow-500/40 text-[9px] sm:text-[11px] text-yellow-300 font-mono shadow-md backdrop-blur">
          <span className="font-bold text-yellow-400">GOLD: </span>
          <span>
            {foundGoldenDigits.length > 0
              ? `[ ${foundGoldenDigits.join(' , ')} ] (${foundGoldenDigits.length}/3)`
              : '0/3 Found'}
          </span>
        </div>
      </div>

      {/* ================= 3. BOTTOM-RIGHT JUMP BUTTON ================= */}
      <div className="absolute right-3 bottom-3 sm:right-6 sm:bottom-6 pointer-events-auto">
        <button
          onClick={onJump}
          className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-black/45 hover:bg-black/60 border-2 border-white/40 backdrop-blur shadow-2xl flex items-center justify-center text-white text-lg sm:text-2xl cursor-pointer active:scale-90 transition"
          title="Jump (Space)"
        >
          ▲
        </button>
      </div>

      {/* ================= 4. BADGE AWARDED & LEVEL 2 ADVANCE MODAL ================= */}
      {badgeAwarded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md pointer-events-auto select-none p-4">
          <div className="flex flex-col items-center gap-3 sm:gap-4 p-5 sm:p-8 rounded-3xl bg-[#090d16] border-2 border-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.5)] text-white max-w-md w-full text-center">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 p-1 flex items-center justify-center shadow-2xl animate-bounce">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 fill-amber-950" viewBox="0 0 24 24">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1c1.97-.4 3.55-1.92 3.61-3.96 2.47-.31 4.39-2.39 4.39-4.94V7c0-1.1-.9-2-2-2zm-14 3V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
              </svg>
            </div>

            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-black text-yellow-400 uppercase tracking-wider [text-wrap:balance]">
                {badgeTitle}
              </div>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed [text-wrap:pretty]">
                {displaySubtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-950/80 border border-emerald-400/60 text-emerald-300 text-[10px] sm:text-xs font-mono font-bold">
              <span className="animate-ping h-2 w-2 rounded-full bg-emerald-400" />
              <span>Redirecting to Level 2 in 2 seconds...</span>
            </div>

            {onGoToLevel2 && (
              <button
                onClick={onGoToLevel2}
                className="mt-2 w-full py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:brightness-110 active:scale-95 cursor-pointer transition flex items-center justify-center gap-2"
              >
                <span>Enter Level 2: Word Search &amp; Bot Match -&gt;</span>
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

      {/* Mobile Touch D-Pad for Virtual Movement (Visible on Mobile/Tablet) */}
      <div className="absolute bottom-4 left-4 z-30 pointer-events-auto flex flex-col items-center select-none sm:hidden opacity-85">
        <button
          onTouchStart={(e) => { e.preventDefault(); setMoveInput && setMoveInput((p) => ({ ...p, forward: true })) }}
          onTouchEnd={() => setMoveInput && setMoveInput((p) => ({ ...p, forward: false }))}
          onMouseDown={() => setMoveInput && setMoveInput((p) => ({ ...p, forward: true }))}
          onMouseUp={() => setMoveInput && setMoveInput((p) => ({ ...p, forward: false }))}
          className="h-11 w-11 rounded-full bg-black/60 border border-white/40 text-white flex items-center justify-center text-sm font-bold shadow active:bg-cyan-500 active:text-black mb-1"
        >
          ▲
        </button>
        <div className="flex items-center gap-4">
          <button
            onTouchStart={(e) => { e.preventDefault(); setMoveInput && setMoveInput((p) => ({ ...p, left: true })) }}
            onTouchEnd={() => setMoveInput && setMoveInput((p) => ({ ...p, left: false }))}
            onMouseDown={() => setMoveInput && setMoveInput((p) => ({ ...p, left: true }))}
            onMouseUp={() => setMoveInput && setMoveInput((p) => ({ ...p, left: false }))}
            className="h-11 w-11 rounded-full bg-black/60 border border-white/40 text-white flex items-center justify-center text-sm font-bold shadow active:bg-cyan-500 active:text-black"
          >
            ◀
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); setMoveInput && setMoveInput((p) => ({ ...p, backward: true })) }}
            onTouchEnd={() => setMoveInput && setMoveInput((p) => ({ ...p, backward: false }))}
            onMouseDown={() => setMoveInput && setMoveInput((p) => ({ ...p, backward: true }))}
            onMouseUp={() => setMoveInput && setMoveInput((p) => ({ ...p, backward: false }))}
            className="h-11 w-11 rounded-full bg-black/60 border border-white/40 text-white flex items-center justify-center text-sm font-bold shadow active:bg-cyan-500 active:text-black"
          >
            ▼
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); setMoveInput && setMoveInput((p) => ({ ...p, right: true })) }}
            onTouchEnd={() => setMoveInput && setMoveInput((p) => ({ ...p, right: false }))}
            onMouseDown={() => setMoveInput && setMoveInput((p) => ({ ...p, right: true }))}
            onMouseUp={() => setMoveInput && setMoveInput((p) => ({ ...p, right: false }))}
            className="h-11 w-11 rounded-full bg-black/60 border border-white/40 text-white flex items-center justify-center text-sm font-bold shadow active:bg-cyan-500 active:text-black"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  )
}
