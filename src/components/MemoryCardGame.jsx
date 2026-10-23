import { useState, useEffect, useRef } from 'react'
import { sound } from '../utils/AudioEngine'

// Card items with icons & colorful backgrounds matching Images 3, 4, 5
const CARD_TYPES = [
  { id: 'butterfly', icon: '🦋', name: 'Butterfly', bg: 'bg-[#22c55e]' }, // Image 5
  { id: 'dice', icon: '🎲', name: 'Dice', bg: 'bg-[#ef4444]' },           // Image 3
  { id: 'landscape', icon: '🏞️', name: 'Landscape', bg: 'bg-[#64748b]' },// Image 3
  { id: 'cat', icon: '🐱', name: 'Cat', bg: 'bg-[#ec4899]' },
  { id: 'star', icon: '⭐', name: 'Star', bg: 'bg-[#f59e0b]' },
  { id: 'diamond', icon: '💎', name: 'Diamond', bg: 'bg-[#0284c7]' },
  { id: 'robot', icon: '🤖', name: 'Robot', bg: 'bg-[#8b5cf6]' },
  { id: 'rocket', icon: '🚀', name: 'Rocket', bg: 'bg-[#0f766e]' },
  { id: 'pizza', icon: '🍕', name: 'Pizza', bg: 'bg-[#ea580c]' },
  { id: 'balloon', icon: '🎈', name: 'Balloon', bg: 'bg-[#e11d48]' },
]

// 10 pairs = 20 cards
function createShuffledDeck() {
  const deck = []
  const selectedTypes = CARD_TYPES.slice(0, 10)

  selectedTypes.forEach((type) => {
    // 2 cards for each type
    deck.push({ ...type, uniqueId: `${type.id}-1` })
    deck.push({ ...type, uniqueId: `${type.id}-2` })
  })

  // Random shuffle
  deck.sort(() => Math.random() - 0.5)

  // Subtle organic tilt (-2deg to +2deg) matching Image 3, 4
  return deck.map((card, i) => ({
    ...card,
    index: i,
    tilt: ((i % 5) - 2) * 1.2,
  }))
}

export default function MemoryCardGame({ onComplete, onExit }) {
  const [cards] = useState(() => createShuffledDeck())
  const [flippedIndices, setFlippedIndices] = useState([])
  const [matchedIds, setMatchedIds] = useState([])
  const [isBotTurn, setIsBotTurn] = useState(false)
  const [playerScore, setPlayerScore] = useState(0)
  const [botScore, setBotScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  // Bot Memory: maps card index -> card id
  const botMemory = useRef({})
  const isProcessing = useRef(false)

  // Check match logic
  useEffect(() => {
    if (flippedIndices.length === 2 && !isProcessing.current) {
      isProcessing.current = true
      const [firstIdx, secondIdx] = flippedIndices
      const firstCard = cards[firstIdx]
      const secondCard = cards[secondIdx]

      // Remember cards in Bot Memory
      botMemory.current[firstIdx] = firstCard.id
      botMemory.current[secondIdx] = secondCard.id

      if (firstCard.id === secondCard.id) {
        // MATCH!
        setTimeout(() => {
          sound.playCardMatch()
          setMatchedIds((prev) => [...prev, firstCard.id])
          setFlippedIndices([])
          isProcessing.current = false

          if (!isBotTurn) {
            setPlayerScore((s) => s + 1)
            // Player keeps turn on match
          } else {
            setBotScore((s) => s + 1)
            // Bot keeps turn on match
            setTimeout(() => {
              triggerBotTurn()
            }, 600)
          }
        }, 600)
      } else {
        // NO MATCH
        setTimeout(() => {
          setFlippedIndices([])
          isProcessing.current = false

          // Toggle turn
          if (!isBotTurn) {
            setIsBotTurn(true)
          } else {
            setIsBotTurn(false)
          }
        }, 1100)
      }
    }
  }, [flippedIndices, cards, isBotTurn])

  // Trigger Bot's AI turn when turn changes to Bot
  useEffect(() => {
    if (isBotTurn && !isProcessing.current && matchedIds.length < 10) {
      const timer = setTimeout(() => {
        triggerBotTurn()
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [isBotTurn, matchedIds.length])

  // Bot AI decision making
  const triggerBotTurn = () => {
    if (isProcessing.current || matchedIds.length === 10) return

    // Find all unrevealed card indices
    const availableIndices = cards
      .map((c, i) => i)
      .filter((i) => !matchedIds.includes(cards[i].id) && !flippedIndices.includes(i))

    if (availableIndices.length < 2) return

    // 1. Check if Bot remembers any known matching pair!
    const memoryEntries = Object.entries(botMemory.current).filter(([idx]) =>
      availableIndices.includes(Number(idx))
    )

    let knownPair = null
    for (let i = 0; i < memoryEntries.length; i++) {
      for (let j = i + 1; j < memoryEntries.length; j++) {
        if (memoryEntries[i][1] === memoryEntries[j][1]) {
          knownPair = [Number(memoryEntries[i][0]), Number(memoryEntries[j][0])]
          break
        }
      }
      if (knownPair) break
    }

    if (knownPair && Math.random() < 0.8) {
      // Pick known pair!
      executeBotFlips(knownPair[0], knownPair[1])
      return
    }

    // 2. Otherwise pick a random available card
    const firstPick =
      availableIndices[Math.floor(Math.random() * availableIndices.length)]

    // Check if Bot remembers the partner for firstPick
    const firstCardId = cards[firstPick].id
    const partnerIdx = Object.keys(botMemory.current).find(
      (idx) =>
        Number(idx) !== firstPick &&
        availableIndices.includes(Number(idx)) &&
        botMemory.current[idx] === firstCardId
    )

    let secondPick = null
    if (partnerIdx && Math.random() < 0.75) {
      secondPick = Number(partnerIdx)
    } else {
      const remainingForSecond = availableIndices.filter((i) => i !== firstPick)
      secondPick =
        remainingForSecond[Math.floor(Math.random() * remainingForSecond.length)]
    }

    executeBotFlips(firstPick, secondPick)
  }

  // Execute Bot's card flips with realistic visual delay
  const executeBotFlips = (idx1, idx2) => {
    sound.playCardFlip()
    setFlippedIndices([idx1])

    setTimeout(() => {
      sound.playCardFlip()
      setFlippedIndices([idx1, idx2])
    }, 900)
  }

  // Player card click handler
  const handleCardClick = (index) => {
    if (isBotTurn || isProcessing.current) return
    if (flippedIndices.includes(index)) return
    if (matchedIds.includes(cards[index].id)) return
    if (flippedIndices.length >= 2) return

    sound.playCardFlip()
    setFlippedIndices((prev) => [...prev, index])
  }

  // Check Game Over
  useEffect(() => {
    if (matchedIds.length === 10) {
      setGameOver(true)
      if (playerScore >= botScore) {
        sound.playVictory()
        setTimeout(() => {
          onComplete && onComplete()
        }, 2200)
      } else {
        sound.playDoorLocked()
      }
    }
  }, [matchedIds.length, playerScore, botScore, onComplete])

  return (
    <div className="relative w-full h-full min-h-screen bg-[#334155] flex flex-col items-center justify-between p-3 sm:p-5 select-none font-sans overflow-hidden">
      {/* ================= TOP TURN INDICATOR (Image 3 Style) ================= */}
      <div className="w-full max-w-md pt-2 flex items-center justify-center">
        {isBotTurn ? (
          <div className="text-white font-extrabold text-2xl sm:text-3xl tracking-wide drop-shadow-[0_2px_10px_rgba(56,189,248,0.8)] animate-pulse">
            Bot&apos;s Turn
          </div>
        ) : (
          <div className="text-white/80 font-bold text-sm tracking-widest uppercase">
            LEVEL 2: MEMORY BATTLE
          </div>
        )}
      </div>

      {/* ================= SIDE SCORE PILLS (Image 3, 4, 5 Style) ================= */}
      {/* Left Score Badge */}
      <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30">
        <div className="px-3 py-4 rounded-full bg-white shadow-2xl border-2 border-gray-200 flex flex-col items-center gap-1 font-extrabold text-base sm:text-lg">
          <span className="text-[#0284c7]">{playerScore}</span>
          <span className="text-gray-400 text-xs">•</span>
          <span className="text-[#ef4444]">{botScore}</span>
        </div>
      </div>

      {/* Right Exit Pill */}
      <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30">
        <button
          onClick={onExit}
          className="px-2 py-4 rounded-full bg-white hover:bg-gray-100 shadow-2xl border-2 border-gray-200 flex flex-col items-center justify-center font-extrabold text-xs text-gray-700 cursor-pointer active:scale-95 transition"
        >
          <span className="[writing-mode:vertical-lr] tracking-widest">EXIT</span>
        </button>
      </div>

      {/* ================= CARDS GRID (Images 3, 4, 5 Style) ================= */}
      <div className="w-full max-w-sm sm:max-w-md my-auto py-2 px-1">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 justify-items-center">
          {cards.map((card, idx) => {
            const isFlipped = flippedIndices.includes(idx)
            const isMatched = matchedIds.includes(card.id)
            const showFace = isFlipped || isMatched

            return (
              <div
                key={card.uniqueId}
                onClick={() => handleCardClick(idx)}
                style={{ transform: `rotate(${card.tilt}deg)` }}
                className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.35)] flex items-center justify-center border-4 border-white active:scale-95 ${
                  showFace
                    ? `${card.bg} scale-105`
                    : 'bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] hover:brightness-105'
                }`}
              >
                {showFace ? (
                  <span className="text-3xl sm:text-4xl drop-shadow select-none">
                    {card.icon}
                  </span>
                ) : (
                  <div className="h-full w-full rounded-xl bg-[#f59e0b] opacity-80" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ================= BOTTOM "YOUR TURN" BANNER (Image 4 Style) ================= */}
      <div className="w-full max-w-md pb-2 flex justify-center">
        {!isBotTurn && !gameOver && (
          <div className="w-3/4 max-w-xs py-3.5 rounded-full bg-[#f97316] border-4 border-white text-white font-extrabold text-xl sm:text-2xl text-center shadow-2xl animate-bounce">
            Your turn
          </div>
        )}

        {gameOver && (
          <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-white text-gray-900 shadow-2xl border-4 border-white max-w-xs text-center animate-bounce">
            <span className="text-xl font-extrabold">
              {playerScore > botScore
                ? '🏆 YOU DEFEATED THE BOT!'
                : playerScore === botScore
                ? '🤝 TIE GAME!'
                : '🤖 BOT WON!'}
            </span>
            <span className="text-xs text-gray-500">
              Score: You {playerScore} - {botScore} Bot
            </span>
            <button
              onClick={() => {
                setMatchedIds([])
                setFlippedIndices([])
                setPlayerScore(0)
                setBotScore(0)
                setGameOver(false)
                setIsBotTurn(false)
                botMemory.current = {}
              }}
              className="px-5 py-2 rounded-full bg-[#00a2ff] text-white font-bold text-xs uppercase"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
