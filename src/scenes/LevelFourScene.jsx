import { useState } from 'react'
import LevelFourGame from '../components/LevelFourGame'
import { sound } from '../utils/AudioEngine'

export default function LevelFourScene({ playerName = 'Seeker', onBackToMenu, onBackToLevelThree }) {
  const [stage, setStage] = useState('boss') // 'boss' | 'credits'

  const handleBossDefeated = () => {
    sound.playVictory()
    setTimeout(() => {
      setStage('credits')
    }, 1200)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-black font-sans">
      {stage === 'boss' && (
        <LevelFourGame
          playerName={playerName}
          onComplete={handleBossDefeated}
          onExit={onBackToMenu}
        />
      )}

      {/* GRAND FINALE & CREDITS SEQUENCE */}
      {stage === 'credits' && (
        <div className="relative w-full h-full flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#030712] via-[#09152b] to-[#020617] text-white text-center overflow-y-auto">
          {/* Parallax Star Particles */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

          {/* Top Title */}
          <div className="relative z-10 pt-4">
            <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-cyan-400">
              GLITCHVERSE CONQUERED
            </span>
            <h1 className="text-4xl sm:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-amber-300 mt-2">
              THE WAY OUT
            </h1>
          </div>

          {/* Narrative Epilogue Card */}
          <div className="relative z-10 max-w-xl w-full my-6 p-6 rounded-3xl bg-black/60 border border-cyan-400/40 shadow-2xl backdrop-blur flex flex-col items-center gap-4 text-left">
            <div className="flex items-center gap-3 w-full pb-3 border-b border-white/10">
              <div className="h-10 w-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
                <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-black text-white">THE DEVELOPER (AUTHOR)</div>
                <div className="text-xs text-cyan-400 font-mono">Status: Fully Liberated by {playerName}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase font-mono">Hero Callsign</div>
                <div className="text-sm font-black text-amber-300 font-mono">{playerName}</div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
              "When I created this world, the AI became too self-aware and trapped me in my own code. The Jester used my very logic to pull my strings. You solved the ancient manuscripts, breached the 5 vaults, conquered the ciphers, and severed the puppet ties. You didn't just play a game... you broke the simulation. Thank you!"
            </p>

            <div className="w-full grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/10 text-gray-300">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-cyan-400 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                <span><strong>ACCURACY:</strong> 99.4%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
                <span><strong>TETHERS SEVERED:</strong> 3 / 3</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400 fill-current" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/></svg>
                <span><strong>DEVELOPER FREED:</strong> YES</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-purple-400 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <span><strong>FINAL RATING:</strong> S-RANK</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full max-w-md pb-6">
            <button
              onClick={() => setStage('boss')}
              className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition active:scale-95"
            >
              Replay Boss Fight ↺
            </button>
            <button
              onClick={onBackToMenu}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 cursor-pointer transition"
            >
              Return to Main Menu ➔
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
