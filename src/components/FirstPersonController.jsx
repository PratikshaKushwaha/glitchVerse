import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sound } from '../utils/AudioEngine'

export default function FirstPersonController({
  isReading,
  isDoorLocked,
  isDoorOpen,
  setIsNearManuscript,
  setIsNearDoor,
  onInteractManuscript,
  onInteractDoor,
  onEnterDoor,
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

  // Listen to keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isReading) {
        if (e.key === 'e' || e.key === 'E' || e.key === 'Escape') {
          onInteractManuscript()
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
          // Check proximity
          const distManuscript = Math.hypot(
            playerPos.current.x - 0.814,
            playerPos.current.z - 0.275
          )
          const distDoor = Math.hypot(
            playerPos.current.x - (-0.814),
            playerPos.current.z - (-0.275)
          )

          if (distManuscript < 2.5) {
            onInteractManuscript()
          } else if (distDoor < 2.2) {
            onInteractDoor()
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

  // Pointer lock & drag controls for mouse look
  useEffect(() => {
    const dom = gl.domElement

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

    const onMouseDown = (e) => {
      // Primary button
      if (e.button === 0 && !isReading) {
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
  }, [gl, isReading])

  // Frame update
  useFrame((state, delta) => {
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

    // Walking calculation
    const moveSpeed = (keys.current.sprint ? 3.5 : 2.0) * delta
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

    // Boundary constraints within world environment
    playerPos.current.x = Math.max(-3.5, Math.min(3.5, playerPos.current.x))
    playerPos.current.z = Math.max(-1.8, Math.min(4.0, playerPos.current.z))

    // Door collision logic:
    // Door is at X: [-1.4, -0.2], Z: ~ -0.275
    // If door is NOT open, block walking through Z < -0.1
    const isInDoorXRange =
      playerPos.current.x > -1.5 && playerPos.current.x < -0.1
    if (isInDoorXRange) {
      if (!isDoorOpen) {
        // Closed door blocks player from going beyond Z = -0.05
        if (playerPos.current.z < -0.05) {
          playerPos.current.z = -0.05
        }
      } else {
        // Door is OPEN!
        // If user walks beyond Z = -0.3, they enter the portal to the next screen!
        if (playerPos.current.z < -0.3) {
          onEnterDoor && onEnterDoor()
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
