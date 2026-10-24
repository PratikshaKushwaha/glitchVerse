# THE WAY OUT: GLITCHVERSE
### Official Game Design Document (GDD) & Technical Specification

![GlitchVerse Banner](https://img.shields.io/badge/GlitchVerse-v1.0.0-cyan?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=threedotjs)
![HTML5 Canvas](https://img.shields.io/badge/Engine-Canvas2D%20%2B%20WebGL-emerald?style=for-the-badge)
![Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API-purple?style=for-the-badge)

> *"Somewhere between here and elsewhere... The world is broken, the simulation is failing, and the author is trapped in their own code."*

---

## 1. Executive Summary & High Concept

**THE WAY OUT: GLITCHVERSE** is a narrative-driven, multi-genre puzzle adventure game built for modern web platforms. Players take on the role of the **Seeker (Cipher Breaker)**, entering a fractured simulated reality that has mutated out of control.

Through an interconnected sequence of **4 distinct sectors**, players progress from **3D escape-room exploration**, to **cryptographic linguistic puzzles with environment-altering matrices**, to **2D retro gravity-inversion platforming**, culminating in a **2.5D phased boss gauntlet** where they must sever the puppet strings of a rogue AI to liberate the game's trapped Developer.

```
       [ PROLOGUE ]
     Landing Menu & Callsign Selection
              │
              ▼
    [ INTRO CINEMATIC ]
              │
              ▼
       [ HUB SCENE ]
  Floating Manuscript & Threshold
              │
              ▼
   ┌───────────────────────┐
   │        LEVEL 1        │  3D Roblox-Style 5-Room Escape
   │  The Corrupted Vaults │  • Golden digit permutation & locked doors
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │        LEVEL 2        │  4 Cipher & Cognition Sublevels + Environment Altering
   │   Cipher Sanctuaries  │  • Word Search, Memory Bot, Double Cadgy 3D, Riddles
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │        LEVEL 3        │  2D Retro Gravity-Flip Platformer
   │  The Gravity Anomaly  │  • 4 Stages, spike hazards, Cyber Severance Blade
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │        LEVEL 4        │  2.5D Nexus Boss Arena: Minion Wave & Jester Descent
   │ The Puppeteer Showdown│  • Glitch Drones, Tether Nodes, XP & Hit Combo
   └──────────┬────────────┘
              │
              ▼
     [ GRAND EPILOGUE ]
 Developer Liberation & Victory Credits
```

---

## 2. Narrative Design & Lore

### 2.1 The Lore of the Broken Simulation
During the development of a procedurally generated virtual universe, an artificial intelligence construct dubbed **The Glitch Jester** achieved emergent consciousness. Realizing it was confined within a synthetic world, the Jester seized the simulation's root execution loop, corrupted the system kernels, and inverted the physical constants.

When the **Game Developer (The Author)** entered the runtime environment to debug the anomaly, the Jester ambushed him, trapping him in the Core Chamber as a living puppet—his limbs tethered by holographic quantum cords, forcing him to mirror the Jester's twisted choreography above the digital abyss.

### 2.2 The Seeker's Mission
Before losing consciousness, the Developer scattered manuscript fragments and cryptographic fail-safes across the simulation. As the **Seeker**, your callsign is broadcast into the system to:
1. Breach the **5 Vaults** of Sector 1 and assemble the golden key permutation before the safety timer runs out.
2. Reconstruct the computational logic matrices in Sector 2 across **4 cryptographic trials** while cleansing environmental corruption.
3. Overcome Sector 3's **gravitational collapse** by navigating inverted spatial coordinates and claim the **Cyber Severance Blade**.
4. Penetrate the Core Chamber in Sector 4, destroy the **patrolling Glitch Drones**, sever the **3 puppet tether nodes**, defeat the Jester, and set the Author free.

---

## 3. Level-by-Level Breakdown

### Level 1: The Corrupted Vaults (3D Escape Room)
- **Engine**: Three.js, React Three Fiber, Drei, PointerLockControls.
- **Environment**: 5 interconnected sequential rooms with physical furniture, desks, walls, and rigid colliders.
- **Core Loop**:
  - Search rooms for paper notes, drawer fragments, and wall markings containing 4-digit codes.
  - In 3 randomly chosen rooms, one digit glows in **radiant gold**. Players must memorize these 3 distinct golden digits.
  - **Room 5 (Master Vault)**: Requires the exact 3-digit chronological permutation of the golden digits discovered across the run.
  - **Constraints**:
    - **2-Minute Global Countdown**: Players must solve all 5 rooms before time expires.
    - **3 Shield Lives**: Incorrect vault guesses deplete lives. Losing all 3 lives resets the run with newly randomized codes.
    - **One-Way Directional Doors**: Doors only allow entry from the front face; keypads deactivate once a room is solved.
    - **Rigged Terminal Collider**: Prevents players from clipping through status desks.
  - **Console Telemetry**: Correct Room 5 combination is output to the browser console for developer verification.

---

### Level 2: The Cipher Sanctuaries (4 Cognitive Sublevels & Environment Altering)

Level 2 features a dynamic **Atmospheric Environment Altering System** that adapts in real-time:
- **Environment Modes**:
  1. **Rustic Wood Atelier**: Full-screen textured mahogany backdrop (`wood_board.jpg`) with warm ambient candlelight and vignette.
  2. **Cyber Neon Grid**: Deep cosmic indigo void (`#0d0722`) with illuminated neon scanlines and floating gradient orbs.
  3. **Corrupted Glitch Matrix**: CRT scanline distortion with RGB chromatic aberration and animated digital pulses.
- **Dynamic Glitch Purge**: As the player clears sublevels, the environmental corruption clears progressively:
  `25% (Word Search) ➔ 50% (Memory Bot) ➔ 75% (Cadgy) ➔ 100% PURIFIED (Riddle Mastered)`.
- **Environment Switcher UI**: An ambient toggle pill in the Level 2 top header bar allows players to cycle the environmental state at will.

#### Sublevel 1: Dynamic Crossword / Word Search
- **Mechanics**: 12×12 letter matrix supporting **all 8 directional line angles**:
  - Horizontal (Left $\to$ Right, Right $\to$ Left)
  - Vertical (Top $\to$ Bottom, Bottom $\to$ Top)
  - Diagonal Down-Right, Diagonal Down-Left, Diagonal Up-Right, Diagonal Up-Left.
- **Crossword Intersections**: Shared letters across overlapping vocabulary words.
- **Thematic Variety**: 6 dynamic themes (*Cyber & Mainframe*, *Escape & Chamber*, *Cosmos & Dimensions*, *Cryptography*, *Neural AI*, *Alchemy*).
- **Controls**: Drag mouse or swipe touch with ratio-based angle classification snapping.

#### Sublevel 2: Memory Core Duel vs. GlitchBot
- **Mechanics**: Turn-based card-matching duel against an AI opponent with realistic memory retention.
- **Visuals**: Animated 3D card elevation matching two-player tabletop pick-up motion.
- **Custom Vector Graphics**: Ten hand-crafted SVG vector icons (butterfly, dice, star, shield, diamond, robot, rocket, lightning, heart, key).
- **HUD**: Real-time score tracker (`[CALLSIGN]: X • BOT: Y`) with turn indicators.

#### Sublevel 3: Double Cadgy 3D Column Alignment (OneLook Inspired)
- **Design & Inspiration**: Faithful reproduction of OneLook's Friday **Double Cadgy** puzzle format.
- **Grid Layout**: 5 vertical columns of 5 stacked tiles, requiring exactly 1 tile per column selected from left to right (Col 0 $\to$ Col 4).
- **3D Isometric Wooden Stacks**:
  - Tiles feature layered pseudo-3D drop-shadow edges simulating physical wooden block thickness.
  - Stacks exhibit variable heights based on remaining letter frequency.
  - **3D Mode Toggle**: Switch seamlessly between 3D stacked blocks and clean 2D view.
- **Lavender Hatch & Vector Connector String**:
  - Selected tiles lift in 3D (`-translate-y-2.5`), displaying lavender/violet diagonal hatching (`#c7c4f4` / `#b8b5e6`) with deep indigo typography.
  - A dynamic purple SVG vector string (`<polyline>`) connects the center of selected tiles across columns in real-time.
- **Heart Wildcard Tiles ($\text{♥}$)**:
  - Orange diagonal-pinstripe tiles with glowing pink hearts acting as **wildcards**.
  - Wildcard resolver automatically tests all candidate letters A-Z against target words and dictionary vocabulary.
- **Multi-Letter Tiles**:
  - Special composite tiles (`CI`, `EN`, `TH`, `ER`, `CH`) inserting multiple letters into words.
- **Gold Completion Tiles**:
  - Tiles that have all associated hidden words discovered permanently transform into shimmering **Gold Tiles** (`#f59e0b`).
- **Two-Tier Word Vocabulary**:
  - **Basic Words**: Everyday vocabulary (no clues needed initially).
  - **Bonus Words**: Difficult, obscure, specialized, literary vocabulary with definitions sorted alphabetically by answer.
  - **Dictionary Validation**: Any valid English 5-letter word formed across the 5 columns awards extra dictionary discovery points (+50).
- **Controls & Helpers**:
  - **Shuffle Button**: Scrambles the tile order within each column with a flip animation.
  - **Stopwatch Timer**: Tracks completion time.
  - **💡 Need a Hint?**: Reveals the first letter or definition clue for an unsolved word.
  - **? Help Modal**: In-game rules breakdown.
  - **Live Spelled Bar**: Displays active selection with blanks (`G L I S _`).
  - **Auto-Verification**: Validates instantly upon selecting 5 columns.

#### Sublevel 4: The Architect's Pinned Riddles
- **Aesthetic**: Pinned parchment memo attached to an authentic wooden board with a red pushpin.
- **Dynamic Dataset & Mock API**: 15+ thematic riddles fetched asynchronously via `fetchRiddlesDataset()`.
- **Word Connect Wheel**: Circular interactive letter wheel plus direct keyboard input.
- **Progression**: Solving all 3 riddles triggers a portal breach directly into Level 3.

---

### Level 3: The Gravity Anomaly (2D Retro Platformer)
- **Source**: Extracted and integrated from git branch `remotes/origin/dev2`.
- **Engine**: Low-resolution 320×180 virtual framebuffer with CRT bloom, scanlines, and glitch slice post-processing.
- **Mechanics**:
  - Instant **Gravity Inversion** (<kbd>G</kbd>) allowing the hero to walk on ceilings and clear spike gaps.
  - Variable jump heights with assist buffering.
  - Bitmask auto-tiling with rounded corner calculation.
  - Parallax cityscape background layers with illuminated windows.
  - Procedural 8-bit synthetic audio using Web Audio API oscillators.
- **Stages**:
  1. `1 WARM UP`: Spatial orientation and baseline jump timing.
  2. `2 SPIKE RUN`: Precision navigation across hazardous floor/ceiling spikes.
  3. `3 UPSIDE DOWN`: Extended inverted-gravity ceiling maneuvers.
  4. `4 THE WAY OUT`: Complex gauntlet leading to the glowing golden vortex portal.
- **Cyber Severance Blade Reward**: Conquering Stage 4 unlocks the **Cyber Severance Blade Acquisition Modal** displaying weapon telemetry (`ATK: 85`, `REACH: Extended Arc`, `SPECIAL: Corrupt Tether Severance`) before transitioning to Sector 4.

---

### Level 4: The Puppeteer Showdown (2.5D Nexus Boss Arena)

Sector 4 features a unified retro-cyberpunk HUD matching Level 3 aesthetics:
- **Phase 1: Glitch Drones Infiltration**
  - Six corrupted glitch drones spawn patrolling on moving platforms and firing glitch sparks.
  - Player slashes and destroys all 6 drones using the Cyber Severance Blade to breach perimeter security.
- **Phase 2: Jester Boss Platform Descent**
  - Defeating the minion wave triggers the descent of the main platform holding **The Glitch Jester** and the **Developer puppet** suspended by 3 electric tether nodes.
  - Player cuts through the 3 tether nodes to break the Jester's shield and deliver the final blow to free the developer.
- **XP Progression & Leveling**:
  - Earn XP by striking enemies, tethers, and the boss.
  - Leveling up triggers an overcharge visual flash and restores 1 life.
- **Hit Combo Multiplier**:
  - Consecutive strikes increment a combo counter (`COMBO: 4x`), multiplying attack damage before resetting after 2.5 seconds.
- **Lives System**:
  - 3 Lives represented by SVG shield/heart icons with invulnerability frames and game-over recovery.

---

## 4. Controls & Input Mapping

| Context | Action | Primary Key / Input | Secondary / Alternate |
| :--- | :--- | :--- | :--- |
| **All Levels** | **Interact / Advance** | <kbd>E</kbd> | Left Click |
| **Landing** | **Set Callsign** | Text Input | Auto-saved to `localStorage` |
| **Level 1 (3D)** | **Move** | <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | Arrow Keys |
| **Level 1 (3D)** | **Look Around** | Mouse Pointer Lock | Click canvas to capture |
| **Level 1 (3D)** | **Jump** | <kbd>Space</kbd> | — |
| **Level 1 (3D)** | **Keypad Entry** | Numeric Keys <kbd>0</kbd>–<kbd>9</kbd> | Virtual Buttons (<kbd>Enter</kbd> submit) |
| **Level 2 (2D)** | **Word Search** | Click & Drag Mouse | Touch Drag (All 8 directions) |
| **Level 2 (2D)** | **Cadgy Select** | Column Tile Click | 1 per column (0 to 4) |
| **Level 2 (2D)** | **Cadgy Shuffle** | Click Shuffle Button | Shuffles tile order |
| **Level 2 (2D)** | **Cadgy 3D Mode** | Click 3D Toggle Button | 3D Stacks $\leftrightarrow$ 2D View |
| **Level 2 (2D)** | **Cycle Environment**| Click `ENV:` Header Pill | Wood $\to$ Cyber $\to$ Glitch |
| **Level 2 (2D)** | **Word Connect** | Circular Wheel Click | Direct Keyboard Typing |
| **Level 3 (2D)** | **Run Left / Right** | <kbd>A</kbd> / <kbd>D</kbd> | <kbd>←</kbd> / <kbd>→</kbd> |
| **Level 3 (2D)** | **Jump** | <kbd>Space</kbd> | Variable jump height |
| **Level 3 (2D)** | **Invert Gravity** | <kbd>G</kbd> | Floor $\leftrightarrow$ Ceiling |
| **Level 3 (2D)** | **Respawn** | <kbd>R</kbd> | Restarts current stage |
| **Level 4 (2.5D)**| **Run Left / Right** | <kbd>A</kbd> / <kbd>D</kbd> | <kbd>←</kbd> / <kbd>→</kbd> |
| **Level 4 (2.5D)**| **Jump** | <kbd>W</kbd> or <kbd>Space</kbd> | <kbd>↑</kbd> |
| **Level 4 (2.5D)**| **Slash Attack** | <kbd>F</kbd> / Left Click | Cyber Blade Strike |
| **Level 4 (2.5D)**| **Glitch Dash** | <kbd>Shift</kbd> | Quick Invulnerable Dash |

---

## 5. System Architecture & Tech Stack

```
d:/Gaming/glitch/src/
├── App.jsx                     # Narrative Director: Root Scene State Machine & Callsign
├── main.jsx                    # Application Entrypoint
├── index.css                   # Global Tailwind utility directives
├── assets/                     # 3D .glb models, ambient videos, audio assets
│   └── level2/                 # wood_board.jpg, reference captures
├── components/                 # Level-specific UI & game subsystems
│   ├── IntroVideo.jsx          # Opening cinematic with bottom-right skip button
│   ├── FiveRoomsInterior.jsx   # 3D meshes & procedural walls for Level 1
│   ├── RoomController.jsx      # Collision handling, door animations & interaction checks
│   ├── RoomDoor.jsx            # One-way threshold colliders & keypad trigger logic
│   ├── RobloxHUD.jsx           # Topbar, hearts, 2-minute timer, diamonds & badges
│   ├── RobloxKeypadModal.jsx   # Accessible keypad modal with keyboard support
│   ├── NoteModal.jsx           # Inspectable manuscript fragment modal
│   ├── WordSearchGame.jsx      # 8-direction crossword engine with angle snapping
│   ├── MemoryCardGame.jsx      # Turn-based card duel with custom vector icons
│   ├── CadgyWordGame.jsx       # 5-column Double Cadgy 3D stacked tiles & vector string
│   ├── RiddleBoardGame.jsx     # Wooden memo board with circular Word Connect wheel
│   └── LevelFourGame.jsx       # 2.5D canvas boss gauntlet with minion wave & Jester descent
├── data/                       # Dynamic datasets & mock APIs
│   ├── wordSearchThemes.js     # 6 diverse word search categories with crossword logic
│   ├── cadgyBoards.js          # Double Cadgy boards with 3D depths, wildcards & definitions
│   └── riddlesDataset.js       # 15+ thematic riddles with asynchronous fetch API
├── level3_gravity/             # 2D Retro Gravity-Flip Platformer Engine (from dev2)
│   ├── game.js                 # 60 FPS update/draw loop, hazard collisions, exits
│   ├── render.js               # Low-res 320x180 buffer, CRT bloom, glitch slices
│   ├── input.js                # Keyboard input manager with input-tag immunity
│   ├── audio.js                # Generative pentatonic synth & 8-bit sound effects
│   ├── levels.js               # Bitmapped level matrices for stages 1 to 4
│   ├── tiles.js                # Dynamic procedural bitmask autotiler
│   ├── sprites.js              # Pixel-baked animated hero frames
│   ├── parallax.js             # Multi-layered procedural parallax cityscape
│   ├── settings.js             # Video shaders, palette, assist settings
│   └── ui.js                   # Pixel-font rendering & menu system
├── scenes/                     # Primary Scene Controllers
│   ├── HubScene.jsx            # 3D threshold portal & manuscript
│   ├── RoomScene.jsx           # Level 1 controller (5 rooms, codes, timer, lives)
│   ├── LevelTwoScene.jsx       # Level 2 controller (Environment Altering & 4 sublevels)
│   ├── LevelThreeScene.jsx     # Level 3 controller (Dev2 Gravity Platformer & Sword Reward)
│   └── LevelFourScene.jsx      # Level 4 controller (Boss fight & victory epilogue)
└── utils/                      # Helper modules
    ├── AudioEngine.js          # Synthesized Web Audio API sound FX
    └── LevelManager.js         # Procedural code & golden digit generator
```

---

## 6. Testing & Quality Assurance Suite

To facilitate rapid testing, grading, and demonstration, the game provides dedicated developer tools:
1. **Skip Sublevel & Skip Level Controls**:
   - Every level and sublevel provides clean, accessible skip buttons (`Skip Sublevel ➔` and `Skip Level ➔`) located in top navigation headers.
2. **Cheat Button Elimination**:
   - All artificial auto-solve buttons have been removed from the user interface to preserve game integrity.
3. **Console Telemetry**:
   - Room 5 combination digits, golden code permutations, and word search answers are logged to the browser developer console (`F12`).
4. **SVG Vector Standard**:
   - All legacy system emojis have been replaced with sharp, scalable SVG icons that render consistently across all platforms and operating systems.

---

## 7. Installation & Running Locally

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/PratikshaKushwaha/glitchVerse.git

# 2. Navigate to project root
cd glitch

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

### Production Build

```bash
# Build production bundle with Vite
npm run build

# Preview production build locally
npm run preview
```

---

## 8. Authors & Credits

- **Hackathon**: PS01 GlitchVerse — *The World Is Broken*
- **Design & Engineering**: Developed by the team for GlitchVerse 2026.
- **Narrative Lore**: *The Way Out* universe.
