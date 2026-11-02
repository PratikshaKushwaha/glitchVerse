// ============================================================
// ENTROPY ENGINE — Player Controller
// ============================================================
import { PLAYER_W, PLAYER_H, PLAYER_SPEED, PLAYER_JUMP, GRAVITY_ACC, TS } from './constants.js';
import { overlapsWorld, rectOverlap, WORLD_W, WORLD_H } from './World.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Player {
  constructor(spawnX, spawnY) {
    this.w          = PLAYER_W;
    this.h          = PLAYER_H;
    this.spawnX     = spawnX;
    this.spawnY     = spawnY;
    this.x          = spawnX;
    this.y          = spawnY;
    this.vx         = 0;
    this.vy         = 0;
    this.onGround   = false;
    this.gravDir    = 1;   // 1 = down, -1 = up
    this.coyoteT    = 0;
    this.jumpBufferT= 0;
    this.face       = 1;   // 1 = right, -1 = left
    this.walkT      = 0;
    this.scaleX     = 1;
    this.scaleY     = 1;
    this.invincible = 0;
    this.dead       = false;
    this.deathTimer = 0;
  }

  respawn(x, y) {
    this.x          = x ?? this.spawnX;
    this.y          = y ?? this.spawnY;
    this.vx         = 0;
    this.vy         = 0;
    this.onGround   = false;
    this.gravDir    = 1;
    this.coyoteT    = 0;
    this.jumpBufferT= 0;
    this.scaleX     = 1;
    this.scaleY     = 1;
    this.dead       = false;
    this.deathTimer = 0;
    this.invincible = 1.0;
  }

  setSpawn(x, y) {
    this.spawnX = x;
    this.spawnY = y;
  }

  flipGravity() {
    this.gravDir *= -1;
    this.onGround = false;
    this.vy       = this.gravDir * 40;
    this.scaleX   = 0.7;
    this.scaleY   = 1.4;
  }

  update(dt, input, dim, platforms, collapsingPlatforms, crates) {
    if (this.dead) {
      this.deathTimer -= dt;
      return;
    }

    if (this.invincible > 0) this.invincible -= dt;

    // Ease squash/stretch back to 1
    this.scaleX += (1 - this.scaleX) * dt * 10;
    this.scaleY += (1 - this.scaleY) * dt * 10;

    const left     = input.left();
    const right    = input.right();
    const jump     = input.jump();
    const jumpHeld = input.jumpHeld();

    // Horizontal Movement
    const targetVx = (right ? 1 : 0) - (left ? 1 : 0);
    if (targetVx !== 0) {
      this.face   = targetVx;
      this.vx    += (targetVx * PLAYER_SPEED - this.vx) * 0.32;
      this.walkT += dt * 9;
    } else {
      this.vx    *= 0.75;
      this.walkT += dt * 2;
    }

    // Gravity
    this.vy += GRAVITY_ACC * this.gravDir * dt;
    this.vy  = clamp(this.vy, -380, 380);

    // Variable Jump Cut (letting go of jump reduces ascent)
    if (this.vy * this.gravDir < -40 && !jumpHeld) {
      this.vy += GRAVITY_ACC * this.gravDir * 1.6 * dt;
    }

    // Jump Buffering & Coyote Time
    if (jump) this.jumpBufferT = 0.12;
    if (this.jumpBufferT > 0) this.jumpBufferT -= dt;
    if (this.onGround) this.coyoteT = 0.1;
    if (this.coyoteT > 0) this.coyoteT -= dt;

    const wasOnGround = this.onGround;
    this.onGround = false;

    // Y Axis Movement
    const stepsY = Math.abs(this.vy * dt);
    const signY  = Math.sign(this.vy);
    let remY     = stepsY;

    while (remY > 0) {
      const step = Math.min(remY, 1);
      const ny   = this.y + signY * step;

      let collides = overlapsWorld(this.x, ny, this.w, this.h, dim);

      // Check moving platforms
      if (!collides) {
        for (const p of platforms) {
          if (rectOverlap({ x: this.x, y: ny, w: this.w, h: this.h }, p)) {
            // Standing on platform
            if (this.gravDir === 1 && signY >= 0 && this.y + this.h <= p.y + 2) {
              collides = true;
              break;
            } else if (this.gravDir === -1 && signY <= 0 && this.y >= p.y + p.h - 2) {
              collides = true;
              break;
            }
          }
        }
      }

      // Check collapsing platforms
      if (!collides) {
        for (const cp of collapsingPlatforms) {
          if (cp.state !== 'collapsed' && rectOverlap({ x: this.x, y: ny, w: this.w, h: this.h }, cp)) {
            if (this.gravDir === 1 && signY >= 0 && this.y + this.h <= cp.y + 2) {
              cp.stepOn();
              collides = true;
              break;
            } else if (this.gravDir === -1 && signY <= 0 && this.y >= cp.y + cp.h - 2) {
              cp.stepOn();
              collides = true;
              break;
            }
          }
        }
      }

      // Check crates
      if (!collides) {
        for (const c of crates) {
          if (rectOverlap({ x: this.x, y: ny, w: this.w, h: this.h }, c)) {
            collides = true;
            break;
          }
        }
      }

      if (collides) {
        if (signY === this.gravDir) {
          this.onGround = true;
          if (!wasOnGround) {
            this.scaleX = 1.35;
            this.scaleY = 0.72;
          }
        }
        this.vy = 0;
        break;
      }
      this.y = ny;
      remY -= step;
    }

    // Jump Execution
    if (this.jumpBufferT > 0 && (this.onGround || this.coyoteT > 0)) {
      this.vy          = -PLAYER_JUMP * this.gravDir;
      this.jumpBufferT = 0;
      this.coyoteT     = 0;
      this.onGround    = false;
      this.scaleX      = 0.75;
      this.scaleY      = 1.35;
      return 'jump'; // signal audio
    }

    // X Axis Movement
    const stepsX = Math.abs(this.vx * dt);
    const signX  = Math.sign(this.vx);
    let remX     = stepsX;

    while (remX > 0) {
      const step = Math.min(remX, 1);
      const nx   = this.x + signX * step;

      let collides = overlapsWorld(nx, this.y, this.w, this.h, dim);

      // Crate pushing
      if (!collides) {
        for (const c of crates) {
          if (rectOverlap({ x: nx, y: this.y, w: this.w, h: this.h }, c)) {
            c.vx = signX * 36;
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

    // Riding moving platforms
    if (this.onGround) {
      for (const p of platforms) {
        const footBox = this.gravDir === 1
          ? { x: this.x, y: this.y + this.h - 1, w: this.w, h: 2 }
          : { x: this.x, y: this.y - 1, w: this.w, h: 2 };

        if (rectOverlap(footBox, p)) {
          this.x += p.dx;
          this.y += p.dy;
          break;
        }
      }
    }

    // World bounds clamping
    this.x = clamp(this.x, TS, WORLD_W - TS - this.w);
    if (this.y < 0 || this.y > WORLD_H + 20) {
      return 'void_fall';
    }

    return null;
  }
}
