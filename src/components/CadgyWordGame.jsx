import { useState, useEffect, useRef } from 'react'
import { sound } from '../utils/AudioEngine'

// Exact Puzzle configuration from https://www.onelook.com/cadgy/2026-10-23 (Image 3)
const CADGY_BOARD = [
  // 5 Columns of stacked tiles
  [
    { id: 'c0-r0', char: 'G', row: 0, col: 0 },
    { id: 'c0-r1', char: 'T', row: 1, col: 0 },
    { id: 'c0-r2', char: 'H', row: 2, col: 0 },
    { id: 'c0-r3', char: 'S', row: 3, col: 0 },
    { id: 'c0-r4', char: '💖', row: 4, col: 0, isHeart: true },
  ],
  [
    { id: 'c1-r0', char: 'L', row: 0, col: 1 },
    { id: 'c1-r1', char: 'R', row: 1, col: 1 },
    { id: 'c1-r2', char: 'E', row: 2, col: 1 },
    { id: 'c1-r3', char: 'K', row: 3, col: 1 },
    { id: 'c1-r4', char: 'CI', row: 4, col: 1 },
  ],
  [
    { id: 'c2-r0', char: 'N', row: 0, col: 2 },
    { id: 'c2-r1', char: 'I', row: 1, col: 2 },
    { id: 'c2-r2', char: '💖', row: 2, col: 2, isHeart: true },
    { id: 'c2-r3', char: 'EN', row: 3, col: 2 },
    { id: 'c2-r4', char: 'A', row: 4, col: 2 },
  ],
  [
    { id: 'c3-r0', char: 'C', row: 0, col: 3 },
    { id: 'c3-r1', char: 'R', row: 1, col: 3 },
    { id: 'c3-r2', char: 'S', row: 2, col: 3 },
    { id: 'c3-r3', char: 'D', row: 3, col: 3 },
    { id: 'c3-r4', char: 'B', row: 4, col: 3 },
  ],
  [
    { id: 'c4-r0', char: '💖', row: 0, col: 4, isHeart: true },
    { id: 'c4-r1', char: 'T', row: 1, col: 4 },
    { id: 'c4-r2', char: 'S', row: 2, col: 4 },
    { id: 'c4-r3', char: 'E', row: 3, col: 4 },
    { id: 'c4-r4', char: '💖', row: 4, col: 4, isHeart: true },
  ],
]

// Target Basic Words & Bonus Words from Image 3
const BASIC_WORDS = [
  { word: 'HEADS', clue: 'Uppermost parts of human bodies' },
  { word: 'HEART', clue: 'Muscular organ that pumps blood' },
  { word: 'TRADE', clue: 'Exchange of goods or services' },
]

const BONUS_WORDS = [
  { word: 'GEARS', clue: 'Mechanical toothed wheels transmitting motion' },
  { word: 'GENRE', clue: 'Category of artistic or literary works' },
  { word: 'GLACE', clue: 'Glazed fruit or frozen dessert; from French for ice' },
]

export default function CadgyWordGame({ onComplete, onExit }) {
  // Selected tiles: array of tile objects { id, char, col, row }
  const [selectedTiles, setSelectedTiles] = useState([])
  const [foundBasicWords, setFoundBasicWords] = useState([])
  const [foundBonusWords, setFoundBonusWords] = useState([])
  const [score, setScore] = useState(30)
  const [commentary, setCommentary] = useState('')
  const [commentaryColor, setCommentaryColor] = useState('text-emerald-400')
  const [isVerifying, setIsVerifying] = useState(false)
  const boardRef = useRef(null)

  const isBasicComplete = foundBasicWords.length === BASIC_WORDS.length

  // Auto-verification whenever selected word reaches 5 characters!
  useEffect(() => {
    const currentWord = selectedTiles.map((t) => t.char).join('').toUpperCase()

    if (currentWord.length >= 5 && !isVerifying) {
      setIsVerifying(true)

      // Automatic verification
      const basicMatch = BASIC_WORDS.find((b) => b.word === currentWord)
      if (basicMatch) {
        if (foundBasicWords.includes(currentWord)) {
          setCommentary(`Already solved "${currentWord}"!`)
          setCommentaryColor('text-yellow-400')
        } else {
          sound.playWordFound()
          setFoundBasicWords((prev) => [...prev, currentWord])
          setScore((s) => s + 100)
          setCommentary(`✓ "${currentWord}": ${basicMatch.clue} (+100)`)
          setCommentaryColor('text-emerald-400')
        }
        setTimeout(() => {
          setSelectedTiles([])
          setIsVerifying(false)
        }, 600)
        return
      }

      const bonusMatch = BONUS_WORDS.find((b) => b.word === currentWord)
      if (bonusMatch) {
        if (foundBonusWords.includes(currentWord)) {
          setCommentary(`Already discovered bonus "${currentWord}"!`)
          setCommentaryColor('text-yellow-400')
        } else {
          sound.playVictory()
          setFoundBonusWords((prev) => [...prev, currentWord])
          setScore((s) => s + 150)
          setCommentary(`★ BONUS WORD DISCOVERED: "${currentWord}": ${bonusMatch.clue} (+150)`)
          setCommentaryColor('text-sky-400')
        }
        setTimeout(() => {
          setSelectedTiles([])
          setIsVerifying(false)
        }, 600)
        return
      }

      // Word not in today's clue list (Image 3 commentary style)
      sound.playDoorLocked()
      setCommentary(
        `"${currentWord}" is a good guess, but it's not selected for today's clues.`
      )
      setCommentaryColor('text-emerald-500/80')

      setTimeout(() => {
        setSelectedTiles([])
        setIsVerifying(false)
      }, 750)
    }
  }, [selectedTiles, foundBasicWords, foundBonusWords, isVerifying])

  // Handle clicking a tile on the board
  const handleTileClick = (tile) => {
    if (isVerifying) return

    if (tile.isHeart) {
      sound.playTypewriter()
      setScore((s) => s + 20)
      setCommentary('💖 Heart Bonus! +20 points!')
      setCommentaryColor('text-rose-400')
      setTimeout(() => setCommentary(''), 1200)
      return
    }

    // If tile already selected, deselect from this tile onward
    const existingIndex = selectedTiles.findIndex((t) => t.id === tile.id)
    if (existingIndex !== -1) {
      sound.playTypewriter()
      setSelectedTiles((prev) => prev.slice(0, existingIndex))
      return
    }

    if (selectedTiles.length < 5) {
      sound.playTypewriter()
      setSelectedTiles((prev) => [...prev, tile])
    }
  }

  // Clear current word
  const handleClear = () => {
    sound.playTypewriter()
    setSelectedTiles([])
    setCommentary('')
  }

  // Auto solve for testing
  const handleAutoSolve = () => {
    setFoundBasicWords(BASIC_WORDS.map((b) => b.word))
    setFoundBonusWords(BONUS_WORDS.slice(0, 2).map((b) => b.word))
    setScore(520)
    sound.playVictory()
    setCommentary('All basic words auto-verified!')
    setCommentaryColor('text-emerald-400')
  }

  const currentSpelled = selectedTiles.map((t) => t.char)

  return (
    <div className="relative w-screen h-screen bg-[#0e0e0e] text-white flex flex-col items-center justify-between p-3 select-none font-sans overflow-y-auto">
      
      {/* 1. TOP HEADER & NAVIGATION (Image 3 Style) */}
      <div className="w-full max-w-xl flex items-center justify-between pt-1 pb-1 text-xs">
        <button
          onClick={onExit}
          className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 font-bold cursor-pointer transition"
        >
          ← Exit
        </button>
        <span className="font-mono text-gray-400">
          onelook.com/cadgy • Exact Layout
        </span>
        <button
          onClick={handleAutoSolve}
          className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition shadow"
        >
          ⚡ Auto Solve
        </button>
      </div>

      {/* 2. SIGNATURE DOUBLE CADGY BANNER (Image 3 Style) */}
      <div className="flex flex-col items-center">
        {/* DOUBLE in red outline font */}
        <div className="flex items-center gap-1 mb-1">
          {['D', 'O', 'U', 'B', 'L', 'E'].map((letter, i) => (
            <span
              key={i}
              className="text-xs sm:text-sm font-black font-mono text-white tracking-widest px-1 py-0.5 rounded bg-red-600/90 shadow-sm border border-red-400"
            >
              {letter}
            </span>
          ))}
        </div>

        {/* CADGY connected orange square wooden blocks */}
        <div className="relative flex items-center">
          {/* Horizontal connector bar behind blocks */}
          <div className="absolute inset-x-2 h-2.5 bg-[#78350f] rounded pointer-events-none top-1/2 -translate-y-1/2" />
          <div className="relative flex items-center gap-2">
            {['C', 'A', 'D', 'G', 'Y'].map((char, i) => (
              <div
                key={i}
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#b45309] border-2 border-amber-300 shadow-[0_5px_12px_rgba(0,0,0,0.8)] flex items-center justify-center font-mono font-black text-2xl text-black"
              >
                {char}
              </div>
            ))}
          </div>
        </div>

        {/* Date string */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mt-2">
          <span>October 23, 2026</span>
          <span>📅</span>
        </div>

        {/* Controls Pill Bar (Score: 30, Timer, Shuffle, 3D, Solo, ? - Image 3) */}
        <div className="flex items-center gap-2.5 mt-2.5 bg-[#1a1a1a] px-4 py-1.5 rounded-2xl border border-white/10 shadow-lg text-xs font-mono">
          <div className="font-bold text-gray-200">
            Score: <span className="font-black text-white">{score}</span>
          </div>
          <span>•</span>
          <span title="Timer">⏱️</span>
          <span>•</span>
          <button
            onClick={() => handleClear()}
            className="hover:text-yellow-400 cursor-pointer transition font-bold"
          >
            Shuffle
          </button>
          <span>•</span>
          <span className="text-gray-400">3D</span>
          <span>•</span>
          <span title="Players">👥</span>
          <span>•</span>
          <span className="text-gray-400 font-bold">?</span>
        </div>
      </div>

      {/* 3. THE 3D ISOMETRIC STACKED TILES BOARD WITH PURPLE SELECTION (Image 3) */}
      <div className="relative flex flex-col items-center my-2" ref={boardRef}>
        <div className="grid grid-cols-5 gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-3xl bg-[#121212]/90 border border-white/5 shadow-2xl">
          {CADGY_BOARD.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-2.5 sm:gap-3">
              {col.map((tile) => {
                const isSelected = selectedTiles.some((t) => t.id === tile.id)
                const isHeart = tile.isHeart

                return (
                  <button
                    key={tile.id}
                    onClick={() => handleTileClick(tile)}
                    className={`relative h-11 w-11 sm:h-13 sm:w-13 md:h-14 md:w-14 rounded-2xl flex items-center justify-center font-black text-base sm:text-xl font-mono cursor-pointer transition-all duration-200 active:scale-90 select-none ${
                      isSelected
                        ? 'bg-[#d8b4fe] text-[#3b0764] shadow-[0_6px_0_#9333ea,0_10px_20px_rgba(147,51,234,0.5)] scale-105 z-20 border-2 border-[#a855f7]'
                        : isHeart
                        ? 'bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-xl shadow-[0_5px_0_#78350f,0_8px_14px_rgba(0,0,0,0.6)] border border-amber-300 animate-pulse'
                        : 'bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#f59e0b] text-[#451a03] shadow-[0_5px_0_#78350f,0_8px_14px_rgba(0,0,0,0.6)] border-t border-l border-white/80 hover:brightness-105'
                    }`}
                  >
                    {tile.char}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Spelled Word Output Bar with blank lines (G L I S _ from Image 3) */}
        <div className="flex items-center gap-3 sm:gap-4 mt-3 font-mono font-black text-xl sm:text-2xl tracking-[0.25em] text-white">
          {[0, 1, 2, 3, 4].map((idx) => {
            const letter = currentSpelled[idx]
            return (
              <span
                key={idx}
                className={`transition-all ${
                  letter ? 'text-purple-300 scale-110 drop-shadow' : 'text-gray-600'
                }`}
              >
                {letter || '_'}
              </span>
            )
          })}
        </div>

        {/* Auto-verify instruction & Commentary in Green (Image 3 Style) */}
        <div className="h-10 mt-2 flex items-center justify-center text-center px-4">
          {commentary ? (
            <div className={`text-xs sm:text-sm font-serif italic ${commentaryColor} animate-fadeIn`}>
              {commentary}
            </div>
          ) : (
            <div className="text-[11px] font-mono text-gray-500">
              ⚡ Auto-verifies immediately upon selecting 5 letters!
            </div>
          )}
        </div>
      </div>

      {/* 4. CLUES ACCORDION / PANELS (Basic Words & Bonus Words) */}
      <div className="w-full max-w-xl flex flex-col gap-2 pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Basic Words Checklist */}
          <div className="p-3 rounded-2xl bg-[#142319] border border-emerald-500/40">
            <div className="flex items-center justify-between font-bold text-emerald-400 mb-1.5">
              <span>BASIC WORDS</span>
              <span className="font-mono">({foundBasicWords.length}/{BASIC_WORDS.length})</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {BASIC_WORDS.map((b) => (
                <div key={b.word} className="text-[11px]">
                  {foundBasicWords.includes(b.word) ? (
                    <span className="text-emerald-300 font-bold">✓ {b.word}: {b.clue}</span>
                  ) : (
                    <span className="text-gray-400">_____ : {b.clue}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bonus Words Checklist */}
          <div className="p-3 rounded-2xl bg-[#121c2d] border border-sky-500/40">
            <div className="flex items-center justify-between font-bold text-sky-400 mb-1.5">
              <span>BONUS WORDS (Max 3)</span>
              <span className="font-mono">({foundBonusWords.length}/3)</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {BONUS_WORDS.map((b) => (
                <div key={b.word} className="text-[11px]">
                  {foundBonusWords.includes(b.word) ? (
                    <span className="text-sky-300 font-bold">★ {b.word}: {b.clue}</span>
                  ) : (
                    <span className="text-gray-500">Bonus Clue: {b.clue}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Completion Advance Button */}
        {isBasicComplete && (
          <button
            onClick={onComplete}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.7)] hover:brightness-110 active:scale-95 cursor-pointer transition flex items-center justify-center gap-2 animate-bounce"
          >
            <span>Sublevel 3 Cleared! Advance to Riddle Board</span>
            <span>➔</span>
          </button>
        )}
      </div>

    </div>
  )
}
