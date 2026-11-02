import { useState, useEffect, useRef, useMemo } from 'react'
import { sound } from '../utils/AudioEngine'
import { CADGY_PUZZLE_BOARDS } from '../data/cadgyBoards'

export default function CadgyWordGame({ onComplete, onExit, environment = 'wood' }) {
  // Board selection
  const [boardIndex, setBoardIndex] = useState(0)
  const currentBoard = CADGY_PUZZLE_BOARDS[boardIndex] || CADGY_PUZZLE_BOARDS[0]

  // Columns tile state (allows shuffling within each column)
  const [boardColumns, setBoardColumns] = useState(() => currentBoard.board)

  // Game toggles & modes
  const [is3DMode, setIs3DMode] = useState(true)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showHintModal, setShowHintModal] = useState(false)
  const [activeHintText, setActiveHintText] = useState('')

  // Selected tiles: array of tile objects { id, char, col, row, isHeart, isMulti }
  const [selectedTiles, setSelectedTiles] = useState([])
  const [foundBasicWords, setFoundBasicWords] = useState([])
  const [foundBonusWords, setFoundBonusWords] = useState([])
  const [foundExtraWords, setFoundExtraWords] = useState([])

  // Score, Countdown Timer & Shields
  const [score, setScore] = useState(50)
  const [countdownSeconds, setCountdownSeconds] = useState(120)
  const [shields, setShields] = useState(4)
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  // Feedback commentary
  const [commentary, setCommentary] = useState('')
  const [commentaryColor, setCommentaryColor] = useState('text-emerald-400')
  const [isVerifying, setIsVerifying] = useState(false)

  // Vector connecting line coordinates
  const [connectorPoints, setConnectorPoints] = useState([])

  const boardContainerRef = useRef(null)
  const tileRefs = useRef({})
  const autoAdvanceTriggered = useRef(false)

  // Reset board state when switching puzzles
  useEffect(() => {
    setBoardColumns(currentBoard.board)
    setSelectedTiles([])
    setFoundBasicWords([])
    setFoundBonusWords([])
    setFoundExtraWords([])
    setCountdownSeconds(120)
    setShields(4)
    setCommentary('')
    autoAdvanceTriggered.current = false
  }, [boardIndex, currentBoard])

  // Countdown timer with matrix scramble on expiration
  useEffect(() => {
    if (!isTimerRunning) return
    const interval = setInterval(() => {
      setCountdownSeconds((sec) => {
        if (sec <= 1) {
          sound.playGlitchRadio()
          setBoardColumns((prevColumns) =>
            prevColumns.map((col) => {
              const shuffled = [...col].sort(() => Math.random() - 0.5)
              return shuffled.map((tile, idx) => ({ ...tile, row: idx }))
            })
          )
          setCommentary('FIREWALL OVERLOAD! COLUMNS SCRAMBLED!')
          setCommentaryColor('text-rose-400 font-extrabold animate-pulse')
          return 75
        }
        return sec - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const formatTimer = (totalSec) => {
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Shuffle tile order within each of the 5 columns
  const handleShuffleColumns = () => {
    sound.playKeyClick()
    setBoardColumns((prevColumns) =>
      prevColumns.map((col) => {
        const shuffled = [...col].sort(() => Math.random() - 0.5)
        return shuffled.map((tile, idx) => ({ ...tile, row: idx }))
      })
    )
    setCommentary('Columns shuffled!')
    setCommentaryColor('text-purple-300')
  }

  // Calculate coordinates for the connecting purple vector line across selected tiles
  useEffect(() => {
    if (selectedTiles.length < 2 || !boardContainerRef.current) {
      setConnectorPoints([])
      return
    }

    const containerRect = boardContainerRef.current.getBoundingClientRect()
    const points = []

    // Sort by column index 0..4
    const sorted = [...selectedTiles].sort((a, b) => a.col - b.col)

    sorted.forEach((tile) => {
      const el = tileRefs.current[tile.id]
      if (el) {
        const rect = el.getBoundingClientRect()
        // Center point relative to board container
        const x = rect.left - containerRect.left + rect.width / 2
        const y = rect.top - containerRect.top + rect.height / 2
        points.push({ x, y })
      }
    })

    setConnectorPoints(points)
  }, [selectedTiles, is3DMode, boardColumns])

  // Check which tiles are completely "Gold" (all their words found)
  const completedTileIds = useMemo(() => {
    const goldIds = new Set()
    const allFound = [...foundBasicWords, ...foundBonusWords, ...foundExtraWords]

    currentBoard.board.forEach((col) => {
      col.forEach((tile) => {
        if (!tile.char) return
        const charUpper = tile.char.toUpperCase()
        // Find all possible target words that use this letter in its column
        const wordsForTile = [
          ...currentBoard.basicWords,
          ...currentBoard.bonusWords,
        ].filter((bw) => {
          if (tile.isMulti) {
            return bw.word.includes(charUpper)
          }
          return bw.word[tile.col] === charUpper
        })

        if (wordsForTile.length > 0) {
          const allResolved = wordsForTile.every((w) => allFound.includes(w.word))
          if (allResolved) {
            goldIds.add(tile.id)
          }
        }
      })
    })

    return goldIds
  }, [currentBoard, foundBasicWords, foundBonusWords, foundExtraWords])

  // Hardened Difficulty: Must crack ALL 5 Basic Words AND at least 2 Bonus Words
  const isAllBasicFound =
    currentBoard.basicWords.length > 0 &&
    foundBasicWords.length === currentBoard.basicWords.length
  const hasBonusWord = foundBonusWords.length >= 2
  const isCadgyComplete = isAllBasicFound && hasBonusWord

  // Auto-advance once all basic words + 2 bonus words solved
  useEffect(() => {
    if (isCadgyComplete && !autoAdvanceTriggered.current) {
      autoAdvanceTriggered.current = true
      setIsTimerRunning(false)
      sound.playVictory()
      setCommentary('CIPHER BREACHED! ALL 5 BASIC & 2 BONUS WORDS SOLVED!')
      setCommentaryColor('text-emerald-300 font-extrabold')
      const timeout = setTimeout(() => {
        onComplete && onComplete()
      }, 950)
      return () => clearTimeout(timeout)
    } else if (isAllBasicFound && !hasBonusWord) {
      const remainingBonus = 2 - foundBonusWords.length
      setCommentary(
        `BASIC WORDS SOLVED! CRACK ${remainingBonus} MORE BONUS WORD${remainingBonus > 1 ? 'S' : ''} TO BREACH!`
      )
      setCommentaryColor('text-amber-300 font-bold animate-pulse')
    }
  }, [isCadgyComplete, isAllBasicFound, hasBonusWord, foundBonusWords.length, onComplete])

  // Tile Selection Handler
  const handleTileClick = (tile, colIndex) => {
    if (isVerifying || isCadgyComplete) return
    sound.playTypewriter()

    // 1. If clicking already selected tile in this column, deselect it
    const existingIndex = selectedTiles.findIndex((t) => t.id === tile.id)
    if (existingIndex !== -1) {
      setSelectedTiles((prev) => prev.filter((t) => t.id !== tile.id))
      return
    }

    // 2. Replace selection for this column
    const filtered = selectedTiles.filter((t) => t.col !== colIndex)
    const nextSelection = [...filtered, { ...tile, col: colIndex }].sort(
      (a, b) => a.col - b.col
    )
    setSelectedTiles(nextSelection)
  }

  // Automatic Verification when all 5 columns have a selection
  useEffect(() => {
    // Check if we have selections in all 5 columns (0..4)
    const hasAllFive = [0, 1, 2, 3, 4].every((colIdx) =>
      selectedTiles.some((t) => t.col === colIdx)
    )

    if (hasAllFive && !isVerifying) {
      setIsVerifying(true)

      const sortedTiles = [...selectedTiles].sort((a, b) => a.col - b.col)
      const hasWildcard = sortedTiles.some((t) => t.isHeart)
      const targetWords = [
        ...currentBoard.basicWords,
        ...currentBoard.bonusWords,
      ]

      // Resolve candidate words (handling wildcards and multi-letter tiles)
      let resolvedWord = null
      let wordCategory = null // 'basic' | 'bonus' | 'extra'

      if (hasWildcard) {
        // Find any candidate in basicWords, bonusWords, or acceptedDictionary matching the pattern
        const wildcardCol = sortedTiles.findIndex((t) => t.isHeart)

        // Try candidate letters A-Z for the wildcard
        for (const target of targetWords) {
          let matches = true
          let letterOffset = 0

          for (let c = 0; c < 5; c++) {
            const tile = sortedTiles[c]
            if (tile.isHeart) {
              letterOffset += 1
              continue
            }
            if (tile.isMulti) {
              const multi = tile.char.toUpperCase()
              if (!target.word.startsWith(multi, letterOffset)) {
                matches = false
                break
              }
              letterOffset += multi.length
            } else {
              if (target.word[letterOffset] !== tile.char.toUpperCase()) {
                matches = false
                break
              }
              letterOffset += 1
            }
          }

          if (matches) {
            resolvedWord = target.word
            wordCategory = currentBoard.basicWords.some((b) => b.word === target.word)
              ? 'basic'
              : 'bonus'
            break
          }
        }

        // Also check accepted dictionary if not found in targets
        if (!resolvedWord) {
          for (const dictWord of currentBoard.acceptedDictionary || []) {
            let matches = true
            let letterOffset = 0
            for (let c = 0; c < 5; c++) {
              const tile = sortedTiles[c]
              if (tile.isHeart) {
                letterOffset += 1
                continue
              }
              if (tile.isMulti) {
                const multi = tile.char.toUpperCase()
                if (!dictWord.startsWith(multi, letterOffset)) {
                  matches = false
                  break
                }
                letterOffset += multi.length
              } else {
                if (dictWord[letterOffset] !== tile.char.toUpperCase()) {
                  matches = false
                  break
                }
                letterOffset += 1
              }
            }
            if (matches) {
              resolvedWord = dictWord
              wordCategory = 'extra'
              break
            }
          }
        }
      } else {
        // Direct non-wildcard word construction
        const literalWord = sortedTiles
          .map((t) => t.char.toUpperCase())
          .join('')

        if (currentBoard.basicWords.some((b) => b.word === literalWord)) {
          resolvedWord = literalWord
          wordCategory = 'basic'
        } else if (currentBoard.bonusWords.some((b) => b.word === literalWord)) {
          resolvedWord = literalWord
          wordCategory = 'bonus'
        } else if (currentBoard.acceptedDictionary?.includes(literalWord)) {
          resolvedWord = literalWord
          wordCategory = 'extra'
        }
      }

      // Handle Verification Outcome
      if (resolvedWord) {
        if (
          foundBasicWords.includes(resolvedWord) ||
          foundBonusWords.includes(resolvedWord) ||
          foundExtraWords.includes(resolvedWord)
        ) {
          setCommentary(`Already solved "${resolvedWord}"!`)
          setCommentaryColor('text-amber-300 font-bold')
        } else if (wordCategory === 'basic') {
          sound.playWordFound()
          setFoundBasicWords((prev) => [...prev, resolvedWord])
          setScore((s) => s + 100)
          setCountdownSeconds((sec) => Math.min(180, sec + 25))
          setShields((s) => Math.min(4, s + 1))
          const clueObj = currentBoard.basicWords.find((b) => b.word === resolvedWord)
          setCommentary(
            `BASIC ADDR SOLVED: "${resolvedWord}" (+100 pts, +25s, +1 Shield)`
          )
          setCommentaryColor('text-emerald-400 font-extrabold')
        } else if (wordCategory === 'bonus') {
          sound.playVictory()
          setFoundBonusWords((prev) => [...prev, resolvedWord])
          setScore((s) => s + 150)
          setCountdownSeconds((sec) => Math.min(180, sec + 35))
          setShields((s) => Math.min(4, s + 1))
          const bonusObj = currentBoard.bonusWords.find((b) => b.word === resolvedWord)
          setCommentary(
            `BONUS CIPHER CRACKED: "${resolvedWord}" (+150 pts, +35s, +1 Shield)`
          )
          setCommentaryColor('text-sky-300 font-extrabold')
        } else {
          // Extra dictionary discovery
          sound.playWordFound()
          setFoundExtraWords((prev) => [...prev, resolvedWord])
          setScore((s) => s + 50)
          setCountdownSeconds((sec) => Math.min(180, sec + 15))
          setCommentary(`EXTRA DICTIONARY CIPHER: "${resolvedWord}" (+50 pts, +15s)`)
          setCommentaryColor('text-purple-300 font-bold')
        }

        setTimeout(() => {
          setSelectedTiles([])
          setIsVerifying(false)
        }, 500)
      } else {
        // Invalid word attempt: deplete 1 shield core
        sound.playDoorLocked()
        const attempt = sortedTiles.map((t) => t.char).join('')
        setShields((prev) => {
          const nextShields = prev - 1
          if (nextShields <= 0) {
            sound.playGlitchRadio()
            handleShuffleColumns()
            setCommentary(`SHIELDS COMPROMISED! "${attempt}" REJECTED. MATRIX SCRAMBLED!`)
            setCommentaryColor('text-rose-500 font-black animate-pulse')
            return 4
          }
          setCommentary(`INVALID CIPHER: "${attempt}" (-1 Shield)`)
          setCommentaryColor('text-rose-400 font-bold')
          return nextShields
        })

        setTimeout(() => {
          setSelectedTiles([])
          setIsVerifying(false)
        }, 750)
      }
    }
  }, [
    selectedTiles,
    isVerifying,
    currentBoard,
    foundBasicWords,
    foundBonusWords,
    foundExtraWords,
  ])

  // Provide an interactive Hint (costs 10 score)
  const handleTriggerHint = () => {
    sound.playKeyClick()
    setScore((s) => Math.max(0, s - 10))
    const unsolvedBonus = currentBoard.bonusWords.find(
      (b) => !foundBonusWords.includes(b.word)
    )
    const unsolvedBasic = currentBoard.basicWords.find(
      (b) => !foundBasicWords.includes(b.word)
    )

    if (unsolvedBasic) {
      setActiveHintText(
        `BASIC CLUE: ${unsolvedBasic.clue} (Starts with "${unsolvedBasic.word[0]}...") [-10 pts]`
      )
    } else if (unsolvedBonus) {
      setActiveHintText(
        `BONUS CLUE: ${unsolvedBonus.clue} (Starts with "${unsolvedBonus.word[0]}...") [-10 pts]`
      )
    } else {
      setActiveHintText('You have solved all target puzzle words! Remarkable vocabulary!')
    }
    setShowHintModal(true)
  }

  // Sorted spelled array for letter bar: exactly 5 slots (Col 0..4)
  const spelledSlots = [0, 1, 2, 3, 4].map((colIdx) => {
    const tile = selectedTiles.find((t) => t.col === colIdx)
    if (!tile) return null
    if (tile.isHeart) return '♥'
    return tile.char
  })

  // Alphabetical bonus words for lower clues list (OneLook style)
  const sortedBonusList = useMemo(() => {
    return [...currentBoard.bonusWords].sort((a, b) => a.word.localeCompare(b.word))
  }, [currentBoard.bonusWords])

  return (
    <div className="relative w-full h-full min-h-0 flex flex-col items-center justify-between overflow-y-auto select-none font-sans p-2 sm:p-4 text-white">
      
      {/* ================= 1. HEADER LOGO & CADGY BANNER (IMAGE 3 EXACT) ================= */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-1 mt-1 sm:mt-2 shrink-0">
        
        {/* DOUBLE CADGY ORANGE BLOCK LOGO */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] sm:text-xs font-black tracking-[0.45em] text-rose-400 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [text-wrap:balance]">
            DOUBLE
          </div>

          {/* Connected Orange Squircle Tiles: C - A - D - G - Y */}
          <div className="flex items-center mt-0.5">
            {['C', 'A', 'D', 'G', 'Y'].map((letter, idx) => (
              <div key={idx} className="flex items-center">
                <div
                  className="h-[clamp(2rem,5vw,2.75rem)] w-[clamp(2rem,5vw,2.75rem)] rounded-xl flex items-center justify-center font-black text-[clamp(1.1rem,3vw,1.5rem)] text-amber-950 shadow-[0_4px_12px_rgba(245,158,11,0.5),inset_0_2px_0_rgba(255,255,255,0.4)] border border-amber-300"
                  style={{
                    background:
                      'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 4px, #fbbf24 4px, #fbbf24 8px)',
                  }}
                >
                  {letter}
                </div>
                {idx < 4 && (
                  <div className="w-2 sm:w-3 h-1 sm:h-1.5 bg-gradient-to-r from-amber-500 to-amber-400 shadow" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Date and Calendar Icon */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-300 font-mono mt-0.5">
          <span>{currentBoard.dateLabel || 'October 23, 2026'}</span>
          <svg className="w-3.5 h-3.5 fill-gray-400 shrink-0" viewBox="0 0 24 24">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
          </svg>
        </div>

        {/* CONTROLS TOOLBAR (Score, Shields, Countdown Timer, Shuffle, 3D, Help) */}
        <div className="flex items-center flex-wrap justify-center gap-1.5 sm:gap-2 mt-1 px-3 sm:px-4 py-1 rounded-2xl bg-black/70 border border-white/15 backdrop-blur shadow-xl text-[10px] sm:text-xs">
          
          {/* Score Pill */}
          <div className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-black/60 border border-amber-500/50 font-mono font-bold text-amber-300 shadow">
            Score: <span className="text-white text-xs sm:text-sm font-black">{score}</span>
          </div>

          {/* Shields Integrity Pill */}
          <div className="flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-rose-950/60 border border-rose-500/50 font-mono font-bold text-rose-300 shadow" title="Security Shields (Depletes on invalid cipher entries)">
            <span>SHIELDS:</span>
            <span className="text-xs">{'🛡️'.repeat(shields)}</span>
          </div>

          {/* Countdown Decryption Timer */}
          <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-white/5 border font-mono font-bold transition-colors ${
            countdownSeconds <= 30
              ? 'text-rose-400 border-rose-500/50 animate-pulse'
              : 'text-cyan-300 border-white/10'
          }`} title="Firewall Decryption Countdown Window">
            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </svg>
            <span>{formatTimer(countdownSeconds)}</span>
          </div>

          {/* Shuffle Button (Image 3) */}
          <button
            onClick={handleShuffleColumns}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 font-bold text-purple-200 cursor-pointer transition active:scale-95 shadow"
            title="Shuffle tiles in columns"
          >
            <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
            <span>Shuffle</span>
          </button>

          {/* 3D Isometric Mode Toggle (Image 3) */}
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl border font-bold cursor-pointer transition active:scale-95 shadow flex items-center gap-1 ${
              is3DMode
                ? 'bg-amber-500 text-black border-amber-300 font-black'
                : 'bg-white/10 text-gray-300 border-white/20 hover:text-white'
            }`}
            title="Toggle 3D Stack View"
          >
            <span className="font-mono">3D</span>
            <span className="text-[10px]">{is3DMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Need a Hint Button */}
          <button
            onClick={handleTriggerHint}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 font-bold text-amber-200 cursor-pointer transition active:scale-95 shadow"
          >
            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
            </svg>
            <span>Hint</span>
          </button>

          {/* How to Play Help (?) */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center font-bold text-gray-300 hover:text-white cursor-pointer transition text-xs"
            title="Cadgy Rules & Help"
          >
            ?
          </button>
        </div>
      </div>

      {/* ================= 2. 3D ISOMETRIC STACKED TILES BOARD ================= */}
      <div
        ref={boardContainerRef}
        className="relative w-full max-w-md sm:max-w-lg flex flex-col items-center justify-center p-3 sm:p-5 rounded-3xl bg-[#140b22]/90 border-2 border-purple-500/40 shadow-[0_0_60px_rgba(168,85,247,0.3)] backdrop-blur my-1 sm:my-auto overflow-visible shrink-0"
      >
        {/* SVG OVERLAY FOR DYNAMIC PURPLE VECTOR CONNECTING STRING (IMAGE 3) */}
        {connectorPoints.length >= 2 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
            <polyline
              points={connectorPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#9333ea"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]"
            />
          </svg>
        )}

        {/* 5 COLUMNS OF TILES (COL 0 -> COL 4) */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3.5 w-full relative z-10">
          {boardColumns.map((colTiles, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-2.5 sm:gap-3">
              {colTiles.map((tile, rowIdx) => {
                const isSelected = selectedTiles.some((t) => t.id === tile.id)
                const isGold = completedTileIds.has(tile.id)

                // 3D Isometric Stack Style
                const stackDepth = tile.depth || 4
                const stackShadow = is3DMode
                  ? isSelected
                    ? '0 12px 24px rgba(168,85,247,0.7), 1px 1px 0 #581c87, 2px 2px 0 #3b0764, 3px 3px 0 #2e1065, 4px 4px 0 #1e0939'
                    : `1px 1px 0 #6b4423, 2px 2px 0 #52341b, 3px 3px 0 #3e2714, 4px 4px 0 #2d1c0e, 0 6px 12px rgba(0,0,0,0.6)`
                  : '0 2px 8px rgba(0,0,0,0.4)'

                return (
                  <button
                    key={tile.id}
                    ref={(el) => (tileRefs.current[tile.id] = el)}
                    onClick={() => handleTileClick(tile, colIdx)}
                    style={{
                      boxShadow: stackShadow,
                    }}
                    className={`relative h-[clamp(2.35rem,6.5vw,3.25rem)] w-full rounded-xl sm:rounded-2xl flex items-center justify-center font-extrabold text-[clamp(1rem,2.8vw,1.35rem)] cursor-pointer transition-all duration-200 select-none ${
                      isSelected
                        ? 'text-indigo-950 scale-105 -translate-y-2 ring-2 ring-white z-30'
                        : isGold
                        ? 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border border-yellow-200 hover:scale-102'
                        : tile.isHeart
                        ? 'text-rose-500 border border-amber-400/60 hover:scale-102'
                        : 'bg-[#f4ebd0] hover:bg-[#fff9e6] text-amber-950 border border-[#e4d3aa] hover:scale-102'
                    }`}
                  >
                    {/* Selected lavender diagonal pinstripe overlay (Image 3) */}
                    {isSelected && (
                      <div
                        className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none"
                        style={{
                          background:
                            'repeating-linear-gradient(45deg, #c7c4f4, #c7c4f4 4px, #b8b5e6 4px, #b8b5e6 8px)',
                        }}
                      />
                    )}

                    {/* Heart wildcard diagonal orange pinstripe overlay (Image 3) */}
                    {!isSelected && tile.isHeart && !isGold && (
                      <div
                        className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none"
                        style={{
                          background:
                            'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 4px, #d97706 4px, #d97706 8px)',
                        }}
                      />
                    )}

                    {/* Tile Content */}
                    <span className="relative z-10 flex items-center justify-center font-black">
                      {tile.isHeart ? (
                        <svg
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            isSelected ? 'fill-rose-600' : 'fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]'
                          }`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      ) : (
                        tile.char
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* ================= 3. LIVE SPELLED WORD OUTPUT BAR (IMAGE 3) ================= */}
        <div className="flex items-center gap-2 sm:gap-4 mt-3 sm:mt-4 font-mono font-black text-xl sm:text-3xl tracking-[0.25em] text-white">
          {spelledSlots.map((char, idx) => (
            <span
              key={idx}
              className={`transition-all ${
                char
                  ? char === '♥'
                    ? 'scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                    : 'text-purple-300 scale-110 drop-shadow-[0_0_8px_rgba(216,180,254,0.8)]'
                  : 'text-gray-600'
              }`}
            >
              {char === '♥' ? (
                <svg className="w-5 h-5 sm:w-7 sm:h-7 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] inline-block align-middle" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                char || '_'
              )}
            </span>
          ))}
        </div>

        {/* Live Commentary / Auto-Verify Feedback */}
        <div className="h-7 sm:h-8 mt-1 flex items-center justify-center text-center px-4">
          {commentary ? (
            <div className={`text-xs sm:text-sm font-bold ${commentaryColor} animate-fadeIn [text-wrap:pretty]`}>
              {commentary}
            </div>
          ) : (
            <div className="text-[10px] sm:text-[11px] font-mono text-gray-400 [text-wrap:pretty]">
              Pick 1 tile from each column • Auto-verifies immediately at 5 tiles
            </div>
          )}
        </div>
      </div>

      {/* ================= 4. ACCORDION / CLUES PANEL ================= */}
      <div className="w-full max-w-xl flex flex-col gap-2 pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          
          {/* Basic Words Checklist (Everyday words) */}
          <div className="p-3 rounded-2xl bg-[#0f2416] border border-emerald-500/40 shadow">
            <div className="flex items-center justify-between font-bold text-emerald-400 mb-1.5">
              <span>BASIC WORDS</span>
              <span className="font-mono">
                ({foundBasicWords.length}/{currentBoard.basicWords.length})
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {currentBoard.basicWords.map((b) => (
                <div key={b.word} className="text-[11px]">
                  {foundBasicWords.includes(b.word) ? (
                    <span className="text-emerald-300 font-bold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <span>{b.word}: {b.clue}</span>
                    </span>
                  ) : (
                    <span className="text-gray-400">_____ : {b.clue}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bonus Words Checklist (Alphabetically sorted, OneLook style) */}
          <div className="p-3 rounded-2xl bg-[#111c2e] border border-sky-500/40 shadow">
            <div className="flex items-center justify-between font-bold text-sky-400 mb-1.5">
              <span>BONUS WORDS (Alphabetical)</span>
              <span className="font-mono">
                ({foundBonusWords.length}/{currentBoard.bonusWords.length})
              </span>
            </div>
            <div className="flex flex-col gap-1 max-h-28 overflow-y-auto pr-1">
              {sortedBonusList.map((b) => (
                <div key={b.word} className="text-[11px]">
                  {foundBonusWords.includes(b.word) ? (
                    <span className="text-sky-300 font-bold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <span>{b.word}: {b.clue}</span>
                    </span>
                  ) : (
                    <span className="text-gray-400 leading-tight">
                      • {b.clue}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-Advance Notification Button */}
        {isCadgyComplete && (
          <button
            onClick={() => onComplete && onComplete()}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.7)] flex items-center justify-center gap-2 cursor-pointer transition animate-bounce"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span>CIPHER BREACHED! ADVANCE TO RIDDLE BOARD -&gt;</span>
          </button>
        )}
      </div>

      {/* ================= HELP / RULES MODAL ================= */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-[#1a122e] border-2 border-purple-500/60 p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
              <h3 className="text-lg font-black text-amber-300">HOW TO PLAY DOUBLE CADGY</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="text-xs text-gray-200 space-y-2.5 leading-relaxed">
              <p>
                <strong className="text-purple-300">1. Form Words Left-to-Right:</strong> Select exactly one tile from each of the 5 columns (Col 0 through Col 4).
              </p>
              <p>
                <strong className="text-rose-400">2. Rare Wildcard Heart:</strong> Exactly ONE glowing Heart tile (<svg className="w-3.5 h-3.5 fill-rose-500 inline-block align-middle" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>) exists on the board as a strategic wildcard.
              </p>
              <p>
                <strong className="text-cyan-300">3. Distractor Tiles:</strong> Stacks include decoy letters that don't match target words, requiring careful column tracing.
              </p>
              <p>
                <strong className="text-amber-300">4. Gold Tiles:</strong> When you successfully find every hidden word that uses a specific tile, that tile permanently turns <strong className="text-amber-400">GOLD</strong>.
              </p>
              <p>
                <strong className="text-emerald-300">5. Hardened Breach Condition:</strong> You must crack <strong className="text-white">ALL 5 Basic Words</strong> and at least <strong className="text-white">2 Bonus Words</strong> to breach the sanctuary!
              </p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase cursor-pointer transition shadow"
            >
              Got It, Let's Play!
            </button>
          </div>
        </div>
      )}

      {/* ================= HINT MODAL ================= */}
      {showHintModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowHintModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-[#1e1526] border-2 border-amber-500/60 p-6 shadow-2xl text-white space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 w-12 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mx-auto text-amber-300">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
              </svg>
            </div>

            <h3 className="text-base font-extrabold text-amber-300">CRYPTOGRAPHIC INTEL</h3>
            <p className="text-xs text-gray-200 leading-relaxed font-mono px-2 py-3 rounded-xl bg-black/50 border border-white/10">
              {activeHintText}
            </p>

            <button
              onClick={() => setShowHintModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase cursor-pointer transition shadow"
            >
              Back to Puzzle
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
