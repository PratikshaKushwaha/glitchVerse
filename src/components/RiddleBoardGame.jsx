import { useState, useEffect, useRef } from 'react'
import woodBoardImg from '../assets/level2/wood_board.jpg'
import { sound } from '../utils/AudioEngine'
import { RIDDLES_DATASET, fetchRiddlesDataset } from '../data/riddlesDataset'

export default function RiddleBoardGame({ onComplete, onExit, environment = 'wood' }) {
  // 3 Dynamic Riddles selected from dataset
  const [activeRiddles, setActiveRiddles] = useState(() => {
    const shuffled = [...RIDDLES_DATASET].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  })
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0)
  const currentRiddle = activeRiddles[currentRiddleIndex] || activeRiddles[0]

  // Formed word via Word Connect or typing
  const [selectedWheelIndices, setSelectedWheelIndices] = useState([])
  const [typedLetters, setTypedLetters] = useState([])
  const [isSuccess, setIsSuccess] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [isFinalLevelComplete, setIsFinalLevelComplete] = useState(false)
  const [isLoadingApi, setIsLoadingApi] = useState(false)

  // Fetch brand new set of riddles
  const handleShuffleRiddles = async () => {
    sound.playKeyClick()
    setIsLoadingApi(true)
    try {
      const fresh = await fetchRiddlesDataset(3)
      setActiveRiddles(fresh)
      setCurrentRiddleIndex(0)
      setSelectedWheelIndices([])
      setIsSuccess(false)
      setStatusMessage('')
      setShowHint(false)
      setIsFinalLevelComplete(false)
    } finally {
      setIsLoadingApi(false)
    }
  }

  // Sync letters with current riddle
  useEffect(() => {
    if (currentRiddle) {
      setTypedLetters(Array(currentRiddle.answer.length).fill(''))
      setSelectedWheelIndices([])
      setIsSuccess(false)
      setStatusMessage('')
      setShowHint(false)
    }
  }, [currentRiddleIndex, currentRiddle])

  // Get current word from wheel selection
  const currentWheelWord = selectedWheelIndices
    .map((i) => currentRiddle?.wheelLetters[i])
    .join('')

  // Handle letter click on wheel
  const handleWheelLetterClick = (index) => {
    if (isSuccess || !currentRiddle) return

    sound.playTypewriter()
    if (selectedWheelIndices.includes(index)) {
      // Deselect from here
      const idxInSelection = selectedWheelIndices.indexOf(index)
      const next = selectedWheelIndices.slice(0, idxInSelection)
      setSelectedWheelIndices(next)
      updateTypedLetters(next)
    } else {
      const next = [...selectedWheelIndices, index]
      setSelectedWheelIndices(next)
      updateTypedLetters(next)
      checkWordConnectWord(next)
    }
  }

  const updateTypedLetters = (selectionIndices) => {
    if (!currentRiddle) return
    const chars = selectionIndices.map((i) => currentRiddle.wheelLetters[i])
    const newLetters = Array(currentRiddle.answer.length).fill('')
    for (let i = 0; i < chars.length && i < currentRiddle.answer.length; i++) {
      newLetters[i] = chars[i]
    }
    setTypedLetters(newLetters)
  }

  // Check if connected word matches
  const checkWordConnectWord = (selectionIndices) => {
    if (!currentRiddle) return
    const word = selectionIndices.map((i) => currentRiddle.wheelLetters[i]).join('')
    if (word === currentRiddle.answer) {
      triggerRiddleSolved()
    }
  }

  // Clear current wheel
  const handleClearWheel = () => {
    if (!currentRiddle) return
    sound.playTypewriter()
    setSelectedWheelIndices([])
    setTypedLetters(Array(currentRiddle.answer.length).fill(''))
    setStatusMessage('')
  }

  // Handle riddle solved
  const triggerRiddleSolved = () => {
    if (!currentRiddle) return
    sound.playVictory()
    setIsSuccess(true)
    setStatusMessage(`SOLVED: "${currentRiddle.answer}" IS CORRECT!`)

    setTimeout(() => {
      if (currentRiddleIndex < activeRiddles.length - 1) {
        // Advance to next riddle
        setCurrentRiddleIndex((prev) => prev + 1)
      } else {
        // All 3 riddles solved! Transition to Level 3!
        setIsFinalLevelComplete(true)
        setTimeout(() => {
          onComplete && onComplete()
        }, 1100)
      }
    }, 1400)
  }

  // Manual typing in letter boxes
  const handleManualLetterChange = (i, char) => {
    if (isSuccess || !currentRiddle) return
    const val = char.slice(-1).toUpperCase()
    if (/^[A-Z]$/.test(val) || val === '') {
      sound.playTypewriter()
      const next = [...typedLetters]
      next[i] = val
      setTypedLetters(next)

      if (val && i < currentRiddle.answer.length - 1) {
        const nextInput = document.getElementById(`riddle-box-${i + 1}`)
        if (nextInput) nextInput.focus()
      }

      const fullWord = next.join('')
      if (fullWord === currentRiddle.answer) {
        triggerRiddleSolved()
      }
    }
  }

  // Calculate coordinates for circular Word Connect wheel letters
  const numLetters = currentRiddle?.wheelLetters?.length || 6
  const radius = 105 // radius in pixels

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden select-none font-sans bg-transparent">
      {/* Dark overlay for rich contrast */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* 1. TOP HEADER BAR */}
      <div className="relative z-20 w-full flex items-center justify-between px-4 sm:px-6 py-2.5 bg-black/80 backdrop-blur border-b border-white/20 text-white text-xs">
        <button
          onClick={onExit}
          className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 font-bold cursor-pointer transition"
        >
          ← Exit
        </button>

        {/* 3 Riddles Progress Tracker */}
        <div className="flex items-center gap-2">
          {activeRiddles.map((r, i) => (
            <div
              key={r.id}
              className={`h-2.5 w-8 rounded-full transition-all ${
                i < currentRiddleIndex
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : i === currentRiddleIndex
                  ? 'bg-amber-400 ring-2 ring-amber-300 animate-pulse'
                  : 'bg-white/20'
              }`}
            />
          ))}
          <span className="font-mono font-black text-amber-300 text-xs sm:text-sm ml-2">
            RIDDLE {currentRiddleIndex + 1} / 3
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffleRiddles}
            disabled={isLoadingApi}
            className="px-3.5 py-1.5 rounded-full bg-purple-700 hover:bg-purple-600 text-white font-bold cursor-pointer transition shadow active:scale-95 text-xs flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            <span>{isLoadingApi ? 'Fetching...' : 'New Riddles'}</span>
          </button>
          <button
            onClick={() => onComplete && onComplete()}
            className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold cursor-pointer transition shadow text-xs active:scale-95"
            title="Skip to Level 3 (Testing)"
          >
            Skip to Level 3 ➔
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: LEFT PINNED NOTE & RIGHT WORD CONNECT WHEEL */}
      <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
        
        {/* ================= LEFT: PINNED MEMO WITH RIDDLE (Image 5 Style) ================= */}
        <div className="flex-1 max-w-md w-full flex flex-col items-center">
          <div className="relative w-full rounded-2xl bg-[#fdfbf7] text-gray-900 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-2 border-[#e7e1d3] rotate-[-1deg] transition-all">
            
            {/* 3D Red Pushpin (Image 5 Reference) */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 drop-shadow-xl">
              <div className="relative flex flex-col items-center">
                <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-red-700 via-red-500 to-rose-300 shadow-md border border-red-800" />
                <div className="h-2 w-1 bg-gray-400 -mt-0.5" />
              </div>
            </div>

            {/* Note Header: Category & Title */}
            <div className="flex flex-col items-center text-center border-b border-gray-300/80 pb-3 mt-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full mb-1">
                {currentRiddle?.category || 'CRYPTIC ARCHIVES'}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black tracking-wider text-gray-900 uppercase">
                {currentRiddle?.title || 'THE RIDDLE'}
              </h2>
            </div>

            {/* Note Riddle Content */}
            <div className="my-5 text-center font-serif text-base sm:text-lg leading-relaxed text-gray-800 italic">
              "{currentRiddle?.question}"
            </div>

            {/* Hint Toggle */}
            <div className="border-t border-gray-300/80 pt-3 flex flex-col items-center gap-1.5">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-mono font-bold text-amber-900 hover:text-black flex items-center gap-1.5 cursor-pointer transition"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                </svg>
                <span>{showHint ? 'Hide Clue' : 'Reveal Clue & Letter Count'}</span>
              </button>
              {showHint && (
                <div className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 animate-fadeIn text-center">
                  {currentRiddle?.hint}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ================= RIGHT: WORD CONNECT SOLVER WHEEL (Image 6 Style) ================= */}
        <div className="flex-1 max-w-md w-full flex flex-col items-center gap-5">
          
          {/* Solution Letter Slots */}
          <div className="flex items-center gap-2 sm:gap-3">
            {typedLetters.map((char, i) => (
              <input
                key={i}
                id={`riddle-box-${i}`}
                type="text"
                maxLength={1}
                value={char}
                onChange={(e) => handleManualLetterChange(i, e.target.value)}
                className={`h-12 w-11 sm:h-14 sm:w-13 rounded-2xl text-center font-mono font-black text-2xl uppercase transition-all shadow-xl border-2 ${
                  isSuccess
                    ? 'bg-emerald-500 text-white border-emerald-300 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.8)]'
                    : char
                    ? 'bg-amber-400 text-black border-amber-300 ring-2 ring-amber-400'
                    : 'bg-black/70 text-white border-white/30 focus:border-amber-400 focus:bg-black/90 focus:outline-none'
                }`}
              />
            ))}
          </div>

          {/* Feedback status */}
          <div className="h-6 flex items-center justify-center">
            {statusMessage && (
              <span className="font-mono text-xs sm:text-sm font-black text-amber-300 animate-pulse drop-shadow">
                {statusMessage}
              </span>
            )}
          </div>

          {/* Circular Word Connect Wheel (Image 6 Style) */}
          <div className="relative h-64 w-64 rounded-full bg-black/60 border-4 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.3)] backdrop-blur flex items-center justify-center">
            
            {/* Center Clear Button */}
            <button
              onClick={handleClearWheel}
              className="h-14 w-14 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs uppercase shadow-lg border-2 border-white flex items-center justify-center transition active:scale-90 cursor-pointer"
              title="Clear selection"
            >
              CLEAR
            </button>

            {/* Circular Letters around the perimeter */}
            {currentRiddle?.wheelLetters?.map((letter, idx) => {
              const angle = (idx / numLetters) * 2 * Math.PI - Math.PI / 2
              const x = radius * Math.cos(angle)
              const y = radius * Math.sin(angle)
              const isSelected = selectedWheelIndices.includes(idx)

              return (
                <button
                  key={idx}
                  onClick={() => handleWheelLetterClick(idx)}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className={`absolute h-13 w-13 rounded-full flex items-center justify-center font-mono font-black text-xl transition-all duration-200 cursor-pointer shadow-xl ${
                    isSelected
                      ? 'bg-amber-400 text-black scale-110 ring-4 ring-white shadow-[0_0_20px_#f59e0b]'
                      : 'bg-[#1e1a2f] hover:bg-[#2e2848] text-amber-200 border-2 border-amber-400/40 hover:scale-105'
                  }`}
                >
                  {letter}
                </button>
              )
            })}
          </div>

          {/* Helper caption */}
          <div className="text-[11px] font-mono text-gray-300 text-center bg-black/50 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur">
            Tap letters on the wheel or type directly into boxes
          </div>

        </div>

      </div>

      {/* 3. FINAL VICTORY MODAL BEFORE LEVEL 3 */}
      {isFinalLevelComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0b101d] border-2 border-cyan-400 text-center text-white shadow-[0_0_60px_rgba(6,182,212,0.6)] flex flex-col items-center gap-4 animate-bounce">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-white shadow-lg">
              <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-300">
              ALL 3 RIDDLES CONQUERED!
            </h2>
            <p className="text-xs text-gray-300 font-mono">
              The ancient cyphers have unlocked the dimensional matrix.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold bg-cyan-950/80 px-4 py-2 rounded-full border border-cyan-500/50">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Breaching into Level 3: Gravity Core...</span>
            </div>

            <button
              onClick={() => onComplete && onComplete()}
              className="mt-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer transition flex items-center justify-center gap-2"
            >
              <span>Enter Level 3: Gravity Core ➔</span>
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
