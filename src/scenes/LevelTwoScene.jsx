import { useState } from 'react'
import WordSearchGame from '../components/WordSearchGame'
import MemoryCardGame from '../components/MemoryCardGame'
import CadgyWordGame from '../components/CadgyWordGame'
import RiddleBoardGame from '../components/RiddleBoardGame'
import { sound } from '../utils/AudioEngine'
import woodBoardImg from '../assets/level2/wood_board.jpg'

export default function LevelTwoScene({
  playerName = 'Seeker',
  onBackToMenu,
  onBackToLevelOne,
  onGoToLevel3,
}) {
  // 4 Sublevels: 'wordsearch' | 'memory' | 'cadgy' | 'riddle' | 'victory'
  const [stage, setStage] = useState('wordsearch')
  const [badgeAwarded, setBadgeAwarded] = useState(false)

  // Environmental Altering State: 'wood' (Atelier Study) | 'cyber' (Neon Void) | 'glitch' (Corrupted Matrix)
  const [environment, setEnvironment] = useState('wood')

  // Environmental purge progression across the 4 sublevels
  const purgePercentage =
    stage === 'wordsearch' ? 25 : stage === 'memory' ? 50 : stage === 'cadgy' ? 75 : 100

  // 1. Word Search complete -> Memory Bot
  const handleWordSearchComplete = () => {
    sound.playVictory()
    setTimeout(() => {
      setStage('memory')
    }, 800)
  }

  // 2. Memory Bot complete -> Double Cadgy
  const handleMemoryComplete = () => {
    sound.playVictory()
    setTimeout(() => {
      setStage('cadgy')
    }, 800)
  }

  // 3. Double Cadgy complete -> Riddle Board
  const handleCadgyComplete = () => {
    sound.playVictory()
    setTimeout(() => {
      setStage('riddle')
    }, 800)
  }

  // 4. Riddle Board complete -> Transition into Level 3!
  const handleRiddleComplete = () => {
    sound.playVictory()
    setBadgeAwarded(true)
    if (onGoToLevel3) {
      onGoToLevel3()
    } else {
      setStage('victory')
    }
  }

  const cycleEnvironment = () => {
    sound.playKeyClick()
    setEnvironment((prev) => (prev === 'wood' ? 'cyber' : prev === 'cyber' ? 'glitch' : 'wood'))
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-sans">
      
      {/* ================= ENVIRONMENTAL BACKGROUND LAYERS ================= */}
      {/* 1. Rustic Wood Atelier Environment (Uses wood_board.jpg) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-cover bg-center ${
          environment === 'wood' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundImage: `url(${woodBoardImg})` }}
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
      </div>

      {/* 2. Cyber Neon Grid Environment */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-[#0d0722] ${
          environment === 'cyber' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-transparent to-indigo-950/70" />
      </div>

      {/* 3. Glitch Corrupted Matrix Environment */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-[#090b10] ${
          environment === 'glitch' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px)] [background-size:100%_4px] opacity-40 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 via-transparent to-red-950/40" />
      </div>

      {/* Dynamic Purge Atmosphere Filter */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          boxShadow: `inset 0 0 ${120 - purgePercentage}px rgba(${
            purgePercentage === 100 ? '16,185,129' : '239,68,68'
          }, 0.25)`,
        }}
      />

      {/* ================= STAGE & ENVIRONMENT SELECTOR HEADER BAR ================= */}
      <div className="absolute top-2 inset-x-0 z-40 flex items-center justify-center pointer-events-none px-2">
        <div className="flex items-center flex-wrap justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-black/85 border border-white/20 backdrop-blur pointer-events-auto text-[10px] sm:text-xs font-bold text-white shadow-2xl">
          <span className="text-cyan-400 font-black">LEVEL 2:</span>

          <button
            onClick={() => setStage('wordsearch')}
            className={`px-2.5 py-1 rounded-full cursor-pointer transition ${
              stage === 'wordsearch'
                ? 'bg-[#38bdf8] text-black font-extrabold shadow'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            1. Word Search
          </button>

          <span>•</span>

          <button
            onClick={() => setStage('memory')}
            className={`px-2.5 py-1 rounded-full cursor-pointer transition ${
              stage === 'memory'
                ? 'bg-[#f59e0b] text-black font-extrabold shadow'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            2. Memory Bot
          </button>

          <span>•</span>

          <button
            onClick={() => setStage('cadgy')}
            className={`px-2.5 py-1 rounded-full cursor-pointer transition ${
              stage === 'cadgy'
                ? 'bg-[#ec4899] text-white font-extrabold shadow'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            3. Double Cadgy
          </button>

          <span>•</span>

          <button
            onClick={() => setStage('riddle')}
            className={`px-2.5 py-1 rounded-full cursor-pointer transition ${
              stage === 'riddle'
                ? 'bg-[#10b981] text-black font-extrabold shadow'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            4. Riddle Board
          </button>

          <span>•</span>

          {/* ENVIRONMENT ALTERING BUTTON (User Request) */}
          <button
            onClick={cycleEnvironment}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-yellow-300 font-mono text-[10px] cursor-pointer transition shadow active:scale-95"
            title="Alter Level 2 Atmospheric Environment"
          >
            <span>ENV:</span>
            <span className="font-bold text-white uppercase">{environment}</span>
          </button>

          <span>•</span>

          {/* Environmental Purge Indicator */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
            <span>PURGE:</span>
            <span className="font-bold">{purgePercentage}%</span>
          </div>

          <span>•</span>

          <button
            onClick={() => {
              if (stage === 'wordsearch') setStage('memory')
              else if (stage === 'memory') setStage('cadgy')
              else if (stage === 'cadgy') setStage('riddle')
              else if (stage === 'riddle' && onGoToLevel3) onGoToLevel3()
            }}
            className="px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-extrabold cursor-pointer transition shadow active:scale-95 text-[10px] sm:text-xs"
            title="Skip Sublevel for testing"
          >
            Skip Sublevel ➔
          </button>

          <button
            onClick={onGoToLevel3}
            className="px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 text-black font-black cursor-pointer transition shadow active:scale-95 text-[10px] sm:text-xs"
            title="Skip directly to Level 3 for testing"
          >
            Skip to Level 3 ➔
          </button>
        </div>
      </div>

      {/* ================= SUBLEVEL 1: Word Search Game ================= */}
      {stage === 'wordsearch' && (
        <WordSearchGame
          onComplete={handleWordSearchComplete}
          onExit={onBackToMenu}
          environment={environment}
        />
      )}

      {/* ================= SUBLEVEL 2: Memory Card Match vs Bot ================= */}
      {stage === 'memory' && (
        <MemoryCardGame
          playerName={playerName}
          onComplete={handleMemoryComplete}
          onExit={onBackToMenu}
          environment={environment}
        />
      )}

      {/* ================= SUBLEVEL 3: Double Cadgy 3D Word Stack ================= */}
      {stage === 'cadgy' && (
        <CadgyWordGame
          onComplete={handleCadgyComplete}
          onExit={onBackToMenu}
          environment={environment}
        />
      )}

      {/* ================= SUBLEVEL 4: Wood Plank Riddle Board ================= */}
      {stage === 'riddle' && (
        <RiddleBoardGame
          onComplete={handleRiddleComplete}
          onExit={onBackToMenu}
          environment={environment}
        />
      )}

      {/* ================= GRAND LEVEL 2 VICTORY CELEBRATION ================= */}
      {stage === 'victory' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="max-w-md w-full bg-black/85 border-2 border-yellow-400/80 rounded-3xl p-8 backdrop-blur shadow-[0_0_60px_rgba(250,204,21,0.35)] flex flex-col items-center animate-bounce">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-1 flex items-center justify-center shadow-2xl mb-4 text-black">
              <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-yellow-300 uppercase tracking-wider">
              ALL 4 SUBLEVELS CONQUERED!
            </h1>
            <p className="mt-2 text-sm text-gray-200 leading-relaxed">
              You mastered the Word Search, defeated the Bot, cracked Double Cadgy, and decrypted the Master Riddle!
              The GlitchVerse is nearly saved!
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
              {onGoToLevel3 && (
                <button
                  onClick={onGoToLevel3}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:brightness-110 active:scale-95 transition"
                >
                  Enter Level 3 ➔
                </button>
              )}
              <button
                onClick={() => setStage('wordsearch')}
                className="flex-1 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow transition active:scale-95"
              >
                Replay Level 2
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
