import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sound } from '../utils/AudioEngine'

export default function RoomController({
  isKeypadOpen,
  isInspectingNote,
  onInteract,
  setNearObject,
  doorOpen,
  jumpTrigger,
}) {
  const { camera, gl } = useThree()

  // Player state: spawn in center of the red carpet looking toward the doorway
  const playerPos = useRef(new THREE.Vector3(0, 0.2, 1.2))
  const yaw = useRef(0)
  const pitch = useRef(0)
  const isPointerLocked = useRef(false)
  const isDragging = useRef(false)
  const previousMouse = useRef({ x: 0, y: 0 })

  // Jumping state
  const isJumping = useRef(false)
  const jumpVelocity = useRef(0)

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  })

  const walkTime = useRef(0)
  const lastFootstep = useRef(0)

  // Interactive objects in the Roblox room
  const interactiveObjects = [
    { id: 'table', name: 'Paper Note on Table', pos: [-2.3, 0.2, -2.4], radius: 1.8 },
    { id: 'keypad', name: 'Wall Keypad', pos: [1.15, 0.2, -3.6], radius: 1.8 },
    { id: 'poster', name: 'Yellow Company Billboard', pos: [3.2, 0.2, 0.5], radius: 1.8 },
  ]

  // Furniture Obstacles: Round table
  const obstacles = [
    { minX: -3.1, maxX: -1.5, minZ: -3.2, maxZ: -1.6 },
  ]

  // Trigger jump from external button (Roblox HUD jump button)
  useEffect(() => {
    if (jumpTrigger && !isJumping.current) {
      isJumping.current = true
      jumpVelocity.current = 4.5
    }
  }, [jumpTrigger])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isKeypadOpen || isInspectingNote) {
        if (e.key === 'e' || e.key === 'E' || e.key === 'Escape') {
          onInteract('close')
        }
        return
      }

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
        case 'Space':
          if (!isJumping.current) {
            isJumping.current = true
            jumpVelocity.current = 4.5
          }
          break
        case 'KeyE': {
          for (const obj of interactiveObjects) {
            const dist = Math.hypot(
              playerPos.current.x - obj.pos[0],
              playerPos.current.z - obj.pos[2]
            )
            if (dist < obj.radius) {
              onInteract(obj.id)
              break
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
  }, [isKeypadOpen, isInspectingNote, onInteract])

  // Mouse look
  useEffect(() => {
    const dom = gl.domElement

    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === dom
    }

    const onMouseMove = (e) => {
      if (isKeypadOpen || isInspectingNote) return

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

    const onMouseDown = (e) => {
      if (e.button === 0 && !isKeypadOpen && !isInspectingNote) {
        isDragging.current = true
        previousMouse.current = { x: e.clientX, y: e.clientY }
        if (!isPointerLocked.current && dom.requestPointerLock) {
          dom.requestPointerLock().catch(() => {})
        }
      }
    }

    const onMouseUp = () => {
      isDragging.current = false
    }

    document.addEventListener('pointerlockchange', onPointerLockChange)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [gl, isKeypadOpen, isInspectingNote])

  // Collision helper
  const checkCollision = (testPos) => {
    const r = 0.38

    // Perimeter walls: X in [-3.5, 3.5], Z in [-4.0, 4.0]
    if (testPos.x < -3.5 + r || testPos.x > 3.5 - r) return true
    if (testPos.z > 4.0 - r) return true

    // Front Wall / Doorway:
    if (!doorOpen) {
      if (testPos.z < -4.0 + r) return true
    } else {
      // Door is open: can enter the corridor in X in [-1.1, 1.1] down to Z = -7.0
      if (Math.abs(testPos.x) <= 1.1) {
        if (testPos.z < -7.0 + r) return true
      } else {
        if (testPos.z < -4.0 + r) return true
      }
    }

    // Furniture Obstacles
    for (const obs of obstacles) {
      if (
        testPos.x > obs.minX - r &&
        testPos.x < obs.maxX + r &&
        testPos.z > obs.minZ - r &&
        testPos.z < obs.maxZ + r
      ) {
        return true
      }
    }

    return false
  }

  // Frame update
  useFrame((state, delta) => {
    // Proximity check
    let closestObj = null
    let minDistance = Infinity

    for (const obj of interactiveObjects) {
      const dist = Math.hypot(
        playerPos.current.x - obj.pos[0],
        playerPos.current.z - obj.pos[2]
      )
      if (dist < obj.radius && dist < minDistance) {
        minDistance = dist
        closestObj = obj
      }
    }
    setNearObject(closestObj)

    if (isKeypadOpen || isInspectingNote) return

    // Jump physics
    if (isJumping.current) {
      playerPos.current.y += jumpVelocity.current * delta
      jumpVelocity.current -= 14 * delta
      if (playerPos.current.y <= 0.2) {
        playerPos.current.y = 0.2
        isJumping.current = false
        jumpVelocity.current = 0
      }
    }

    // Walking movement
    const moveSpeed = (keys.current.sprint ? 3.8 : 2.4) * delta
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

    if (keys.current.forward) {
      moveDelta.add(forward)
      isMoving = true
    }
    if (keys.current.backward) {
      moveDelta.sub(forward)
      isMoving = true
    }
    if (keys.current.right) {
      moveDelta.add(right)
      isMoving = true
    }
    if (keys.current.left) {
      moveDelta.sub(right)
      isMoving = true
    }

    if (isMoving) {
      moveDelta.normalize().multiplyScalar(moveSpeed)

      // X slide
      const targetPosX = new THREE.Vector3(
        playerPos.current.x + moveDelta.x,
        playerPos.current.y,
        playerPos.current.z
      )
      if (!checkCollision(targetPosX)) {
        playerPos.current.x = targetPosX.x
      }

      // Z slide
      const targetPosZ = new THREE.Vector3(
        playerPos.current.x,
        playerPos.current.y,
        playerPos.current.z + moveDelta.z
      )
      if (!checkCollision(targetPosZ)) {
        playerPos.current.z = targetPosZ.z
      }

      walkTime.current += delta * (keys.current.sprint ? 14 : 9)
      const now = performance.now()
      if (now - lastFootstep.current > (keys.current.sprint ? 300 : 450)) {
        sound.playFootstep()
        lastFootstep.current = now
      }
    }

    const headBob = isMoving && !isJumping.current ? Math.sin(walkTime.current) * 0.025 : 0
    camera.position.set(
      playerPos.current.x,
      playerPos.current.y + headBob,
      playerPos.current.z
    )

    camera.rotation.order = 'YXZ'
    camera.rotation.y = yaw.current
    camera.rotation.x = pitch.current
    camera.rotation.z = 0
  })

  return null
}
