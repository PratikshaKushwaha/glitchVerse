import { useEffect, useState } from 'react'
import ambientVideo from './assets/enchanted_cottage_ambient.mp4'
import IntroVideo from './components/IntroVideo'
import HubScene from './scenes/HubScene'
import RoomScene from './scenes/RoomScene'
import LevelTwoScene from './scenes/LevelTwoScene'
import LevelThreeScene from './scenes/LevelThreeScene'

const App = () => {
  // Pure narrative game progression:
  // 'menu' (Whimsical Landing) -> 'video' (opening.mp4) -> 'hub' (Door Scene) -> 'room' (Level 1: 5 Rooms) -> 'level2' (Level 2: Word Search & Memory vs Bot)
  const [currentScene, setCurrentScene] = useState('menu')
  const [hasSavedProgress, setHasSavedProgress] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setHasSavedProgress(window.localStorage.getItem('the-way-out-progress') !== null)
  }, [])

  const beginJourney = (continueJourney = false) => {
    setMessage(continueJourney ? 'Resuming your journey…' : 'Awakening the connection…')
    setIsLeaving(true)
    setTimeout(() => {
      setIsLeaving(false)
      setCurrentScene('video')
    }, 700)
  }

  const quitGame = () => {
    window.close()
    setMessage('You can close this window to leave the game.')
  }

  // 1. Intro Video Scene (opening.mp4 with skip option)
  if (currentScene === 'video') {
    return <IntroVideo onFinish={() => setCurrentScene('hub')} />
  }

  // 2. Door Scene (environment_collider.glb, floating manuscript, locked/unlocked door)
  if (currentScene === 'hub') {
    return <HubScene onEnterLevelOne={() => setCurrentScene('room')} />
  }

  // 3. Level 1: 5 Rooms Scene (with 2-min timer, 3 lives, golden digits permutation)
  if (currentScene === 'room') {
    return (
      <RoomScene
        onGoToLevel2={() => setCurrentScene('level2')}
      />
    )
  }

  // 4. Level 2: 4 Sublevels (Word Search -> Memory Bot -> Double Cadgy -> Pinned Riddle Board)
  if (currentScene === 'level2') {
    return (
      <LevelTwoScene
        onBackToMenu={() => setCurrentScene('menu')}
        onBackToLevelOne={() => setCurrentScene('room')}
        onGoToLevel3={() => setCurrentScene('level3')}
      />
    )
  }

  // 5. Level 3 Scene: The Mainframe Sanctuary (Unlocked after completing all 3 Riddles)
  if (currentScene === 'level3') {
    return (
      <LevelThreeScene
        onBackToMenu={() => setCurrentScene('menu')}
        onBackToLevelTwo={() => setCurrentScene('level2')}
      />
    )
  }

  // 5. Default Whimsical Landing Page
  return (
    <main
      className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#18241d] text-[#f4f1e8] transition duration-700 ease-out ${
        isLeaving ? 'scale-[1.025] opacity-0' : 'opacity-100'
      }`}
    >
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

      <section
        className="relative z-10 grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 text-left sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:gap-20"
        aria-label="Main menu"
      >
        <div>
          <h1 className="font-serif text-[clamp(4rem,9vw,7.5rem)] font-medium leading-[.87] tracking-[-.06em] text-[#f7f4eb] drop-shadow-[0_3px_30px_rgba(0,0,0,.22)]">
            <span className="mb-2 block pl-1 text-[.34em] leading-none tracking-[.03em] text-[#c8d4bd]">
              The
            </span>
            Way Out
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed tracking-[.05em] text-[#d8ded1] sm:text-base">
            Somewhere between here and elsewhere.
          </p>
        </div>

        <div>
          <nav className="flex w-full flex-col items-stretch gap-3" aria-label="Game actions">
            <button
              className="flex min-h-14 w-full cursor-pointer items-center justify-between rounded-sm border border-[#dce8d3] bg-[#dce8d3] px-5 py-4 text-left text-sm uppercase tracking-[.14em] text-[#223124] transition duration-200 hover:translate-x-1 hover:border-[#f0f5e9] hover:bg-[#f0f5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dce8d3] sm:min-h-16 sm:px-6 sm:text-base"
              onClick={() => beginJourney()}
            >
              <span>Start Game</span>
              <span className="text-xl leading-none" aria-hidden="true">
                ↗
              </span>
            </button>
            {hasSavedProgress && (
              <button
                className="flex min-h-14 w-full cursor-pointer flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-sm border border-white/30 bg-transparent px-5 py-4 text-left text-sm uppercase tracking-[.14em] text-[#f4f1e8] transition duration-200 hover:translate-x-1 hover:border-white/75 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dce8d3] sm:min-h-16 sm:px-6 sm:text-base"
                onClick={() => beginJourney(true)}
              >
                <span>Continue</span>
                <span className="ml-auto text-xs normal-case tracking-[.08em] text-[#bfcbb8] sm:text-sm">
                  Resume your journey
                </span>
              </button>
            )}
            <button
              className="flex min-h-14 w-full cursor-pointer items-center rounded-sm border border-transparent bg-transparent px-5 py-4 text-left text-sm uppercase tracking-[.14em] text-[#c2cdbb] transition duration-200 hover:translate-x-1 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dce8d3] sm:min-h-16 sm:px-6 sm:text-base"
              onClick={quitGame}
            >
              <span>Quit</span>
            </button>
          </nav>

          <p
            className={`mt-4 min-h-5 text-xs tracking-[.08em] text-[#dce8d3] transition-opacity duration-300 sm:text-sm ${
              message ? 'opacity-100' : 'opacity-0'
            }`}
            role="status"
          >
            {message}
          </p>
        </div>
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
