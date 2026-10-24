import { useState, useEffect, useRef } from 'react'
import { sound } from '../utils/AudioEngine'

// Card items with vibrant themed icons matching offline 2-player reference
const CARD_TYPES = [
  { id: 'butterfly', name: 'Butterfly', bg: 'bg-[#58a700]' },
  { id: 'dice', name: 'Dice', bg: 'bg-[#dc2626]' },
  { id: 'star', name: 'Star', bg: 'bg-[#eab308]' },
  { id: 'shield', name: 'Shield', bg: 'bg-[#ec4899]' },
  { id: 'diamond', name: 'Diamond', bg: 'bg-[#0284c7]' },
  { id: 'robot', name: 'Robot', bg: 'bg-[#7c3aed]' },
  { id: 'rocket', name: 'Rocket', bg: 'bg-[#0f766e]' },
  { id: 'lightning', name: 'Lightning', bg: 'bg-[#ea580c]' },
  { id: 'heart', name: 'Heart', bg: 'bg-[#e11d48]' },
  { id: 'key', name: 'Key', bg: 'bg-[#475569]' },
]

function renderCardIcon(id, className = 'w-8 h-8 sm:w-10 sm:h-10 text-white fill-current drop-shadow-md') {
  switch (id) {
    case 'butterfly':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path d="M12 4c.6 0 1 .4 1 1v14c0 .6-.4 1-1 1s-1-.4-1-1V5c0-.6.4-1 1-1zm-2 2C6 6 3 9 3 13c0 3 2 5 5 5 1 0 1.7-.3 2-.6V6.7C9.7 6.3 9.3 6 10 6zm4 0c-.7 0-1.1.3-1.4.7v10.7c.3.3 1 .6 2 .6 3 0 5-2 5-5 0-4-3-7-7-7z"/>
        </svg>
      )
    case 'dice':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm9 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9zm-9 9c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm4.5-4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      )
    case 'star':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      )
    case 'shield':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v4h4v2h-4v4h-2v-4H7v-2h4V7z"/>
        </svg>
      )
    case 'diamond':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path d="M16 2l6 7-10 13L2 9l6-7h8zm-1.4 2H9.4L4.8 9h14.4l-4.6-5zM12 11.5L5.7 10 12 19.3 18.3 10 12 11.5z"/>
        </svg>
      )
    case 'robot':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path d="M12 2a2 2 0 012 2c0 .74-.4 1.38-1 1.72V7h4a3 3 0 013 3v8a3 3 0 01-3 3H7a3 3 0 01-3-3v-8a3 3 0 013-3h4V5.72A2 2 0 0112 2zM7.5 11a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM8 17h8v-1.5H8V17z"/>
        </svg>
      )
    case 'rocket':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path d="M12 2.5s4 3.5 4 8.5c0 2.5-1 4.5-1.5 5.5h-5C9 15.5 8 13.5 8 11c0-5 4-8.5 4-8.5zM6 14.5l-3 4.5h4l1-3.5-2-1zm12 0l2 1 1 3.5h4l-3-4.5h-4zM12 18a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
        </svg>
      )
    case 'lightning':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
        </svg>
      )
    case 'heart':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      )
    case 'key':
    default:
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path d="M7 14a5 5 0 115-5c0 .34-.04.67-.1 1H15v2h2v2h3v2h-4.1c-.58 1.76-2.24 3-4.14 3-2.48 0-4.5-2.02-4.5-4.5-.06-.17-.16-.34-.26-.5zm0-2a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>
        </svg>
      )
  }
}

// 10 pairs = 20 cards
function createShuffledDeck() {
  const deck = []
  CARD_TYPES.slice(0, 10).forEach((type) => {
    deck.push({ ...type, uniqueId: `${type.id}-1` })
    deck.push({ ...type, uniqueId: `${type.id}-2` })
  })

  deck.sort(() => Math.random() - 0.5)

  return deck.map((card, i) => ({
    ...card,
    index: i,
    tilt: ((i % 5) - 2) * 1.5,
  }))
}

export default function MemoryCardGame({ playerName = 'You', onComplete, onExit, environment = 'wood' }) {
  const [cards] = useState(() => createShuffledDeck())
  const [flippedIndices, setFlippedIndices] = useState([])
  const [matchedIds, setMatchedIds] = useState([])
  const [isBotTurn, setIsBotTurn] = useState(false)
  const [playerScore, setPlayerScore] = useState(0)
  const [botScore, setBotScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  // Floating picked-up match animation state (Image 2 Style)
  const [liftingMatchCards, setLiftingMatchCards] = useState(null) // [card1, card2]

  const botMemory = useRef({})
  const isProcessing = useRef(false)

  // Match check logic
  useEffect(() => {
    if (flippedIndices.length === 2 && !isProcessing.current) {
      isProcessing.current = true
      const [firstIdx, secondIdx] = flippedIndices
      const firstCard = cards[firstIdx]
      const secondCard = cards[secondIdx]

      botMemory.current[firstIdx] = firstCard.id
      botMemory.current[secondIdx] = secondCard.id

      if (firstCard.id === secondCard.id) {
        // MATCH! Trigger smooth lifting / picking up animation (Image 2 Style)
        setTimeout(() => {
          sound.playCardMatch()
          setLiftingMatchCards([firstCard, secondCard])

          // After hovering in center, commit match
          setTimeout(() => {
            setMatchedIds((prev) => [...prev, firstCard.id])
            setLiftingMatchCards(null)
            setFlippedIndices([])
            isProcessing.current = false

            if (!isBotTurn) {
              setPlayerScore((s) => s + 1)
            } else {
              setBotScore((s) => s + 1)
              setTimeout(() => triggerBotTurn(), 600)
            }
          }, 900)
        }, 400)
      } else {
        // NO MATCH
        setTimeout(() => {
          setFlippedIndices([])
          isProcessing.current = false
          setIsBotTurn(!isBotTurn)
        }, 1100)
      }
    }
  }, [flippedIndices, cards, isBotTurn])

  // Bot Turn AI
  const triggerBotTurn = () => {
    if (gameOver || isProcessing.current) return

    // Available cards
    const availableIndices = cards
      .map((c, i) => i)
      .filter((i) => !matchedIds.includes(cards[i].id) && !flippedIndices.includes(i))

    if (availableIndices.length === 0) return

    // Check memory for a pair
    const knownById = {}
    for (const idxStr of Object.keys(botMemory.current)) {
      const idx = Number(idxStr)
      if (availableIndices.includes(idx)) {
        const id = botMemory.current[idx]
        if (!knownById[id]) knownById[id] = []
        knownById[id].push(idx)
      }
    }

    let pick1 = null
    let pick2 = null

    for (const id in knownById) {
      if (knownById[id].length >= 2) {
        pick1 = knownById[id][0]
        pick2 = knownById[id][1]
        break
      }
    }

    if (pick1 === null) {
      // Pick random first
      const rndIndex1 = Math.floor(Math.random() * availableIndices.length)
      pick1 = availableIndices[rndIndex1]
      const card1 = cards[pick1]

      // Check if pair is in memory
      const remainingAvailable = availableIndices.filter((i) => i !== pick1)
      const matchingFromMem = remainingAvailable.find(
        (i) => botMemory.current[i] === card1.id
      )

      if (matchingFromMem !== undefined && Math.random() < 0.85) {
        pick2 = matchingFromMem
      } else {
        const rndIndex2 = Math.floor(Math.random() * remainingAvailable.length)
        pick2 = remainingAvailable[rndIndex2]
      }
    }

    // Execute Bot flips
    setTimeout(() => {
      sound.playCardFlip()
      setFlippedIndices([pick1])

      setTimeout(() => {
        sound.playCardFlip()
        setFlippedIndices([pick1, pick2])
      }, 700)
    }, 600)
  }

  // Trigger bot when turn switches
  useEffect(() => {
    if (isBotTurn && !gameOver && flippedIndices.length === 0 && !isProcessing.current) {
      const timer = setTimeout(() => {
        triggerBotTurn()
      }, 750)
      return () => clearTimeout(timer)
    }
  }, [isBotTurn, gameOver, flippedIndices])

  // Check Game Over
  useEffect(() => {
    const uniqueCount = new Set(matchedIds).size
    if (uniqueCount >= 10 && !gameOver) {
      setGameOver(true)
      sound.playVictory()
      const timer = setTimeout(() => {
        onComplete && onComplete()
      }, 900)
      return () => clearTimeout(timer)
    }
  }, [matchedIds, gameOver, onComplete])

  const handleCardClick = (index) => {
    if (isBotTurn || isProcessing.current || flippedIndices.length >= 2) return
    if (flippedIndices.includes(index) || matchedIds.includes(cards[index].id)) return

    sound.playCardFlip()
    setFlippedIndices((prev) => [...prev, index])
  }

  return (
    <div className="relative w-screen h-screen bg-black/45 backdrop-blur-sm text-white flex flex-col items-center justify-between p-4 select-none font-sans overflow-hidden">
      
      {/* Top Bar matching Image 2 */}
      <div className="w-full max-w-lg flex items-center justify-between pt-2">
        <span className="font-mono text-xs uppercase tracking-widest text-amber-200/80">
          SUBLEVEL 2: MEMORY BOT MATCH
        </span>
        <button
          onClick={() => onComplete && onComplete()}
          className="px-3.5 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs cursor-pointer shadow transition active:scale-95"
          title="Skip Sublevel (Testing)"
        >
          Skip Sublevel ➔
        </button>
      </div>

      {/* Side HUD Elements matching Image 2 reference */}
      <div className="w-full max-w-lg flex items-center justify-between px-2 my-2">
        {/* Left Pill: Score Indicator (2 • 3 style from Image 2) */}
        <div className="h-10 px-4 rounded-full bg-black/60 border border-white/20 backdrop-blur flex items-center gap-2 shadow-lg text-sm font-extrabold font-mono">
          <span className="text-cyan-400">{playerName.toUpperCase()}: {playerScore}</span>
          <span className="text-gray-400">•</span>
          <span className="text-rose-400">BOT: {botScore}</span>
        </div>

        {/* Turn Status Indicator */}
        <div
          className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg transition-all ${
            isBotTurn
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-emerald-500 text-black'
          }`}
        >
          {isBotTurn ? "BOT'S TURN..." : `${playerName.toUpperCase()}'S TURN!`}
        </div>

        {/* Right Pill: EXIT button from Image 2 */}
        <button
          onClick={onExit}
          className="h-10 px-5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer transition active:scale-95"
        >
          EXIT
        </button>
      </div>

      {/* Main 20-Card Table Grid (Image 2 Aesthetic) */}
      <div className="relative flex-1 w-full max-w-lg flex items-center justify-center p-2">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
          {cards.map((card, idx) => {
            const isFlipped = flippedIndices.includes(idx)
            const isMatched = matchedIds.includes(card.id)
            const isCurrentlyLifting =
              liftingMatchCards && liftingMatchCards.some((c) => c.uniqueId === card.uniqueId)

            return (
              <div
                key={card.uniqueId}
                onClick={() => handleCardClick(idx)}
                style={{
                  transform: `rotate(${card.tilt}deg)`,
                  visibility: isMatched && !isCurrentlyLifting ? 'hidden' : 'visible',
                }}
                className={`relative h-20 w-16 sm:h-24 sm:w-20 rounded-2xl cursor-pointer select-none transition-all duration-300 ${
                  isMatched ? 'opacity-0' : 'hover:scale-105 active:scale-95'
                }`}
              >
                {/* CARD BACK (Warm Mustard Yellow with White Border - Image 2) */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-[#f59e0b] border-[3.5px] border-white shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center transition-transform duration-500 ${
                    isFlipped || isMatched ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                  }`}
                >
                  <div className="h-4 w-4 rounded-full bg-white/30" />
                </div>

                {/* CARD FRONT (Green/Vibrant Theme with Icon & Border - Image 2) */}
                <div
                  className={`absolute inset-0 rounded-2xl ${card.bg} border-[3.5px] border-white shadow-[0_6px_15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-transform duration-500 ${
                    isFlipped || isMatched ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}
                >
                  {renderCardIcon(card.id)}
                </div>
              </div>
            )
          })}
        </div>

        {/* ================= FLOATING PICK-UP ANIMATION OVERLAY (Image 2 Style) ================= */}
        {liftingMatchCards && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50 animate-fadeIn">
            <div className="flex items-center gap-4 animate-bounce">
              {liftingMatchCards.map((card) => (
                <div
                  key={card.uniqueId}
                  className={`h-28 w-24 sm:h-32 sm:w-28 rounded-3xl ${card.bg} border-4 border-white shadow-[0_25px_50px_rgba(0,0,0,0.9)] flex items-center justify-center scale-125 transition-transform duration-500 ring-4 ring-yellow-400/80`}
                >
                  {renderCardIcon(card.id, 'w-14 h-14 sm:w-16 sm:h-16 text-white fill-current drop-shadow-2xl')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer & Advance Action */}
      <div className="w-full max-w-lg pb-3 flex flex-col items-center gap-2">
        {gameOver ? (
          <button
            onClick={onComplete}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.7)] hover:brightness-110 active:scale-95 cursor-pointer transition flex items-center justify-center gap-2 animate-bounce"
          >
            <span>Sublevel 2 Cleared! Advance to Double Cadgy</span>
            <span>➔</span>
          </button>
        ) : (
          <div className="text-[11px] font-mono text-gray-400 text-center">
            Tap cards to find pairs • Smooth pick-up animation on match
          </div>
        )}
      </div>
    </div>
  )
}
