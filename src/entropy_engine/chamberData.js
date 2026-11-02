// Chamber Map Data, Entities, Hazards, and Sector Definitions
// Chamber Dimensions: 2600px wide x 500px high (virtual coordinate space)

export function createChamberData() {
  return {
    width: 2600,
    height: 500,

    // Sector boundaries (X coordinates)
    sectors: [
      { id: 1, name: 'SECTOR 1: GRAVITY CALIBRATION', startX: 0, endX: 520, targetNode: 1 },
      { id: 2, name: 'SECTOR 2: TEMPORAL LOCKDOWN', startX: 520, endX: 1100, targetNode: 2 },
      { id: 3, name: 'SECTOR 3: QUANTUM REDISTRIBUTION', startX: 1100, endX: 1720, targetNode: 3 },
      { id: 4, name: 'SECTOR 4: THE ENTROPY GAUNTLET', startX: 1720, endX: 2200, targetNode: 4 },
      { id: 5, name: 'CENTRAL REACTOR: THE LAST EQUILIBRIUM', startX: 2200, endX: 2600, targetNode: 'core' }
    ],

    // Checkpoint locations (Spawn at Start Point)
    checkpoints: [
      { id: 0, x: 60, y: 376, label: 'START POINT // AIRLOCK 01' },
      { id: 1, x: 500, y: 380, label: 'SECTOR 1 CLEAR' },
      { id: 2, x: 1080, y: 380, label: 'SECTOR 2 CLEAR // OVERLOAD ACTIVE' },
      { id: 3, x: 1700, y: 380, label: 'SECTOR 3 CLEAR' },
      { id: 4, x: 2180, y: 380, label: 'CENTRAL REACTOR GATE' }
    ],

    // Designated Entrance Airlock & Exit Reality Breach Gate
    startAirlock: {
      x: 30,
      y: 300,
      w: 52,
      h: 100,
      label: 'CHAMBER ENTRY // AIRLOCK 01'
    },
    exitPortal: {
      x: 2500,
      y: 288,
      w: 64,
      h: 112,
      open: false,
      label: 'REALITY BREACH // TO FINAL BOSS'
    },

    // Platforms:
    // dim: 'neutral' (solid in both dimensions), 'A' (solid in Dim A), 'B' (solid in Dim B)
    platforms: [
      // Outer Perimeter Boundaries
      { x: 0, y: 460, w: 2600, h: 40, dim: 'neutral', type: 'floor' }, // Floor bedrock
      { x: 0, y: 0, w: 2600, h: 28, dim: 'neutral', type: 'ceiling' }, // Ceiling bedrock
      { x: 0, y: 0, w: 28, h: 500, dim: 'neutral', type: 'wall' }, // Left chamber wall
      { x: 2580, y: 0, w: 30, h: 500, dim: 'neutral', type: 'wall' }, // Right chamber wall

      // --- SECTOR 1: GRAVITY CALIBRATION ---
      // Entrance Walkway
      { x: 28, y: 400, w: 160, h: 60, dim: 'neutral' },
      // Electrified floor pit gap (x: 188 to 340) - hazard on floor
      // Upper ceiling ledge (accessible via Gravity Reversal Q)
      { x: 160, y: 28, w: 220, h: 50, dim: 'neutral' },
      // Mid platform after gap
      { x: 340, y: 400, w: 160, h: 60, dim: 'neutral' },
      // Upper switch ledge for Node 1
      { x: 400, y: 160, w: 100, h: 20, dim: 'neutral' },

      // --- SECTOR 2: TEMPORAL LOCKDOWN ---
      // Sector separator doorway wall with gate
      { x: 500, y: 28, w: 24, h: 280, dim: 'neutral' },
      // Base floor of Sector 2
      { x: 524, y: 410, w: 220, h: 50, dim: 'neutral' },
      // Dimension A cyan platform bridge
      { x: 744, y: 380, w: 140, h: 20, dim: 'A' },
      // Dimension B magenta platform steps over drop
      { x: 760, y: 320, w: 100, h: 20, dim: 'B' },
      { x: 880, y: 260, w: 110, h: 20, dim: 'B' },
      // Pressure switch platform
      { x: 900, y: 410, w: 180, h: 50, dim: 'neutral' },
      // Upper ledge for Node 2
      { x: 990, y: 180, w: 100, h: 20, dim: 'A' },
      { x: 950, y: 120, w: 120, h: 20, dim: 'B' },

      // --- SECTOR 3: QUANTUM REDISTRIBUTION ---
      // Sector separator doorway wall
      { x: 1090, y: 28, w: 24, h: 290, dim: 'neutral' },
      // Base structure
      { x: 1114, y: 400, w: 180, h: 60, dim: 'neutral' },
      // High barrier
      { x: 1294, y: 240, w: 30, h: 180, dim: 'neutral' },
      // Dimension A bridge
      { x: 1324, y: 280, w: 120, h: 20, dim: 'A' },
      // Dimension B alternate elevated walkway
      { x: 1340, y: 180, w: 130, h: 20, dim: 'B' },
      // Conveyor platform
      { x: 1470, y: 390, w: 180, h: 40, dim: 'neutral' },
      // Ceiling ledge for Node 3
      { x: 1540, y: 28, w: 160, h: 45, dim: 'neutral' },

      // --- SECTOR 4: THE ENTROPY GAUNTLET ---
      { x: 1714, y: 400, w: 90, h: 60, dim: 'neutral' },
      // Alternating cyan/magenta mid-air stepping stones
      { x: 1820, y: 340, w: 70, h: 18, dim: 'A' },
      { x: 1910, y: 280, w: 70, h: 18, dim: 'B' },
      { x: 2000, y: 220, w: 70, h: 18, dim: 'A' },
      { x: 2080, y: 180, w: 80, h: 18, dim: 'B' },
      // Node 4 station
      { x: 2160, y: 220, w: 110, h: 20, dim: 'neutral' },

      // --- CENTRAL REACTOR: THE LAST EQUILIBRIUM ---
      { x: 2270, y: 400, w: 310, h: 60, dim: 'neutral' },
      // Switch A ceiling alcove (Gravity only)
      { x: 2320, y: 28, w: 90, h: 40, dim: 'neutral' },
      // Switch B Dimension B structure
      { x: 2430, y: 280, w: 80, h: 20, dim: 'B' },
      // Switch C elevation ledge
      { x: 2510, y: 180, w: 70, h: 20, dim: 'neutral' }
    ],

    // Moving Platforms (can be frozen with [E])
    movingPlatforms: [
      // Sector 1: crossing electrified pit
      {
        id: 'mp1',
        x: 210,
        y: 330,
        w: 80,
        h: 16,
        startX: 200,
        endX: 320,
        startY: 330,
        endY: 330,
        speed: 45,
        dir: 1,
        dim: 'neutral',
        timeResistant: false
      },
      // Sector 3: elevated transport
      {
        id: 'mp2',
        x: 1350,
        y: 340,
        w: 75,
        h: 16,
        startX: 1330,
        endX: 1460,
        startY: 340,
        endY: 340,
        speed: 60,
        dir: 1,
        dim: 'neutral',
        timeResistant: false
      },
      // Sector 5: Fast vertical piston for Switch C
      {
        id: 'mp3',
        x: 2470,
        y: 360,
        w: 65,
        h: 16,
        startX: 2470,
        endX: 2470,
        startY: 360,
        endY: 200,
        speed: 90,
        dir: 1,
        dim: 'neutral',
        timeResistant: false
      }
    ],

    // Collapsing Platforms (break 1.2s after player stands on them)
    collapsingPlatforms: [
      { id: 'cp1', x: 1840, y: 240, w: 60, h: 16, timer: 1.2, fallen: false, respawnT: 0 },
      { id: 'cp2', x: 2040, y: 310, w: 60, h: 16, timer: 1.2, fallen: false, respawnT: 0 }
    ],

    // Movable Crates (pushable, freeze-able, affected by gravity)
    crates: [
      // Sector 2 crate (must be pushed/frozen onto pressure switch)
      { id: 'crate1', x: 620, y: 374, w: 34, h: 34, vx: 0, vy: 0, onGround: true, dim: 'neutral', gravitySensitive: true },
      // Sector 3 crate A (Dimension A)
      { id: 'crate2', x: 1180, y: 364, w: 34, h: 34, vx: 0, vy: 0, onGround: true, dim: 'A', gravitySensitive: true },
      // Sector 3 crate B (Dimension B)
      { id: 'crate3', x: 1360, y: 144, w: 34, h: 34, vx: 0, vy: 0, onGround: true, dim: 'B', gravitySensitive: true }
    ],

    // Pressure Plates / Switches
    switches: [
      // Sector 2 Crate Pressure Switch (holds door open)
      { id: 'sw_crate', x: 960, y: 406, w: 40, h: 6, pressed: false, targetDoor: 'door1' },
      // Final Equilibrium Switch A (Requires Inverted Gravity)
      { id: 'sw_a', x: 2355, y: 68, w: 20, h: 20, activated: false, label: 'SWITCH A (GRAVITY)', reqGravity: -1 },
      // Final Equilibrium Switch B (Requires Dimension B)
      { id: 'sw_b', x: 2465, y: 260, w: 20, h: 20, activated: false, label: 'SWITCH B (DIMENSION B)', reqDim: 'B' },
      // Final Equilibrium Switch C (Requires Frozen Platform elevation)
      { id: 'sw_c', x: 2535, y: 160, w: 20, h: 20, activated: false, label: 'SWITCH C (TEMPORAL LOCK)' }
    ],

    // Security Blast Doors (opened by nodes or switches)
    doors: [
      { id: 'door1', x: 500, y: 308, w: 24, h: 92, open: false, requiredNode: 1 },
      { id: 'door2', x: 1090, y: 318, w: 24, h: 82, open: false, requiredNode: 2 },
      { id: 'door3', x: 1714, y: 318, w: 24, h: 82, open: false, requiredNode: 3 },
      { id: 'door_exit', x: 2500, y: 288, w: 64, h: 112, open: false, label: 'REALITY BREACH EXIT' }
    ],

    // 4 Reactor Energy Nodes (Recharges +25 Energy, activates sector gates)
    energyNodes: [
      { id: 1, x: 440, y: 130, w: 28, h: 38, activated: false, label: 'NODE 1: GRAVITY CALIBRATION' },
      { id: 2, x: 1020, y: 150, w: 28, h: 38, activated: false, label: 'NODE 2: TEMPORAL LOCKDOWN' },
      { id: 3, x: 1600, y: 70, w: 28, h: 38, activated: false, label: 'NODE 3: QUANTUM REDISTRIBUTION' },
      { id: 4, x: 2200, y: 180, w: 28, h: 38, activated: false, label: 'NODE 4: ENTROPY GAUNTLET' }
    ],

    // Environmental Hazards
    hazards: {
      // Rotating Saw Blades
      saws: [
        { id: 'saw1', x: 740, y: 360, r: 16, startX: 740, endX: 860, speed: 70, dir: 1, angle: 0, timeResistant: false },
        { id: 'saw2', x: 1400, y: 370, r: 16, startX: 1380, endX: 1480, speed: 85, dir: 1, angle: 0, timeResistant: false },
        // Time-resistant hazard (activated during reactor overload)
        { id: 'saw_overload', x: 1980, y: 260, r: 18, startX: 1950, endX: 2060, speed: 90, dir: 1, angle: 0, timeResistant: true }
      ],

      // Lasers (oscillating / dimension-dependent)
      lasers: [
        // Sector 1 floor spikes/electric grid
        { id: 'lz_pit1', x1: 188, y1: 450, x2: 340, y2: 450, active: true, dim: 'neutral', lethal: true },
        // Sector 2 laser gate (active in Dim A, off in Dim B)
        { id: 'lz_dimA', x1: 740, y1: 300, x2: 740, y2: 400, active: true, dim: 'A', lethal: true },
        // Sector 4 rotating laser emitter (time resistant)
        { id: 'lz_rot', cx: 1950, cy: 190, length: 110, angle: 0, rotSpeed: 1.2, active: true, dim: 'neutral', timeResistant: true, lethal: true }
      ],

      // Entropy Fields (drain 30 energy if touched)
      entropyFields: [
        { id: 'ef1', x: 1240, y: 400, w: 50, h: 58, pulseT: 0 },
        { id: 'ef2', x: 1850, y: 410, w: 60, h: 48, pulseT: 0 }
      ]
    }
  };
}
