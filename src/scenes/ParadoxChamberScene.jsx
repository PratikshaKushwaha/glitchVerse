import { useEffect, useRef, useState, useCallback } from 'react';
import { Game } from '../engine/Game.js';
import { Audio } from '../engine/Audio.js';
import { Input } from '../engine/Input.js';
import studentAvatarImg from '../assets/student_pixel_avatar.png';

export default function ParadoxChamberScene({
  playerName = 'Seeker',
  onBackToLevelFour,
  onGoToFinalBoss,
  onBackToMenu
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  // High-performance HUD & Modal State
  const [hudState, setHudState] = useState({
    state: 'PLAYING',
    energy: 100,
    timer: 180,
    attempts: 3,
    currentSectorName: 'SECTOR 1: GRAVITY CALIBRATION',
    freezeActive: false,
    freezeTimer: 0,
    freezeCooldown: 0,
    syncActivated: [false, false, false],
    activeCores: 0,
    gravDir: 1,
    dim: 'A',
    overloaded: false,
    timeUsed: 0
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Helper to trigger audio on first interaction
  const ensureAudio = useCallback(() => {
    Audio.init();
  }, []);

  // Initialize and mount engine
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    ensureAudio();

    const game = new Game(canvas);
    gameRef.current = game;

    // Direct game boot into PLAYING mode
    game.resetRun();

    // Responsive aspect ratio scaling
    const handleResize = () => {
      if (!container || !game) return;
      const rect = container.getBoundingClientRect();
      const availW = Math.max(320, rect.width - 16);
      const availH = Math.max(180, rect.height - 16);

      const scaleX = availW / game.W;
      const scaleY = availH / game.H;
      const scale = Math.max(1, Math.min(scaleX, scaleY));

      canvas.style.width = `${Math.floor(game.W * scale)}px`;
      canvas.style.height = `${Math.floor(game.H * scale)}px`;
    };

    window.addEventListener('resize', handleResize);
    // Initial resize after layout
    setTimeout(handleResize, 20);

    let lastUpdate = 0;

    // Real-time engine callback
    game.onFrame = (g) => {
      const now = performance.now();
      // Sync React HUD state at ~25fps or on discrete state change
      const stateChanged = g.state !== hudState.state;
      if (stateChanged || now - lastUpdate > 40) {
        lastUpdate = now;
        const cores = g.reactorNodes ? g.reactorNodes.filter(n => n.active).length : 0;
        setHudState({
          state: g.state,
          energy: Math.max(0, Math.round(g.energy)),
          timer: Math.max(0, g.timer),
          attempts: Math.max(0, g.attempts),
          currentSectorName: g.currentSectorName || 'ENTROPY CHAMBER',
          freezeActive: g.freezeActive,
          freezeTimer: g.freezeTimer,
          freezeCooldown: g.freezeCooldown,
          syncActivated: [...g.syncActivated],
          activeCores: cores,
          gravDir: g.player ? g.player.gravDir : 1,
          dim: g.dim || 'A',
          overloaded: g.overloaded,
          timeUsed: Math.max(0, 180 - g.timer)
        });
      }
    };

    game.start();

    // Global keyboard listener for scene shortcuts
    const handleKeyDown = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        onGoToFinalBoss && onGoToFinalBoss();
      } else if (e.code === 'KeyH' || e.key === 'h' || e.key === 'H') {
        setShowHowToPlay(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, [ensureAudio, onGoToFinalBoss]);

  const toggleSound = () => {
    const next = Audio.toggleSound();
    setSoundEnabled(next);
  };

  const restartChamber = () => {
    ensureAudio();
    if (gameRef.current) {
      gameRef.current.resetRun();
    }
  };

  const triggerAction = (code) => {
    ensureAudio();
    Input.triggerAction(code);
  };

  const setHeld = (code, isHeld) => {
    ensureAudio();
    Input.setHeld(code, isHeld);
  };

  const runFullPlaythrough = () => {
    ensureAudio();
    if (gameRef.current) {
      gameRef.current.startAutoplayDemo();
    }
  };

  const timerMins = Math.floor(hudState.timer / 60);
  const timerSecs = Math.floor(hudState.timer % 60).toString().padStart(2, '0');
  const isCeiling = hudState.gravDir === -1;

  return (
    <div
      className="relative w-screen h-screen bg-[#03050a] text-[#d0e4ff] flex flex-col justify-between overflow-hidden select-none font-mono"
      style={{
        background: 'radial-gradient(circle at center, #0c1224 0%, #03050a 100%)'
      }}
      onClick={ensureAudio}
    >
      {/* ========================================================= */}
      {/* TOP RAZOR-SHARP HTML HUD OVERLAY */}
      {/* ========================================================= */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2 bg-[#0a1020]/90 border-b border-cyan-500/30 shadow-2xl backdrop-blur-md">
        
        {/* Left: Sector 4 return, Retry & Energy Gauge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Student Avatar + Callsign Badge */}
          <div className="hidden xl:flex items-center gap-2 bg-[#080d1a] px-2.5 py-1 rounded-md border border-cyan-500/40 shadow-inner">
            <div className="w-6 h-6 rounded-full border border-cyan-400 overflow-hidden bg-cyan-950 flex-shrink-0">
              <img src={studentAvatarImg} alt={playerName || 'Seeker'} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-white leading-tight">{playerName || 'Seeker'}</span>
              <span className="text-[8px] text-cyan-300 font-mono leading-tight">STUDENT // PRESENT</span>
            </div>
          </div>

          <button
            onClick={onBackToLevelFour}
            className="px-2.5 py-1 rounded bg-[#101b33] hover:bg-[#1a2d54] text-xs font-bold text-gray-300 hover:text-white transition cursor-pointer border border-cyan-500/30 shadow-sm"
          >
            ← Sector 4
          </button>

          <button
            onClick={restartChamber}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-300 hover:text-amber-200 transition cursor-pointer border border-amber-400/50 shadow flex items-center gap-1.5"
            title="Restart Chamber from Start Point"
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M21 21v-5h-5" />
            </svg>
            <span>Retry</span>
          </button>

          {/* Energy Gauge */}
          <div className="flex items-center gap-2.5 bg-[#080d1a] px-3 py-1 rounded-md border border-cyan-500/40 shadow-inner min-w-[160px] sm:min-w-[190px]">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">⚡ ENERGY</span>
            <div className="flex-1 h-2 bg-[#101626] rounded-xs border border-[#2a3a5c] overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  hudState.energy < 25
                    ? 'bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_8px_#ff2244]'
                    : hudState.overloaded
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-300 shadow-[0_0_8px_#ffa500]'
                    : 'bg-gradient-to-r from-cyan-500 to-teal-300 shadow-[0_0_8px_#00e5ff]'
                }`}
                style={{ width: `${hudState.energy}%` }}
              />
            </div>
            <span
              className={`text-xs font-bold font-mono ${
                hudState.energy < 25 ? 'text-red-400 animate-pulse' : 'text-yellow-300'
              }`}
            >
              {hudState.energy}/100
            </span>
          </div>
        </div>

        {/* Center: Sector Name & Timer */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-[11px] font-bold text-[#a0c4ff] tracking-widest uppercase drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">
            {hudState.currentSectorName}
          </span>
          <div className="flex items-center gap-2.5 mt-0.5">
            <span
              className={`text-sm font-black tracking-wider ${
                hudState.timer < 30 ? 'text-red-500 animate-pulse drop-shadow-[0_0_8px_#ff3b4d]' : 'text-white'
              }`}
            >
              ⏱️ {timerMins}:{timerSecs}
            </span>
            {hudState.freezeActive && (
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-bold animate-pulse">
                ❄️ TIME FROZEN {hudState.freezeTimer.toFixed(1)}s
              </span>
            )}
          </div>
        </div>

        {/* Right: Sync Array, Cores, Lives, Sound & Skip Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sync Array Status */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#080d1a] px-2.5 py-1 rounded-md border border-cyan-500/30 text-[11px]">
            <span className="text-[10px] text-gray-400 font-bold mr-1">SYNCS:</span>
            {['A', 'B', 'C'].map((letter, idx) => {
              const active = hudState.syncActivated[idx];
              return (
                <span
                  key={letter}
                  className={`px-1.5 py-0.2 rounded font-bold ${
                    active
                      ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-300 shadow-[0_0_6px_#32e6a1]'
                      : 'bg-gray-800/60 border border-gray-700 text-gray-400'
                  }`}
                >
                  {letter}: {active ? '✓' : '✗'}
                </span>
              );
            })}
          </div>

          {/* Cores & Lives */}
          <div className="hidden sm:flex items-center gap-2 bg-[#080d1a] px-2.5 py-1 rounded-md border border-cyan-500/30 text-xs">
            <span className="text-yellow-400 font-bold">CORES: {hudState.activeCores}/4</span>
            <span className="text-gray-500">|</span>
            <span className="text-red-400 font-bold">LIVES: {'❤️'.repeat(hudState.attempts)}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="px-2.5 py-1 rounded bg-[#101b33] hover:bg-[#1a2d54] text-xs font-bold text-yellow-300 transition cursor-pointer border border-cyan-500/30"
            title="Toggle Sound"
          >
            {soundEnabled ? 'VOL: ON' : 'VOL: OFF'}
          </button>

          {/* How to Play Button */}
          <button
            onClick={() => setShowHowToPlay(true)}
            className="px-2.5 py-1 rounded bg-[#101b33] hover:bg-[#1a2d54] text-xs font-bold text-gray-300 border border-cyan-500/30 cursor-pointer"
            title="Controls & Mechanics [H]"
          >
            [H]
          </button>

          {/* Skip directly to Final Boss */}
          <button
            onClick={onGoToFinalBoss}
            className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:brightness-110 active:scale-95 text-black font-mono font-black text-xs uppercase tracking-wider cursor-pointer transition shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-200 flex items-center gap-1.5"
            title="Skip Paradox Chamber to Final Boss (Press K)"
          >
            <span>Skip [K] ➔</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN 2D PIXEL-ART CANVAS CONTAINER */}
      {/* ========================================================= */}
      <main
        ref={containerRef}
        className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden p-1.5"
      >
        <div className="relative flex items-center justify-center rounded-lg border-2 border-cyan-500/35 bg-black shadow-[0_0_40px_rgba(0,229,255,0.18),0_0_80px_rgba(255,0,212,0.1)] overflow-hidden">
          <canvas
            ref={canvasRef}
            className="block select-none cursor-crosshair"
            style={{
              imageRendering: 'pixelated',
              width: '100%',
              height: '100%'
            }}
          />

          {/* Overload Midway Twist Alert Banner */}
          {hudState.overloaded && hudState.state === 'OVERLOAD_CINEMATIC' && (
            <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-[#1a0509] border-2 border-red-500 rounded-2xl p-6 text-center space-y-4 shadow-[0_0_60px_rgba(255,59,77,0.8)] animate-pulse">
                <div className="text-xl sm:text-2xl font-black text-red-500 tracking-widest uppercase">
                  ⚠️ CRITICAL OVERLOAD: REALITY INVERTED ⚠️
                </div>
                <p className="text-xs sm:text-sm text-red-200 font-sans leading-relaxed">
                  Quantum containment breached! Gravity reversal now costs <strong className="text-yellow-400">30⚡</strong>.
                  Dimension switching now <strong className="text-emerald-400">RESTORES +10⚡</strong>!
                  Periodic reactor shockwaves have destabilized the chamber!
                </p>
                <button
                  onClick={() => {
                    if (gameRef.current) gameRef.current.state = 'PLAYING';
                  }}
                  className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg"
                >
                  DISMISS & RESUME [ENTER]
                </button>
              </div>
            </div>
          )}

          {/* Pause Modal */}
          {hudState.state === 'PAUSED' && (
            <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-[#0c1426] border-2 border-cyan-500 rounded-2xl p-6 text-center space-y-3 shadow-[0_0_40px_rgba(0,229,255,0.4)]">
                <h3 className="text-lg font-black text-cyan-300 uppercase tracking-widest">
                  // CHAMBER PAUSED
                </h3>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      if (gameRef.current) gameRef.current.state = 'PLAYING';
                    }}
                    className="w-full py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-xs tracking-wider transition cursor-pointer"
                  >
                    Resume [ESC]
                  </button>
                  <button
                    onClick={restartChamber}
                    className="w-full py-2 rounded bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-xs tracking-wider transition cursor-pointer"
                  >
                    Restart Chamber
                  </button>
                  <button
                    onClick={() => setShowHowToPlay(true)}
                    className="w-full py-2 rounded bg-white/10 hover:bg-white/20 text-gray-300 font-bold uppercase text-xs tracking-wider transition cursor-pointer"
                  >
                    How to Play
                  </button>
                  <button
                    onClick={onBackToMenu}
                    className="w-full py-2 rounded bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 font-bold uppercase text-xs tracking-wider transition cursor-pointer"
                  >
                    Main Menu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Modal */}
          {hudState.state === 'GAME_OVER' && (
            <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-[#16060a] border-2 border-red-500 rounded-2xl p-6 text-center space-y-4 shadow-[0_0_60px_rgba(255,59,77,0.7)]">
                <div className="text-2xl font-black text-red-500 uppercase tracking-widest">
                  REALITY COLLAPSED
                </div>
                <p className="text-xs text-red-200 font-sans">
                  The chamber succumbed to entropy runaway. Containment matrix failed.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={restartChamber}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:brightness-110 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow"
                  >
                    Try Again [ENTER]
                  </button>
                  <button
                    onClick={onGoToFinalBoss}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs uppercase tracking-wider transition cursor-pointer text-gray-200"
                  >
                    Skip to Boss ➔
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Victory Modal */}
          {hudState.state === 'VICTORY' && (
            <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-[#071712] border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-[0_0_80px_rgba(50,230,161,0.7)] animate-fadeIn">
                <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black uppercase tracking-widest animate-pulse">
                  [ QUANTUM EQUILIBRIUM RESTORED ]
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-emerald-300 uppercase">
                  ENTROPY ENGINE BREACHED
                </h2>
                <div className="p-3 bg-black/60 rounded-xl border border-emerald-500/30 text-xs font-mono text-gray-300 space-y-1">
                  <div>Escape Time: <strong className="text-yellow-300">{hudState.timeUsed.toFixed(1)}s</strong></div>
                  <div>Remaining Energy: <strong className="text-cyan-300">{hudState.energy}/100</strong></div>
                  <div>Sync Switches: <strong className="text-emerald-400">3/3 ONLINE</strong></div>
                </div>
                <p className="text-xs text-gray-300 font-sans">
                  The reality barrier has collapsed! Author coordinates unlocked. Proceed to the Final Showdown!
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onGoToFinalBoss}
                    className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-300 hover:brightness-110 active:scale-95 text-black font-black uppercase text-xs tracking-wider transition cursor-pointer shadow-[0_0_25px_rgba(50,230,161,0.6)]"
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
      </main>

      {/* ========================================================= */}
      {/* BOTTOM CONSOLE BAR: Q, E, R ABILITY CARDS + CONTROLS */}
      {/* ========================================================= */}
      <footer className="relative z-20 flex flex-col gap-1.5 px-3 sm:px-6 py-2 bg-[#0a1020]/95 border-t border-cyan-500/30 shadow-2xl backdrop-blur-md">
        
        {/* Prominent Ability Cards: [Q] Gravity, [E] Freeze, [R] Dimension */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-4xl mx-auto w-full">
          
          {/* [Q] Gravity Reversal Card */}
          <div
            onClick={() => triggerAction('KeyQ')}
            className={`p-2 sm:p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition active:scale-[0.98] select-none ${
              isCeiling
                ? 'bg-amber-950/60 border-amber-500 shadow-[0_0_15px_rgba(255,165,0,0.3)]'
                : 'bg-[#0e1628] border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
            }`}
            title="Click or press Q to invert gravity"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-xs font-black text-cyan-300">
                Q
              </span>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] font-bold text-white tracking-wide">REVERSE GRAVITY</span>
                <span className="text-[9px] text-gray-400">Walk on Ceilings</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`text-[10px] sm:text-xs font-bold ${
                  isCeiling ? 'text-amber-400' : 'text-cyan-300'
                }`}
              >
                {isCeiling ? 'CEILING ▲' : 'FLOOR ▼'}
              </span>
              <span className="text-[9px] font-mono text-red-400">
                {hudState.overloaded ? '-30⚡' : '-15⚡'}
              </span>
            </div>
          </div>

          {/* [E] Time Freeze Card */}
          <div
            onClick={() => triggerAction('KeyE')}
            className={`p-2 sm:p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition active:scale-[0.98] select-none ${
              hudState.freezeActive
                ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_18px_rgba(0,229,255,0.4)]'
                : 'bg-[#0e1628] border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
            }`}
            title="Click or press E to freeze saws and hazards"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-xs font-black text-cyan-300">
                E
              </span>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] font-bold text-white tracking-wide">TIME FREEZE</span>
                <span className="text-[9px] text-gray-400">Halt Saws & Hazards</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`text-[10px] sm:text-xs font-bold ${
                  hudState.freezeActive
                    ? 'text-cyan-300 animate-pulse'
                    : hudState.freezeCooldown > 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {hudState.freezeActive
                  ? `${hudState.freezeTimer.toFixed(1)}s`
                  : hudState.freezeCooldown > 0
                  ? `WAIT ${Math.ceil(hudState.freezeCooldown)}s`
                  : 'READY'}
              </span>
              <span className="text-[9px] font-mono text-red-400">-20⚡</span>
            </div>
          </div>

          {/* [R] Dimension Switch Card */}
          <div
            onClick={() => triggerAction('KeyR')}
            className={`p-2 sm:p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition active:scale-[0.98] select-none ${
              hudState.dim === 'B'
                ? 'bg-fuchsia-950/60 border-fuchsia-500 shadow-[0_0_18px_rgba(255,0,212,0.3)]'
                : 'bg-[#0e1628] border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
            }`}
            title="Click or press R to toggle reality dimension"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-fuchsia-500/20 border border-fuchsia-400/60 flex items-center justify-center text-xs font-black text-fuchsia-300">
                R
              </span>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] font-bold text-white tracking-wide">SWITCH DIMENSION</span>
                <span className="text-[9px] text-gray-400">Toggle Reality Layer</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`text-[10px] sm:text-xs font-bold ${
                  hudState.dim === 'A' ? 'text-cyan-300' : 'text-fuchsia-400'
                }`}
              >
                {hudState.dim === 'A' ? 'DIM A' : 'DIM B'}
              </span>
              <span
                className={`text-[9px] font-mono ${
                  hudState.overloaded ? 'text-emerald-400 font-bold' : 'text-red-400'
                }`}
              >
                {hudState.overloaded ? '+10⚡ RECHARGE' : '-10⚡'}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Movement & Action Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-[10px] sm:text-xs">
          <button
            onMouseDown={() => setHeld('KeyA', true)}
            onMouseUp={() => setHeld('KeyA', false)}
            onMouseLeave={() => setHeld('KeyA', false)}
            onTouchStart={() => setHeld('KeyA', true)}
            onTouchEnd={() => setHeld('KeyA', false)}
            className="px-2.5 py-1 rounded bg-[#101b33] hover:bg-[#1a2d54] border border-cyan-500/30 text-gray-200 cursor-pointer active:scale-95"
          >
            <strong className="text-cyan-300 mr-1">A</strong> Left
          </button>

          <button
            onMouseDown={() => setHeld('KeyD', true)}
            onMouseUp={() => setHeld('KeyD', false)}
            onMouseLeave={() => setHeld('KeyD', false)}
            onTouchStart={() => setHeld('KeyD', true)}
            onTouchEnd={() => setHeld('KeyD', false)}
            className="px-2.5 py-1 rounded bg-[#101b33] hover:bg-[#1a2d54] border border-cyan-500/30 text-gray-200 cursor-pointer active:scale-95"
          >
            <strong className="text-cyan-300 mr-1">D</strong> Right
          </button>

          <button
            onMouseDown={() => setHeld('Space', true)}
            onMouseUp={() => setHeld('Space', false)}
            onMouseLeave={() => setHeld('Space', false)}
            onTouchStart={() => setHeld('Space', true)}
            onTouchEnd={() => setHeld('Space', false)}
            className="px-3 py-1 rounded bg-[#101b33] hover:bg-[#1a2d54] border border-cyan-500/30 text-gray-200 cursor-pointer active:scale-95 font-bold"
          >
            <strong className="text-cyan-300 mr-1">SPACE</strong> Jump
          </button>

          <button
            onClick={() => triggerAction('KeyF')}
            className="px-2.5 py-1 rounded bg-[#101b33] hover:bg-[#1a2d54] border border-yellow-500/40 text-yellow-300 cursor-pointer active:scale-95"
          >
            <strong className="mr-1">F</strong> Interact
          </button>

          <button
            onClick={() => triggerAction('Escape')}
            className="px-2.5 py-1 rounded bg-[#101b33] hover:bg-[#1a2d54] border border-gray-600 text-gray-300 cursor-pointer active:scale-95"
          >
            <strong className="mr-1">ESC</strong> Pause
          </button>

          <button
            onClick={runFullPlaythrough}
            className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 font-bold cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.3)] flex items-center gap-1"
            title="Watch automated speedrun walkthrough from start to victory"
          >
            <span>▶</span>
            <span>Full Walkthrough</span>
          </button>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* HOW TO PLAY MODAL OVERLAY */}
      {/* ========================================================= */}
      {showHowToPlay && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowHowToPlay(false)}
        >
          <div
            className="w-full max-w-xl bg-[#0b0f1a] border-2 border-cyan-500/60 rounded-2xl p-6 text-left space-y-4 max-h-[85vh] overflow-y-auto shadow-[0_0_50px_rgba(0,229,255,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <h3 className="text-base font-black text-cyan-300 uppercase tracking-wider">
                // REALITY-MANIPULATION PROTOCOLS
              </h3>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300 font-sans leading-relaxed">
              <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                <strong className="text-cyan-300 font-mono block mb-1">
                  Q — GRAVITY REVERSAL (-15⚡ Normal / -30⚡ Overload)
                </strong>
                Inverts gravity orientation. Walk on ceilings and traverse hazardous floor spikes and deep pits.
              </div>
              <div className="p-2.5 rounded bg-teal-950/40 border border-teal-500/30">
                <strong className="text-teal-300 font-mono block mb-1">
                  E — TIME FREEZE (-20⚡, 5s Duration)
                </strong>
                Halts moving platforms, high-speed saw blades, and crushing hazards in their tracks.
              </div>
              <div className="p-2.5 rounded bg-fuchsia-950/40 border border-fuchsia-500/30">
                <strong className="text-fuchsia-300 font-mono block mb-1">
                  R — DIMENSION SWITCH (-10⚡ Normal / +10⚡ RECHARGE Overload)
                </strong>
                Switches between Dimension A (Cyan blocks solid) and Dimension B (Magenta blocks solid).
              </div>
              <div className="p-2.5 rounded bg-amber-950/30 border border-amber-500/30">
                <strong className="text-amber-300 font-mono block mb-1">
                  F — ENGAGE NODES & PRESSURE SWITCHES (+25⚡)
                </strong>
                Collect energy nodes to recharge battery. Push crates onto pressure switches to disable laser gates.
              </div>
              <div className="p-2.5 rounded bg-red-950/40 border border-red-500/30">
                <strong className="text-red-300 font-mono block mb-1">
                  MIDWAY TWIST — REACTOR OVERLOAD
                </strong>
                Engaging Core 2 inverts chamber parameters! Gravity costs 30⚡, but Dimension Switching RESTORES 10⚡!
              </div>
              <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                <strong className="text-emerald-300 font-mono block mb-1">
                  OBJECTIVE: RESTORE 3 SYNCS (A ➔ B ➔ C) & ENTER EXIT PORTAL
                </strong>
                Activate all 3 synchronization switches to unlock the containment vault and proceed to the Final Boss.
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-wider text-xs transition cursor-pointer"
            >
              RESUME MISSION [ENTER]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
