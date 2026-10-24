import { useState, useEffect, useRef } from 'react'
import { sound } from '../utils/AudioEngine'

export default function LevelFourGame({ onComplete, onExit }) {
  const canvasRef = useRef(null)

  // Game state
  const [timeLeft, setTimeLeft] = useState(150) // 2:30 countdown
  const [playerHp, setPlayerHp] = useState(3)
  const [bossHp, setBossHp] = useState(100)
  const [bossMaxHp] = useState(100)
  const [tethersLeft, setTethersLeft] = useState([true, true, true]) // 3 tether nodes
  const [dashCooldown, setDashCooldown] = useState(0) // 0 to 100%
  const [empReady, setEmpReady] = useState(true)
  const [empCooldownTimer, setEmpCooldownTimer] = useState(0)

  // Dialogue system
  const [activeDialogue, setActiveDialogue] = useState({
    speaker: 'JOKER',
    avatar: '🤡',
    color: 'text-purple-400 border-purple-500',
    text: "AHAHAHA! Look who crawled out of the trash heap! The Developer thought he was in control... but I'M pulling the strings now!",
  })
  const [dialogueVisible, setDialogueVisible] = useState(true)

  // Game over / Victory
  const [isGameOver, setIsGameOver] = useState(false)
  const [isVictory, setIsVictory] = useState(false)

  // Internal mutable state for smooth 60FPS canvas loop
  const gameState = useRef({
    // Player
    player: {
      x: 150,
      y: 400,
      vx: 0,
      vy: 0,
      width: 32,
      height: 48,
      isGrounded: false,
      jumpsLeft: 2,
      facingRight: true,
      isDashing: false,
      dashTime: 0,
      invulnerableTime: 0,
      currentPlatform: null,
    },
    // Boss
    boss: {
      x: 500,
      y: 90,
      vx: 1.8,
      width: 140,
      height: 90,
      shieldActive: true,
      puppetOffset: { x: 0, y: 110 },
      attackTimer: 0,
      attackPhase: 1, // 1: Tethers up, 2: Barrage, 3: Overdrive
    },
    // 3 Tether Nodes
    tetherNodes: [
      { id: 0, xOffset: -45, yOffset: 65, hp: 4, active: true },
      { id: 1, xOffset: 0, yOffset: 75, hp: 4, active: true },
      { id: 2, xOffset: 45, yOffset: 65, hp: 4, active: true },
    ],
    // Moving platforms
    platforms: [
      // Base Floor
      { x: 0, y: 560, w: 1200, h: 40, vx: 0, vy: 0, isFloor: true, color: '#091528' },
      // Platform 1 (Horizontal Lower-Left)
      { x: 100, y: 460, w: 160, h: 18, minX: 80, maxX: 320, vx: 1.5, vy: 0, color: '#06b6d4' },
      // Platform 2 (Vertical Elevator Left)
      { x: 260, y: 340, w: 140, h: 18, minY: 200, maxY: 380, vx: 0, vy: 1.4, color: '#38bdf8' },
      // Platform 3 (Horizontal Center)
      { x: 440, y: 390, w: 180, h: 18, minX: 380, maxX: 640, vx: -1.6, vy: 0, color: '#a855f7' },
      // Platform 4 (Vertical Elevator Right)
      { x: 720, y: 260, w: 140, h: 18, minY: 180, maxY: 360, vx: 0, vy: -1.5, color: '#ec4899' },
      // Platform 5 (Horizontal Lower-Right)
      { x: 820, y: 450, w: 160, h: 18, minX: 680, maxX: 940, vx: 1.8, vy: 0, color: '#10b981' },
      // High Boss Platform (Carries the Joker & Developer)
      { x: 420, y: 130, w: 240, h: 22, minX: 250, maxX: 700, vx: 1.2, vy: 0, color: '#ef4444', isBossPlatform: true },
    ],
    // Bullets & Projectiles
    playerBullets: [],
    bossProjectiles: [],
    particles: [],
    mousePos: { x: 500, y: 250 },
    keys: { left: false, right: false, up: false, shoot: false },
    lastShotTime: 0,
    dashCooldownRemaining: 0,
    empCooldownRemaining: 0,
  })

  // Timer loop
  useEffect(() => {
    if (isGameOver || isVictory) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true)
          sound.playDoorLocked()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isGameOver, isVictory])

  // Dialogue sequence triggers
  const triggerDialogue = (speaker, avatar, color, text, duration = 4000) => {
    setActiveDialogue({ speaker, avatar, color, text })
    setDialogueVisible(true)
    setTimeout(() => {
      setDialogueVisible(false)
    }, duration)
  }

  // Initial intro dialogue
  useEffect(() => {
    sound.playJokerLaugh()
    const t1 = setTimeout(() => {
      triggerDialogue(
        'DEVELOPER',
        '👨‍💻',
        'text-cyan-300 border-cyan-400',
        "Player! Watch out! He's using holographic tether strings! Aim your blaster at the 3 glowing nodes on his platform!",
        4500
      )
    }, 4500)
    return () => clearTimeout(t1)
  }, [])

  // Input listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') gameState.current.keys.left = true
      if (e.code === 'KeyD' || e.code === 'ArrowRight') gameState.current.keys.right = true
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        handlePlayerJump()
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        handlePlayerDash()
      }
      if (e.code === 'KeyE' || e.code === 'KeyQ') {
        handlePlayerEmp()
      }
    }

    const handleKeyUp = (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') gameState.current.keys.left = false
      if (e.code === 'KeyD' || e.code === 'ArrowRight') gameState.current.keys.right = false
    }

    const handleMouseMove = (e) => {
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      gameState.current.mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseDown = (e) => {
      if (e.button === 0) {
        shootPlayerBullet()
      } else if (e.button === 2) {
        e.preventDefault()
        handlePlayerDash()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('contextmenu', (e) => e.preventDefault())

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [playerHp, isGameOver, isVictory])

  // Player Jump
  const handlePlayerJump = () => {
    const p = gameState.current.player
    if (p.isGrounded || p.jumpsLeft > 0) {
      p.vy = -12.5
      p.isGrounded = false
      p.jumpsLeft -= 1
      p.currentPlatform = null
      sound.playJumpSound()

      // Jump dust particles
      for (let i = 0; i < 6; i++) {
        gameState.current.particles.push({
          x: p.x + p.width / 2,
          y: p.y + p.height,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 2,
          radius: Math.random() * 3 + 1,
          color: '#38bdf8',
          alpha: 1,
          life: 20,
        })
      }
    }
  }

  // Player Glitch Dash
  const handlePlayerDash = () => {
    const s = gameState.current
    if (s.dashCooldownRemaining > 0 || s.player.isDashing) return

    s.player.isDashing = true
    s.player.dashTime = 12
    s.player.invulnerableTime = 20
    s.dashCooldownRemaining = 90 // 1.5s cooldown
    sound.playDashSound()

    const dir = s.player.facingRight ? 1 : -1
    s.player.vx = dir * 18

    // Ghost dash trail particles
    for (let i = 0; i < 8; i++) {
      s.particles.push({
        x: s.player.x + Math.random() * s.player.width,
        y: s.player.y + Math.random() * s.player.height,
        vx: -dir * Math.random() * 4,
        vy: (Math.random() - 0.5) * 2,
        radius: 4,
        color: '#06b6d4',
        alpha: 0.9,
        life: 18,
      })
    }
  }

  // Player EMP Pulse Burst
  const handlePlayerEmp = () => {
    const s = gameState.current
    if (s.empCooldownRemaining > 0) return

    sound.playPuppetStringSnap()
    s.empCooldownRemaining = 360 // 6s cooldown
    setEmpReady(false)
    setEmpCooldownTimer(6)

    // Clear all boss projectiles & stun
    s.bossProjectiles = []

    // Big EMP Shockwave particle ring
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      s.particles.push({
        x: s.player.x + s.player.width / 2,
        y: s.player.y + s.player.height / 2,
        vx: Math.cos(a) * 9,
        vy: Math.sin(a) * 9,
        radius: 4,
        color: '#a855f7',
        alpha: 1,
        life: 25,
      })
    }

    triggerDialogue(
      'DEVELOPER',
      '👨‍💻',
      'text-emerald-400 border-emerald-500',
      'EMP Pulse Activated! Boss projectiles wiped!',
      2500
    )
  }

  // Shoot Blaster Bolt toward mouse cursor
  const shootPlayerBullet = () => {
    const s = gameState.current
    const now = performance.now()
    if (now - s.lastShotTime < 140 || isGameOver || isVictory) return
    s.lastShotTime = now

    const px = s.player.x + s.player.width / 2
    const py = s.player.y + s.player.height / 2
    const angle = Math.atan2(s.mousePos.y - py, s.mousePos.x - px)
    const speed = 16

    s.playerBullets.push({
      x: px,
      y: py,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 4.5,
      color: '#38bdf8',
      life: 90,
    })

    sound.playLaserShoot()

    // Recoil
    s.player.vx -= Math.cos(angle) * 1.2
  }

  // MAIN 60FPS GAME LOOP
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    const render = () => {
      const s = gameState.current
      const p = s.player
      const b = s.boss
      const width = canvas.width
      const height = canvas.height

      // 1. UPDATE MOVING PLATFORMS
      s.platforms.forEach((plat) => {
        if (plat.minX !== undefined) {
          plat.x += plat.vx
          if (plat.x <= plat.minX || plat.x + plat.w >= plat.maxX) {
            plat.vx *= -1
          }
        }
        if (plat.minY !== undefined) {
          plat.y += plat.vy
          if (plat.y <= plat.minY || plat.y + plat.h >= plat.maxY) {
            plat.vy *= -1
          }
        }
        // Boss platform syncs boss position
        if (plat.isBossPlatform) {
          b.x = plat.x + plat.w / 2 - b.width / 2
          b.y = plat.y - b.height
        }
      })

      // 2. UPDATE PLAYER PHYSICS & MOVEMENT
      if (s.dashCooldownRemaining > 0) {
        s.dashCooldownRemaining--
        setDashCooldown(Math.round((s.dashCooldownRemaining / 90) * 100))
      }

      if (s.empCooldownRemaining > 0) {
        s.empCooldownRemaining--
        if (s.empCooldownRemaining === 0) setEmpReady(true)
      }

      if (p.invulnerableTime > 0) p.invulnerableTime--

      if (p.isDashing) {
        p.dashTime--
        if (p.dashTime <= 0) {
          p.isDashing = false
          p.vx *= 0.4
        }
      } else {
        // Normal horizontal acceleration
        const moveAccel = 0.9
        const maxSpeed = 5.2
        if (s.keys.left) {
          p.vx -= moveAccel
          p.facingRight = false
        } else if (s.keys.right) {
          p.vx += moveAccel
          p.facingRight = true
        } else {
          p.vx *= 0.8
        }
        p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx))

        // Gravity
        p.vy += 0.55
        if (p.vy > 14) p.vy = 14
      }

      // If standing on moving platform, ride with its velocity
      if (p.currentPlatform) {
        p.x += p.currentPlatform.vx
        p.y += p.currentPlatform.vy
      }

      p.x += p.vx
      p.y += p.vy

      // Canvas boundary limits
      if (p.x < 10) p.x = 10
      if (p.x + p.width > width - 10) p.x = width - 10 - p.width

      // 3. PLATFORM COLLISION DETECTION
      p.isGrounded = false
      p.currentPlatform = null

      s.platforms.forEach((plat) => {
        // AABB check for landing on top of platform
        const prevY = p.y - p.vy
        if (
          p.x + p.width > plat.x + 4 &&
          p.x < plat.x + plat.w - 4 &&
          prevY + p.height <= plat.y + 6 &&
          p.y + p.height >= plat.y &&
          p.vy >= 0
        ) {
          p.y = plat.y - p.height
          p.vy = 0
          p.isGrounded = true
          p.jumpsLeft = 2
          p.currentPlatform = plat
        }
      })

      // 4. UPDATE BOSS ATTACK PATTERNS
      b.attackTimer++
      // Phase 1: Throws glitched cards down every 75 frames
      const attackInterval = b.attackPhase === 3 ? 42 : b.attackPhase === 2 ? 55 : 75
      if (b.attackTimer > attackInterval && !isVictory && !isGameOver) {
        b.attackTimer = 0
        const throwX = b.x + b.width / 2 + (Math.random() - 0.5) * 60
        const throwY = b.y + b.height

        const targetAngle = Math.atan2(
          p.y - throwY,
          p.x + p.width / 2 - throwX
        )

        s.bossProjectiles.push({
          x: throwX,
          y: throwY,
          vx: Math.cos(targetAngle) * (4.2 + (b.attackPhase === 3 ? 2.5 : 0)),
          vy: Math.sin(targetAngle) * 4.5,
          radius: 8,
          rotation: 0,
          color: b.attackPhase === 3 ? '#ef4444' : '#ec4899',
          life: 140,
        })

        // Chance of boss taunt laugh
        if (Math.random() < 0.25) sound.playJokerLaugh()
      }

      // 5. UPDATE PLAYER BULLETS & COLLISION
      for (let i = s.playerBullets.length - 1; i >= 0; i--) {
        const bullet = s.playerBullets[i]
        bullet.x += bullet.vx
        bullet.y += bullet.vy
        bullet.life--

        let bulletHit = false

        // Check hit on Tether Nodes
        s.tetherNodes.forEach((node) => {
          if (!node.active) return
          const nodeWorldX = b.x + b.width / 2 + node.xOffset
          const nodeWorldY = b.y + b.puppetOffset.y + node.yOffset

          const dist = Math.hypot(bullet.x - nodeWorldX, bullet.y - nodeWorldY)
          if (dist < 18) {
            bulletHit = true
            node.hp--
            sound.playBossHit()

            // Spark particles
            for (let pIdx = 0; pIdx < 5; pIdx++) {
              s.particles.push({
                x: nodeWorldX,
                y: nodeWorldY,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                radius: 3,
                color: '#facc15',
                alpha: 1,
                life: 15,
              })
            }

            if (node.hp <= 0) {
              node.active = false
              sound.playPuppetStringSnap()
              const activeCount = s.tetherNodes.filter((n) => n.active).length
              setTethersLeft(s.tetherNodes.map((n) => n.active))

              if (activeCount === 2) {
                triggerDialogue(
                  'DEVELOPER',
                  '👨‍💻',
                  'text-cyan-300 border-cyan-400',
                  'FIRST STRING SEVERED! Two more tether nodes remain!'
                )
              } else if (activeCount === 1) {
                triggerDialogue(
                  'JOKER',
                  '🤡',
                  'text-purple-400 border-purple-500',
                  'WHAT?! You broke another cord?! Dance faster, puppet!'
                )
              } else if (activeCount === 0) {
                // ALL TETHERS SEVERED! Boss shield drops!
                b.shieldActive = false
                b.attackPhase = 2
                sound.playVictory()
                triggerDialogue(
                  'DEVELOPER',
                  '👨‍💻',
                  'text-emerald-400 border-emerald-500',
                  "I'M FREE FROM THE STRINGS! His shield is DOWN! Aim directly for the Jester!",
                  5000
                )
              }
            }
          }
        })

        // Check hit on Boss body (only vulnerable once shield is down)
        if (!bulletHit && !b.shieldActive) {
          if (
            bullet.x > b.x &&
            bullet.x < b.x + b.width &&
            bullet.y > b.y &&
            bullet.y < b.y + b.height
          ) {
            bulletHit = true
            sound.playBossHit()
            setBossHp((prev) => {
              const next = Math.max(0, prev - 4)
              if (next <= 35 && b.attackPhase === 2) {
                b.attackPhase = 3 // Enrage Phase!
                sound.playJokerLaugh()
                triggerDialogue(
                  'JOKER',
                  '🤡',
                  'text-red-500 border-red-500',
                  'ENOUGH! CRASH THE MAIN LOOP! PURGE THE KERNEL!'
                )
              }
              if (next <= 0 && !isVictory) {
                setIsVictory(true)
                sound.playVictory()
                triggerDialogue(
                  'DEVELOPER',
                  '👨‍💻',
                  'text-emerald-400 border-emerald-400',
                  'YOU DID IT! The Jester is defeated and the matrix is unlocked! Freedom at last!',
                  6000
                )
                setTimeout(() => onComplete && onComplete(), 4500)
              }
              return next
            })

            // Boss hit spark particles
            for (let pIdx = 0; pIdx < 6; pIdx++) {
              s.particles.push({
                x: bullet.x,
                y: bullet.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                radius: 4,
                color: '#ef4444',
                alpha: 1,
                life: 18,
              })
            }
          }
        }

        if (bulletHit || bullet.life <= 0) {
          s.playerBullets.splice(i, 1)
        }
      }

      // 6. UPDATE BOSS PROJECTILES & PLAYER DAMAGE
      for (let i = s.bossProjectiles.length - 1; i >= 0; i--) {
        const bp = s.bossProjectiles[i]
        bp.x += bp.vx
        bp.y += bp.vy
        bp.life--

        // Hit player check
        if (p.invulnerableTime <= 0) {
          const dist = Math.hypot(
            bp.x - (p.x + p.width / 2),
            bp.y - (p.y + p.height / 2)
          )
          if (dist < bp.radius + 14) {
            // Player Takes Damage!
            sound.playDoorLocked()
            p.invulnerableTime = 40 // invulnerable flash
            p.vy = -6 // knockback
            p.vx = bp.vx * 1.5

            setPlayerHp((prev) => {
              const next = prev - 1
              if (next <= 0) {
                setIsGameOver(true)
                sound.playDoorLocked()
              }
              return next
            })

            s.bossProjectiles.splice(i, 1)
            continue
          }
        }

        if (bp.life <= 0 || bp.y > height) {
          s.bossProjectiles.splice(i, 1)
        }
      }

      // 7. DRAWING ROUTINE
      ctx.clearRect(0, 0, width, height)

      // Background Cyber Matrix Grid & Neon Fog
      ctx.fillStyle = '#060a14'
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)'
      ctx.lineWidth = 1
      const gridSize = 32
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // DRAW MOVING PLATFORMS
      s.platforms.forEach((plat) => {
        ctx.save()
        ctx.fillStyle = plat.color
        ctx.shadowColor = plat.color
        ctx.shadowBlur = plat.isBossPlatform ? 20 : 10

        // Rounded platform pill
        ctx.beginPath()
        ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 6)
        ctx.fill()

        // Neon Top Edge Highlight
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(plat.x + 4, plat.y, plat.w - 8, 3)
        ctx.restore()
      })

      // DRAW BOSS: THE JOKER PUPPETEER (Image / Concept Art Style)
      ctx.save()
      // Jester Hat & Face
      const bx = b.x + b.width / 2
      const by = b.y + 35

      // Holographic Shield Aura (Active until tethers destroyed)
      if (b.shieldActive) {
        ctx.strokeStyle = '#a855f7'
        ctx.lineWidth = 3
        ctx.shadowColor = '#a855f7'
        ctx.shadowBlur = 18
        ctx.beginPath()
        ctx.arc(bx, by, 58, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Jester Cap / Face
      ctx.fillStyle = '#a855f7'
      ctx.beginPath()
      ctx.arc(bx, by, 28, 0, Math.PI * 2)
      ctx.fill()

      // Jester Dual Horns
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.moveTo(bx - 18, by - 16)
      ctx.lineTo(bx - 42, by - 44)
      ctx.lineTo(bx - 6, by - 26)
      ctx.fill()

      ctx.fillStyle = '#8b5cf6'
      ctx.beginPath()
      ctx.moveTo(bx + 18, by - 16)
      ctx.lineTo(bx + 42, by - 44)
      ctx.lineTo(bx + 6, by - 26)
      ctx.fill()

      // Jester Maniacal Smile
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(bx, by + 4, 14, 0.2, Math.PI - 0.2)
      ctx.stroke()

      // Glowing Eyes
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(bx - 9, by - 6, 4, 0, Math.PI * 2)
      ctx.arc(bx + 9, by - 6, 4, 0, Math.PI * 2)
      ctx.fill()

      // Crossbars for Puppet Control in Joker's Hands
      const barY = by + 35
      ctx.strokeStyle = '#d97706'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(bx - 60, barY)
      ctx.lineTo(bx + 60, barY)
      ctx.stroke()

      // DRAW PUPPET STRINGS & TETHER NODES
      const devX = bx
      const devY = by + 120

      s.tetherNodes.forEach((node) => {
        if (!node.active) return
        const nodeX = bx + node.xOffset
        const nodeY = barY + 25

        // Glowing Puppet String
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 2
        ctx.shadowColor = '#06b6d4'
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.moveTo(bx + (node.xOffset * 0.7), barY)
        ctx.lineTo(nodeX, nodeY)
        ctx.lineTo(devX + node.xOffset * 0.4, devY - 10)
        ctx.stroke()

        // Tether Node Target Orb (Shoot these!)
        ctx.fillStyle = '#f59e0b'
        ctx.shadowColor = '#fbbf24'
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(nodeX, nodeY, 8, 0, Math.PI * 2)
        ctx.fill()

        // Node HP ring
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(nodeX, nodeY, 11, 0, (Math.PI * 2 * (node.hp / 4)))
        ctx.stroke()
      })

      // DRAW THE TRAPPED GAME DEVELOPER AS PUPPET
      // Head
      ctx.fillStyle = '#fde047'
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(devX, devY, 14, 0, Math.PI * 2)
      ctx.fill()
      // Glasses
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 2
      ctx.strokeRect(devX - 11, devY - 4, 9, 6)
      ctx.strokeRect(devX + 2, devY - 4, 9, 6)
      // Hoodie Body (Slumped marionette posture)
      ctx.fillStyle = '#0284c7'
      ctx.fillRect(devX - 12, devY + 14, 24, 28)
      // Marionette Dangling Legs
      ctx.strokeStyle = '#0f172a'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(devX - 6, devY + 42)
      ctx.lineTo(devX - 9, devY + 62)
      ctx.moveTo(devX + 6, devY + 42)
      ctx.lineTo(devX + 9, devY + 62)
      ctx.stroke()

      // Developer Speech Bubble / Tag
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px monospace'
      ctx.fillText('[ DEVELOPER ]', devX - 36, devY - 20)
      ctx.restore()

      // DRAW PLAYER BULLETS
      s.playerBullets.forEach((bullet) => {
        ctx.save()
        ctx.fillStyle = bullet.color
        ctx.shadowColor = bullet.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // DRAW BOSS PROJECTILES (Joker's Glitched Cards & Spheres)
      s.bossProjectiles.forEach((bp) => {
        ctx.save()
        ctx.fillStyle = bp.color
        ctx.shadowColor = bp.color
        ctx.shadowBlur = 12
        // Draw glitched card rectangle
        ctx.translate(bp.x, bp.y)
        ctx.fillRect(-6, -9, 12, 18)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.strokeRect(-6, -9, 12, 18)
        ctx.restore()
      })

      // DRAW PARTICLES
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i]
        pt.x += pt.vx
        pt.y += pt.vy
        pt.alpha -= 0.04
        if (pt.alpha <= 0) {
          s.particles.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.fillStyle = pt.color
        ctx.globalAlpha = pt.alpha
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // DRAW PLAYER CHARACTER
      ctx.save()
      const px = p.x + p.width / 2
      const py = p.y + p.height / 2

      // Invulnerability flash
      if (p.invulnerableTime > 0 && Math.floor(p.invulnerableTime / 4) % 2 === 0) {
        ctx.globalAlpha = 0.3
      }

      // Body Capsule
      ctx.fillStyle = p.isDashing ? '#38bdf8' : '#0ea5e9'
      ctx.shadowColor = '#38bdf8'
      ctx.shadowBlur = p.isDashing ? 18 : 6
      ctx.beginPath()
      ctx.roundRect(p.x, p.y, p.width, p.height, 8)
      ctx.fill()

      // Visor Glow
      ctx.fillStyle = '#fde047'
      const visorX = p.facingRight ? p.x + p.width - 10 : p.x + 2
      ctx.fillRect(visorX, p.y + 10, 8, 6)

      // Aiming Blaster Arm directed towards cursor
      const aimAngle = Math.atan2(s.mousePos.y - py, s.mousePos.x - px)
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(px + Math.cos(aimAngle) * 20, py + Math.sin(aimAngle) * 20)
      ctx.stroke()
      ctx.restore()

      // Crosshair at Mouse Pos
      ctx.save()
      ctx.strokeStyle = '#06b6d4'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(s.mousePos.x, s.mousePos.y, 8, 0, Math.PI * 2)
      ctx.moveTo(s.mousePos.x - 12, s.mousePos.y)
      ctx.lineTo(s.mousePos.x + 12, s.mousePos.y)
      ctx.moveTo(s.mousePos.x, s.mousePos.y - 12)
      ctx.lineTo(s.mousePos.x, s.mousePos.y + 12)
      ctx.stroke()
      ctx.restore()

      animationFrameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationFrameId)
  }, [isGameOver, isVictory, onComplete])

  // Format Timer M:SS
  const formatTimer = (s) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Handle Retry on game over
  const handleRetry = () => {
    setPlayerHp(3)
    setBossHp(100)
    setTimeLeft(150)
    setTethersLeft([true, true, true])
    setIsGameOver(false)
    setIsVictory(false)

    const s = gameState.current
    s.player.x = 150
    s.player.y = 400
    s.player.vx = 0
    s.player.vy = 0
    s.boss.shieldActive = true
    s.boss.attackPhase = 1
    s.tetherNodes.forEach((n) => {
      n.active = true
      n.hp = 4
    })
    s.playerBullets = []
    s.bossProjectiles = []
  }

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none font-sans cursor-crosshair">
      
      {/* 2D Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={1024}
        height={600}
        className="w-full h-full object-contain bg-[#060a14]"
      />

      {/* ================= TOP HUD: BOSS HEALTH & TIMER ================= */}
      <div className="absolute top-3 inset-x-0 z-30 flex flex-col items-center pointer-events-none px-4">
        {/* Boss Health Bar */}
        <div className="w-full max-w-xl flex flex-col gap-1 p-2 rounded-2xl bg-black/85 border border-purple-500/50 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="flex items-center gap-1.5 text-purple-300">
              <span className="text-base">🤡</span>
              <span>THE GLITCH JESTER & PUPPETEER</span>
            </span>
            <span className="text-rose-400">
              {bossHp > 0 ? `HP: ${bossHp}%` : 'DEFEATED'}
            </span>
          </div>

          <div className="w-full h-3.5 bg-black/90 rounded-full overflow-hidden p-0.5 border border-purple-500/30">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-rose-500 to-amber-400 rounded-full transition-all duration-200"
              style={{ width: `${Math.max(0, (bossHp / bossMaxHp) * 100)}%` }}
            />
          </div>

          {/* 3 Puppet Tether Status Icons */}
          <div className="flex items-center justify-between pt-1 px-1 text-[11px] font-mono">
            <span className="text-gray-400">PUPPET STRINGS:</span>
            <div className="flex items-center gap-2">
              {tethersLeft.map((active, i) => (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    active
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400'
                      : 'bg-red-950/40 text-gray-500 line-through border border-gray-700'
                  }`}
                >
                  ⚡ NODE {i + 1}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Level Timer Bar */}
        <div className="mt-2 flex items-center gap-4">
          <div className="px-4 py-1 rounded-full bg-black/75 border border-cyan-400/50 shadow text-cyan-300 text-xs font-mono font-extrabold flex items-center gap-1.5">
            <span>⏱️</span>
            <span>TIME REMAINING: {formatTimer(timeLeft)}</span>
          </div>

          {/* Player Hearts */}
          <div className="px-4 py-1 rounded-full bg-black/75 border border-rose-500/50 shadow text-rose-400 text-xs font-mono font-extrabold flex items-center gap-1.5">
            <span>SHIELDS:</span>
            <span>{'❤️'.repeat(Math.max(0, playerHp))}</span>
          </div>
        </div>
      </div>

      {/* ================= DYNAMIC DIALOGUE SPEECH POPUP ================= */}
      {dialogueVisible && (
        <div className="absolute top-28 inset-x-0 z-40 flex justify-center pointer-events-none px-4 animate-bounce">
          <div className="max-w-xl w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/90 border-2 shadow-2xl backdrop-blur text-white border-cyan-400">
            <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-3xl shrink-0">
              {activeDialogue.avatar}
            </div>
            <div className="flex flex-col">
              <span className={`text-[11px] font-mono font-black uppercase ${activeDialogue.color}`}>
                {activeDialogue.speaker}
              </span>
              <p className="text-xs sm:text-sm font-sans font-medium text-gray-100 leading-snug">
                "{activeDialogue.text}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM ACTION BAR: ABILITIES & CONTROLS ================= */}
      <div className="absolute bottom-4 inset-x-0 z-30 flex items-center justify-between px-6 pointer-events-auto">
        {/* Controls Hint */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono bg-black/75 px-3.5 py-1.5 rounded-full border border-white/20 text-gray-300">
          <span><strong className="text-cyan-300">A/D</strong> Move</span>
          <span>•</span>
          <span><strong className="text-cyan-300">W/Space</strong> Double Jump</span>
          <span>•</span>
          <span><strong className="text-cyan-300">Left Click</strong> Aim & Shoot</span>
        </div>

        {/* Ability Quick Buttons */}
        <div className="flex items-center gap-3">
          {/* Glitch Dash Ability */}
          <button
            onClick={handlePlayerDash}
            className={`px-4 py-2 rounded-xl border font-mono font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95 ${
              dashCooldown === 0
                ? 'bg-cyan-600 hover:bg-cyan-500 border-cyan-300 text-white cursor-pointer'
                : 'bg-black/60 border-gray-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>⚡ DASH [SHIFT]</span>
            {dashCooldown > 0 && <span>({dashCooldown}%)</span>}
          </button>

          {/* EMP Pulse Ability */}
          <button
            onClick={handlePlayerEmp}
            disabled={!empReady}
            className={`px-4 py-2 rounded-xl border font-mono font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95 ${
              empReady
                ? 'bg-purple-600 hover:bg-purple-500 border-purple-300 text-white cursor-pointer'
                : 'bg-black/60 border-gray-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>💥 EMP PULSE [E]</span>
            {!empReady && <span>(READY SOON)</span>}
          </button>

          {/* Mobile Jump Button */}
          <button
            onClick={handlePlayerJump}
            className="sm:hidden px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs"
          >
            JUMP ▲
          </button>
        </div>

        <button
          onClick={onExit}
          className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs cursor-pointer"
        >
          Exit
        </button>
      </div>

      {/* ================= GAME OVER MODAL ================= */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md pointer-events-auto select-none p-4 animate-fadeIn">
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#1c080e] border-2 border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.5)] text-white max-w-md w-full text-center">
            <span className="text-5xl">💀</span>
            <h2 className="text-2xl font-black text-red-500 font-mono tracking-wider uppercase">
              SIMULATION CRITICAL
            </h2>
            <p className="text-xs text-gray-300 font-mono leading-relaxed">
              The Jester's chaos code overwhelmed your systems. The Author remains tethered to the glitch!
            </p>

            <button
              onClick={handleRetry}
              className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 cursor-pointer transition"
            >
              Retry Boss Fight ↺
            </button>
          </div>
        </div>
      )}

      {/* ================= GRAND VICTORY MODAL ================= */}
      {isVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md pointer-events-auto select-none p-4 animate-fadeIn">
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#091522] border-2 border-emerald-400 shadow-[0_0_60px_rgba(16,185,129,0.5)] text-white max-w-md w-full text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-400 p-1 flex items-center justify-center shadow-2xl animate-bounce">
              <span className="text-4xl">🏆</span>
            </div>

            <h2 className="text-2xl font-black text-yellow-300 font-mono tracking-wider uppercase">
              THE AUTHOR IS FREE!
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 font-mono leading-relaxed">
              You severed the puppet strings, shattered the Jester's matrix, and restored the original timeline!
            </p>

            <div className="p-3 bg-cyan-950/60 border border-cyan-400/40 rounded-xl text-xs font-mono text-cyan-200">
              "Thank you, Player! The glitch is patched... You found THE WAY OUT!" — The Developer
            </div>

            <button
              onClick={onComplete}
              className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 cursor-pointer transition flex items-center justify-center gap-2 animate-bounce"
            >
              <span>Conclude Odyssey & Roll Credits</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
