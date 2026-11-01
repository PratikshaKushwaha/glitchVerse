// Level 1: 5-Room Escape Room State Generator and Manager

export function generateLevel1Data() {
  // 1. Pick 3 distinct rooms out of 0, 1, 2, 3 (Rooms 1 to 4)
  const roomIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5)
  const goldenRoomIndices = roomIndices.slice(0, 3).sort((a, b) => a - b)

  // 2. Choose 3 distinct golden digits (e.g., between 1 and 9)
  const possibleDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
  const distinctGoldDigits = possibleDigits.slice(0, 3)

  const rooms = []
  let goldDigitIndex = 0

  for (let i = 0; i < 4; i++) {
    const isGoldenRoom = goldenRoomIndices.includes(i)
    let goldDigit = null
    let goldDigitPos = -1

    if (isGoldenRoom) {
      goldDigit = distinctGoldDigits[goldDigitIndex]
      goldDigitPos = Math.floor(Math.random() * 4)
      goldDigitIndex++
    }

    // Generate 4-digit code
    const digits = []
    for (let d = 0; d < 4; d++) {
      if (d === goldDigitPos && goldDigit !== null) {
        digits.push(goldDigit)
      } else {
        // Random digit 1-9 (distinct from gold digit)
        let rnd = Math.floor(1 + Math.random() * 9)
        if (goldDigit !== null && rnd === goldDigit) {
          rnd = (rnd % 9) + 1
        }
        digits.push(rnd)
      }
    }

    rooms.push({
      roomNumber: i + 1,
      code: digits.join(''),
      digits,
      goldDigit,
      goldDigitPos,
      goldIndex: goldDigitPos, // Ensure both property names work reliably!
      isGoldenRoom,
    })
  }

  // 3. For Room 5:
  // Chronological order of discovery (Room A -> Room B -> Room C)
  const chronologicalGoldCode = distinctGoldDigits.join('')

  // Compute all 6 valid permutations (3! = 6)
  const [a, b, c] = distinctGoldDigits
  const allPermutations = [
    `${a}${b}${c}`,
    `${a}${c}${b}`,
    `${b}${a}${c}`,
    `${b}${c}${a}`,
    `${c}${a}${b}`,
    `${c}${b}${a}`,
  ]

  // Pick a secret permutation
  const shuffledGolden = [...distinctGoldDigits].sort(() => Math.random() - 0.5)
  const room5SecretCode = shuffledGolden.join('')

  // Acceptable codes for Room 5:
  // Accepts both the chronological discovery order AND the secret permutation!
  const acceptedRoom5Codes = Array.from(
    new Set([chronologicalGoldCode, room5SecretCode])
  )

  // Also include Room 5 entry in rooms array for inspection modals
  rooms.push({
    roomNumber: 5,
    code: chronologicalGoldCode, // Primary target code
    secretCode: room5SecretCode,
    digits: distinctGoldDigits,
    goldDigit: null,
    goldDigitPos: -1,
    goldIndex: -1,
    isGoldenRoom: true,
    isRoom5: true,
  })

  // 4. Hiding spots: codes are hidden in interactive containers (drawers,
  //    cupboards, crates...). Search effort scales with the room number:
  //    Room 1 = 1 obvious container, Room 4 = 3 containers with 2 decoys.
  //    Which container holds the real code is re-randomized every run.
  const hidingSpots = generateHidingSpots(rooms)

  return {
    rooms,
    hidingSpots,
    goldenRoomIndices,
    distinctGoldDigits,
    chronologicalGoldCode,
    room5SecretCode,
    acceptedRoom5Codes,
    allPermutations,
  }
}

// Decoy note labels: they hint that the scrap found is NOT this room's code
// so the player keeps searching without falsely believing they have found it.
const DECOY_LABELS = [
  'Wrinkled Maintenance Memo',
  'Old Inventory Sheet',
  'Torn Scrap of Paper',
  'Faded Shipping Manifest',
  'Scribbled Grocery List',
]

// Blueprint: container variety & count per room (index 0 = Room 1).
// `stages` = number of E presses needed before the note is revealed.
// `pos` = [x, dz] relative to the room's centre so the 3D scene and the
// interaction controller never drift apart (room centres: ROOM_CENTER_Z).
export const ROOM_CENTER_Z = [0, -7.0, -14.0, -21.0, -28.0]

const SPOT_BLUEPRINTS = [
  // Room 1 (index 0): note tucked under a chair — tutorial-level search
  [{ container: 'underchair', name: 'Note Under the Chair', stages: 1, pos: [-1.2, -0.6] }],
  // Room 2 (index 1): sofa cushion + tall cupboard with a two-stage open
  [
    { container: 'sofa', name: 'Sofa Cushion', stages: 1, pos: [0.9, 2.2] },
    { container: 'cupboard', name: 'Tall Wooden Cupboard', stages: 2, pos: [-2.6, -2.3] },
  ],
  // Room 3 (index 2): crooked wall painting + records box + latched toolbox
  [
    { container: 'painting', name: 'Crooked Wall Painting', stages: 1, pos: [-3.0, 0.5] },
    { container: 'floorbox', name: 'Records Box Under Whiteboard', stages: 1, pos: [-1.7, -2.4] },
    { container: 'toolbox', name: 'Toolbox by the Rack', stages: 2, pos: [1.6, 0.6] },
  ],
  // Room 4 (index 3): desk drawer, latched crate and tech locker
  [
    { container: 'drawer', name: 'Terminal Desk Drawer', stages: 1, pos: [-2.4, 0.5] },
    { container: 'crate', name: 'Cargo Crate with Latch', stages: 2, pos: [2.5, -1.2] },
    { container: 'locker', name: 'Tech Locker', stages: 1, pos: [3.0, -2.0] },
  ],
]

function generateHidingSpots(rooms) {
  return SPOT_BLUEPRINTS.map((blueprint, roomIndex) => {
    const realCode = rooms[roomIndex].code
    const realSpotIndex = Math.floor(Math.random() * blueprint.length)
    const spots = blueprint.map((entry, spotIndex) => {
      const isReal = spotIndex === realSpotIndex
      return {
        id: `spot-${roomIndex}-${spotIndex}`,
        container: entry.container,
        name: entry.name,
        stages: entry.stages,
        pos: entry.pos, // absolute world position is derived in RoomController
        isReal,
        code: isReal ? realCode : generateDecoyCode(realCode),
        ...(isReal ? {} : { decoyLabel: DECOY_LABELS[Math.floor(Math.random() * DECOY_LABELS.length)] }),
      }
    })
    return { roomIndex, spots }
  })
}

function generateDecoyCode(realCode) {
  let code = realCode.split('').sort(() => Math.random() - 0.5).join('')
  while (code === realCode) {
    code = code
      .split('')
      .map(() => String(Math.floor(1 + Math.random() * 9)))
      .join('')
  }
  return code
}
