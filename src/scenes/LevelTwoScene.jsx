import { useState } from 'react'
import WordSearchGame from '../components/WordSearchGame'
import MemoryCardGame from '../components/MemoryCardGame'
import CadgyWordGame from '../components/CadgyWordGame'
import RiddleBoardGame from '../components/RiddleBoardGame'
import { sound } from '../utils/AudioEngine'

export default function LevelTwoScene({ onBackToMenu, onBackToLevelOne, onGoToLevel3 }) {
  // 4 Sublevels: 'wordsearch' | 'memory' | 'cadgy' | 'riddle' | 'victory'
  const [stage, setStage] = useState('wordsearch')
  const [badgeAwarded, setBadgeAwarded] = useState(false)

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
    setStage('victory')
    if (onGoToLevel3) {
      setTimeout(() => {
        onGoToLevel3()
      }, 2500)
    }
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-900 font-sans">
      
      {/* Stage Selector Header Bar for all 4 Sublevels */}
      <div className="absolute top-2 inset-x-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 rounded-full bg-black/85 border border-white/20 backdrop-blur pointer-events-auto text-[11px] sm:text-xs font-bold text-white shadow-2xl">
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
        </div>
      </div>

      {/* SUBLEVEL 1: Word Search Crossword Puzzle (Image 1 Style) */}
      {stage === 'wordsearch' && (
        <WordSearchGame
          onComplete={handleWordSearchComplete}
          onExit={onBackToMenu}
        />
      )}

      {/* SUBLEVEL 2: Memory Card Match vs AI Computer */}
      {stage === 'memory' && (
        <MemoryCardGame
          onComplete={handleMemoryComplete}
          onExit={onBackToMenu}
        />
      )}

      {/* SUBLEVEL 3: Double Cadgy 3D Word Stack Puzzle (Images 2 & 3 Style) */}
      {stage === 'cadgy' && (
        <CadgyWordGame
          onComplete={handleCadgyComplete}
          onExit={onBackToMenu}
        />
      )}

      {/* SUBLEVEL 4: Wood Plank Background with Pinned Riddle Note & Image 6 Slot (Images 4, 5, 6 Style) */}
      {stage === 'riddle' && (
        <RiddleBoardGame
          onComplete={handleRiddleComplete}
          onExit={onBackToMenu}
        />
      )}

      {/* GRAND LEVEL 2 VICTORY CELEBRATION */}
      {stage === 'victory' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 p-6 text-white text-center">
          <div className="max-w-md w-full bg-white/10 border-2 border-yellow-400/80 rounded-3xl p-8 backdrop-blur shadow-[0_0_60px_rgba(250,204,21,0.35)] flex flex-col items-center animate-bounce">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-1 flex items-center justify-center shadow-2xl mb-4">
              <span className="text-4xl">🏆</span>
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
