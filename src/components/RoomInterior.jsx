import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Sparkles } from '@react-three/drei'

export default function RoomInterior({
  glitchVisionActive,
  clueDiscovered,
  exitUnlocked,
}) {
  const fluorescentLightRef = useRef()
  const glitchLightRef = useRef()

  // Fluorescent light flicker effect
  useFrame((state) => {
    if (fluorescentLightRef.current) {
      const t = state.clock.getElapsedTime()
      const flicker = Math.sin(t * 25) > 0.94 ? 0.25 : 1.0 + Math.sin(t * 3) * 0.08
      fluorescentLightRef.current.intensity = flicker * 1.6
    }

    if (glitchLightRef.current) {
      glitchLightRef.current.intensity = glitchVisionActive ? 3.5 : 0.4
    }
  })

  return (
    <group>
      {/* ================= ACTUAL PHYSICAL ENCLOSED ROOM ================= */}

      {/* Floor (Y = -1.0, Width 6.0m: X in [-3, 3], Depth 7.6m: Z in [-3.8, 3.8]) */}
      <mesh position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.0, 7.6]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.75}
          metalness={0.25}
        />
      </mesh>

      {/* Ceiling (Y = 2.4, Width 6.0m, Depth 7.6m) */}
      <mesh position={[0, 2.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.0, 7.6]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>

      {/* Back Wall (Z = 3.8, where player stepped through portal) */}
      <mesh position={[0, 0.7, 3.8]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[6.0, 3.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      {/* Portal Entrance Arch */}
      <group position={[0, 0.4, 3.75]}>
        <mesh>
          <boxGeometry args={[1.6, 2.6, 0.08]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.3} />
        </mesh>
        <Text
          position={[0, 1.45, 0.06]}
          fontSize={0.09}
          color="#38bdf8"
          anchorX="center"
        >
          [SECTOR 1 ENTRYWAY]
        </Text>
      </group>

      {/* Front Wall (Z = -3.8, holds the exit blast door) */}
      <mesh position={[0, 0.7, -3.8]}>
        <planeGeometry args={[6.0, 3.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Left Wall (X = -3.0) */}
      <mesh position={[-3.0, 0.7, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[7.6, 3.4]} />
        <meshStandardMaterial color="#182234" roughness={0.85} />
      </mesh>

      {/* Right Wall (X = 3.0) */}
      <mesh position={[3.0, 0.7, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[7.6, 3.4]} />
        <meshStandardMaterial color="#182234" roughness={0.85} />
      </mesh>

      {/* Corner Steel Support Columns to enforce solid physical room boundaries */}
      {[
        [-2.95, -3.75],
        [2.95, -3.75],
        [-2.95, 3.75],
        [2.95, 3.75],
      ].map(([cx, cz], i) => (
        <mesh key={i} position={[cx, 0.7, cz]}>
          <boxGeometry args={[0.2, 3.4, 0.2]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Overhead Fluorescent Strip Fixture */}
      <group position={[0, 2.3, 0]}>
        <mesh>
          <boxGeometry args={[0.35, 0.1, 3.2]} />
          <meshStandardMaterial color="#334155" metalness={0.6} />
        </mesh>
        <mesh position={[0, -0.06, 0]}>
          <boxGeometry args={[0.22, 0.02, 3.0]} />
          <meshBasicMaterial color={glitchVisionActive ? '#38bdf8' : '#f1f5f9'} />
        </mesh>
        <pointLight
          ref={fluorescentLightRef}
          position={[0, -0.2, 0]}
          intensity={1.6}
          distance={8.5}
          color={glitchVisionActive ? '#38bdf8' : '#e2e8f0'}
        />
      </group>

      {/* ================= OBJECT 1: GLITCHED COMPUTER TERMINAL ================= */}
      {/* Position: X = -2.2, Z = 0.6 */}
      <group position={[-2.2, -0.1, 0.6]} rotation={[0, Math.PI / 2, 0]}>
        {/* Metal Desk */}
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[1.4, 0.7, 0.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.6} />
        </mesh>
        {/* Computer Monitor */}
        <mesh position={[0, 0.2, -0.1]}>
          <boxGeometry args={[0.7, 0.5, 0.2]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 0.2, 0.01]}>
          <planeGeometry args={[0.62, 0.42]} />
          <meshBasicMaterial color={glitchVisionActive ? '#06b6d4' : '#14532d'} />
        </mesh>
        <Text
          position={[0, 0.2, 0.02]}
          fontSize={0.045}
          maxWidth={0.58}
          color={glitchVisionActive ? '#fef08a' : '#86efac'}
          anchorX="center"
          anchorY="middle"
        >
          {glitchVisionActive
            ? '>>> GLITCH OVERRIDE <<<\nPASSCODE DETECTED:\n[ 4 - 8 - 2 ]\n(FIRST DIGIT IS GOLD)'
            : 'SYS_CORE v4.1\n[MEMORY CHIP INSERTED]\nPRESS E TO INSPECT'}
        </Text>
        {/* Keyboard */}
        <mesh position={[0, 0.0, 0.2]}>
          <boxGeometry args={[0.5, 0.03, 0.2]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <pointLight
          position={[0, 0.25, 0.2]}
          distance={2.5}
          intensity={0.9}
          color={glitchVisionActive ? '#06b6d4' : '#22c55e'}
        />
      </group>

      {/* ================= OBJECT 2: RUSTED FILING CABINET ================= */}
      {/* Position: X = -2.3, Z = -2.2 */}
      <group position={[-2.3, 0.0, -2.2]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 1.8, 0.6]} />
          <meshStandardMaterial color="#475569" roughness={0.9} metalness={0.4} />
        </mesh>
        {[-0.6, -0.2, 0.2, 0.6].map((y, i) => (
          <mesh key={i} position={[0, y, 0.31]}>
            <boxGeometry args={[0.2, 0.04, 0.04]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
        ))}
        <Text
          position={[0, 0.78, 0.32]}
          fontSize={0.045}
          color="#cbd5e1"
          anchorX="center"
        >
          ARCHIVE // 1998
        </Text>
      </group>

      {/* ================= OBJECT 3: CARGO STORAGE CRATES ================= */}
      {/* Position: X = 2.2, Z = 1.8 */}
      <group position={[2.2, -0.3, 1.8]}>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[1.0, 0.9, 1.0]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
        <mesh position={[0.08, 0.6, 0.05]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.8, 0.7, 0.8]} />
          <meshStandardMaterial color="#92400e" roughness={0.9} />
        </mesh>
      </group>

      {/* ================= OBJECT 4: ARCHIVAL BOOKSHELF ================= */}
      {/* Position: X = 2.4, Z = -1.2 */}
      <group position={[2.4, 0.1, -1.2]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.4, 2.0, 0.45]} />
          <meshStandardMaterial color="#3f2e1e" roughness={0.85} />
        </mesh>
        {[-0.6, -0.1, 0.4].map((y, i) => (
          <mesh key={i} position={[0, y, 0.05]}>
            <boxGeometry args={[1.2, 0.28, 0.3]} />
            <meshStandardMaterial color={i === 1 ? '#1e3a8a' : '#991b1b'} />
          </mesh>
        ))}
        <Text
          position={[0, 0.85, 0.24]}
          fontSize={0.045}
          color="#fed7aa"
          anchorX="center"
        >
          GLITCH ARCHIVES
        </Text>
      </group>

      {/* ================= OBJECT 5: TILTED BLUEPRINT (ON FRONT WALL) ================= */}
      <group position={[1.2, 1.0, -3.75]} rotation={[0, 0, 0.1]}>
        <mesh>
          <boxGeometry args={[1.1, 0.8, 0.03]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1.0, 0.7]} />
          <meshBasicMaterial color="#0c4a6e" />
        </mesh>
        <Text
          position={[0, 0.02, 0.03]}
          fontSize={0.05}
          maxWidth={0.95}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          {`FACILITY BLUEPRINT\nSECTOR 1 ESCAPE ROUTE\nCIPHER HIDDEN AT TERMINAL`}
        </Text>
      </group>

      {/* ================= OBJECT 6: EXIT SECURITY BLAST DOOR & KEYPAD ================= */}
      <group position={[-0.8, 0.3, -3.75]}>
        {/* Door Frame */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[1.5, 2.3, 0.1]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Door Panel */}
        <mesh position={[0, 0.25, 0.02]}>
          <planeGeometry args={[1.3, 2.1]} />
          <meshStandardMaterial
            color={exitUnlocked ? '#065f46' : '#1e293b'}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* Digital Keypad Lock */}
        <group position={[0.9, 0.2, 0.06]}>
          <mesh>
            <boxGeometry args={[0.35, 0.5, 0.06]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[0, 0.13, 0.035]}>
            <planeGeometry args={[0.26, 0.12]} />
            <meshBasicMaterial color={exitUnlocked ? '#22c55e' : '#ef4444'} />
          </mesh>
          <Text
            position={[0, 0.13, 0.04]}
            fontSize={0.035}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {exitUnlocked ? 'OPEN' : 'KEYPAD'}
          </Text>
        </group>

        {/* Status Sign */}
        <Text
          position={[0, 1.55, 0.08]}
          fontSize={0.075}
          color={exitUnlocked ? '#4ade80' : '#f87171'}
          anchorX="center"
        >
          {exitUnlocked ? '✔ BLAST DOOR UNLOCKED' : '🔒 BLAST DOOR LOCKED'}
        </Text>

        <pointLight
          position={[0, 1.1, 0.3]}
          distance={3}
          intensity={exitUnlocked ? 2.5 : 1.0}
          color={exitUnlocked ? '#22c55e' : '#ef4444'}
        />
      </group>

      {/* ================= THE 3D HIDDEN CLUE IN GLITCH VISION ================= */}
      <group position={[-2.2, 0.75, 0.6]}>
        {(glitchVisionActive || clueDiscovered) && (
          <>
            <Text
              fontSize={0.11}
              color="#fbbf24"
              outlineWidth={0.015}
              outlineColor="#451a03"
              anchorX="center"
              anchorY="middle"
            >
              ★ HIDDEN CIPHER: [ 4 - 8 - 2 ]
            </Text>
            <pointLight
              ref={glitchLightRef}
              position={[0, 0, 0.2]}
              distance={2.5}
              intensity={3.0}
              color="#f59e0b"
            />
          </>
        )}
      </group>

      {/* Atmospheric dust motes */}
      <Sparkles
        count={45}
        scale={[5.5, 3.0, 7.0]}
        position={[0, 0.7, 0]}
        size={2}
        speed={0.2}
        color={glitchVisionActive ? '#38bdf8' : '#e2e8f0'}
        opacity={0.35}
      />
    </group>
  )
}
