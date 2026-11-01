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

  return (
    <iframe
      src="/finalboss.html"
      title="The Puppet Master — Final Boss"
      className="h-screen w-screen border-0"
      style={{ background: '#080305' }}
      allow="autoplay; fullscreen; pointer-lock"
    />
  )
}
