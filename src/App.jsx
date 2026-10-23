import { useEffect, useState } from 'react'
import ambientVideo from './assets/enchanted_cottage_ambient.mp4'

const App = () => {
  const [hasSavedProgress, setHasSavedProgress] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setHasSavedProgress(window.localStorage.getItem('the-way-out-progress') !== null)
  }, [])

  const beginJourney = (continueJourney = false) => {
    setMessage(continueJourney ? 'Returning to your journey…' : 'Your journey is beginning…')
    setIsLeaving(true)
  }

  const quitGame = () => {
    window.close()
    setMessage('You can close this window to leave the game.')
  }

  return (
    <main className={`relative flex min-h-screen min-w-80 items-center justify-end overflow-hidden bg-[#18241d] text-[#f4f1e8] transition duration-700 ease-out ${isLeaving ? 'scale-[1.025] opacity-0' : 'opacity-100'}`}>
      <video
        className="absolute inset-0 size-full scale-[1.025] object-cover object-center brightness-[.7] saturate-[.72]"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        src={ambientVideo}
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(270deg,rgba(9,17,13,.78)_0%,rgba(9,17,13,.46)_42%,rgba(9,17,13,.25)_100%),linear-gradient(0deg,rgba(8,15,11,.72)_0%,transparent_45%,rgba(8,15,11,.18)_100%)]"
        aria-hidden="true"
      />

      <section className="relative z-10 w-full max-w-xl px-8 py-20 text-left sm:mr-[clamp(2rem,12vw,11rem)] sm:px-0" aria-label="Main menu">
        <p className="mb-6 flex items-center gap-3 text-[.68rem] font-medium uppercase tracking-[.26em] text-[#c2d0bb] before:h-px before:w-10 before:bg-[#a9c29e] before:content-['']">
          An atmospheric journey
        </p>
        <h1 className="font-serif text-[clamp(4rem,9vw,7.5rem)] font-medium leading-[.87] tracking-[-.06em] text-[#f7f4eb] drop-shadow-[0_3px_30px_rgba(0,0,0,.22)]">
          <span className="mb-2 block pl-1 text-[.34em] leading-none tracking-[.03em] text-[#c8d4bd]">The</span>
          Way Out
        </h1>
        <p className="mb-12 mt-6 text-[.84rem] tracking-[.05em] text-[#d8ded1]">Somewhere between here and elsewhere.</p>

        <nav className="flex w-56 flex-col items-start gap-2" aria-label="Game actions">
          <button
            className="flex min-h-12 w-full cursor-pointer items-center justify-between rounded-sm border border-[#dce8d3] bg-[#dce8d3] px-4 py-3 text-left text-xs uppercase tracking-[.14em] text-[#223124] transition duration-200 hover:translate-x-1 hover:border-[#f0f5e9] hover:bg-[#f0f5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dce8d3]"
            onClick={() => beginJourney()}
          >
            <span>Start Game</span>
            <span className="text-lg leading-none" aria-hidden="true">↗</span>
          </button>
          {hasSavedProgress && (
            <button
              className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 rounded-sm border border-white/30 bg-transparent px-4 py-3 text-left text-xs uppercase tracking-[.14em] text-[#f4f1e8] transition duration-200 hover:translate-x-1 hover:border-white/75 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dce8d3]"
              onClick={() => beginJourney(true)}
            >
              <span>Continue</span>
              <span className="ml-auto text-[.54rem] normal-case tracking-[.08em] text-[#bfcbb8]">Resume your journey</span>
            </button>
          )}
          <button
            className="flex min-h-10 w-full cursor-pointer items-center rounded-sm border border-transparent bg-transparent px-4 py-3 text-left text-xs uppercase tracking-[.14em] text-[#c2cdbb] transition duration-200 hover:translate-x-1 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dce8d3]"
            onClick={quitGame}
          >
            <span>Quit</span>
          </button>
        </nav>

        <p className={`mt-4 text-[.7rem] tracking-[.08em] text-[#dce8d3] transition-opacity duration-300 ${message ? 'opacity-100' : 'opacity-0'}`} role="status">
          {message}
        </p>
      </section>

      <footer className="absolute bottom-8 right-8 z-10 flex items-center gap-4 text-[.6rem] uppercase tracking-[.12em] text-[#dae2d3]/60 sm:right-[clamp(2rem,12vw,11rem)]">
        <span>© 2026 The Way Out</span>
        <span className="h-px w-8 bg-[#dae2d3]/45" aria-hidden="true" />
        <span className="hidden sm:inline">Press enter to begin</span>
      </footer>
    </main>
  )
}

export default App
