import { useState } from 'react'
import WordSearchGame from '../components/WordSearchGame'
import MemoryCardGame from '../components/MemoryCardGame'
import { sound } from '../utils/AudioEngine'

export default function LevelTwoScene({ onBackToMenu, onBackToLevelOne }) {
  // 'wordsearch' | 'memory' | 'victory'
  const [stage, setStage] = useState('wordsearch')
  const [badgeAwarded, setBadgeAwarded] = useState(false)

  // Handle stage 1 completion
  const handleWordSearchComplete = () => {
    sound.playVictory()
    setTimeout(() => {
      setStage('memory')
    }, 1200)
  }

  // Handle stage 2 completion
  const handleMemoryComplete = () => {
    sound.playVictory()
    setBadgeAwarded(true)
    setStage('victory')
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-900 font-sans">
      {/* Stage Selector Header Bar */}
      <div className="absolute top-2 inset-x-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/75 border border-white/20 backdrop-blur pointer-events-auto text-xs font-bold text-white shadow-xl">
          <span className="text-cyan-400">LEVEL 2:</span>
          <button
            onClick={() => setStage('wordsearch')}
            className={`px-3 py-1 rounded-full cursor-pointer transition ${
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
            className={`px-3 py-1 rounded-full cursor-pointer transition ${
              stage === 'memory'
                ? 'bg-[#f59e0b] text-black font-extrabold shadow'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            2. Memory Match vs Bot
          </button>
        </div>
      </div>

      {/* STAGE 1: Word Search Puzzle (Image 2 Style) */}
      {stage === 'wordsearch' && (
        <WordSearchGame
          onComplete={handleWordSearchComplete}
          onExit={onBackToMenu}
        />
      )}

      {/* STAGE 2: Memory Card Game vs Computer (Images 3, 4, 5 Style) */}
      {stage === 'memory' && (
        <MemoryCardGame
          onComplete={handleMemoryComplete}
          onExit={onBackToMenu}
        />
      )}

      {/* STAGE 3: Grand Level 2 Victory Celebration */}
      {stage === 'victory' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 p-6 text-white text-center">
          <div className="max-w-md w-full bg-white/10 border-2 border-yellow-400/80 rounded-3xl p-8 backdrop-blur shadow-[0_0_60px_rgba(250,204,21,0.35)] flex flex-col items-center animate-bounce">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-1 flex items-center justify-center shadow-2xl mb-4">
              <span className="text-4xl">🏆</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-yellow-300 uppercase tracking-wider">
              LEVEL 2 CONQUERED!
            </h1>
            <p className="mt-2 text-sm text-gray-200 leading-relaxed">
              You cracked the word search cipher and outsmarted the Bot in the memory match!
              The developer is closer to freedom!
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => setStage('wordsearch')}
                className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-lg transition active:scale-95"
              >
                Replay Level 2
              </button>
              <button
                onClick={onBackToLevelOne}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-lg transition active:scale-95"
              >
                Return to Level 1
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
