// ============================================================
// ENTROPY ENGINE — World & Entity Simulation
// ============================================================
import { TS, C } from './constants.js';
import { GRID, COLS, ROWS, WORLD_W, WORLD_H, DEFS } from './level.js';

export { WORLD_W, WORLD_H };

// ─────────────────────────────────────────────────────────────
// Tile & Collision Helpers
// ─────────────────────────────────────────────────────────────
export function tileAt(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return '#';
  return GRID[row][col] || '#';
}

export function isSolid(col, row, dim) {
  const t = tileAt(col, row);
  if (t === '#') return true;
  if (t === 'A') return dim === 'A';
  if (t === 'B') return dim === 'B';
  return false;
}

export function rectOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function overlapsWorld(x, y, w, h, dim) {
  const left   = Math.floor(x / TS);
  const right  = Math.floor((x + w - 0.001) / TS);
  const top    = Math.floor(y / TS);
  const bottom = Math.floor((y + h - 0.001) / TS);

  for (let c = left; c <= right; c++) {
    for (let r = top; r <= bottom; r++) {
      if (isSolid(c, r, dim)) return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// Moving Platform
// ─────────────────────────────────────────────────────────────
export class MovingPlatform {
  constructor(def) {
    this.id    = def.id;
    this.w     = 24;
    this.h     = 8;
    this.ox    = def.col * TS;
    this.oy    = def.row * TS;
    this.x     = this.ox;
    this.y     = this.oy;
    this.axis  = def.axis;   // 'x' or 'y'
    this.range = def.range;
    this.speed = def.speed;
    this.dir   = 1;
    this.dx    = 0;
    this.dy    = 0;
  }

  update(dt, frozen) {
    this.dx = 0;
    this.dy = 0;
    if (frozen) return;

    const move = this.speed * this.dir * dt;
    if (this.axis === 'x') {
      const prevX = this.x;
      this.x += move;
      if (this.x > this.ox + this.range) {
        this.x   = this.ox + this.range;
        this.dir = -1;
      } else if (this.x < this.ox) {
        this.x   = this.ox;
        this.dir = 1;
      }
      this.dx = this.x - prevX;
    } else {
      const prevY = this.y;
      this.y += move;
      if (this.y > this.oy + this.range) {
        this.y   = this.oy + this.range;
        this.dir = -1;
      } else if (this.y < this.oy) {
        this.y   = this.oy;
        this.dir = 1;
      }
      this.dy = this.y - prevY;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Saw Blade Hazard
// ─────────────────────────────────────────────────────────────
export class SawBlade {
  constructor(def) {
    this.id    = def.id;
    this.r     = 8;
    this.ox    = def.col * TS + 8;
    this.oy    = def.row * TS + 8;
    this.x     = this.ox;
    this.y     = this.oy;
    this.axis  = def.axis;
    this.range = def.range;
    this.speed = def.speed;
    this.dir   = 1;
    this.angle = 0;
  }

  update(dt, frozen) {
    if (!frozen) {
      this.angle += dt * 10 * this.dir;
      const move = this.speed * this.dir * dt;
      if (this.axis === 'x') {
        this.x += move;
        if (this.x > this.ox + this.range) {
          this.x   = this.ox + this.range;
          this.dir = -1;
        } else if (this.x < this.ox) {
          this.x   = this.ox;
          this.dir = 1;
        }
      } else {
        this.y += move;
        if (this.y > this.oy + this.range) {
          this.y   = this.oy + this.range;
          this.dir = -1;
        } else if (this.y < this.oy) {
          this.y   = this.oy;
          this.dir = 1;
        }
      }
    }
  }

  hits(target) {
    const cx = target.x + target.w / 2;
    const cy = target.y + target.h / 2;
    const distSq = (cx - this.x) ** 2 + (cy - this.y) ** 2;
    return distSq < (this.r + Math.min(target.w, target.h) / 2) ** 2;
  }
}

// ─────────────────────────────────────────────────────────────
// Laser Beam Hazard
// ─────────────────────────────────────────────────────────────
export class LaserBeam {
  constructor(def) {
    this.id            = def.id;
    this.axis          = def.axis; // 'h' or 'v'
    this.length        = def.length * TS;
    this.col           = def.col;
    this.row           = def.row;
    this.x             = def.col * TS;
    this.y             = def.row * TS;
    this.dimOnly       = def.dimOnly || null;
    this.barrierSwitch = def.barrierSwitch || null;
    this.active        = true;
    this.pulse         = 0;
  }

  getHitbox() {
    if (this.axis === 'h') {
      return { x: this.x, y: this.y + 6, w: this.length, h: 4 };
    } else {
      return { x: this.x + 6, y: this.y, w: 4, h: this.length };
    }
  }

  update(dt, dim) {
    this.pulse = (this.pulse + dt * 4) % (Math.PI * 2);
    if (this.dimOnly) {
      this.active = (this.dimOnly === dim);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Pushable Crate
// ─────────────────────────────────────────────────────────────
export class Crate {
  constructor(def) {
    this.id       = def.id;
    this.w        = 12;
    this.h        = 12;
    this.x        = def.col * TS + 2;
    this.y        = def.row * TS + 4;
    this.spawnX   = this.x;
    this.spawnY   = this.y;
    this.vx       = 0;
    this.vy       = 0;
    this.onGround = false;
  }

  reset() {
    this.x  = this.spawnX;
    this.y  = this.spawnY;
    this.vx = 0;
    this.vy = 0;
  }

  update(dt, gravDir, dim, platforms) {
    // Gravity
    this.vy += 400 * gravDir * dt;
    this.vy  = Math.max(-300, Math.min(300, this.vy));
    this.vx *= 0.8;

    // Y movement
    const stepsY = Math.abs(this.vy * dt);
    const signY  = Math.sign(this.vy);
    let remY     = stepsY;
    this.onGround = false;

    while (remY > 0) {
      const step = Math.min(remY, 1);
      const ny   = this.y + signY * step;
      let collides = overlapsWorld(this.x, ny, this.w, this.h, dim);

      if (!collides) {
        for (const p of platforms) {
          if (rectOverlap({ x: this.x, y: ny, w: this.w, h: this.h }, p)) {
            collides = true;
            break;
          }
        }
      }

      if (collides) {
        if (signY === gravDir) this.onGround = true;
        this.vy = 0;
        break;
      }
      this.y = ny;
      remY -= step;
    }

    // X movement
    const stepsX = Math.abs(this.vx * dt);
    const signX  = Math.sign(this.vx);
    let remX     = stepsX;

    while (remX > 0) {
      const step = Math.min(remX, 1);
      const nx   = this.x + signX * step;
      let collides = overlapsWorld(nx, this.y, this.w, this.h, dim);

      if (!collides) {
        for (const p of platforms) {
          if (rectOverlap({ x: nx, y: this.y, w: this.w, h: this.h }, p)) {
            collides = true;
            break;
          }
        }
      }

      if (collides) {
        this.vx = 0;
        break;
      }
      this.x = nx;
      remX -= step;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Pressure Switch
// ─────────────────────────────────────────────────────────────
export class PressureSwitch {
  constructor(def) {
    this.id      = def.id;
    this.x       = def.col * TS;
    this.y       = def.row * TS + 12;
    this.w       = 16;
    this.h       = 4;
    this.targets = def.targets || [];
    this.pressed = false;
  }

  update(player, crates) {
    let down = rectOverlap(this, player);
    if (!down) {
      for (const c of crates) {
        if (rectOverlap(this, c)) {
          down = true;
          break;
        }
      }
    }
    const changed = (down !== this.pressed);
    this.pressed = down;
    return changed;
  }
}

// ─────────────────────────────────────────────────────────────
// Energy Node (+25 Energy)
// ─────────────────────────────────────────────────────────────
export class EnergyNode {
  constructor(def) {
    this.id        = def.id;
    this.x         = def.col * TS + 2;
    this.y         = def.row * TS + 2;
    this.w         = 12;
    this.h         = 12;
    this.collected = false;
    this.pulse     = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.pulse = (this.pulse + dt * 3) % (Math.PI * 2);
  }
}

// ─────────────────────────────────────────────────────────────
// Reactor Core Node
// ─────────────────────────────────────────────────────────────
export class ReactorNode {
  constructor(def) {
    this.id     = def.id;
    this.sector = def.sector;
    this.label  = def.label;
    this.x      = def.col * TS;
    this.y      = def.row * TS;
    this.w      = 16;
    this.h      = 24;
    this.active = false;
    this.pulse  = 0;
  }

  update(dt) {
    this.pulse = (this.pulse + dt * (this.active ? 6 : 2)) % (Math.PI * 2);
  }
}

// ─────────────────────────────────────────────────────────────
// Sync Switch (A / B / C)
// ─────────────────────────────────────────────────────────────
export class SyncSwitch {
  constructor(def) {
    this.id                = def.id;
    this.label             = def.label;
    this.x                 = def.col * TS + 2;
    this.y                 = def.row * TS;
    this.w                 = 12;
    this.h                 = 16;
    this.active            = false;
    this.reqGravRev        = !!def.reqGravRev;
    this.reqDimB           = !!def.reqDimB;
    this.reqFrozenPlatform = def.reqFrozenPlatform || null;
    this.glow              = 0;
  }

  update(dt) {
    this.glow = (this.glow + dt * 4) % (Math.PI * 2);
  }
}

// ─────────────────────────────────────────────────────────────
// Checkpoint
// ─────────────────────────────────────────────────────────────
export class Checkpoint {
  constructor(def) {
    this.id     = def.id;
    this.x      = def.col * TS;
    this.y      = def.row * TS;
    this.w      = 16;
    this.h      = 16;
    this.active = false;
    this.pulse  = 0;
  }

  update(dt) {
    this.pulse = (this.pulse + dt * 3) % (Math.PI * 2);
  }
}

// ─────────────────────────────────────────────────────────────
// Collapsing Platform
// ─────────────────────────────────────────────────────────────
export class CollapsingPlatform {
  constructor(def) {
    this.id          = def.id;
    this.col         = def.col;
    this.row         = def.row;
    this.len         = def.len;
    this.x           = def.col * TS;
    this.y           = def.row * TS;
    this.w           = def.len * TS;
    this.h           = 6;
    this.state       = 'idle'; // 'idle', 'shaking', 'collapsed'
    this.shakeTimer  = 0;
    this.respawnTimer= 0;
    this.shakeOffset = 0;
  }

  stepOn() {
    if (this.state === 'idle') {
      this.state      = 'shaking';
      this.shakeTimer = 0.6;
    }
  }

  update(dt) {
    if (this.state === 'shaking') {
      this.shakeTimer -= dt;
      this.shakeOffset = (Math.random() - 0.5) * 3;
      if (this.shakeTimer <= 0) {
        this.state        = 'collapsed';
        this.respawnTimer = 3.0;
        this.shakeOffset  = 0;
        return true; // triggered collapse sound
      }
    } else if (this.state === 'collapsed') {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.state = 'idle';
      }
    }
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Reactor Shockwave Pulse (Post-overload hazard)
// ─────────────────────────────────────────────────────────────
export class ReactorPulse {
  constructor(cx, cy, maxR = 260) {
    this.cx    = cx;
    this.cy    = cy;
    this.r     = 10;
    this.maxR  = maxR;
    this.speed = 110;
    this.alive = true;
    this.width = 12;
  }

  update(dt, frozen) {
    if (frozen) return;
    this.r += this.speed * dt;
    if (this.r > this.maxR) this.alive = false;
  }

  hits(target) {
    const tx = target.x + target.w / 2;
    const ty = target.y + target.h / 2;
    const dist = Math.hypot(tx - this.cx, ty - this.cy);
    return Math.abs(dist - this.r) < this.width / 2 + 4;
  }
}

// ─────────────────────────────────────────────────────────────
// Particles
// ─────────────────────────────────────────────────────────────
export class Particle {
  constructor(x, y, vx, vy, color, life, size = 2) {
    this.x     = x;
    this.y     = y;
    this.vx    = vx;
    this.vy    = vy;
    this.color = color;
    this.life  = life;
    this.maxL  = life;
    this.size  = size;
  }

  update(dt, frozen = false) {
    if (!frozen) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }
    this.life -= dt;
  }
}

export function burst(arr, x, y, color, count = 8, speed = 60, size = 2) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd   = (0.4 + Math.random() * 0.6) * speed;
    arr.push(
      new Particle(
        x,
        y,
        Math.cos(angle) * spd,
        Math.sin(angle) * spd,
        color,
        0.3 + Math.random() * 0.4,
        size
      )
    );
  }
}
