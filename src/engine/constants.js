// ============================================================
// CONSTANTS
// ============================================================
export const W = 480, H = 270, TS = 16;

// Color Palette — matches reference GDD image exactly
export const C = {
  bg:        '#0B0F1A',
  bgDark:    '#060810',
  cyan:      '#00E5FF',
  orange:    '#FFA500',
  magenta:   '#FF00D4',
  purple:    '#6A00FF',
  red:       '#FF3B4D',
  green:     '#32E6A1',
  yellow:    '#FFD23A',
  white:     '#E8F4FF',
  gray:      '#3A4055',
  grayLight: '#7A8899',
};

export const ENERGY_MAX        = 100;
export const ENERGY_NODE_VALUE = 25;
export const FREEZE_DURATION   = 5.0;    // seconds
export const FREEZE_COOLDOWN   = 8.0;    // seconds
export const GAME_TIMER        = 180;    // seconds
export const ATTEMPTS_MAX      = 3;

export const PLAYER_W     = 8;
export const PLAYER_H     = 14;
export const PLAYER_SPEED = 90;
export const PLAYER_JUMP  = 220;
export const GRAVITY_ACC  = 480;

// Energy costs per action
export const COST = {
  GRAVITY_NORMAL:   15,
  GRAVITY_OVERLOAD: 30,
  FREEZE:           20,
  DIM_SWITCH:       10,     // costs pre-overload; post-overload GIVES 10
  ENTROPY_DRAIN:    25,     // per second of contact
};
