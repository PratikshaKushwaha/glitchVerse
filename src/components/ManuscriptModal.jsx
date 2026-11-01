import { useState, useEffect, useRef } from 'react'
import { sound } from '../utils/AudioEngine'
import { STORY_PAGES, pageText } from '../data/narrationScript'
import voiceoverUrl from '../assets/developer_radio_voice_with_sound_design.wav'

export default function ManuscriptModal({ isOpen, onClose }) {
  const [pageIndex, setPageIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  // Voiceover transmission: plays once per reading, across all narration pages
  const voiceoverRef = useRef(null)

  const currentPage = STORY_PAGES[pageIndex]
  const fullText = currentPage ? pageText(currentPage) : ''

  // Play the developer's recorded radio transmission while the script is open
  useEffect(() => {
    if (!isOpen) return
    const audio = new Audio(voiceoverUrl)
    audio.volume = 1
    audio.currentTime = 0
    voiceoverRef.current = audio
    audio.play().catch(() => {})

    return () => {
      audio.pause()
      audio.currentTime = 0
      voiceoverRef.current = null
    }
  }, [isOpen])

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

  if (!isOpen || !currentPage) return null

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

  // Render the revealed prefix block-by-block so stage cues
  // ([SFX: ...], [Static interference]...) get their own dimmed styling.
  const blockLengths = currentPage.blocks.map((block) => block.text.length)
  const revealedBlocks = currentPage.blocks.map((block, blockIdx) => {
    // + 2 per separator: pageText joins blocks with '\n\n'
    const start = blockLengths
      .slice(0, blockIdx)
      .reduce((acc, len) => acc + len + 2, 0)
    const end = start + block.text.length
    const revealed = displayedText.slice(start, Math.min(end, displayedText.length))
    return { ...block, revealed, blockIdx }
  })

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

        {/* Typewriter Story Narration Box (dialogue + radio stage cues) */}
        <div className="min-h-[170px] max-h-[46vh] overflow-y-auto font-mono text-sm leading-relaxed text-cyan-100/90 sm:text-base border-l-2 border-cyan-500/50 pl-4 py-2 bg-cyan-950/20 rounded-r-md">
          {revealedBlocks.map((block, bIdx) => {
            if (!block.revealed) return null
            if (block.type === 'cue') {
              return (
                <p
                  key={bIdx}
                  className="italic text-cyan-400/50 text-[11px] sm:text-xs tracking-wide whitespace-pre-line my-1"
                >
                  {block.revealed}
                </p>
              )
            }
            if (block.type === 'system') {
              return (
                <p
                  key={bIdx}
                  className="text-rose-400 font-bold tracking-[.2em] text-xs sm:text-sm animate-pulse my-2 text-center whitespace-pre-line"
                >
                  {block.revealed}
                </p>
              )
            }
            return (
              <p key={bIdx} className="whitespace-pre-line my-1">
                {block.revealed}
                {isTyping &&
                  bIdx === revealedBlocks.findLastIndex((b) => b.revealed) && (
                    <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
                  )}
              </p>
            )
          })}
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
