import { useState, useEffect } from 'react'
import WordSearchGame from '../components/WordSearchGame'
import MemoryCardGame from '../components/MemoryCardGame'
import CadgyWordGame from '../components/CadgyWordGame'
import RiddleBoardGame from '../components/RiddleBoardGame'
import { sound } from '../utils/AudioEngine'
import woodBoardImg from '../assets/level2/wood_board.jpg'

export default function LevelTwoScene({
  playerName = 'Seeker',
  onBackToMenu,
  onBackToLevelOne,
  onGoToLevel3,
}) {
  // 4 Sublevels: 'wordsearch' | 'memory' | 'cadgy' | 'riddle' | 'victory'
  const [stage, setStage] = useState('wordsearch')
  const [badgeAwarded, setBadgeAwarded] = useState(false)

  // Environmental Altering State: 'wood' (Atelier Study) | 'cyber' (Neon Void) | 'glitch' (Corrupted Matrix)
  const [environment, setEnvironment] = useState('wood')

  // Advance sublevel
  const handleSkipSublevel = () => {
    if (stage === 'wordsearch') setStage('memory')
    else if (stage === 'memory') setStage('cadgy')
    else if (stage === 'cadgy') setStage('riddle')
    else if (stage === 'riddle' && onGoToLevel3) onGoToLevel3()
  }

  // Universal K key to skip sublevel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        handleSkipSublevel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stage, onGoToLevel3])

  // Environmental purge progression across the 4 sublevels
  const purgePercentage =
    stage === 'wordsearch' ? 25 : stage === 'memory' ? 50 : stage === 'cadgy' ? 75 : 100

  // 1. Word Search complete -> Memory Bot
  const handleWordSearchComplete = () => {
    sound.playVictory()
    setTimeout(() => {
      setStage('memory')
    }, 800)
  }

  // 2. Memory Bot complete -> Double Cadgy
  const handleMemoryComplete = () => {
    sound.playVictory()
    setTimeout(() => {
      setStage('cadgy')
    }, 800)
  }

  // 3. Double Cadgy complete -> Riddle Board
  const handleCadgyComplete = () => {
    sound.playVictory()
    setTimeout(() => {
      setStage('riddle')
    }, 800)
  }

  // 4. Riddle Board complete -> Transition into Level 3!
  const handleRiddleComplete = () => {
    sound.playVictory()
    setBadgeAwarded(true)
    if (onGoToLevel3) {
      onGoToLevel3()
    } else {
      setStage('victory')
    }
  }

  const cycleEnvironment = () => {
    sound.playKeyClick()
    setEnvironment((prev) => (prev === 'wood' ? 'cyber' : prev === 'cyber' ? 'glitch' : 'wood'))
  }

  const stagesList = [
    { id: 'wordsearch', num: 1, label: 'Word Search', color: 'bg-[#38bdf8] text-black' },
    { id: 'memory', num: 2, label: 'Memory Bot', color: 'bg-[#f59e0b] text-black' },
    { id: 'cadgy', num: 3, label: 'Double Cadgy', color: 'bg-[#ec4899] text-white' },
    { id: 'riddle', num: 4, label: 'Riddle Board', color: 'bg-[#10b981] text-black' },
  ]

  return (
    <div className="relative w-full h-dvh min-h-dvh overflow-hidden select-none font-sans flex flex-col">
      
      {/* ================= ENVIRONMENTAL BACKGROUND LAYERS ================= */}
      {/* 1. Rustic Wood Atelier Environment (Uses wood_board.jpg) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-cover bg-center ${
          environment === 'wood' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundImage: `url(${woodBoardImg})` }}
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
      </div>

      {/* 2. Cyber Neon Grid Environment */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-[#0d0722] ${
          environment === 'cyber' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-transparent to-indigo-950/70" />
      </div>

      {/* 3. Glitch Corrupted Matrix Environment */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-[#090b10] ${
          environment === 'glitch' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px)] [background-size:100%_4px] opacity-40 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 via-transparent to-red-950/40" />
      </div>

      {/* Dynamic Purge Atmosphere Filter */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          boxShadow: `inset 0 0 ${120 - purgePercentage}px rgba(${
            purgePercentage === 100 ? '16,185,129' : '239,68,68'
          }, 0.25)`,
        }}
      />

      {/* ================= FIXED SLEEK RESPONSIVE NAVIGATION TOPBAR ================= */}
      <header className="relative z-50 w-full h-12 sm:h-14 bg-black/85 border-b border-white/15 backdrop-blur px-2 sm:px-4 flex items-center justify-between gap-2 shadow-xl shrink-0">
        
        {/* Left: Level 2 Title & Stage Segmented Control */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <button
            onClick={onBackToMenu}
            className="px-2 sm:px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[10px] sm:text-xs font-bold text-gray-300 hover:text-white transition cursor-pointer"
            title="Return to Menu"
          >
            ← Menu
          </button>

          <span className="text-cyan-400 font-black text-xs sm:text-sm tracking-wider shrink-0 hidden xs:inline">
            LEVEL 2
          </span>

          {/* Responsive Segmented Stage Buttons */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            {stagesList.map((stg) => {
              const isActive = stage === stg.id
              return (
                <button
                  key={stg.id}
                  onClick={() => setStage(stg.id)}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold cursor-pointer transition active:scale-95 flex items-center gap-1 ${
                    isActive
                      ? `${stg.color} shadow-md`
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={stg.label}
                >
                  <span>{stg.num}</span>
                  <span className="hidden md:inline">. {stg.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Environment Toggle, Purge Meter & Skip Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* ENVIRONMENT ALTERING BUTTON */}
          <button
            onClick={cycleEnvironment}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-yellow-300 font-mono text-[10px] sm:text-xs cursor-pointer transition shadow active:scale-95"
            title="Alter Level 2 Atmospheric Environment"
          >
            <span className="hidden sm:inline">ENV:</span>
            <span className="font-bold text-white uppercase">{environment}</span>
          </button>

          {/* Environmental Purge Indicator */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] sm:text-xs font-mono text-emerald-300">
            <span>PURGE:</span>
            <span className="font-bold">{purgePercentage}%</span>
          </div>

          {/* Skip Sublevel Button */}
          <button
            onClick={handleSkipSublevel}
            className="px-2 sm:px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-extrabold cursor-pointer transition shadow active:scale-95 text-[10px] sm:text-xs"
            title="Skip Sublevel for testing (Press K or Click)"
          >
            Skip [K] -&gt;
          </button>

          {/* Skip to Level 3 Button */}
          <button
            onClick={onGoToLevel3}
            className="px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 text-black font-black cursor-pointer transition shadow active:scale-95 text-[10px] sm:text-xs"
            title="Skip directly to Level 3 for testing"
          >
            <span className="hidden sm:inline">Skip to </span>Lvl 3 -&gt;
          </button>
        </div>
      </header>

      {/* ================= MAIN DEDICATED SUBLEVEL CONTENT AREA ================= */}
      <main className="relative flex-1 w-full min-h-0 overflow-hidden flex flex-col">
        {/* ================= SUBLEVEL 1: Word Search Game ================= */}
        {stage === 'wordsearch' && (
          <WordSearchGame
            onComplete={handleWordSearchComplete}
            onExit={onBackToMenu}
            environment={environment}
          />
        )}

        {/* ================= SUBLEVEL 2: Memory Card Match vs Bot ================= */}
        {stage === 'memory' && (
          <MemoryCardGame
            playerName={playerName}
            onComplete={handleMemoryComplete}
            onExit={onBackToMenu}
            environment={environment}
          />
        )}

        {/* ================= SUBLEVEL 3: Double Cadgy 3D Word Stack ================= */}
        {stage === 'cadgy' && (
          <CadgyWordGame
            onComplete={handleCadgyComplete}
            onExit={onBackToMenu}
            environment={environment}
          />
        )}

        {/* ================= SUBLEVEL 4: Pinned Riddle Board & Word Connect ================= */}
        {stage === 'riddle' && (
          <RiddleBoardGame
            onComplete={handleRiddleComplete}
            onExit={onBackToMenu}
            environment={environment}
          />
        )}

        {/* ================= FINAL VICTORY MODAL ================= */}
        {badgeAwarded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
            <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#0b101d] border-2 border-emerald-400 text-center text-white shadow-[0_0_80px_rgba(16,185,129,0.5)] flex flex-col items-center gap-4">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black shadow-lg animate-bounce">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
                  DIMENSION 2 RESTORED
                </span>
                <h2 className="text-xl sm:text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 text-balance">
                  GLITCH MATRIX PURGED!
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed text-pretty">
                All 4 sectors of Level 2 have been cleared. The portal to Sector 3 (Gravity Anomaly) has stabilized.
              </p>

              <button
                onClick={onGoToLevel3}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 active:scale-95 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg cursor-pointer transition mt-2"
              >
                ENTER SECTOR 3: GRAVITY ANOMALY -&gt;
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
