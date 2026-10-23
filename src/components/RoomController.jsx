import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sound } from '../utils/AudioEngine'

export default function RoomController({
  isKeypadOpen,
  isInspectingNote,
  onInteract,
  setNearObject,
  doorsOpen,
  jumpTrigger,
  respawnTrigger,
}) {
  const { camera, gl } = useThree()

  // Player state: spawn in center of Room 1 looking toward Door 1
  const playerPos = useRef(new THREE.Vector3(0, 0.2, 1.5))
  const yaw = useRef(0)
  const pitch = useRef(0)
  const isPointerLocked = useRef(false)
  const isDragging = useRef(false)
  const previousMouse = useRef({ x: 0, y: 0 })

  // Jumping
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

  // Handle respawn back to Room 1
  useEffect(() => {
    if (respawnTrigger) {
      playerPos.current.set(0, 0.2, 1.5)
      yaw.current = 0
      pitch.current = 0
    }
  }, [respawnTrigger])

  // Interactive items across all 5 rooms
  const interactiveObjects = [
    // Room 1
    { id: 'note-0', name: 'Note on Round Table', pos: [-2.2, 0.2, -1.2], radius: 1.8 },
    { id: 'keypad-0', name: 'Room 1 Keypad', pos: [1.05, 0.2, -3.5], radius: 1.8 },
    // Room 2
    { id: 'note-1', name: 'Note on Study Desk', pos: [2.4, 0.2, -6.2], radius: 1.8 },
    { id: 'keypad-1', name: 'Room 2 Keypad', pos: [1.05, 0.2, -10.5], radius: 1.8 },
    // Room 3
    { id: 'note-2', name: 'Memo on Filing Cabinet', pos: [-2.6, 0.2, -15.0], radius: 1.8 },
    { id: 'keypad-2', name: 'Room 3 Keypad', pos: [1.05, 0.2, -17.5], radius: 1.8 },
    // Room 4
    { id: 'note-3', name: 'Log on Terminal Desk', pos: [-2.4, 0.2, -20.5], radius: 1.8 },
    { id: 'keypad-3', name: 'Room 4 Keypad', pos: [1.05, 0.2, -24.5], radius: 1.8 },
    // Room 5
    { id: 'note-4', name: 'Master Cipher Console', pos: [-2.4, 0.2, -28.0], radius: 2.2 },
    { id: 'keypad-4', name: 'Final Vault Keypad', pos: [1.05, 0.2, -31.5], radius: 1.8 },
  ]

  // Door Z thresholds
  const doorZPositions = [-3.5, -10.5, -17.5, -24.5, -31.5]

  // External jump button
  useEffect(() => {
    if (jumpTrigger && !isJumping.current) {
      isJumping.current = true
      jumpVelocity.current = 4.5
    }
  }, [jumpTrigger])

  // Keyboard controls
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

  // Mouse look with pointer lock
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

  // Robust solid collision across 5 connected rooms
  const checkCollision = (testPos) => {
    const r = 0.38

    // 1. Perimeter Side Walls: X in [-3.5, 3.5]
    if (testPos.x < -3.5 + r || testPos.x > 3.5 - r) return true

    // 2. Back Wall of Room 1: Z = +3.5
    if (testPos.z > 3.5 - r) return true

    // 3. Doors & Partition Walls check
    for (let d = 0; d < 5; d++) {
      const doorZ = doorZPositions[d]
      const isDoorOpen = doorsOpen[d]

      // If within 0.4m of the wall boundary
      if (Math.abs(testPos.z - doorZ) < 0.25 + r) {
        // Is player in the doorway passage? (Door opening is X in [-0.55, 0.55])
        const isInDoorway = Math.abs(testPos.x) <= 0.52

        if (isInDoorway) {
          // If door is closed, player cannot walk through
          if (!isDoorOpen) {
            return true
          }
        } else {
          // Player is hitting the solid wall to left or right of doorway
          return true
        }
      }
    }

    // 4. Furniture collisions (rigged obstacles)
    // Room 1 Table
    if (testPos.x > -2.9 && testPos.x < -1.5 && testPos.z > -1.9 && testPos.z < -0.5) return true
    // Room 2 Desk
    if (testPos.x > 1.6 && testPos.x < 3.2 && testPos.z > -7.0 && testPos.z < -5.4) return true
    // Room 3 Filing Cabinet
    if (testPos.x > -3.2 && testPos.x < -2.0 && testPos.z > -15.8 && testPos.z < -14.2) return true
    // Room 4 Terminal Desk
    if (testPos.x > -3.2 && testPos.x < -1.6 && testPos.z > -21.3 && testPos.z < -19.7) return true
    // Room 5 Rigged Side Console Table
    if (testPos.x > -3.3 && testPos.x < -1.5 && testPos.z > -28.9 && testPos.z < -27.1) return true

    return false
  }

  // Frame update
  useFrame((_, delta) => {
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

    // Movement
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
