// Rich collection of Word Search & Crossword Themes with varied words
export const WORD_THEMES = [
  {
    id: 'cyber',
    name: 'Cyber & Mainframe',
    difficulty: 'Medium',
    words: [
      'FIREWALL',
      'KERNEL',
      'QUANTUM',
      'GLITCH',
      'CIRCUIT',
      'SERVER',
      'MEMORY',
      'SOCKET',
      'SYNTAX',
      'BINARY',
      'CIPHER',
      'MATRIX',
      'PACKET',
      'ROUTER',
    ],
  },
  {
    id: 'escape',
    name: 'Escape & Chamber',
    difficulty: 'Medium',
    words: [
      'LABYRINTH',
      'KEYPAD',
      'CHAMBER',
      'PORTAL',
      'VAULT',
      'COMPASS',
      'SECRET',
      'LANTERN',
      'PUZZLE',
      'CORRIDOR',
      'ARTIFACT',
      'SHADOW',
      'LOCKPICK',
      'PASSCODE',
    ],
  },
  {
    id: 'cosmos',
    name: 'Cosmos & Dimensions',
    difficulty: 'Hard',
    words: [
      'STELLAR',
      'GRAVITY',
      'ECLIPSE',
      'HORIZON',
      'ANOMALY',
      'NEBULA',
      'VORTEX',
      'PULSAR',
      'PARADOX',
      'INFINITY',
      'SPECTRUM',
      'ORBITAL',
      'PLANET',
      'SUPERNOVA',
    ],
  },
  {
    id: 'crypto',
    name: 'Cryptography & Ciphers',
    difficulty: 'Medium',
    words: [
      'DECRYPT',
      'PASSPHRASE',
      'SIGNATURE',
      'ALGORITHM',
      'TOKEN',
      'HASHING',
      'ENTROPY',
      'KEYSTONE',
      'PROTOCOL',
      'OBSCURE',
      'SECURITY',
      'DIGITAL',
      'CIPHERTEXT',
    ],
  },
  {
    id: 'neural',
    name: 'AI & Neural Logic',
    difficulty: 'Hard',
    words: [
      'SYNAPSE',
      'WEIGHTS',
      'DATASET',
      'LATENT',
      'TENSOR',
      'TRAINING',
      'AUTOMATA',
      'GRADIENT',
      'LOGIC',
      'NETWORK',
      'VECTOR',
      'AGENT',
      'MODEL',
      'INFERENCE',
    ],
  },
  {
    id: 'alchemy',
    name: 'Alchemy & Elements',
    difficulty: 'Medium',
    words: [
      'MERCURY',
      'CHRONOS',
      'ELIXIR',
      'CRYSTAL',
      'TRANSMUTE',
      'AURORA',
      'PHOENIX',
      'CATALYST',
      'ARCANE',
      'ESSENCE',
      'PRISM',
      'AETHER',
    ],
  },
]

export const GRID_SIZE = 12

// Proper Crossword & Word Search Generator with letter intersection & 8 directional constraints
export function generateThemedWordSearch(themeId = null) {
  let themeObj = null
  if (themeId) {
    themeObj = WORD_THEMES.find((t) => t.id === themeId)
  }
  if (!themeObj) {
    themeObj = WORD_THEMES[Math.floor(Math.random() * WORD_THEMES.length)]
  }

  // Shuffle word pool and take 8 to 10 words
  const wordsPool = [...themeObj.words].sort(() => Math.random() - 0.5)
  const candidateWords = wordsPool.slice(0, 10)

  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''))
  const placedWords = []

  // 8 Allowed Directions:
  // Horizontal (left->right, right->left),
  // Vertical (top->down, bottom->up),
  // Diagonal (down-right, down-left, up-right, up-left)
  const directions = [
    { dx: 1, dy: 0, name: 'Horizontal Right' },
    { dx: -1, dy: 0, name: 'Horizontal Left' },
    { dx: 0, dy: 1, name: 'Vertical Down' },
    { dx: 0, dy: -1, name: 'Vertical Up' },
    { dx: 1, dy: 1, name: 'Diagonal Down-Right' },
    { dx: -1, dy: 1, name: 'Diagonal Down-Left' },
    { dx: 1, dy: -1, name: 'Diagonal Up-Right' },
    { dx: -1, dy: -1, name: 'Diagonal Up-Left' },
  ]

  for (const word of candidateWords) {
    let placed = false
    let attempts = 0

    // Try placing the word, prioritizing intersections where possible
    while (!placed && attempts < 250) {
      attempts++
      const dir = directions[Math.floor(Math.random() * directions.length)]
      const { dx, dy } = dir

      const startX = Math.floor(Math.random() * GRID_SIZE)
      const startY = Math.floor(Math.random() * GRID_SIZE)

      const endX = startX + dx * (word.length - 1)
      const endY = startY + dy * (word.length - 1)

      if (endX >= 0 && endX < GRID_SIZE && endY >= 0 && endY < GRID_SIZE) {
        let canPlace = true
        let overlaps = 0

        for (let i = 0; i < word.length; i++) {
          const cx = startX + dx * i
          const cy = startY + dy * i
          const currentCell = grid[cy][cx]

          if (currentCell !== '') {
            if (currentCell === word[i]) {
              overlaps++ // True crossword intersection!
            } else {
              canPlace = false
              break
            }
          }
        }

        if (canPlace) {
          const cells = []
          for (let i = 0; i < word.length; i++) {
            const cx = startX + dx * i
            const cy = startY + dy * i
            grid[cy][cx] = word[i]
            cells.push(`${cx}-${cy}`)
          }

          placedWords.push({
            word,
            cells,
            startX,
            startY,
            endX,
            endY,
            direction: dir.name,
            overlaps,
          })
          placed = true
        }
      }
    }
  }

  // Fill remaining empty cells with random letters
  const frequencyLetters = 'EEEEAAAIIIOOONNNRRRTTTLLSSSSUDDGGBBCCMMPPFFHHVVWWYYKKJJXXZZ'
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === '') {
        grid[y][x] = frequencyLetters[Math.floor(Math.random() * frequencyLetters.length)]
      }
    }
  }

  return {
    theme: themeObj,
    grid,
    placedWords,
  }
}
