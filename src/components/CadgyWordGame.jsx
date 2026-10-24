import { useState, useEffect, useRef } from 'react'
import { sound } from '../utils/AudioEngine'
import { CADGY_PUZZLE_BOARDS } from '../data/cadgyBoards'

export default function CadgyWordGame({ onComplete, onExit }) {
  // Pick random puzzle board from CADGY_PUZZLE_BOARDS
  const [boardIndex, setBoardIndex] = useState(() =>
    Math.floor(Math.random() * CADGY_PUZZLE_BOARDS.length)
  )
  const currentBoard = CADGY_PUZZLE_BOARDS[boardIndex]

  // Selected tiles: array of tile objects { id, char, col, row }
  const [selectedTiles, setSelectedTiles] = useState([])
  const [foundBasicWords, setFoundBasicWords] = useState([])
  const [foundBonusWords, setFoundBonusWords] = useState([])
  const [score, setScore] = useState(30)
  const [commentary, setCommentary] = useState('')
  const [commentaryColor, setCommentaryColor] = useState('text-emerald-400')
  const [isVerifying, setIsVerifying] = useState(false)
  const autoAdvanceTriggered = useRef(false)
  const boardRef = useRef(null)

  const isBasicComplete =
    currentBoard.basicWords.length > 0 &&
    foundBasicWords.length === currentBoard.basicWords.length

  // Switch to another board
  const handleSwitchBoard = (newIndex = null) => {
    sound.playKeyClick()
    const nextIdx =
      newIndex !== null
        ? newIndex
        : (boardIndex + 1) % CADGY_PUZZLE_BOARDS.length
    setBoardIndex(nextIdx)
    setSelectedTiles([])
    setFoundBasicWords([])
    setFoundBonusWords([])
    setCommentary('')
    autoAdvanceTriggered.current = false
  }

  // Automatic advance once all basic words are solved - NO FINISH BUTTON NEEDED!
  useEffect(() => {
    if (isBasicComplete && !autoAdvanceTriggered.current) {
      autoAdvanceTriggered.current = true
      sound.playVictory()
      setCommentary('🎉 ALL BASIC WORDS SOLVED! ADVANCING TO RIDDLE BOARD...')
      setCommentaryColor('text-emerald-300 font-extrabold')
      const timeout = setTimeout(() => {
        onComplete && onComplete()
      }, 1600)
      return () => clearTimeout(timeout)
    }
  }, [isBasicComplete, onComplete])

  // Auto-verification whenever selected word reaches 5 characters!
  useEffect(() => {
    const currentWord = selectedTiles.map((t) => t.char).join('').toUpperCase()

    if (currentWord.length >= 5 && !isVerifying) {
      setIsVerifying(true)

      // Automatic verification against Basic Words
      const basicMatch = currentBoard.basicWords.find((b) => b.word === currentWord)
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
        }, 550)
        return
      }

      // Automatic verification against Bonus Words
      const bonusMatch = currentBoard.bonusWords.find((b) => b.word === currentWord)
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
        }, 550)
        return
      }

      // Word not in today's clue list
      sound.playDoorLocked()
      setCommentary(
        `"${currentWord}" is a good guess, but it's not selected for today's clues.`
      )
      setCommentaryColor('text-rose-400')

      setTimeout(() => {
        setSelectedTiles([])
        setIsVerifying(false)
      }, 800)
    }
  }, [selectedTiles, isVerifying, currentBoard, foundBasicWords, foundBonusWords])

  // Tile Selection Handler
  const handleTileClick = (tile, colIndex) => {
    if (isVerifying || isBasicComplete) return

    sound.playTypewriter()

    // 1. Check if clicking on already selected tile -> deselect it
    const existingIndex = selectedTiles.findIndex((t) => t.id === tile.id)
    if (existingIndex !== -1) {
      setSelectedTiles((prev) => prev.filter((_, idx) => idx !== existingIndex))
      return
    }

    // 2. If tile from this column is already selected, replace it
    const filtered = selectedTiles.filter((t) => t.col !== colIndex)

    // 3. Keep column order sorted 0..4
    const nextSelection = [...filtered, { ...tile, col: colIndex }].sort(
      (a, b) => a.col - b.col
    )
    setSelectedTiles(nextSelection)
  }

  // Quick auto-solve for testing
  const handleAutoSolve = () => {
    sound.playVictory()
    const allBasic = currentBoard.basicWords.map((b) => b.word)
    setFoundBasicWords(allBasic)
    setScore((s) => s + 300)
  }

  const currentSpelled = selectedTiles.map((t) => t.char)

  return (
    <div className="relative w-screen h-screen bg-[#140b22] text-white flex flex-col items-center justify-between overflow-y-auto select-none font-sans p-3 sm:p-5">
      
      {/* 1. TOP HEADER & NAVIGATION BAR */}
      <div className="w-full max-w-4xl flex items-center justify-between border-b border-purple-900/50 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold transition cursor-pointer"
          >
            ← Exit
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            <span className="font-mono text-purple-300 font-bold text-xs uppercase tracking-wider">
              {currentBoard.title}
            </span>
          </div>
        </div>

        {/* Puzzle Selector & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoSolve}
            className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition shadow active:scale-95"
          >
            ⚡ Auto Solve
          </button>
          <button
            onClick={() => handleSwitchBoard()}
            className="px-3 py-1 rounded-full bg-purple-800 hover:bg-purple-700 text-purple-100 font-bold text-xs cursor-pointer transition shadow active:scale-95"
          >
            🔄 New Board
          </button>
          <div className="px-3 py-1 rounded-full bg-purple-950 border border-purple-500/50 text-xs font-mono font-bold text-amber-300 shadow">
            SCORE: {score}
          </div>
        </div>
      </div>

      {/* 2. INSPIRATION BANNER (Onelook Cadgy Reproduction) */}
      <div className="w-full max-w-xl text-center my-1">
        <div className="text-[11px] font-mono text-purple-300/80 tracking-widest uppercase">
          DOUBLE CADGY • COLUMN WORD PUZZLE
        </div>
        <p className="text-xs text-gray-300 mt-0.5">
          Pick 1 tile from each column left-to-right to construct 5-letter words. Auto-verifies immediately!
        </p>
      </div>

      {/* 3. 3D STACKED TILES BOARD (Image 3 Cadgy Layout) */}
      <div
        ref={boardRef}
        className="w-full max-w-xl flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-[#1e1333]/90 border-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.35)] backdrop-blur my-auto"
      >
        {/* 5 COLUMNS OF TILES */}
        <div className="grid grid-cols-5 gap-2 sm:gap-4 w-full">
          {currentBoard.board.map((colTiles, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-2">
              {colTiles.map((tile, rowIdx) => {
                const isSelected = selectedTiles.some((t) => t.id === tile.id)

                return (
                  <button
                    key={tile.id}
                    onClick={() => handleTileClick(tile, colIdx)}
                    className={`relative h-11 sm:h-13 w-full rounded-xl flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-t from-purple-500 to-fuchsia-400 text-white scale-105 shadow-[0_0_18px_rgba(217,70,239,0.9)] ring-2 ring-white z-10 translate-y-[-2px]'
                        : tile.isHeart
                        ? 'bg-[#2a1b46] hover:bg-[#3b2760] text-rose-400 border border-purple-500/30 shadow-md'
                        : 'bg-[#2a1b46] hover:bg-[#3b2760] text-gray-100 border border-purple-500/30 shadow-md hover:scale-102'
                    }`}
                  >
                    {tile.char}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Spelled Word Output Bar with blank lines */}
        <div className="flex items-center gap-3 sm:gap-4 mt-4 font-mono font-black text-xl sm:text-2xl tracking-[0.25em] text-white">
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

        {/* Auto-verify instruction & Commentary */}
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
              <span className="font-mono">({foundBasicWords.length}/{currentBoard.basicWords.length})</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {currentBoard.basicWords.map((b) => (
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
              {currentBoard.bonusWords.map((b) => (
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

        {/* Auto-Advance Notification - NO FINISH BUTTON NEEDED */}
        {isBasicComplete && (
          <div className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.7)] flex items-center justify-center gap-2 animate-bounce">
            <span>✓ ALL BASIC WORDS SOLVED! ADVANCING TO RIDDLE BOARD...</span>
          </div>
        )}
      </div>

    </div>
  )
}
