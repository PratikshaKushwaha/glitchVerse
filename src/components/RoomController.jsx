import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sound } from '../utils/AudioEngine'

export default function RoomController({
  isInspecting,
  isKeypadOpen,
  onInteract,
  glitchVisionActive,
  setNearObject,
  exitUnlocked,
}) {
  const { camera, gl } = useThree()

  // Player state: spawn at back entrance of room looking forward
  const playerPos = useRef(new THREE.Vector3(0, 0.4, 2.8))
  const yaw = useRef(0)
  const pitch = useRef(0)
  const isPointerLocked = useRef(false)
  const isDragging = useRef(false)
  const previousMouse = useRef({ x: 0, y: 0 })

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  })

  const walkTime = useRef(0)
  const lastFootstep = useRef(0)

  // Interactive objects with trigger radius
  const interactiveObjects = [
    { id: 'terminal', name: 'Glitched Computer Terminal', pos: [-2.2, 0.4, 0.6], radius: 1.7 },
    { id: 'cabinet', name: 'Rusted Filing Cabinet', pos: [-2.3, 0.4, -2.2], radius: 1.5 },
    { id: 'crates', name: 'Stacked Cargo Crates', pos: [2.2, 0.4, 1.8], radius: 1.6 },
    { id: 'bookshelf', name: 'Archival Bookshelf', pos: [2.4, 0.4, -1.2], radius: 1.6 },
    { id: 'blueprint', name: 'Tilted Facility Blueprint', pos: [1.2, 0.4, -3.2], radius: 1.5 },
    { id: 'keypad', name: 'Blast Door Keypad', pos: [-0.8, 0.4, -3.2], radius: 1.6 },
  ]

  // Physical Obstacle AABBs inside the room (minX, maxX, minZ, maxZ)
  const obstacles = [
    { name: 'desk', minX: -2.9, maxX: -1.5, minZ: -0.1, maxZ: 1.3 },
    { name: 'cabinet', minX: -2.9, maxX: -1.7, minZ: -2.8, maxZ: -1.6 },
    { name: 'crates', minX: 1.5, maxX: 2.9, minZ: 1.1, maxZ: 2.5 },
    { name: 'bookshelf', minX: 1.8, maxX: 2.9, minZ: -1.9, maxZ: -0.5 },
  ]

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isInspecting || isKeypadOpen) {
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
  }, [isInspecting, isKeypadOpen, onInteract])

  // Pointer lock & drag controls
  useEffect(() => {
    const dom = gl.domElement

    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === dom
    }

    const onMouseMove = (e) => {
      if (isInspecting || isKeypadOpen) return

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
      if (e.button === 0 && !isInspecting && !isKeypadOpen) {
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
  }, [gl, isInspecting, isKeypadOpen])

  // Solid Collision Helper
  const checkCollision = (testPos) => {
    const playerRadius = 0.38

    // 1. Solid Perimeter Walls (Room is X in [-3, 3], Z in [-3.8, 3.8])
    if (
      testPos.x < -3.0 + playerRadius ||
      testPos.x > 3.0 - playerRadius ||
      testPos.z < -3.8 + playerRadius ||
      testPos.z > 3.8 - playerRadius
    ) {
      return true
    }

    // 2. Blast Door when locked (Z < -3.3 in front of door)
    if (!exitUnlocked) {
      if (testPos.z < -3.3 && testPos.x > -1.6 && testPos.x < 0.2) {
        return true
      }
    }

    // 3. Interior furniture obstacles
    for (const obs of obstacles) {
      if (
        testPos.x > obs.minX - playerRadius &&
        testPos.x < obs.maxX + playerRadius &&
        testPos.z > obs.minZ - playerRadius &&
        testPos.z < obs.maxZ + playerRadius
      ) {
        return true
      }
    }

    return false
  }

  // Frame update with sliding collision resolution
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

    if (isInspecting || isKeypadOpen) return

    // Movement calculation
    const moveSpeed = (keys.current.sprint ? 3.4 : 2.0) * delta
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

      // Slide resolution on X axis
      const targetPosX = new THREE.Vector3(
        playerPos.current.x + moveDelta.x,
        playerPos.current.y,
        playerPos.current.z
      )
      if (!checkCollision(targetPosX)) {
        playerPos.current.x = targetPosX.x
      }

      // Slide resolution on Z axis
      const targetPosZ = new THREE.Vector3(
        playerPos.current.x,
        playerPos.current.y,
        playerPos.current.z + moveDelta.z
      )
      if (!checkCollision(targetPosZ)) {
        playerPos.current.z = targetPosZ.z
      }

      // Head-bob & footsteps
      walkTime.current += delta * (keys.current.sprint ? 14 : 9)
      const now = performance.now()
      if (now - lastFootstep.current > (keys.current.sprint ? 320 : 500)) {
        sound.playFootstep()
        lastFootstep.current = now
      }
    }

    const headBob = isMoving ? Math.sin(walkTime.current) * 0.025 : 0
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
