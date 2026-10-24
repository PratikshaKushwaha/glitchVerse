import { useRef } from 'react'
import { Text } from '@react-three/drei'

export default function RobloxRoomInterior({
  doorOpen,
  codeFound,
}) {
  const keypadRef = useRef()

  return (
    <group>
      {/* ================= 1. ROOM SHELL & ARCHITECTURE ================= */}

      {/* Parquet Wood Tile Floor (Y = -1.0, Width 7.0m, Depth 8.0m) */}
      <mesh position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7.0, 8.0]} />
        <meshStandardMaterial
          color="#b07d4b"
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Ceiling (Y = 2.6) with warm ambient light */}
      <mesh position={[0, 2.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.0, 8.0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>

      {/* Back Wall (Z = 4.0, entrance) */}
      <mesh position={[0, 0.8, 4.0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[7.0, 3.6]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.8} />
      </mesh>

      {/* Left Wall (X = -3.5) */}
      <mesh position={[-3.5, 0.8, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[8.0, 3.6]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.8} />
      </mesh>
      {/* Left Wall Wood Wainscoting / Lower Trim */}
      <mesh position={[-3.48, -0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[8.0, 1.2]} />
        <meshStandardMaterial color="#c28854" roughness={0.7} />
      </mesh>

      {/* Right Wall (X = 3.5) */}
      <mesh position={[3.5, 0.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[8.0, 3.6]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.8} />
      </mesh>
      {/* Right Wall Wood Wainscoting / Lower Trim */}
      <mesh position={[3.48, -0.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[8.0, 1.2]} />
        <meshStandardMaterial color="#c28854" roughness={0.7} />
      </mesh>

      {/* Front Wall (Z = -4.0, with Doorway and Keypad) */}
      <mesh position={[0, 0.8, -4.0]}>
        <planeGeometry args={[7.0, 3.6]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.8} />
      </mesh>
      {/* Front Wall Wood Wainscoting / Lower Trim */}
      <mesh position={[0, -0.4, -3.98]}>
        <planeGeometry args={[7.0, 1.2]} />
        <meshStandardMaterial color="#c28854" roughness={0.7} />
      </mesh>

      {/* Skirting board baseboard moulding around perimeter */}
      <mesh position={[0, -0.96, -3.96]}>
        <boxGeometry args={[7.0, 0.08, 0.04]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>

      {/* ================= 2. LARGE RED CARPET IN THE CENTER ================= */}
      <mesh position={[0.2, -0.99, 0.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.8, 4.4]} />
        <meshStandardMaterial
          color="#dc2626"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* ================= 3. ROUND WOODEN TABLE WITH THE CODE ================= */}
      {/* Positioned in the left corner like screenshot 2 & 3 */}
      <group position={[-2.3, -0.5, -2.4]}>
        {/* Round Table Top */}
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.75, 0.75, 0.08, 32]} />
          <meshStandardMaterial color="#b4743c" roughness={0.7} />
        </mesh>
        {/* 4 Table Legs */}
        {[
          [-0.45, -0.45],
          [0.45, -0.45],
          [-0.45, 0.45],
          [0.45, 0.45],
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, -0.25, lz]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.7, 16]} />
            <meshStandardMaterial color="#8c5326" roughness={0.8} />
          </mesh>
        ))}

        {/* The Paper Note with Code: 6845 */}
        <group position={[-0.1, 0.195, 0]} rotation={[0, -0.2, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.42, 0.22]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </mesh>
          <Text
            position={[0, 0.005, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.085}
            color="#1e293b"
            fontWeight="bold"
            anchorX="center"
            anchorY="middle"
          >
            6845
          </Text>
        </group>
      </group>

      {/* ================= 4. TEXT ON THE WALL ABOVE DOOR ================= */}
      {/* Exact text from Screenshots 2 & 3 */}
      <group position={[0, 1.9, -3.97]}>
        <Text
          position={[-1.2, 0.3, 0]}
          fontSize={0.09}
          maxWidth={1.4}
          color="#334155"
          anchorX="center"
          textAlign="center"
        >
          Only one person has to write the code!
        </Text>
        <Text
          position={[0.1, 0.4, 0]}
          fontSize={0.11}
          color="#1e293b"
          fontWeight="bold"
          anchorX="center"
        >
          Find them!
        </Text>
        <Text
          position={[1.3, 0.3, 0]}
          fontSize={0.09}
          maxWidth={1.4}
          color="#334155"
          anchorX="center"
          textAlign="center"
        >
          somewhere in this room!
        </Text>
      </group>

      {/* ================= 5. WALL KEYPAD MOUNTED TO RIGHT OF DOOR ================= */}
      {/* Position: X = 1.15, Y = 0.5, Z = -3.95 */}
      <group ref={keypadRef} position={[1.15, 0.5, -3.96]}>
        {/* White Keypad Plate */}
        <mesh>
          <boxGeometry args={[0.48, 0.78, 0.03]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 0.26, 0.018]}>
          <planeGeometry args={[0.4, 0.12]} />
          <meshBasicMaterial color={doorOpen ? '#22c55e' : '#0f172a'} />
        </mesh>
        <Text
          position={[0, 0.26, 0.022]}
          fontSize={0.05}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {doorOpen ? 'OPEN' : 'ENTER'}
        </Text>

        {/* 3x4 Grid of Buttons (Exact Roblox Keypad layout from screenshot) */}
        {/* Row 1: 1 2 3 */}
        {/* Row 2: 4 5 6 */}
        {/* Row 3: 7 8 9 */}
        {/* Row 4: ✔ 0 ✖ */}
        <group position={[0, -0.05, 0.02]}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['✔', '0', '✖'],
          ].map((row, rIdx) =>
            row.map((btn, cIdx) => {
              const bx = (cIdx - 1) * 0.125
              const by = (1.5 - rIdx) * 0.11
              const isGreen = btn === '✔'
              const isRed = btn === '✖'
              return (
                <group key={btn} position={[bx, by, 0]}>
                  <mesh>
                    <boxGeometry args={[0.11, 0.09, 0.015]} />
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
                    fontSize={0.048}
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

      {/* ================= 6. LARGE YELLOW POSTER ON RIGHT WALL ================= */}
      {/* Like the yellow company billboard in screenshot 3 */}
      <group position={[3.48, 0.9, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Yellow Background Canvas */}
        <mesh>
          <planeGeometry args={[2.8, 1.5]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
        {/* Poster Frame */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[2.88, 1.58, 0.02]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <Text
          position={[0, 0.45, 0.02]}
          fontSize={0.16}
          fontWeight="bold"
          color="#ffffff"
          anchorX="center"
        >
          GLITCH COMPANY
        </Text>
        {/* Poster Subtitle */}
        <Text
          position={[0, 0.0, 0.02]}
          fontSize={0.14}
          color="#1e293b"
          anchorX="center"
        >
          [ CORE SYSTEM TERMINAL ]
        </Text>
        <Text
          position={[0, -0.4, 0.02]}
          fontSize={0.08}
          color="#451a03"
          anchorX="center"
        >
          SECTOR 1 ESCAPE PUZZLE
        </Text>
      </group>

      {/* ================= 7. DOORWAY AND NEXT LEVEL PREVIEW ================= */}
      {/* Centered doorway frame at Z = -4.0 */}
      <group position={[0, 0.35, -4.0]}>
        {/* Door Frame Wood Trim */}
        <mesh position={[0, 0.9, 0.02]}>
          <boxGeometry args={[1.5, 2.5, 0.08]} />
          <meshStandardMaterial color="#854d0e" />
        </mesh>

        {/* Closed Door panel (disappears when open) */}
        {!doorOpen ? (
          <mesh position={[0, 0.9, 0.04]}>
            <planeGeometry args={[1.3, 2.3]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        ) : (
          /* When door is open, the warm corridor from Screenshot 1 & 2 is revealed! */
          <group position={[0, 0, -3.5]}>
            {/* Corridor Floor with terracotta tiles */}
            <mesh position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.5, 7.0]} />
              <meshStandardMaterial color="#9a3412" roughness={0.7} />
            </mesh>
            {/* Glowing Golden Ceiling */}
            <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.5, 7.0]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
            <pointLight position={[0, 1.2, 0]} intensity={2.0} color="#f59e0b" distance={8} />

            {/* Red Brick Columns on left and right */}
            {[-1.1, 1.1].map((colX, i) => (
              <mesh key={i} position={[colX, 0.3, 0]}>
                <boxGeometry args={[0.35, 3.0, 0.35]} />
                <meshStandardMaterial color="#b91c1c" roughness={0.8} />
              </mesh>
            ))}

            {/* Back Exit Door in Next Room */}
            <mesh position={[0, 0.5, -3.4]}>
              <planeGeometry args={[1.2, 2.2]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <Text
              position={[0, 1.8, -3.35]}
              fontSize={0.09}
              color="#fef08a"
              anchorX="center"
            >
              LEVEL 2 NEXT ➔
            </Text>
          </group>
        )}
      </group>

      {/* Room Lighting */}
      <ambientLight intensity={0.85} color="#ffffff" />
      <directionalLight
        position={[2, 6, 3]}
        intensity={1.2}
        color="#fffbeb"
        castShadow
      />
      <pointLight position={[0, 2.0, 0]} intensity={0.9} distance={8} color="#ffffff" />
    </group>
  )
}
