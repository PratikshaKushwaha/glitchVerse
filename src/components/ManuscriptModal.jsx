import { useState, useEffect } from 'react'
import { sound } from '../utils/AudioEngine'

const STORY_PAGES = [
  {
    speaker: 'DEVELOPER // RADIO COMM [FREQ 104.7 MHZ]',
    status: 'SIGNAL ESTABLISHED',
    lines: [
      'Can you hear me through the static? If you are reading this script... you are the chosen one.',
      'I was coding the core reality engine when a recursive glitch trapped my consciousness inside this world.',
      'The architecture of this place is fragmented. Physics and logic are warped.',
    ],
  },
  {
    speaker: 'DEVELOPER // RADIO COMM [FREQ 104.7 MHZ]',
    status: 'SECTOR INTEL: LEVEL 1',
    lines: [
      'To free me, you must navigate through 4 distorted dimensions.',
      'Ahead of you lies LEVEL 1: The Abandoned Complex. Eight rooms filled with misplaced memories and locked code doors.',
      'Use GLITCH VISION (Hold Q) to reveal the hidden golden digits.',
      'I have unlocked the Teleport Door behind you. Step through when you are ready.',
    ],
  },
]

export default function ManuscriptModal({ isOpen, onClose }) {
  const [pageIndex, setPageIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  const currentPage = STORY_PAGES[pageIndex]
  const fullText = currentPage.lines.join('\n\n')

  // Trigger radio crackle and typewriter effect on page load
  useEffect(() => {
    if (!isOpen) {
      setPageIndex(0)
      setDisplayedText('')
      return
    }

    sound.playGlitchRadio()
    setIsTyping(true)
    setDisplayedText('')

    let charIndex = 0
    const interval = setInterval(() => {
      charIndex += 2
      if (charIndex >= fullText.length) {
        setDisplayedText(fullText)
        setIsTyping(false)
        clearInterval(interval)
      } else {
        setDisplayedText(fullText.slice(0, charIndex))
        if (charIndex % 6 === 0) {
          sound.playTypewriter()
        }
      }
    }, 28)

    return () => clearInterval(interval)
  }, [isOpen, pageIndex, fullText])

  if (!isOpen) return null

  const handleNextOrClose = () => {
    if (isTyping) {
      // Instant finish typing
      setDisplayedText(fullText)
      setIsTyping(false)
      return
    }

    if (pageIndex < STORY_PAGES.length - 1) {
      setPageIndex((p) => p + 1)
    } else {
      // Finish reading!
      sound.playDoorUnlock()
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md transition-all duration-300 p-4 select-none"
      onClick={handleNextOrClose}
    >
      {/* Ancient Glowing Parchment / Glitched Cipher Container */}
      <div
        className="relative w-full max-w-2xl rounded-xl border border-cyan-500/40 bg-gradient-to-b from-[#09151e]/95 via-[#0c1a24]/95 to-[#050b10]/98 p-7 text-[#ecfeff] shadow-[0_0_60px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Holographic Header Bar */}
        <div className="flex items-center justify-between border-b border-cyan-500/25 pb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
            </span>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                {currentPage.speaker}
              </h2>
              <p className="text-[10px] tracking-wider text-cyan-300/60">
                {currentPage.status}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400/80">
              PAGE {pageIndex + 1}/{STORY_PAGES.length}
            </span>
          </div>
        </div>

        {/* Visual Novel Audio Equalizer Effect */}
        <div className="my-4 flex items-center gap-1.5 h-3">
          {[40, 75, 30, 90, 60, 20, 85, 45, 95, 30, 70, 50].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-cyan-400/70 rounded-full animate-pulse"
              style={{
                height: `${isTyping ? h : 25}%`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
          <span className="text-[11px] font-mono tracking-wider text-cyan-300/70 ml-2">
            AUDIO DECODER ACTIVE
          </span>
        </div>

        {/* Typewriter Story Narration Box */}
        <div className="min-h-[170px] whitespace-pre-line font-mono text-sm leading-relaxed text-cyan-100/90 sm:text-base border-l-2 border-cyan-500/50 pl-4 py-2 bg-cyan-950/20 rounded-r-md">
          {displayedText}
          {isTyping && (
            <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-cyan-500/25 pt-4">
          <div className="flex items-center gap-1.5">
            <kbd className="px-2.5 py-1 rounded bg-cyan-900/70 border border-cyan-500/60 text-cyan-200 font-mono font-bold text-xs shadow-[0_0_8px_rgba(6,182,212,0.3)]">E</kbd>
          </div>

          <div className="flex gap-2">
            {isTyping && (
              <button
                className="px-3 py-1.5 text-xs uppercase tracking-wider text-cyan-400 hover:text-cyan-200 border border-cyan-500/30 rounded cursor-pointer transition"
                onClick={() => {
                  setDisplayedText(fullText)
                  setIsTyping(false)
                }}
              >
                Skip Typing
              </button>
            )}

            <button
              className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-cyan-500 text-[#02131b] hover:bg-cyan-400 active:scale-95 rounded cursor-pointer transition shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              onClick={handleNextOrClose}
            >
              {pageIndex < STORY_PAGES.length - 1
                ? 'Next Page →'
                : 'Close & Unlock Door ➔'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
