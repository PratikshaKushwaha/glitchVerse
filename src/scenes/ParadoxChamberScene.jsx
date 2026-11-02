import { useEffect, useRef, useState } from 'react';
import { EntropyGame } from '../entropy_engine/EntropyGame.js';
import { entropyAudio } from '../entropy_engine/audio.js';

export default function ParadoxChamberScene({
  playerName = 'Seeker',
  onBackToLevelFour,
  onGoToFinalBoss,
  onBackToMenu
}) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const reqIdRef = useRef(null);

  const [gameState, setGameState] = useState({
    state: 'playing',
    energy: 100,
    timeRemaining: 180,
    attempts: 3,
    currentDim: 'A',
    gd: 1,
    freezeActive: false,
    freezeTimer: 0,
    freezeCooldown: 0,
    overloadTriggered: false,
    nodesActivated: 0,
    totalNodes: 4,
    reactorStabilized: false,
    syncSequence: [],
    finalScore: 0,
    finalRank: 'B',
    currentSectorName: 'SECTOR 1: GRAVITY CALIBRATION'
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // Fixed virtual internal resolution
    canvas.width = 800;
    canvas.height = 450;

    entropyAudio.init();

    const game = new EntropyGame(canvas, (updatedState) => {
      setGameState(prev => ({ ...prev, ...updatedState }));
    });
    gameRef.current = game;

    let lastTime = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.08, (now - lastTime) / 1000);
      lastTime = now;

      if (game.state === 'playing') {
        game.update(dt);
      }
      game.render();
      reqIdRef.current = requestAnimationFrame(loop);
    };

    reqIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      if (gameRef.current) gameRef.current.destroy();
    };
  }, []);

  const toggleSound = () => {
    const next = entropyAudio.toggleSound();
    setSoundEnabled(next);
  };

  const restartChamber = () => {
    if (gameRef.current) {
      gameRef.current.restartFromStart();
    } else if (canvasRef.current) {
      const game = new EntropyGame(canvasRef.current, (updatedState) => {
        setGameState(prev => ({ ...prev, ...updatedState }));
      });
      gameRef.current = game;
    }
  };

  // Keyboard shortcut listener for Tab / H / K
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowMap(prev => !prev);
      } else if (e.code === 'KeyH') {
        setShowTutorial(prev => !prev);
      } else if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        onGoToFinalBoss && onGoToFinalBoss();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onGoToFinalBoss]);

  return (
    <div className="relative w-screen h-screen bg-[#060810] text-white flex flex-col justify-between overflow-hidden select-none font-mono">
      {/* ================= TOP HUD BAR ================= */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2 bg-[#0b0f1a]/95 border-b border-[#242f40] shadow-2xl backdrop-blur">
        
        {/* Left: Sector, Retry & Energy Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onBackToLevelFour}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-xs font-bold text-gray-300 hover:text-white transition cursor-pointer border border-[#475569]"
          >
            ← Sector 4
          </button>

          {/* Dedicated Retry Option */}
          <button
            onClick={restartChamber}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-300 hover:text-amber-200 transition cursor-pointer border border-amber-400/50 shadow flex items-center gap-1.5"
            title="Restart Paradox Chamber"
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M21 21v-5h-5" />
            </svg>
            <span>Retry</span>
          </button>

          {/* Energy Bar (0 - 100) */}
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-cyan-500/30">
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">⚡ ENERGY</span>
            <div className="w-24 sm:w-32 h-2.5 bg-gray-900 rounded-full overflow-hidden p-0.5 border border-cyan-500/40">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  gameState.energy < 25 ? 'bg-red-500 animate-pulse' : gameState.overloadTriggered ? 'bg-orange-400' : 'bg-cyan-400'
                }`}
                style={{ width: `${gameState.energy}%` }}
              />
            </div>
            <span className={`text-xs font-black font-mono ${gameState.energy < 25 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
              {gameState.energy}/100
            </span>
          </div>

          {/* Quick Mechanic Status Pills */}
          <div className="hidden lg:flex items-center gap-2 text-[10px]">
            <span className={`px-2 py-0.5 rounded border ${gameState.gd < 0 ? 'bg-purple-900/80 border-purple-400 text-purple-200' : 'bg-gray-800/80 border-gray-600 text-gray-300'}`}>
              [Q] GRAV: {gameState.gd < 0 ? 'INVERTED' : 'NORMAL'}
            </span>
            <span className={`px-2 py-0.5 rounded border ${gameState.freezeActive ? 'bg-cyan-900/90 border-cyan-400 text-cyan-200 animate-pulse' : 'bg-gray-800/80 border-gray-600 text-gray-300'}`}>
              [E] FREEZE: {gameState.freezeActive ? `${gameState.freezeTimer.toFixed(1)}s` : gameState.freezeCooldown > 0 ? `CD ${Math.ceil(gameState.freezeCooldown)}s` : 'READY'}
            </span>
            <span className={`px-2 py-0.5 rounded border ${gameState.currentDim === 'A' ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300' : 'bg-pink-950/80 border-pink-500 text-pink-300'}`}>
              [R] DIM: {gameState.currentDim === 'A' ? 'A (CYAN)' : 'B (CORRUPT)'}
            </span>
          </div>
        </div>

        {/* Center: Objective & Node Count */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">{gameState.currentSectorName}</span>
          <span className="text-xs font-bold text-yellow-400">
            CORES ACTIVE: {gameState.nodesActivated}/{gameState.totalNodes}
            {gameState.reactorStabilized && <span className="ml-2 text-green-400 animate-pulse">[EQUILIBRIUM RESTORED]</span>}
          </span>
        </div>

        {/* Right: Timer, Attempts, Sound & Skip Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Timer */}
          <div className={`px-2.5 py-1 rounded bg-black/60 border text-xs font-mono font-bold ${gameState.timeRemaining < 30 ? 'border-red-500 text-red-400 animate-pulse' : 'border-gray-700 text-yellow-300'}`}>
            ⏱ {Math.floor(gameState.timeRemaining / 60)}:{String(Math.floor(gameState.timeRemaining % 60)).padStart(2, '0')}
          </div>

          {/* Attempts */}
          <div className="hidden sm:flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded border border-gray-700 text-xs">
            <span className="text-[10px] text-gray-400">LIVES:</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`text-xs ${i < gameState.attempts ? 'text-red-400' : 'text-gray-600'}`}>♥</span>
            ))}
          </div>

          <button
            onClick={() => setShowTutorial(true)}
            className="px-2 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-xs font-bold text-gray-300 border border-[#475569] cursor-pointer"
            title="Controls & Mechanics [H]"
          >
            [H]
          </button>

          <button
            onClick={() => setShowMap(true)}
            className="px-2 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-xs font-bold text-gray-300 border border-[#475569] cursor-pointer"
            title="Chamber Map [Tab]"
          >
            [TAB]
          </button>

          <button
            onClick={toggleSound}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-xs font-bold text-yellow-300 transition cursor-pointer border border-[#475569]"
            title="Toggle Sound"
          >
            {soundEnabled ? 'VOL: ON' : 'VOL: OFF'}
          </button>

          {/* Universal Skip Button: Proceed to Final Boss */}
          <button
            onClick={onGoToFinalBoss}
            className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:brightness-110 active:scale-95 text-black font-mono font-black text-xs uppercase tracking-wider cursor-pointer transition shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-200 flex items-center gap-1.5"
            title="Skip Paradox Chamber to Final Boss (Press K or Click)"
          >
            <span>Skip [K] ➔</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN 2D GAME CANVAS ================= */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-[#060810]">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain block select-none cursor-crosshair"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* OVERLOAD MIDWAY TWIST BANNER OVERLAY */}
        {gameState.overloadTriggered && gameRef.current?.overloadBannerTimer > 0 && (
          <div className="absolute top-10 inset-x-0 z-30 flex justify-center pointer-events-none animate-bounce">
            <div className="bg-red-950/95 border-2 border-red-500 p-4 rounded-xl shadow-[0_0_40px_rgba(239,68,68,0.8)] text-center max-w-lg">
              <span className="text-xs font-black tracking-widest text-yellow-300 uppercase block mb-1">
                ⚠️ CRITICAL ERROR — REALITY PARAMETERS REWRITTEN ⚠️
              </span>
              <p className="text-xs text-red-200 font-sans">
                Gravity reversal now costs <strong>30 energy</strong>. Dimension switching now <strong>restores 10 energy</strong>!
                Time-resistant hazards and periodic entropy pulses are now active!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ================= FOOTER CONTROLS BAR ================= */}
      <footer className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-1.5 bg-[#0b0f1a]/95 border-t border-[#242f40] text-[10px] sm:text-xs text-gray-400 select-none">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <span><strong className="text-cyan-300 font-mono">A / D</strong>: Move</span>
          <span><strong className="text-cyan-300 font-mono">Space</strong>: Jump</span>
          <span><strong className="text-purple-300 font-mono">Q</strong>: Gravity ({gameState.overloadTriggered ? '-30' : '-15'})</span>
          <span><strong className="text-cyan-300 font-mono">E</strong>: Freeze (-20)</span>
          <span><strong className="text-pink-300 font-mono">R</strong>: Dimension ({gameState.overloadTriggered ? '+10' : '-10'})</span>
          <span><strong className="text-yellow-300 font-mono">F</strong>: Interact</span>
          <span><strong className="text-gray-300 font-mono">Esc</strong>: Pause</span>
          <span><strong className="text-amber-300 font-mono">K</strong>: Skip</span>
        </div>
        <div className="text-yellow-400/90 font-bold hidden md:block">
          PARADOX CHAMBER: STABILIZE 4 CORES ➔ REALIGN 3 SWITCHES (A ➔ B ➔ C)
        </div>
      </footer>

      {/* ================= PAUSE MENU MODAL ================= */}
      {gameState.state === 'paused' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e1626] border-2 border-cyan-500 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.4)] p-6 text-center space-y-4">
            <h2 className="text-xl font-black tracking-widest text-cyan-300 uppercase">
              // QUANTUM CHAMBER PAUSED
            </h2>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => gameRef.current?.togglePause()}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-wider transition cursor-pointer"
              >
                Resume
              </button>
              <button
                onClick={() => {
                  gameRef.current?.togglePause();
                  restartChamber();
                }}
                className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Restart Chamber
              </button>
              <button
                onClick={() => setShowTutorial(true)}
                className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 font-bold uppercase tracking-wider transition cursor-pointer"
              >
                How to Play & Controls
              </button>
              <button
                onClick={onBackToMenu}
                className="w-full py-2.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-200 font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HOW TO PLAY & TUTORIAL MODAL ================= */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur flex items-center justify-center p-4" onClick={() => setShowTutorial(false)}>
          <div className="w-full max-w-xl bg-[#0b0f1a] border-2 border-cyan-500/60 rounded-2xl p-6 text-left space-y-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <h3 className="text-base font-black text-cyan-300 uppercase tracking-wider">// REALITY-MANIPULATION PROTOCOLS</h3>
              <button onClick={() => setShowTutorial(false)} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-xs">✕ Close</button>
            </div>
            
            <div className="space-y-3 text-xs text-gray-300 font-sans leading-relaxed">
              <div className="p-2.5 rounded bg-purple-950/40 border border-purple-500/30">
                <strong className="text-purple-300 font-mono block mb-1">Q — GRAVITY REVERSAL (-15 Energy / -30 Overload)</strong>
                Flip gravity orientation. Walk on ceilings and jump downward towards ceilings. Affects gravity-sensitive crates.
              </div>
              <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                <strong className="text-cyan-300 font-mono block mb-1">E — TIME FREEZE (-20 Energy, 5s Duration)</strong>
                Temporarily freeze moving platforms, saw blades, and movable crates. Note: During reactor overload, time-resistant hazards cannot be frozen!
              </div>
              <div className="p-2.5 rounded bg-pink-950/40 border border-pink-500/30">
                <strong className="text-pink-300 font-mono block mb-1">R — DIMENSION SWITCH (-10 Energy / +10 RESTORES Overload)</strong>
                Switch between Dimension A (Cyan platforms solid) and Dimension B (Magenta platforms solid). Alternative paths and laser configurations appear.
              </div>
              <div className="p-2.5 rounded bg-yellow-950/30 border border-yellow-500/30">
                <strong className="text-yellow-300 font-mono block mb-1">F — INTERACT & ENERGY NODES (+25 Energy)</strong>
                Activate the 4 sector energy cores to unlock blast doors and restore +25 energy.
              </div>
              <div className="p-2.5 rounded bg-red-950/40 border border-red-500/30">
                <strong className="text-red-300 font-mono block mb-1">MIDWAY TWIST — REACTOR OVERLOAD</strong>
                After activating Core 2, reality rules shift! Gravity costs 30, but Dimension Switching RESTORES 10 energy!
              </div>
            </div>

            <button onClick={() => setShowTutorial(false)} className="w-full py-2 rounded bg-cyan-500 text-black font-bold uppercase">Got it</button>
          </div>
        </div>
      )}

      {/* ================= CHAMBER MAP MODAL ================= */}
      {showMap && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur flex items-center justify-center p-4" onClick={() => setShowMap(false)}>
          <div className="w-full max-w-2xl bg-[#0b0f1a] border-2 border-yellow-500/60 rounded-2xl p-6 text-center space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <h3 className="text-sm font-black text-yellow-300 uppercase tracking-widest">// PARADOX CHAMBER SCHEMATIC</h3>
              <button onClick={() => setShowMap(false)} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-xs">✕ Close</button>
            </div>

            <div className="grid grid-cols-5 gap-2 text-[10px] font-mono">
              <div className="p-3 rounded bg-cyan-950/60 border border-cyan-500/40">
                <span className="block font-bold text-cyan-300">SECTOR 1</span>
                <span>Gravity Calibration</span>
                <span className="block text-green-400 mt-2 font-bold">{gameState.nodesActivated >= 1 ? '✓ CORE 1' : 'CORE 1 [F]'}</span>
              </div>
              <div className="p-3 rounded bg-purple-950/60 border border-purple-500/40">
                <span className="block font-bold text-purple-300">SECTOR 2</span>
                <span>Temporal Lockdown</span>
                <span className="block text-green-400 mt-2 font-bold">{gameState.nodesActivated >= 2 ? '✓ CORE 2' : 'CORE 2 [F]'}</span>
              </div>
              <div className="p-3 rounded bg-red-950/60 border border-red-500/40">
                <span className="block font-bold text-red-300">SECTOR 3</span>
                <span>Quantum Redist.</span>
                <span className="block text-green-400 mt-2 font-bold">{gameState.nodesActivated >= 3 ? '✓ CORE 3' : 'CORE 3 [F]'}</span>
              </div>
              <div className="p-3 rounded bg-yellow-950/60 border border-yellow-500/40">
                <span className="block font-bold text-yellow-300">SECTOR 4</span>
                <span>Entropy Gauntlet</span>
                <span className="block text-green-400 mt-2 font-bold">{gameState.nodesActivated >= 4 ? '✓ CORE 4' : 'CORE 4 [F]'}</span>
              </div>
              <div className="p-3 rounded bg-green-950/60 border border-green-500/40">
                <span className="block font-bold text-green-300">CENTRAL CORE</span>
                <span>Last Equilibrium</span>
                <span className="block text-yellow-300 mt-2 font-bold">{gameState.reactorStabilized ? '✓ PORTAL OPEN' : 'SYNCHRONIZE'}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 font-sans">
              Solve interconnected puzzles in each sector to reach and stabilize the Quantum Reactor Core.
            </p>
          </div>
        </div>
      )}

      {/* ================= GAME OVER / FAILED SCREEN ================= */}
      {gameState.state === 'failed' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#160c10] border-2 border-red-500 rounded-2xl shadow-[0_0_60px_rgba(239,68,68,0.7)] p-6 text-center space-y-4">
            <h2 className="text-2xl font-black tracking-widest text-red-500 uppercase">
              // CONTAINMENT FAILURE
            </h2>
            <p className="text-xs text-gray-300 font-sans">
              All attempts depleted or entropy field overwhelmed the reality matrix.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={restartChamber}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:brightness-110 font-bold uppercase text-xs tracking-wider transition cursor-pointer"
              >
                Retry Chamber
              </button>
              <button
                onClick={onGoToFinalBoss}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold uppercase text-xs tracking-wider transition cursor-pointer border border-white/20"
              >
                Skip to Boss ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VICTORY / EQUILIBRIUM SCREEN ================= */}
      {gameState.state === 'victory' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#071712] border-2 border-emerald-400 rounded-3xl shadow-[0_0_80px_rgba(52,211,153,0.7)] p-6 sm:p-8 text-center space-y-5 animate-fadeIn">
            
            <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black uppercase tracking-widest animate-pulse">
              [ QUANTUM EQUILIBRIUM RESTORED ]
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-300 to-cyan-100 uppercase">
              ENTROPY ENGINE BREACHED
            </h2>

            {/* Score & Rank Card */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-black/60 border border-emerald-500/30 font-mono">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">FINAL SCORE</span>
                <span className="text-lg sm:text-xl font-black text-yellow-300">{gameState.finalScore}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">RANK</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">{gameState.finalRank}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">LIVES REMAINING</span>
                <span className="text-lg sm:text-xl font-black text-cyan-300">{gameState.attempts}/3</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              The paradox has collapsed! The Author coordinates have been unlocked. Proceed directly to the Final Showdown against the Puppet Master!
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onGoToFinalBoss}
                className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-300 hover:brightness-110 active:scale-95 text-black font-black uppercase text-xs tracking-wider transition cursor-pointer shadow-[0_0_25px_rgba(52,211,153,0.6)]"
              >
                Proceed to Final Boss ➔
              </button>
              <button
                onClick={restartChamber}
                className="py-3.5 px-6 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-xs tracking-wider transition cursor-pointer border border-white/20"
              >
                Replay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
