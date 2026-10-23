import { useRef, useState, useEffect } from 'react'
import openingVideo from '../assets/opening.mp4'

export default function IntroVideo({ onFinish }) {
  const videoRef = useRef(null)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  // Handle keyboard skip (Space, Escape, Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Escape' || e.code === 'Enter') {
        e.preventDefault()
        onFinish()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onFinish])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration || 1
      setProgress((current / total) * 100)
    }
  }

  // Ensure autoplay attempts smoothly
  useEffect(() => {
    if (videoRef.current) {
      const promise = videoRef.current.play()
      if (promise !== undefined) {
        promise.catch(() => {
          // If browser restricts unmuted autoplay, mute and continue playing
          if (videoRef.current) {
            videoRef.current.muted = true
            setIsMuted(true)
            videoRef.current.play().catch(() => {})
          }
        })
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black flex items-center justify-center overflow-hidden select-none z-50">
      {/* Video element covering 100% of the screen (object-cover fills entire display, no bars) */}
      <video
        ref={videoRef}
        src={openingVideo}
        className="w-full h-full object-cover pointer-events-none"
        autoPlay
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onFinish}
      />

      {/* Top Left Transmission indicator */}
      <div className="absolute top-6 left-6 z-30 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/75 border border-white/20 backdrop-blur">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
        </span>
        <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-200">
          PROLOGUE
        </span>
      </div>

      {/* Solid Watermark Blocker & Skip Button container firmly anchored at bottom-right corner */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3">
        {isMuted && (
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.muted = false
                setIsMuted(false)
              }
            }}
            className="px-4 py-3 rounded-xl bg-black/95 hover:bg-black border border-white/30 text-xs font-mono text-white cursor-pointer backdrop-blur shadow-2xl transition"
          >
            🔊 Unmute
          </button>
        )}

        {/* Large, solid Skip Button covering and obscuring the bottom-right watermark */}
        <button
          onClick={onFinish}
          className="relative min-w-[210px] flex items-center justify-between gap-3 px-6 py-3.5 rounded-xl bg-[#090d16] hover:bg-black border-2 border-cyan-400 text-xs sm:text-sm font-mono font-black tracking-wider uppercase text-cyan-200 hover:text-white cursor-pointer shadow-[0_0_35px_rgba(6,182,212,0.65)] active:scale-95 transition"
          title="Skip to Door Scene (Press Space)"
        >
          <span>SKIP VIDEO</span>
          <span className="text-[11px] bg-cyan-950 border border-cyan-400/60 px-2 py-0.5 rounded text-cyan-300">
            SPACE ↵
          </span>
          <span className="text-base">→</span>
        </button>
      </div>

      {/* Subtle Bottom Progress Track */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-30">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
