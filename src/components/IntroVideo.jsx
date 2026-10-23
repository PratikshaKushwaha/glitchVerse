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
    <div className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden select-none">
      {/* Video element */}
      <video
        ref={videoRef}
        src={openingVideo}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onFinish}
      />

      {/* Prominent, clean Skip Option Bar at Top Right */}
      <div className="absolute top-6 right-6 z-40 flex items-center gap-3">
        {isMuted && (
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.muted = false
                setIsMuted(false)
              }
            }}
            className="px-3.5 py-2 rounded-lg bg-black/70 hover:bg-black/90 border border-white/20 text-xs font-mono text-white cursor-pointer backdrop-blur transition"
          >
            🔊 Unmute Audio
          </button>
        )}

        <button
          onClick={onFinish}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-black/80 hover:bg-black border border-cyan-400/60 text-xs font-mono font-bold tracking-wider uppercase text-cyan-200 hover:text-white cursor-pointer backdrop-blur transition shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95"
          title="Skip to Door Scene (Press Space)"
        >
          <span>Skip Video</span>
          <span className="text-[10px] bg-cyan-950 border border-cyan-400/50 px-1.5 py-0.5 rounded text-cyan-300">
            SPACE ↵
          </span>
          <span className="text-sm">→</span>
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
