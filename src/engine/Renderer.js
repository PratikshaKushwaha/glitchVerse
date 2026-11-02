// ============================================================
// ENTROPY ENGINE — Pixel-Art Canvas Renderer & HUD
// Matches reference images with authentic sci-fi aesthetics
// ============================================================
import { W, H, TS, C, FREEZE_DURATION, FREEZE_COOLDOWN } from './constants.js';
import { COLS, ROWS, WORLD_W, WORLD_H, DEFS } from './level.js';
import { tileAt } from './World.js';

// Precomputed background stars / quantum dust
const BG_DUST = Array.from({ length: 48 }, () => ({
  x: Math.random() * WORLD_W,
  y: Math.random() * WORLD_H,
  speed: 0.2 + Math.random() * 0.8,
  size: 1 + Math.random() * 1.5,
  color: Math.random() > 0.5 ? C.cyan : C.magenta,
}));

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    canvas.width  = W;
    canvas.height = H;
    this.floatingTexts = []; // { text, x, y, color, life, maxL }
  }

  addFloatingText(text, x, y, color) {
    this.floatingTexts.push({ text, x, y, color, life: 0.9, maxL: 0.9 });
  }

  render(engine) {
    const ctx = this.ctx;
    const {
      player, dim, gravDir, freezeActive, freezeTimer, freezeCooldown,
      energy, overloaded, t, shake, camX, camY, state,
    } = engine;

    ctx.save();

    // Screen Shake
    if (shake > 0) {
      const sx = (Math.random() - 0.5) * shake * 4;
      const sy = (Math.random() - 0.5) * shake * 4;
      ctx.translate(Math.round(sx), Math.round(sy));
    }

    // Camera Translation
    ctx.translate(-Math.round(camX), -Math.round(camY));

    // 1. Parallax Reactor Core & Industrial Background
    this._drawBackground(ctx, camX, camY, t, dim, overloaded);

    // 2. Level Tilemap (Chamber Walls, Dim A/B blocks)
    this._drawTilemap(ctx, camX, camY, dim, t);

    // 3. Interactive Entities & Hazards
    this._drawEntropyFields(ctx, DEFS.entropyFields, t);
    this._drawExitPortal(ctx, DEFS.exit, engine.exitUnlocked, t);
    this._drawCheckpoints(ctx, engine.checkpoints, t);
    this._drawReactorNodes(ctx, engine.reactorNodes, t);
    this._drawSyncSwitches(ctx, engine.syncSwitches, t);
    this._drawPressureSwitches(ctx, engine.pressureSwitches);
    this._drawCollapsingPlatforms(ctx, engine.collapsingPlatforms);
    this._drawMovingPlatforms(ctx, engine.platforms, freezeActive);
    this._drawCrates(ctx, engine.crates);
    this._drawEnergyNodes(ctx, engine.energyNodes, t);
    this._drawLasers(ctx, engine.lasers, t);
    this._drawSaws(ctx, engine.saws);
    this._drawReactorPulses(ctx, engine.reactorPulses);

    // 4. Player
    if (player && !player.dead) {
      this._drawPlayer(ctx, player, energy, t, gravDir);
    }

    // 5. Particles
    this._drawParticles(ctx, engine.particles);

    // 6. Floating Text Popups
    this._drawFloatingTexts(ctx, dtTextUpdate(this.floatingTexts, 0.016));

    ctx.restore();

    // 7. Post-Processing: Time Freeze Frost Overlay & Dimension Glitch
    if (freezeActive) {
      this._drawFreezeVignette(ctx, freezeTimer);
    }
    if (overloaded) {
      this._drawOverloadAura(ctx, t);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Background & Atmosphere
  // ─────────────────────────────────────────────────────────────
  _drawBackground(ctx, camX, camY, t, dim, overloaded) {
    // Deep base gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, WORLD_H);
    bgGrad.addColorStop(0, dim === 'A' ? '#060812' : '#0e0618');
    bgGrad.addColorStop(0.5, dim === 'A' ? '#080d1e' : '#140822');
    bgGrad.addColorStop(1, '#04050a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(camX, camY, W, H);

    // Giant central reactor core apparatus (matches reference image 1 & 2)
    const reactorCenterX = 24 * TS;
    const reactorCenterY = 14 * TS;

    // Glowing core column
    ctx.save();
    const coreGrad = ctx.createRadialGradient(
      reactorCenterX, reactorCenterY, 10,
      reactorCenterX, reactorCenterY, 180
    );
    const coreColor = overloaded ? 'rgba(255, 59, 77, ' : 'rgba(255, 165, 0, ';
    coreGrad.addColorStop(0, coreColor + (0.35 + Math.sin(t * 3) * 0.1) + ')');
    coreGrad.addColorStop(0.5, 'rgba(106, 0, 255, 0.15)');
    coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.fillRect(reactorCenterX - 200, reactorCenterY - 180, 400, 360);

    // Rotating reactor containment rings
    ctx.strokeStyle = overloaded ? 'rgba(255, 59, 77, 0.25)' : 'rgba(0, 229, 255, 0.2)';
    ctx.lineWidth = 2;
    for (let r = 40; r <= 140; r += 32) {
      ctx.beginPath();
      ctx.arc(reactorCenterX, reactorCenterY, r, t * 0.2 + r * 0.1, t * 0.2 + r * 0.1 + Math.PI * 1.5);
      ctx.stroke();
    }
    ctx.restore();

    // Floating quantum dust particles
    ctx.fillStyle = dim === 'A' ? 'rgba(0, 229, 255, 0.4)' : 'rgba(255, 0, 212, 0.4)';
    for (const d of BG_DUST) {
      const px = (d.x - camX * d.speed * 0.1 + WORLD_W) % WORLD_W;
      const py = (d.y - camY * d.speed * 0.1 + WORLD_H) % WORLD_H;
      if (px >= camX - 10 && px <= camX + W + 10 && py >= camY - 10 && py <= camY + H + 10) {
        ctx.fillRect(Math.floor(px), Math.floor(py), d.size, d.size);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Tilemap Drawing (Sci-Fi Metallic & Dimensional Blocks)
  // ─────────────────────────────────────────────────────────────
  _drawTilemap(ctx, camX, camY, dim, t) {
    const startCol = Math.max(0, Math.floor(camX / TS));
    const endCol   = Math.min(COLS - 1, Math.ceil((camX + W) / TS));
    const startRow = Math.max(0, Math.floor(camY / TS));
    const endRow   = Math.min(ROWS - 1, Math.ceil((camY + H) / TS));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = tileAt(c, r);
        const x = c * TS;
        const y = r * TS;

        if (tile === '#') {
          // Solid industrial chamber plating with golden/slate trims
          ctx.fillStyle = '#101424';
          ctx.fillRect(x, y, TS, TS);
          ctx.strokeStyle = '#222842';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, TS - 1, TS - 1);

          // Golden/bronze circuit edge accents (matches Reference Image 1)
          ctx.fillStyle = '#3a3222';
          ctx.fillRect(x + 2, y + 2, TS - 4, 1);
          ctx.fillStyle = '#c89228';
          ctx.fillRect(x + 3, y + 2, 2, 1);
          ctx.fillRect(x + TS - 5, y + 2, 2, 1);
        } else if (tile === 'A') {
          // Dimension A block (Solid in A, ghosted in B)
          if (dim === 'A') {
            ctx.fillStyle = 'rgba(0, 229, 255, 0.22)';
            ctx.fillRect(x, y, TS, TS);
            ctx.strokeStyle = C.cyan;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 0.5, y + 0.5, TS - 1, TS - 1);
            // Glowing cross circuit
            ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
            ctx.fillRect(x + 4, y + 4, TS - 8, TS - 8);
          } else {
            // Ethereal translucent outline
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(x + 1, y + 1, TS - 2, TS - 2);
            ctx.setLineDash([]);
          }
        } else if (tile === 'B') {
          // Dimension B block (Solid in B, ghosted in A)
          if (dim === 'B') {
            ctx.fillStyle = 'rgba(255, 0, 212, 0.25)';
            ctx.fillRect(x, y, TS, TS);
            ctx.strokeStyle = C.magenta;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 0.5, y + 0.5, TS - 1, TS - 1);
            // Pulsing neon core
            ctx.fillStyle = 'rgba(255, 0, 212, 0.6)';
            ctx.fillRect(x + 4, y + 4, TS - 8, TS - 8);
          } else {
            ctx.strokeStyle = 'rgba(255, 0, 212, 0.2)';
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(x + 1, y + 1, TS - 2, TS - 2);
            ctx.setLineDash([]);
          }
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Entities & Hazards
  // ─────────────────────────────────────────────────────────────
  _drawEntropyFields(ctx, fields, t) {
    for (const f of fields) {
      const x = f.col * TS;
      const y = f.row * TS;
      const w = f.w * TS;
      const h = f.h * TS;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 0, 212, 0.18)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(255, 59, 77, 0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);

      // Hazard spikes on top if ground level
      ctx.fillStyle = '#ff3b4d';
      for (let sx = x; sx < x + w; sx += 4) {
        ctx.beginPath();
        ctx.moveTo(sx, y + h);
        ctx.lineTo(sx + 2, y + h - 5);
        ctx.lineTo(sx + 4, y + h);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  _drawExitPortal(ctx, exitDef, unlocked, t) {
    const x = exitDef.col * TS;
    const y = exitDef.row * TS;

    ctx.save();
    // Portal Frame
    ctx.fillStyle = '#182035';
    ctx.fillRect(x - 2, y - 6, 20, 26);
    ctx.strokeStyle = unlocked ? C.cyan : '#455068';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 2, y - 6, 20, 26);

    // Glowing energy field
    if (unlocked) {
      const pGrad = ctx.createLinearGradient(x, y, x, y + 20);
      pGrad.addColorStop(0, 'rgba(0, 229, 255, 0.8)');
      pGrad.addColorStop(1, 'rgba(50, 230, 161, 0.8)');
      ctx.fillStyle = pGrad;
      ctx.fillRect(x + 2, y - 2, 12, 22);

      // EXIT beacon text
      ctx.font = '7px monospace';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('EXIT', x + 8, y - 8);
    } else {
      ctx.fillStyle = 'rgba(255, 59, 77, 0.25)';
      ctx.fillRect(x + 2, y - 2, 12, 22);
      ctx.font = '6px monospace';
      ctx.fillStyle = '#ff6070';
      ctx.textAlign = 'center';
      ctx.fillText('LOCKED', x + 8, y - 8);
    }
    ctx.restore();
  }

  _drawCheckpoints(ctx, checkpoints, t) {
    for (const cp of checkpoints) {
      ctx.save();
      ctx.fillStyle = cp.active ? C.green : '#3a445d';
      ctx.fillRect(cp.x + 6, cp.y + 4, 4, 12);
      // Diamond beacon
      ctx.beginPath();
      ctx.arc(cp.x + 8, cp.y + 4, 3 + Math.sin(t * 4) * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = cp.active ? '#32E6A1' : '#7A8899';
      ctx.fill();
      ctx.restore();
    }
  }

  _drawReactorNodes(ctx, nodes, t) {
    for (const node of nodes) {
      ctx.save();
      // Tech Pillar
      ctx.fillStyle = '#1c2238';
      ctx.fillRect(node.x + 2, node.y + 2, 12, 20);
      ctx.strokeStyle = node.active ? C.orange : '#4a5575';
      ctx.lineWidth = 1;
      ctx.strokeRect(node.x + 2, node.y + 2, 12, 20);

      // Glowing Plasma Core
      const coreH = node.active ? 14 : 6;
      ctx.fillStyle = node.active ? C.orange : '#6a4515';
      ctx.fillRect(node.x + 4, node.y + 12 - coreH / 2, 8, coreH);

      // Tag
      ctx.font = '6px monospace';
      ctx.fillStyle = node.active ? C.yellow : '#8a99b5';
      ctx.textAlign = 'center';
      ctx.fillText(node.label.replace('CORE NODE ', 'N'), node.x + 8, node.y);
      ctx.restore();
    }
  }

  _drawSyncSwitches(ctx, switches, t) {
    for (const sw of switches) {
      ctx.save();
      ctx.fillStyle = '#1e2436';
      ctx.fillRect(sw.x, sw.y, sw.w, sw.h);
      ctx.strokeStyle = sw.active ? C.green : C.red;
      ctx.lineWidth = 1;
      ctx.strokeRect(sw.x, sw.y, sw.w, sw.h);

      // Glowing letter (A, B, C)
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = sw.active ? '#fff' : '#ff7a88';
      ctx.textAlign = 'center';
      ctx.fillText(sw.label, sw.x + sw.w / 2, sw.y + 11);
      ctx.restore();
    }
  }

  _drawPressureSwitches(ctx, switches) {
    for (const ps of switches) {
      ctx.save();
      ctx.fillStyle = ps.pressed ? C.green : '#ffaa00';
      ctx.fillRect(ps.x + 1, ps.y + (ps.pressed ? 2 : 0), ps.w - 2, ps.h - (ps.pressed ? 2 : 0));
      ctx.restore();
    }
  }

  _drawCollapsingPlatforms(ctx, platforms) {
    for (const cp of platforms) {
      if (cp.state === 'collapsed') continue;
      ctx.save();
      const ox = cp.state === 'shaking' ? cp.shakeOffset : 0;
      ctx.fillStyle = cp.state === 'shaking' ? '#8a6540' : '#45506b';
      ctx.fillRect(cp.x + ox, cp.y, cp.w, cp.h);
      ctx.strokeStyle = cp.state === 'shaking' ? C.orange : '#6a789a';
      ctx.strokeRect(cp.x + ox, cp.y, cp.w, cp.h);
      ctx.restore();
    }
  }

  _drawMovingPlatforms(ctx, platforms, frozen) {
    for (const p of platforms) {
      ctx.save();
      // Platform base
      ctx.fillStyle = frozen ? '#184060' : '#22304d';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = frozen ? '#00e5ff' : '#00aacc';
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);

      // Frost effect if frozen
      if (frozen) {
        ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, p.h - 4);
      }
      ctx.restore();
    }
  }

  _drawCrates(ctx, crates) {
    for (const c of crates) {
      ctx.save();
      // Metal industrial cargo crate with cross bracing
      ctx.fillStyle = '#4a536b';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 1;
      ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);

      // Diagonal cross brace
      ctx.beginPath();
      ctx.moveTo(c.x + 1, c.y + 1);
      ctx.lineTo(c.x + c.w - 1, c.y + c.h - 1);
      ctx.moveTo(c.x + c.w - 1, c.y + 1);
      ctx.lineTo(c.x + 1, c.y + c.h - 1);
      ctx.strokeStyle = 'rgba(255, 170, 0, 0.4)';
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawEnergyNodes(ctx, nodes, t) {
    for (const node of nodes) {
      if (node.collected) continue;
      ctx.save();
      const cx = node.x + node.w / 2;
      const cy = node.y + node.h / 2;
      const pulse = Math.sin(t * 5 + node.pulse) * 1.5;

      // Outer aura
      ctx.beginPath();
      ctx.arc(cx, cy, 6 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 165, 0, 0.25)';
      ctx.fill();

      // Energy Battery Box
      ctx.fillStyle = '#FFA500';
      ctx.fillRect(cx - 3, cy - 4, 6, 8);
      // Lightning bolt icon ⚡
      ctx.fillStyle = '#fff';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚡', cx, cy + 3);
      ctx.restore();
    }
  }

  _drawLasers(ctx, lasers, t) {
    for (const las of lasers) {
      if (!las.active) continue;
      const hb = las.getHitbox();
      ctx.save();
      const alpha = 0.7 + Math.sin(las.pulse) * 0.25;
      ctx.fillStyle = `rgba(255, 59, 77, ${alpha})`;
      ctx.fillRect(hb.x, hb.y, hb.w, hb.h);

      // Bright core
      ctx.fillStyle = '#fff';
      if (las.axis === 'h') {
        ctx.fillRect(hb.x, hb.y + 1.5, hb.w, 1);
      } else {
        ctx.fillRect(hb.x + 1.5, hb.y, 1, hb.h);
      }
      ctx.restore();
    }
  }

  _drawSaws(ctx, saws) {
    for (const s of saws) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      // Metallic circular saw with sharp teeth
      ctx.fillStyle = '#55607a';
      ctx.beginPath();
      ctx.arc(0, 0, s.r, 0, Math.PI * 2);
      ctx.fill();

      // Teeth
      ctx.fillStyle = '#ff3b4d';
      for (let i = 0; i < 8; i++) {
        ctx.rotate((Math.PI * 2) / 8);
        ctx.beginPath();
        ctx.moveTo(s.r - 1, -2);
        ctx.lineTo(s.r + 3, 0);
        ctx.lineTo(s.r - 1, 2);
        ctx.fill();
      }

      // Glowing center eye
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();
    }
  }

  _drawReactorPulses(ctx, pulses) {
    for (const p of pulses) {
      if (!p.alive) continue;
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 59, 77, 0.5)';
      ctx.lineWidth = p.width;
      ctx.stroke();
      ctx.restore();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Player Drawing (Pixel-art astronaut with backpack reactor)
  // ─────────────────────────────────────────────────────────────
  _drawPlayer(ctx, player, energy, t, gravDir) {
    ctx.save();
    ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
    ctx.scale(player.face * player.scaleX, gravDir * player.scaleY);

    const isBlinking = player.invincible > 0 && Math.floor(player.invincible * 16) % 2 === 0;
    if (isBlinking) ctx.globalAlpha = 0.4;

    // Tech Suit Outline / Cyber Glow
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-4, -8, 8, 17);

    // Body suit (Cyan Tech Suit)
    ctx.fillStyle = '#00a3cc';
    ctx.fillRect(-3, -2, 6, 6);

    // Legs / Walking cycle
    const walkOffset = player.onGround ? Math.sin(player.walkT) * 2 : 0;
    ctx.fillStyle = '#084860';
    ctx.fillRect(-3, 4, 2.5, 3 + walkOffset);
    ctx.fillRect(0.5, 4, 2.5, 3 - walkOffset);

    // Helmet & Visor
    ctx.fillStyle = '#00E5FF';
    ctx.fillRect(-3.5, -7, 7, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -6, 3, 2); // visor reflection

    // Battery / Reactor Pack on Back (changes color based on energy)
    let packColor = C.cyan;
    if (energy < 25) packColor = C.red;
    else if (energy < 50) packColor = C.orange;
    ctx.fillStyle = packColor;
    ctx.fillRect(-5, -5, 2.5, 7);

    // Thruster exhaust spark if jumping / falling
    if (!player.onGround) {
      ctx.fillStyle = Math.random() > 0.5 ? '#00e5ff' : '#ffa500';
      ctx.fillRect(-4.5, 3, 1.5, 2.5);
    }

    ctx.restore();
  }

  // ─────────────────────────────────────────────────────────────
  // Particles & Popups
  // ─────────────────────────────────────────────────────────────
  _drawParticles(ctx, particles) {
    for (const p of particles) {
      if (p.life <= 0) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxL);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      ctx.restore();
    }
  }

  _drawFloatingTexts(ctx, texts) {
    for (const ft of texts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxL);
      ctx.font = 'bold 9px "Share Tech Mono", monospace';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Visual Filters & Vibe Overlays
  // ─────────────────────────────────────────────────────────────
  _drawFreezeVignette(ctx, freezeTimer) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  _drawOverloadAura(ctx, t) {
    ctx.save();
    const flash = Math.sin(t * 8) * 0.04;
    ctx.fillStyle = `rgba(255, 0, 50, ${0.05 + flash})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // ─────────────────────────────────────────────────────────────
  // Top HUD (Exact Match to GDD Reference Image 2)
  // ─────────────────────────────────────────────────────────────
  _drawHUD(ctx, engine) {
    const { energy, timer, attempts, dim, freezeTimer, freezeCooldown, syncActivated, currentSectorName, overloaded } = engine;

    // Top-Left: Energy Gauge Card
    ctx.save();
    ctx.fillStyle = 'rgba(10, 14, 25, 0.85)';
    ctx.fillRect(8, 6, 116, 22);
    ctx.strokeStyle = '#26304d';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 6, 116, 22);

    // Energy icon & numerical value
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = energy < 25 ? C.red : C.yellow;
    ctx.textAlign = 'left';
    ctx.fillText(`⚡ ${Math.round(energy)}/100`, 12, 16);

    // Energy bar track
    ctx.fillStyle = '#161c2d';
    ctx.fillRect(12, 19, 108, 6);
    // Energy bar fill
    const fillW = Math.max(0, (energy / 100) * 108);
    const grad = ctx.createLinearGradient(12, 0, 120, 0);
    grad.addColorStop(0, '#FFA500');
    grad.addColorStop(1, '#FFD23A');
    ctx.fillStyle = grad;
    ctx.fillRect(12, 19, fillW, 6);

    // Left Action Controls Cards: [Q], [E], [R]
    this._drawActionCard(ctx, 8, 32, '[Q]', 'GRAV', overloaded ? '-30' : '-15', C.cyan);
    this._drawActionCard(ctx, 8, 56, '[E]', 'FREEZE', '-20', freezeCooldown > 0 ? `${freezeCooldown.toFixed(0)}s` : C.cyan);
    this._drawActionCard(
      ctx,
      8,
      80,
      '[R]',
      dim === 'A' ? 'DIM A' : 'DIM B',
      overloaded ? '+10' : '-10',
      dim === 'A' ? C.cyan : C.magenta
    );

    // Top-Center: Level Timer & Sector Name
    ctx.fillStyle = 'rgba(10, 14, 25, 0.85)';
    ctx.fillRect(W / 2 - 80, 6, 160, 20);
    ctx.strokeStyle = '#26304d';
    ctx.strokeRect(W / 2 - 80, 6, 160, 20);

    ctx.font = '7px monospace';
    ctx.fillStyle = '#9aa8c7';
    ctx.textAlign = 'center';
    ctx.fillText(currentSectorName || 'ENTROPY CHAMBER', W / 2, 14);

    const mins = Math.floor(timer / 60);
    const secs = Math.floor(timer % 60).toString().padStart(2, '0');
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = timer < 30 ? C.red : '#ffffff';
    ctx.fillText(`⏱️ ${mins}:${secs}`, W / 2, 23);

    // Top-Right: Sync Switch Status & Attempts
    ctx.fillStyle = 'rgba(10, 14, 25, 0.85)';
    ctx.fillRect(W - 120, 6, 112, 22);
    ctx.strokeStyle = '#26304d';
    ctx.strokeRect(W - 120, 6, 112, 22);

    ctx.font = '7px monospace';
    ctx.fillStyle = '#9aa8c7';
    ctx.textAlign = 'left';
    ctx.fillText('SYNCS:', W - 114, 15);

    const sws = ['A', 'B', 'C'];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = syncActivated[i] ? C.green : '#ff4455';
      ctx.fillText(`${sws[i]}:${syncActivated[i] ? '✓' : '✗'}`, W - 78 + i * 18, 15);
    }

    ctx.fillStyle = '#ff5577';
    ctx.fillText(`LIVES: ${attempts}`, W - 114, 24);
    ctx.restore();
  }

  _drawActionCard(ctx, x, y, key, label, cost, color) {
    ctx.save();
    const w = 62;
    const h = 21;
    ctx.fillStyle = 'rgba(10, 14, 25, 0.9)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#26304d';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Key badge box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + 2, y + 2, 17, h - 4);
    ctx.strokeStyle = color;
    ctx.strokeRect(x + 2.5, y + 2.5, 16, h - 5);

    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(key.replace(/[\[\]]/g, ''), x + 10.5, y + 13);

    // Action name & cost
    ctx.font = '6px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 23, y + 9);

    ctx.font = 'bold 7px monospace';
    ctx.fillStyle = cost.startsWith('+') ? C.green : '#ff99aa';
    ctx.fillText(cost, x + 23, y + 17);
    ctx.restore();
  }

  // ─────────────────────────────────────────────────────────────
  // Screen Overlays (Menus, Overload Cinematic, Victory, Loss)
  // ─────────────────────────────────────────────────────────────
  _drawMainMenu(ctx, engine) {
    ctx.save();
    ctx.fillStyle = 'rgba(6, 8, 16, 0.9)';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = C.cyan;
    ctx.textAlign = 'center';
    ctx.fillText('THE ENTROPY ENGINE', W / 2, 60);

    ctx.font = '10px monospace';
    ctx.fillStyle = C.orange;
    ctx.fillText('REALITY COLLAPSE', W / 2, 76);

    ctx.font = '8px monospace';
    ctx.fillStyle = '#7a88a0';
    ctx.fillText('A Reality-Manipulation Puzzle Chamber', W / 2, 92);

    // Menu Options
    const options = ['START ENGINE RUN', 'HOW TO PLAY', 'TOGGLE SOUND FX'];
    for (let i = 0; i < options.length; i++) {
      const isSel = engine.menuSel === i;
      ctx.fillStyle = isSel ? 'rgba(0, 229, 255, 0.2)' : 'rgba(20, 25, 45, 0.6)';
      ctx.fillRect(W / 2 - 80, 120 + i * 26, 160, 20);
      ctx.strokeStyle = isSel ? C.cyan : '#3a4460';
      ctx.strokeRect(W / 2 - 80, 120 + i * 26, 160, 20);

      ctx.font = isSel ? 'bold 8px monospace' : '8px monospace';
      ctx.fillStyle = isSel ? '#ffffff' : '#9aa8c7';
      ctx.fillText(options[i], W / 2, 133 + i * 26);
    }

    ctx.font = '7px monospace';
    ctx.fillStyle = '#657088';
    ctx.fillText('Use [W]/[S] or [▲]/[▼] to Select, [ENTER] or [SPACE] to Confirm', W / 2, 220);
    ctx.restore();
  }

  _drawHowToPlay(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(6, 8, 16, 0.95)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = C.cyan;
    ctx.textAlign = 'center';
    ctx.fillText('CONTROLS & REALITY MANIPULATION', W / 2, 35);

    const rows = [
      ['[A] / [D] or [◀] / [▶]', 'Run Left / Right across chamber'],
      ['[W] / [SPACE]', 'Jump / Variable Ascent'],
      ['[Q] GRAVITY REVERSAL', 'Flip gravity to walk on ceilings & walls (-15 energy)'],
      ['[E] TIME FREEZE', 'Freeze saws, platforms, & hazards (-20 energy)'],
      ['[R] DIMENSION SWITCH', 'Toggle between Dimension A (Cyan) and B (Magenta)'],
      ['[F] INTERACTION', 'Engage Core Nodes & Terminal Consoles'],
      ['[ESC]', 'Pause Game / View Instructions'],
    ];

    ctx.font = '8px monospace';
    for (let i = 0; i < rows.length; i++) {
      ctx.textAlign = 'right';
      ctx.fillStyle = C.yellow;
      ctx.fillText(rows[i][0], W / 2 - 10, 65 + i * 20);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#e0ecff';
      ctx.fillText(rows[i][1], W / 2, 65 + i * 20);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = C.orange;
    ctx.fillText('⚡ Collect Energy Nodes (+25) to avoid power depletion!', W / 2, 220);

    ctx.fillStyle = '#9aa8c7';
    ctx.fillText('Press [ENTER] or [SPACE] to Return', W / 2, 245);
    ctx.restore();
  }

  _drawPauseMenu(ctx, engine) {
    ctx.save();
    ctx.fillStyle = 'rgba(6, 8, 16, 0.85)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = C.cyan;
    ctx.textAlign = 'center';
    ctx.fillText('CHAMBER PAUSED', W / 2, 70);

    const options = ['RESUME RUN', 'HOW TO PLAY', 'RESTART FROM CHECKPOINT', 'MAIN MENU'];
    for (let i = 0; i < options.length; i++) {
      const isSel = engine.pauseSel === i;
      ctx.fillStyle = isSel ? 'rgba(0, 229, 255, 0.2)' : 'rgba(20, 25, 45, 0.6)';
      ctx.fillRect(W / 2 - 80, 100 + i * 24, 160, 18);
      ctx.strokeStyle = isSel ? C.cyan : '#3a4460';
      ctx.strokeRect(W / 2 - 80, 100 + i * 24, 160, 18);

      ctx.font = isSel ? 'bold 8px monospace' : '8px monospace';
      ctx.fillStyle = isSel ? '#ffffff' : '#9aa8c7';
      ctx.fillText(options[i], W / 2, 112 + i * 24);
    }
    ctx.restore();
  }

  _drawOverloadCinematic(ctx, engine) {
    ctx.save();
    ctx.fillStyle = 'rgba(20, 4, 10, 0.88)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = C.red;
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ MIDWAY TWIST: REALITY OVERLOAD! ⚠️', W / 2, 90);

    ctx.font = '9px monospace';
    ctx.fillStyle = C.yellow;
    ctx.fillText('THE ENTROPY ENGINE IS DESTABILIZING!', W / 2, 115);

    ctx.font = '8px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('• Gravity Reversal cost DOUBLED (-30 energy)', W / 2, 140);
    ctx.fillText('• Dimension Switch now RECHARGES (+10 energy)', W / 2, 156);
    ctx.fillText('• Core Shockwaves & Hazard Pulses Activated', W / 2, 172);

    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = C.cyan;
    ctx.fillText('STABILIZE THE REMAINING CORES AND REACH THE EXIT!', W / 2, 205);
    ctx.restore();
  }

  _drawGameOver(ctx, engine) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 2, 4, 0.92)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = C.red;
    ctx.textAlign = 'center';
    ctx.fillText('REALITY COLLAPSED', W / 2, 70);

    ctx.font = '9px monospace';
    ctx.fillStyle = '#ff8899';
    ctx.fillText('The chamber succumbed to entropy runaway.', W / 2, 90);

    ctx.font = '8px monospace';
    ctx.fillStyle = '#ccd4e6';
    ctx.fillText(`Sync Switches Activated: ${engine.syncActivated.filter(Boolean).length}/3`, W / 2, 125);
    ctx.fillText(`Time Elapsed: ${(180 - engine.timer).toFixed(1)}s`, W / 2, 140);

    // Try Again button
    ctx.fillStyle = 'rgba(255, 59, 77, 0.25)';
    ctx.fillRect(W / 2 - 60, 170, 120, 22);
    ctx.strokeStyle = C.red;
    ctx.strokeRect(W / 2 - 60, 170, 120, 22);

    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('TRY AGAIN [ENTER]', W / 2, 184);
    ctx.restore();
  }

  _drawVictory(ctx, engine) {
    ctx.save();
    ctx.fillStyle = 'rgba(4, 12, 18, 0.92)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = C.green;
    ctx.textAlign = 'center';
    ctx.fillText('REALITY STABILIZED!', W / 2, 60);

    ctx.font = '9px monospace';
    ctx.fillStyle = C.cyan;
    ctx.fillText('You conquered the Entropy Engine and escaped the collapse.', W / 2, 80);

    // Rating (S, A, B)
    const timeUsed = 180 - engine.timer;
    let grade = 'S';
    if (timeUsed > 90 || engine.attempts < 3) grade = 'A';
    if (timeUsed > 130 || engine.attempts < 2) grade = 'B';

    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = C.yellow;
    ctx.fillText(`RANK: ${grade}`, W / 2, 120);

    ctx.font = '8px monospace';
    ctx.fillStyle = '#ccd4e6';
    ctx.fillText(`Escape Time: ${timeUsed.toFixed(1)}s`, W / 2, 145);
    ctx.fillText(`Remaining Energy: ${Math.round(engine.energy)}/100`, W / 2, 160);

    // Restart button
    ctx.fillStyle = 'rgba(50, 230, 161, 0.25)';
    ctx.fillRect(W / 2 - 60, 185, 120, 22);
    ctx.strokeStyle = C.green;
    ctx.strokeRect(W / 2 - 60, 185, 120, 22);

    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PLAY AGAIN [ENTER]', W / 2, 199);
    ctx.restore();
  }
}

function dtTextUpdate(arr, dt) {
  for (let i = arr.length - 1; i >= 0; i--) {
    arr[i].life -= dt;
    arr[i].y    -= dt * 16;
    if (arr[i].life <= 0) arr.splice(i, 1);
  }
  return arr;
}
