import { useState, useEffect } from 'react'
import { sound } from '../utils/AudioEngine'

const PUZZLE_SETS = [
  {
    titleLetters: ['C', 'A', 'D', 'G', 'Y'],
    boardColumns: [
      ['G', 'T', 'H', 'S', '💖'],
      ['L', 'R', 'E', 'K', 'CI'],
      ['N', 'I', '💖', 'EN', 'A'],
      ['C', 'R', 'S', 'D', 'B'],
      ['💖', 'T', 'S', 'E', '💖'],
    ],
    basicWords: [
      { word: 'HEADS', clue: 'Uppermost parts of human bodies' },
      { word: 'HEART', clue: 'Muscular organ that pumps blood' },
      { word: 'TRADE', clue: 'Exchange of goods or services' },
    ],
    bonusWords: [
      { word: 'GEARS', clue: 'Mechanical toothed wheels transmitting motion' },
      { word: 'GENRE', clue: 'Category of artistic or literary works' },
      { word: 'GLACE', clue: 'Glazed fruit or frozen dessert' },
    ],
  },
  {
    titleLetters: ['P', 'U', 'Z', 'L', 'E'],
    boardColumns: [
      ['C', 'L', 'S', 'G', '💖'],
      ['Y', 'O', 'P', 'L', 'R'],
      ['B', 'G', 'A', 'O', 'A'],
      ['E', 'I', 'C', 'R', 'M'],
      ['R', 'C', 'E', 'Y', '💖'],
    ],
    basicWords: [
      { word: 'CYBER', clue: 'Relating to electronic communication networks' },
      { word: 'LOGIC', clue: 'Reasoning conducted according to strict principles' },
      { word: 'GAMES', clue: 'Activities engaged in for diversion or amusement' },
    ],
    bonusWords: [
      { word: 'GLORY', clue: 'High renown or honor won by notable achievements' },
      { word: 'MAGIC', clue: 'Power of apparently influencing events by supernatural forces' },
      { word: 'SPACE', clue: 'Continuous expanse free, available, or unoccupied' },
    ],
  },
]

export default function CadgyWordGame({ onComplete, onExit }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const currentSet = PUZZLE_SETS[puzzleIndex]

  const [currentSlots, setCurrentSlots] = useState([]) // array of letters up to 5
  const [foundBasicWords, setFoundBasicWords] = useState([])
  const [foundBonusWords, setFoundBonusWords] = useState([])
  const [score, setScore] = useState(30)
  const [message, setMessage] = useState('')
  const [isSuccessShake, setIsSuccessShake] = useState(false)

  const isBasicCompleted = foundBasicWords.length === currentSet.basicWords.length

  // Add letter to slots
  const handleTileClick = (letter) => {
    if (letter === '💖') {
      sound.playTypewriter()
      setScore((s) => s + 20)
      setMessage('💖 Heart bonus +20 points!')
      setTimeout(() => setMessage(''), 1500)
      return
    }

    if (currentSlots.length < 5) {
      sound.playTypewriter()
      setCurrentSlots((prev) => [...prev, letter])
    }
  }

  // Remove letter from specific slot
  const handleSlotClick = (index) => {
    sound.playTypewriter()
    setCurrentSlots((prev) => prev.filter((_, i) => i !== index))
  }

  // Clear all slots
  const handleClear = () => {
    sound.playTypewriter()
    setCurrentSlots([])
  }

  // Shuffle board
  const handleShuffle = () => {
    sound.playCardFlip()
    setPuzzleIndex((prev) => (prev + 1) % PUZZLE_SETS.length)
    setCurrentSlots([])
    setMessage('Board shuffled!')
    setTimeout(() => setMessage(''), 1500)
  }

  // Submit test word
  const handleSubmit = () => {
    const word = currentSlots.join('').toUpperCase()
    if (word.length === 0) return

    // 1. Check basic words
    const basicMatch = currentSet.basicWords.find((b) => b.word === word)
    if (basicMatch) {
      if (foundBasicWords.includes(word)) {
        setMessage(`Already solved ${word}!`)
      } else {
        sound.playWordFound()
        setFoundBasicWords((prev) => [...prev, word])
        setScore((s) => s + 100)
        setMessage(`✓ Correct Basic Word: ${word}! (+100)`)
        setIsSuccessShake(true)
        setTimeout(() => setIsSuccessShake(false), 800)
      }
      setCurrentSlots([])
      return
    }

    // 2. Check bonus words (max 3)
    const bonusMatch = currentSet.bonusWords.find((b) => b.word === word)
    if (bonusMatch) {
      if (foundBonusWords.includes(word)) {
        setMessage(`Already found bonus word ${word}!`)
      } else if (foundBonusWords.length < 3) {
        sound.playVictory()
        setFoundBonusWords((prev) => [...prev, word])
        setScore((s) => s + 150)
        setMessage(`★ BONUS WORD DISCOVERED: ${word}! (+150)`)
      }
      setCurrentSlots([])
      return
    }

    // Wrong word
    sound.playDoorLocked()
    setMessage(`"${word}" is not on the list. Try another clue!`)
    setTimeout(() => setMessage(''), 2500)
    setCurrentSlots([])
  }

  // Keyboard support for typing letters
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace') {
        setCurrentSlots((prev) => prev.slice(0, -1))
      } else if (e.key === 'Enter') {
        handleSubmit()
      } else if (/^[a-zA-Z]$/.test(e.key) && currentSlots.length < 5) {
        sound.playTypewriter()
        setCurrentSlots((prev) => [...prev, e.key.toUpperCase()])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlots, currentSet, foundBasicWords, foundBonusWords])

  // Auto-solve helper for quick testing
  const handleAutoSolve = () => {
    setFoundBasicWords(currentSet.basicWords.map((b) => b.word))
    setFoundBonusWords(currentSet.bonusWords.slice(0, 2).map((b) => b.word))
    setScore(550)
    sound.playVictory()
    setMessage('⚡ Auto-solved Basic & Bonus words!')
  }

  return (
    <div className="relative w-screen h-screen bg-[#121212] text-white flex flex-col items-center justify-between p-3 sm:p-5 select-none font-sans overflow-y-auto">
      
      {/* 1. TOP HEADER & TITLE (Image 2 Style) */}
      <div className="w-full max-w-4xl flex flex-col items-center pt-2">
        {/* Navigation & Controls Bar */}
        <div className="w-full flex items-center justify-between px-2 mb-2 text-xs">
          <button
            onClick={onExit}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 font-bold cursor-pointer transition"
          >
            ← Exit
          </button>
          <span className="font-mono text-gray-400">
            SUBLEVEL 3: DOUBLE CADGY CIPHER
          </span>
          <button
            onClick={handleAutoSolve}
            className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition shadow"
          >
            ⚡ Auto Solve
          </button>
        </div>

        {/* Double Cadgy Title with 5 Golden Wooden Letter Blocks (Image 2) */}
        <div className="flex flex-col items-center my-1">
          <span className="text-[11px] font-black tracking-[0.3em] uppercase text-red-500 drop-shadow mb-1">
            DOUBLE
          </span>
          <div className="flex items-center gap-2">
            {currentSet.titleLetters.map((char, i) => (
              <div
                key={i}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#b45309] border border-amber-300 shadow-[0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center font-mono font-black text-xl sm:text-2xl text-black"
              >
                {char}
              </div>
            ))}
          </div>
          <span className="text-[11px] font-mono text-gray-400 mt-2">
            Sector 2 • GlitchVerse Word Matrix
          </span>
        </div>

        {/* Stats & Tools Bar (Score, Timer, Shuffle - Image 2) */}
        <div className="flex items-center gap-2 sm:gap-3 mt-3 bg-[#1e1e1e] px-4 py-2 rounded-2xl border border-white/10 shadow-lg text-xs">
          <div className="font-mono font-bold text-yellow-400">
            Score: <span className="text-white font-black">{score}</span>
          </div>
          <span>•</span>
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1 hover:text-yellow-400 cursor-pointer font-semibold transition"
          >
            🔀 Shuffle
          </button>
          <span>•</span>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 hover:text-red-400 cursor-pointer font-semibold transition"
          >
            ✕ Clear
          </button>
        </div>
      </div>

      {/* 2. MAIN GAME AREA (Center 3D Board + Right Clues Panel) */}
      <div className="w-full max-w-4xl flex-1 flex flex-col md:flex-row items-center justify-center gap-6 my-3">
        
        {/* LEFT / CENTER: 3D STACKED WOODEN LETTER TILES MATRIX (Image 2) */}
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-5 gap-2 sm:gap-3 p-4 bg-[#181818] rounded-3xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            {currentSet.boardColumns.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-2 sm:gap-3">
                {col.map((cell, rowIdx) => {
                  const isHeart = cell === '💖'
                  return (
                    <button
                      key={rowIdx}
                      onClick={() => handleTileClick(cell)}
                      className={`h-11 w-11 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center font-bold text-base sm:text-xl font-mono cursor-pointer transition-all active:scale-90 select-none shadow-[0_5px_0_rgba(100,60,20,0.8),0_8px_14px_rgba(0,0,0,0.6)] ${
                        isHeart
                          ? 'bg-gradient-to-b from-amber-400 to-orange-500 border border-amber-300 text-xl animate-pulse'
                          : 'bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#f59e0b] border-t border-l border-white/70 text-[#451a03] hover:brightness-105'
                      }`}
                    >
                      {cell}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Under-grid Letter Blank Slots (_ _ _ _ _) with Typing Preview */}
          <div className="flex items-center gap-3 mt-4">
            {[0, 1, 2, 3, 4].map((idx) => {
              const letter = currentSlots[idx]
              return (
                <div
                  key={idx}
                  onClick={() => letter && handleSlotClick(idx)}
                  className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center font-mono font-black text-xl border-2 transition-all cursor-pointer ${
                    letter
                      ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-105'
                      : 'bg-white/5 border-white/20 text-gray-500'
                  }`}
                >
                  {letter || '_'}
                </div>
              )
            })}
          </div>

          {/* Action Buttons: Submit */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold tracking-wider cursor-pointer transition"
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={currentSlots.length === 0}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer disabled:opacity-40 transition"
            >
              Submit Word ↵
            </button>
          </div>

          {/* Feedback Message */}
          {message && (
            <div className="mt-2 text-xs font-mono font-bold text-yellow-300 animate-pulse">
              {message}
            </div>
          )}
        </div>

        {/* RIGHT: BASIC WORDS & BONUS WORDS CLUE PANELS (Image 3) */}
        <div className="w-full md:w-80 flex flex-col gap-3">
          
          {/* Panel 1: Basic words (Image 3 Style) */}
          <div className="p-4 rounded-2xl bg-[#131f18] border border-emerald-500/40 shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pb-1.5 border-b border-emerald-500/30">
              <span className="uppercase tracking-wider">Basic words</span>
              <span className="font-mono">({foundBasicWords.length}/{currentSet.basicWords.length})</span>
            </div>

            <div className="flex flex-col gap-2">
              {currentSet.basicWords.map((item) => {
                const isFound = foundBasicWords.includes(item.word)
                return (
                  <div
                    key={item.word}
                    className={`p-2.5 rounded-xl border text-xs leading-snug transition-all ${
                      isFound
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                        : 'bg-black/40 border-white/10 text-gray-300'
                    }`}
                  >
                    <div className="font-extrabold flex items-center gap-1.5">
                      {isFound ? (
                        <span className="text-emerald-400 font-black">✓ {item.word}:</span>
                      ) : (
                        <span className="text-gray-400 tracking-wider">_____ :</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-gray-300 text-[11px]">{item.clue}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Panel 2: Bonus words (Max 3, Image 3 Style) */}
          <div className="p-4 rounded-2xl bg-[#111928] border border-sky-500/40 shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-sky-400 pb-1.5 border-b border-sky-500/30">
              <span className="uppercase tracking-wider">Bonus words</span>
              <span className="font-mono">({foundBonusWords.length}/3)</span>
            </div>

            <div className="flex flex-col gap-2">
              {currentSet.bonusWords.slice(0, 3).map((item) => {
                const isFound = foundBonusWords.includes(item.word)
                return (
                  <div
                    key={item.word}
                    className={`p-2.5 rounded-xl border text-xs leading-snug transition-all ${
                      isFound
                        ? 'bg-sky-950/80 border-sky-400 text-sky-200'
                        : 'bg-black/40 border-white/10 text-gray-400'
                    }`}
                  >
                    <div className="font-extrabold flex items-center gap-1.5">
                      {isFound ? (
                        <span className="text-sky-400 font-black">★ {item.word}:</span>
                      ) : (
                        <span className="text-gray-500 tracking-wider">Bonus Clue:</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-gray-300 text-[11px]">{item.clue}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sublevel 3 Completion Advance Button */}
          {isBasicCompleted && (
            <button
              onClick={onComplete}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:brightness-110 active:scale-95 cursor-pointer transition flex items-center justify-center gap-2 animate-bounce"
            >
              <span>Sublevel 3 Cleared! Advance to Sublevel 4</span>
              <span>➔</span>
            </button>
          )}

        </div>

      </div>

      {/* 3. BOTTOM HINT */}
      <div className="text-xs text-gray-500 text-center pb-2">
        Tap tiles to form 5-letter words from the clues, or type with keyboard
      </div>
    </div>
  )
}
