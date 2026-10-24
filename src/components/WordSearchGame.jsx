import { useState, useEffect, useRef } from 'react'
import { sound } from '../utils/AudioEngine'
import { WORD_THEMES, GRID_SIZE, generateThemedWordSearch } from '../data/wordSearchThemes'

export default function WordSearchGame({ onComplete, onExit }) {
  const [puzzleData, setPuzzleData] = useState(() => generateThemedWordSearch())
  const [foundWords, setFoundWords] = useState([])
  const [foundLines, setFoundLines] = useState([]) // array of { cells, word }
  const [selection, setSelection] = useState([])
  const [seconds, setSeconds] = useState(0)
  const [activeWordPreview, setActiveWordPreview] = useState('')
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(null)

  const startCell = useRef(null)
  const isDragging = useRef(false)
  const gridContainerRef = useRef(null)

  // Timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTimer = (s) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Completion check & automatic advance
  const isAllFound =
    puzzleData.placedWords.length > 0 &&
    foundWords.length === puzzleData.placedWords.length

  useEffect(() => {
    if (isAllFound && autoAdvanceCountdown === null) {
      sound.playVictory()
      setAutoAdvanceCountdown(1)
      const timeout = setTimeout(() => {
        onComplete && onComplete()
      }, 750)
      return () => clearTimeout(timeout)
    }
  }, [isAllFound, onComplete, autoAdvanceCountdown])

  const cellKey = (x, y) => `${x}-${y}`

  // Calculate STRICT STRAIGHT LINE with snapping for Diagonal, Horizontal, and Vertical
  // Allows dragging diagonally in all 4 directions (down-right, down-left, up-right, up-left)
  // as well as horizontal (left, right) and vertical (up, down).
  const calculateStraightLine = (x0, y0, x1, y1) => {
    const dx = x1 - x0
    const dy = y1 - y0

    if (dx === 0 && dy === 0) return [cellKey(x0, y0)]

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    let stepX = 0
    let stepY = 0
    let steps = 0

    // Ratio dy/dx to cleanly classify angle into Horizontal, Vertical, or 45-degree Diagonal
    const ratio = absDx === 0 ? 999 : absDy / absDx

    if (ratio < 0.45) {
      // Horizontal (left or right)
      stepX = Math.sign(dx)
      stepY = 0
      steps = absDx
    } else if (ratio > 2.2) {
      // Vertical (up or down)
      stepX = 0
      stepY = Math.sign(dy)
      steps = absDy
    } else {
      // 45° Diagonal (down-right, down-left, up-right, up-left)
      stepX = Math.sign(dx)
      stepY = Math.sign(dy)
      steps = Math.min(absDx, absDy)
    }

    const line = []
    for (let i = 0; i <= steps; i++) {
      const curX = x0 + i * stepX
      const curY = y0 + i * stepY
      if (curX >= 0 && curX < GRID_SIZE && curY >= 0 && curY < GRID_SIZE) {
        line.push(cellKey(curX, curY))
      }
    }
    return line.length > 0 ? line : [cellKey(x0, y0)]
  }

  // Mouse selection handlers
  const handleCellMouseDown = (x, y) => {
    isDragging.current = true
    startCell.current = { x, y }
    setSelection([cellKey(x, y)])
    setActiveWordPreview(puzzleData.grid[y][x])
    sound.playTypewriter()
  }

  const handleCellMouseEnter = (x, y) => {
    if (!isDragging.current || !startCell.current) return
    const line = calculateStraightLine(startCell.current.x, startCell.current.y, x, y)
    setSelection(line)

    const letters = line
      .map((k) => {
        const [cx, cy] = k.split('-').map(Number)
        return puzzleData.grid[cy][cx]
      })
      .join('')
    setActiveWordPreview(letters)
  }

  const handleMouseUp = () => {
    if (!isDragging.current) return
    isDragging.current = false

    const selectedLetters = selection
      .map((k) => {
        const [x, y] = k.split('-').map(Number)
        return puzzleData.grid[y][x]
      })
      .join('')

    const reversedLetters = selectedLetters.split('').reverse().join('')

    let match = null
    for (const item of puzzleData.placedWords) {
      if (
        !foundWords.includes(item.word) &&
        (item.word === selectedLetters || item.word === reversedLetters)
      ) {
        match = item
        break
      }
    }

    if (match) {
      sound.playWordFound()
      setFoundWords((prev) => [...prev, match.word])
      setFoundLines((prev) => [...prev, { cells: [...selection], word: match.word }])
      setActiveWordPreview(match.word)
    }

    setSelection([])
    startCell.current = null
  }

  // Touch Support
  const handleTouchStart = (e, x, y) => {
    handleCellMouseDown(x, y)
  }

  const handleTouchMove = (e) => {
    if (!isDragging.current || !startCell.current || !gridContainerRef.current) return
    const touch = e.touches[0]
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY)
    if (targetEl && targetEl.dataset && targetEl.dataset.coords) {
      const [x, y] = targetEl.dataset.coords.split('-').map(Number)
      if (!isNaN(x) && !isNaN(y)) {
        const line = calculateStraightLine(startCell.current.x, startCell.current.y, x, y)
        setSelection(line)
        const letters = line
          .map((k) => {
            const [cx, cy] = k.split('-').map(Number)
            return puzzleData.grid[cy][cx]
          })
          .join('')
        setActiveWordPreview(letters)
      }
    }
  }

  const handleAutoSolve = () => {
    const all = puzzleData.placedWords.map((p) => p.word)
    const allLines = puzzleData.placedWords.map((p) => ({
      cells: p.cells,
      word: p.word,
    }))
    setFoundWords(all)
    setFoundLines(allLines)
    sound.playVictory()
  }

  const handleNewPuzzle = (specificThemeId = null) => {
    sound.playKeyClick()
    const nextPuzzle = generateThemedWordSearch(specificThemeId)
    setPuzzleData(nextPuzzle)
    setFoundWords([])
    setFoundLines([])
    setSelection([])
    setActiveWordPreview('')
    setAutoAdvanceCountdown(null)
    setSeconds(0)
  }

  // Set of all found cell keys for fast background highlighting
  const allFoundCellKeys = new Set(foundLines.flatMap((l) => l.cells))

  return (
    <div
      className="relative w-screen h-screen bg-[#0284c7] flex flex-col items-center justify-between overflow-hidden select-none font-sans"
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      {/* 1. TOP WINDOWS-STYLE APP BAR (Image 1 Style) */}
      <div className="w-full bg-[#0284c7] text-white flex items-center justify-between px-4 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">🔤</span>
          <span className="font-semibold tracking-wide">Word Search Crossword Puzzles</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="hover:bg-white/20 px-2 py-0.5 rounded text-white cursor-pointer">─</button>
          <button className="hover:bg-white/20 px-2 py-0.5 rounded text-white cursor-pointer">□</button>
          <button onClick={onExit} className="hover:bg-red-600 px-2 py-0.5 rounded text-white cursor-pointer">✕</button>
        </div>
      </div>

      {/* 2. SUB-HEADER TOOLBAR (Timer, Active Theme, Mode, Actions - Image 1 Style) */}
      <div className="w-full bg-[#f0f9ff] text-slate-800 flex flex-wrap items-center justify-between px-4 sm:px-6 py-2 border-b border-sky-200 shadow-sm text-sm gap-2">
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          <button
            onClick={onExit}
            className="text-slate-600 hover:text-black font-extrabold text-base flex items-center gap-1 cursor-pointer"
            title="Return to Menu"
          >
            ←
          </button>
          <div className="font-mono font-bold text-sky-700 flex items-center gap-1.5 bg-sky-100/70 px-2.5 py-0.5 rounded-full border border-sky-300">
            <span>⏱️</span>
            <span>{formatTimer(seconds)}</span>
          </div>

          {/* Active Theme Pill */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300 shadow-sm">
            <span>🏷️ THEME:</span>
            <span className="uppercase">{puzzleData.theme.name}</span>
          </div>

          <span className="hidden lg:inline-block text-[11px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-300">
            Straight Lines: ↔ ↕ ⤢ Diagonal (All Directions)
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium text-slate-700">
          <button
            onClick={handleAutoSolve}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold cursor-pointer transition shadow-sm active:scale-95"
          >
            ⚡ Auto Solve
          </button>
          <button
            onClick={() => handleNewPuzzle()}
            className="hover:text-black flex items-center gap-1 px-3 py-1 rounded-full bg-sky-200 hover:bg-sky-300 text-sky-900 font-bold cursor-pointer transition active:scale-95"
          >
            🔄 New Puzzle
          </button>
        </div>
      </div>

      {/* 3. MAIN WHITE PUZZLE CONTAINER (Faithful Image 1 Reproduction) */}
      <div className="flex-1 w-full max-w-6xl p-2 sm:p-4 flex items-center justify-center overflow-y-auto">
        <div className="w-full h-full max-h-[84vh] bg-white rounded-2xl shadow-2xl border border-sky-100 flex flex-col md:flex-row overflow-hidden p-3 sm:p-6 gap-4 sm:gap-6">
          
          {/* LEFT: 12x12 LETTER GRID */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Top Green Word Badges (Image 1 Header Pills) */}
            <div className="flex items-center justify-center gap-3 mb-2 h-8">
              {activeWordPreview ? (
                <div className="flex items-center gap-3 animate-fadeIn">
                  <span className="px-4 py-1 rounded-full bg-[#22c55e] text-white font-black tracking-wider text-xs uppercase shadow-sm">
                    {activeWordPreview}
                  </span>
                  <span className="px-4 py-1 rounded-full bg-[#16a34a] text-white font-black tracking-wider text-xs uppercase shadow-sm hidden sm:inline-block">
                    {activeWordPreview.split('').reverse().join('')}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-mono font-bold text-slate-400">
                  Drag in straight lines (Horizontal, Vertical, or Diagonal)
                </span>
              )}
            </div>

            {/* Letter Grid Container with strict straight-line dragging */}
            <div
              ref={gridContainerRef}
              onTouchMove={handleTouchMove}
              className="relative p-2 rounded-xl bg-slate-50 border border-slate-200 shadow-inner"
            >
              <div
                className="grid gap-1 sm:gap-1.5 md:gap-2"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
              >
                {puzzleData.grid.map((row, y) =>
                  row.map((letter, x) => {
                    const key = cellKey(x, y)
                    const isSelected = selection.includes(key)
                    const isFound = allFoundCellKeys.has(key)

                    return (
                      <div
                        key={key}
                        data-coords={key}
                        onMouseDown={() => handleCellMouseDown(x, y)}
                        onMouseEnter={() => handleCellMouseEnter(x, y)}
                        onTouchStart={(e) => handleTouchStart(e, x, y)}
                        className={`h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-md sm:rounded-lg flex items-center justify-center font-bold text-xs sm:text-base md:text-lg select-none cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-black scale-105 shadow-md ring-2 ring-amber-500 font-black'
                            : isFound
                            ? 'bg-[#38bdf8] text-white font-black shadow-sm'
                            : 'text-slate-800 hover:bg-sky-100'
                        }`}
                      >
                        {letter}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: 2-COLUMN TARGET WORD LIST (Image 1 Style) */}
          <div className="w-full md:w-80 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  WORD LIST ({puzzleData.theme.name})
                </span>
                <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {foundWords.length} / {puzzleData.placedWords.length} Found
                </span>
              </div>

              {/* 2-Column Word List with strike-throughs */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm font-bold tracking-wide">
                {puzzleData.placedWords.map((item) => {
                  const isFound = foundWords.includes(item.word)
                  return (
                    <div
                      key={item.word}
                      className={`relative py-0.5 cursor-default transition-all ${
                        isFound
                          ? 'text-sky-700 font-extrabold'
                          : 'text-slate-700 hover:text-sky-600'
                      }`}
                    >
                      <span>{item.word}</span>
                      {/* Crisp blue strike-through line matching Image 1 */}
                      {isFound && (
                        <div className="absolute inset-y-0 left-0 right-1 flex items-center pointer-events-none">
                          <div className="w-full h-[3px] bg-[#0284c7] rounded-full shadow-[0_0_6px_rgba(2,132,199,0.8)]" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom Progress & Advance Action */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
              {isAllFound ? (
                <button
                  onClick={() => onComplete && onComplete()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition animate-bounce"
                >
                  <span>✓ ALL WORDS FOUND! ADVANCE TO MEMORY BOT ➔</span>
                </button>
              ) : (
                <div className="text-center text-xs text-slate-400 font-mono">
                  Drag straight lines in any direction: ↔ ↕ ⤢
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
