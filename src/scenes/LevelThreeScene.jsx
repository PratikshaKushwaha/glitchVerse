import { sound } from '../utils/AudioEngine'

export default function LevelThreeScene({ onBackToMenu, onBackToLevelTwo }) {
  return (
    <div className="relative w-screen h-screen bg-[#050811] text-white flex flex-col items-center justify-between p-6 select-none font-sans overflow-hidden">
      {/* Background Cybernetic Grid Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between pt-2">
        <button
          onClick={onBackToLevelTwo}
          className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 font-bold text-xs cursor-pointer transition"
        >
          ← Back to Level 2
        </button>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-cyan-400 font-bold text-xs sm:text-sm uppercase tracking-widest">
            SECTOR 3: THE MAINFRAME SANCTUARY
          </span>
        </div>
        <button
          onClick={onBackToMenu}
          className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 font-bold text-xs cursor-pointer transition"
        >
          Main Menu
        </button>
      </div>

      {/* Center Cinematic Card */}
      <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center p-8 rounded-3xl bg-[#090d16]/90 border-2 border-cyan-400/60 shadow-[0_0_60px_rgba(6,182,212,0.35)] backdrop-blur my-auto">
        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-cyan-600 via-sky-400 to-emerald-300 p-1 flex items-center justify-center shadow-2xl mb-5 animate-pulse">
          <span className="text-5xl">⚡</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-sky-400 tracking-wider uppercase">
          LEVEL 3 REACHED
        </h1>
        <p className="mt-3 text-sm text-gray-300 font-mono leading-relaxed">
          You have conquered all 4 sublevels of Sector 2: the Word Search, the Memory Bot, the Double Cadgy stack, and the 3 Pinned Riddles.
        </p>

        <div className="w-full my-6 p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-200 text-left space-y-1.5">
          <div><strong className="text-white">STATUS:</strong> Matrix Core Unlocked</div>
          <div><strong className="text-white">SECTOR INTEGRITY:</strong> Restored (98.4%)</div>
          <div><strong className="text-white">DEVELOPER FREEDOM:</strong> Imminent</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={onBackToLevelTwo}
            className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition"
          >
            Replay Level 2
          </button>
          <button
            onClick={onBackToMenu}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:brightness-110 active:scale-95 transition"
          >
            Return to Main Menu
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-xs font-mono text-gray-500 text-center pb-2">
        GlitchVerse • The World Is Broken Hackathon
      </div>
    </div>
  )
}
