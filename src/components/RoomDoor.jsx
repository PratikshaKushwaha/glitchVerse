import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

export default function RoomDoor({
  doorIndex,
  positionZ,
  isOpen,
  onInteractKeypad,
  isFinalDoor = false,
}) {
  const hingeRef = useRef()

  // Smooth door opening swing
  useFrame((_, delta) => {
    if (hingeRef.current) {
      // Swings 90 degrees inward when open
      const targetAngle = isOpen ? -Math.PI / 2 : 0
      hingeRef.current.rotation.y = THREE.MathUtils.lerp(
        hingeRef.current.rotation.y,
        targetAngle,
        delta * 4.0
      )
    }
  })

  return (
    <group position={[0, 0, positionZ]}>
      {/* ================= DOOR FRAME ================= */}
      {/* Left Frame Post */}
      <mesh position={[-0.6, 0.1, 0]}>
        <boxGeometry args={[0.1, 2.2, 0.16]} />
        <meshStandardMaterial color="#643b18" roughness={0.7} />
      </mesh>
      {/* Right Frame Post */}
      <mesh position={[0.6, 0.1, 0]}>
        <boxGeometry args={[0.1, 2.2, 0.16]} />
        <meshStandardMaterial color="#643b18" roughness={0.7} />
      </mesh>
      {/* Top Header Lintel */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[1.3, 0.1, 0.16]} />
        <meshStandardMaterial color="#643b18" roughness={0.7} />
      </mesh>
      {/* Floor Threshold Bar (Y = -0.98, touching floor at -1.0) */}
      <mesh position={[0, -0.98, 0]}>
        <boxGeometry args={[1.3, 0.04, 0.18]} />
        <meshStandardMaterial color="#452309" roughness={0.8} />
      </mesh>

      {/* ================= HINGED DOOR PANEL ================= */}
      {/* Hinge pivot at left edge: X = -0.55 */}
      <group position={[-0.55, 0, 0]}>
        <group ref={hingeRef}>
          {/* Door panel offset by half-width (+0.55) so it swings naturally on its hinge */}
          <group position={[0.55, 0.1, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.1, 2.2, 0.06]} />
              <meshStandardMaterial
                color={isFinalDoor ? '#451a03' : '#6b3e1b'}
                roughness={0.65}
                metalness={isFinalDoor ? 0.3 : 0.1}
              />
            </mesh>

            {/* Brass Doorknob at waist height (Y = -0.05 in local door space = 0.05m world height) */}
            <mesh position={[0.42, -0.05, 0.04]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.42, -0.05, -0.04]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ================= WALL KEYPAD (Mounted to right of door) ================= */}
      <group
        position={[1.05, 0.1, 0.02]}
        onClick={(e) => {
          e.stopPropagation()
          if (!isOpen) {
            onInteractKeypad && onInteractKeypad(doorIndex)
          }
        }}
      >
        {/* Keypad Plate */}
        <mesh>
          <boxGeometry args={[0.46, 0.74, 0.03]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Digital Screen at Top */}
        <mesh position={[0, 0.24, 0.018]}>
          <planeGeometry args={[0.38, 0.12]} />
          <meshBasicMaterial color={isOpen ? '#22c55e' : '#0f172a'} />
        </mesh>
        <Text
          position={[0, 0.24, 0.022]}
          fontSize={0.048}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {isOpen ? 'OPEN' : isFinalDoor ? 'VAULT' : 'KEYPAD'}
        </Text>

        {/* Keypad Buttons Grid (3x4) */}
        <group position={[0, -0.06, 0.02]}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['✔', '0', '✖'],
          ].map((row, rIdx) =>
            row.map((btn, cIdx) => {
              const bx = (cIdx - 1) * 0.12
              const by = (1.5 - rIdx) * 0.105
              const isGreen = btn === '✔'
              const isRed = btn === '✖'
              return (
                <group key={btn} position={[bx, by, 0]}>
                  <mesh>
                    <boxGeometry args={[0.105, 0.085, 0.012]} />
                    <meshStandardMaterial
                      color={
                        isGreen
                          ? '#22c55e'
                          : isRed
                          ? '#ef4444'
                          : '#0f172a'
                      }
                      roughness={0.4}
                    />
                  </mesh>
                  <Text
                    position={[0, 0, 0.01]}
                    fontSize={0.042}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {btn}
                  </Text>
                </group>
              )
            })
          )}
        </group>
      </group>
    </group>
  )
}
