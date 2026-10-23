import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Text } from '@react-three/drei'
import manuscriptGlbUrl from '../assets/separated_objects/glb/object_0001/model_shaded.glb?url'
import { sound } from '../utils/AudioEngine'

const FULL_MANUSCRIPT_TEXT = `[TRANSMISSION RECOVERED]
THE GLITCHVERSE CHRONICLE
-------------------------
DEVELOPER SIGNAL:
"You made it... The system is collapsing.
I am trapped inside the core memory.
Clear the 4 glitched sectors to free me.

LEVEL 1: THE ABANDONED COMPLEX
Search the rooms. Look for the golden codes.
The teleport door has been unlocked.
Step forward into the breach."`

export default function Manuscript({
  isNear,
  isReading,
  isRead,
  onInteract,
}) {
  const groupRef = useRef()
  const textRef = useRef()
  const { scene } = useGLTF(manuscriptGlbUrl)

  // Typewriter text state on the 3D model
  const [typedLength, setTypedLength] = useState(0)
  const [hovered, setHovered] = useState(false)

  // Base transform from transform_matrix.json
  const basePos = [0.814, 0.106, 0.275]
  const baseRot = [0, -0.161, 0]
  const baseScale = [0.574, 0.574, 0.574]

  // Typewriter effect when reading starts or after being read
  useEffect(() => {
    if (isRead) {
      setTypedLength(FULL_MANUSCRIPT_TEXT.length)
      return
    }

    if (isReading) {
      setTypedLength(0)
      let index = 0
      const interval = setInterval(() => {
        index += 2
        if (index >= FULL_MANUSCRIPT_TEXT.length) {
          setTypedLength(FULL_MANUSCRIPT_TEXT.length)
          clearInterval(interval)
        } else {
          setTypedLength(index)
          if (index % 4 === 0) {
            sound.playTypewriter()
          }
        }
      }, 35)

      return () => clearInterval(interval)
    } else if (!isRead) {
      setTypedLength(0)
    }
  }, [isReading, isRead])

  // Floating vertical animation
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    // Smooth vertical bobbing
    groupRef.current.position.y = basePos[1] + Math.sin(t * 2) * 0.07
    // Subtle mystical sway
    groupRef.current.rotation.z = Math.sin(t * 1.5) * 0.03
    groupRef.current.rotation.y = baseRot[1] + Math.cos(t * 1.1) * 0.04
  })

  const visibleText = isRead
    ? FULL_MANUSCRIPT_TEXT
    : isReading
    ? FULL_MANUSCRIPT_TEXT.slice(0, typedLength)
    : ''

  return (
    <group
      ref={groupRef}
      position={basePos}
      rotation={baseRot}
      scale={baseScale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        onInteract && onInteract()
      }}
    >
      {/* 3D Manuscript Model */}
      <primitive object={scene} />

      {/* 3D Typewriter Text rendered directly on the floating manuscript */}
      {visibleText.length > 0 && (
        <group position={[0, 0.05, 0.12]}>
          <Text
            ref={textRef}
            fontSize={0.062}
            maxWidth={1.25}
            lineHeight={1.3}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color={isRead ? '#86efac' : '#38bdf8'}
            outlineWidth={0.006}
            outlineColor="#042f2e"
          >
            {visibleText}
          </Text>
        </group>
      )}

      {/* Floating Holographic Rune / Halo Indicator */}
      <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.65, 32]} />
        <meshBasicMaterial
          color={isRead ? '#22c55e' : isNear || hovered ? '#38bdf8' : '#f59e0b'}
          transparent
          opacity={isNear || hovered ? 0.85 : 0.45}
        />
      </mesh>

      {/* Floating Aura Light */}
      <pointLight
        position={[0, 0, 0.3]}
        distance={2.5}
        intensity={isNear || hovered ? 2.5 : 1.2}
        color={isRead ? '#4ade80' : '#38bdf8'}
      />
    </group>
  )
}

useGLTF.preload(manuscriptGlbUrl)
