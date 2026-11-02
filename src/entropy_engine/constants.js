// Color Palette as defined in the Master Development Prompt
export const PALETTE = {
  bg: '#0B0F1A',
  bgDark: '#060810',
  cyan: '#00E5FF',
  cyanDim: 'rgba(0, 229, 255, 0.3)',
  orange: '#FFA500',
  orangeGlow: 'rgba(255, 165, 0, 0.4)',
  magenta: '#FF00D4',
  magentaDim: 'rgba(255, 0, 212, 0.3)',
  purple: '#6A00FF',
  purpleGlow: 'rgba(106, 0, 255, 0.4)',
  red: '#FF3B4D',
  green: '#32E6A1',
  textLight: '#E8F4FC',
  textMuted: '#7A8C9E',
  metallic: '#242F40',
  metallicLight: '#3D4E68',
  metallicBorder: '#4D6282'
};

// Gameplay Constants
export const GAME_CONSTANTS = {
  // Canvas virtual resolution
  VIEW_WIDTH: 800,
  VIEW_HEIGHT: 450,
  TILE_SIZE: 24,

  // Energy System (Starting 100, clamped 0 - 100)
  STARTING_ENERGY: 100,
  MAX_ENERGY: 100,
  MIN_ENERGY: 0,

  // Normal Energy Costs & Rewards
  NORMAL_COSTS: {
    gravity: 15,
    freeze: 20,
    dimension: 10,
    nodeRecharge: 25,
    entropyDrain: 30
  },

  // Overloaded Energy Costs & Rewards (Mandatory Midway Twist)
  OVERLOAD_COSTS: {
    gravity: 30, // Increased penalty
    freeze: 20,
    dimension: -10, // Dimension switch now RESTORES 10 energy!
    nodeRecharge: 25,
    entropyDrain: 30
  },

  // Time Freeze
  FREEZE_DURATION_SEC: 5.0,
  FREEZE_COOLDOWN_SEC: 6.0,

  // Countdown & Attempts
  TOTAL_TIME_SEC: 180,
  INITIAL_ATTEMPTS: 3,

  // Scoring weights
  BASE_SCORE: 1000,
  TIME_BONUS_MULT: 10,
  ENERGY_BONUS_MULT: 5,
  ATTEMPT_BONUS_MULT: 200,
  PENALTY_MULT: 20,

  // Ranks
  RANK_S: 3000,
  RANK_A: 2400,
  RANK_B: 1800
};
