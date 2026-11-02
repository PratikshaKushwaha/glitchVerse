import { useEffect } from 'react'

export default function FinalBossScene({ onBossDefeated, onExitToHub }) {
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && (event.data.type === 'AFTERLIFE_TRANSITION' || event.data.type === 'BOSS_DEFEATED')) {
        if (typeof onBossDefeated === 'function') {
          onBossDefeated()
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onBossDefeated])

  // Global keyboard shortcut to skip boss: Press 'K'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        if (typeof onBossDefeated === 'function') {
          onBossDefeated()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onBossDefeated])

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#080305]">
      {/* Floating Top-Right Skip Boss Button */}
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <button
          onClick={() => onBossDefeated && onBossDefeated()}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:brightness-110 active:scale-95 text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.7)] border border-amber-200 cursor-pointer transition flex items-center gap-2"
          title="Skip Final Boss (Press K or Click)"
        >
          <span>Skip Boss [K]</span>
          <span>➔</span>
        </button>
      </div>

      <iframe
        src="/finalboss.html"
        title="The Puppet Master — Final Boss"
        className="h-screen w-screen border-0"
        style={{ background: '#080305' }}
        allow="autoplay; fullscreen; pointer-lock"
      />
    </div>
  )
}
