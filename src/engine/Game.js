// ============================================================
// ENTROPY ENGINE — Main Game Engine & Controller
// ============================================================
import { W, H, TS, C, COST, FREEZE_DURATION, FREEZE_COOLDOWN, GAME_TIMER, ATTEMPTS_MAX } from './constants.js';
import { GRID, COLS, ROWS, WORLD_W, WORLD_H, SPAWN, DEFS } from './level.js';
import {
  MovingPlatform, SawBlade, LaserBeam, Crate, PressureSwitch,
  EnergyNode, ReactorNode, SyncSwitch, Checkpoint, CollapsingPlatform,
  ReactorPulse, Particle, burst, rectOverlap, overlapsWorld
} from './World.js';
import { Player } from './Player.js';
import { Renderer } from './Renderer.js';
import { Audio } from './Audio.js';
import { Input } from './Input.js';

export class Game {
  constructor(canvas) {
    this.canvas    = canvas;
    this.W         = W;
    this.H         = H;
    this.renderer  = new Renderer(canvas);

    this.state     = 'MAIN_MENU'; // 'MAIN_MENU'|'HOW_TO_PLAY'|'PLAYING'|'PAUSED'|'OVERLOAD_CINEMATIC'|'GAME_OVER'|'VICTORY'
    this.menuSel   = 0;
    this.pauseSel  = 0;

    this.t         = 0;
    this.timer     = GAME_TIMER;
    this.attempts  = ATTEMPTS_MAX;
    this.energy    = 100;
    this.dim       = 'A';
    this.overloaded= false;
    this.overloadT = 0;

    this.freezeActive   = false;
    this.freezeTimer    = 0;
    this.freezeCooldown = 0;

    this.shake     = 0;
    this.camX      = 0;
    this.camY      = 0;

    this.syncActivated      = [false, false, false];
    this.exitUnlocked       = false;
    this.currentSectorName  = DEFS.sectors[0].name;

    this.player             = null;
    this.platforms          = [];
    this.saws               = [];
    this.lasers             = [];
    this.crates             = [];
    this.pressureSwitches   = [];
    this.energyNodes        = [];
    this.reactorNodes       = [];
    this.syncSwitches       = [];
    this.checkpoints        = [];
    this.collapsingPlatforms= [];
    this.reactorPulses      = [];
    this.particles          = [];
    this.pulseTimer         = 0;

    this._lastFrameTime     = 0;
    this.running            = false;

    this._initEntities();
  }

  _initEntities() {
    this.player = new Player(SPAWN.x, SPAWN.y);

    this.platforms = DEFS.movingPlatforms.map(d => new MovingPlatform(d));
    this.saws = DEFS.saws.map(d => new SawBlade(d));
    this.lasers = DEFS.lasers.map(d => new LaserBeam(d));
    this.crates = DEFS.crates.map(d => new Crate(d));
    this.pressureSwitches = DEFS.pressureSwitches.map(d => new PressureSwitch(d));
    this.energyNodes = DEFS.energyNodes.map(d => new EnergyNode(d));
    this.reactorNodes = DEFS.reactorNodes.map(d => new ReactorNode(d));
    this.syncSwitches = DEFS.syncSwitches.map(d => new SyncSwitch(d));
    this.checkpoints = DEFS.checkpoints.map(d => new Checkpoint(d));
    this.collapsingPlatforms = DEFS.collapsingPlatforms.map(d => new CollapsingPlatform(d));
    this.reactorPulses = [];
    this.particles = [];
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._lastFrameTime = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - this._lastFrameTime) / 1000, 0.05);
      this._lastFrameTime = now;

      this.update(dt);
      this.renderer.render(this);
      if (this.onFrame) this.onFrame(this);
      Input.endFrame();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  resetRun() {
    this.timer          = GAME_TIMER;
    this.attempts       = ATTEMPTS_MAX;
    this.energy         = 100;
    this.dim            = 'A';
    this.overloaded     = false;
    this.overloadT      = 0;
    this.freezeActive   = false;
    this.freezeTimer    = 0;
    this.freezeCooldown = 0;
    this.shake          = 0;
    this.syncActivated  = [false, false, false];
    this.exitUnlocked   = false;
    this._initEntities();
    this.state          = 'PLAYING';
    Audio.startMusic();
  }

  respawnPlayer() {
    let spawn = SPAWN;
    for (const cp of this.checkpoints) {
      if (cp.active) {
        spawn = { x: cp.x, y: cp.y };
        break;
      }
    }
    this.player.respawn(spawn.x, spawn.y);
    this.energy = Math.max(30, this.energy); // grant baseline energy on respawn
  }

  startAutoplayDemo() {
    this.resetRun();
    this.autoplayActive = true;
    this.autoplayT = 0;
    this.autoplayActionsDone = new Set();
    this.player.invincible = 9999;
  }

  update(dt) {
    this.t += dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 4);

    switch (this.state) {
      case 'MAIN_MENU':
        this._updateMainMenu();
        break;
      case 'HOW_TO_PLAY':
        this._updateHowToPlay();
        break;
      case 'PAUSED':
        this._updatePauseMenu();
        break;
      case 'OVERLOAD_CINEMATIC':
        this._updateOverloadCinematic(dt);
        break;
      case 'GAME_OVER':
      case 'VICTORY':
        if (Input.confirm()) {
          Audio.sfx('select');
          this.resetRun();
        }
        break;
      case 'PLAYING':
        this._updatePlaying(dt);
        break;
    }
  }

  _updateMainMenu() {
    if (Input.up()) {
      this.menuSel = (this.menuSel + 2) % 3;
      Audio.sfx('select');
    }
    if (Input.down()) {
      this.menuSel = (this.menuSel + 1) % 3;
      Audio.sfx('select');
    }
    if (Input.confirm()) {
      Audio.init();
      Audio.sfx('select');
      if (this.menuSel === 0) {
        this.resetRun();
      } else if (this.menuSel === 1) {
        this.state = 'HOW_TO_PLAY';
      } else if (this.menuSel === 2) {
        Audio.sfx('switch');
      }
    }
  }

  _updateHowToPlay() {
    if (Input.confirm() || Input.pause()) {
      Audio.sfx('select');
      this.state = this.player ? 'PAUSED' : 'MAIN_MENU';
    }
  }

  _updatePauseMenu() {
    if (Input.pause()) {
      this.state = 'PLAYING';
      return;
    }
    if (Input.up()) {
      this.pauseSel = (this.pauseSel + 3) % 4;
      Audio.sfx('select');
    }
    if (Input.down()) {
      this.pauseSel = (this.pauseSel + 1) % 4;
      Audio.sfx('select');
    }
    if (Input.confirm()) {
      Audio.sfx('select');
      if (this.pauseSel === 0) {
        this.state = 'PLAYING';
      } else if (this.pauseSel === 1) {
        this.state = 'HOW_TO_PLAY';
      } else if (this.pauseSel === 2) {
        this.respawnPlayer();
        this.state = 'PLAYING';
      } else if (this.pauseSel === 3) {
        this.state = 'MAIN_MENU';
      }
    }
  }

  _updateOverloadCinematic(dt) {
    this.overloadT += dt;
    this.shake = 3;
    if (this.overloadT > 3.0 || Input.confirm() || Input.jump()) {
      this.state = 'PLAYING';
    }
  }

  _updatePlaying(dt) {
    if (Input.pause()) {
      this.state = 'PAUSED';
      Audio.sfx('select');
      return;
    }

    // Timer countdown
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = 0;
      this.state = 'GAME_OVER';
      Audio.sfx('gameover');
      return;
    }

    // Time freeze countdown & cooldown
    if (this.freezeActive) {
      this.freezeTimer -= dt;
      if (this.freezeTimer <= 0) {
        this.freezeActive = false;
        Audio.sfx('unfreeze');
      }
    }
    if (this.freezeCooldown > 0) {
      this.freezeCooldown -= dt;
    }

    // ─────────────────────────────────────────────────────────
    // Player Reality Manipulation Actions
    // ─────────────────────────────────────────────────────────

    // 1. Gravity Reversal [Q]
    if (Input.gravity()) {
      const cost = this.overloaded ? COST.GRAVITY_OVERLOAD : COST.GRAVITY_NORMAL;
      if (this.energy >= cost) {
        this.energy -= cost;
        this.player.flipGravity();
        Audio.sfx('gravity');
        this.shake = 2;
        this.renderer.addFloatingText(`-${cost}⚡`, this.player.x, this.player.y - 10, C.cyan);
        burst(this.particles, this.player.x + 4, this.player.y + 7, C.cyan, 12, 80);
      } else {
        Audio.sfx('error');
        this.renderer.addFloatingText('LOW ENERGY!', this.player.x, this.player.y - 10, C.red);
      }
    }

    // 2. Time Freeze [E]
    if (Input.freeze()) {
      if (this.freezeCooldown <= 0 && this.energy >= COST.FREEZE) {
        this.energy -= COST.FREEZE;
        this.freezeActive = true;
        this.freezeTimer = FREEZE_DURATION;
        this.freezeCooldown = FREEZE_COOLDOWN;
        Audio.sfx('freeze');
        this.shake = 2;
        this.renderer.addFloatingText(`-${COST.FREEZE}⚡`, this.player.x, this.player.y - 10, '#00e5ff');
        burst(this.particles, this.player.x + 4, this.player.y + 7, '#00e5ff', 16, 90);
      } else {
        Audio.sfx('error');
      }
    }

    // 3. Dimension Switch [R]
    if (Input.dimSwitch()) {
      if (this.overloaded) {
        // Midway Twist: Dimension switch RECHARGES energy!
        this.energy = Math.min(100, this.energy + 10);
        this.dim = this.dim === 'A' ? 'B' : 'A';
        Audio.sfx('dim');
        this.shake = 2;
        this.renderer.addFloatingText('+10⚡', this.player.x, this.player.y - 10, C.green);
        burst(this.particles, this.player.x + 4, this.player.y + 7, this.dim === 'A' ? C.cyan : C.magenta, 14, 70);
      } else {
        if (this.energy >= COST.DIM_SWITCH) {
          this.energy -= COST.DIM_SWITCH;
          this.dim = this.dim === 'A' ? 'B' : 'A';
          Audio.sfx('dim');
          this.shake = 2;
          this.renderer.addFloatingText(`-${COST.DIM_SWITCH}⚡`, this.player.x, this.player.y - 10, C.magenta);
          burst(this.particles, this.player.x + 4, this.player.y + 7, this.dim === 'A' ? C.cyan : C.magenta, 14, 70);
        } else {
          Audio.sfx('error');
          this.renderer.addFloatingText('LOW ENERGY!', this.player.x, this.player.y - 10, C.red);
        }
      }
    }

    // ─────────────────────────────────────────────────────────
    // Simulation Updates
    // ─────────────────────────────────────────────────────────

    // Entities
    for (const p of this.platforms) p.update(dt, this.freezeActive);
    for (const s of this.saws) s.update(dt, this.freezeActive);
    for (const l of this.lasers) l.update(dt, this.dim);
    for (const c of this.crates) c.update(dt, this.player.gravDir, this.dim, this.platforms);

    // Pressure switches & linked laser gates
    for (const ps of this.pressureSwitches) {
      const changed = ps.update(this.player, this.crates);
      if (changed) {
        Audio.sfx('switch');
        for (const targetId of ps.targets) {
          const las = this.lasers.find(l => l.id === targetId);
          if (las) las.active = !ps.pressed;
        }
      }
    }

    // Collapsing platforms
    for (const cp of this.collapsingPlatforms) {
      const collapsed = cp.update(dt);
      if (collapsed) Audio.sfx('collapse');
    }

    // Nodes & Switches
    for (const en of this.energyNodes) en.update(dt);
    for (const rn of this.reactorNodes) rn.update(dt);
    for (const sw of this.syncSwitches) sw.update(dt);
    for (const ch of this.checkpoints) ch.update(dt);

    // Dynamic Reactor Shockwaves (Midway Twist)
    if (this.overloaded) {
      this.pulseTimer += dt;
      if (this.pulseTimer > 7.0) {
        this.pulseTimer = 0;
        this.reactorPulses.push(new ReactorPulse(24 * TS, 14 * TS, 360));
        Audio.sfx('pulse');
      }
      for (let i = this.reactorPulses.length - 1; i >= 0; i--) {
        const rp = this.reactorPulses[i];
        rp.update(dt, this.freezeActive);
        if (rp.hits(this.player)) {
          this.energy = Math.max(0, this.energy - dt * 35);
          this.shake = 1.5;
        }
        if (!rp.alive) this.reactorPulses.splice(i, 1);
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt, this.freezeActive);
      if (this.particles[i].life <= 0) this.particles.splice(i, 1);
    }

    // ─────────────────────────────────────────────────────────
    // Player Update & Collision Resolution
    // ─────────────────────────────────────────────────────────
    if (this.autoplayActive) {
      this._updateAutoplay(dt);
    } else {
      const moveRes = this.player.update(
        dt,
        Input,
        this.dim,
        this.platforms,
        this.collapsingPlatforms,
        this.crates
      );

      if (moveRes === 'jump') Audio.sfx('jump');
      if (moveRes === 'void_fall') {
        this._playerHit();
        return;
      }

      // Hazard: Saws
      if (this.player.invincible <= 0) {
        for (const saw of this.saws) {
          if (saw.hits(this.player)) {
            this._playerHit();
            return;
          }
        }
      }

      // Hazard: Lasers
      if (this.player.invincible <= 0) {
        for (const las of this.lasers) {
          if (las.active && rectOverlap(this.player, las.getHitbox())) {
            this._playerHit();
            return;
          }
        }
      }
    }

    // Hazard: Entropy Fields (Drains energy)
    for (const ef of DEFS.entropyFields) {
      const box = { x: ef.col * TS, y: ef.row * TS, w: ef.w * TS, h: ef.h * TS };
      if (rectOverlap(this.player, box)) {
        this.energy = Math.max(0, this.energy - COST.ENTROPY_DRAIN * dt);
        this.shake = 0.5;
        if (Math.random() < 0.2) Audio.sfx('entropy');
        if (this.energy <= 0 && this.player.invincible <= 0) {
          this._playerHit();
          return;
        }
      }
    }

    // Collect Energy Nodes
    for (const en of this.energyNodes) {
      if (!en.collected && rectOverlap(this.player, en)) {
        en.collected = true;
        this.energy = Math.min(100, this.energy + 25);
        Audio.sfx('node');
        this.renderer.addFloatingText('+25⚡', en.x, en.y - 8, C.yellow);
        burst(this.particles, en.x + 6, en.y + 6, C.yellow, 15, 80);
      }
    }

    // Checkpoints
    for (const cp of this.checkpoints) {
      if (!cp.active && rectOverlap(this.player, cp)) {
        for (const c of this.checkpoints) c.active = false;
        cp.active = true;
        this.player.setSpawn(cp.x, cp.y);
        Audio.sfx('checkpoint');
        this.renderer.addFloatingText('CHECKPOINT!', cp.x, cp.y - 10, C.green);
        burst(this.particles, cp.x + 8, cp.y + 8, C.green, 16, 70);
      }
    }

    // Reactor Nodes (Midway Twist Trigger)
    for (const rn of this.reactorNodes) {
      if (!rn.active && rectOverlap(this.player, rn)) {
        rn.active = true;
        Audio.sfx('reactor');
        burst(this.particles, rn.x + 8, rn.y + 12, C.orange, 20, 90);
        this.renderer.addFloatingText('CORE ENGAGED!', rn.x, rn.y - 10, C.orange);

        const activeCount = this.reactorNodes.filter(n => n.active).length;
        if (activeCount === 2 && !this.overloaded) {
          // Trigger Midway Overload!
          this.overloaded = true;
          this.state = 'OVERLOAD_CINEMATIC';
          this.overloadT = 0;
          Audio.sfx('overload');
          Audio.setIntensity(1.0);
        }
      }
    }

    // Sync Switches (A, B, C)
    for (let i = 0; i < this.syncSwitches.length; i++) {
      const sw = this.syncSwitches[i];
      if (!sw.active && rectOverlap(this.player, sw)) {
        let conditionMet = true;
        if (sw.reqGravRev && this.player.gravDir !== -1) conditionMet = false;
        if (sw.reqDimB && this.dim !== 'B') conditionMet = false;
        if (sw.reqFrozenPlatform && !this.freezeActive) conditionMet = false;

        if (conditionMet) {
          sw.active = true;
          this.syncActivated[i] = true;
          Audio.sfx('switch');
          burst(this.particles, sw.x + 6, sw.y + 8, C.cyan, 18, 80);
          this.renderer.addFloatingText(`SYNC ${sw.label} ONLINE!`, sw.x, sw.y - 12, C.green);

          // Check if all 3 syncs are active
          if (this.syncActivated.every(Boolean)) {
            this.exitUnlocked = true;
            this.renderer.addFloatingText('EXIT CONTAINMENT VAULT UNLOCKED!', W / 2, 40, C.cyan);
            Audio.sfx('victory');
          }
        }
      }
    }

    // Exit Door
    const exitBox = { x: DEFS.exit.col * TS, y: DEFS.exit.row * TS, w: 16, h: 20 };
    if (this.exitUnlocked && rectOverlap(this.player, exitBox)) {
      this.state = 'VICTORY';
      Audio.sfx('victory');
      return;
    }

    // Current Sector Identification
    const playerCol = Math.floor(this.player.x / TS);
    for (const sec of DEFS.sectors) {
      if (playerCol >= sec.startCol && playerCol < sec.endCol) {
        this.currentSectorName = sec.name;
        break;
      }
    }

    // Camera Lerp
    const targetCamX = this.player.x + this.player.w / 2 - W / 2;
    const targetCamY = this.player.y + this.player.h / 2 - H / 2;
    this.camX += (targetCamX - this.camX) * 0.12;
    this.camY += (targetCamY - this.camY) * 0.12;
    this.camX = Math.max(0, Math.min(WORLD_W - W, this.camX));
    this.camY = Math.max(0, Math.min(WORLD_H - H, this.camY));
  }

  _playerHit() {
    this.attempts--;
    Audio.sfx('die');
    this.shake = 5;
    burst(this.particles, this.player.x + 4, this.player.y + 7, C.red, 20, 100);

    if (this.attempts <= 0) {
      this.state = 'GAME_OVER';
      Audio.sfx('gameover');
    } else {
      this.respawnPlayer();
    }
  }

  _updateAutoplay(dt) {
    this.autoplayT += dt;
    const t = this.autoplayT;

    const WAYPOINTS = [
      { t: 0.0,  x: 34,  y: 34,  face: 1 },
      { t: 1.2,  x: 88,  y: 34,  face: 1, action: 'freeze' },
      { t: 2.6,  x: 290, y: 34,  face: 1, action: 'node1' },
      { t: 4.2,  x: 208, y: 80,  face: -1, action: 'core1' },
      { t: 6.5,  x: 480, y: 84,  face: 1, action: 'push_crate' },
      { t: 8.5,  x: 496, y: 112, face: 1, action: 'core2' },
      { t: 10.5, x: 546, y: 284, face: 1, action: 'grav_rev' },
      { t: 11.8, x: 546, y: 272, face: 1, action: 'sync_a' },
      { t: 12.8, x: 546, y: 284, face: 1, action: 'grav_norm' },
      { t: 14.2, x: 680, y: 240, face: 1, action: 'dim_b' },
      { t: 16.0, x: 914, y: 304, face: 1, action: 'sync_b' },
      { t: 17.8, x: 200, y: 368, face: -1, action: 'dim_a' },
      { t: 19.0, x: 100, y: 368, face: -1, action: 'freeze' },
      { t: 20.5, x: 66,  y: 368, face: -1, action: 'sync_c' },
      { t: 22.5, x: 96,  y: 400, face: 1,  action: 'victory' },
    ];

    let cur = WAYPOINTS[0];
    let nxt = WAYPOINTS[WAYPOINTS.length - 1];
    for (let i = 0; i < WAYPOINTS.length - 1; i++) {
      if (t >= WAYPOINTS[i].t && t <= WAYPOINTS[i + 1].t) {
        cur = WAYPOINTS[i];
        nxt = WAYPOINTS[i + 1];
        break;
      }
    }

    if (t >= WAYPOINTS[WAYPOINTS.length - 1].t) {
      this.player.x = nxt.x;
      this.player.y = nxt.y;
    } else {
      const segDur = Math.max(0.01, nxt.t - cur.t);
      const prog   = Math.min(1, Math.max(0, (t - cur.t) / segDur));
      const ease   = prog < 0.5 ? 2 * prog * prog : -1 + (4 - 2 * prog) * prog;
      this.player.x = cur.x + (nxt.x - cur.x) * ease;
      this.player.y = cur.y + (nxt.y - cur.y) * ease;
      this.player.face = cur.face;
      this.player.walkT += dt * 8;
    }

    // Process actions
    for (let i = 0; i < WAYPOINTS.length; i++) {
      const wp = WAYPOINTS[i];
      if (wp.action && t >= wp.t && !this.autoplayActionsDone.has(i)) {
        this.autoplayActionsDone.add(i);
        if (wp.action === 'freeze') {
          this.freezeActive = true;
          this.freezeTimer = FREEZE_DURATION;
          this.freezeCooldown = FREEZE_COOLDOWN;
          Audio.sfx('freeze');
          this.renderer.addFloatingText('-20⚡', this.player.x, this.player.y - 10, '#00e5ff');
          burst(this.particles, this.player.x + 4, this.player.y + 7, '#00e5ff', 16, 90);
        } else if (wp.action === 'node1') {
          this.energyNodes[0].collected = true;
          this.energy = Math.min(100, this.energy + 25);
          Audio.sfx('node');
          this.renderer.addFloatingText('+25⚡', this.player.x, this.player.y - 10, C.yellow);
          burst(this.particles, this.player.x + 4, this.player.y + 7, C.yellow, 16, 80);
        } else if (wp.action === 'core1') {
          this.reactorNodes[0].active = true;
          Audio.sfx('reactor');
          this.renderer.addFloatingText('CORE 1 ENGAGED!', this.player.x, this.player.y - 10, C.orange);
          burst(this.particles, this.player.x + 4, this.player.y + 7, C.orange, 16, 80);
        } else if (wp.action === 'push_crate') {
          const cr = this.crates[0];
          const ps = this.pressureSwitches[0];
          if (cr && ps) {
            cr.x = ps.x + 2;
            cr.y = ps.y - 10;
            ps.pressed = true;
            const las = this.lasers.find(l => l.id === 'las1');
            if (las) las.active = false;
            Audio.sfx('switch');
            this.renderer.addFloatingText('LASER DEACTIVATED', cr.x, cr.y - 10, C.green);
          }
        } else if (wp.action === 'core2') {
          this.reactorNodes[1].active = true;
          this.overloaded = true;
          Audio.sfx('overload');
          Audio.setIntensity(1.0);
          this.renderer.addFloatingText('⚠️ OVERLOAD: RULES INVERTED!', this.player.x, this.player.y - 14, C.red);
          this.shake = 4;
        } else if (wp.action === 'grav_rev') {
          this.player.gravDir = -1;
          Audio.sfx('gravity');
          this.renderer.addFloatingText('-15⚡', this.player.x, this.player.y - 10, C.cyan);
          burst(this.particles, this.player.x + 4, this.player.y + 7, C.cyan, 12, 80);
        } else if (wp.action === 'sync_a') {
          this.syncSwitches[0].active = true;
          this.syncActivated[0] = true;
          Audio.sfx('switch');
          burst(this.particles, this.syncSwitches[0].x, this.syncSwitches[0].y, C.cyan, 16, 70);
          this.renderer.addFloatingText('SYNC A ONLINE! [1/3]', this.player.x, this.player.y - 10, C.green);
        } else if (wp.action === 'grav_norm') {
          this.player.gravDir = 1;
          Audio.sfx('gravity');
          this.renderer.addFloatingText('-15⚡', this.player.x, this.player.y - 10, C.cyan);
          burst(this.particles, this.player.x + 4, this.player.y + 7, C.cyan, 12, 80);
        } else if (wp.action === 'dim_b') {
          this.dim = 'B';
          this.energy = Math.min(100, this.energy + 10);
          Audio.sfx('dim');
          this.renderer.addFloatingText('+10⚡', this.player.x, this.player.y - 10, C.green);
          burst(this.particles, this.player.x + 4, this.player.y + 7, C.magenta, 14, 70);
        } else if (wp.action === 'sync_b') {
          this.syncSwitches[1].active = true;
          this.syncActivated[1] = true;
          Audio.sfx('switch');
          burst(this.particles, this.syncSwitches[1].x, this.syncSwitches[1].y, C.magenta, 16, 70);
          this.renderer.addFloatingText('SYNC B ONLINE! [2/3]', this.player.x, this.player.y - 10, C.green);
        } else if (wp.action === 'dim_a') {
          this.dim = 'A';
          this.energy = Math.min(100, this.energy + 10);
          Audio.sfx('dim');
          this.renderer.addFloatingText('+10⚡', this.player.x, this.player.y - 10, C.green);
          burst(this.particles, this.player.x + 4, this.player.y + 7, C.cyan, 14, 70);
        } else if (wp.action === 'sync_c') {
          this.syncSwitches[2].active = true;
          this.syncActivated[2] = true;
          this.exitUnlocked = true;
          Audio.sfx('switch');
          Audio.sfx('victory');
          burst(this.particles, this.syncSwitches[2].x, this.syncSwitches[2].y, C.green, 20, 90);
          this.renderer.addFloatingText('ALL SYNCS ONLINE! EXIT UNLOCKED!', this.player.x, this.player.y - 12, C.cyan);
        } else if (wp.action === 'victory') {
          this.state = 'VICTORY';
          this.autoplayActive = false;
          Audio.sfx('victory');
        }
      }
    }
  }
}
