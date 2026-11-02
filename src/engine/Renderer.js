// ============================================================
// ENTROPY ENGINE — Pixel-Art Canvas Renderer & HUD
// Matches reference images with authentic sci-fi aesthetics
// ============================================================
import { W, H, TS, C, FREEZE_DURATION, FREEZE_COOLDOWN } from './constants.js';
import { COLS, ROWS, WORLD_W, WORLD_H, DEFS } from './level.js';
import { tileAt } from './World.js';
import { heroFrame, drawSprite } from '../level3_gravity/sprites.js';

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

    // 4. Player (Matches Level 3 & Level 4 Hero exactly)
    if (player && !player.dead) {
      this._drawPlayer(ctx, player, energy, t);
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

    // Core containment ring
    ctx.strokeStyle = overloaded ? 'rgba(255, 59, 77, 0.4)' : 'rgba(0, 229, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(reactorCenterX, reactorCenterY, 80 + Math.sin(t * 2) * 4, 0, Math.PI * 2);
    ctx.stroke();

    // Floating quantum dust / particle field
    for (const d of BG_DUST) {
      const px = ((d.x - camX * d.speed) % WORLD_W + WORLD_W) % WORLD_W;
      const py = ((d.y - camY * d.speed) % WORLD_H + WORLD_H) % WORLD_H;
      ctx.fillStyle = d.color;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(px, py, d.size, d.size);
    }
    ctx.restore();
  }

  // ─────────────────────────────────────────────────────────────
  // Tilemap (Sector Walls & Dimensional Blocks)
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
          // Solid industrial chamber walls with dark cyber panelling
          ctx.fillStyle = '#0f1423';
          ctx.fillRect(x, y, TS, TS);
          ctx.strokeStyle = '#1b233a';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, TS - 1, TS - 1);

          // Subtle metallic bevel on top edge
          ctx.fillStyle = '#222d4a';
          ctx.fillRect(x + 1, y + 1, TS - 2, 2);
        } else if (tile === 'A') {
          // Dimension A block (Cyan)
          if (dim === 'A') {
            ctx.fillStyle = '#004c66';
            ctx.fillRect(x, y, TS, TS);
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 1, y + 1, TS - 2, TS - 2);

            // Glowing circuit trace
            ctx.fillStyle = '#00e5ff';
            ctx.fillRect(x + 4, y + 4, 3, 3);
            ctx.fillRect(x + 9, y + 9, 3, 3);
          } else {
            // Inactive ghost outline in Dimension B
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.18)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(x + 1.5, y + 1.5, TS - 3, TS - 3);
            ctx.setLineDash([]);
          }
        } else if (tile === 'B') {
          // Dimension B block (Magenta)
          if (dim === 'B') {
            ctx.fillStyle = '#660055';
            ctx.fillRect(x, y, TS, TS);
            ctx.strokeStyle = '#ff00d4';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 1, y + 1, TS - 2, TS - 2);

            // Glowing circuit trace
            ctx.fillStyle = '#ff00d4';
            ctx.fillRect(x + 9, y + 4, 3, 3);
            ctx.fillRect(x + 4, y + 9, 3, 3);
          } else {
            // Inactive ghost outline in Dimension A
            ctx.strokeStyle = 'rgba(255, 0, 212, 0.18)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(x + 1.5, y + 1.5, TS - 3, TS - 3);
            ctx.setLineDash([]);
          }
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Interactive Entities
  // ─────────────────────────────────────────────────────────────
  _drawEntropyFields(ctx, fields, t) {
    for (const f of fields) {
      const x = f.col * TS;
      const y = f.row * TS;
      const w = f.w * TS;
      const h = f.h * TS;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 59, 77, 0.12)';
      ctx.fillRect(x, y, w, h);

      // Warning perimeter tape
      ctx.strokeStyle = 'rgba(255, 59, 77, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

      // Rising hazard radiation lines
      ctx.strokeStyle = 'rgba(255, 100, 120, 0.3)';
      const wave = (t * 40) % 16;
      for (let lx = x + 4; lx < x + w; lx += 12) {
        ctx.beginPath();
        ctx.moveTo(lx, y + h);
        ctx.lineTo(lx, y + h - ((wave + (lx % 8)) % h));
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  _drawExitPortal(ctx, exitDef, unlocked, t) {
    const x = exitDef.col * TS;
    const y = exitDef.row * TS;

    ctx.save();
    if (unlocked) {
      // Swirling Quantum Breach Portal
      const grad = ctx.createRadialGradient(x + 8, y + 10, 2, x + 8, y + 10, 16);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#00e5ff');
      grad.addColorStop(0.8, '#6a00ff');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - 4, y - 2, 24, 24);

      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 1, y + 1, 14, 18);
    } else {
      // Locked Blast Vault Door
      ctx.fillStyle = '#1e2433';
      ctx.fillRect(x, y, 16, 20);
      ctx.strokeStyle = '#ff3b4d';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 0.5, y + 0.5, 15, 19);

      // Red lock insignia
      ctx.fillStyle = '#ff3b4d';
      ctx.fillRect(x + 6, y + 8, 4, 4);
    }
    ctx.restore();
  }

  _drawCheckpoints(ctx, checkpoints, t) {
    for (const cp of checkpoints) {
      ctx.save();
      const color = cp.active ? C.green : C.gray;
      ctx.fillStyle = color;
      ctx.fillRect(cp.x + 6, cp.y + 4, 4, 12);

      // Flag pennant
      ctx.fillStyle = cp.active ? '#32e6a1' : '#556075';
      ctx.beginPath();
      ctx.moveTo(cp.x + 10, cp.y + 4);
      ctx.lineTo(cp.x + 15, cp.y + 7);
      ctx.lineTo(cp.x + 10, cp.y + 10);
      ctx.fill();

      if (cp.active) {
        ctx.shadowColor = '#32e6a1';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cp.x + 7, cp.y + 5, 2, 3);
      }
      ctx.restore();
    }
  }

  _drawReactorNodes(ctx, nodes, t) {
    for (const rn of nodes) {
      ctx.save();
      const x = rn.x;
      const y = rn.y;

      // Outer housing
      ctx.fillStyle = '#1b1b26';
      ctx.fillRect(x + 2, y + 4, 12, 16);
      ctx.strokeStyle = rn.active ? '#ffa500' : '#4a4d5e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 2, y + 4, 12, 16);

      // Core plasma sphere
      if (rn.active) {
        const glow = ctx.createRadialGradient(x + 8, y + 12, 1, x + 8, y + 12, 8);
        glow.addColorStop(0, '#ffffff');
        glow.addColorStop(0.5, '#ffa500');
        glow.addColorStop(1, 'rgba(255, 165, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x, y + 4, 16, 16);
      } else {
        ctx.fillStyle = '#333745';
        ctx.fillRect(x + 6, y + 10, 4, 4);
      }
      ctx.restore();
    }
  }

  _drawSyncSwitches(ctx, switches, t) {
    for (const sw of switches) {
      ctx.save();
      const x = sw.x;
      const y = sw.y;

      ctx.fillStyle = '#151a28';
      ctx.fillRect(x, y + 4, 12, 12);
      ctx.strokeStyle = sw.active ? '#32e6a1' : '#00e5ff';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 4.5, 11, 11);

      // Switch Letter Label
      ctx.fillStyle = sw.active ? '#32e6a1' : '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sw.label, x + 6, y + 13);
      ctx.restore();
    }
  }

  _drawPressureSwitches(ctx, switches) {
    for (const ps of switches) {
      ctx.save();
      const h = ps.pressed ? 2 : 4;
      const y = ps.y + (4 - h);
      ctx.fillStyle = ps.pressed ? '#32e6a1' : '#ffaa00';
      ctx.fillRect(ps.x + 2, y, 12, h);
      ctx.fillStyle = '#1b233a';
      ctx.fillRect(ps.x, ps.y + 4, 16, 2);
      ctx.restore();
    }
  }

  _drawCollapsingPlatforms(ctx, platforms) {
    for (const cp of platforms) {
      if (cp.state === 'gone') continue;
      ctx.save();
      const shakeOffset = cp.state === 'shaking' ? (Math.random() - 0.5) * 2 : 0;
      ctx.fillStyle = cp.state === 'shaking' ? '#ff3b4d' : '#2a3552';
      ctx.fillRect(cp.x + shakeOffset, cp.y, cp.w, cp.h);
      ctx.strokeStyle = '#475a8a';
      ctx.lineWidth = 1;
      ctx.strokeRect(cp.x + shakeOffset + 0.5, cp.y + 0.5, cp.w - 1, cp.h - 1);
      ctx.restore();
    }
  }

  _drawMovingPlatforms(ctx, platforms, freezeActive) {
    for (const p of platforms) {
      ctx.save();
      ctx.fillStyle = freezeActive ? '#006680' : '#1c3050';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = freezeActive ? '#00e5ff' : '#00a3cc';
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);

      // Tread track markings
      ctx.fillStyle = freezeActive ? '#00e5ff' : '#00ccff';
      ctx.fillRect(p.x + 2, p.y + 2, 4, 2);
      ctx.fillRect(p.x + p.w - 6, p.y + 2, 4, 2);
      ctx.restore();
    }
  }

  _drawCrates(ctx, crates) {
    for (const c of crates) {
      ctx.save();
      ctx.fillStyle = '#6a4a28';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = '#d49b55';
      ctx.lineWidth = 1;
      ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);

      // Metal cross bracing
      ctx.beginPath();
      ctx.moveTo(c.x + 2, c.y + 2);
      ctx.lineTo(c.x + c.w - 2, c.y + c.h - 2);
      ctx.moveTo(c.x + c.w - 2, c.y + 2);
      ctx.lineTo(c.x + 2, c.y + c.h - 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawEnergyNodes(ctx, nodes, t) {
    for (const en of nodes) {
      if (en.collected) continue;
      ctx.save();
      const bob = Math.sin(t * 4 + en.x) * 2;
      const x = en.x;
      const y = en.y + bob;

      // Golden diamond energy pickup
      ctx.fillStyle = '#ffd23a';
      ctx.beginPath();
      ctx.moveTo(x + 6, y);
      ctx.lineTo(x + 12, y + 6);
      ctx.lineTo(x + 6, y + 12);
      ctx.lineTo(x, y + 6);
      ctx.closePath();
      ctx.fill();

      // White inner core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 5, y + 5, 2, 2);
      ctx.restore();
    }
  }

  _drawLasers(ctx, lasers, t) {
    for (const las of lasers) {
      if (!las.active) continue;
      ctx.save();
      const beamColor = las.dim === 'A' ? '#00e5ff' : '#ff00d4';

      if (las.axis === 'x') {
        const lx = las.col * TS;
        const ly = las.row * TS + 7;
        const lw = las.len * TS;

        ctx.strokeStyle = beamColor;
        ctx.lineWidth = 2 + Math.sin(t * 12) * 0.8;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + lw, ly);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + lw, ly);
        ctx.stroke();
      } else {
        const lx = las.col * TS + 7;
        const ly = las.row * TS;
        const lh = las.len * TS;

        ctx.strokeStyle = beamColor;
        ctx.lineWidth = 2 + Math.sin(t * 12) * 0.8;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx, ly + lh);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx, ly + lh);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  _drawSaws(ctx, saws) {
    for (const saw of saws) {
      ctx.save();
      ctx.translate(saw.x, saw.y);
      ctx.rotate(saw.rot);

      // Circular blade
      ctx.fillStyle = '#7a8899';
      ctx.beginPath();
      ctx.arc(0, 0, saw.radius, 0, Math.PI * 2);
      ctx.fill();

      // Saw teeth
      ctx.fillStyle = '#ff3b4d';
      const teeth = 8;
      for (let i = 0; i < teeth; i++) {
        const angle = (i / teeth) * Math.PI * 2;
        const tx = Math.cos(angle) * (saw.radius + 2);
        const ty = Math.sin(angle) * (saw.radius + 2);
        ctx.fillRect(tx - 1, ty - 1, 2, 2);
      }

      // Center rivet
      ctx.fillStyle = '#101626';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  _drawReactorPulses(ctx, pulses) {
    for (const rp of pulses) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 59, 77, 0.45)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(rp.ox, rp.oy, rp.currentR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Player Drawing (Matches Level 3 & Level 4 Hero exactly)
  // ─────────────────────────────────────────────────────────────
  _drawPlayer(ctx, player, energy, t) {
    ctx.save();

    const isBlinking = player.invincible > 0 && Math.floor(player.invincible * 16) % 2 === 0;
    if (isBlinking) ctx.globalAlpha = 0.4;

    // Direct gravity direction from player (1 = floor, -1 = ceiling)
    const gravDir = player ? player.gravDir : 1;

    // Draw Exact Level 3 Hero Frame (Idle, 4-step Running, Jumping) cleanly without any background box
    // flipY = true when gravDir < 0 so character flips upside-down on ceiling
    const frame = heroFrame({ on: player.onGround, vx: player.vx }, t);
    drawSprite(
      ctx,
      frame,
      player.x - 2,
      player.y - 1,
      player.face < 0,
      gravDir < 0,
      player.scaleX,
      player.scaleY
    );

    // Subtle jump spark if in mid-air
    if (!player.onGround) {
      ctx.fillStyle = Math.random() > 0.5 ? '#00e5ff' : '#ffa500';
      ctx.fillRect(player.x + 3, player.y + 14, 1.5, 2);
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
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Screen Post-Processing Effects
  // ─────────────────────────────────────────────────────────────
  _drawFreezeVignette(ctx, freezeTimer) {
    ctx.save();
    const frost = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.7);
    frost.addColorStop(0, 'rgba(0, 229, 255, 0)');
    frost.addColorStop(1, 'rgba(0, 229, 255, 0.28)');
    ctx.fillStyle = frost;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  _drawOverloadAura(ctx, t) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 59, 77, ${0.05 + Math.sin(t * 8) * 0.03})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

function dtTextUpdate(texts, dt) {
  for (let i = texts.length - 1; i >= 0; i--) {
    texts[i].life -= dt;
    texts[i].y    -= dt * 14;
    if (texts[i].life <= 0) texts.splice(i, 1);
  }
  return texts;
}
