import { useState, useEffect, useRef } from 'react'
import { sound } from '../utils/AudioEngine'

const WORD_DICTIONARIES = {
  Animals: [
    'FOX',
    'BEAVER',
    'LOBSTER',
    'MOOSE',
    'EAGLE',
    'GOAT',
    'ELK',
    'BEAR',
    'DEER',
    'WOLF',
  ],
  CyberGlitch: [
    'GLITCH',
    'PORTAL',
    'CIPHER',
    'MATRIX',
    'KEYPAD',
    'VAULT',
    'CORE',
    'SIGNAL',
    'SECTOR',
    'MEMORY',
  ],
}

const GRID_SIZE = 9

// Helper to generate a fresh Word Search grid with placed words
function generateWordSearchGrid(category = 'Animals') {
  const dictionary = WORD_DICTIONARIES[category] || WORD_DICTIONARIES.Animals
  // Pick 6 words
  const wordsToPlace = [...dictionary].sort(() => Math.random() - 0.5).slice(0, 6)

  // Empty 9x9 grid
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''))
  const placedWords = []

  // Directions: [dx, dy]
  const directions = [
    [1, 0],   // horizontal right
    [0, 1],   // vertical down
    [1, 1],   // diagonal down-right
    [-1, 0],  // horizontal left
    [0, -1],  // vertical up
  ]

  for (const word of wordsToPlace) {
    let placed = false
    let attempts = 0

    while (!placed && attempts < 100) {
      attempts++
      const dir = directions[Math.floor(Math.random() * directions.length)]
      const [dx, dy] = dir

      const startX = Math.floor(Math.random() * GRID_SIZE)
      const startY = Math.floor(Math.random() * GRID_SIZE)

      const endX = startX + dx * (word.length - 1)
      const endY = startY + dy * (word.length - 1)

      if (endX >= 0 && endX < GRID_SIZE && endY >= 0 && endY < GRID_SIZE) {
        // Check fit
        let canFit = true
        for (let i = 0; i < word.length; i++) {
          const cx = startX + dx * i
          const cy = startY + dy * i
          const currentCell = grid[cy][cx]
          if (currentCell !== '' && currentCell !== word[i]) {
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
          placedWords.push({ word, cells })
          placed = true
        }
      }
    }
  }

  // Fill remaining blanks with random letters A-Z
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === '') {
        grid[y][x] = alphabet[Math.floor(Math.random() * alphabet.length)]
      }
    }
  }

  return { grid, placedWords, category }
}

export default function WordSearchGame({ onComplete, onExit }) {
  const [puzzleData, setPuzzleData] = useState(() => generateWordSearchGrid('Animals'))
  const [foundWords, setFoundWords] = useState([])
  const [foundCells, setFoundCells] = useState(new Set())
  const [selection, setSelection] = useState([]) // array of 'x-y'
  const isDragging = useRef(false)

  const colors = [
    '#38bdf8', // sky
    '#4ade80', // green
    '#facc15', // yellow
    '#f472b6', // pink
    '#fb923c', // orange
    '#a78bfa', // purple
  ]

  // Track if all words are found
  useEffect(() => {
    if (
      puzzleData.placedWords.length > 0 &&
      foundWords.length === puzzleData.placedWords.length
    ) {
      sound.playVictory()
      setTimeout(() => {
        onComplete && onComplete()
      }, 1500)
    }
  }, [foundWords, puzzleData.placedWords, onComplete])

  // Cell key helper
  const cellKey = (x, y) => `${x}-${y}`

  // Mouse handlers for dragging selection
  const handleCellMouseDown = (x, y) => {
    isDragging.current = true
    setSelection([cellKey(x, y)])
    sound.playTypewriter()
  }

  const handleCellMouseEnter = (x, y) => {
    if (!isDragging.current) return
    const key = cellKey(x, y)
    if (!selection.includes(key)) {
      setSelection((prev) => [...prev, key])
    }
  }

  const handleCellMouseUp = () => {
    if (!isDragging.current) return
    isDragging.current = false

    // Check if current selection matches any un-found word
    const selectedLetters = selection
      .map((key) => {
        const [x, y] = key.split('-').map(Number)
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
      setFoundCells((prev) => {
        const next = new Set(prev)
        match.cells.forEach((c) => next.add(c))
        return next
      })
    }

    setSelection([])
  }

  // Handle auto-complete / skip for testing convenience
  const handleAutoSolve = () => {
    const all = puzzleData.placedWords.map((p) => p.word)
    const allCells = new Set()
    puzzleData.placedWords.forEach((p) => p.cells.forEach((c) => allCells.add(c)))
    setFoundWords(all)
    setFoundCells(allCells)
  }

  const isAllFound =
    puzzleData.placedWords.length > 0 &&
    foundWords.length === puzzleData.placedWords.length

  return (
    <div
      className="relative w-full h-full min-h-screen bg-[#38bdf8] flex flex-col items-center justify-between p-4 sm:p-6 select-none font-sans"
      onMouseUp={handleCellMouseUp}
    >
      {/* Top Header matching Image 2 */}
      <div className="w-full max-w-md flex items-center justify-between pt-2 pb-1">
        <button
          onClick={onExit}
          className="px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-gray-800 text-xs font-bold shadow cursor-pointer transition"
        >
          ← Exit
        </button>
        <span className="text-white font-extrabold text-sm sm:text-base tracking-wider drop-shadow-md">
          LEVEL 2: STAGE 1 - WORD SEARCH
        </span>
        <button
          onClick={handleAutoSolve}
          className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow cursor-pointer transition"
        >
          Auto Solve
        </button>
      </div>

      {/* Main Puzzle Card Container (matches Image 2 layout) */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-white flex flex-col overflow-hidden my-2">
        {/* Category Header Bar (Image 2 style) */}
        <div className="w-full bg-[#cbd5e1] py-2 text-center text-gray-700 font-extrabold text-lg tracking-wide border-b border-gray-300">
          {puzzleData.category}
        </div>

        {/* 9x9 Word Search Grid */}
        <div className="p-4 sm:p-5 flex justify-center bg-white">
          <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
            {puzzleData.grid.map((row, y) =>
              row.map((letter, x) => {
                const key = cellKey(x, y)
                const isSelected = selection.includes(key)
                const isFound = foundCells.has(key)

                return (
                  <div
                    key={key}
                    onMouseDown={() => handleCellMouseDown(x, y)}
                    onMouseEnter={() => handleCellMouseEnter(x, y)}
                    className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center font-mono font-black text-lg sm:text-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#38bdf8] text-white scale-110 shadow-md ring-2 ring-cyan-500'
                        : isFound
                        ? 'bg-[#4ade80] text-gray-950 font-black shadow-sm'
                        : 'text-gray-800 hover:bg-sky-50'
                    }`}
                  >
                    {letter}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Word List Section at Bottom (Image 2 style) */}
        <div className="border-t-2 border-gray-200 bg-[#f8fafc] p-4 flex flex-col items-center">
          {/* Word List Pill */}
          <div className="px-5 py-1 rounded-full bg-[#94a3b8] text-white text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            Word List ({foundWords.length}/{puzzleData.placedWords.length})
          </div>

          {/* List of Words with Strikethrough & Green Highlighting */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-xs sm:text-sm font-extrabold">
            {puzzleData.placedWords.map((item) => {
              const found = foundWords.includes(item.word)
              return (
                <span
                  key={item.word}
                  className={`transition-all ${
                    found
                      ? 'text-emerald-600 line-through opacity-70'
                      : 'text-gray-700'
                  }`}
                >
                  {found ? `✔ ${item.word}` : item.word}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {isAllFound && (
        <div className="w-full max-w-md p-3.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-center shadow-xl animate-bounce">
          🎉 ALL WORDS FOUND! ADVANCING TO MEMORY MATCH...
        </div>
      )}

      {/* Footer Instructions */}
      <div className="text-white/90 text-xs text-center font-medium drop-shadow">
        Click and drag across letters to select hidden words
      </div>
    </div>
  )
}
