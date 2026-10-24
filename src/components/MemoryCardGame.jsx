import { useState, useEffect, useRef } from 'react'
import { sound } from '../utils/AudioEngine'

// Card items with vibrant icons matching offline 2-player reference (Image 2)
const CARD_TYPES = [
  { id: 'butterfly', icon: '🦋', name: 'Butterfly', bg: 'bg-[#58a700]' }, // Matches Image 2!
  { id: 'dice', icon: '🎲', name: 'Dice', bg: 'bg-[#dc2626]' },
  { id: 'star', icon: '⭐', name: 'Star', bg: 'bg-[#eab308]' },
  { id: 'cat', icon: '🐱', name: 'Cat', bg: 'bg-[#ec4899]' },
  { id: 'diamond', icon: '💎', name: 'Diamond', bg: 'bg-[#0284c7]' },
  { id: 'robot', icon: '🤖', name: 'Robot', bg: 'bg-[#7c3aed]' },
  { id: 'rocket', icon: '🚀', name: 'Rocket', bg: 'bg-[#0f766e]' },
  { id: 'pizza', icon: '🍕', name: 'Pizza', bg: 'bg-[#ea580c]' },
  { id: 'balloon', icon: '🎈', name: 'Balloon', bg: 'bg-[#e11d48]' },
  { id: 'landscape', icon: '🏞️', name: 'Landscape', bg: 'bg-[#475569]' },
]

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

export default function MemoryCardGame({ playerName = 'You', onComplete, onExit }) {
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

  const handleAutoSolve = () => {
    const allIds = Array.from(new Set(cards.map((c) => c.id)))
    setMatchedIds(allIds)
    setPlayerScore(10)
    setBotScore(0)
    setGameOver(true)
    sound.playVictory()
    setTimeout(() => {
      onComplete && onComplete()
    }, 600)
  }

  return (
    <div className="relative w-screen h-screen bg-[#372f33] text-white flex flex-col items-center justify-between p-4 select-none font-sans overflow-hidden">
      
      {/* Top Bar matching Image 2 */}
      <div className="w-full max-w-lg flex items-center justify-between pt-2">
        <span className="font-mono text-xs uppercase tracking-widest text-amber-200/80">
          SUBLEVEL 2: MEMORY BOT MATCH
        </span>
        <button
          onClick={handleAutoSolve}
          className="px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs cursor-pointer shadow"
        >
          ⚡ Auto Win
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
          {isBotTurn ? "🤖 Bot's Turn..." : `👤 ${playerName}'s Turn!`}
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
                  className={`absolute inset-0 rounded-2xl ${card.bg} border-[3.5px] border-white shadow-[0_6px_15px_rgba(0,0,0,0.6)] flex items-center justify-center text-3xl sm:text-4xl transition-transform duration-500 ${
                    isFlipped || isMatched ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}
                >
                  <span className="drop-shadow-md">{card.icon}</span>
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
                  className={`h-28 w-24 sm:h-32 sm:w-28 rounded-3xl ${card.bg} border-4 border-white shadow-[0_25px_50px_rgba(0,0,0,0.9)] flex items-center justify-center text-5xl sm:text-6xl scale-125 transition-transform duration-500 ring-4 ring-yellow-400/80`}
                >
                  <span className="drop-shadow-2xl">{card.icon}</span>
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
