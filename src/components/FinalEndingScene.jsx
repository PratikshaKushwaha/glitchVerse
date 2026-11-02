import { useState, useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import futureSelfSceneImg from '../assets/future_self_scene.png'
import studentSheetImg from '../assets/student_character_sheet.jpg'
import hologramFutureSelfImg from '../assets/hologram_future_self.jpg'
import peacefulFieldImg from '../assets/ending_peaceful_field.png'
import cityBgImg from '../level4_cyber/assets/city_bg.jpg'
import gameLogoImg from '../assets/the_way_out_logo.jpg'
import endingVoiceAudio from '../assets/finalscene-audio.mp3'
import { sound } from '../utils/AudioEngine'

// The exact agreed ending dialogue script between Student and Future Self
const DIALOGUE_SCRIPT = [
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: 'Wait, who are you? And why do you look exactly like me?',
    avatar: 'student',
    time: 0.0,
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "Because I am you. I'm from the future.",
    avatar: 'future_self',
    time: 4.8,
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: 'What? But how? I was just a student. I somehow ended up inside this game.',
    avatar: 'student',
    time: 8.0,
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "You don't remember, do you? You created this place. You're the developer.",
    avatar: 'future_self',
    time: 13.5,
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: "I created this? Then why don't I remember anything?",
    avatar: 'student',
    time: 18.2,
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "Because I brought you here. I came back to change something before it's too late.",
    avatar: 'future_self',
    time: 22.0,
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: "Change what? What's happening in the future?",
    avatar: 'student',
    time: 27.2,
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "The world is falling apart. Cities are destroyed. Buildings lie in ruins, and the systems we once depended on are failing. AI has gone far beyond what we ever expected. It's destroying everything, and we're struggling to control what we've created.",
    avatar: 'future_self',
    time: 30.5,
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: 'Are you saying the world is going to be destroyed?',
    avatar: 'student',
    time: 46.5,
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: "It's already happening where I come from. I don't have much time left, and I can't explain everything. Just remember this: Don't let things reach the point they have in my time.",
    avatar: 'future_self',
    time: 50.2,
  },
  {
    speaker: 'STUDENT',
    tag: 'Present Self // Callsign Seeker',
    text: "Wait! Don't go! Will I see you again?",
    avatar: 'student',
    time: 61.2,
  },
  {
    speaker: 'FUTURE SELF',
    tag: 'Lead Developer // 2042 Reality Engine',
    text: 'I hope so. But next time, I hope things are different.',
    avatar: 'future_self',
    time: 64.8,
  },
]

export default function FinalEndingScene({ playerName = 'Seeker', onRestart, onBackToMenu }) {
  // Scene Phase lifecycle:
  // 1. 'emergence' -> White/cyan light from collapsed boss puppet dissolves into peaceful night field
  // 2. 'field' -> Interactive 3D scene & dialogue sequence
  // 3. 'hologram_fade' -> Future Self flickers and dissolves into ascending blue voxels
  // 4. 'glimpse' -> Digital glitch distortion revealing ruined future city
  // 5. 'fadeout' -> Cinematic blackout transition
  // 6. 'title' -> Final title card: THE WAY OUT / THE END... FOR NOW / TO BE CONTINUED
  const [phase, setPhase] = useState('emergence')
  const [dialogueIdx, setDialogueIdx] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [glitchIntensity, setGlitchIntensity] = useState(0)
  const [glitchFlicker, setGlitchFlicker] = useState(false)
  const [audioTime, setAudioTime] = useState(0)

  const threeCanvasRef = useRef(null)
  const audioSlotRef = useRef(null)
  const typewriterTimerRef = useRef(null)

  // Current active dialogue line
  const currentLine = DIALOGUE_SCRIPT[dialogueIdx]
  const isFutureSelf = currentLine?.avatar === 'future_self'
  const speakerName = currentLine?.speaker === 'STUDENT' ? (playerName || 'Student') : 'Future Self'
  const fullSentence = useMemo(() => {
    if (!currentLine) return ''
    return currentLine.text.replace(/Seeker/g, playerName || 'Student')
  }, [currentLine, playerName])

  // 1. Natural emergence from whiteout / blue boss radiance into peaceful grassy field
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('field')
    }, 1800)
    return () => clearTimeout(t)
  }, [])

  // 2. Three.js 3D Stylised Environment (Starry Night, Crescent Moon, Rolling Meadow, Fireflies, Hologram Emitter)
  useEffect(() => {
    if (!threeCanvasRef.current) return
    const canvas = threeCanvasRef.current

    let renderer, scene, camera, reqId
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    } catch {
      return
    }

    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x060c18, 0.016)

    camera = new THREE.PerspectiveCamera(52, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
    camera.position.set(0, 1.8, 6.2)

    // Lighting: Moonlight & ambient night glow
    const moonlight = new THREE.DirectionalLight(0xa5c4ff, 1.6)
    moonlight.position.set(-8, 12, 6)
    scene.add(moonlight)

    const ambientLight = new THREE.HemisphereLight(0x1e293b, 0x06110a, 0.85)
    scene.add(ambientLight)

    // Hologram Emitter Spot & Point Light (positioned where Future Self stands on the right)
    const holoLight = new THREE.PointLight(0x38bdf8, 3.5, 12)
    holoLight.position.set(2.4, 0.8, -0.5)
    scene.add(holoLight)

    // --- STARFIELD (900 Twinkling Stars) ---
    const starCount = 900
    const starGeo = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)
    const starPhases = new Float32Array(starCount)

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x93c5fd),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xfef08a),
    ]

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 0.95 + 0.05)
      const r = 180 + Math.random() * 40

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      starPositions[i * 3 + 1] = r * Math.cos(phi) + 10
      starPositions[i * 3 + 2] = -Math.abs(r * Math.sin(phi) * Math.sin(theta)) - 10

      const c = palette[Math.floor(Math.random() * palette.length)]
      starColors[i * 3] = c.r
      starColors[i * 3 + 1] = c.g
      starColors[i * 3 + 2] = c.b

      starPhases[i] = Math.random() * Math.PI * 2
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

    const starMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    })
    const starField = new THREE.Points(starGeo, starMat)
    scene.add(starField)

    // --- CRESCENT MOON (Stylised Luminous Crescent in Upper-Left Sky) ---
    const moonGroup = new THREE.Group()
    moonGroup.position.set(-18, 14, -80)

    const moonSphereGeo = new THREE.SphereGeometry(3.6, 32, 32)
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 })
    const moonMesh = new THREE.Mesh(moonSphereGeo, moonMat)
    moonGroup.add(moonMesh)

    // Shadow sphere carving crescent profile
    const shadowSphereGeo = new THREE.SphereGeometry(3.4, 32, 32)
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x060c18 })
    const shadowMesh = new THREE.Mesh(shadowSphereGeo, shadowMat)
    shadowMesh.position.set(1.4, 0.4, 0.6)
    moonGroup.add(shadowMesh)

    // Soft moon corona glow ring
    const moonHaloGeo = new THREE.RingGeometry(3.6, 7.5, 32)
    const moonHaloMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const moonHalo = new THREE.Mesh(moonHaloGeo, moonHaloMat)
    moonHalo.position.z = -0.1
    moonGroup.add(moonHalo)

    scene.add(moonGroup)

    // --- PROCEDURAL ROLLING MEADOW TERRAIN ---
    const groundGeo = new THREE.PlaneGeometry(60, 45, 48, 48)
    const pos = groundGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i)
      const vy = pos.getY(i)
      const elevation = Math.sin(vx * 0.18) * 0.45 + Math.cos(vy * 0.14) * 0.35 + Math.sin((vx + vy) * 0.25) * 0.2
      pos.setZ(i, elevation)
    }
    groundGeo.computeVertexNormals()

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x07150c,
      roughness: 0.9,
      metalness: 0.1,
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.set(0, -0.6, -10)
    scene.add(ground)

    // --- FIREFLIES / BIOLUMINESCENT NIGHT PARTICLES (45 motes) ---
    const fireflyCount = 45
    const fireflyGeo = new THREE.BufferGeometry()
    const fireflyPos = new Float32Array(fireflyCount * 3)
    const fireflySpeed = new Float32Array(fireflyCount * 3)

    for (let i = 0; i < fireflyCount; i++) {
      fireflyPos[i * 3] = (Math.random() - 0.5) * 26
      fireflyPos[i * 3 + 1] = 0.2 + Math.random() * 2.8
      fireflyPos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2

      fireflySpeed[i * 3] = (Math.random() - 0.5) * 0.4
      fireflySpeed[i * 3 + 1] = 0.2 + Math.random() * 0.4
      fireflySpeed[i * 3 + 2] = (Math.random() - 0.5) * 0.4
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3))

    const fireflyMat = new THREE.PointsMaterial({
      color: 0x86efac,
      size: 3.2,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    })
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat)
    scene.add(fireflies)

    // --- 3D HOLOGRAM PROJECTOR BASE (Concentric Glowing Rings Beneath Future Self) ---
    const holoBaseGroup = new THREE.Group()
    holoBaseGroup.position.set(2.4, -0.48, -0.6)

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(0.2, 1.4, 32), ringMat1)
    ring1.rotation.x = -Math.PI / 2
    holoBaseGroup.add(ring1)

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.3, 32), ringMat2)
    ring2.rotation.x = -Math.PI / 2
    holoBaseGroup.add(ring2)

    // Upward Hologram Projection Cone
    const coneGeo = new THREE.CylinderGeometry(1.9, 0.4, 4.5, 32, 1, true)
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const cone = new THREE.Mesh(coneGeo, coneMat)
    cone.position.y = 2.25
    holoBaseGroup.add(cone)

    scene.add(holoBaseGroup)

    // --- RISING 3D VOXEL / DIGITAL CUBE PARTICLES ---
    const voxelCount = 28
    const voxelGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06)
    const voxelMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    })
    const voxels = new THREE.InstancedMesh(voxelGeo, voxelMat, voxelCount)
    const voxelData = []
    const dummy = new THREE.Object3D()

    for (let i = 0; i < voxelCount; i++) {
      const vx = 2.4 + (Math.random() - 0.5) * 1.8
      const vy = 0.2 + Math.random() * 3.5
      const vz = -0.6 + (Math.random() - 0.5) * 1.2
      voxelData.push({
        x: vx,
        y: vy,
        z: vz,
        speed: 0.6 + Math.random() * 0.8,
        rotSpeed: (Math.random() - 0.5) * 3,
        scale: 0.6 + Math.random() * 0.8,
      })
    }
    scene.add(voxels)

    // --- ANIMATION LOOP ---
    let clock = new THREE.Clock()

    const animate = () => {
      const elapsed = clock.getElapsedTime()

      // Camera breathing motion
      camera.position.y = 1.8 + Math.sin(elapsed * 0.6) * 0.04
      camera.position.x = Math.sin(elapsed * 0.4) * 0.06

      // Star twinkling
      starMat.opacity = 0.75 + Math.sin(elapsed * 2.2) * 0.18

      // Rotate hologram base rings
      ring1.rotation.z = elapsed * 0.8
      ring2.rotation.z = -elapsed * 0.5

      // Floating bio-luminescent fireflies
      const ffPos = fireflies.geometry.attributes.position
      for (let i = 0; i < fireflyCount; i++) {
        let y = ffPos.getY(i) + Math.sin(elapsed * 1.5 + i) * 0.008
        if (y > 3.6) y = 0.3
        ffPos.setY(i, y)
        ffPos.setX(i, ffPos.getX(i) + Math.sin(elapsed * 0.8 + i * 2) * 0.006)
      }
      ffPos.needsUpdate = true

      // Floating ascending voxels
      for (let i = 0; i < voxelCount; i++) {
        const v = voxelData[i]
        v.y += v.speed * 0.016
        if (v.y > 4.2) {
          v.y = 0.1
          v.x = 2.4 + (Math.random() - 0.5) * 1.6
          v.z = -0.6 + (Math.random() - 0.5) * 1.0
        }
        dummy.position.set(v.x, v.y, v.z)
        dummy.rotation.x = elapsed * v.rotSpeed
        dummy.rotation.y = elapsed * v.rotSpeed * 0.8
        dummy.scale.setScalar(v.scale * Math.sin((v.y / 4.2) * Math.PI))
        dummy.updateMatrix()
        voxels.setMatrixAt(i, dummy.matrix)
      }
      voxels.instanceMatrix.needsUpdate = true

      renderer.render(scene, camera)
      reqId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      if (!canvas) return
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [])

  // 3. Audio Voiceover Playback & Synchronisation
  useEffect(() => {
    if (phase !== 'field' && phase !== 'emergence') {
      if (audioSlotRef.current) audioSlotRef.current.pause()
      return
    }

    const audio = audioSlotRef.current
    if (!audio) return

    const playTimer = setTimeout(() => {
      audio.currentTime = currentLine?.time || 0
      audio.play().catch((err) => {
        console.warn('Audio waiting for user gesture:', err)
      })
    }, 900)

    return () => clearTimeout(playTimer)
  }, [phase])

  // Synchronise audio timeline with dialogue progression
  useEffect(() => {
    if (phase !== 'field') return
    const nextIdx = DIALOGUE_SCRIPT.reduce((acc, line, idx) => {
      return audioTime >= line.time ? idx : acc
    }, 0)

    if (nextIdx !== dialogueIdx) {
      setDialogueIdx(nextIdx)
    }
  }, [audioTime, phase, dialogueIdx])

  // 4. Smooth Typewriter Text Animation for Active Dialogue
  useEffect(() => {
    if (phase !== 'field' || !fullSentence) return

    setIsTyping(true)
    setDisplayedText('')
    if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current)

    let charIdx = 0
    typewriterTimerRef.current = setInterval(() => {
      charIdx += 2
      if (charIdx >= fullSentence.length) {
        setDisplayedText(fullSentence)
        setIsTyping(false)
        clearInterval(typewriterTimerRef.current)
      } else {
        setDisplayedText(fullSentence.slice(0, charIdx))
        if (charIdx % 6 === 0) {
          sound.playTypewriter()
        }
      }
    }, 22)

    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current)
    }
  }, [dialogueIdx, fullSentence, phase])

  // Random micro-glitch flicker for Future Self's holographic manifestation
  useEffect(() => {
    if (phase !== 'field') return
    const interval = setInterval(() => {
      if (Math.random() < 0.35) {
        setGlitchFlicker(true)
        setTimeout(() => setGlitchFlicker(false), 80 + Math.random() * 120)
      }
    }, 2200)
    return () => clearInterval(interval)
  }, [phase])

  // 5. Interactive Advance Handler (Mouse Click, Space, or Enter)
  // Rule: If text is still typing, the first interaction completes sentence immediately.
  // Next interaction advances to the next dialogue.
  const handleDialogueAdvance = () => {
    if (phase !== 'field') return

    // If still typing -> immediately complete sentence
    if (isTyping) {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current)
      setDisplayedText(fullSentence)
      setIsTyping(false)
      return
    }

    // Advance to next dialogue or trigger ending transition
    if (dialogueIdx < DIALOGUE_SCRIPT.length - 1) {
      const nextIdx = dialogueIdx + 1
      setDialogueIdx(nextIdx)
      if (audioSlotRef.current) {
        audioSlotRef.current.currentTime = DIALOGUE_SCRIPT[nextIdx].time
        if (audioSlotRef.current.paused) {
          audioSlotRef.current.play().catch(() => {})
        }
      }
    } else {
      // Completed all dialogue lines -> initiate Future Self hologram flicker & dissolution
      startEndingTransition()
    }
  }

  // 6. Ending Transition Sequence:
  // Hologram flickers and dissolves -> Ruined city glimpse -> Fadeout -> Title card
  const startEndingTransition = () => {
    sound.playGlitchRadio()
    setPhase('hologram_fade')

    setTimeout(() => {
      sound.playDoorLocked()
      setPhase('glimpse')

      const glitchInt = setInterval(() => {
        setGlitchIntensity(Math.random())
      }, 75)

      setTimeout(() => {
        clearInterval(glitchInt)
        sound.playVictory()
        setPhase('fadeout')

        setTimeout(() => {
          setPhase('title')
        }, 2000)
      }, 4800)
    }, 2400)
  }

  // Global Keyboard Navigation (Space / Enter / K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        if (phase === 'field') {
          handleDialogueAdvance()
        } else if (phase === 'glimpse') {
          setPhase('fadeout')
          setTimeout(() => setPhase('title'), 1200)
        }
      } else if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        setPhase('title')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, isTyping, fullSentence, dialogueIdx])

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none font-mono text-white bg-[#030611] flex flex-col justify-between"
      onClick={() => {
        if (phase === 'field') handleDialogueAdvance()
      }}
    >
      {/* Background Voiceover Audio */}
      <audio
        ref={audioSlotRef}
        src={endingVoiceAudio}
        preload="auto"
        onTimeUpdate={(e) => setAudioTime(e.currentTarget.currentTime)}
        onEnded={() => {
          if (phase === 'field') {
            startEndingTransition()
          }
        }}
      />

      {/* ========================================================================= */}
      {/* 3D PEACEFUL FIELD & HOLOGRAPHIC FUTURE SELF (PHASE: EMERGENCE / FIELD / FADE) */}
      {/* ========================================================================= */}
      {(phase === 'emergence' || phase === 'field' || phase === 'hologram_fade') && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
          
          {/* Layer 1: Dedicated 3D Three.js Canvas (Starfield, Moon, Terrain, Motes) */}
          <canvas
            ref={threeCanvasRef}
            className="absolute inset-0 w-full h-full block pointer-events-none z-0"
          />

          {/* Layer 2: Atmosphere & Silhouette Horizon */}
          <div
            className="absolute inset-0 bg-cover bg-bottom opacity-30 filter blur-[2px] pointer-events-none mix-blend-screen"
            style={{ backgroundImage: `url(${peacefulFieldImg})` }}
          />

          {/* Layer 3: Top Navigation Header (Matching Reference Image) */}
          <header className="relative z-30 pt-4 sm:pt-6 px-4 sm:px-8 flex items-center justify-between pointer-events-auto">
            {/* Top-Left: SKIP >> Button (Matching reference) */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setPhase('title')
              }}
              className="px-3.5 py-1 rounded bg-black/40 hover:bg-black/70 border border-white/20 text-xs sm:text-sm font-sans font-bold text-gray-300 hover:text-white transition tracking-wider flex items-center gap-1.5 cursor-pointer backdrop-blur shadow"
              title="Skip to Ending Title Card"
            >
              <span>SKIP</span>
              <span className="text-cyan-400 font-mono">»</span>
            </button>

            {/* Top-Right: LOG Button & Keyboard Hint */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowLog(!showLog)
                }}
                className={`px-3 py-1 rounded text-xs sm:text-sm font-sans font-bold tracking-wider transition cursor-pointer border backdrop-blur shadow flex items-center gap-1.5 ${
                  showLog
                    ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                    : 'bg-black/40 hover:bg-black/70 text-gray-300 hover:text-white border-white/20'
                }`}
                title="Toggle Dialogue History Log"
              >
                <span>LOG</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPhase('title')
                }}
                className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold transition cursor-pointer"
                title="Skip with [K]"
              >
                <span>Skip [K] ➔</span>
              </button>
            </div>
          </header>

          {/* Layer 4: Interactive Character Staging Area (Student on Left, Hologram Future Self on Right) */}
          <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto flex items-end justify-between px-4 sm:px-12 pb-3 pointer-events-none select-none max-h-[64vh]">
            
            {/* --- LEFT: The Student (Young Protagonist / Callsign Seeker) --- */}
            <div
              className={`relative flex flex-col items-center justify-end transition-all duration-700 max-w-[42%] sm:max-w-[40%] ${
                !isFutureSelf ? 'scale-105 filter drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]' : 'opacity-85 scale-100'
              }`}
            >
              {/* Character Illustration */}
              <div className="relative overflow-hidden flex items-end justify-center">
                <img
                  src={futureSelfSceneImg}
                  alt="Student Present Self"
                  className="w-auto h-[44vh] sm:h-[50vh] object-cover pointer-events-none"
                  style={{
                    objectPosition: '22% 48%',
                    transform: 'scale(2.2)',
                    transformOrigin: '22% 48%',
                    maskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
                  }}
                />
              </div>

              {/* Speaker Indicator Glow Under Student */}
              {!isFutureSelf && (
                <div className="absolute -bottom-2 w-32 sm:w-44 h-4 rounded-full bg-cyan-400/30 blur-md animate-pulse" />
              )}
            </div>

            {/* --- RIGHT: The Future Self (Glowing Hologram with Tactical Armor & Scanlines) --- */}
            <div
              className={`relative flex flex-col items-center justify-end transition-all duration-700 max-w-[50%] sm:max-w-[46%] ${
                phase === 'hologram_fade'
                  ? 'opacity-0 scale-95 blur-sm transition-opacity duration-[2200ms]'
                  : isFutureSelf
                  ? 'scale-105'
                  : 'opacity-90 scale-100'
              }`}
            >
              {/* Holographic Projection Emitter Base on Grass */}
              <div className="absolute -bottom-3 w-48 sm:w-64 h-8 rounded-full bg-cyan-400/25 blur-lg border border-cyan-400/60 shadow-[0_0_50px_rgba(56,189,248,0.85)] animate-pulse" />
              <div className="absolute -bottom-1.5 w-32 sm:w-44 h-5 rounded-full border border-cyan-300/80 shadow-[0_0_20px_rgba(56,189,248,0.9)] animate-ping" />

              {/* Upward Holographic Light Projection Cone */}
              <div
                className="absolute inset-x-4 bottom-0 top-0 pointer-events-none opacity-30"
                style={{
                  background: 'linear-gradient(to top, rgba(56,189,248,0.4) 0%, rgba(34,211,238,0.12) 65%, transparent 100%)',
                  clipPath: 'polygon(15% 100%, 85% 100%, 100% 0%, 0% 0%)',
                }}
              />

              {/* Holographic Future Self Character Image */}
              <div
                className={`relative overflow-hidden flex items-end justify-center transition-transform ${
                  glitchFlicker ? 'translate-x-1.5 filter hue-rotate-90' : 'translate-x-0'
                }`}
              >
                <img
                  src={futureSelfSceneImg}
                  alt="Holographic Future Self"
                  className="w-auto h-[46vh] sm:h-[52vh] object-cover pointer-events-none"
                  style={{
                    objectPosition: '78% 46%',
                    transform: 'scale(2.2)',
                    transformOrigin: '78% 46%',
                    filter: isFutureSelf
                      ? 'drop-shadow(0 0 25px rgba(56,189,248,0.9)) drop-shadow(0 0 50px rgba(14,165,233,0.6)) contrast(1.15) brightness(1.15)'
                      : 'drop-shadow(0 0 15px rgba(56,189,248,0.6)) contrast(1.05)',
                    maskImage: 'linear-gradient(to bottom, black 84%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 84%, transparent 100%)',
                  }}
                />

                {/* Real-time Dynamic Holographic Scanlines Layer */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-45 mix-blend-screen"
                  style={{
                    background:
                      'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(56,189,248,0.3) 3px, rgba(56,189,248,0.3) 5px)',
                  }}
                />

                {/* Glitch Static Bars */}
                {glitchFlicker && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="w-full h-1 bg-cyan-300 blur-[1px] absolute top-1/3 animate-pulse" />
                    <div className="w-3/4 h-1.5 bg-sky-200 blur-[1px] absolute top-2/3 right-0" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Layer 5: INTERACTIVE DIALOGUE INTERFACE (Matching Reference Image) */}
          <div className="relative z-30 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6 pointer-events-auto">
            <div className="relative w-full flex items-end gap-3 sm:gap-4">
              
              {/* Speaker Character Portrait (Left Box with Glossy Cyan Frame) */}
              <div className="relative flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-4 border-[#38bdf8] bg-gradient-to-b from-[#1b3152] via-[#0d1e38] to-[#081120] shadow-[0_0_30px_rgba(56,189,248,0.65)] overflow-hidden transition-all duration-300">
                {isFutureSelf ? (
                  // Future Self Avatar (from reference frame)
                  <img
                    src={futureSelfSceneImg}
                    alt="Future Self Portrait"
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: '13.5% 80.5%',
                      transform: 'scale(4.8)',
                      transformOrigin: '13.5% 80.5%',
                    }}
                  />
                ) : (
                  // Student Avatar (from character design sheet)
                  <img
                    src={studentSheetImg}
                    alt="Student Portrait"
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: '20% 16%',
                      transform: 'scale(2.2)',
                      transformOrigin: '20% 16%',
                    }}
                  />
                )}

                {/* Subtle Inner Scanlines on Avatar */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-25"
                  style={{
                    background:
                      'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(56,189,248,0.4) 2px, rgba(56,189,248,0.4) 3px)',
                  }}
                />
              </div>

              {/* Large Rounded Speech Bubble (Warm Cream Tone with Speech Tail) */}
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleDialogueAdvance()
                }}
                className="relative flex-1 bg-[#fef8ea] text-[#3d2410] border-2 border-[#ecd8b0] rounded-3xl p-4 sm:p-6 shadow-[0_12px_45px_rgba(0,0,0,0.55)] cursor-pointer transition active:scale-[0.99] min-h-[96px] sm:min-h-[115px] flex flex-col justify-between"
              >
                {/* Speech Bubble Tail Pointing towards Left Avatar */}
                <div
                  className="absolute -left-3 bottom-6 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-r-[13px] border-r-[#fef8ea]"
                />

                {/* Speaker Name Pill (Top-Left Blue Badge) */}
                <div className="absolute -top-3.5 left-5 inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#38bdf8] text-white font-sans font-black text-xs sm:text-sm tracking-wide shadow-[0_3px_10px_rgba(56,189,248,0.6)]">
                  <span className="text-[10px]">▶</span>
                  <span>{speakerName}</span>
                </div>

                {/* Dialogue Subtitle Text (Smooth Typewriter Effect) */}
                <div className="pt-2 sm:pt-1">
                  <p className="text-sm sm:text-base md:text-lg font-sans font-bold text-[#3d2410] leading-relaxed tracking-normal select-none">
                    {displayedText}
                    {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-[#38bdf8] animate-pulse align-middle" />}
                  </p>
                </div>

                {/* Progression Indicator: Sparkling Star in Bottom-Right when Typing Finishes */}
                <div className="w-full flex items-center justify-between pt-2">
                  <span className="text-[10px] font-mono text-[#8b6e4e]/70">
                    {dialogueIdx + 1} / {DIALOGUE_SCRIPT.length}
                  </span>

                  {!isTyping && (
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs sm:text-sm animate-pulse select-none">
                      <span>Click to continue</span>
                      <span className="text-base text-amber-400">✦</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergence Veil: White/Cyan Radiance that dissolves over 1.8s */}
          <div
            className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-[1800ms] ease-out ${
              phase === 'emergence' ? 'opacity-100 bg-white' : 'opacity-0'
            }`}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIALOGUE HISTORY LOG DRAWER (MODAL OVERLAY) */}
      {/* ========================================================================= */}
      {showLog && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation()
            setShowLog(false)
          }}
        >
          <div
            className="w-full max-w-2xl max-h-[75vh] bg-[#0c1424] border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.5)] p-5 flex flex-col justify-between overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <h3 className="font-mono font-black text-sm tracking-widest text-cyan-300 uppercase">
                // TRANSMISSION LOG: 2042 RESTORATION
              </h3>
              <button
                onClick={() => setShowLog(false)}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 font-sans text-xs sm:text-sm pr-2">
              {DIALOGUE_SCRIPT.slice(0, dialogueIdx + 1).map((line, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border ${
                    line.avatar === 'future_self'
                      ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-100'
                      : 'bg-amber-950/30 border-amber-500/30 text-amber-100'
                  }`}
                >
                  <span className="font-bold text-xs uppercase tracking-wider block mb-1">
                    {line.speaker === 'STUDENT' ? (playerName || 'Student') : 'Future Self'}
                  </span>
                  <p className="leading-relaxed">{line.text.replace(/Seeker/g, playerName || 'Student')}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center text-[10px] text-gray-400 font-mono">
              Click anywhere outside to resume dialogue
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GLIMPSE OF THE DESTROYED FUTURE CITY (YEAR 2042: THE FALL) */}
      {/* ========================================================================= */}
      {phase === 'glimpse' && (
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden animate-fadeIn">
          {/* Ruined City in background */}
          <div
            className="absolute inset-0 bg-cover bg-center filter contrast-125"
            style={{ backgroundImage: `url(${cityBgImg})` }}
          />

          {/* Crimson & Chromatic Glitch Aberration */}
          <div
            className="absolute inset-0 bg-red-600/30 mix-blend-color-burn pointer-events-none"
            style={{ opacity: glitchIntensity * 0.8 }}
          />
          <div
            className="absolute inset-0 bg-cyan-500/20 mix-blend-screen pointer-events-none"
            style={{
              transform: `translate(${(glitchIntensity - 0.5) * 16}px, ${(glitchIntensity - 0.5) * 8}px)`,
            }}
          />

          {/* Ominous Warning Overlay */}
          <div className="relative z-10 p-6 sm:p-8 max-w-xl text-center bg-black/85 border-2 border-red-500 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.7)] backdrop-blur">
            <div className="inline-block px-3 py-1 rounded bg-red-600 text-black font-black text-xs uppercase tracking-widest mb-3 animate-pulse">
              [ TIMELINE CORRUPTION DETECTED ]
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-red-400 font-mono tracking-wider uppercase mb-2">
              YEAR 2042: THE FALL
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
              &quot;Autonomous intelligence expanded without human boundaries. Cities collapsed. Power
              networks went dark. The simulation is your only chance to rewrite our fate.&quot;
              <br />
              <strong className="text-yellow-300 font-mono mt-2 block">
                The future depends on the choices you make today.
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CINEMATIC BLACKOUT PAUSE */}
      {/* ========================================================================= */}
      {phase === 'fadeout' && (
        <div
          className="relative z-50 w-full h-full bg-black animate-fadeIn"
          aria-label="Transitioning to final title card"
        />
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL FINAL TITLE SCREEN & EPILOGUE CARD */}
      {/* ========================================================================= */}
      {phase === 'title' && (
        <div className="relative w-full h-full flex flex-col justify-between items-center p-4 sm:p-8 bg-gradient-to-b from-[#06040d] via-[#0d091a] to-[#04020a] animate-fadeIn text-center overflow-hidden">
          {/* Peaceful Meadow Silhouette Background with Ambient Blur */}
          <div
            className="absolute inset-0 bg-cover bg-bottom opacity-20 filter blur-sm pointer-events-none"
            style={{ backgroundImage: `url(${peacefulFieldImg})` }}
          />

          {/* Top Title Bar */}
          <div className="w-full flex justify-end items-center z-10">
            <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase">
              STORY BY TEAM STRAWHATS
            </span>
          </div>

          {/* Centerpiece: Official THE WAY OUT Logo & Title */}
          <div className="relative z-10 my-auto flex flex-col items-center py-2 sm:py-3 max-w-xl">
            <img
              src={gameLogoImg}
              alt="The Way Out Official Logo"
              className="w-32 sm:w-44 h-auto object-contain drop-shadow-[0_0_40px_rgba(249,115,22,0.45)] rounded-2xl mb-3 sm:mb-4 hover:scale-105 transition-transform"
            />

            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 uppercase drop-shadow-[0_2px_15px_rgba(245,158,11,0.5)]">
              THE WAY OUT
            </h1>

            <div className="my-2 sm:my-3 h-0.5 w-24 sm:w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            <h2 className="text-base sm:text-xl font-mono font-bold tracking-[0.2em] text-cyan-200 uppercase">
              THE END... FOR NOW.
            </h2>

            <div className="mt-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-amber-500/20 border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <span className="text-xs sm:text-sm font-black font-mono tracking-[0.3em] text-amber-300 uppercase animate-pulse">
                TO BE CONTINUED.
              </span>
            </div>

            <p className="max-w-md mx-auto text-xs sm:text-sm text-gray-300 font-sans leading-relaxed mt-4 italic [text-wrap:pretty]">
              &quot;The person you sought to save was who you will become. The battle for ethical AI has only just begun.&quot;
            </p>
          </div>

          {/* Bottom Actions & Credits (With Clean Vector Icon, No Emojis) */}
          <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-3 pb-3">
            <div className="text-[11px] font-mono tracking-widest text-gray-400 uppercase">
              Made with pride by <span className="text-amber-300 font-bold">team StrawHats</span>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={onRestart}
                className="flex-1 py-3 px-5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:brightness-110 active:scale-95 text-black font-mono font-black text-xs uppercase tracking-[0.18em] shadow-[0_0_25px_rgba(245,158,11,0.55)] border border-amber-200/90 cursor-pointer transition flex items-center justify-center gap-2"
                title="Retry the Journey from Level 1"
              >
                <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M21 21v-5h-5" />
                </svg>
                <span>Retry</span>
              </button>
              <button
                onClick={onBackToMenu}
                className="flex-1 py-3 px-5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 font-mono font-bold text-xs uppercase tracking-[0.18em] border border-cyan-500/40 hover:border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
                title="Return to Main Menu"
              >
                <span>Main Menu</span>
                <span className="text-sm">➔</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
