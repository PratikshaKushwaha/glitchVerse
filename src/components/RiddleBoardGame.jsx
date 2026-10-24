import { useState, useEffect, useRef } from 'react'
import woodBoardImg from '../assets/level2/wood_board.jpg'
import pinnedNoteImg from '../assets/level2/pinned_note.png'
import { sound } from '../utils/AudioEngine'

// 3 Riddles with Word Connect letter wheels
const RIDDLES = [
  {
    id: 1,
    title: 'RIDDLE 1 OF 3: THE ENGINE',
    question:
      'I have no physical form, yet I hold entire worlds. I speak strictly in logic, but I am born from human imagination. A single syntax flaw in me fractures reality. What am I?',
    hint: "7 Letters • Starts with 'P' • The blueprint of all software",
    answer: 'PROGRAM',
    wheelLetters: ['P', 'R', 'O', 'G', 'R', 'A', 'M'],
  },
  {
    id: 2,
    title: 'RIDDLE 2 OF 3: THE BEACON',
    question:
      'I travel through the digital void without feet. I link isolated sectors together. Block me, and the entire simulation goes silent. What am I?',
    hint: "6 Letters • Starts with 'S' • Electric broadcast of data",
    answer: 'SIGNAL',
    wheelLetters: ['S', 'I', 'G', 'N', 'A', 'L'],
  },
  {
    id: 3,
    title: 'RIDDLE 3 OF 3: THE ANOMALY',
    question:
      'I am an unexpected crack in the code that reveals the matrix is broken. I give you the power to break free. What am I?',
    hint: "6 Letters • Starts with 'G' • The name of our broken universe!",
    answer: 'GLITCH',
    wheelLetters: ['G', 'L', 'I', 'T', 'C', 'H'],
  },
]

export default function RiddleBoardGame({ onComplete, onExit }) {
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0)
  const currentRiddle = RIDDLES[currentRiddleIndex]

  // Formed word via Word Connect or typing
  const [selectedWheelIndices, setSelectedWheelIndices] = useState([])
  const [typedLetters, setTypedLetters] = useState([])
  const [isSuccess, setIsSuccess] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [isFinalLevelComplete, setIsFinalLevelComplete] = useState(false)

  const isDraggingWheel = useRef(false)
  const wheelCenterRef = useRef(null)

  // Sync letters with current riddle
  useEffect(() => {
    setTypedLetters(Array(currentRiddle.answer.length).fill(''))
    setSelectedWheelIndices([])
    setIsSuccess(false)
    setStatusMessage('')
    setShowHint(false)
  }, [currentRiddleIndex, currentRiddle])

  // Get current word from wheel selection
  const currentWheelWord = selectedWheelIndices
    .map((i) => currentRiddle.wheelLetters[i])
    .join('')

  // Handle letter click on wheel
  const handleWheelLetterClick = (index) => {
    if (isSuccess) return

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
    const chars = selectionIndices.map((i) => currentRiddle.wheelLetters[i])
    const newLetters = Array(currentRiddle.answer.length).fill('')
    for (let i = 0; i < chars.length && i < currentRiddle.answer.length; i++) {
      newLetters[i] = chars[i]
    }
    setTypedLetters(newLetters)
  }

  // Check if connected word matches
  const checkWordConnectWord = (selectionIndices) => {
    const word = selectionIndices.map((i) => currentRiddle.wheelLetters[i]).join('')
    if (word === currentRiddle.answer) {
      triggerRiddleSolved()
    }
  }

  // Clear current wheel
  const handleClearWheel = () => {
    sound.playTypewriter()
    setSelectedWheelIndices([])
    setTypedLetters(Array(currentRiddle.answer.length).fill(''))
    setStatusMessage('')
  }

  // Handle riddle solved
  const triggerRiddleSolved = () => {
    sound.playVictory()
    setIsSuccess(true)
    setStatusMessage(`★ SOLVED: "${currentRiddle.answer}" IS CORRECT! ★`)

    setTimeout(() => {
      if (currentRiddleIndex < RIDDLES.length - 1) {
        // Advance to next riddle
        setCurrentRiddleIndex((prev) => prev + 1)
      } else {
        // All 3 riddles solved! Transition to Level 3!
        setIsFinalLevelComplete(true)
        setTimeout(() => {
          onComplete && onComplete()
        }, 2200)
      }
    }, 1400)
  }

  // Manual typing in letter boxes
  const handleManualLetterChange = (i, char) => {
    if (isSuccess) return
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

  // Auto solve for testing
  const handleAutoSolve = () => {
    setTypedLetters(currentRiddle.answer.split(''))
    triggerRiddleSolved()
  }

  // Calculate coordinates for circular Word Connect wheel letters
  const numLetters = currentRiddle.wheelLetters.length
  const radius = 105 // radius in pixels

  return (
    <div
      className="relative w-screen h-screen flex flex-col justify-between overflow-hidden select-none font-sans"
      style={{
        backgroundImage: `url(${woodBoardImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for rich wooden contrast */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* 1. TOP HEADER BAR */}
      <div className="relative z-20 w-full flex items-center justify-between px-6 py-3 bg-black/75 backdrop-blur border-b border-white/20 text-white text-xs">
        <button
          onClick={onExit}
          className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 font-bold cursor-pointer transition"
        >
          ← Exit
        </button>

        {/* 3 Riddles Progress Tracker */}
        <div className="flex items-center gap-2">
          {RIDDLES.map((r, i) => (
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

        <button
          onClick={handleAutoSolve}
          className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition shadow"
        >
          ⚡ Auto Solve
        </button>
      </div>

      {/* 2. MAIN WORKSPACE: LEFT PINNED NOTE & RIGHT WORD CONNECT WHEEL */}
      <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col md:flex-row items-center justify-center gap-8">
        
        {/* ================= LEFT: PINNED MEMO WITH RIDDLE (Image 5 Style) ================= */}
        <div className="flex-1 max-w-md w-full flex flex-col items-center">
          <div className="relative w-full rounded-2xl bg-[#fdfbf7] text-gray-900 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-2 border-[#e7e1d3] rotate-[-1deg] transition-all">
            
            {/* 3D Red Pushpin (Image 5 Reference) */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 drop-shadow-xl">
              <div className="relative flex flex-col items-center">
                <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-red-700 via-red-500 to-rose-300 shadow-md border border-red-800" />
                <div className="h-2 w-1.5 bg-red-950/80 rounded-b" />
              </div>
            </div>

            {/* Note Header */}
            <div className="text-center pt-2 pb-2.5 border-b border-dashed border-gray-300">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-red-700 block">
                {currentRiddle.title}
              </span>
              <h2 className="text-base sm:text-lg font-serif font-bold text-gray-900 mt-0.5">
                Classified Investigation Memo
              </h2>
            </div>

            {/* Riddle Text Body */}
            <div className="py-3.5 text-xs sm:text-sm font-serif leading-relaxed text-gray-800 italic bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/70 my-3">
              "{currentRiddle.question}"
            </div>

            {/* Hint Box */}
            <div className="mb-3">
              {showHint ? (
                <div className="p-2 rounded-lg bg-yellow-100 border border-yellow-300 text-yellow-900 text-xs font-mono">
                  💡 <strong>Hint:</strong> {currentRiddle.hint}
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-[11px] font-mono text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  Need a hint? Click here
                </button>
              )}
            </div>

            {/* Answer Slots / Letter Boxes on the Memo */}
            <div className="flex flex-col items-center gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">
                CONNECT OR TYPE ANSWER ({currentRiddle.answer.length} LETTERS):
              </span>
              
              <div className="flex items-center gap-1.5 sm:gap-2">
                {typedLetters.map((char, i) => (
                  <input
                    key={i}
                    id={`riddle-box-${i}`}
                    type="text"
                    maxLength={1}
                    value={char}
                    disabled={isSuccess}
                    onChange={(e) => handleManualLetterChange(i, e.target.value)}
                    className={`h-11 w-9 sm:h-12 sm:w-10 rounded-xl text-center font-mono font-black text-xl sm:text-2xl border-2 uppercase transition-all shadow-sm ${
                      isSuccess
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-800 scale-105'
                        : char
                        ? 'bg-amber-100 border-amber-500 text-black'
                        : 'bg-white border-gray-400 text-gray-800 focus:border-blue-500'
                    }`}
                  />
                ))}
              </div>

              {/* Status Banner */}
              {statusMessage && (
                <div
                  className={`text-xs font-mono font-black mt-1 text-center animate-bounce ${
                    isSuccess ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {statusMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT: WORD CONNECT CIRCULAR WHEEL (Image 1 / "Img 6" Style) ================= */}
        <div className="flex-1 max-w-md w-full flex flex-col items-center">
          <div className="relative w-full rounded-3xl bg-[#090d16]/95 border-2 border-cyan-400/80 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-5 backdrop-blur text-white flex flex-col items-center text-center">
            
            {/* Header Badge */}
            <div className="w-full flex items-center justify-between pb-2 border-b border-cyan-500/30 text-xs font-mono">
              <span className="text-cyan-400 font-bold">WORD CONNECT WHEEL</span>
              <span className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-400/50 text-cyan-300">
                ACTIVE CIPHER
              </span>
            </div>

            {/* Circular Word Connect Wheel (Image 1 Style) */}
            <div
              ref={wheelCenterRef}
              className="relative w-64 h-64 sm:w-72 sm:h-72 my-3 rounded-full bg-gradient-to-br from-[#042f2e]/80 via-[#064e3b]/50 to-[#022c22]/80 border-4 border-emerald-400/60 shadow-[0_0_50px_rgba(16,185,129,0.3)] flex items-center justify-center"
            >
              {/* Outer Glowing Ring */}
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-emerald-400/30 pointer-events-none" />

              {/* Center Shuffle / Reset Icon Button */}
              <button
                onClick={handleClearWheel}
                className="h-14 w-14 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 text-black border-2 border-white shadow-lg flex items-center justify-center text-xl cursor-pointer hover:scale-105 active:scale-95 transition z-20"
                title="Clear / Reset Selection"
              >
                🔄
              </button>

              {/* Letters Positioned on Circular Ring (Word Connect Style from Image 1) */}
              {currentRiddle.wheelLetters.map((char, index) => {
                const angle = (index / numLetters) * 2 * Math.PI - Math.PI / 2
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius
                const isSelected = selectedWheelIndices.includes(index)

                return (
                  <button
                    key={index}
                    onClick={() => handleWheelLetterClick(index)}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    className={`absolute h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center font-mono font-black text-xl sm:text-2xl cursor-pointer transition-all duration-200 select-none shadow-[0_6px_12px_rgba(0,0,0,0.6)] ${
                      isSelected
                        ? 'bg-gradient-to-b from-emerald-400 to-green-600 text-white border-2 border-white scale-110 shadow-[0_0_20px_#10b981] z-30'
                        : 'bg-gradient-to-b from-white via-slate-100 to-slate-200 text-slate-900 border-2 border-white/80 hover:scale-105'
                    }`}
                  >
                    {char}
                  </button>
                )
              })}
            </div>

            {/* Currently Selected Word String */}
            <div className="h-8 flex items-center justify-center">
              {currentWheelWord ? (
                <span className="text-base sm:text-lg font-mono font-black tracking-widest text-emerald-300 bg-emerald-950/80 px-4 py-1 rounded-full border border-emerald-400/60 shadow">
                  {currentWheelWord}
                </span>
              ) : (
                <span className="text-xs font-mono text-gray-400">
                  Tap or connect letter tiles in order to form the answer
                </span>
              )}
            </div>

            {/* Advance to Level 3 / Next Riddle Button */}
            {isFinalLevelComplete && (
              <button
                onClick={onComplete}
                className="mt-3 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.7)] hover:brightness-110 active:scale-95 cursor-pointer transition flex items-center justify-center gap-2 animate-bounce"
              >
                <span>All 3 Riddles Solved! Advance to Level 3</span>
                <span className="text-lg">➔</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 3. FOOTER */}
      <div className="relative z-20 text-center py-2 text-[11px] font-mono text-white/60 bg-black/60 backdrop-blur">
        GlitchVerse • Sector 2 Investigation Board • Level 2 Sublevel 4
      </div>
    </div>
  )
}
