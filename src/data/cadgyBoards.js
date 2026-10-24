// Multiple dynamic Cadgy puzzle boards
// Exact Cadgy mechanic: 5 columns of 5 stacked letter tiles, pick letters from col 0 to col 4

export const CADGY_PUZZLE_BOARDS = [
  {
    id: 'classic_way_out',
    title: 'Puzzle 1: The Way Out Classic',
    board: [
      [
        { id: 'c0-r0', char: 'G', row: 0, col: 0 },
        { id: 'c0-r1', char: 'T', row: 1, col: 0 },
        { id: 'c0-r2', char: 'H', row: 2, col: 0 },
        { id: 'c0-r3', char: 'S', row: 3, col: 0 },
        { id: 'c0-r4', char: '', row: 4, col: 0, isHeart: true },
      ],
      [
        { id: 'c1-r0', char: 'L', row: 0, col: 1 },
        { id: 'c1-r1', char: 'R', row: 1, col: 1 },
        { id: 'c1-r2', char: 'E', row: 2, col: 1 },
        { id: 'c1-r3', char: 'K', row: 3, col: 1 },
        { id: 'c1-r4', char: 'CI', row: 4, col: 1 },
      ],
      [
        { id: 'c2-r0', char: 'N', row: 0, col: 2 },
        { id: 'c2-r1', char: 'I', row: 1, col: 2 },
        { id: 'c2-r2', char: '', row: 2, col: 2, isHeart: true },
        { id: 'c2-r3', char: 'EN', row: 3, col: 2 },
        { id: 'c2-r4', char: 'A', row: 4, col: 2 },
      ],
      [
        { id: 'c3-r0', char: 'C', row: 0, col: 3 },
        { id: 'c3-r1', char: 'R', row: 1, col: 3 },
        { id: 'c3-r2', char: 'S', row: 2, col: 3 },
        { id: 'c3-r3', char: 'D', row: 3, col: 3 },
        { id: 'c3-r4', char: 'B', row: 4, col: 3 },
      ],
      [
        { id: 'c4-r0', char: '', row: 0, col: 4, isHeart: true },
        { id: 'c4-r1', char: 'T', row: 1, col: 4 },
        { id: 'c4-r2', char: 'S', row: 2, col: 4 },
        { id: 'c4-r3', char: 'E', row: 3, col: 4 },
        { id: 'c4-r4', char: '', row: 4, col: 4, isHeart: true },
      ],
    ],
    basicWords: [
      { word: 'HEADS', clue: 'Uppermost parts of human bodies' },
      { word: 'HEART', clue: 'Muscular organ that pumps blood' },
      { word: 'TRADE', clue: 'Exchange of goods or services' },
    ],
    bonusWords: [
      { word: 'GEARS', clue: 'Mechanical toothed wheels transmitting motion' },
      { word: 'GENRE', clue: 'Category of artistic or literary works' },
      { word: 'GLACE', clue: 'Glazed fruit or frozen dessert; French for ice' },
    ],
  },
  {
    id: 'cyber_mainframe',
    title: 'Puzzle 2: Cyber Mainframe',
    board: [
      [
        { id: 'c0-r0', char: 'C', row: 0, col: 0 },
        { id: 'c0-r1', char: 'L', row: 1, col: 0 },
        { id: 'c0-r2', char: 'R', row: 2, col: 0 },
        { id: 'c0-r3', char: 'B', row: 3, col: 0 },
        { id: 'c0-r4', char: '', row: 4, col: 0, isHeart: true },
      ],
      [
        { id: 'c1-r0', char: 'Y', row: 0, col: 1 },
        { id: 'c1-r1', char: 'O', row: 1, col: 1 },
        { id: 'c1-r2', char: 'E', row: 2, col: 1 },
        { id: 'c1-r3', char: 'A', row: 3, col: 1 },
        { id: 'c1-r4', char: '', row: 4, col: 1, isHeart: true },
      ],
      [
        { id: 'c2-r0', char: 'B', row: 0, col: 2 },
        { id: 'c2-r1', char: 'G', row: 1, col: 2 },
        { id: 'c2-r2', char: 'S', row: 2, col: 2 },
        { id: 'c2-r3', char: 'T', row: 3, col: 2 },
        { id: 'c2-r4', char: '', row: 4, col: 2, isHeart: true },
      ],
      [
        { id: 'c3-r0', char: 'E', row: 0, col: 3 },
        { id: 'c3-r1', char: 'I', row: 1, col: 3 },
        { id: 'c3-r2', char: 'E', row: 2, col: 3 },
        { id: 'c3-r3', char: 'O', row: 3, col: 3 },
        { id: 'c3-r4', char: '', row: 4, col: 3, isHeart: true },
      ],
      [
        { id: 'c4-r0', char: 'R', row: 0, col: 4 },
        { id: 'c4-r1', char: 'C', row: 1, col: 4 },
        { id: 'c4-r2', char: 'T', row: 2, col: 4 },
        { id: 'c4-r3', char: 'S', row: 3, col: 4 },
        { id: 'c4-r4', char: '', row: 4, col: 4, isHeart: true },
      ],
    ],
    basicWords: [
      { word: 'CYBER', clue: 'Relating to electronic computers and virtual networks' },
      { word: 'LOGIC', clue: 'Reasoning conducted or assessed according to strict principles' },
      { word: 'RESET', clue: 'Set again or restart to an initial baseline' },
    ],
    bonusWords: [
      { word: 'BYTES', clue: 'Units of digital information usually consisting of eight bits' },
      { word: 'ROBOT', clue: 'Autonomous programmable mechanical agent' },
      { word: 'CORES', clue: 'Central or innermost computational engines' },
    ],
  },
  {
    id: 'quantum_vault',
    title: 'Puzzle 3: The Quantum Vault',
    board: [
      [
        { id: 'c0-r0', char: 'V', row: 0, col: 0 },
        { id: 'c0-r1', char: 'S', row: 1, col: 0 },
        { id: 'c0-r2', char: 'L', row: 2, col: 0 },
        { id: 'c0-r3', char: 'G', row: 3, col: 0 },
        { id: 'c0-r4', char: '', row: 4, col: 0, isHeart: true },
      ],
      [
        { id: 'c1-r0', char: 'A', row: 0, col: 1 },
        { id: 'c1-r1', char: 'P', row: 1, col: 1 },
        { id: 'c1-r2', char: 'I', row: 2, col: 1 },
        { id: 'c1-r3', char: 'O', row: 3, col: 1 },
        { id: 'c1-r4', char: '', row: 4, col: 1, isHeart: true },
      ],
      [
        { id: 'c2-r0', char: 'U', row: 0, col: 2 },
        { id: 'c2-r1', char: 'A', row: 1, col: 2 },
        { id: 'c2-r2', char: 'G', row: 2, col: 2 },
        { id: 'c2-r3', char: 'L', row: 3, col: 2 },
        { id: 'c2-r4', char: '', row: 4, col: 2, isHeart: true },
      ],
      [
        { id: 'c3-r0', char: 'L', row: 0, col: 3 },
        { id: 'c3-r1', char: 'R', row: 1, col: 3 },
        { id: 'c3-r2', char: 'H', row: 2, col: 3 },
        { id: 'c3-r3', char: 'A', row: 3, col: 3 },
        { id: 'c3-r4', char: '', row: 4, col: 3, isHeart: true },
      ],
      [
        { id: 'c4-r0', char: 'T', row: 0, col: 4 },
        { id: 'c4-r1', char: 'K', row: 1, col: 4 },
        { id: 'c4-r2', char: 'T', row: 2, col: 4 },
        { id: 'c4-r3', char: 'R', row: 3, col: 4 },
        { id: 'c4-r4', char: '', row: 4, col: 4, isHeart: true },
      ],
    ],
    basicWords: [
      { word: 'VAULT', clue: 'Secure fortified room or repository for treasures' },
      { word: 'SPARK', clue: 'A fierce flash of light or ignition source' },
      { word: 'LIGHT', clue: 'Illumination that makes things visible in darkness' },
    ],
    bonusWords: [
      { word: 'SOLAR', clue: 'Radiated from or relating to the sun' },
      { word: 'SIGHT', clue: 'The faculty or power of seeing' },
      { word: 'STARK', clue: 'Severe or bare in appearance or outline' },
    ],
  },
  {
    id: 'glitch_shift',
    title: 'Puzzle 4: Glitch Anomaly',
    board: [
      [
        { id: 'c0-r0', char: 'P', row: 0, col: 0 },
        { id: 'c0-r1', char: 'S', row: 1, col: 0 },
        { id: 'c0-r2', char: 'F', row: 2, col: 0 },
        { id: 'c0-r3', char: 'C', row: 3, col: 0 },
        { id: 'c0-r4', char: '', row: 4, col: 0, isHeart: true },
      ],
      [
        { id: 'c1-r0', char: 'I', row: 0, col: 1 },
        { id: 'c1-r1', char: 'H', row: 1, col: 1 },
        { id: 'c1-r2', char: 'L', row: 2, col: 1 },
        { id: 'c1-r3', char: 'R', row: 3, col: 1 },
        { id: 'c1-r4', char: '', row: 4, col: 1, isHeart: true },
      ],
      [
        { id: 'c2-r0', char: 'X', row: 0, col: 2 },
        { id: 'c2-r1', char: 'I', row: 1, col: 2 },
        { id: 'c2-r2', char: 'A', row: 2, col: 2 },
        { id: 'c2-r3', char: 'A', row: 3, col: 2 },
        { id: 'c2-r4', char: '', row: 4, col: 2, isHeart: true },
      ],
      [
        { id: 'c3-r0', char: 'E', row: 0, col: 3 },
        { id: 'c3-r1', char: 'F', row: 1, col: 3 },
        { id: 'c3-r2', char: 'S', row: 2, col: 3 },
        { id: 'c3-r3', char: 'S', row: 3, col: 3 },
        { id: 'c3-r4', char: '', row: 4, col: 3, isHeart: true },
      ],
      [
        { id: 'c4-r0', char: 'L', row: 0, col: 4 },
        { id: 'c4-r1', char: 'T', row: 1, col: 4 },
        { id: 'c4-r2', char: 'H', row: 2, col: 4 },
        { id: 'c4-r3', char: 'H', row: 3, col: 4 },
        { id: 'c4-r4', char: '', row: 4, col: 4, isHeart: true },
      ],
    ],
    basicWords: [
      { word: 'PIXEL', clue: 'Minute area of illumination on a display screen' },
      { word: 'SHIFT', clue: 'Move or cause to move from one position to another' },
      { word: 'FLASH', clue: 'A sudden brief burst of bright illumination' },
    ],
    bonusWords: [
      { word: 'CRASH', clue: 'Sudden complete breakdown of a computer program' },
      { word: 'SLASH', clue: 'Cut with a violent sweeping stroke or punctuation mark' },
      { word: 'SHALT', clue: 'Archaic second person singular of shall' },
    ],
  },
]
