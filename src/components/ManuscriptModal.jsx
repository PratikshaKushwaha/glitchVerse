import { useState, useEffect, useRef } from 'react'
import { sound } from '../utils/AudioEngine'
import { STORY_PAGES, pageText } from '../data/narrationScript'
import voiceoverUrl from '../assets/developer_radio_voice_with_sound_design.wav'

export default function ManuscriptModal({ isOpen, onClose }) {
  const [pageIndex, setPageIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const voiceoverRef = useRef(null)
  const hasFinishedRef = useRef(false)

  const currentPage = STORY_PAGES[pageIndex]
  const fullText = currentPage ? pageText(currentPage) : ''

  // Play developer radio transmission while open, auto-end when audio ends
  useEffect(() => {
    if (!isOpen) return
    hasFinishedRef.current = false
    setIsFadingOut(false)
    setPageIndex(0)

    if (typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock()
    }

    const audio = new Audio(voiceoverUrl)
    audio.volume = 1
    audio.currentTime = 0
    voiceoverRef.current = audio
    audio.play().catch(() => {})

    // When audio completes naturally, finish transmission automatically
    const handleAudioEnded = () => {
      finishTransmission()
    }
    audio.addEventListener('ended', handleAudioEnded)

    return () => {
      audio.removeEventListener('ended', handleAudioEnded)
      audio.pause()
      audio.currentTime = 0
      voiceoverRef.current = null
    }
  }, [isOpen])

  // Typewriter effect for current subtitle page
  useEffect(() => {
    if (!isOpen || !currentPage || hasFinishedRef.current) return

    sound.playGlitchRadio()
    setIsTyping(true)
    setDisplayedText('')

    let charIndex = 0
    const interval = setInterval(() => {
      charIndex += 3
      if (charIndex >= fullText.length) {
        setDisplayedText(fullText)
        setIsTyping(false)
        clearInterval(interval)
      } else {
        setDisplayedText(fullText.slice(0, charIndex))
        if (charIndex % 9 === 0) {
          sound.playTypewriter()
        }
      }
    }, 24)

    return () => clearInterval(interval)
  }, [isOpen, pageIndex, fullText])

  // Automatic progression: once typing finishes, wait naturally and auto-advance to next page
  useEffect(() => {
    if (!isOpen || isTyping || hasFinishedRef.current) return

    // Reading delay scales comfortably with text length (2.8s to 4.5s)
    const autoAdvanceDelay = Math.max(2800, fullText.length * 38)
    const timer = setTimeout(() => {
      if (pageIndex < STORY_PAGES.length - 1) {
        setPageIndex((prev) => prev + 1)
      } else {
        finishTransmission()
      }
    }, autoAdvanceDelay)

    return () => clearTimeout(timer)
  }, [isOpen, isTyping, pageIndex, fullText])

  const finishTransmission = () => {
    if (hasFinishedRef.current) return
    hasFinishedRef.current = true
    setIsFadingOut(true)
    sound.playDoorUnlock()
    setTimeout(() => {
      onClose && onClose()
    }, 600)
  }

  // Keyboard shortcut to skip transmission (Escape or K)
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (['Escape', 'KeyK', 'k', 'K'].includes(e.key) || e.code === 'KeyK') {
        e.preventDefault()
        finishTransmission()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen || !currentPage) return null

  // Render the revealed prefix block-by-block with subtitle styling
  const blockLengths = currentPage.blocks.map((block) => block.text.length)
  const revealedBlocks = currentPage.blocks.map((block, blockIdx) => {
    const start = blockLengths
      .slice(0, blockIdx)
      .reduce((acc, len) => acc + len + 2, 0)
    const end = start + block.text.length
    const revealed = displayedText.slice(start, Math.min(end, displayedText.length))
    return { ...block, revealed, blockIdx }
  })

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none pointer-events-none transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Holographic Cinematic Subtitle Box */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-400/40 bg-gradient-to-b from-[#08131d]/95 via-[#0b1b27]/95 to-[#04090f]/98 p-6 sm:p-7 text-[#ecfeff] shadow-[0_0_60px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/25">
        
        {/* Holographic Header Bar */}
        <div className="flex items-center justify-between border-b border-cyan-500/25 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
            </span>
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                {currentPage.speaker}
              </h2>
              <p className="text-[10px] font-mono tracking-wider text-cyan-300/60">
                {currentPage.status}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400/70">
            <span>TRANSMISSION: {pageIndex + 1}/{STORY_PAGES.length}</span>
          </div>
        </div>

        {/* Audio Equalizer Waveform Animation */}
        <div className="my-2.5 flex items-center gap-1.5 h-2.5">
          {[35, 80, 25, 95, 55, 20, 90, 40, 100, 30, 75, 45].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-cyan-400/80 rounded-full animate-pulse"
              style={{
                height: `${isTyping ? h : 30}%`,
                animationDelay: `${i * 0.07}s`,
              }}
            />
          ))}
          <span className="text-[10px] font-mono tracking-widest text-cyan-300/70 ml-2">
            AUDIO SUBTITLES // LIVE DECODE
          </span>
        </div>

        {/* Subtitle Dialogue & Cues (Auto-Typing Subtitle Display) */}
        <div className="min-h-[140px] max-h-[44vh] overflow-y-auto font-mono text-sm leading-relaxed text-cyan-100/95 sm:text-base border-l-2 border-cyan-500/50 pl-4 py-2 bg-cyan-950/20 rounded-r-md">
          {revealedBlocks.map((block, bIdx) => {
            if (!block.revealed) return null
            if (block.type === 'cue') {
              return (
                <p
                  key={bIdx}
                  className="italic text-cyan-400/60 text-[11px] sm:text-xs tracking-wide whitespace-pre-line my-1"
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

        {/* Bottom Status Ticker (No buttons or gestures needed) */}
        <div className="mt-4 flex items-center justify-between border-t border-cyan-500/20 pt-2 text-[10px] font-mono text-cyan-400/60">
          <span>Subtitles synced to radio voiceover • Auto-advancing</span>
          <span>Press [K] or [ESC] to skip</span>
        </div>
      </div>
    </div>
  )
}
