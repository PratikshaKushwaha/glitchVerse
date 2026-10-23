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
        // Random digit 1-9
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
      isGoldenRoom,
    })
  }

  // 3. For Room 5: Pick a secret permutation of the 3 golden digits
  // Permutations of 3 elements = 3! = 6 possible combinations
  const shuffledGolden = [...distinctGoldDigits].sort(() => Math.random() - 0.5)
  const room5SecretCode = shuffledGolden.join('')

  // Also include Room 5 entry in rooms array for inspection modals
  rooms.push({
    roomNumber: 5,
    code: room5SecretCode,
    digits: distinctGoldDigits,
    goldDigit: null,
    goldDigitPos: -1,
    isGoldenRoom: true,
    isRoom5: true,
  })

  // Compute all 6 valid permutations for reference/hint
  const [a, b, c] = distinctGoldDigits
  const allPermutations = [
    `${a}${b}${c}`,
    `${a}${c}${b}`,
    `${b}${a}${c}`,
    `${b}${c}${a}`,
    `${c}${a}${b}`,
    `${c}${b}${a}`,
  ]

  return {
    rooms,
    goldenRoomIndices,
    distinctGoldDigits,
    room5SecretCode,
    allPermutations,
  }
}
