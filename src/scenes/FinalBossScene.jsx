export default function FinalBossScene({ onBossDefeated, onExitToHub }) {
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
