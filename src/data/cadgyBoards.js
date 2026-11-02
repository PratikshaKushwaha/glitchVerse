// Multiple dynamic Cadgy puzzle boards
// Exact Double Cadgy mechanics inspired by OneLook Cadgy:
// 5 vertical columns of 5 stacked letter tiles, selecting exactly 1 tile per column left-to-right (Col 0 -> Col 4).
// Hardened features:
// - 100% Real letter tiles in all stacks (No free wildcards)
// - Obfuscated cryptographic and compiler diagnostics clues
// - 100% Tech, Dev, Systems, and Computer Science Vocabulary
// - Basic Words (5 core software/hardware architecture concepts)
// - Bonus Words (specialized system, compiler, networking, and graphics terms)
// - Hardened Clear condition: Solve all 5 Basic Words + at least 2 Bonus Words

export const CADGY_PUZZLE_BOARDS = [
  {
    id: 'classic_way_out',
    dateLabel: 'October 23, 2026',
    title: 'Double Cadgy: The Nexus Matrix',
    subtitle: 'Hardened Edition • Pure Column Stacks • Strict Decryption',
    board: [
      [
        { id: 'c0-r0', char: 'S', row: 0, col: 0, depth: 6 },
        { id: 'c0-r1', char: 'B', row: 1, col: 0, depth: 5 },
        { id: 'c0-r2', char: 'L', row: 2, col: 0, depth: 4 },
        { id: 'c0-r3', char: 'R', row: 3, col: 0, depth: 5 },
        { id: 'c0-r4', char: 'P', row: 4, col: 0, depth: 4 },
      ],
      [
        { id: 'c1-r0', char: 'T', row: 0, col: 1, depth: 5 },
        { id: 'c1-r1', char: 'Y', row: 1, col: 1, depth: 4 },
        { id: 'c1-r2', char: 'O', row: 2, col: 1, depth: 6 },
        { id: 'c1-r3', char: 'E', row: 3, col: 1, depth: 5 },
        { id: 'c1-r4', char: 'A', row: 4, col: 1, depth: 4 },
      ],
      [
        { id: 'c2-r0', char: 'A', row: 0, col: 2, depth: 6 },
        { id: 'c2-r1', char: 'T', row: 1, col: 2, depth: 5 },
        { id: 'c2-r2', char: 'G', row: 2, col: 2, depth: 4 },
        { id: 'c2-r3', char: 'S', row: 3, col: 2, depth: 6 },
        { id: 'c2-r4', char: 'I', row: 4, col: 2, depth: 5 },
      ],
      [
        { id: 'c3-r0', char: 'C', row: 0, col: 3, depth: 6 },
        { id: 'c3-r1', char: 'E', row: 1, col: 3, depth: 5 },
        { id: 'c3-r2', char: 'I', row: 2, col: 3, depth: 6 },
        { id: 'c3-r3', char: 'R', row: 3, col: 3, depth: 4 },
        { id: 'c3-r4', char: 'N', row: 4, col: 3, depth: 5 },
      ],
      [
        { id: 'c4-r0', char: 'K', row: 0, col: 4, depth: 5 },
        { id: 'c4-r1', char: 'S', row: 1, col: 4, depth: 6 },
        { id: 'c4-r2', char: 'C', row: 2, col: 4, depth: 5 },
        { id: 'c4-r3', char: 'T', row: 3, col: 4, depth: 7 },
        { id: 'c4-r4', char: 'H', row: 4, col: 4, depth: 4 },
      ],
    ],
    basicWords: [
      { word: 'STACK', clue: '// ADDR 0x00: Execution frame pointer, push/pop call hierarchy' },
      { word: 'BYTES', clue: '// ADDR 0x01: Octet octal width, foundational memory unit (8b)' },
      { word: 'LOGIC', clue: '// ADDR 0x02: Boolean algebra evaluator, NAND/NOR gate matrix' },
      { word: 'RESET', clue: '// ADDR 0x03: Master clear vector, hardware register initialization' },
      { word: 'PATCH', clue: '// ADDR 0x04: Binary diff injection, CVE security remediation' },
    ],
    bonusWords: [
      { word: 'REACT', clue: '// CIPHER 01: Declarative VDOM reconciliation UI paradigm' },
      { word: 'BATCH', clue: '// CIPHER 02: Non-interactive sequential task execution queue' },
      { word: 'BASIC', clue: '// CIPHER 03: 1964 Kemeny-Kurtz beginner symbolic instruction code' },
      { word: 'POINT', clue: '// CIPHER 04: Dereferenced memory address index pointer' },
      { word: 'PAINT', clue: '// CIPHER 05: Direct hardware rasterization fill pass' },
      { word: 'STICK', clue: '// CIPHER 06: Dual-axis analog directional input potentiometer' },
    ],
    acceptedDictionary: [
      'STACK', 'BYTES', 'LOGIC', 'RESET', 'PATCH',
      'REACT', 'BATCH', 'BASIC', 'POINT', 'PAINT', 'STICK',
      'SCALE', 'SLACK', 'BRICK', 'TRACK', 'SHOCK', 'BLOCK', 'CLICK', 'CLOCK',
      'PORTS', 'ROUTER', 'SHIFT', 'STATE', 'TOKEN', 'TRACE', 'USERS', 'VIRUS',
    ],
  },

  {
    id: 'cyber_mainframe',
    dateLabel: 'October 24, 2026',
    title: 'Double Cadgy: Cyber Mainframe',
    subtitle: 'Cryptographic Core • Strict Stacks • Hardened Ciphers',
    board: [
      [
        { id: 'c0-r0', char: 'C', row: 0, col: 0, depth: 6 },
        { id: 'c0-r1', char: 'L', row: 1, col: 0, depth: 5 },
        { id: 'c0-r2', char: 'R', row: 2, col: 0, depth: 5 },
        { id: 'c0-r3', char: 'B', row: 3, col: 0, depth: 4 },
        { id: 'c0-r4', char: 'P', row: 4, col: 0, depth: 4 },
      ],
      [
        { id: 'c1-r0', char: 'Y', row: 0, col: 1, depth: 4 },
        { id: 'c1-r1', char: 'O', row: 1, col: 1, depth: 6 },
        { id: 'c1-r2', char: 'E', row: 2, col: 1, depth: 7 },
        { id: 'c1-r3', char: 'A', row: 3, col: 1, depth: 5 },
        { id: 'c1-r4', char: 'I', row: 4, col: 1, depth: 4 },
      ],
      [
        { id: 'c2-r0', char: 'B', row: 0, col: 2, depth: 5 },
        { id: 'c2-r1', char: 'G', row: 1, col: 2, depth: 6 },
        { id: 'c2-r2', char: 'S', row: 2, col: 2, depth: 4 },
        { id: 'c2-r3', char: 'R', row: 3, col: 2, depth: 5 },
        { id: 'c2-r4', char: 'T', row: 4, col: 2, depth: 4 },
      ],
      [
        { id: 'c3-r0', char: 'E', row: 0, col: 3, depth: 6 },
        { id: 'c3-r1', char: 'I', row: 1, col: 3, depth: 6 },
        { id: 'c3-r2', char: 'C', row: 2, col: 3, depth: 7 },
        { id: 'c3-r3', char: 'A', row: 3, col: 3, depth: 4 },
        { id: 'c3-r4', char: 'T', row: 4, col: 3, depth: 4 },
      ],
      [
        { id: 'c4-r0', char: 'R', row: 0, col: 4, depth: 6 },
        { id: 'c4-r1', char: 'C', row: 1, col: 4, depth: 4 },
        { id: 'c4-r2', char: 'T', row: 2, col: 4, depth: 5 },
        { id: 'c4-r3', char: 'S', row: 3, col: 4, depth: 5 },
        { id: 'c4-r4', char: 'H', row: 4, col: 4, depth: 4 },
      ],
    ],
    basicWords: [
      { word: 'CYBER', clue: '// ADDR 0x10: Pervasive virtual telecommunications domain' },
      { word: 'LOGIC', clue: '// ADDR 0x11: Deterministic truth table evaluating conditions' },
      { word: 'RESET', clue: '// ADDR 0x12: Hard initialization vector pulling power line low' },
      { word: 'CORES', clue: '// ADDR 0x13: Independent execution processing pipelines' },
      { word: 'BYTES', clue: '// ADDR 0x14: 8 contiguous bits indexed in virtual addressing' },
    ],
    bonusWords: [
      { word: 'BATCH', clue: '// CIPHER 01: Bulk unattended background job processing' },
      { word: 'PATCH', clue: '// CIPHER 02: Dynamic library hotfix payload' },
      { word: 'BASIC', clue: '// CIPHER 03: Procedural imperative syntax standard' },
      { word: 'PORTS', clue: '// CIPHER 04: Transport layer multiplexed ingress endpoints' },
      { word: 'CARTS', clue: '// CIPHER 05: Read-only memory cartridge bus architecture' },
      { word: 'BITES', clue: '// CIPHER 06: Data packet nibble fragments across bus' },
    ],
    acceptedDictionary: [
      'CYBER', 'LOGIC', 'RESET', 'CORES', 'BYTES',
      'BATCH', 'PATCH', 'BASIC', 'PORTS', 'CARTS', 'BITES',
      'CHATS', 'COAST', 'CRATE', 'CREST', 'LATER',
      'OCTET', 'RELAY', 'RATES', 'ROOTS', 'REACT', 'SECTOR', 'STATE',
    ],
  },

  {
    id: 'quantum_glitch',
    dateLabel: 'October 25, 2026',
    title: 'Double Cadgy: Quantum Anomaly',
    subtitle: 'Fractured Syntax • Maximum Precision • Zero Wildcards',
    board: [
      [
        { id: 'c0-r0', char: 'P', row: 0, col: 0, depth: 5 },
        { id: 'c0-r1', char: 'S', row: 1, col: 0, depth: 6 },
        { id: 'c0-r2', char: 'F', row: 2, col: 0, depth: 4 },
        { id: 'c0-r3', char: 'C', row: 3, col: 0, depth: 4 },
        { id: 'c0-r4', char: 'Q', row: 4, col: 0, depth: 3 },
      ],
      [
        { id: 'c1-r0', char: 'I', row: 0, col: 1, depth: 5 },
        { id: 'c1-r1', char: 'H', row: 1, col: 1, depth: 4 },
        { id: 'c1-r2', char: 'L', row: 2, col: 1, depth: 6 },
        { id: 'c1-r3', char: 'R', row: 3, col: 1, depth: 5 },
        { id: 'c1-r4', char: 'U', row: 4, col: 1, depth: 5 },
      ],
      [
        { id: 'c2-r0', char: 'X', row: 0, col: 2, depth: 3 },
        { id: 'c2-r1', char: 'I', row: 1, col: 2, depth: 6 },
        { id: 'c2-r2', char: 'A', row: 2, col: 2, depth: 6 },
        { id: 'c2-r3', char: 'O', row: 3, col: 2, depth: 4 },
        { id: 'c2-r4', char: 'R', row: 4, col: 2, depth: 5 },
      ],
      [
        { id: 'c3-r0', char: 'E', row: 0, col: 3, depth: 6 },
        { id: 'c3-r1', char: 'F', row: 1, col: 3, depth: 4 },
        { id: 'c3-r2', char: 'S', row: 2, col: 3, depth: 6 },
        { id: 'c3-r3', char: 'R', row: 3, col: 3, depth: 5 },
        { id: 'c3-r4', char: 'K', row: 4, col: 3, depth: 4 },
      ],
      [
        { id: 'c4-r0', char: 'L', row: 0, col: 4, depth: 5 },
        { id: 'c4-r1', char: 'T', row: 1, col: 4, depth: 6 },
        { id: 'c4-r2', char: 'H', row: 2, col: 4, depth: 5 },
        { id: 'c4-r3', char: 'K', row: 3, col: 4, depth: 6 },
        { id: 'c4-r4', char: 'E', row: 4, col: 4, depth: 4 },
      ],
    ],
    basicWords: [
      { word: 'PIXEL', clue: '// ADDR 0x20: Primary raster framebuffer chromatic address' },
      { word: 'SHIFT', clue: '// ADDR 0x21: Bitwise logical/arithmetic register displacement' },
      { word: 'FLASH', clue: '// ADDR 0x22: Floating-gate electrically erasable NAND block' },
      { word: 'CRASH', clue: '// ADDR 0x23: Unhandled kernel panic or segmentation fault' },
      { word: 'QUARK', clue: '// ADDR 0x24: Subatomic particle matrix computational entity' },
    ],
    bonusWords: [
      { word: 'SHARK', clue: '// CIPHER 01: Deep packet inspection network monitor daemon' },
      { word: 'SHIRT', clue: '// CIPHER 02: Hardware event attendee collectible credential' },
      { word: 'SHARE', clue: '// CIPHER 03: NFS / SMB distributed volume endpoint' },
      { word: 'SHORT', clue: '// CIPHER 04: 16-bit signed primitive numerical scalar' },
    ],
    acceptedDictionary: [
      'PIXEL', 'SHIFT', 'FLASH', 'CRASH', 'QUARK',
      'SHARK', 'SHIRT', 'SHARE', 'SHORT',
      'SCALE', 'SLATE', 'SLICK', 'SLACK', 'PLATE', 'PHASE', 'PLAZA', 'PILOT', 'FLAME',
    ],
  },
]
