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
    <main className={`menu ${isLeaving ? 'menu--leaving' : ''}`}>
      <video className="menu__backdrop" autoPlay loop muted playsInline aria-hidden="true" src={ambientVideo} />
      <div className="menu__wash" aria-hidden="true" />
      <div className="menu__grain" aria-hidden="true" />

      <section className="menu__content" aria-label="Main menu">
        <p className="menu__eyebrow">An atmospheric journey</p>
        <h1 className="menu__title">
          <span>The</span>
          Way Out
        </h1>
        <p className="menu__tagline">Somewhere between here and elsewhere.</p>

        <nav className="menu__actions" aria-label="Game actions">
          <button className="menu__button menu__button--primary" onClick={() => beginJourney()}>
            <span>Start Game</span>
            <span className="menu__button-arrow" aria-hidden="true">↗</span>
          </button>
          {hasSavedProgress && (
            <button className="menu__button" onClick={() => beginJourney(true)}>
              <span>Continue</span>
              <span className="menu__button-caption">Resume your journey</span>
            </button>
          )}
          <button className="menu__button menu__button--quiet" onClick={quitGame}>
            <span>Quit</span>
          </button>
        </nav>

        <p className={`menu__message ${message ? 'menu__message--visible' : ''}`} role="status">{message}</p>
      </section>

      <footer className="menu__footer">
        <span>© 2026 The Way Out</span>
        <span className="menu__footer-line" aria-hidden="true" />
        <span>Press enter to begin</span>
      </footer>
    </main>
  )
}

export default App
