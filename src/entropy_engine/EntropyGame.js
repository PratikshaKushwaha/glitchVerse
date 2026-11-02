import { PALETTE, GAME_CONSTANTS } from './constants.js';
import { entropyAudio } from './audio.js';
import { createChamberData } from './chamberData.js';

export class EntropyGame {
  constructor(canvas, onStateChange = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onStateChange = onStateChange;

    this.data = createChamberData();

    // Game State: 'playing' | 'paused' | 'overload_cutscene' | 'failed' | 'victory'
    this.state = 'playing';

    // Player State
    this.p = {
      x: 60,
      y: 360,
      w: 16,
      h: 24,
      vx: 0,
      vy: 0,
      onGround: false,
      gd: 1, // 1 = normal (falls down), -1 = inverted (falls up)
      facing: 1,
      invulnTimer: 0,
      isPushing: false
    };

    // Responsive Jump Feel: Coyote Time & Jump Buffering
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.animTime = 0;

    // Camera
    this.camX = 0;
    this.camY = 0;
    this.shake = 0;

    // Reality States
    this.currentDim = 'A'; // 'A' (Cyan) | 'B' (Magenta)
    this.energy = GAME_CONSTANTS.STARTING_ENERGY;
    this.freezeActive = false;
    this.freezeTimer = 0;
    this.freezeCooldown = 0;

    // Overload (Mandatory Midway Twist)
    this.overloadTriggered = false;
    this.overloadBannerTimer = 0;
    this.pulseTimer = 4.0;
    this.pulses = [];

    // Final Puzzle: The Last Equilibrium Sequence
    this.syncSequence = []; // tracks order of switches activated: ['A', 'B', 'C']
    this.reactorStabilized = false;

    // Timer & Scoring
    this.timeRemaining = GAME_CONSTANTS.TOTAL_TIME_SEC;
    this.attempts = GAME_CONSTANTS.INITIAL_ATTEMPTS;
    this.currentCheckpoint = 0;
    this.stats = {
      gravityFlips: 0,
      timeFreezes: 0,
      dimensionSwitches: 0,
      nodesActivated: 0
    };
    this.finalScore = 0;
    this.finalRank = 'B';

    // Visual Particles
    this.particles = [];
    this.glitchOverlay = 0;

    // Input States
    this.keys = {};

    this.initListeners();
    this.notifyState();
  }

  notifyState() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange({
        state: this.state,
        energy: Math.round(this.energy),
        timeRemaining: Math.ceil(this.timeRemaining),
        attempts: this.attempts,
        currentDim: this.currentDim,
        gd: this.p.gd,
        freezeActive: this.freezeActive,
        freezeTimer: this.freezeTimer,
        freezeCooldown: this.freezeCooldown,
        overloadTriggered: this.overloadTriggered,
        nodesActivated: this.stats.nodesActivated,
        totalNodes: 4,
        reactorStabilized: this.reactorStabilized,
        syncSequence: [...this.syncSequence],
        finalScore: this.finalScore,
        finalRank: this.finalRank,
        currentSectorName: this.getCurrentSectorName()
      });
    }
  }

  getCurrentSectorName() {
    const s = this.data.sectors.find(sec => this.p.x >= sec.startX && this.p.x < sec.endX);
    return s ? s.name : 'QUANTUM REACTOR CHAMBER';
  }

  initListeners() {
    this.handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }
      this.keys[e.code] = true;

      // Jump buffer registration
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        this.jumpBufferTimer = 0.14;
      }

      // Audio resume on first gesture
      entropyAudio.resume();

      if (e.code === 'KeyQ') this.tryReverseGravity();
      if (e.code === 'KeyE') this.tryToggleTimeFreeze();
      if (e.code === 'KeyR') this.trySwitchDimension();
      if (e.code === 'KeyF') this.tryInteract();
      if (e.code === 'Escape') this.togglePause();
    };

    this.handleKeyUp = (e) => {
      this.keys[e.code] = false;
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
    } else if (this.state === 'paused') {
      this.state = 'playing';
    }
    this.notifyState();
  }

  // --- MECHANIC 1: GRAVITY REVERSAL [Q] ---
  tryReverseGravity() {
    if (this.state !== 'playing') return;
    const cost = this.overloadTriggered ? GAME_CONSTANTS.OVERLOAD_COSTS.gravity : GAME_CONSTANTS.NORMAL_COSTS.gravity;

    if (this.energy < cost) {
      this.spawnSparks(this.p.x + 8, this.p.y + 12, PALETTE.red, 8);
      return;
    }

    this.energy = Math.max(0, this.energy - cost);
    this.p.gd *= -1; // Invert gravity direction
    this.p.vy = -60 * this.p.gd; // Soft kick-off
    this.stats.gravityFlips++;

    entropyAudio.playGravity();
    this.shake = 5;
    this.spawnSparks(this.p.x + 8, this.p.y + 12, PALETTE.purple, 16);
    this.notifyState();
  }

  // --- MECHANIC 2: TIME FREEZE [E] ---
  tryToggleTimeFreeze() {
    if (this.state !== 'playing') return;

    if (this.freezeActive) {
      // Manual cancellation of freeze
      this.freezeActive = false;
      this.freezeTimer = 0;
      entropyAudio.playTimeResume();
      this.notifyState();
      return;
    }

    if (this.freezeCooldown > 0) return;

    const cost = this.overloadTriggered ? GAME_CONSTANTS.OVERLOAD_COSTS.freeze : GAME_CONSTANTS.NORMAL_COSTS.freeze;
    if (this.energy < cost) {
      this.spawnSparks(this.p.x + 8, this.p.y + 12, PALETTE.red, 8);
      return;
    }

    this.energy = Math.max(0, this.energy - cost);
    this.freezeActive = true;
    this.freezeTimer = GAME_CONSTANTS.FREEZE_DURATION_SEC;
    this.freezeCooldown = GAME_CONSTANTS.FREEZE_COOLDOWN_SEC;
    this.stats.timeFreezes++;

    entropyAudio.playTimeFreeze();
    this.spawnSparks(this.p.x + 8, this.p.y + 12, PALETTE.cyan, 22);
    this.notifyState();
  }

  // --- MECHANIC 3: DIMENSION SWITCHING [R] ---
  trySwitchDimension() {
    if (this.state !== 'playing') return;

    // In normal mode: costs 10. In Overload mode: RESTORES 10 energy!
    const delta = this.overloadTriggered ? GAME_CONSTANTS.OVERLOAD_COSTS.dimension : GAME_CONSTANTS.NORMAL_COSTS.dimension;

    if (delta > 0 && this.energy < delta) {
      this.spawnSparks(this.p.x + 8, this.p.y + 12, PALETTE.red, 8);
      return;
    }

    const nextDim = this.currentDim === 'A' ? 'B' : 'A';

    // Safe Position Check: Ensure player won't be trapped inside newly solid geometry
    const testBox = { x: this.p.x, y: this.p.y, w: this.p.w, h: this.p.h };
    const wouldCollide = this.data.platforms.some(pl => {
      if (pl.dim === nextDim) {
        return this.boxOverlap(testBox, pl);
      }
      return false;
    });

    if (wouldCollide) {
      // Try resolving by soft nudging vertically
      let resolved = false;
      for (let offset = -8; offset <= 8; offset += 4) {
        testBox.y = this.p.y + offset;
        if (!this.data.platforms.some(pl => pl.dim === nextDim && this.boxOverlap(testBox, pl))) {
          this.p.y += offset;
          resolved = true;
          break;
        }
      }
      if (!resolved) {
        // Reject unsafe switch without penalty
        this.spawnSparks(this.p.x + 8, this.p.y + 12, PALETTE.red, 8);
        return;
      }
    }

    // Apply energy modification
    if (this.overloadTriggered) {
      this.energy = Math.min(GAME_CONSTANTS.MAX_ENERGY, this.energy + 10); // Rewards +10!
    } else {
      this.energy = Math.max(0, this.energy - delta);
    }

    this.currentDim = nextDim;
    this.stats.dimensionSwitches++;
    this.glitchOverlay = 0.25;

    entropyAudio.playDimensionSwitch();
    this.spawnSparks(this.p.x + 8, this.p.y + 12, this.currentDim === 'A' ? PALETTE.cyan : PALETTE.magenta, 20);
    this.notifyState();
  }

  // --- INTERACTION [F]: Nodes & Switches ---
  tryInteract() {
    if (this.state !== 'playing') return;

    // 1. Check Energy Nodes
    this.data.energyNodes.forEach(node => {
      if (!node.activated && Math.abs((this.p.x + 8) - (node.x + node.w / 2)) < 36 && Math.abs((this.p.y + 12) - (node.y + node.h / 2)) < 36) {
        this.activateNode(node);
      }
    });

    // 2. Check Final Equilibrium Switches
    this.data.switches.forEach(sw => {
      if (sw.id.startsWith('sw_') && !sw.activated) {
        if (Math.abs((this.p.x + 8) - (sw.x + sw.w / 2)) < 32 && Math.abs((this.p.y + 12) - (sw.y + sw.h / 2)) < 32) {
          this.activateFinalSwitch(sw);
        }
      }
    });
  }

  activateNode(node) {
    node.activated = true;
    this.energy = Math.min(GAME_CONSTANTS.MAX_ENERGY, this.energy + GAME_CONSTANTS.NORMAL_COSTS.nodeRecharge);
    this.stats.nodesActivated++;

    // Open corresponding security blast door
    const door = this.data.doors.find(d => d.requiredNode === node.id);
    if (door) door.open = true;

    // Checkpoint unlock
    this.currentCheckpoint = Math.max(this.currentCheckpoint, node.id);

    entropyAudio.playNodeActivate();
    this.shake = 6;
    this.spawnSparks(node.x + 14, node.y + 19, PALETTE.green, 30);

    // MANDATORY HALFWAY TWIST: REACTOR OVERLOAD!
    if (node.id === 2 && !this.overloadTriggered) {
      this.triggerReactorOverload();
    }

    this.notifyState();
  }

  // --- MANDATORY HALFWAY TWIST: REACTOR OVERLOAD ---
  triggerReactorOverload() {
    this.overloadTriggered = true;
    this.overloadBannerTimer = 4.5;
    this.shake = 16;
    entropyAudio.playAlarmKlaxon();
    entropyAudio.setOverloadDrone(true);

    // Visual red emergency flash
    this.glitchOverlay = 0.5;

    // Activate Overload Hazard (Time-Resistant)
    const overloadSaw = this.data.hazards.saws.find(s => s.id === 'saw_overload');
    if (overloadSaw) overloadSaw.active = true;

    this.notifyState();
  }

  // --- FINAL PUZZLE: THE LAST EQUILIBRIUM ---
  activateFinalSwitch(sw) {
    // Check specific requirement conditions
    if (sw.reqGravity && this.p.gd !== sw.reqGravity) {
      entropyAudio.playHurt();
      return;
    }
    if (sw.reqDim && this.currentDim !== sw.reqDim) {
      entropyAudio.playHurt();
      return;
    }

    sw.activated = true;
    entropyAudio.playSwitch();
    this.spawnSparks(sw.x + 10, sw.y + 10, PALETTE.orange, 15);

    const switchKey = sw.id.replace('sw_', '').toUpperCase(); // 'A', 'B', or 'C'
    this.syncSequence.push(switchKey);

    // Validate correct sequence: A -> B -> C
    const expected = ['A', 'B', 'C'].slice(0, this.syncSequence.length);
    const isCorrectSoFar = this.syncSequence.every((val, idx) => val === expected[idx]);

    if (!isCorrectSoFar) {
      // Sequence error: Reset all three switches softly without resetting level
      entropyAudio.playHurt();
      this.shake = 4;
      this.syncSequence = [];
      this.data.switches.filter(s => s.id.startsWith('sw_')).forEach(s => s.activated = false);
    } else if (this.syncSequence.length === 3) {
      // All 3 synchronized in perfect order!
      this.reactorStabilized = true;
      const exitDoor = this.data.doors.find(d => d.id === 'door_exit');
      if (exitDoor) exitDoor.open = true;

      entropyAudio.playVictory();
      this.shake = 12;
      this.spawnSparks(2450, 200, PALETTE.green, 60);
    }

    this.notifyState();
  }

  // --- DAMAGE & RESPAWN (Always Restart from Start Point) ---
  damagePlayer(reason = 'HAZARD CONTACT') {
    if (this.p.invulnTimer > 0) return;

    this.p.invulnTimer = 1.2;
    this.attempts--;
    entropyAudio.playHurt();
    this.shake = 10;
    this.spawnSparks(this.p.x + 8, this.p.y + 12, PALETTE.red, 25);

    if (this.attempts <= 0) {
      this.state = 'failed';
      this.notifyState();
      return;
    }

    // Always restart/respawn at the START POINT (Airlock 01) per requirement
    const startPt = this.data.checkpoints[0];
    this.p.x = startPt.x;
    this.p.y = startPt.y;
    this.p.vx = 0;
    this.p.vy = 0;
    this.p.gd = 1;
    this.camX = 0;
    this.energy = GAME_CONSTANTS.MAX_ENERGY; // Energy restored on respawn to prevent softlock
    this.notifyState();
  }

  // --- RESTART FROM START POINT (Full Reset) ---
  restartFromStart() {
    this.data = createChamberData();
    this.state = 'playing';
    const startPt = this.data.checkpoints[0];
    this.p.x = startPt.x;
    this.p.y = startPt.y;
    this.p.vx = 0;
    this.p.vy = 0;
    this.p.gd = 1;
    this.p.invulnTimer = 0;
    this.p.isPushing = false;
    this.camX = 0;
    this.camY = 0;
    this.shake = 0;
    this.currentDim = 'A';
    this.energy = GAME_CONSTANTS.STARTING_ENERGY;
    this.freezeActive = false;
    this.freezeTimer = 0;
    this.freezeCooldown = 0;
    this.overloadTriggered = false;
    this.overloadBannerTimer = 0;
    this.syncSequence = [];
    this.reactorStabilized = false;
    this.timeRemaining = GAME_CONSTANTS.TOTAL_TIME_SEC;
    this.attempts = GAME_CONSTANTS.INITIAL_ATTEMPTS;
    this.currentCheckpoint = 0;
    this.stats = {
      gravityFlips: 0,
      timeFreezes: 0,
      dimensionSwitches: 0,
      nodesActivated: 0
    };
    this.finalScore = 0;
    this.finalRank = 'B';
    this.particles = [];
    this.glitchOverlay = 0;
    this.notifyState();
  }

  // --- VICTORY COMPLETION ---
  triggerVictory() {
    this.state = 'victory';
    entropyAudio.playVictory();

    // Calculate score using Master Development Prompt Formula
    const timeBonus = Math.max(0, Math.floor(this.timeRemaining)) * GAME_CONSTANTS.TIME_BONUS_MULT;
    const energyBonus = Math.floor(this.energy) * GAME_CONSTANTS.ENERGY_BONUS_MULT;
    const attemptBonus = this.attempts * GAME_CONSTANTS.ATTEMPT_BONUS_MULT;
    const penalties = (this.stats.gravityFlips + this.stats.timeFreezes + this.stats.dimensionSwitches) * GAME_CONSTANTS.PENALTY_MULT;

    this.finalScore = Math.max(0, GAME_CONSTANTS.BASE_SCORE + timeBonus + energyBonus + attemptBonus - penalties);

    if (this.finalScore >= GAME_CONSTANTS.RANK_S) this.finalRank = 'S';
    else if (this.finalScore >= GAME_CONSTANTS.RANK_A) this.finalRank = 'A';
    else if (this.finalScore >= GAME_CONSTANTS.RANK_B) this.finalRank = 'B';
    else this.finalRank = 'C';

    this.notifyState();
  }

  // --- CORE UPDATE LOOP (60 FPS) ---
  update(dt = 1 / 60) {
    if (this.state !== 'playing') return;

    this.animTime += dt;

    // Timer countdown
    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.damagePlayer('TIME EXPIRED');
      return;
    }

    // Freeze Timers
    if (this.freezeActive) {
      this.freezeTimer -= dt;
      if (this.freezeTimer <= 0) {
        this.freezeActive = false;
        this.freezeTimer = 0;
        entropyAudio.playTimeResume();
      }
    }
    if (this.freezeCooldown > 0) {
      this.freezeCooldown -= dt;
    }

    // Overload Banner Timer
    if (this.overloadBannerTimer > 0) {
      this.overloadBannerTimer -= dt;
    }

    // Invulnerability timer
    if (this.p.invulnTimer > 0) {
      this.p.invulnTimer -= dt;
    }

    // Screen Shake decay
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 20);
    }
    if (this.glitchOverlay > 0) {
      this.glitchOverlay = Math.max(0, this.glitchOverlay - dt);
    }

    // --- PLAYER MOVEMENT & PHYSICS ---
    const p = this.p;
    const moveLeft = this.keys['KeyA'] || this.keys['ArrowLeft'];
    const moveRight = this.keys['KeyD'] || this.keys['ArrowRight'];
    const jump = this.keys['Space'] || this.keys['KeyW'] || this.keys['ArrowUp'];

    // Horizontal Acceleration
    const targetVx = (moveRight ? 160 : 0) - (moveLeft ? 160 : 0);
    p.vx += (targetVx - p.vx) * (p.onGround ? 0.28 : 0.16);
    if (Math.abs(p.vx) > 5) p.facing = Math.sign(p.vx);

    // Gravity Acceleration (Gravity-aware: gd = 1 falls down, gd = -1 falls up)
    const gravityForce = 620 * p.gd;
    p.vy += gravityForce * dt;
    p.vy = Math.max(-420, Math.min(420, p.vy));

    // Coyote time & Jump buffer timers
    if (p.onGround) {
      this.coyoteTimer = 0.12;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // Jump Impulse (Gravity-aware with coyote time & jump buffering)
    const wantsJump = jump || this.jumpBufferTimer > 0;
    if (wantsJump && (p.onGround || this.coyoteTimer > 0)) {
      p.vy = -300 * p.gd; // Pushes toward ceiling when gd = 1, pushes toward floor when gd = -1
      p.onGround = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      entropyAudio.playJump();
      this.spawnSparks(p.x + 8, p.y + (p.gd > 0 ? 24 : 0), PALETTE.cyan, 6);
    }

    // Variable jump height cut if released early
    if (!jump && ((p.gd > 0 && p.vy < -100) || (p.gd < 0 && p.vy > 100))) {
      p.vy *= 0.55;
    }

    // Move X & Resolve Collisions + Push Crates
    this.movePlayerX(p.vx * dt);

    // Move Y & Resolve Collisions
    p.onGround = false;
    this.movePlayerY(p.vy * dt);

    // --- MOVING PLATFORMS & PASSENGER CARRY ---
    this.data.movingPlatforms.forEach(mp => {
      if (this.freezeActive && !mp.timeResistant) return;

      const prevX = mp.x;
      const prevY = mp.y;

      if (mp.startX !== mp.endX) {
        mp.x += mp.dir * mp.speed * dt;
        if (mp.x >= mp.endX) { mp.x = mp.endX; mp.dir = -1; }
        else if (mp.x <= mp.startX) { mp.x = mp.startX; mp.dir = 1; }
      }
      if (mp.startY !== mp.endY) {
        mp.y += mp.dir * mp.speed * dt;
        if (mp.y >= mp.endY) { mp.y = mp.endY; mp.dir = -1; }
        else if (mp.y <= mp.startY) { mp.y = mp.startY; mp.dir = 1; }
      }

      const dx = mp.x - prevX;
      const dy = mp.y - prevY;

      // Check if player is standing on this moving platform
      const onThis = (p.gd > 0 && Math.abs((p.y + p.h) - mp.y) < 4 && p.x + p.w > mp.x && p.x < mp.x + mp.w)
        || (p.gd < 0 && Math.abs(p.y - (mp.y + mp.h)) < 4 && p.x + p.w > mp.x && p.x < mp.x + mp.w);

      if (onThis) {
        p.x += dx;
        p.y += dy;
        p.onGround = true;
      }
    });

    // --- COLLAPSING PLATFORMS ---
    this.data.collapsingPlatforms.forEach(cp => {
      if (cp.fallen) {
        cp.respawnT -= dt;
        if (cp.respawnT <= 0) cp.fallen = false;
        return;
      }

      const stoodOn = p.x + p.w > cp.x && p.x < cp.x + cp.w && Math.abs((p.y + p.h) - cp.y) < 4;
      if (stoodOn) {
        cp.timer -= dt;
        if (cp.timer <= 0) {
          cp.fallen = true;
          cp.timer = 1.2;
          cp.respawnT = 3.5;
          this.spawnSparks(cp.x + cp.w / 2, cp.y + cp.h / 2, PALETTE.orange, 15);
        }
      }
    });

    // --- CRATES GRAVITY & PHYSICS ---
    this.data.crates.forEach(c => {
      if (this.freezeActive) return;

      // Crate gravity
      c.vy += 500 * dt;
      c.y += c.vy * dt;

      // Check crate collision with floor/platforms
      this.data.platforms.forEach(pl => {
        if (pl.dim === 'neutral' || pl.dim === this.currentDim) {
          if (this.boxOverlap(c, pl)) {
            if (c.vy > 0) {
              c.y = pl.y - c.h;
              c.vy = 0;
              c.onGround = true;
            }
          }
        }
      });

      // Check Pressure Switch
      const pSw = this.data.switches.find(s => s.id === 'sw_crate');
      if (pSw) {
        if (this.boxOverlap(c, pSw)) {
          pSw.pressed = true;
          const target = this.data.doors.find(d => d.id === pSw.targetDoor);
          if (target) target.open = true;
        }
      }
    });

    // --- HAZARDS COLLISION & LOGIC ---
    this.updateHazards(dt);

    // --- REACTOR ENTROPY PULSES (Overload Mode) ---
    if (this.overloadTriggered) {
      this.pulseTimer -= dt;
      if (this.pulseTimer <= 0) {
        this.pulseTimer = 6.0;
        this.pulses.push({ x: 2450, y: 240, r: 10, maxR: 450, speed: 180 });
        entropyAudio.playReactorPulse();
        this.shake = 5;
      }
    }

    // Update active pulses
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const pl = this.pulses[i];
      pl.r += pl.speed * dt;
      if (pl.r >= pl.maxR) {
        this.pulses.splice(i, 1);
        continue;
      }
      // Check collision with player
      const dist = Math.hypot((p.x + 8) - pl.x, (p.y + 12) - pl.y);
      if (Math.abs(dist - pl.r) < 18) {
        this.damagePlayer('REACTOR PULSE');
      }
    }

    // --- EXIT PORTAL TRIGGER ---
    if (this.reactorStabilized) {
      const exit = this.data.doors.find(d => d.id === 'door_exit');
      if (exit && p.x + p.w >= exit.x) {
        this.triggerVictory();
        return;
      }
    }

    // Update camera smooth follow
    const targetCamX = Math.max(0, Math.min(this.data.width - GAME_CONSTANTS.VIEW_WIDTH, p.x - GAME_CONSTANTS.VIEW_WIDTH * 0.45));
    this.camX += (targetCamX - this.camX) * 0.12;

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
  }

  // --- COLLISION RESOLUTION (X AXIS) ---
  movePlayerX(dx) {
    const p = this.p;
    p.x += dx;
    p.isPushing = false;

    // Check Solid Crates
    this.data.crates.forEach(c => {
      if (c.dim === 'neutral' || c.dim === this.currentDim) {
        if (this.boxOverlap(p, c)) {
          p.isPushing = true;
          if (dx > 0) {
            c.x = p.x + p.w;
            // Push crate right if clear
            if (this.canCrateMove(c, dx)) c.x += dx * 0.5;
            else p.x = c.x - p.w;
          } else if (dx < 0) {
            c.x = p.x - c.w;
            // Push crate left if clear
            if (this.canCrateMove(c, dx)) c.x += dx * 0.5;
            else p.x = c.x + c.w;
          }
        }
      }
    });

    // Check Platforms & Closed Doors
    this.getSolidBoxes().forEach(box => {
      if (this.boxOverlap(p, box)) {
        if (dx > 0) p.x = box.x - p.w;
        else if (dx < 0) p.x = box.x + box.w;
        p.vx = 0;
      }
    });
  }

  // --- COLLISION RESOLUTION (Y AXIS) ---
  movePlayerY(dy) {
    const p = this.p;
    p.y += dy;

    // Check Crates
    this.data.crates.forEach(c => {
      if (c.dim === 'neutral' || c.dim === this.currentDim) {
        if (this.boxOverlap(p, c)) {
          if (p.gd > 0 && dy > 0) {
            p.y = c.y - p.h;
            p.vy = 0;
            p.onGround = true;
          } else if (p.gd < 0 && dy < 0) {
            p.y = c.y + c.h;
            p.vy = 0;
            p.onGround = true;
          }
        }
      }
    });

    // Check Platforms
    this.getSolidBoxes().forEach(box => {
      if (this.boxOverlap(p, box)) {
        if (p.gd > 0) {
          if (dy > 0) {
            p.y = box.y - p.h;
            p.vy = 0;
            p.onGround = true;
          } else if (dy < 0) {
            p.y = box.y + box.h;
            p.vy = 0;
          }
        } else {
          // Inverted Gravity
          if (dy < 0) {
            p.y = box.y + box.h;
            p.vy = 0;
            p.onGround = true;
          } else if (dy > 0) {
            p.y = box.y - p.h;
            p.vy = 0;
          }
        }
      }
    });
  }

  canCrateMove(crate, dx) {
    const test = { x: crate.x + dx, y: crate.y, w: crate.w, h: crate.h };
    return !this.getSolidBoxes().some(box => this.boxOverlap(test, box));
  }

  getSolidBoxes() {
    const list = [];

    // Static platforms matching dimension
    this.data.platforms.forEach(pl => {
      if (pl.dim === 'neutral' || pl.dim === this.currentDim) {
        list.push(pl);
      }
    });

    // Moving platforms
    this.data.movingPlatforms.forEach(mp => {
      if (mp.dim === 'neutral' || mp.dim === this.currentDim) {
        list.push(mp);
      }
    });

    // Collapsing platforms (if not fallen)
    this.data.collapsingPlatforms.forEach(cp => {
      if (!cp.fallen) list.push(cp);
    });

    // Closed blast doors
    this.data.doors.forEach(d => {
      if (!d.open) list.push(d);
    });

    return list;
  }

  boxOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // --- HAZARDS UPDATE ---
  updateHazards(dt) {
    const p = this.p;

    // 1. Saw Blades
    this.data.hazards.saws.forEach(saw => {
      if (!this.freezeActive || saw.timeResistant) {
        saw.x += saw.dir * saw.speed * dt;
        if (saw.x >= saw.endX) { saw.x = saw.endX; saw.dir = -1; }
        else if (saw.x <= saw.startX) { saw.x = saw.startX; saw.dir = 1; }
        saw.angle += 8 * dt;
      }

      // Check collision
      const dist = Math.hypot((p.x + 8) - saw.x, (p.y + 12) - saw.y);
      if (dist < saw.r + 7) {
        this.damagePlayer('SAW BLADE CONTACT');
      }
    });

    // 2. Lasers
    this.data.hazards.lasers.forEach(lz => {
      if (lz.dim !== 'neutral' && lz.dim !== this.currentDim) return;

      if (lz.rotSpeed) {
        if (!this.freezeActive || lz.timeResistant) {
          lz.angle += lz.rotSpeed * dt;
        }
        const lx2 = lz.cx + Math.cos(lz.angle) * lz.length;
        const ly2 = lz.cy + Math.sin(lz.angle) * lz.length;
        if (this.lineBoxIntersect(lz.cx, lz.cy, lx2, ly2, p)) {
          this.damagePlayer('ROTATING LASER');
        }
      } else if (lz.active) {
        if (this.lineBoxIntersect(lz.x1, lz.y1, lz.x2, lz.y2, p)) {
          this.damagePlayer('LASER GRID');
        }
      }
    });

    // 3. Entropy Fields (Drain 30 energy)
    this.data.hazards.entropyFields.forEach(ef => {
      ef.pulseT += dt;
      if (this.boxOverlap(p, ef) && p.invulnTimer <= 0) {
        p.invulnTimer = 1.0;
        this.energy = Math.max(0, this.energy - GAME_CONSTANTS.NORMAL_COSTS.entropyDrain);
        entropyAudio.playHurt();
        this.shake = 7;
        this.spawnSparks(p.x + 8, p.y + 12, PALETTE.purple, 18);
        this.notifyState();
      }
    });
  }

  lineBoxIntersect(x1, y1, x2, y2, box) {
    const bx1 = box.x, by1 = box.y, bx2 = box.x + box.w, by2 = box.y + box.h;
    // Fast bounding box rejection
    if (Math.max(x1, x2) < bx1 || Math.min(x1, x2) > bx2 || Math.max(y1, y2) < by1 || Math.min(y1, y2) > by2) {
      return false;
    }
    return true;
  }

  spawnSparks(x, y, color = PALETTE.cyan, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 110;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.25 + Math.random() * 0.35,
        color
      });
    }
  }

  // --- RENDER PASS (PIXEL-ART SCI-FI CYBERPUNK LABORATORY) ---
  render() {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, cw, ch);

    // Apply Screen Shake
    if (this.shake > 0) {
      const sx = (Math.random() - 0.5) * this.shake;
      const sy = (Math.random() - 0.5) * this.shake;
      ctx.translate(sx, sy);
    }

    // Camera Translation
    ctx.translate(-Math.floor(this.camX), -Math.floor(this.camY));

    // 1. Layered Background (Deep Navy #0B0F1A with Parallax Pipes & Circuitry)
    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(this.camX, 0, GAME_CONSTANTS.VIEW_WIDTH, GAME_CONSTANTS.VIEW_HEIGHT);

    // Background Industrial Circuitry Grid
    ctx.strokeStyle = this.overloadTriggered ? 'rgba(255, 59, 77, 0.08)' : 'rgba(0, 229, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = Math.floor(this.camX / 48) * 48; x < this.camX + GAME_CONSTANTS.VIEW_WIDTH; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 500);
      ctx.stroke();
    }
    for (let y = 0; y < 500; y += 48) {
      ctx.beginPath();
      ctx.moveTo(this.camX, y);
      ctx.lineTo(this.camX + GAME_CONSTANTS.VIEW_WIDTH, y);
      ctx.stroke();
    }

    // 2. Central Reactor Glowing Core Backdrop (at x: 2450)
    const reactorGrad = ctx.createRadialGradient(2450, 240, 20, 2450, 240, 320);
    reactorGrad.addColorStop(0, this.reactorStabilized ? 'rgba(50, 230, 161, 0.6)' : this.overloadTriggered ? 'rgba(255, 59, 77, 0.5)' : 'rgba(255, 165, 0, 0.4)');
    reactorGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = reactorGrad;
    ctx.fillRect(2130, 0, 640, 500);

    // Multi-Room Architectural Sector Dividers (Cross-Section Facility Look)
    this.drawSectorArchitecture(ctx);

    // 3. Render Platforms
    this.data.platforms.forEach(pl => {
      const isSolid = pl.dim === 'neutral' || pl.dim === this.currentDim;

      if (pl.dim === 'neutral') {
        ctx.fillStyle = PALETTE.metallic;
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        ctx.strokeStyle = this.overloadTriggered ? 'rgba(255, 59, 77, 0.5)' : PALETTE.metallicBorder;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
      } else if (pl.dim === 'A') {
        // Dimension A (Cyan)
        ctx.fillStyle = isSolid ? PALETTE.cyanDim : 'rgba(0, 229, 255, 0.06)';
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        ctx.strokeStyle = isSolid ? PALETTE.cyan : 'rgba(0, 229, 255, 0.2)';
        ctx.lineWidth = isSolid ? 2 : 1;
        ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
      } else if (pl.dim === 'B') {
        // Dimension B (Magenta)
        ctx.fillStyle = isSolid ? PALETTE.magentaDim : 'rgba(255, 0, 212, 0.06)';
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        ctx.strokeStyle = isSolid ? PALETTE.magenta : 'rgba(255, 0, 212, 0.2)';
        ctx.lineWidth = isSolid ? 2 : 1;
        ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
      }
    });

    // 4. Moving Platforms
    this.data.movingPlatforms.forEach(mp => {
      ctx.fillStyle = this.freezeActive ? '#9af0ff' : PALETTE.metallicLight;
      ctx.fillRect(mp.x, mp.y, mp.w, mp.h);
      ctx.strokeStyle = this.freezeActive ? PALETTE.cyan : '#60a5fa';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(mp.x, mp.y, mp.w, mp.h);

      if (this.freezeActive) {
        ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.fillRect(mp.x, mp.y, mp.w, mp.h);
      }
    });

    // 5. Collapsing Platforms
    this.data.collapsingPlatforms.forEach(cp => {
      if (cp.fallen) return;
      ctx.fillStyle = cp.timer < 0.6 ? '#f87171' : '#f59e0b';
      ctx.fillRect(cp.x, cp.y, cp.w, cp.h);
      ctx.strokeStyle = '#b45309';
      ctx.strokeRect(cp.x, cp.y, cp.w, cp.h);
    });

    // 6. Security Blast Doors (Generic intermediate gates)
    this.data.doors.forEach(d => {
      if (d.open || d.id === 'door_exit') return;
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(d.x, d.y, d.w, d.h);
      ctx.strokeStyle = '#f87171';
      ctx.strokeRect(d.x, d.y, d.w, d.h);
      // Hazard diagonal warning stripes
      ctx.fillStyle = '#facc15';
      for (let y = d.y + 4; y < d.y + d.h - 4; y += 12) {
        ctx.fillRect(d.x + 3, y, d.w - 6, 4);
      }
    });

    // 7. Dedicated Proper Start Airlock & Exit Reality Breach Gate
    this.drawStartAirlock(ctx);
    this.drawExitPortal(ctx);

    // 8. Movable Crates
    this.data.crates.forEach(c => {
      const isSolid = c.dim === 'neutral' || c.dim === this.currentDim;
      ctx.fillStyle = isSolid ? '#475569' : 'rgba(71, 85, 105, 0.2)';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = isSolid ? '#94a3b8' : 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x, c.y, c.w, c.h);
      // Cross braces
      ctx.beginPath();
      ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + c.w, c.y + c.h);
      ctx.moveTo(c.x + c.w, c.y); ctx.lineTo(c.x, c.y + c.h);
      ctx.stroke();
    });

    // 9. Switches & Pressure Plates
    this.data.switches.forEach(sw => {
      if (sw.id === 'sw_crate') {
        ctx.fillStyle = sw.pressed ? PALETTE.green : PALETTE.red;
        ctx.fillRect(sw.x, sw.y, sw.w, sw.h);
      } else {
        // Switches A, B, C
        ctx.fillStyle = sw.activated ? PALETTE.green : PALETTE.orange;
        ctx.fillRect(sw.x, sw.y, sw.w, sw.h);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(sw.x, sw.y, sw.w, sw.h);
      }
    });

    // 10. Energy Nodes
    this.data.energyNodes.forEach(node => {
      ctx.fillStyle = node.activated ? 'rgba(50, 230, 161, 0.4)' : PALETTE.orangeGlow;
      ctx.beginPath();
      ctx.arc(node.x + 14, node.y + 19, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = node.activated ? PALETTE.green : PALETTE.orange;
      ctx.fillRect(node.x + 4, node.y + 4, node.w - 8, node.h - 8);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(node.x + 4, node.y + 4, node.w - 8, node.h - 8);
    });

    // 11. Hazards (Saws, Lasers, Entropy Fields)
    // Saws
    this.data.hazards.saws.forEach(saw => {
      ctx.save();
      ctx.translate(saw.x, saw.y);
      ctx.rotate(saw.angle);
      ctx.fillStyle = saw.timeResistant ? PALETTE.red : '#cbd5e1';
      ctx.beginPath();
      ctx.arc(0, 0, saw.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.stroke();
      // Teeth
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.fillRect(Math.cos(a) * (saw.r - 2), Math.sin(a) * (saw.r - 2), 4, 4);
      }
      ctx.restore();
    });

    // Lasers
    this.data.hazards.lasers.forEach(lz => {
      if (lz.dim !== 'neutral' && lz.dim !== this.currentDim) return;
      ctx.strokeStyle = lz.timeResistant ? PALETTE.red : PALETTE.cyan;
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (lz.rotSpeed) {
        ctx.moveTo(lz.cx, lz.cy);
        ctx.lineTo(lz.cx + Math.cos(lz.angle) * lz.length, lz.cy + Math.sin(lz.angle) * lz.length);
      } else {
        ctx.moveTo(lz.x1, lz.y1);
        ctx.lineTo(lz.x2, lz.y2);
      }
      ctx.stroke();
    });

    // Entropy Fields
    this.data.hazards.entropyFields.forEach(ef => {
      ctx.fillStyle = 'rgba(106, 0, 255, 0.35)';
      ctx.fillRect(ef.x, ef.y, ef.w, ef.h);
      ctx.strokeStyle = PALETTE.purple;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ef.x, ef.y, ef.w, ef.h);
    });

    // 12. Reactor Entropy Pulses
    this.pulses.forEach(pl => {
      ctx.strokeStyle = this.overloadTriggered ? 'rgba(255, 59, 77, 0.7)' : 'rgba(255, 165, 0, 0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 13. Particles
    this.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, 2.5, 2.5);
    });

    // 14. Player Character
    const p = this.p;
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    if (p.gd < 0) ctx.scale(1, -1); // Flip upside-down when gravity is reversed!
    if (p.facing < 0) ctx.scale(-1, 1);

    if (p.invulnTimer > 0 && Math.floor(p.invulnTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Player Cyber Suit Body (Pixel Art Representation)
    ctx.fillStyle = '#0284c7'; // Cyan Cyber suit
    ctx.fillRect(-p.w / 2, -p.h / 2 + 8, p.w, p.h - 8);

    // Head & Hair
    ctx.fillStyle = '#d97706'; // Brown hair
    ctx.fillRect(-p.w / 2 + 2, -p.h / 2, p.w - 4, 8);

    // Visor / Eyes
    ctx.fillStyle = PALETTE.cyan;
    ctx.fillRect(1, -p.h / 2 + 3, 5, 2.5);

    // Core Energy Pack on back
    ctx.fillStyle = this.currentDim === 'A' ? PALETTE.cyan : PALETTE.magenta;
    ctx.fillRect(-p.w / 2 - 2, -p.h / 2 + 10, 3, 8);

    ctx.restore();

    // 15. Glitch / Overload Chromatic Overlay
    if (this.glitchOverlay > 0) {
      ctx.fillStyle = this.overloadTriggered ? `rgba(255, 0, 0, ${this.glitchOverlay * 0.4})` : `rgba(0, 229, 255, ${this.glitchOverlay * 0.3})`;
      ctx.fillRect(this.camX, 0, GAME_CONSTANTS.VIEW_WIDTH, GAME_CONSTANTS.VIEW_HEIGHT);
    }

    ctx.restore();
  }

  // --- MULTI-ROOM SECTOR ARCHITECTURE (Inspired by multi-tier facility design) ---
  drawSectorArchitecture(ctx) {
    const dividers = [
      { x: 500, label: 'SEC-02 // TEMPORAL BAY', color: '#38bdf8' },
      { x: 1090, label: 'SEC-03 // QUANTUM RIFT', color: '#ec4899' },
      { x: 1714, label: 'SEC-04 // ENTROPY GAUNTLET', color: '#f59e0b' },
      { x: 2200, label: 'SEC-05 // REACTOR CORE', color: '#10b981' }
    ];

    dividers.forEach(div => {
      // Background structural vertical girder
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.fillRect(div.x - 4, 28, 8, 380);

      // Warning vertical girder lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(div.x - 4, 28);
      ctx.lineTo(div.x - 4, 408);
      ctx.moveTo(div.x + 4, 28);
      ctx.lineTo(div.x + 4, 408);
      ctx.stroke();

      // Overhead Sector Placard
      ctx.fillStyle = '#0b1120';
      ctx.fillRect(div.x - 60, 34, 120, 16);
      ctx.strokeStyle = div.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(div.x - 60, 34, 120, 16);

      ctx.fillStyle = div.color;
      ctx.font = 'bold 7.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(div.label, div.x, 45);
    });
  }

  // --- PROPER START AIRLOCK GATEWAY ---
  drawStartAirlock(ctx) {
    const sa = this.data.startAirlock;
    if (!sa) return;

    // Heavy reinforced airlock frame
    ctx.fillStyle = '#0b1329';
    ctx.fillRect(sa.x - 8, sa.y - 14, sa.w + 16, sa.h + 14);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(sa.x - 8, sa.y - 14, sa.w + 16, sa.h + 14);

    // Inner Doorway Tunnel Depth
    const grad = ctx.createLinearGradient(sa.x, sa.y, sa.x + sa.w, sa.y);
    grad.addColorStop(0, '#022c22');
    grad.addColorStop(0.5, '#064e3b');
    grad.addColorStop(1, '#0b1329');
    ctx.fillStyle = grad;
    ctx.fillRect(sa.x, sa.y, sa.w, sa.h);

    // Cyan / Green Energy Barrier Slats
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
    ctx.lineWidth = 1.5;
    for (let ey = sa.y + 12; ey < sa.y + sa.h - 6; ey += 16) {
      ctx.beginPath();
      ctx.moveTo(sa.x + 4, ey);
      ctx.lineTo(sa.x + sa.w - 4, ey);
      ctx.stroke();
    }

    // Top Mounted Flashing Beacon Lamp
    const beaconPulse = Math.sin(this.animTime * 6) * 0.35 + 0.65;
    ctx.fillStyle = `rgba(34, 197, 94, ${beaconPulse})`;
    ctx.beginPath();
    ctx.arc(sa.x + sa.w / 2, sa.y - 7, 5, 0, Math.PI * 2);
    ctx.fill();

    // Signboard Above Airlock
    ctx.fillStyle = '#022c22';
    ctx.fillRect(sa.x - 14, sa.y - 30, sa.w + 28, 16);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.strokeRect(sa.x - 14, sa.y - 30, sa.w + 28, 16);

    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ENTRY // AIRLOCK 01', sa.x + sa.w / 2, sa.y - 19);

    // Directional Start Arrow
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('START ➔', sa.x + sa.w / 2, sa.y + sa.h - 10);

    // Hazard Stripes Threshold at Base
    for (let hx = sa.x; hx < sa.x + sa.w; hx += 8) {
      ctx.fillStyle = (Math.floor(hx / 8) % 2 === 0) ? '#eab308' : '#000000';
      ctx.fillRect(hx, sa.y + sa.h - 4, 8, 4);
    }
  }

  // --- PROPER EXIT REALITY BREACH GATE ---
  drawExitPortal(ctx) {
    const ep = this.data.exitPortal;
    if (!ep) return;

    // Outer Massive Titanium Arch
    ctx.fillStyle = '#090d16';
    ctx.fillRect(ep.x - 10, ep.y - 16, ep.w + 20, ep.h + 16);
    ctx.strokeStyle = this.reactorStabilized ? '#00e5ff' : '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(ep.x - 10, ep.y - 16, ep.w + 20, ep.h + 16);

    if (!this.reactorStabilized) {
      // --- LOCKED STATE ---
      // Heavy Sealed Red Blast Shutters
      ctx.fillStyle = '#18070b';
      ctx.fillRect(ep.x, ep.y, ep.w, ep.h);

      // Security Laser Grid & Cross Braces
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 2;
      for (let ly = ep.y + 12; ly < ep.y + ep.h - 8; ly += 16) {
        ctx.beginPath();
        ctx.moveTo(ep.x + 4, ly);
        ctx.lineTo(ep.x + ep.w - 4, ly);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(ep.x, ep.y);
      ctx.lineTo(ep.x + ep.w, ep.y + ep.h);
      ctx.moveTo(ep.x + ep.w, ep.y);
      ctx.lineTo(ep.x + ep.w, ep.y + ep.h);
      ctx.stroke();

      // Flashing Red Alarm Beacon on Top
      const redGlow = Math.sin(this.animTime * 8) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(239, 68, 68, ${redGlow})`;
      ctx.beginPath();
      ctx.arc(ep.x + ep.w / 2, ep.y - 8, 6, 0, Math.PI * 2);
      ctx.fill();

      // Signboard: LOCKED
      ctx.fillStyle = '#1e0508';
      ctx.fillRect(ep.x - 18, ep.y - 32, ep.w + 36, 16);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.strokeRect(ep.x - 18, ep.y - 32, ep.w + 36, 16);

      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('EXIT // CONTAINMENT LOCKED', ep.x + ep.w / 2, ep.y - 21);

      // Center Status Prompt
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('STABILIZE CORES', ep.x + ep.w / 2, ep.y + ep.h / 2);
    } else {
      // --- OPEN / UNLOCKED STATE (Reality Singularity Vortex) ---
      // Inner Deep Cosmic Void
      ctx.fillStyle = '#020617';
      ctx.fillRect(ep.x, ep.y, ep.w, ep.h);

      // Animated Swirling Vortex Rings
      const cx = ep.x + ep.w / 2;
      const cy = ep.y + ep.h / 2;
      const vortexAngle = this.animTime * 4;

      for (let r = 42; r > 10; r -= 10) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(vortexAngle * (r % 20 === 0 ? 1 : -1) + r);
        ctx.strokeStyle = r > 22 ? 'rgba(0, 229, 255, 0.9)' : 'rgba(255, 0, 212, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Central Radiant White Singularity
      const corePulse = Math.sin(this.animTime * 10) * 3 + 12;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, corePulse, 0, Math.PI * 2);
      ctx.fill();

      // Top Flashing Emerald Beacon
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(cx, ep.y - 8, 6, 0, Math.PI * 2);
      ctx.fill();

      // Signboard: REALITY BREACH OPEN
      ctx.fillStyle = '#042f2e';
      ctx.fillRect(ep.x - 22, ep.y - 32, ep.w + 44, 16);
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 1;
      ctx.strokeRect(ep.x - 22, ep.y - 32, ep.w + 44, 16);

      ctx.fillStyle = '#5eead4';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('EXIT // BREACH OPEN ➔', cx, ep.y - 21);

      // Pulsing Directional Indicator
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('ENTER ➔', cx, ep.y + ep.h - 12);
    }
  }
}
