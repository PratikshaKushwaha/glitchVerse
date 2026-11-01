// Multiple dynamic Cadgy puzzle boards
// Exact Double Cadgy mechanics inspired by OneLook Cadgy:
// 5 vertical columns of 5 stacked letter tiles, selecting exactly 1 tile per column left-to-right (Col 0 -> Col 4).
// Features:
// - 3D stacked tiles with variable depth
// - Heart Wildcard tiles (isHeart: true) that match any required letter
// - Multi-letter tiles (isMulti: true, e.g., 'CI', 'EN', 'TH')
// - 100% Tech, Dev, Programming, and Computer Science Vocabulary
// - Basic Words (core software/hardware architecture concepts, 5 words)
// - Bonus Words (specialized system, compiler, networking, and graphics terms)
// - Broad dictionary validation for extra creative word finds

export const CADGY_PUZZLE_BOARDS = [
  {
    id: 'classic_way_out',
    dateLabel: 'October 23, 2026',
    title: 'Double Cadgy: The Nexus Matrix',
    subtitle: 'Inspired by OneLook Cadgy • 5 Columns • 3D Stacks • Wildcard Hearts',
    board: [
      [
        { id: 'c0-r0', char: 'S', row: 0, col: 0, depth: 6 },
        { id: 'c0-r1', char: 'B', row: 1, col: 0, depth: 5 },
        { id: 'c0-r2', char: 'L', row: 2, col: 0, depth: 4 },
        { id: 'c0-r3', char: 'P', row: 3, col: 0, depth: 5 },
        { id: 'c0-r4', char: '', row: 4, col: 0, depth: 4, isHeart: true },
      ],
      [
        { id: 'c1-r0', char: 'T', row: 0, col: 1, depth: 5 },
        { id: 'c1-r1', char: 'Y', row: 1, col: 1, depth: 4 },
        { id: 'c1-r2', char: 'O', row: 2, col: 1, depth: 6 },
        { id: 'c1-r3', char: 'A', row: 3, col: 1, depth: 7 },
        { id: 'c1-r4', char: '', row: 4, col: 1, depth: 3, isHeart: true },
      ],
      [
        { id: 'c2-r0', char: 'A', row: 0, col: 2, depth: 6 },
        { id: 'c2-r1', char: 'T', row: 1, col: 2, depth: 5 },
        { id: 'c2-r2', char: 'G', row: 2, col: 2, depth: 4 },
        { id: 'c2-r3', char: 'R', row: 3, col: 2, depth: 6 },
        { id: 'c2-r4', char: '', row: 4, col: 2, depth: 5, isHeart: true },
      ],
      [
        { id: 'c3-r0', char: 'C', row: 0, col: 3, depth: 6 },
        { id: 'c3-r1', char: 'E', row: 1, col: 3, depth: 5 },
        { id: 'c3-r2', char: 'S', row: 2, col: 3, depth: 6 },
        { id: 'c3-r3', char: 'D', row: 3, col: 3, depth: 4 },
        { id: 'c3-r4', char: '', row: 4, col: 3, depth: 4, isHeart: true },
      ],
      [
        { id: 'c4-r0', char: 'K', row: 0, col: 4, depth: 5 },
        { id: 'c4-r1', char: 'S', row: 1, col: 4, depth: 6 },
        { id: 'c4-r2', char: 'T', row: 2, col: 4, depth: 5 },
        { id: 'c4-r3', char: 'E', row: 3, col: 4, depth: 7 },
        { id: 'c4-r4', char: '', row: 4, col: 4, depth: 4, isHeart: true },
      ],
    ],
    // 100% Tech & Software Development Vocabulary
    basicWords: [
      { word: 'STACK', clue: 'LIFO memory structure managing call frames and variables' },
      { word: 'BYTES', clue: 'Standard 8-bit digital units of binary computer storage' },
      { word: 'LOGIC', clue: 'Boolean truth evaluation guiding CPU decision gates' },
      { word: 'RESET', clue: 'Command restoring system registers to initial baseline state' },
      { word: 'PATCH', clue: 'Software code update applied to fix exploits and bugs' },
    ],
    bonusWords: [
      { word: 'ARRAY', clue: 'Contiguous block of indexed memory elements' },
      { word: 'CACHE', clue: 'Ultra-fast memory buffer speeding up CPU instruction reads' },
      { word: 'CORES', clue: 'Independent processing units on modern multi-core microprocessors' },
      { word: 'DRIVE', clue: 'Non-volatile secondary storage medium or device controller' },
      { word: 'PARSE', clue: 'Lexical and syntactic analysis decomposing raw source code' },
      { word: 'PIXEL', clue: 'Individual chromatic point element on digital screens' },
      { word: 'PROXY', clue: 'Intermediary network node routing client traffic securely' },
      { word: 'REACT', clue: 'Declarative component-based UI library and framework' },
      { word: 'SHELL', clue: 'Interactive command-line interpreter for the operating system' },
    ],
    acceptedDictionary: [
      'STACK', 'BYTES', 'LOGIC', 'RESET', 'PATCH',
      'ARRAY', 'CACHE', 'CORES', 'DRIVE', 'PARSE', 'PIXEL', 'PROXY', 'REACT', 'SHELL',
      'ASCII', 'BATCH', 'BUILD', 'CRASH', 'DEBUG', 'FLASH', 'INPUT', 'LINUX', 'MACRO',
      'MODEM', 'MOUSE', 'NODE', 'PANEL', 'PIPES', 'PORTS', 'PRINT', 'QUEUE', 'ROUTER',
      'SCALE', 'SHARE', 'SHIFT', 'STATE', 'TOKEN', 'TRACE', 'USERS', 'VIRUS', 'YIELD',
    ],
  },

  {
    id: 'cyber_mainframe',
    dateLabel: 'October 24, 2026',
    title: 'Double Cadgy: Cyber Mainframe',
    subtitle: 'High-Tech Cryptographic Columns • Multi-Letter TH & ER • Wildcard Hearts',
    board: [
      [
        { id: 'c0-r0', char: 'C', row: 0, col: 0, depth: 6 },
        { id: 'c0-r1', char: 'L', row: 1, col: 0, depth: 5 },
        { id: 'c0-r2', char: 'R', row: 2, col: 0, depth: 5 },
        { id: 'c0-r3', char: 'B', row: 3, col: 0, depth: 4 },
        { id: 'c0-r4', char: '', row: 4, col: 0, depth: 4, isHeart: true },
      ],
      [
        { id: 'c1-r0', char: 'Y', row: 0, col: 1, depth: 4 },
        { id: 'c1-r1', char: 'O', row: 1, col: 1, depth: 6 },
        { id: 'c1-r2', char: 'E', row: 2, col: 1, depth: 7 },
        { id: 'c1-r3', char: 'A', row: 3, col: 1, depth: 5 },
        { id: 'c1-r4', char: '', row: 4, col: 1, depth: 4, isHeart: true },
      ],
      [
        { id: 'c2-r0', char: 'B', row: 0, col: 2, depth: 5 },
        { id: 'c2-r1', char: 'G', row: 1, col: 2, depth: 6 },
        { id: 'c2-r2', char: 'S', row: 2, col: 2, depth: 4 },
        { id: 'c2-r3', char: 'T', row: 3, col: 2, depth: 5 },
        { id: 'c2-r4', char: '', row: 4, col: 2, depth: 4, isHeart: true },
      ],
      [
        { id: 'c3-r0', char: 'E', row: 0, col: 3, depth: 6 },
        { id: 'c3-r1', char: 'I', row: 1, col: 3, depth: 6 },
        { id: 'c3-r2', char: 'E', row: 2, col: 3, depth: 7 },
        { id: 'c3-r3', char: 'C', row: 3, col: 3, depth: 4 },
        { id: 'c3-r4', char: '', row: 4, col: 3, depth: 4, isHeart: true },
      ],
      [
        { id: 'c4-r0', char: 'R', row: 0, col: 4, depth: 6 },
        { id: 'c4-r1', char: 'C', row: 1, col: 4, depth: 4 },
        { id: 'c4-r2', char: 'T', row: 2, col: 4, depth: 5 },
        { id: 'c4-r3', char: 'S', row: 3, col: 4, depth: 5 },
        { id: 'c4-r4', char: '', row: 4, col: 4, depth: 4, isHeart: true },
      ],
    ],
    basicWords: [
      { word: 'CYBER', clue: 'Relating to electronic computers and virtual networks' },
      { word: 'LOGIC', clue: 'Reasoning conducted according to strict formal principles' },
      { word: 'RESET', clue: 'Restore a computing device to its baseline starting state' },
      { word: 'CORES', clue: 'Central or innermost processing microarchitectures' },
      { word: 'BYTES', clue: 'Digital units of information typically consisting of 8 bits' },
    ],
    bonusWords: [
      { word: 'BATCH', clue: 'A grouped quantity of data records executed as one entity' },
      { word: 'CACHE', clue: 'High-speed auxiliary hardware memory buffer' },
      { word: 'ETHER', clue: 'Physical Ethernet layer or digital cryptocurrency network' },
      { word: 'ROBOT', clue: 'Autonomous programmable electromechanical agent' },
      { word: 'ROTOR', clue: 'Rotary spinning armature or component in cooling fans' },
    ],
    acceptedDictionary: [
      'CYBER', 'LOGIC', 'RESET', 'CORES', 'BYTES',
      'BATCH', 'CACHE', 'ETHER', 'ROBOT', 'ROTOR',
      'BITES', 'BOOTS', 'CARTS', 'CHATS', 'COAST', 'CRATE', 'CREST', 'LASER', 'LATER',
      'LIGHT', 'OCTET', 'RELAY', 'ROBER', 'RATES', 'ROOTS', 'REACT', 'SECTOR', 'STATE',
    ],
  },

  {
    id: 'quantum_glitch',
    dateLabel: 'October 25, 2026',
    title: 'Double Cadgy: Quantum Anomaly',
    subtitle: 'Fractured Syntax • Multi-Letter CH & ST • Wildcard Hearts',
    board: [
      [
        { id: 'c0-r0', char: 'P', row: 0, col: 0, depth: 5 },
        { id: 'c0-r1', char: 'S', row: 1, col: 0, depth: 6 },
        { id: 'c0-r2', char: 'F', row: 2, col: 0, depth: 4 },
        { id: 'c0-r3', char: 'Q', row: 3, col: 0, depth: 3 },
        { id: 'c0-r4', char: '', row: 4, col: 0, depth: 4, isHeart: true },
      ],
      [
        { id: 'c1-r0', char: 'I', row: 0, col: 1, depth: 5 },
        { id: 'c1-r1', char: 'H', row: 1, col: 1, depth: 4 },
        { id: 'c1-r2', char: 'L', row: 2, col: 1, depth: 6 },
        { id: 'c1-r3', char: 'U', row: 3, col: 1, depth: 5 },
        { id: 'c1-r4', char: 'CH', row: 4, col: 1, depth: 4, isMulti: true },
      ],
      [
        { id: 'c2-r0', char: 'X', row: 0, col: 2, depth: 3 },
        { id: 'c2-r1', char: 'I', row: 1, col: 2, depth: 6 },
        { id: 'c2-r2', char: 'A', row: 2, col: 2, depth: 6 },
        { id: 'c2-r3', char: 'R', row: 3, col: 2, depth: 5 },
        { id: 'c2-r4', char: '', row: 4, col: 2, depth: 4, isHeart: true },
      ],
      [
        { id: 'c3-r0', char: 'E', row: 0, col: 3, depth: 6 },
        { id: 'c3-r1', char: 'F', row: 1, col: 3, depth: 4 },
        { id: 'c3-r2', char: 'S', row: 2, col: 3, depth: 6 },
        { id: 'c3-r3', char: 'K', row: 3, col: 3, depth: 4 },
        { id: 'c3-r4', char: '', row: 4, col: 3, depth: 4, isHeart: true },
      ],
      [
        { id: 'c4-r0', char: 'L', row: 0, col: 4, depth: 5 },
        { id: 'c4-r1', char: 'T', row: 1, col: 4, depth: 6 },
        { id: 'c4-r2', char: 'H', row: 2, col: 4, depth: 5 },
        { id: 'c4-r3', char: 'E', row: 3, col: 4, depth: 6 },
        { id: 'c4-r4', char: '', row: 4, col: 4, depth: 4, isHeart: true },
      ],
    ],
    basicWords: [
      { word: 'PIXEL', clue: 'Minute area of illumination on a digital display raster' },
      { word: 'SHIFT', clue: 'Bit manipulation operation moving binary values within a register' },
      { word: 'FLASH', clue: 'Non-volatile semiconductor storage holding firmware' },
      { word: 'CRASH', clue: 'Catastrophic software crash or unhandled fatal kernel exception' },
      { word: 'QUARK', clue: 'Fundamental component of computational particle simulations' },
    ],
    bonusWords: [
      { word: 'FRAME', clue: 'Single discrete render pass produced by graphics engine pipeline' },
      { word: 'FAULT', clue: 'Hardware interrupt raised upon invalid virtual memory page access' },
      { word: 'FIBER', clue: 'High-speed optical data communication medium' },
      { word: 'FLOAT', clue: 'IEEE-754 standard single-precision floating point number' },
      { word: 'FLUTE', clue: 'Acoustic waveform model in digital audio synthesis' },
      { word: 'SLASH', clue: 'Root directory delimiter in Unix filesystems' },
    ],
    acceptedDictionary: [
      'PIXEL', 'SHIFT', 'FLASH', 'CRASH', 'QUARK',
      'FRAME', 'FAULT', 'FIBER', 'FLOAT', 'FLUTE', 'SLASH',
      'SHARE', 'SHIRT', 'SHINE', 'SHACK', 'SCALE', 'SLATE', 'SLICK', 'SLACK', 'PLATE',
      'PHASE', 'PLAZA', 'PULSE', 'PILOT', 'FLAME',
    ],
  },
]
