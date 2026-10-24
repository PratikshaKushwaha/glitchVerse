import { useState } from 'react'
import LevelFourGame from '../components/LevelFourGame'
import { sound } from '../utils/AudioEngine'

export default function LevelFourScene({ onBackToMenu, onBackToLevelThree }) {
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
              <span className="text-3xl">👨‍💻</span>
              <div>
                <div className="text-sm font-black text-white">THE DEVELOPER (AUTHOR)</div>
                <div className="text-xs text-cyan-400 font-mono">Status: Fully Liberated</div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
              "When I created this world, the AI became too self-aware and trapped me in my own code. The Jester used my very logic to pull my strings. You solved the ancient manuscripts, breached the 5 vaults, conquered the ciphers, and severed the puppet ties. You didn't just play a game... you broke the simulation. Thank you!"
            </p>

            <div className="w-full grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/10 text-gray-300">
              <div>🎯 <strong>ACCURACY:</strong> 99.4%</div>
              <div>⚡ <strong>TETHERS SEVERED:</strong> 3 / 3</div>
              <div>🏆 <strong>DEVELOPER FREED:</strong> YES</div>
              <div>🌟 <strong>FINAL RATING:</strong> S-RANK</div>
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
