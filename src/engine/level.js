// ============================================================
// LEVEL DATA — One large interconnected chamber (60×30 tiles)
// All rows are verified 60 characters wide.
// ============================================================
import { TS } from './constants.js';

export const RAW_GRID = [
//0         1         2         3         4         5
//012345678901234567890123456789012345678901234567890123456789
 '############################################################', // 0
 '#..........................................................#', // 1
 '#.C.####.....N..####.....####........B.B.....##.##########.#', // 2
 '#......#........#..#....##..#...B....B.B.B...A..A..........#', // 3
 '#.####.#...A.A..#..#....##..#...#....####.B..A.A..A.......E#', // 4
 '#.....S#...A....#..#....##..#...#....K..#.####.............#', // 5
 '#..h..##...A....####....##..#...#....P..#.##...##.########.#', // 6
 '##.####.####....####....##..#..S#.......#.##...##....K.....#', // 7
 '#.....E.A.......####....##..#...#.A..A..#.##.h.##....P.....#', // 8
 '#.#####.A.A..A..####.....##.#...#.A..A..#.##...##.########.#', // 9
 '#.......########.......####.#...#.######.#.######.#.......N#', // 10
 '#.K.###.........N.h....##...#...#........#........c.c.c.c..#', // 11
 '#.P.###.########.######.....#.LLLLLLLLLL.#..##....##########', // 12
 '#...###....E.....E..........#...........##..##..B.........v#', // 13
 '#.A.A.A.##########.#######.####.######..#..##...B.B.B.B.v..#', // 14
 '#.A...A.#..N......#......#.#...##.......#.#.##..B.....B.B..#', // 15
 '#.A.A.A.#.########.######.#.S..##.......#.#.##..B.B.B.B....#', // 16
 '#.......#.#.h.....#......##.###.#.1.....#.#.##..........#..#', // 17 SW-A
 '#.v.....#.#.......#.#####.###...#.#.....#.#.##.S........#..#', // 18
 '#.......#.#.EEEEE.#.....#####...#.#.....#.#.##..........#.2#', // 19 SW-B
 '#.###...#.#########.###.#..##...#.#.....#.#.############.#.#', // 20
 '#.....N.#...........E...#..####.###.##..#.#.......h.....##.#', // 21
 '#.#####.####.###########.#......#...#...#.#.######.#####.E.#', // 22
 '#.......#E...#.3.........#.####.#..####.#.#.....#.#....#...#', // 23 SW-C
 '#.#####.##...###.#########..#...#.#...##.#.#.####.#..h..#..#', // 24
 '#.....X.##...###.#.......#..#...#.#...##.#.#.....E#.....####', // 25 EXIT
 '#.#####.##.N.###.#.#####.#..#...#.#...##.##.#######.#######.', // 26
 '##.....###...####.#......###...###...##...##.........#######', // 27
 '############################################################', // 28
 '############################################################', // 29
];

// Sanitize & pad to guarantee exact 60 cols per row
export const GRID = RAW_GRID.map(row => {
  if (row.length === 60) return row;
  if (row.length > 60) return row.slice(0, 60);
  return row.padEnd(60, '#');
});

export const COLS = 60;
export const ROWS = 30;
export const WORLD_W = COLS * TS;
export const WORLD_H = ROWS * TS;
export const SPAWN = { x: 2 * TS + 2, y: 2 * TS + 2 };

// All object definitions matching the GDD
export const DEFS = {
  movingPlatforms: [
    { id: 'mp1', col: 2,  row: 6,  axis: 'x', range: 48, speed: 40 },
    { id: 'mp2', col: 17, row: 11, axis: 'x', range: 64, speed: 35 },
    { id: 'mp3', col: 8,  row: 18, axis: 'y', range: 36, speed: 30 },
    { id: 'mp4', col: 41, row: 6,  axis: 'x', range: 40, speed: 48 },
    { id: 'mp5', col: 56, row: 13, axis: 'y', range: 48, speed: 28 },
    { id: 'mp6', col: 43, row: 21, axis: 'x', range: 40, speed: 42 },
    { id: 'mp7', col: 10, row: 17, axis: 'x', range: 32, speed: 35 }, // for sync-C puzzle
  ],
  saws: [
    { id: 'saw1', col: 5,  row: 5,  axis: 'x', range: 24, speed: 50 },
    { id: 'saw2', col: 29, row: 16, axis: 'x', range: 32, speed: 50 },
    { id: 'saw3', col: 38, row: 18, axis: 'y', range: 28, speed: 45 },
    { id: 'saw4', col: 48, row: 7,  axis: 'x', range: 20, speed: 55 },
  ],
  lasers: [
    { id: 'las1', col: 30, row: 12, axis: 'h', length: 10, barrierSwitch: 'P2' },
    { id: 'las2', col: 8,  row: 4,  axis: 'v', length: 4, dimOnly: 'A' },
    { id: 'las3', col: 51, row: 4,  axis: 'v', length: 5, dimOnly: 'B' },
  ],
  energyNodes: [
    { id: 'en1', col: 18, row: 1  },
    { id: 'en2', col: 56, row: 10 },
    { id: 'en3', col: 17, row: 15 },
    { id: 'en4', col: 11, row: 21 },
    { id: 'en5', col: 27, row: 26 },
  ],
  reactorNodes: [
    { id: 'rn1', col: 13, row: 5,  sector: 1, label: 'CORE NODE 1' },
    { id: 'rn2', col: 31, row: 7,  sector: 2, label: 'CORE NODE 2' }, // triggers Midway Overload
    { id: 'rn3', col: 45, row: 15, sector: 3, label: 'CORE NODE 3' },
    { id: 'rn4', col: 55, row: 4,  sector: 4, label: 'CORE NODE 4' },
  ],
  syncSwitches: [
    { id: 'sw1', col: 34, row: 17, label: 'A', reqGravRev: true },
    { id: 'sw2', col: 57, row: 19, label: 'B', reqDimB: true },
    { id: 'sw3', col: 4,  row: 23, label: 'C', reqFrozenPlatform: 'mp7' },
  ],
  checkpoints: [
    { id: 'cp1', col: 2,  row: 2 },
    { id: 'cp2', col: 26, row: 14 },
    { id: 'cp3', col: 44, row: 3 },
  ],
  crates: [
    { id: 'cr1', col: 30, row: 5,  w: 12, h: 12 },
    { id: 'cr2', col: 11, row: 11, w: 12, h: 12 },
    { id: 'cr3', col: 47, row: 7,  w: 12, h: 12 },
  ],
  pressureSwitches: [
    { id: 'ps1', col: 30, row: 6,  targets: ['las1'] },
    { id: 'ps2', col: 11, row: 12, targets: [] },
    { id: 'ps3', col: 47, row: 8,  targets: [] },
  ],
  collapsingPlatforms: [
    { id: 'col1', col: 45, row: 11, len: 4 },
  ],
  entropyFields: [
    { col: 17, row: 4,  w: 2, h: 1 },
    { col: 20, row: 4,  w: 2, h: 1 },
    { col: 10, row: 8,  w: 2, h: 1 },
    { col: 56, row: 4,  w: 2, h: 2 },
    { col: 8,  row: 19, w: 5, h: 1 },
    { col: 3,  row: 22, w: 2, h: 1 },
    { col: 38, row: 22, w: 2, h: 1 },
  ],
  exit: { col: 6, row: 25 },
  sectors: [
    { name: 'SECTOR 1 — GRAVITY CALIBRATION', startCol: 0,  endCol: 18 },
    { name: 'SECTOR 2 — TEMPORAL LOCKDOWN',   startCol: 18, endCol: 36 },
    { name: 'SECTOR 3 — QUANTUM REDISTRIB.',  startCol: 36, endCol: 48 },
    { name: 'SECTOR 4 — ENTROPY GAUNTLET',    startCol: 48, endCol: 60 },
  ],
};
