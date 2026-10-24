// Multiple dynamic Cadgy puzzle boards
// Exact Double Cadgy mechanics inspired by OneLook Cadgy:
// 5 vertical columns of 5 stacked letter tiles, selecting exactly 1 tile per column left-to-right (Col 0 -> Col 4).
// Features:
// - 3D stacked tiles with variable depth
// - Heart Wildcard tiles (isHeart: true) that match any required letter
// - Multi-letter tiles (isMulti: true, e.g., 'CI', 'EN', 'TH')
// - Basic Words (common everyday vocabulary, 5 words)
// - Bonus Words (difficult, specialized, literary vocabulary with cryptic definitions sorted alphabetically)
// - Broad dictionary validation for extra creative word finds

export const CADGY_PUZZLE_BOARDS = [
  {
    id: 'classic_way_out',
    dateLabel: 'October 23, 2026',
    title: 'Double Cadgy: The Nexus Matrix',
    subtitle: 'Inspired by OneLook Cadgy • 5 Columns • 3D Stacks • Wildcard Hearts',
    board: [
      [
        { id: 'c0-r0', char: 'G', row: 0, col: 0, depth: 6 },
        { id: 'c0-r1', char: 'T', row: 1, col: 0, depth: 4 },
        { id: 'c0-r2', char: 'H', row: 2, col: 0, depth: 3 },
        { id: 'c0-r3', char: 'S', row: 3, col: 0, depth: 5 },
        { id: 'c0-r4', char: '', row: 4, col: 0, depth: 4, isHeart: true },
      ],
      [
        { id: 'c1-r0', char: 'L', row: 0, col: 1, depth: 3 },
        { id: 'c1-r1', char: 'R', row: 1, col: 1, depth: 5 },
        { id: 'c1-r2', char: 'E', row: 2, col: 1, depth: 7 },
        { id: 'c1-r3', char: 'K', row: 3, col: 1, depth: 3 },
        { id: 'c1-r4', char: 'CI', row: 4, col: 1, depth: 3, isMulti: true },
      ],
      [
        { id: 'c2-r0', char: 'N', row: 0, col: 2, depth: 4 },
        { id: 'c2-r1', char: 'I', row: 1, col: 2, depth: 6 },
        { id: 'c2-r2', char: '', row: 2, col: 2, depth: 5, isHeart: true },
        { id: 'c2-r3', char: 'EN', row: 3, col: 2, depth: 3, isMulti: true },
        { id: 'c2-r4', char: 'A', row: 4, col: 2, depth: 5 },
      ],
      [
        { id: 'c3-r0', char: 'C', row: 0, col: 3, depth: 4 },
        { id: 'c3-r1', char: 'R', row: 1, col: 3, depth: 5 },
        { id: 'c3-r2', char: 'S', row: 2, col: 3, depth: 6 },
        { id: 'c3-r3', char: 'D', row: 3, col: 3, depth: 4 },
        { id: 'c3-r4', char: 'B', row: 4, col: 3, depth: 3 },
      ],
      [
        { id: 'c4-r0', char: '', row: 0, col: 4, depth: 4, isHeart: true },
        { id: 'c4-r1', char: 'T', row: 1, col: 4, depth: 6 },
        { id: 'c4-r2', char: 'S', row: 2, col: 4, depth: 5 },
        { id: 'c4-r3', char: 'E', row: 3, col: 4, depth: 7 },
        { id: 'c4-r4', char: '', row: 4, col: 4, depth: 4, isHeart: true },
      ],
    ],
    // Everyday vocabulary (no clues needed initially)
    basicWords: [
      { word: 'HEADS', clue: 'Uppermost parts of bodies or guiding leaders' },
      { word: 'HEART', clue: 'Central muscular organ pumping life or core essence' },
      { word: 'TRADE', clue: 'Commercial exchange of goods or skilled craft' },
      { word: 'SKATE', clue: 'Glide smoothly on ice, or a flat marine fish' },
      { word: 'STAIR', clue: 'A single flight or series of steps connecting floors' },
    ],
    // Difficult, obscure, specialized, literary vocabulary (clues listed alphabetically by answer)
    bonusWords: [
      { word: 'GENRE', clue: 'Distinct stylistic category of artistic or literary composition' },
      { word: 'GLACE', clue: 'Preserved with sugar glaze or frozen; French for ice' },
      { word: 'GLIST', clue: 'Poetic or archaic verb meaning to faintly gleam or sparkle' },
      { word: 'KNAVE', clue: 'An unscrupulous, deceitful fellow or court playing card' },
      { word: 'SCEND', clue: 'The surging upward heave of a vessel upon an ocean wave' },
      { word: 'SHARD', clue: 'A sharp, brittle fragment of broken ceramic, glass, or stone' },
      { word: 'TENOR', clue: 'The highest natural adult male voice or general drift/intent' },
      { word: 'TINEA', clue: 'Medical dermatological fungal infection such as ringworm' },
      { word: 'TRESS', clue: 'A long lock, plait, or braid of human hair' },
    ],
    // Broad accepted dictionary for wildcard matches and player experimentation
    acceptedDictionary: [
      'HEADS', 'HEART', 'TRADE', 'SKATE', 'STAIR',
      'GENRE', 'GLACE', 'GLIST', 'KNAVE', 'SCEND', 'SHARD', 'TENOR', 'TINEA', 'TRESS',
      'CRONE', 'CREST', 'CLINE', 'GEARS', 'STROP', 'BRIBE', 'GLAIR', 'SCION', 'GLIDE',
      'SHINE', 'GRATE', 'HASTE', 'TRAIN', 'TRUCE', 'SCALE', 'SHARE', 'STARE', 'SLIDE',
      'TIERS', 'TRIES', 'TEARS', 'SEEDS', 'GLISS', 'GLISE', 'BRINE', 'SLATE', 'SLANT',
    ],
  },

  {
    id: 'cyber_mainframe',
    dateLabel: 'October 24, 2026',
    title: 'Double Cadgy: Cyber Mainframe',
    subtitle: 'High-Tech Cryptographic Columns • Multi-Letter TH & ER • Wildcard Hearts',
    board: [
      [
        { id: 'c0-r0', char: 'C', row: 0, col: 0, depth: 5 },
        { id: 'c0-r1', char: 'L', row: 1, col: 0, depth: 4 },
        { id: 'c0-r2', char: 'R', row: 2, col: 0, depth: 6 },
        { id: 'c0-r3', char: 'B', row: 3, col: 0, depth: 3 },
        { id: 'c0-r4', char: '', row: 4, col: 0, depth: 4, isHeart: true },
      ],
      [
        { id: 'c1-r0', char: 'Y', row: 0, col: 1, depth: 3 },
        { id: 'c1-r1', char: 'O', row: 1, col: 1, depth: 6 },
        { id: 'c1-r2', char: 'E', row: 2, col: 1, depth: 7 },
        { id: 'c1-r3', char: 'A', row: 3, col: 1, depth: 5 },
        { id: 'c1-r4', char: 'TH', row: 4, col: 1, depth: 4, isMulti: true },
      ],
      [
        { id: 'c2-r0', char: 'B', row: 0, col: 2, depth: 4 },
        { id: 'c2-r1', char: 'G', row: 1, col: 2, depth: 4 },
        { id: 'c2-r2', char: 'S', row: 2, col: 2, depth: 6 },
        { id: 'c2-r3', char: 'T', row: 3, col: 2, depth: 5 },
        { id: 'c2-r4', char: '', row: 2, col: 2, depth: 4, isHeart: true },
      ],
      [
        { id: 'c3-r0', char: 'E', row: 0, col: 3, depth: 6 },
        { id: 'c3-r1', char: 'I', row: 1, col: 3, depth: 5 },
        { id: 'c3-r2', char: 'O', row: 2, col: 3, depth: 4 },
        { id: 'c3-r3', char: 'A', row: 3, col: 3, depth: 5 },
        { id: 'c3-r4', char: 'ER', row: 4, col: 3, depth: 4, isMulti: true },
      ],
      [
        { id: 'c4-r0', char: 'R', row: 0, col: 4, depth: 5 },
        { id: 'c4-r1', char: 'C', row: 1, col: 4, depth: 4 },
        { id: 'c4-r2', char: 'T', row: 2, col: 4, depth: 6 },
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
      { word: 'BASIS', clue: 'The underlying conceptual support or fundamental premise' },
      { word: 'BATCH', clue: 'A grouped quantity of data records executed as one entity' },
      { word: 'CACHE', clue: 'High-speed auxiliary hardware memory buffer' },
      { word: 'ETHER', clue: 'The clear upper celestial atmosphere or early chemical anesthetic' },
      { word: 'ROBOT', clue: 'Autonomous programmable electromechanical agent' },
      { word: 'ROTOR', clue: 'Rotary spinning armature or component in turbines' },
    ],
    acceptedDictionary: [
      'CYBER', 'LOGIC', 'RESET', 'CORES', 'BYTES',
      'BASIS', 'BATCH', 'CACHE', 'ETHER', 'ROBOT', 'ROTOR',
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
      { word: 'SHIFT', clue: 'Displace or move from one position or bit register to another' },
      { word: 'FLASH', clue: 'Sudden intense burst of light or non-volatile semiconductor memory' },
      { word: 'CRASH', clue: 'Sudden total catastrophic failure of a computer operating process' },
      { word: 'QUARK', clue: 'Elementary subatomic particle carrying fractional electric charge' },
    ],
    bonusWords: [
      { word: 'FLAIL', clue: 'Swing or wave arms wildly, or an ancient agricultural threshing flail' },
      { word: 'QUAFF', clue: 'To drink an alcoholic or restorative beverage heartily with gusto' },
      { word: 'QUIET', clue: 'Tranquil calm or absence of audible acoustic vibrations' },
      { word: 'SHALT', clue: 'Archaic second-person singular future of shall (thou shalt)' },
      { word: 'SLASH', clue: 'Violent sweeping blade stroke or forward diagonal oblique slash' },
      { word: 'SPELT', clue: 'Ancient hulled heritage wheat grain, or past tense of spell' },
    ],
    acceptedDictionary: [
      'PIXEL', 'SHIFT', 'FLASH', 'CRASH', 'QUARK',
      'FLAIL', 'QUAFF', 'QUIET', 'SHALT', 'SLASH', 'SPELT',
      'SHARE', 'SHIRT', 'SHINE', 'SHACK', 'SCALE', 'SLATE', 'SLICK', 'SLACK', 'PLATE',
      'PHASE', 'PLAZA', 'PULSE', 'PILOT', 'FIBER', 'FAULT', 'FLOAT', 'FLUTE', 'FLAME',
    ],
  },
]
