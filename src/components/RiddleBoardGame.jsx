import { useState, useEffect } from 'react'
import woodBoardImg from '../assets/level2/wood_board.jpg'
import pinnedNoteImg from '../assets/level2/pinned_note.png'
import { sound } from '../utils/AudioEngine'

export default function RiddleBoardGame({ onComplete, onExit }) {
  // Target secret word
  const SECRET_WORD = 'PROGRAM'
  const [letters, setLetters] = useState(Array(7).fill(''))
  const [status, setStatus] = useState('')
  const [isSolved, setIsSolved] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Handle letter input
  const handleInputChange = (index, value) => {
    if (!value) {
      const next = [...letters]
      next[index] = ''
      setLetters(next)
      return
    }

    const char = value.slice(-1).toUpperCase()
    if (/^[A-Z]$/.test(char)) {
      sound.playTypewriter()
      const next = [...letters]
      next[index] = char
      setLetters(next)

      // Auto-advance focus to next input
      if (index < 6) {
        const nextInput = document.getElementById(`riddle-letter-${index + 1}`)
        if (nextInput) nextInput.focus()
      }
    }
  }

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !letters[index] && index > 0) {
      const prevInput = document.getElementById(`riddle-letter-${index - 1}`)
      if (prevInput) prevInput.focus()
    } else if (e.key === 'Enter') {
      handleCheckAnswer()
    }
  }

  // Check answer
  const handleCheckAnswer = () => {
    const guess = letters.join('').toUpperCase()
    if (guess.length < 7) {
      setStatus('Please fill in all 7 letters!')
      return
    }

    if (guess === SECRET_WORD) {
      sound.playVictory()
      setIsSolved(true)
      setStatus('★ CIPHER SOLVED! "PROGRAM" IS THE KEY! ★')
    } else {
      sound.playDoorLocked()
      setStatus('Incorrect word. Check the riddle and hint!')
      setTimeout(() => setStatus(''), 2500)
    }
  }

  // Auto-solve for testing
  const handleAutoSolve = () => {
    setLetters(SECRET_WORD.split(''))
    setIsSolved(true)
    setStatus('★ CIPHER SOLVED! "PROGRAM" IS THE KEY! ★')
    sound.playVictory()
  }

  return (
    <div
      className="relative w-screen h-screen flex flex-col justify-between overflow-hidden select-none font-sans"
      style={{
        backgroundImage: `url(${woodBoardImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for rich contrast */}
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-20 w-full flex items-center justify-between px-6 py-3 bg-black/60 backdrop-blur border-b border-white/20 text-white text-xs">
        <button
          onClick={onExit}
          className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 font-bold cursor-pointer transition"
        >
          ← Exit
        </button>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-mono font-bold text-amber-300 uppercase tracking-widest text-xs sm:text-sm">
            SUBLEVEL 4: THE MASTER ARCHIVE RIDDLE BOARD
          </span>
        </div>
        <button
          onClick={handleAutoSolve}
          className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition shadow"
        >
          ⚡ Auto Solve
        </button>
      </div>

      {/* Main Board Work Area: Left Pinned Note & Right Image 6 Dossier Slot */}
      <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col md:flex-row items-center justify-center gap-8">
        
        {/* ================= LEFT: PINNED NOTE (Image 5 Style) ================= */}
        <div className="flex-1 max-w-md w-full flex flex-col items-center">
          {/* Note Container with realistic paper texture and Red Pushpin */}
          <div className="relative w-full rounded-2xl bg-[#fdfbf7] text-gray-900 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.65)] border-2 border-[#e7e1d3] rotate-[-1deg] transition-transform hover:rotate-0">
            
            {/* 3D Red Pushpin at Top Center (Image 5 Style) */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 drop-shadow-lg">
              <div className="relative flex flex-col items-center">
                {/* Red pin head */}
                <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-red-700 via-red-500 to-rose-300 shadow-md border border-red-800" />
                {/* Pin stem shadow */}
                <div className="h-2 w-1.5 bg-red-900/80 rounded-b" />
              </div>
            </div>

            {/* Note Memo Header */}
            <div className="text-center pt-2 pb-3 border-b border-dashed border-gray-300">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-red-700 block">
                ★ CLASSIFIED DEVELOPER MEMO ★
              </span>
              <h2 className="text-base sm:text-lg font-serif font-bold text-gray-900 mt-1">
                The Origin Riddle
              </h2>
            </div>

            {/* Riddle Text Body */}
            <div className="py-4 text-xs sm:text-sm font-serif leading-relaxed text-gray-800 italic bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60 my-3">
              "I have no physical form, but I hold entire worlds.<br />
              I speak strictly in logic, yet I am born from human dreams.<br />
              A single glitch or syntax flaw in me can fracture reality.<br />
              <strong className="not-italic text-black font-bold block mt-2 text-center text-sm">
                What am I?
              </strong>"
            </div>

            {/* Hint Section */}
            <div className="mb-4">
              {showHint ? (
                <div className="p-2.5 rounded-lg bg-yellow-100 border border-yellow-300 text-yellow-900 text-xs font-mono">
                  💡 <strong>Hint:</strong> 7 Letters • Starts with 'P' and ends with 'M' • The code that makes the GlitchVerse run!
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

            {/* 7-Letter Word Guess Input Boxes */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-bold">
                ENTER 7-LETTER SOLUTION:
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {letters.map((char, i) => (
                  <input
                    key={i}
                    id={`riddle-letter-${i}`}
                    type="text"
                    maxLength={1}
                    value={char}
                    disabled={isSolved}
                    onChange={(e) => handleInputChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`h-11 w-9 sm:h-12 sm:w-10 rounded-lg text-center font-mono font-black text-xl sm:text-2xl border-2 uppercase transition-all shadow-sm ${
                      isSolved
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                        : char
                        ? 'bg-amber-100 border-amber-500 text-black'
                        : 'bg-white border-gray-400 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-300'
                    }`}
                  />
                ))}
              </div>

              {/* Submit Button */}
              {!isSolved ? (
                <button
                  onClick={handleCheckAnswer}
                  className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-105 active:scale-95 text-black font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition"
                >
                  Verify Guess ↵
                </button>
              ) : (
                <div className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider shadow flex items-center gap-2">
                  <span>✓</span>
                  <span>CIPHER DECRYPTED: PROGRAM</span>
                </div>
              )}

              {/* Status Message */}
              {status && (
                <div
                  className={`text-xs font-mono font-bold mt-1 text-center ${
                    isSolved ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {status}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT: IMAGE 6 EVIDENCE DOSSIER SLOT ================= */}
        <div className="flex-1 max-w-md w-full flex flex-col items-center">
          <div className="relative w-full rounded-2xl bg-[#090d16]/95 border-2 border-cyan-400/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 backdrop-blur text-white flex flex-col items-center text-center">
            
            {/* Header Badge */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-cyan-500/30 text-xs font-mono">
              <span className="text-cyan-400 font-bold">EVIDENCE DOSSIER</span>
              <span className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-400/50 text-cyan-300">
                SLOT #06
              </span>
            </div>

            {/* Blueprint Grid / Image 6 Mounting Frame */}
            <div className="w-full h-56 sm:h-64 rounded-xl bg-[#030712] border-2 border-dashed border-cyan-500/50 my-4 flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner">
              
              {/* Animated Cyber Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {isSolved ? (
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(16,185,129,0.8)] animate-bounce">
                    🔓
                  </div>
                  <div className="font-mono text-sm font-black text-emerald-400 uppercase tracking-widest">
                    ARCHIVE FULLY UNLOCKED!
                  </div>
                  <p className="text-xs text-gray-300 max-w-xs leading-relaxed">
                    The final riddle is solved and Sector 2 is liberated! Image #06 ready to mount.
                  </p>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                  <div className="h-12 w-12 rounded-xl bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-2xl">
                    🖼️
                  </div>
                  <div className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
                    [ IMAGE 6 EVIDENCE MOUNT ]
                  </div>
                  <p className="text-[11px] font-mono text-gray-400 max-w-xs leading-relaxed mt-1">
                    Slot reserved for Image #06 (will be mounted in the next prompt). Solve the riddle on the left to verify credentials!
                  </p>
                </div>
              )}
            </div>

            {/* Advance to Grand Victory Button */}
            {isSolved ? (
              <button
                onClick={onComplete}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:brightness-110 active:scale-95 cursor-pointer transition flex items-center justify-center gap-2 animate-bounce"
              >
                <span>Conquer Level 2 & Claim Victory! 🏆</span>
                <span className="text-lg">➔</span>
              </button>
            ) : (
              <div className="text-[11px] font-mono text-gray-400">
                Awaiting correct riddle solution from left memo
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Footer Credits */}
      <div className="relative z-20 text-center py-2 text-[11px] font-mono text-white/60 bg-black/50 backdrop-blur">
        GlitchVerse • Sector 2 Investigation Board
      </div>
    </div>
  )
}
