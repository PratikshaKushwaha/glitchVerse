// Narration + briefing script shown when the player interacts with the
// ancient floating manuscript in the Hub. The voiceover recording
// (developer_radio_voice_with_sound_design.wav) plays over pages 1-3:
// story blocks are typed as { type: 'line' } dialogue or { type: 'cue' }
// radio stage directions, e.g. [STATIC INTERFERENCE].

export const STORY_PAGES = [
  {
    speaker: 'DEVELOPER // RADIO COMM [FREQ 104.7 MHZ]',
    status: 'SIGNAL REESTABLISHING',
    blocks: [
      { type: 'cue', text: "[SFX: Television static — faint electrical buzzing]" },
      { type: 'line', text: '"Hello...? ... Can anyone hear me?"' },
      { type: 'cue', text: '[Static interference]' },
      { type: 'line', text: '"Wait... No... Not again..."' },
      { type: 'cue', text: '[Voice struggles to stabilise]' },
      {
        type: 'line',
        text: '"If you\'re hearing this... then somehow... I\'ve managed to reach someone outside."',
      },
    ],
  },
  {
    speaker: 'DEVELOPER // RADIO COMM [FREQ 104.7 MHZ]',
    status: 'IDENTITY CONFIRMED',
    blocks: [
      {
        type: 'cue',
        text: '[Short pause — signal crackles]',
      },
      {
        type: 'line',
        text: '"I\'m the... Developer. I\'m the one who created this world."',
      },
      { type: 'cue', text: '[Voice becomes darker and more serious]' },
      {
        type: 'line',
        text: '"But something went wrong. I\'ve been trapped... inside my own creation."',
      },
      { type: 'cue', text: '[Heavy static burst]' },
      {
        type: 'line',
        text: '"I\'ve tried everything. I\'ve tried reaching out... but no one could hear me."',
      },
      { type: 'cue', text: '[Pause — softer, almost whispering]' },
      { type: 'line', text: '"Until you..."' },
      { type: 'cue', text: '[Signal briefly stabilises]' },
      { type: 'line', text: '"Yes... YOU."' },
    ],
  },
  {
    speaker: 'DEVELOPER // RADIO COMM [FREQ 104.7 MHZ]',
    status: 'THE CHOSEN ONE',
    blocks: [
      { type: 'cue', text: '[Voice becomes urgent and emotional]' },
      {
        type: 'line',
        text: '"You\'re the chosen one. You\'re not just another player... You\'re the only one.... who can save me."',
      },
      { type: 'cue', text: '[Glitch — voice cuts out momentarily]' },
      { type: 'cue', text: '[Signal fades] [Transmission abruptly disconnects]' },
      { type: 'system', text: '▓▓ TRANSMISSION DISCONNECTED ▓▓' },
    ],
  },
  {
    speaker: 'DEVELOPER // RADIO COMM [FREQ 104.7 MHZ]',
    status: 'SIGNAL ESTABLISHED',
    blocks: [
      {
        type: 'line',
        text: '"Can you hear me through the static? If you are reading this script... you are the chosen one."',
      },
      {
        type: 'line',
        text: '"I was coding the core reality engine when a recursive glitch trapped my consciousness inside this world."',
      },
      {
        type: 'line',
        text: '"The architecture of this place is fragmented. Physics and logic are warped."',
      },
    ],
  },
  {
    speaker: 'DEVELOPER // RADIO COMM [FREQ 104.7 MHZ]',
    status: 'SECTOR INTEL: LEVEL 1',
    blocks: [
      { type: 'line', text: '"To free me, you must navigate through 4 distorted dimensions."' },
      {
        type: 'line',
        text: '"Ahead of you lies LEVEL 1: The Abandoned Complex. Eight rooms filled with misplaced memories and locked code doors."',
      },
      { type: 'line', text: '"The codes are no longer in plain sight. Search the drawers, cupboards and crates of every room. The deeper into the sector, the better they are hidden."' },
      { type: 'line', text: '"My sensors trace three GOLDEN DIGITS across rooms 1 to 4. Memorize them — I\'ll verify when you reach me."' },
      { type: 'line', text: '"Use GLITCH VISION (Hold Q) to reveal what was hidden. Approach when ready."' },
    ],
  },
]

// Flatten a page's blocks into the typewriter string (same text the old
// modal rendered by joining lines with blank lines).
export function pageText(page) {
  return page.blocks.map((block) => block.text).join('\n\n')
}
