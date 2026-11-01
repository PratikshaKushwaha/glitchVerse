import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sound } from '../utils/AudioEngine'

export default function FirstPersonController({
  isReading,
  isDoorLocked,
  isDoorOpen,
  isFrozen = false,
  setIsNearManuscript,
  setIsNearDoor,
  onInteractManuscript,
  onInteractDoor,
  onEnterDoor,
  moveInput,
}) {
  const { camera, gl } = useThree()

  // Player state
  const playerPos = useRef(new THREE.Vector3(0, 0.1, 3.2))
  const yaw = useRef(0) // rotation around Y
  const pitch = useRef(0) // rotation around X
  const isPointerLocked = useRef(false)
  const isDragging = useRef(false)
  const previousMouse = useRef({ x: 0, y: 0 })

  // Input keys
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  })

  // Footstep sound & head-bob tracker
  const walkTime = useRef(0)
  const lastFootstep = useRef(0)
  const prevZ = useRef(3.2)

  // Listen to keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Frozen during waking overlay: ignore all gameplay keys
      if (isFrozen) return
      // If modal is actively open, yield keyboard events to ManuscriptModal
      if (isReading) return

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true
          break
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true
          break
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true
          break
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = true
          break
        case 'KeyE': {
          // Check proximity to manuscript and door
          const distManuscript = Math.hypot(
            playerPos.current.x - 0.814,
            playerPos.current.z - 0.275
          )
          const distDoor = Math.hypot(
            playerPos.current.x - (-0.814),
            playerPos.current.z - (-0.275)
          )

          // Prioritize whichever target is closest
          if (distDoor < distManuscript) {
            if (distDoor < 2.8) {
              onInteractDoor()
            } else if (distManuscript < 2.5) {
              onInteractManuscript()
            }
          } else {
            if (distManuscript < 2.5) {
              onInteractManuscript()
            } else if (distDoor < 2.8) {
              onInteractDoor()
            }
          }
          break
        }
        default:
          break
      }
    }

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false
          break
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false
          break
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false
          break
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = false
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isReading, onInteractManuscript, onInteractDoor])

  // Pointer lock, drag look, touch look, and click-to-interact
  useEffect(() => {
    const dom = gl.domElement
    let isTouchInteracting = false
    let touchStartPos = { x: 0, y: 0, time: 0 }
    let mouseDownPos = { x: 0, y: 0, time: 0 }

    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === dom
    }

    const onMouseMove = (e) => {
      if (isReading) return

      let movementX = 0
      let movementY = 0

      if (isPointerLocked.current) {
        movementX = e.movementX || 0
        movementY = e.movementY || 0
      } else if (isDragging.current) {
        movementX = e.clientX - previousMouse.current.x
        movementY = e.clientY - previousMouse.current.y
        previousMouse.current = { x: e.clientX, y: e.clientY }
      }

      if (movementX !== 0 || movementY !== 0) {
        yaw.current -= movementX * 0.0022
        pitch.current -= movementY * 0.0022
        pitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current))
      }
    }

    // Attach mousedown strictly to canvas element (gl.domElement) to prevent hijacking UI buttons/modals
    const onMouseDown = (e) => {
      if (e.target !== dom || isReading) return
      if (e.button === 0) {
        isDragging.current = true
        previousMouse.current = { x: e.clientX, y: e.clientY }
        mouseDownPos = { x: e.clientX, y: e.clientY, time: Date.now() }
        if (!isPointerLocked.current && dom.requestPointerLock) {
          dom.requestPointerLock().catch(() => {})
        }
      }
    }

    const onMouseUp = (e) => {
      isDragging.current = false
      if (e.target === dom && !isReading) {
        const dt = Date.now() - mouseDownPos.time
        const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y)
        // Click to interact on 3D canvas if close to interactive object
        if (dt < 400 && dist < 12) {
          const distManuscript = Math.hypot(playerPos.current.x - 0.814, playerPos.current.z - 0.275)
          const distDoor = Math.hypot(playerPos.current.x - (-0.814), playerPos.current.z - (-0.275))
          if (distManuscript < 2.5) {
            onInteractManuscript()
          } else if (distDoor < 2.8) {
            onInteractDoor()
          }
        }
      }
    }

    // Mobile touch look & tap to interact
    const onTouchStart = (e) => {
      if (e.target !== dom || isReading) return
      if (e.touches.length === 1) {
        isTouchInteracting = true
        const touch = e.touches[0]
        touchStartPos = { x: touch.clientX, y: touch.clientY, time: Date.now() }
        previousMouse.current = { x: touch.clientX, y: touch.clientY }
      }
    }

    const onTouchMove = (e) => {
      if (!isTouchInteracting || isReading || e.touches.length === 0) return
      const touch = e.touches[0]
      const movementX = touch.clientX - previousMouse.current.x
      const movementY = touch.clientY - previousMouse.current.y
      previousMouse.current = { x: touch.clientX, y: touch.clientY }

      yaw.current -= movementX * 0.0035
      pitch.current -= movementY * 0.0035
      pitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current))
    }

    const onTouchEnd = (e) => {
      if (!isTouchInteracting) return
      isTouchInteracting = false
      if (isReading) return

      const dt = Date.now() - touchStartPos.time
      const changed = e.changedTouches[0]
      if (changed) {
        const dist = Math.hypot(changed.clientX - touchStartPos.x, changed.clientY - touchStartPos.y)
        // Tap to interact on mobile
        if (dt < 350 && dist < 15) {
          const distManuscript = Math.hypot(playerPos.current.x - 0.814, playerPos.current.z - 0.275)
          const distDoor = Math.hypot(playerPos.current.x - (-0.814), playerPos.current.z - (-0.275))
          if (distManuscript < 2.5) {
            onInteractManuscript()
          } else if (distDoor < 2.8) {
            onInteractDoor()
          }
        }
      }
    }

    document.addEventListener('pointerlockchange', onPointerLockChange)
    window.addEventListener('mousemove', onMouseMove)
    dom.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    dom.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      window.removeEventListener('mousemove', onMouseMove)
      dom.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)

      dom.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [gl, isReading, onInteractManuscript, onInteractDoor])

  // Frame update
  useFrame((state, delta) => {
    // Frozen during waking overlay: ignore physics & proximity updates
    if (isFrozen) return

    // Proximity checks
    const distManuscript = Math.hypot(
      playerPos.current.x - 0.814,
      playerPos.current.z - 0.275
    )
    const distDoor = Math.hypot(
      playerPos.current.x - (-0.814),
      playerPos.current.z - (-0.275)
    )

    setIsNearManuscript(distManuscript < 2.5)
    setIsNearDoor(distDoor < 2.2)

    // Camera reading mode smooth lerp
    if (isReading) {
      // Lerp camera to focus on manuscript
      const readingTarget = new THREE.Vector3(0.814, 0.2, 1.35)
      camera.position.lerp(readingTarget, delta * 4)
      camera.lookAt(0.814, 0.15, 0.275)
      return
    }

    // Walking calculation (supports both keyboard and mobile touch pad)
    const isSprint = keys.current.sprint || Boolean(moveInput?.sprint)
    const moveSpeed = (isSprint ? 3.5 : 2.0) * delta
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yaw.current
    )
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yaw.current
    )

    let isMoving = false
    const moveDelta = new THREE.Vector3()

    if (keys.current.forward || Boolean(moveInput?.forward)) {
      moveDelta.add(forward)
      isMoving = true
    }
    if (keys.current.backward || Boolean(moveInput?.backward)) {
      moveDelta.sub(forward)
      isMoving = true
    }
    if (keys.current.right || Boolean(moveInput?.right)) {
      moveDelta.add(right)
      isMoving = true
    }
    if (keys.current.left || Boolean(moveInput?.left)) {
      moveDelta.sub(right)
      isMoving = true
    }

    if (isMoving) {
      moveDelta.normalize().multiplyScalar(moveSpeed)
      playerPos.current.x += moveDelta.x
      playerPos.current.z += moveDelta.z

      // Head bobbing & footsteps
      walkTime.current += delta * (keys.current.sprint ? 14 : 9)
      const now = performance.now()
      if (now - lastFootstep.current > (keys.current.sprint ? 320 : 500)) {
        sound.playFootstep()
        lastFootstep.current = now
      }
    }

    // Boundary constraints within world environment:
    playerPos.current.x = Math.max(-3.5, Math.min(3.5, playerPos.current.x))
    playerPos.current.z = Math.min(4.0, playerPos.current.z)

    // Door center is at X = -0.814, Z = -0.275
    // Doorway opening spans X from -1.65 to 0.0
    const isInDoorwayX =
      playerPos.current.x >= -1.65 && playerPos.current.x <= 0.0

    if (!isInDoorwayX) {
      // Solid wall everywhere outside the doorway:
      // Player CANNOT walk around the back of the door (blocked at Z = -0.15)
      if (playerPos.current.z < -0.15) {
        playerPos.current.z = -0.15
      }
    } else {
      // In the doorway passage:
      if (!isDoorOpen) {
        // Locked/closed door is a solid obstacle: player cannot walk beyond Z = -0.15
        if (playerPos.current.z < -0.15) {
          playerPos.current.z = -0.15
        }
      } else {
        // Door is OPEN!
        // When approaching/stepping through the open doorway (Z <= 0.15 or close to door), activate portal!
        if (playerPos.current.z <= 0.15 || distDoor < 1.45) {
          onEnterDoor && onEnterDoor()
        }
        // Clamped at -0.40 to prevent walking through into void behind
        if (playerPos.current.z < -0.40) {
          playerPos.current.z = -0.40
        }
      }
    }

    // Calculate eye height with walking bob
    const headBob = isMoving ? Math.sin(walkTime.current) * 0.035 : 0
    camera.position.set(
      playerPos.current.x,
      playerPos.current.y + headBob,
      playerPos.current.z
    )

    // Apply rotation
    camera.rotation.order = 'YXZ'
    camera.rotation.y = yaw.current
    camera.rotation.x = pitch.current
    camera.rotation.z = 0
  })

  return null
}
