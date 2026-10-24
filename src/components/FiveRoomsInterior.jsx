import * as THREE from 'three'
import { Text } from '@react-three/drei'
import RoomDoor from './RoomDoor'

export default function FiveRoomsInterior({
  levelData,
  doorsOpen,
  onInteractKeypad,
  onInspectNote,
}) {
  const roomsConfig = [
    // Room 1: Classic Escape Room
    {
      index: 0,
      centerZ: 0,
      wallTopColor: '#dbeafe',
      wallBottomColor: '#c28854',
      floorColor: '#b07d4b',
      rugColor: '#dc2626',
      title: 'Only one person has to write the code!',
      subtitle: 'Find them! somewhere in this room!',
    },
    // Room 2: Library & Study
    {
      index: 1,
      centerZ: -7.0,
      wallTopColor: '#dcfce7',
      wallBottomColor: '#365314',
      floorColor: '#78350f',
      rugColor: '#15803d',
      title: 'Room 2: The Study & Archive',
      subtitle: 'Check the books and study desk for the cipher!',
    },
    // Room 3: Storage & Records
    {
      index: 2,
      centerZ: -14.0,
      wallTopColor: '#ffedd5',
      wallBottomColor: '#7c2d12',
      floorColor: '#57534e',
      rugColor: '#1d4ed8',
      title: 'Room 3: The Records Office',
      subtitle: 'Search the filing cabinet and whiteboard!',
    },
    // Room 4: Cyber Laboratory
    {
      index: 3,
      centerZ: -21.0,
      wallTopColor: '#e0e7ff',
      wallBottomColor: '#1e1b4b',
      floorColor: '#334155',
      rugColor: '#7e22ce',
      title: 'Room 4: Terminal Sector',
      subtitle: 'Inspect the computer terminal and tech locker!',
    },
    // Room 5: The Final Vault
    {
      index: 4,
      centerZ: -28.0,
      wallTopColor: '#fae8ff',
      wallBottomColor: '#581c87',
      floorColor: '#f8fafc',
      rugColor: '#b91c1c',
      title: 'MASTER VAULT LOCK',
      subtitle: 'Arrange the 3 Golden Digits in the exact order! (3 Lives)',
    },
  ]

  return (
    <group>
      {/* Ambient and directional lights */}
      <ambientLight intensity={0.9} color="#ffffff" />
      <directionalLight position={[5, 12, 5]} intensity={1.1} castShadow />

      {/* Render each of the 5 consecutive rooms */}
      {roomsConfig.map((room) => {
        const cz = room.centerZ
        const roomData = levelData.rooms[room.index]

        return (
          <group key={room.index}>
            {/* ================= 1. FLOOR & CEILING (Double-Sided) ================= */}
            <mesh position={[0, -1.0, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[7.0, 7.0]} />
              <meshStandardMaterial
                color={room.floorColor}
                roughness={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0, 2.6, cz]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[7.0, 7.0]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.9}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Ceiling Light for this room */}
            <pointLight position={[0, 2.2, cz]} intensity={0.9} distance={8} color="#ffffff" />

            {/* ================= 2. LEFT & RIGHT SIDE WALLS (Double-Sided) ================= */}
            {/* Left Wall Top Half */}
            <mesh position={[-3.5, 1.1, cz]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[7.0, 3.0]} />
              <meshStandardMaterial
                color={room.wallTopColor}
                roughness={0.8}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Left Wall Bottom Half (Wainscoting) */}
            <mesh position={[-3.48, -0.4, cz]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[7.0, 1.2]} />
              <meshStandardMaterial
                color={room.wallBottomColor}
                roughness={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Right Wall Top Half */}
            <mesh position={[3.5, 1.1, cz]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[7.0, 3.0]} />
              <meshStandardMaterial
                color={room.wallTopColor}
                roughness={0.8}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Right Wall Bottom Half (Wainscoting) */}
            <mesh position={[3.48, -0.4, cz]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[7.0, 1.2]} />
              <meshStandardMaterial
                color={room.wallBottomColor}
                roughness={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* ================= 3. ROOM-SPECIFIC CENTER RUG ================= */}
            <mesh position={[0, -0.99, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[3.8, 4.4]} />
              <meshStandardMaterial
                color={room.rugColor}
                roughness={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* ================= 4. BACK WALL (Only Room 1 has a solid back wall) ================= */}
            {room.index === 0 && (
              <mesh position={[0, 0.8, 3.5]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[7.0, 3.6]} />
                <meshStandardMaterial
                  color={room.wallTopColor}
                  roughness={0.8}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* ================= 5. FRONT PARTITION WALL WITH CUTOUT DOORWAY ================= */}
            {/* Wall Z is at front of room: cz - 3.5 */}
            <group position={[0, 0, cz - 3.5]}>
              {/* Left Wall Section */}
              <mesh position={[-2.05, 0.8, 0]}>
                <planeGeometry args={[2.9, 3.6]} />
                <meshStandardMaterial
                  color={room.wallTopColor}
                  roughness={0.8}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <mesh position={[-2.05, -0.4, 0.01]}>
                <planeGeometry args={[2.9, 1.2]} />
                <meshStandardMaterial
                  color={room.wallBottomColor}
                  roughness={0.7}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Right Wall Section */}
              <mesh position={[2.05, 0.8, 0]}>
                <planeGeometry args={[2.9, 3.6]} />
                <meshStandardMaterial
                  color={room.wallTopColor}
                  roughness={0.8}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <mesh position={[2.05, -0.4, 0.01]}>
                <planeGeometry args={[2.9, 1.2]} />
                <meshStandardMaterial
                  color={room.wallBottomColor}
                  roughness={0.7}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Top Lintel Section Above Door (Y = 1.3 to 2.6) */}
              <mesh position={[0, 1.95, 0]}>
                <planeGeometry args={[1.3, 1.3]} />
                <meshStandardMaterial
                  color={room.wallTopColor}
                  roughness={0.8}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Text Above the Doorway - Safely placed above the door lintel! */}
              <Text
                position={[0, 1.78, 0.03]}
                fontSize={room.index === 4 ? 0.13 : 0.11}
                maxWidth={4.0}
                color={room.index === 4 ? '#f59e0b' : '#1e293b'}
                fontWeight="bold"
                anchorX="center"
                textAlign="center"
              >
                {room.title}
              </Text>
              <Text
                position={[0, 1.5, 0.03]}
                fontSize={0.08}
                maxWidth={4.2}
                color="#475569"
                anchorX="center"
                textAlign="center"
              >
                {room.subtitle}
              </Text>

              {/* The Hinged Room Door & Wall Keypad */}
              <RoomDoor
                doorIndex={room.index}
                positionZ={0}
                isOpen={doorsOpen[room.index]}
                onInteractKeypad={onInteractKeypad}
                isFinalDoor={room.index === 4}
              />
            </group>

            {/* ================= 6. ROOM-SPECIFIC FURNITURE & CLUES ================= */}

            {/* ROOM 1: Round table with paper note and Yellow Company Billboard */}
            {room.index === 0 && (
              <>
                <group
                  position={[-2.2, -0.5, cz - 1.2]}
                  onClick={(e) => {
                    e.stopPropagation()
                    onInspectNote && onInspectNote(0)
                  }}
                >
                  <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.75, 0.75, 0.08, 32]} />
                    <meshStandardMaterial color="#b4743c" roughness={0.7} />
                  </mesh>
                  {[
                    [-0.45, -0.45],
                    [0.45, -0.45],
                    [-0.45, 0.45],
                    [0.45, 0.45],
                  ].map(([lx, lz], i) => (
                    <mesh key={i} position={[lx, -0.25, lz]}>
                      <cylinderGeometry args={[0.06, 0.06, 0.7, 16]} />
                      <meshStandardMaterial color="#8c5326" roughness={0.8} />
                    </mesh>
                  ))}

                  {/* Paper Note on Table */}
                  <group position={[-0.05, 0.195, 0]} rotation={[0, -0.2, 0]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                      <planeGeometry args={[0.45, 0.25]} />
                      <meshStandardMaterial color="#ffffff" roughness={0.9} />
                    </mesh>
                    {roomData?.digits ? (
                      roomData.digits.map((digit, dIdx) => {
                        const isGold =
                          roomData.isGoldenRoom &&
                          dIdx === (roomData.goldDigitPos ?? roomData.goldIndex)
                        return (
                          <Text
                            key={dIdx}
                            position={[(dIdx - 1.5) * 0.08, 0.005, 0]}
                            rotation={[-Math.PI / 2, 0, 0]}
                            fontSize={isGold ? 0.095 : 0.075}
                            color={isGold ? '#eab308' : '#1e293b'}
                            fontWeight={isGold ? 'black' : 'bold'}
                            anchorX="center"
                            anchorY="middle"
                          >
                            {digit}
                          </Text>
                        )
                      })
                    ) : (
                      <Text
                        position={[0, 0.005, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={0.08}
                        color="#1e293b"
                        fontWeight="bold"
                        anchorX="center"
                        anchorY="middle"
                      >
                        {roomData?.code}
                      </Text>
                    )}
                  </group>
                </group>

                {/* Yellow Company Billboard on Right Wall */}
                <group position={[3.48, 0.9, cz + 0.5]} rotation={[0, -Math.PI / 2, 0]}>
                  <mesh>
                    <planeGeometry args={[2.8, 1.5]} />
                    <meshBasicMaterial color="#facc15" side={THREE.DoubleSide} />
                  </mesh>
                  <Text position={[0, 0.45, 0.02]} fontSize={0.16} fontWeight="bold" color="#ffffff">
                    GLITCH COMPANY
                  </Text>
                  <Text position={[0, 0.0, 0.02]} fontSize={0.16} fontWeight="bold" color="#000000">
                    [ CIPHER VAULT ]
                  </Text>
                  <Text position={[0, -0.4, 0.02]} fontSize={0.08} color="#451a03">
                    ESCAPE PUZZLE
                  </Text>
                </group>
              </>
            )}

            {/* ROOM 2: Tall Bookshelf and Study Desk with Desk Lamp */}
            {room.index === 1 && (
              <>
                <group position={[-3.1, 0.3, cz - 1.0]} rotation={[0, Math.PI / 2, 0]}>
                  <mesh>
                    <boxGeometry args={[1.8, 2.2, 0.5]} />
                    <meshStandardMaterial color="#451a03" roughness={0.8} />
                  </mesh>
                  {[-0.6, -0.1, 0.4].map((y, i) => (
                    <mesh key={i} position={[0, y, 0.08]}>
                      <boxGeometry args={[1.5, 0.3, 0.35]} />
                      <meshStandardMaterial color={i === 1 ? '#047857' : '#991b1b'} />
                    </mesh>
                  ))}
                </group>

                <group
                  position={[2.4, -0.4, cz + 0.8]}
                  rotation={[0, -Math.PI / 2, 0]}
                  onClick={(e) => {
                    e.stopPropagation()
                    onInspectNote && onInspectNote(1)
                  }}
                >
                  <mesh position={[0, 0, 0]} castShadow>
                    <boxGeometry args={[1.6, 0.75, 0.8]} />
                    <meshStandardMaterial color="#78350f" roughness={0.7} />
                  </mesh>
                  <mesh position={[0, 0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.45, 0.25]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.9} />
                  </mesh>
                  {roomData?.digits ? (
                    roomData.digits.map((digit, dIdx) => {
                      const isGold =
                        roomData.isGoldenRoom &&
                        dIdx === (roomData.goldDigitPos ?? roomData.goldIndex)
                      return (
                        <Text
                          key={dIdx}
                          position={[(dIdx - 1.5) * 0.08, 0.39, 0]}
                          rotation={[-Math.PI / 2, 0, 0]}
                          fontSize={isGold ? 0.095 : 0.075}
                          color={isGold ? '#eab308' : '#1e293b'}
                          fontWeight={isGold ? 'black' : 'bold'}
                          anchorX="center"
                          anchorY="middle"
                        >
                          {digit}
                        </Text>
                      )
                    })
                  ) : (
                    <Text
                      position={[0, 0.39, 0]}
                      rotation={[-Math.PI / 2, 0, 0]}
                      fontSize={0.08}
                      color="#1e293b"
                      fontWeight="bold"
                      anchorX="center"
                      anchorY="middle"
                    >
                      {roomData?.code}
                    </Text>
                  )}
                </group>
              </>
            )}

            {/* ROOM 3: Metal Filing Cabinet and Whiteboard */}
            {room.index === 2 && (
              <>
                <group
                  position={[-2.6, 0.1, cz - 1.0]}
                  rotation={[0, Math.PI / 2, 0]}
                  onClick={(e) => {
                    e.stopPropagation()
                    onInspectNote && onInspectNote(2)
                  }}
                >
                  <mesh>
                    <boxGeometry args={[0.9, 1.8, 0.7]} />
                    <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.4} />
                  </mesh>
                  <mesh position={[0, 0.2, 0.36]}>
                    <planeGeometry args={[0.45, 0.25]} />
                    <meshStandardMaterial color="#fef08a" />
                  </mesh>
                  {roomData?.digits ? (
                    roomData.digits.map((digit, dIdx) => {
                      const isGold =
                        roomData.isGoldenRoom &&
                        dIdx === (roomData.goldDigitPos ?? roomData.goldIndex)
                      return (
                        <Text
                          key={dIdx}
                          position={[(dIdx - 1.5) * 0.08, 0.2, 0.37]}
                          fontSize={isGold ? 0.095 : 0.075}
                          color={isGold ? '#b45309' : '#1e293b'}
                          fontWeight={isGold ? 'black' : 'bold'}
                          anchorX="center"
                          anchorY="middle"
                        >
                          {digit}
                        </Text>
                      )
                    })
                  ) : (
                    <Text
                      position={[0, 0.2, 0.37]}
                      fontSize={0.08}
                      color="#1e293b"
                      fontWeight="bold"
                      anchorX="center"
                      anchorY="middle"
                    >
                      {roomData?.code}
                    </Text>
                  )}
                </group>

                <group position={[3.48, 0.9, cz + 0.5]} rotation={[0, -Math.PI / 2, 0]}>
                  <mesh>
                    <boxGeometry args={[2.2, 1.4, 0.04]} />
                    <meshStandardMaterial color="#f8fafc" roughness={0.2} />
                  </mesh>
                  <Text position={[0, 0.3, 0.03]} fontSize={0.12} color="#0f172a" fontWeight="bold">
                    [ PROJECT MEMO ]
                  </Text>
                  <Text position={[0, -0.1, 0.03]} fontSize={0.08} color="#0369a1" maxWidth={2.0}>
                    Code stored in the filing cabinet!
                  </Text>
                </group>
              </>
            )}

            {/* ROOM 4: Tech Terminal Workstation & Cargo Crates */}
            {room.index === 3 && (
              <>
                <group
                  position={[-2.4, -0.2, cz + 0.5]}
                  rotation={[0, Math.PI / 2, 0]}
                  onClick={(e) => {
                    e.stopPropagation()
                    onInspectNote && onInspectNote(3)
                  }}
                >
                  <mesh position={[0, -0.3, 0]}>
                    <boxGeometry args={[1.5, 0.7, 0.8]} />
                    <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.6} />
                  </mesh>
                  <mesh position={[0, 0.3, -0.1]}>
                    <boxGeometry args={[0.7, 0.5, 0.15]} />
                    <meshStandardMaterial color="#0f172a" />
                  </mesh>
                  <mesh position={[0, 0.3, -0.01]}>
                    <planeGeometry args={[0.62, 0.42]} />
                    <meshBasicMaterial color="#0284c7" />
                  </mesh>
                  {roomData?.digits ? (
                    roomData.digits.map((digit, dIdx) => {
                      const isGold =
                        roomData.isGoldenRoom &&
                        dIdx === (roomData.goldDigitPos ?? roomData.goldIndex)
                      return (
                        <Text
                          key={dIdx}
                          position={[(dIdx - 1.5) * 0.09, 0.3, 0.01]}
                          fontSize={isGold ? 0.11 : 0.085}
                          color={isGold ? '#fde047' : '#ffffff'}
                          fontWeight={isGold ? 'black' : 'bold'}
                          anchorX="center"
                          anchorY="middle"
                        >
                          {digit}
                        </Text>
                      )
                    })
                  ) : (
                    <Text
                      position={[0, 0.3, 0.01]}
                      fontSize={0.09}
                      color="#ffffff"
                      fontWeight="bold"
                      anchorX="center"
                      anchorY="middle"
                    >
                      {roomData?.code}
                    </Text>
                  )}
                </group>

                <group position={[2.5, -0.3, cz - 1.2]}>
                  <mesh position={[0, -0.2, 0]}>
                    <boxGeometry args={[1.1, 0.9, 1.1]} />
                    <meshStandardMaterial color="#78350f" roughness={0.9} />
                  </mesh>
                  <mesh position={[0.1, 0.6, 0.05]} rotation={[0, 0.2, 0]}>
                    <boxGeometry args={[0.85, 0.7, 0.85]} />
                    <meshStandardMaterial color="#92400e" roughness={0.9} />
                  </mesh>
                </group>
              </>
            )}

            {/* ================= ROOM 5: RIGGED SIDE CONSOLE TABLE (SOLID OBSTACLE & CLEAN WALKWAY) ================= */}
            {room.index === 4 && (
              <group
                position={[-2.4, -0.4, cz]}
                rotation={[0, Math.PI / 2, 0]}
                onClick={(e) => {
                  e.stopPropagation()
                  onInspectNote && onInspectNote(4)
                }}
              >
                {/* Modern Rigged Console Table */}
                {/* Tabletop Surface */}
                <mesh position={[0, 0.45, 0]}>
                  <boxGeometry args={[1.6, 0.08, 0.85]} />
                  <meshStandardMaterial color="#292524" roughness={0.4} metalness={0.6} />
                </mesh>

                {/* 4 Sturdy Table Legs */}
                <mesh position={[-0.7, 0.05, -0.34]}>
                  <boxGeometry args={[0.07, 0.8, 0.07]} />
                  <meshStandardMaterial color="#1c1917" metalness={0.8} />
                </mesh>
                <mesh position={[0.7, 0.05, -0.34]}>
                  <boxGeometry args={[0.07, 0.8, 0.07]} />
                  <meshStandardMaterial color="#1c1917" metalness={0.8} />
                </mesh>
                <mesh position={[-0.7, 0.05, 0.34]}>
                  <boxGeometry args={[0.07, 0.8, 0.07]} />
                  <meshStandardMaterial color="#1c1917" metalness={0.8} />
                </mesh>
                <mesh position={[0.7, 0.05, 0.34]}>
                  <boxGeometry args={[0.07, 0.8, 0.07]} />
                  <meshStandardMaterial color="#1c1917" metalness={0.8} />
                </mesh>

                {/* Status Monitor Terminal on Top of Table (Angled towards room) */}
                <group position={[0, 0.9, -0.05]} rotation={[-0.2, 0, 0]}>
                  {/* Monitor Bezel */}
                  <mesh>
                    <boxGeometry args={[1.3, 0.72, 0.05]} />
                    <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.8} />
                  </mesh>

                  {/* High-Tech Glowing Screen */}
                  <mesh position={[0, 0, 0.028]}>
                    <planeGeometry args={[1.24, 0.66]} />
                    <meshBasicMaterial color="#1e1b12" />
                  </mesh>

                  {/* Terminal Header */}
                  <Text
                    position={[0, 0.22, 0.035]}
                    fontSize={0.065}
                    fontWeight="bold"
                    color="#f59e0b"
                    anchorX="center"
                  >
                    [ MASTER CIPHER STATUS ]
                  </Text>

                  {/* Distinct Golden Keys */}
                  <Text
                    position={[0, 0.04, 0.035]}
                    fontSize={0.11}
                    fontWeight="bold"
                    color="#fde047"
                    anchorX="center"
                  >
                    {levelData.distinctGoldDigits.length === 3
                      ? `[  ${levelData.distinctGoldDigits.join('   •   ')}  ]`
                      : '[ ? , ? , ? ]'}
                  </Text>

                  {/* Instructions on screen */}
                  <Text
                    position={[0, -0.13, 0.035]}
                    fontSize={0.065}
                    fontWeight="bold"
                    color="#38bdf8"
                    anchorX="center"
                  >
                    {`VAULT CODE: [ ${levelData.chronologicalGoldCode || levelData.room5SecretCode} ]`}
                  </Text>
                  <Text
                    position={[0, -0.23, 0.035]}
                    fontSize={0.045}
                    color="#94a3b8"
                    anchorX="center"
                  >
                    Enter on Door Keypad to Unlock! [Press E]
                  </Text>
                </group>

                {/* Monitor Stand */}
                <mesh position={[0, 0.52, -0.05]}>
                  <boxGeometry args={[0.2, 0.12, 0.16]} />
                  <meshStandardMaterial color="#1c1917" metalness={0.8} />
                </mesh>

                {/* Golden Ambient Terminal Light */}
                <pointLight position={[0, 1.1, 0.3]} distance={4.0} intensity={2.2} color="#fbbf24" />
              </group>
            )}
          </group>
        )
      })}
    </group>
  )
}
