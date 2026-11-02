// ============================================================
// ENTROPY ENGINE: REALITY COLLAPSE
// Standalone sci-fi puzzle platformer (Pure HTML5 Canvas + Vite)
// ============================================================

import { Game } from './engine/Game.js';
import { Audio } from './engine/Audio.js';
import { Input } from './engine/Input.js';

// Boot
const canvas = document.getElementById('game-canvas');
const game   = new Game(canvas);

// DOM Elements for Razor-Sharp HTML HUD
const hudEnergyVal    = document.getElementById('hud-energy-val');
const hudEnergyBar    = document.getElementById('hud-energy-bar');
const hudSectorName   = document.getElementById('hud-sector-name');
const hudTimer        = document.getElementById('hud-timer');
const hudFreezeBadge  = document.getElementById('hud-freeze-badge');
const syncA           = document.getElementById('sync-a');
const syncB           = document.getElementById('sync-b');
const syncC           = document.getElementById('sync-c');
const hudLives        = document.getElementById('hud-lives');
const hudCores        = document.getElementById('hud-cores');

// DOM Elements for Bottom Console Q, E, R Ability Cards
const qStatus         = document.getElementById('q-status');
const qCost           = document.getElementById('q-cost');
const eStatus         = document.getElementById('e-status');
const eCost           = document.getElementById('e-cost');
const rStatus         = document.getElementById('r-status');
const rCost           = document.getElementById('r-cost');

// DOM Elements for High-Resolution HTML Modals
const modalMainMenu   = document.getElementById('modal-main-menu');
const modalPause      = document.getElementById('modal-pause');
const modalHowToPlay  = document.getElementById('modal-how-to-play');
const modalOverload   = document.getElementById('modal-overload');
const modalVictory    = document.getElementById('modal-victory');
const modalGameOver   = document.getElementById('modal-gameover');
const victoryStats    = document.getElementById('victory-stats');

// Initialize Web Audio on first user interaction
const initAudio = () => {
  Audio.init();
  window.removeEventListener('click', initAudio);
  window.removeEventListener('keydown', initAudio);
};
window.addEventListener('click', initAudio);
window.addEventListener('keydown', initAudio);

// Expose helper to window for on-screen touch/mouse buttons & modal actions
window.triggerGameAction = (code) => {
  Audio.init();
  Input.triggerAction(code);
};

window.setGameHeld = (code, isHeld) => {
  Audio.init();
  Input.setHeld(code, isHeld);
};

window.runFullPlaythrough = () => {
  Audio.init();
  game.startAutoplayDemo();
};

window.startGameRun = () => {
  Audio.init();
  game.resetRun();
};

window.resumeGameRun = () => {
  Audio.init();
  game.state = 'PLAYING';
};

window.showHowToPlay = () => {
  Audio.init();
  game.state = 'HOW_TO_PLAY';
};

window.closeHowToPlay = () => {
  Audio.init();
  game.state = game.player ? 'PAUSED' : 'MAIN_MENU';
};

window.restartFromCheckpoint = () => {
  Audio.init();
  game.respawnPlayer();
  game.state = 'PLAYING';
};

window.returnToMainMenu = () => {
  Audio.init();
  game.state = 'MAIN_MENU';
};

window.dismissOverload = () => {
  Audio.init();
  game.state = 'PLAYING';
};

// Real-time HUD, Modals, and Bottom Console updater
game.onFrame = (g) => {
  // Sync High-DPI Modal Overlays
  modalMainMenu.style.display  = g.state === 'MAIN_MENU' ? 'flex' : 'none';
  modalPause.style.display     = g.state === 'PAUSED' ? 'flex' : 'none';
  modalHowToPlay.style.display = g.state === 'HOW_TO_PLAY' ? 'flex' : 'none';
  modalOverload.style.display  = g.state === 'OVERLOAD_CINEMATIC' ? 'flex' : 'none';
  modalVictory.style.display   = g.state === 'VICTORY' ? 'flex' : 'none';
  modalGameOver.style.display  = g.state === 'GAME_OVER' ? 'flex' : 'none';

  if (g.state === 'VICTORY' && victoryStats) {
    const timeUsed = (180 - g.timer).toFixed(1);
    victoryStats.textContent = `Escape Time: ${timeUsed}s | Remaining Energy: ${Math.round(g.energy)}/100 | Syncs: 3/3`;
  }

  // 1. Energy Gauge
  const energyInt = Math.max(0, Math.round(g.energy));
  hudEnergyVal.textContent = `${energyInt}/100`;
  hudEnergyBar.style.width = `${energyInt}%`;
  if (energyInt < 25) {
    hudEnergyBar.classList.add('low');
  } else {
    hudEnergyBar.classList.remove('low');
  }

  // 2. Sector & Timer
  hudSectorName.textContent = g.currentSectorName || 'ENTROPY CHAMBER';
  const mins = Math.floor(g.timer / 60);
  const secs = Math.floor(g.timer % 60).toString().padStart(2, '0');
  hudTimer.textContent = `⏱️ ${mins}:${secs}`;
  if (g.timer < 30) {
    hudTimer.classList.add('urgent');
  } else {
    hudTimer.classList.remove('urgent');
  }

  // 3. Time Freeze Badge
  if (g.freezeActive) {
    hudFreezeBadge.style.display = 'inline-block';
    hudFreezeBadge.textContent = `❄️ TIME FROZEN ${g.freezeTimer.toFixed(1)}s`;
  } else {
    hudFreezeBadge.style.display = 'none';
  }

  // 4. Sync Switches
  updateSyncBadge(syncA, 'A', g.syncActivated[0]);
  updateSyncBadge(syncB, 'B', g.syncActivated[1]);
  updateSyncBadge(syncC, 'C', g.syncActivated[2]);

  // 5. Lives & Cores
  const livesCount = Math.max(0, g.attempts);
  hudLives.textContent = `LIVES: ${'❤️'.repeat(livesCount)}`;
  const activeCores = g.reactorNodes.filter(n => n.active).length;
  hudCores.textContent = `CORES: ${activeCores}/4`;

  // 6. [Q] Gravity Ability Status
  const isCeiling = g.player && g.player.gravDir === -1;
  qStatus.textContent = isCeiling ? 'CEILING ▲' : 'FLOOR ▼';
  qStatus.style.color = isCeiling ? '#ffa500' : '#00e5ff';
  qCost.textContent   = g.overloaded ? '-30⚡' : '-15⚡';

  // 7. [E] Time Freeze Status
  if (g.freezeActive) {
    eStatus.textContent = `ACTIVE ${g.freezeTimer.toFixed(1)}s`;
    eStatus.style.color = '#00e5ff';
  } else if (g.freezeCooldown > 0) {
    eStatus.textContent = `WAIT ${Math.ceil(g.freezeCooldown)}s`;
    eStatus.style.color = '#ffaa00';
  } else {
    eStatus.textContent = 'READY';
    eStatus.style.color = '#32e6a1';
  }
  eCost.textContent = '-20⚡';

  // 8. [R] Dimension Switch Status
  rStatus.textContent = g.dim === 'A' ? 'DIM A' : 'DIM B';
  rStatus.style.color = g.dim === 'A' ? '#00e5ff' : '#ff00d4';
  if (g.overloaded) {
    rCost.textContent = '+10⚡ RECHARGE';
    rCost.className   = 'ability-cost cost-gain';
  } else {
    rCost.textContent = '-10⚡';
    rCost.className   = 'ability-cost cost-drain';
  }
};

function updateSyncBadge(el, letter, isActive) {
  if (isActive) {
    el.textContent = `${letter}: ✓`;
    el.className   = 'sync-pill on';
  } else {
    el.textContent = `${letter}: ✗`;
    el.className   = 'sync-pill off';
  }
}

// Resize handler — pixel-perfect scaling & centered aspect ratio
function resize() {
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  // Account for bottom console bar (~120px) + margins
  const availW = winW - 24;
  const availH = winH - 140;

  const scaleX = availW / game.W;
  const scaleY = availH / game.H;
  const scale  = Math.max(1, Math.min(scaleX, scaleY));

  canvas.style.width  = `${Math.floor(game.W * scale)}px`;
  canvas.style.height = `${Math.floor(game.H * scale)}px`;
}
window.addEventListener('resize', resize);
resize();

game.start();
