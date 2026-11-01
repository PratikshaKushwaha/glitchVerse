import * as THREE from 'three'
import { Text } from '@react-three/drei'
import RoomDoor from './RoomDoor'

export default function FiveRoomsInterior({
  levelData,
  doorsOpen,
  onInteractKeypad,
  onInspectNote,
  onOpenSpot,
  spotStages = {},
}) {
  // Open stage of a hidden container: 0 = closed, 1.. = partially/fully opened
  const stageOf = (id) => spotStages[id] || 0

  const openSpot = (id) => (e) => {
    e.stopPropagation()
    onOpenSpot && onOpenSpot(id)
  }

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

            {/* ROOM 1: Round table with hidden drawer and Yellow Company Billboard */}
            {room.index === 0 && (
              <>
                <group position={[-2.2, -0.5, cz - 1.2]}>
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
                </group>

                {/* Chair with a note tucked under the seat (spot-0-0) */}
                <group position={[-1.2, -1.0, cz - 0.6]} onClick={openSpot('spot-0-0')}>
                  <ChairWithNote open={stageOf('spot-0-0') >= 1} />
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

            {/* ROOM 2: Tall Bookshelf and Study Desk */}
            {room.index === 1 && (
              <>
                <group
                  position={[2.4, -0.4, cz + 0.8]}
                  rotation={[0, -Math.PI / 2, 0]}
                >
                  <mesh position={[0, 0, 0]} castShadow>
                    <boxGeometry args={[1.6, 0.75, 0.8]} />
                    <meshStandardMaterial color="#78350f" roughness={0.7} />
                  </mesh>
                </group>

                {/* Sofa with a note slipped under the cushion (spot-1-0) */}
                <group position={[0.9, -1.0, cz + 2.2]} onClick={openSpot('spot-1-0')}>
                  <SofaCushion open={stageOf('spot-1-0') >= 1} />
                </group>

                {/* Tall Wooden Cupboard against the left wall (spot-1-1, 2 stages) */}
                <group position={[-3.15, -1.0, cz - 2.6]} rotation={[0, Math.PI / 2, 0]} onClick={openSpot('spot-1-1')}>
                  <WoodenCupboard
                    open={stageOf('spot-1-1') >= 2}
                    semiOpen={stageOf('spot-1-1') === 1}
                  />
                </group>

                {/* Bookshelf (plain furniture — the hiding spot moved to the cupboard) */}
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
              </>
            )}

            {/* ROOM 3: Metal Filing Cabinet, Hidden Boxes and Whiteboard */}
            {room.index === 2 && (
              <>
                {/* Filing Cabinet with searchable top drawer (spot-2-0) */}
                <group
                  position={[-2.6, 0.1, cz - 1.0]}
                  rotation={[0, Math.PI / 2, 0]}
                >
                  <mesh>
                    <boxGeometry args={[0.9, 1.8, 0.7]} />
                    <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.4} />
                  </mesh>
                  {/* Cabinet face grooves */}
                  {[-0.2, 0.45, 0.1].map((y, i) => (
                    <mesh key={i} position={[0, y, 0.37]}>
                      <boxGeometry args={[0.8, 0.02, 0.02]} />
                      <meshStandardMaterial color="#334155" metalness={0.4} />
                    </mesh>
                  ))}
                </group>

                {/* Crooked painting hiding a note behind it (spot-2-0) */}
                <group
                  position={[-3.44, 1.3, cz + 0.5]}
                  rotation={[0, Math.PI / 2, 0]}
                  onClick={openSpot('spot-2-0')}
                >
                  <WallPainting open={stageOf('spot-2-0') >= 1} />
                </group>

                {/* Records Box under the whiteboard (spot-2-1, decoy-or-real) */}
                <group position={[-1.7, -1.0, cz - 2.4]} onClick={openSpot('spot-2-1')}>
                  <RecordsBox
                    open={stageOf('spot-2-1') >= 1}
                    semiOpen={false}
                  />
                </group>

                {/* Latched Toolbox by the rack (spot-2-2, 2 stages) */}
                <group position={[1.6, -1.0, cz + 0.6]} rotation={[0, -0.4, 0]} onClick={openSpot('spot-2-2')}>
                  <LatchedContainer
                    open={stageOf('spot-2-2') >= 2}
                    semiOpen={stageOf('spot-2-2') === 1}
                    size={0.55}
                    bodyColor="#9a3412"
                  />
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
                    Paper hides in drawers... or is it in a box?
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
                  {/* Terminal Desk Drawer (spot-3-0) */}
                  <group
                    position={[0, -0.52, 0.48]}
                    onClick={openSpot('spot-3-0')}
                  >
                    <SlidingDrawer open={stageOf('spot-3-0') >= 1} wood="#334155" />
                  </group>
                </group>

                {/* Cargo Crate with Latch (spot-3-1, 2 stages) */}
                <group position={[2.5, -1.0, cz - 1.2]} onClick={openSpot('spot-3-1')}>
                  <LatchedContainer
                    open={stageOf('spot-3-1') >= 2}
                    semiOpen={stageOf('spot-3-1') === 1}
                    size={0.9}
                    bodyColor="#78350f"
                  />
                </group>

                {/* Tech Locker by the right wall (spot-3-2) */}
                <group position={[3.0, -1.0, cz - 2.0]} rotation={[0, -Math.PI / 2, 0]} onClick={openSpot('spot-3-2')}>
                  <TechLocker
                    open={stageOf('spot-3-2') >= 1}
                    semiOpen={false}
                  />
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

/* ======================================================================
   HIDDEN CONTAINER COMPONENTS
   Solid meshes the player can search (E or click). `open` = note revealed,
   `semiOpen` = container is only halfway opened (staged difficulty).
   ====================================================================== */

// Generic sliding drawer that sticks out of furniture when opened
function SlidingDrawer({ open, semiOpen, wood = '#a97034' }) {
  const slide = open ? 0.38 : semiOpen ? 0.18 : 0
  return (
    <group>
      {/* Drawer face + slid-out body */}
      <group position={[0, 0, slide]}>
        <mesh castShadow>
          <boxGeometry args={[0.62, 0.2, 0.3]} />
          <meshStandardMaterial color={wood} roughness={0.65} />
        </mesh>
        {/* Interest hint: inside paper visible when opened */}
        {(open || semiOpen) && (
          <mesh position={[0, 0.02, 0.1]} rotation={[-Math.PI / 2, 0, 0.08]}>
            <planeGeometry args={[0.3, 0.18]} />
            <meshStandardMaterial
              color="#fefce8"
              emissive={open ? '#f5e6a8' : '#000000'}
              emissiveIntensity={open ? 0.45 : 0}
              roughness={0.9}
            />
          </mesh>
        )}
      </group>
      {/* Front face of the drawer */}
      <mesh position={[0, 0, 0.16 + slide]}>
        <boxGeometry args={[0.66, 0.24, 0.05]} />
        <meshStandardMaterial color={wood} roughness={0.6} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0, 0.19 + slide]}>
        <boxGeometry args={[0.18, 0.045, 0.02]} />
        <meshStandardMaterial color="#4a3524" metalness={0.55} roughness={0.35} />
      </mesh>
    </group>
  )
}

// Chair with a note tucked under the seat; the note slides out when searched
function ChairWithNote({ open }) {
  return (
    <group>
      {/* Seat + backrest */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.52, 0.06, 0.52]} />
        <meshStandardMaterial color="#8c5326" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.85, 0.23]} castShadow>
        <boxGeometry args={[0.52, 0.8, 0.06]} />
        <meshStandardMaterial color="#8c5326" roughness={0.75} />
      </mesh>
      {/* Legs */}
      {[
        [-0.21, -0.21],
        [0.21, -0.21],
        [-0.21, 0.21],
        [0.21, 0.21],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.21, lz]}>
          <cylinderGeometry args={[0.03, 0.03, 0.42, 12]} />
          <meshStandardMaterial color="#6b3f1d" roughness={0.8} />
        </mesh>
      ))}
      {/* Note under the seat — slides towards the player when found */}
      <group position={[0, 0.3, open ? 0.45 : 0.05]}>
        <mesh rotation={[-Math.PI / 2, 0, 0.1]}>
          <planeGeometry args={[0.22, 0.3]} />
          <meshStandardMaterial
            color={open ? '#fde047' : '#cbd5e1'}
            emissive={open ? '#facc15' : '#000000'}
            emissiveIntensity={open ? 0.55 : 0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  )
}

// Sofa: cushion lifts to reveal a note on the seat when searched
function SofaCushion({ open }) {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.44, 0.8]} />
        <meshStandardMaterial color="#0f766e" roughness={0.85} />
      </mesh>
      {/* Backrest against the back */}
      <mesh position={[0, 0.75, -0.28]} castShadow>
        <boxGeometry args={[1.9, 0.7, 0.22]} />
        <meshStandardMaterial color="#115e59" roughness={0.85} />
      </mesh>
      {/* Armrests */}
      {[-0.83, 0.83].map((lx, i) => (
        <mesh key={i} position={[lx, 0.5, 0]} castShadow>
          <boxGeometry args={[0.24, 0.56, 0.8]} />
          <meshStandardMaterial color="#134e4a" roughness={0.85} />
        </mesh>
      ))}
      {/* Seat cushion — lifts up when searched */}
      <group position={[0, 0, 0]} rotation={[-(open ? 0.6 : 0), 0, 0]}>
        <mesh position={[0, 0.49, 0.02]} castShadow>
          <boxGeometry args={[1.4, 0.14, 0.68]} />
          <meshStandardMaterial color="#14b8a6" roughness={0.8} />
        </mesh>
      </group>
      {/* Note under the cushion, revealed when open */}
      {open && (
        <mesh position={[0.1, 0.46, 0.05]} rotation={[-Math.PI / 2, 0, 0.12]}>
          <planeGeometry args={[0.26, 0.19]} />
          <meshStandardMaterial color="#fefce8" emissive="#5eead4" emissiveIntensity={0.45} />
        </mesh>
      )}
    </group>
  )
}

// Two-door cupboard: left door ajar at stage 1, both doors open at stage 2
function WoodenCupboard({ open, semiOpen }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 2.1, 0.55]} />
        <meshStandardMaterial color="#7c4a21" roughness={0.7} />
      </mesh>
      {/* Left door (hinged on the left edge) */}
      <group position={[-0.55, 1.05, 0.28]} rotation={[0, semiOpen || open ? 1.05 : 0, 0]}>
        <mesh position={[0.27, 0, 0]}>
          <boxGeometry args={[0.53, 1.98, 0.04]} />
          <meshStandardMaterial color="#92400e" roughness={0.6} />
        </mesh>
      </group>
      {/* Right door */}
      <group position={[0.55, 1.05, 0.28]} rotation={[0, open ? -1.05 : 0, 0]}>
        <mesh position={[-0.27, 0, 0]}>
          <boxGeometry args={[0.53, 1.98, 0.04]} />
          <meshStandardMaterial color="#92400e" roughness={0.6} />
        </mesh>
      </group>
      {/* Handles */}
      {[-0.03, 0.03].map((lx, i) => (
        <mesh key={i} position={[lx, 1.05, 0.33]}>
          <boxGeometry args={[0.03, 0.16, 0.03]} />
          <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* Note on the inner shelf, revealed when both doors open */}
      {open && (
        <mesh position={[0, 1.0, 0.1]} rotation={[-Math.PI / 2, 0, 0.08]}>
          <planeGeometry args={[0.26, 0.18]} />
          <meshStandardMaterial color="#fefce8" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}

// Wall painting on a hinge: swings out to reveal a note stuck behind it
function WallPainting({ open }) {
  return (
    <group>
      {/* Canvas on a hinge along its left edge; swings out when searched */}
      <group position={[-0.45, 0, 0]} rotation={[0, open ? -1.0 : -0.06, 0]}>
        <mesh position={[0.45, 0, 0]} castShadow>
          <boxGeometry args={[0.9, 0.7, 0.05]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>
        <mesh position={[0.45, 0, 0.032]}>
          <planeGeometry args={[0.74, 0.56]} />
          <meshStandardMaterial color="#7dd3fc" roughness={0.4} />
        </mesh>
        <Text position={[0.45, 0, 0.04]} fontSize={0.1} color="#0f172a">
          SUNSET
        </Text>
      </group>
      {/* Note behind the painting, revealed when it swings open */}
      {open && (
        <mesh position={[0.05, -0.05, 0.03]} rotation={[0, -0.15, 0]}>
          <planeGeometry args={[0.24, 0.17]} />
          <meshStandardMaterial color="#fefce8" emissive="#f5e6a8" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}

// Sturdier latched container (toolbox / crate): lid tilts open over stages
function LatchedContainer({ open, semiOpen, size = 0.6, bodyColor = '#b45309' }) {
  const lidAngle = open ? -0.95 : semiOpen ? -0.35 : 0
  return (
    <group>
      {/* Body on floor */}
      <mesh position={[0, size / 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[size, size / 2, size]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.35} />
      </mesh>
      {/* Slanted lid */}
      <group position={[0, size / 2, -size / 2]} rotation={[lidAngle, 0, 0]}>
        <mesh>
          <boxGeometry args={[size * 1.04, 0.07, size * 1.04]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} metalness={0.35} />
        </mesh>
      </group>
      {/* Latch */}
      <mesh position={[0, size / 2, size / 2 + 0.01]}>
        <boxGeometry args={[0.1, 0.12, 0.03]} />
        <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Paper visible inside when opened */}
      {open && (
        <mesh position={[0, size / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0.15]}>
          <planeGeometry args={[0.28, 0.2]} />
          <meshStandardMaterial color="#fefce8" emissive="#f5e6a8" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}

// Tech locker: door slides sideways ajar with a blue glow when opened
function TechLocker({ open, semiOpen }) {
  const slide = open ? -0.5 : semiOpen ? -0.22 : 0
  return (
    <group>
      {/* Locker body against the wall */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.75, 2.0, 0.55]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Sliding door */}
      <group position={[slide, 0, 0]}>
        <mesh position={[0, 1.0, 0.29]}>
          <boxGeometry args={[0.68, 1.84, 0.04]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Handle + glow seam */}
        <mesh position={[open || semiOpen ? 0.24 : -0.28, 1.0, 0.33]}>
          <boxGeometry args={[0.06, 0.2, 0.03]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
        </mesh>
      </group>
      {/* Note shelf inside, visible when opened */}
      {open && (
        <mesh position={[0.1, 1.0, 0.15]} rotation={[-Math.PI / 2, 0, 0.1]}>
          <planeGeometry args={[0.26, 0.18]} />
          <meshStandardMaterial color="#fefce8" emissive="#7dd3fc" emissiveIntensity={0.35} />
        </mesh>
      )}
    </group>
  )
}

// Records box: small box on floor, lid lifts slightly over stages
function RecordsBox({ open, semiOpen }) {
  return (
    <group>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.34, 0.42]} />
        <meshStandardMaterial color="#57534e" roughness={0.75} />
      </mesh>
      <group position={[0, 0.35, 0]} rotation={[-(open ? 0.7 : semiOpen ? 0.3 : 0), 0, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 0.06, 0.46]} />
          <meshStandardMaterial color="#292524" roughness={0.6} />
        </mesh>
      </group>
      {open && (
        <mesh position={[0, 0.36, 0.05]} rotation={[-Math.PI / 2, 0, 0.1]}>
          <planeGeometry args={[0.24, 0.17]} />
          <meshStandardMaterial color="#fefce8" emissive="#f5e6a8" emissiveIntensity={0.4} />
        </mesh>
      )}
    </group>
  )
}
