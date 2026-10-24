import { useState, useEffect, useRef } from 'react'
import { sound } from '../utils/AudioEngine'

export default function LevelFourGame({ playerName = 'Seeker', onComplete, onExit }) {
  const canvasRef = useRef(null)

  // Wave & Phase Progression: 'minions' (Phase 1) | 'boss' (Phase 2)
  const [battlePhase, setBattlePhase] = useState('minions')
  const [minionsRemaining, setMinionsRemaining] = useState(6)

  // Timer & Combat state
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes total
  const [playerLives, setPlayerLives] = useState(3)
  const [bossHp, setBossHp] = useState(100)
  const [tethersLeft, setTethersLeft] = useState([true, true, true]) // 3 tether nodes
  const [dashCooldown, setDashCooldown] = useState(0) // 0 to 100%
  const [empReady, setEmpReady] = useState(true)

  // XP & Combo System
  const [xp, setXp] = useState(0)
  const [playerLevel, setPlayerLevel] = useState(1)
  const [comboHits, setComboHits] = useState(0)
  const [levelUpAlert, setLevelUpAlert] = useState(false)

  // Dialogue system (No emojis - stylized typography cards)
  const [activeDialogue, setActiveDialogue] = useState({
    speaker: 'JOKER',
    role: 'PUPPET MASTER AI',
    color: 'text-purple-400 border-purple-500 bg-purple-950/80',
    text: `AHAHAHA! You breached the core, ${playerName}?! But first, see if you can survive my corrupted drone swarm on the shifting platforms!`,
  })
  const [dialogueVisible, setDialogueVisible] = useState(true)

  // Game over / Victory
  const [isGameOver, setIsGameOver] = useState(false)
  const [isVictory, setIsVictory] = useState(false)

  // Internal mutable state for smooth 60FPS canvas loop
  const gameState = useRef({
    battlePhase: 'minions',
    player: {
      x: 120,
      y: 440,
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
      slashAnimationTime: 0,
      slashAngle: 0,
    },
    // Phase 1 Minions: 6 Glitch Drones on moving platforms
    minions: [
      { id: 0, platformIdx: 1, relX: 40, hp: 3, maxHp: 3, vx: 1.2, shootTimer: 1.5, x: 140, y: 420 },
      { id: 1, platformIdx: 1, relX: 110, hp: 3, maxHp: 3, vx: -1.2, shootTimer: 2.2, x: 210, y: 420 },
      { id: 2, platformIdx: 2, relX: 70, hp: 3, maxHp: 3, vx: 1.0, shootTimer: 1.8, x: 330, y: 300 },
      { id: 3, platformIdx: 3, relX: 45, hp: 3, maxHp: 3, vx: -1.4, shootTimer: 2.5, x: 485, y: 350 },
      { id: 4, platformIdx: 4, relX: 70, hp: 3, maxHp: 3, vx: 1.1, shootTimer: 1.9, x: 790, y: 220 },
      { id: 5, platformIdx: 5, relX: 80, hp: 3, maxHp: 3, vx: -1.3, shootTimer: 2.0, x: 900, y: 410 },
    ],
    // Boss Platform (Descends into view when Phase 2 starts)
    bossPlatform: {
      x: 390,
      y: -150, // Starts off-screen above
      targetY: 120,
      w: 240,
      h: 22,
      vx: 1.2,
      minX: 250,
      maxX: 700,
    },
    boss: {
      x: 470,
      y: -190,
      targetY: 80,
      width: 140,
      height: 90,
      shieldActive: true,
      puppetOffset: { x: 0, y: 110 },
      attackTimer: 0,
      attackPhase: 1,
    },
    tetherNodes: [
      { id: 0, xOffset: -45, yOffset: 65, hp: 4, active: true },
      { id: 1, xOffset: 0, yOffset: 75, hp: 4, active: true },
      { id: 2, xOffset: 45, yOffset: 65, hp: 4, active: true },
    ],
    // 6 Shifting Cyber Platforms
    platforms: [
      // Base Floor
      { x: 0, y: 535, w: 1024, h: 45, vx: 0, vy: 0, isFloor: true, color: '#091528' },
      // Platform 1 (Horizontal Lower-Left)
      { x: 100, y: 450, w: 160, h: 18, minX: 80, maxX: 300, vx: 1.5, vy: 0, color: '#06b6d4' },
      // Platform 2 (Vertical Elevator Left)
      { x: 260, y: 340, w: 140, h: 18, minY: 200, maxY: 380, vx: 0, vy: 1.3, color: '#38bdf8' },
      // Platform 3 (Horizontal Center)
      { x: 430, y: 390, w: 180, h: 18, minX: 370, maxX: 630, vx: -1.5, vy: 0, color: '#a855f7' },
      // Platform 4 (Vertical Elevator Right)
      { x: 700, y: 260, w: 140, h: 18, minY: 180, maxY: 360, vx: 0, vy: -1.4, color: '#ec4899' },
      // Platform 5 (Horizontal Lower-Right)
      { x: 800, y: 440, w: 160, h: 18, minX: 660, maxX: 920, vx: 1.6, vy: 0, color: '#10b981' },
    ],
    // Weapons & Projectiles
    slashArcs: [],
    bladeWaves: [],
    minionBullets: [],
    bossProjectiles: [],
    particles: [],
    mousePos: { x: 500, y: 250 },
    keys: { left: false, right: false, up: false, shoot: false },
    lastSlashTime: 0,
    dashCooldownRemaining: 0,
    empCooldownRemaining: 0,
    comboTimer: 0,
    level: 1,
    xp: 0,
  })

  // Trigger dynamic dialogue popup
  const triggerDialogue = (speaker, role, color, text, duration = 3800) => {
    setActiveDialogue({ speaker, role, color, text })
    setDialogueVisible(true)
    setTimeout(() => {
      setDialogueVisible(false)
    }, duration)
  }

  // Countdown timer loop
  useEffect(() => {
    if (isGameOver || isVictory) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsGameOver(true)
          sound.playDoorLocked()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isGameOver, isVictory])

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver || isVictory) return
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') gameState.current.keys.left = true
      if (e.code === 'KeyD' || e.code === 'ArrowRight') gameState.current.keys.right = true
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        e.preventDefault()
        handlePlayerJump()
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault()
        handlePlayerDash()
      }
      if (e.code === 'KeyE') {
        handlePlayerSlash()
      }
      if (e.code === 'KeyQ') {
        handlePlayerEmp()
      }
    }

    const handleKeyUp = (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') gameState.current.keys.left = false
      if (e.code === 'KeyD' || e.code === 'ArrowRight') gameState.current.keys.right = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isGameOver, isVictory])

  // Mouse aim & click to slash with Cyber Katana
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    gameState.current.mousePos.x = (e.clientX - rect.left) * scaleX
    gameState.current.mousePos.y = (e.clientY - rect.top) * scaleY
  }

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      handlePlayerSlash()
    }
  }

  // Jump Action
  const handlePlayerJump = () => {
    const p = gameState.current.player
    if (p.isGrounded || p.jumpsLeft > 0) {
      p.vy = -12.5
      p.isGrounded = false
      p.jumpsLeft--
      sound.playJumpSound()

      // Spark particles on double jump
      if (p.jumpsLeft === 0) {
        for (let i = 0; i < 6; i++) {
          gameState.current.particles.push({
            x: p.x + p.width / 2,
            y: p.y + p.height,
            vx: (Math.random() - 0.5) * 5,
            vy: Math.random() * 2 + 1,
            radius: 3,
            color: '#38bdf8',
            alpha: 1,
            life: 18,
          })
        }
      }
    }
  }

  // Dash Action
  const handlePlayerDash = () => {
    const s = gameState.current
    if (s.dashCooldownRemaining > 0 || s.player.isDashing) return

    s.player.isDashing = true
    s.player.dashTime = 12
    s.player.invulnerableTime = 18
    s.dashCooldownRemaining = 90
    setDashCooldown(100)

    const dashSpeed = s.player.facingRight ? 18 : -18
    s.player.vx = dashSpeed
    s.player.vy = 0
    sound.playDashSound()

    for (let i = 0; i < 10; i++) {
      s.particles.push({
        x: s.player.x + s.player.width / 2,
        y: s.player.y + s.player.height / 2,
        vx: -dashSpeed * 0.2 + (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 4,
        radius: 4,
        color: '#06b6d4',
        alpha: 1,
        life: 20,
      })
    }
  }

  // Award XP & Check Level Up
  const addPlayerXp = (amount) => {
    const s = gameState.current
    s.xp += amount
    const xpThreshold = s.level * 150
    setXp(s.xp)

    if (s.xp >= xpThreshold && s.level < 3) {
      s.level++
      s.xp -= xpThreshold
      setPlayerLevel(s.level)
      setLevelUpAlert(true)
      sound.playVictory()
      setTimeout(() => setLevelUpAlert(false), 2400)

      // Restore 1 life on level up
      setPlayerLives((lives) => Math.min(3, lives + 1))
    }
  }

  // Cyber Katana Slash Action
  const handlePlayerSlash = () => {
    const s = gameState.current
    const now = performance.now()
    if (now - s.lastSlashTime < 180 || isGameOver || isVictory) return
    s.lastSlashTime = now

    const px = s.player.x + s.player.width / 2
    const py = s.player.y + s.player.height / 2
    const angle = Math.atan2(s.mousePos.y - py, s.mousePos.x - px)

    s.player.slashAnimationTime = 12
    s.player.slashAngle = angle
    s.player.facingRight = s.mousePos.x >= px

    // Crescent Blade Wave Projectile
    const waveSpeed = 15
    const waveDamage = s.level === 3 ? 35 : s.level === 2 ? 28 : 20
    s.bladeWaves.push({
      x: px,
      y: py,
      vx: Math.cos(angle) * waveSpeed,
      vy: Math.sin(angle) * waveSpeed,
      angle,
      damage: waveDamage,
      radius: s.level === 3 ? 24 : 18,
      color: s.level === 3 ? '#ec4899' : '#06b6d4',
      life: 50,
    })

    sound.playLaserShoot()
  }

  // EMP Pulse Shockwave
  const handlePlayerEmp = () => {
    const s = gameState.current
    if (s.empCooldownRemaining > 0 || !empReady) return

    s.empCooldownRemaining = 360
    setEmpReady(false)
    sound.playPuppetStringSnap()

    // Wipes all minion and boss bullets in air
    s.minionBullets = []
    s.bossProjectiles = []

    for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
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
      'AUTHOR',
      'text-emerald-400 border-emerald-500 bg-emerald-950/80',
      'EMP Pulse Activated! Glitch projectiles neutralized!',
      2400
    )
  }

  // Retry on Game Over
  const handleRetry = () => {
    const s = gameState.current
    s.player.x = 120
    s.player.y = 440
    s.player.vx = 0
    s.player.vy = 0
    s.player.invulnerableTime = 60
    s.bossProjectiles = []
    s.minionBullets = []
    setPlayerLives(3)
    setTimeLeft(180)
    setIsGameOver(false)
  }

  // MAIN 60FPS GAME LOOP
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animationFrameId

    const gameLoop = () => {
      const s = gameState.current
      const p = s.player
      const b = s.boss
      const bp = s.bossPlatform

      // 1. UPDATE DASH & COOLDOWNS
      if (s.dashCooldownRemaining > 0) {
        s.dashCooldownRemaining--
        setDashCooldown(Math.round((s.dashCooldownRemaining / 90) * 100))
      }
      if (s.empCooldownRemaining > 0) {
        s.empCooldownRemaining--
        if (s.empCooldownRemaining === 0) setEmpReady(true)
      }
      if (s.comboTimer > 0) {
        s.comboTimer--
        if (s.comboTimer === 0) setComboHits(0)
      }

      // 2. UPDATE MOVING PLATFORMS
      s.platforms.forEach((plat) => {
        if (!plat.isFloor) {
          plat.x += plat.vx
          plat.y += plat.vy
          if (plat.vx !== 0) {
            if (plat.x <= plat.minX || plat.x >= plat.maxX) plat.vx *= -1
          }
          if (plat.vy !== 0) {
            if (plat.y <= plat.minY || plat.y >= plat.maxY) plat.vy *= -1
          }
        }
      })

      // Boss Platform in Phase 2
      if (s.battlePhase === 'boss') {
        if (bp.y < bp.targetY) {
          bp.y += (bp.targetY - bp.y) * 0.08
        }
        bp.x += bp.vx
        if (bp.x <= bp.minX || bp.x >= bp.maxX) bp.vx *= -1

        // Sync Boss coordinates with boss platform
        b.x = bp.x + (bp.w - b.width) / 2
        b.y = bp.y - b.height + 15
      }

      // 3. UPDATE PLAYER PHYSICS & INPUT
      if (!p.isDashing) {
        if (s.keys.left) {
          p.vx = -5.4
          p.facingRight = false
        } else if (s.keys.right) {
          p.vx = 5.4
          p.facingRight = true
        } else {
          p.vx *= 0.8
        }

        p.vy += 0.58 // Gravity
        if (p.vy > 14) p.vy = 14
      } else {
        p.dashTime--
        if (p.dashTime <= 0) p.isDashing = false
      }

      if (p.invulnerableTime > 0) p.invulnerableTime--
      if (p.slashAnimationTime > 0) p.slashAnimationTime--

      p.x += p.vx
      p.y += p.vy

      // Platform collisions
      p.isGrounded = false
      p.currentPlatform = null

      s.platforms.forEach((plat) => {
        const platTop = plat.y
        const platPrevTop = plat.y - plat.vy
        if (
          p.x + p.width > plat.x &&
          p.x < plat.x + plat.w &&
          p.y + p.height >= platTop &&
          p.y + p.height - p.vy <= platPrevTop + 14 &&
          p.vy >= 0
        ) {
          p.y = platTop - p.height
          p.vy = 0
          p.isGrounded = true
          p.jumpsLeft = 2
          p.currentPlatform = plat
          p.x += plat.vx
          p.y += plat.vy
        }
      })

      // Screen horizontal clamp
      if (p.x < 10) p.x = 10
      if (p.x + p.width > canvas.width - 10) p.x = canvas.width - p.width - 10

      // 4. PHASE 1: UPDATE GLITCH MINIONS
      if (s.battlePhase === 'minions') {
        const activeMinions = s.minions.filter((m) => m.hp > 0)
        setMinionsRemaining(activeMinions.length)

        activeMinions.forEach((m) => {
          const parentPlat = s.platforms[m.platformIdx]
          if (parentPlat) {
            m.relX += m.vx
            if (m.relX <= 15 || m.relX >= parentPlat.w - 25) m.vx *= -1
            m.x = parentPlat.x + m.relX
            m.y = parentPlat.y - 32 + Math.sin(performance.now() * 0.005 + m.id) * 4

            // Minions shooting periodic glitch sparks
            m.shootTimer -= 1 / 60
            if (m.shootTimer <= 0) {
              m.shootTimer = 2.2 + Math.random() * 0.8
              const angle = Math.atan2(p.y - m.y, p.x - m.x)
              s.minionBullets.push({
                x: m.x,
                y: m.y,
                vx: Math.cos(angle) * 3.8,
                vy: Math.sin(angle) * 3.8,
                radius: 4,
                color: '#ec4899',
                life: 120,
              })
            }
          }
        })

        // Check if all minions cleared
        if (activeMinions.length === 0) {
          s.battlePhase = 'boss'
          setBattlePhase('boss')
          sound.playVictory()
          triggerDialogue(
            'DEVELOPER',
            'AUTHOR',
            'text-cyan-300 border-cyan-400 bg-cyan-950/80',
            'SWARM PURGED! Brace yourself—the Jester is descending on the master platform with my strings!'
          )
        }
      }

      // 5. PHASE 2: BOSS ATTACKS
      if (s.battlePhase === 'boss') {
        b.attackTimer++
        const attackInterval = b.attackPhase === 3 ? 65 : b.attackPhase === 2 ? 85 : 110

        if (b.attackTimer > attackInterval && !isVictory && !isGameOver) {
          b.attackTimer = 0
          const throwX = b.x + b.width / 2
          const throwY = b.y + b.height / 2
          const targetAngle = Math.atan2(p.y - throwY, p.x - throwX)

          s.bossProjectiles.push({
            x: throwX,
            y: throwY,
            vx: Math.cos(targetAngle) * (4.2 + (b.attackPhase === 3 ? 2.5 : 0)),
            vy: Math.sin(targetAngle) * 4.5,
            radius: 8,
            color: b.attackPhase === 3 ? '#ef4444' : '#ec4899',
            life: 140,
          })

          if (Math.random() < 0.25) sound.playJokerLaugh()
        }
      }

      // 6. UPDATE BLADE WAVES & COMBAT
      for (let i = s.bladeWaves.length - 1; i >= 0; i--) {
        const wave = s.bladeWaves[i]
        wave.x += wave.vx
        wave.y += wave.vy
        wave.life--

        let hitSomething = false

        // Phase 1 Minion Hit Check
        if (s.battlePhase === 'minions') {
          s.minions.forEach((m) => {
            if (m.hp <= 0) return
            const dist = Math.hypot(wave.x - m.x, wave.y - m.y)
            if (dist < 26) {
              m.hp--
              hitSomething = true
              sound.playBossHit()
              s.comboTimer = 160
              setComboHits((c) => c + 1)
              addPlayerXp(35)

              // Spark burst
              for (let pIdx = 0; pIdx < 6; pIdx++) {
                s.particles.push({
                  x: m.x,
                  y: m.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  radius: 3,
                  color: '#38bdf8',
                  alpha: 1,
                  life: 18,
                })
              }

              if (m.hp <= 0) {
                addPlayerXp(50)
                sound.playPuppetStringSnap()
              }
            }
          })
        }

        // Phase 2 Tether Node Hit Check
        if (s.battlePhase === 'boss') {
          s.tetherNodes.forEach((node) => {
            if (!node.active) return
            const nodeWorldX = b.x + b.width / 2 + node.xOffset
            const nodeWorldY = b.y + b.puppetOffset.y + node.yOffset

            const dist = Math.hypot(wave.x - nodeWorldX, wave.y - nodeWorldY)
            if (dist < 22) {
              hitSomething = true
              node.hp--
              sound.playBossHit()
              s.comboTimer = 160
              setComboHits((c) => c + 1)
              addPlayerXp(40)

              if (node.hp <= 0) {
                node.active = false
                sound.playPuppetStringSnap()
                addPlayerXp(150)
                const activeCount = s.tetherNodes.filter((n) => n.active).length
                setTethersLeft(s.tetherNodes.map((n) => n.active))

                if (activeCount === 2) {
                  triggerDialogue(
                    'DEVELOPER',
                    'AUTHOR',
                    'text-cyan-300 border-cyan-400 bg-cyan-950/80',
                    'FIRST STRING SEVERED! Two more tethers remain!'
                  )
                } else if (activeCount === 1) {
                  triggerDialogue(
                    'JOKER',
                    'PUPPET MASTER AI',
                    'text-purple-400 border-purple-500 bg-purple-950/80',
                    'WHAT?! You sliced another cord?! Dance faster, puppet!'
                  )
                } else if (activeCount === 0) {
                  b.shieldActive = false
                  b.attackPhase = 3
                  triggerDialogue(
                    'DEVELOPER',
                    'AUTHOR',
                    'text-emerald-400 border-emerald-500 bg-emerald-950/80',
                    'ALL STRINGS SEVERED! I am free! Strike the Jester directly now!'
                  )
                  sound.playVictory()
                }
              }
            }
          })

          // Boss Direct Damage Check (When shield down)
          if (!b.shieldActive && b.x !== undefined) {
            const distBoss = Math.hypot(wave.x - (b.x + b.width / 2), wave.y - (b.y + b.height / 2))
            if (distBoss < 50) {
              hitSomething = true
              sound.playBossHit()
              s.comboTimer = 160
              setComboHits((c) => c + 1)
              addPlayerXp(25)

              setBossHp((prevHp) => {
                const next = Math.max(0, prevHp - 10)
                if (next <= 0 && !isVictory) {
                  setIsVictory(true)
                  sound.playVictory()
                }
                return next
              })
            }
          }
        }

        if (hitSomething || wave.life <= 0) {
          s.bladeWaves.splice(i, 1)
        }
      }

      // 7. UPDATE ENEMY BULLETS & PLAYER DAMAGE
      const allHostileProjectiles = [...s.minionBullets, ...s.bossProjectiles]
      for (let i = allHostileProjectiles.length - 1; i >= 0; i--) {
        const proj = allHostileProjectiles[i]
        proj.x += proj.vx
        proj.y += proj.vy
        proj.life--

        // Check collision with Player
        if (p.invulnerableTime <= 0) {
          const dist = Math.hypot(
            proj.x - (p.x + p.width / 2),
            proj.y - (p.y + p.height / 2)
          )
          if (dist < 18) {
            allHostileProjectiles.splice(i, 1)
            sound.playDoorLocked()
            p.invulnerableTime = 60
            s.comboHits = 0
            setComboHits(0)

            setPlayerLives((lives) => {
              const next = lives - 1
              if (next <= 0) {
                setIsGameOver(true)
                sound.playDoorLocked()
              }
              return Math.max(0, next)
            })
          }
        }

        if (proj.life <= 0) {
          allHostileProjectiles.splice(i, 1)
        }
      }

      // 8. UPDATE PARTICLES
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i]
        pt.x += pt.vx
        pt.y += pt.vy
        pt.life--
        pt.alpha -= 0.04
        if (pt.life <= 0 || pt.alpha <= 0) s.particles.splice(i, 1)
      }

      // 9. RENDER CANVAS SCENE (Retro-Cyberpunk Aesthetic matching Level 3)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background Cyberpunk Grid & Nebula
      ctx.fillStyle = '#060a16'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 32) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 32) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw Moving Platforms
      s.platforms.forEach((plat) => {
        ctx.save()
        ctx.fillStyle = plat.isFloor ? '#0a1020' : '#141828'
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h)

        // Neon Top Edge
        ctx.strokeStyle = plat.color || '#38bdf8'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(plat.x, plat.y)
        ctx.lineTo(plat.x + plat.w, plat.y)
        ctx.stroke()

        // Edge lights
        ctx.fillStyle = plat.color || '#38bdf8'
        ctx.fillRect(plat.x, plat.y + 2, 4, 4)
        ctx.fillRect(plat.x + plat.w - 4, plat.y + 2, 4, 4)
        ctx.restore()
      })

      // Draw Phase 1: Glitch Drones
      if (s.battlePhase === 'minions') {
        s.minions.forEach((m) => {
          if (m.hp <= 0) return
          ctx.save()
          ctx.translate(m.x, m.y)

          // Glowing Drone Aura
          ctx.beginPath()
          ctx.arc(0, 0, 16, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(236, 72, 153, 0.15)'
          ctx.fill()

          // Drone Shell
          ctx.fillStyle = '#24123a'
          ctx.strokeStyle = '#ec4899'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(0, -12)
          ctx.lineTo(14, 0)
          ctx.lineTo(0, 12)
          ctx.lineTo(-14, 0)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()

          // Ocular Sensor Eye
          ctx.fillStyle = '#38bdf8'
          ctx.beginPath()
          ctx.arc(0, 0, 4, 0, Math.PI * 2)
          ctx.fill()

          // Mini Health Bar
          ctx.fillStyle = 'rgba(0,0,0,0.7)'
          ctx.fillRect(-12, -18, 24, 3)
          ctx.fillStyle = '#ec4899'
          ctx.fillRect(-12, -18, (m.hp / m.maxHp) * 24, 3)

          ctx.restore()
        })
      }

      // Draw Phase 2: Boss Platform, Jester & Developer Puppet
      if (s.battlePhase === 'boss') {
        // Boss Platform
        ctx.save()
        ctx.fillStyle = '#1c0e2a'
        ctx.fillRect(bp.x, bp.y, bp.w, bp.h)
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 3
        ctx.strokeRect(bp.x, bp.y, bp.w, bp.h)

        // The Jester Puppet Master Sprite
        const jx = b.x + b.width / 2
        const jy = b.y + b.height / 2
        ctx.fillStyle = '#a855f7'
        ctx.strokeStyle = '#ec4899'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(jx, jy, 26, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Jester Hat Horns
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.moveTo(jx - 16, jy - 22)
        ctx.lineTo(jx - 32, jy - 38)
        ctx.lineTo(jx - 8, jy - 26)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(jx + 16, jy - 22)
        ctx.lineTo(jx + 32, jy - 38)
        ctx.lineTo(jx + 8, jy - 26)
        ctx.fill()

        // Face Paint
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(jx - 10, jy - 6, 6, 6)
        ctx.fillRect(jx + 4, jy - 6, 6, 6)
        ctx.fillStyle = '#ef4444'
        ctx.fillRect(jx - 2, jy, 4, 4)

        // The Captured Developer Puppet (Suspended underneath by strings)
        if (b.shieldActive) {
          const devX = jx
          const devY = jy + b.puppetOffset.y

          // 3 Glowing Tether Strings
          s.tetherNodes.forEach((node) => {
            if (!node.active) return
            const nodeX = devX + node.xOffset
            const nodeY = devY + node.yOffset

            // Electric string
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(jx, jy + 18)
            ctx.lineTo(nodeX, nodeY)
            ctx.stroke()

            // Glowing Tether Node Sphere
            ctx.fillStyle = '#facc15'
            ctx.beginPath()
            ctx.arc(nodeX, nodeY, 6, 0, Math.PI * 2)
            ctx.fill()
          })

          // Developer Puppet Body
          ctx.fillStyle = '#1e293b'
          ctx.strokeStyle = '#38bdf8'
          ctx.lineWidth = 2
          ctx.fillRect(devX - 12, devY - 14, 24, 28)
          ctx.strokeRect(devX - 12, devY - 14, 24, 28)

          // Head
          ctx.fillStyle = '#f2c9a0'
          ctx.fillRect(devX - 8, devY - 26, 16, 12)
        }

        ctx.restore()
      }

      // Draw Player Hero (with Glowing Cyber Severance Blade!)
      ctx.save()
      if (p.invulnerableTime > 0 && Math.floor(p.invulnerableTime / 4) % 2 === 0) {
        ctx.globalAlpha = 0.4
      }

      const px = p.x + p.width / 2
      const py = p.y + p.height / 2

      // Player Body
      ctx.fillStyle = '#0284c7'
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 2
      ctx.fillRect(p.x, p.y, p.width, p.height)
      ctx.strokeRect(p.x, p.y, p.width, p.height)

      // Visor
      ctx.fillStyle = '#38bdf8'
      ctx.fillRect(p.facingRight ? p.x + 16 : p.x + 4, p.y + 8, 12, 6)

      // Cyber Severance Blade
      ctx.translate(px, py)
      ctx.rotate(p.slashAngle)
      ctx.fillStyle = '#06b6d4'
      ctx.shadowColor = '#06b6d4'
      ctx.shadowBlur = 10
      ctx.fillRect(10, -3, 30, 6)

      // Slash Energy Arc
      if (p.slashAnimationTime > 0) {
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(0, 0, 42, -Math.PI / 4, Math.PI / 4)
        ctx.stroke()
      }
      ctx.restore()

      // Draw Blade Wave Projectiles
      s.bladeWaves.forEach((wave) => {
        ctx.save()
        ctx.translate(wave.x, wave.y)
        ctx.rotate(wave.angle)
        ctx.strokeStyle = wave.color
        ctx.lineWidth = 4
        ctx.shadowColor = wave.color
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(0, 0, wave.radius, -Math.PI / 3, Math.PI / 3)
        ctx.stroke()
        ctx.restore()
      })

      // Draw Hostile Bullets (Glitch Sparks & Boss Cards)
      allHostileProjectiles.forEach((proj) => {
        ctx.save()
        ctx.fillStyle = proj.color || '#ec4899'
        ctx.shadowColor = proj.color || '#ec4899'
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, proj.radius || 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Draw Particles
      s.particles.forEach((pt) => {
        ctx.save()
        ctx.fillStyle = pt.color
        ctx.globalAlpha = Math.max(0, pt.alpha)
        ctx.fillRect(pt.x, pt.y, pt.radius, pt.radius)
        ctx.restore()
      })

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    animationFrameId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isGameOver, isVictory])

  return (
    <div className="relative w-screen h-screen bg-[#070514] text-white flex flex-col justify-between overflow-hidden select-none font-mono">
      
      {/* ================= LEVEL 3-STYLE RETRO RETRO HEADER ================= */}
      <header className="relative z-20 w-full flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#0d0922]/90 border-b border-purple-900/60 backdrop-blur shadow-md">
        
        {/* Left: Sector Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs text-gray-300 font-bold transition cursor-pointer"
          >
            ← Sector 3
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 hidden sm:inline">
              SECTOR 4: JESTER'S PUPPET CORE
            </span>
          </div>
        </div>

        {/* Center: Phase / Wave Tracker Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-purple-500/40 text-xs">
          {battlePhase === 'minions' ? (
            <div className="flex items-center gap-2 text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>PHASE 1: GLITCH SWARM</span>
              <span className="text-amber-400 font-extrabold">({minionsRemaining}/6 REMAINING)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-purple-300">
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
              <span>PHASE 2: PUPPET JESTER</span>
              <span className="text-rose-400 font-extrabold">(BOSS HP: {bossHp}%)</span>
            </div>
          )}
        </div>

        {/* Right: Callsign, XP, Hits Combo & Hearts */}
        <div className="flex items-center gap-2.5">
          {/* Callsign */}
          <div className="px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold hidden md:block">
            CALLSIGN: <span className="text-cyan-300">{playerName}</span>
          </div>

          {/* XP & Level Indicator */}
          <div className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
            <span>LVL {playerLevel}</span>
            <div className="w-12 h-2 rounded-full bg-black/80 overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                style={{ width: `${Math.min(100, (xp / (playerLevel * 150)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Combo Counter */}
          {comboHits > 1 && (
            <div className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-[11px] font-black animate-pulse">
              {comboHits}x HITS
            </div>
          )}

          {/* Lives (3 SVG Heart Icons) */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/60 border border-rose-500/40">
            {[0, 1, 2].map((i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < playerLives ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-rose-400/40'}`}
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ))}
          </div>

          {/* Testing Skip Option */}
          <button
            onClick={() => {
              setBossHp(0)
              setTethersLeft([false, false, false])
              setIsVictory(true)
              sound.playVictory()
            }}
            className="px-3 py-1 rounded bg-gradient-to-r from-rose-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow"
            title="Defeat Boss immediately (Testing)"
          >
            Defeat Boss ➔
          </button>
        </div>
      </header>

      {/* ================= CENTER 2D CANVAS ARENA ================= */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1024}
          height={576}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          className="w-full h-full object-contain cursor-crosshair"
          tabIndex={0}
        />

        {/* Level Up Flash Notification */}
        {levelUpAlert && (
          <div className="absolute top-20 inset-x-0 z-40 flex justify-center pointer-events-none animate-bounce">
            <div className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-black text-sm uppercase tracking-widest shadow-[0_0_30px_#38bdf8]">
              BLADE OVERCHARGED! LEVEL {playerLevel} REACHED!
            </div>
          </div>
        )}

        {/* Dynamic Holographic Dialogue Notification */}
        {dialogueVisible && (
          <div className="absolute top-16 inset-x-0 z-40 flex justify-center pointer-events-none px-4 animate-fadeIn">
            <div className="max-w-xl w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/90 border-2 shadow-2xl backdrop-blur text-white border-cyan-400">
              <div className="h-10 w-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-sm shrink-0">
                {activeDialogue.speaker[0]}
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-mono font-black uppercase ${activeDialogue.color}`}>
                  {activeDialogue.speaker} • {activeDialogue.role}
                </span>
                <p className="text-xs sm:text-sm font-sans font-medium text-gray-100 leading-snug">
                  "{activeDialogue.text}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= LEVEL 3-STYLE RETRO FOOTER ================= */}
      <footer className="relative z-20 w-full flex flex-wrap items-center justify-between px-4 py-2 bg-[#0d0922]/90 border-t border-purple-900/60 text-[11px] text-gray-400 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-cyan-400 font-bold">CONTROLS:</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">A</kbd> / <kbd className="px-1 py-0.5 bg-white/10 rounded text-white">D</kbd> Move</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">SPACE</kbd> Jump</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">SHIFT</kbd> Dash</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">CLICK</kbd> / <kbd className="px-1 py-0.5 bg-white/10 rounded text-white">E</kbd> Blade Slash</span>
          <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-white">Q</kbd> EMP Wave</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-purple-300">
          <span>{battlePhase === 'minions' ? 'Phase 1: Cleave all 6 drones!' : 'Phase 2: Sever the 3 strings to free the Developer!'}</span>
        </div>
      </footer>

      {/* ================= GAME OVER MODAL ================= */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md pointer-events-auto select-none p-4 animate-fadeIn">
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#1c080e] border-2 border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.5)] text-white max-w-md w-full text-center font-mono">
            <h2 className="text-2xl font-black text-red-500 tracking-wider uppercase">
              SIMULATION CRITICAL
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              The Jester's chaos code overwhelmed your systems. The Author remains tethered to the glitch!
            </p>

            <button
              onClick={handleRetry}
              className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 cursor-pointer transition"
            >
              Retry Sector 4 ↺
            </button>
          </div>
        </div>
      )}

      {/* ================= GRAND VICTORY MODAL ================= */}
      {isVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md pointer-events-auto select-none p-4 animate-fadeIn">
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#091522] border-2 border-emerald-400 shadow-[0_0_60px_rgba(16,185,129,0.5)] text-white max-w-md w-full text-center font-mono">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 p-1 flex items-center justify-center shadow-2xl animate-bounce text-black">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
              </svg>
            </div>

            <h2 className="text-2xl font-black text-yellow-300 tracking-wider uppercase">
              THE AUTHOR IS FREE!
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
              You severed the puppet strings, shattered the Jester's matrix, and restored the original timeline!
            </p>

            <div className="p-3 bg-cyan-950/60 border border-cyan-400/40 rounded-xl text-xs text-cyan-200">
              "Thank you, {playerName}! The glitch is patched... You found THE WAY OUT!" — The Developer
            </div>

            <button
              onClick={onComplete}
              className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 cursor-pointer transition flex items-center justify-center gap-2 animate-bounce"
            >
              <span>Conclude Odyssey & Roll Credits ➔</span>
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
