import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Text } from '@react-three/drei'
import * as THREE from 'three'
import doorGlbUrl from '../assets/separated_objects/glb/object_0000/model_shaded.glb?url'
import { sound } from '../utils/AudioEngine'

export default function Door({
  isLocked,
  isOpen,
  onInteract,
  isNear,
}) {
  const groupRef = useRef()
  const hingeRef = useRef()
  const portalGlowRef = useRef()
  const { scene } = useGLTF(doorGlbUrl)

  // Base transform matrix from transform_matrix.json
  const basePos = [-0.814, -0.106, -0.275]
  const baseRot = [0, -0.0378, 0]
  const baseScale = [1.4256, 1.4256, 1.4256]

  // Track opening audio trigger
  const hasPlayedOpenSound = useRef(false)
  useEffect(() => {
    if (isOpen && !hasPlayedOpenSound.current) {
      sound.playDoorOpen()
      hasPlayedOpenSound.current = true
    } else if (!isOpen) {
      hasPlayedOpenSound.current = false
    }
  }, [isOpen])

  // Smooth door swing animation
  useFrame((state, delta) => {
    if (hingeRef.current) {
      // If open, rotate 95 degrees inward (-1.65 rad)
      const targetAngle = isOpen ? -1.65 : 0
      hingeRef.current.rotation.y = THREE.MathUtils.lerp(
        hingeRef.current.rotation.y,
        targetAngle,
        delta * 3.5
      )
    }

    if (portalGlowRef.current) {
      const t = state.clock.getElapsedTime()
      portalGlowRef.current.intensity = isOpen
        ? 3.0 + Math.sin(t * 5) * 1.0
        : 0.3
    }
  })

  return (
    <group
      ref={groupRef}
      position={basePos}
      rotation={baseRot}
      scale={baseScale}
      onClick={(e) => {
        e.stopPropagation()
        onInteract && onInteract()
      }}
    >
      {/* Door Frame & Hinge Container */}
      {/* Pivot at left edge (-0.48) so the door swings naturally on its hinge */}
      <group position={[-0.48, 0, 0]}>
        <group ref={hingeRef}>
          <group position={[0.48, 0, 0]}>
            <primitive object={scene} />
          </group>
        </group>
      </group>

      {/* Dimensional Portal Void behind the door (revealed when door opens) */}
      <group position={[0, 0, -0.08]}>
        {/* Solid Backboard Frame preventing seeing or walking through from behind */}
        <mesh position={[0, 0, -0.03]}>
          <boxGeometry args={[1.05, 1.9, 0.05]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>

        {/* Swirling Portal Plane (Clickable when open to enter portal) */}
        <mesh
          position={[0, 0, 0]}
          onClick={(e) => {
            e.stopPropagation()
            onInteract && onInteract()
          }}
        >
          <planeGeometry args={[0.96, 1.82]} />
          <meshBasicMaterial
            color={isOpen ? '#0ea5e9' : '#050b14'}
            transparent
            opacity={isOpen ? 0.92 : 0.4}
          />
        </mesh>

        {/* Portal Inner Vortex Rim */}
        {isOpen && (
          <mesh
            position={[0, 0, 0.01]}
            onClick={(e) => {
              e.stopPropagation()
              onInteract && onInteract()
            }}
          >
            <planeGeometry args={[0.88, 1.74]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.7}
            />
          </mesh>
        )}

        {/* Holographic Runes & Status above the doorway */}
        <group position={[0, 1.05, 0.05]}>
          <Text
            fontSize={0.075}
            anchorX="center"
            anchorY="middle"
            color={isLocked ? '#ef4444' : '#22c55e'}
            outlineWidth={0.008}
            outlineColor="#000000"
          >
            {isLocked ? '[SEALED]' : isOpen ? '[PORTAL ACTIVE]' : '[UNLOCKED]'}
          </Text>
        </group>
      </group>

      {/* Holographic Lock Rune Seal in front of door (when locked) */}
      {isLocked && (
        <group position={[0, 0, 0.12]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[0.28, 0.28]} />
            <meshBasicMaterial
              color="#ef4444"
              transparent
              opacity={0.8}
              wireframe
            />
          </mesh>
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.06}
            anchorX="center"
            anchorY="middle"
            color="#fca5a5"
          >
            LOCK
          </Text>
        </group>
      )}

      {/* Portal Emitter Light */}
      <pointLight
        ref={portalGlowRef}
        position={[0, 0, 0.2]}
        distance={4.0}
        color={isLocked ? '#ef4444' : '#38bdf8'}
        intensity={isLocked ? 1.0 : isOpen ? 4.0 : 2.0}
      />
    </group>
  )
}

useGLTF.preload(doorGlbUrl)
