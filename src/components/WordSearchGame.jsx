import { useState, useEffect, useRef } from 'react'
import { sound } from '../utils/AudioEngine'

// Word list inspired by Image 1
const SAMPLE_WORDS = [
  'DEALERS',
  'CONSIDERS',
  'CONTINENTAL',
  'CABINETS',
  'EXPANSION',
  'EXPERIENCED',
  'INSPIRATION',
  'UNIVERSITY',
  'TRIPADVISOR',
  'TWENTY',
  'OPERATING',
  'ORGANIZED',
  'RECEPTION',
  'RESPONDENTS',
  'ITSELF',
  'LENSES',
]

const GRID_SIZE = 12

// Generate a 12x12 word search grid with strictly straight placed words
function generateWordSearchGrid() {
  const wordsToPlace = [...SAMPLE_WORDS].sort(() => Math.random() - 0.5).slice(0, 10)
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''))
  const placedWords = []

  // Directions: Horizontal, Vertical, Diagonal ONLY
  const directions = [
    [1, 0],   // Horizontal right
    [-1, 0],  // Horizontal left
    [0, 1],   // Vertical down
    [0, -1],  // Vertical up
    [1, 1],   // Diagonal down-right
    [-1, 1],  // Diagonal down-left
    [1, -1],  // Diagonal up-right
    [-1, -1], // Diagonal up-left
  ]

  for (const word of wordsToPlace) {
    let placed = false
    let attempts = 0

    while (!placed && attempts < 150) {
      attempts++
      const dir = directions[Math.floor(Math.random() * directions.length)]
      const [dx, dy] = dir

      const startX = Math.floor(Math.random() * GRID_SIZE)
      const startY = Math.floor(Math.random() * GRID_SIZE)

      const endX = startX + dx * (word.length - 1)
      const endY = startY + dy * (word.length - 1)

      if (endX >= 0 && endX < GRID_SIZE && endY >= 0 && endY < GRID_SIZE) {
        let canFit = true
        for (let i = 0; i < word.length; i++) {
          const cx = startX + dx * i
          const cy = startY + dy * i
          const cell = grid[cy][cx]
          if (cell !== '' && cell !== word[i]) {
            canFit = false
            break
          }
        }

        if (canFit) {
          const cells = []
          for (let i = 0; i < word.length; i++) {
            const cx = startX + dx * i
            const cy = startY + dy * i
            grid[cy][cx] = word[i]
            cells.push(`${cx}-${cy}`)
          }
          placedWords.push({
            word,
            cells,
            startX,
            startY,
            endX,
            endY,
          })
          placed = true
        }
      }
    }
  }

  // Fill remaining blanks
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === '') {
        grid[y][x] = alphabet[Math.floor(Math.random() * alphabet.length)]
      }
    }
  }

  return { grid, placedWords }
}

export default function WordSearchGame({ onComplete, onExit }) {
  const [puzzleData, setPuzzleData] = useState(() => generateWordSearchGrid())
  const [foundWords, setFoundWords] = useState([])
  const [foundLines, setFoundLines] = useState([]) // array of { cells, word }
  const [selection, setSelection] = useState([])
  const [seconds, setSeconds] = useState(111) // 01:51 like Image 1
  const [activeWordPreview, setActiveWordPreview] = useState('')
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(null)

  const startCell = useRef(null)
  const isDragging = useRef(false)

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
      setAutoAdvanceCountdown(2)
      const timeout = setTimeout(() => {
        onComplete && onComplete()
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [isAllFound, onComplete, autoAdvanceCountdown])

  const cellKey = (x, y) => `${x}-${y}`

  // Calculate STRICTLY STRAIGHT LINE: Horizontal, Vertical, or Diagonal ONLY
  const calculateStraightLine = (x0, y0, x1, y1) => {
    const dx = x1 - x0
    const dy = y1 - y0

    const isHorizontal = dy === 0
    const isVertical = dx === 0
    const isDiagonal = Math.abs(dx) === Math.abs(dy)

    if (!isHorizontal && !isVertical && !isDiagonal) {
      // Not a valid straight line: restrict to closest valid point or just start cell
      return [cellKey(x0, y0)]
    }

    const stepX = Math.sign(dx)
    const stepY = Math.sign(dy)
    const steps = Math.max(Math.abs(dx), Math.abs(dy))

    const line = []
    for (let i = 0; i <= steps; i++) {
      line.push(cellKey(x0 + i * stepX, y0 + i * stepY))
    }
    return line
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

  const handleNewPuzzle = () => {
    setPuzzleData(generateWordSearchGrid())
    setFoundWords([])
    setFoundLines([])
    setSelection([])
    setActiveWordPreview('')
    setAutoAdvanceCountdown(null)
  }

  // Set of all found cell keys for fast background highlighting
  const allFoundCellKeys = new Set(foundLines.flatMap((l) => l.cells))

  return (
    <div
      className="relative w-screen h-screen bg-[#0284c7] flex flex-col items-center justify-between overflow-hidden select-none font-sans"
      onMouseUp={handleMouseUp}
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

      {/* 2. SUB-HEADER TOOLBAR (Timer, Mode, Actions - Image 1 Style) */}
      <div className="w-full bg-[#f0f9ff] text-slate-800 flex items-center justify-between px-6 py-2.5 border-b border-sky-200 shadow-sm text-sm">
        <div className="flex items-center gap-5">
          <button
            onClick={onExit}
            className="text-slate-600 hover:text-black font-extrabold text-base flex items-center gap-1 cursor-pointer"
            title="Return to Menu"
          >
            ←
          </button>
          <div className="font-mono font-bold text-sky-700 flex items-center gap-1.5">
            <span>⏱️</span>
            <span>{formatTimer(seconds)}</span>
          </div>
          <span className="font-semibold text-slate-600 text-xs sm:text-sm">
            Medium - English
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-300">
            Straight Lines Only: ↔ ↕ ⤢
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium text-slate-700">
          <button
            onClick={handleAutoSolve}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold cursor-pointer transition shadow-sm"
          >
            ⚡ Auto Solve
          </button>
          <button onClick={handleNewPuzzle} className="hover:text-black flex items-center gap-1 cursor-pointer">
            🔄 New puzzle
          </button>
        </div>
      </div>

      {/* 3. MAIN WHITE PUZZLE CONTAINER (Faithful Image 1 Reproduction) */}
      <div className="flex-1 w-full max-w-6xl p-3 sm:p-5 flex items-center justify-center">
        <div className="w-full h-full max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-sky-100 flex flex-col md:flex-row overflow-hidden p-4 sm:p-6 gap-6">
          
          {/* LEFT: 12x12 LETTER GRID */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Top Green Word Badges (Image 1 Header Pills) */}
            <div className="flex items-center justify-center gap-4 mb-3 h-8">
              {activeWordPreview ? (
                <div className="flex items-center gap-4 animate-fadeIn">
                  <span className="px-4 py-1 rounded-full bg-[#22c55e] text-white font-black tracking-wider text-xs uppercase shadow-sm">
                    {activeWordPreview}
                  </span>
                  <span className="px-4 py-1 rounded-full bg-[#16a34a] text-white font-black tracking-wider text-xs uppercase shadow-sm">
                    {activeWordPreview.split('').reverse().join('')}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-mono font-bold text-slate-400">
                  Select words horizontally, vertically, or diagonally
                </span>
              )}
            </div>

            {/* Letter Grid Container with strict straight-line dragging */}
            <div className="relative p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div
                className="grid gap-1 sm:gap-2"
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
                        onMouseDown={() => handleCellMouseDown(x, y)}
                        onMouseEnter={() => handleCellMouseEnter(x, y)}
                        className={`h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base md:text-lg select-none cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-black scale-105 shadow-md ring-2 ring-amber-500'
                            : isFound
                            ? 'bg-[#38bdf8] text-white font-extrabold shadow-sm'
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
          <div className="w-full md:w-80 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  WORD LIST
                </span>
                <span className="text-xs font-mono font-bold text-sky-600">
                  {foundWords.length} / {puzzleData.placedWords.length} Found
                </span>
              </div>

              {/* 2-Column Word List with strike-throughs */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:text-sm font-bold tracking-wide">
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
                  onClick={onComplete}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 cursor-pointer transition flex items-center justify-center gap-2 animate-bounce"
                >
                  <span>Sublevel 1 Cleared! Advance to Memory Bot</span>
                  <span>➔</span>
                </button>
              ) : (
                <div className="text-center text-xs text-slate-400">
                  Drag straight lines (↔ ↕ ⤢) to select words
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
