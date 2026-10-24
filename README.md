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

Through an interconnected sequence of **4 distinct sectors**, players progress from **3D escape-room exploration**, to **cryptographic linguistic puzzles**, to **2D retro gravity-inversion platforming**, culminating in a **fast-paced 2D platformer boss battle** where they must sever the puppet strings of a rogue AI to liberate the game's trapped Developer.

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
   │        LEVEL 2        │  4 Cipher & Cognition Sublevels
   │   Cipher Sanctuaries  │  • Word Search, Memory Bot, Cadgy, Riddles
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │        LEVEL 3        │  2D Retro Gravity-Flip Platformer
   │  The Gravity Anomaly  │  • 4 Stages, spike hazards, parallax void
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │        LEVEL 4        │  2D FPS Boss Battle: The Glitch Jester
   │ The Puppeteer Showdown│  • Moving platforms, tether nodes, liberation
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
2. Reconstruct the computational logic matrices in Sector 2 across **4 cryptographic trials**.
3. Overcome Sector 3's **gravitational collapse** by navigating inverted spatial coordinates.
4. Penetrate the Core Chamber in Sector 4, sever the **3 tether nodes**, defeat the Jester in blaster combat, and set the Author free.

---

## 3. Level-by-Level Breakdown

### Level 1: The Corrupted Vaults (3D Escape Room)
- **Engine**: Three.js, React Three Fiber, Drei, PointerLockControls.
- **Environment**: 5 interconnected sequential rooms with physical furniture, desks, walls, and rigid colliders.
- **Core Loop**:
  - Search rooms for paper notes, drawer fragments, and wall markings containing 4-digit codes.
  - In 3 randomly chosen rooms, one digit glows in **radiant gold**. Players must memorize these 3 distinct golden digits.
  - **Room 5 (Master Vault)**: Requires the exact 3-digit permutation of the golden digits ($3! = 6$ combinations).
  - **Constraints**:
    - **2-Minute Global Countdown**: Players must solve all 5 rooms before time expires.
    - **3 Shield Lives**: Incorrect vault guesses deplete lives. Losing all 3 lives resets the run with newly randomized codes.
    - **One-Way Directional Doors**: Doors only allow entry from the front face; keypads deactivate once a room is solved.
    - **Rigged Terminal Collider**: Prevents players from walking through status desks.
  - **Console Telemetry**: Correct Room 5 combination is output to the browser console for developer verification.

---

### Level 2: The Cipher Sanctuaries (4 Cognitive Sublevels)

#### Sublevel 1: Dynamic Crossword / Word Search
- **Mechanics**: 12×12 letter matrix with **8 directional lines**:
  - Horizontal (Left $\to$ Right, Right $\to$ Left)
  - Vertical (Top $\to$ Bottom, Bottom $\to$ Top)
  - Diagonal Down-Right, Diagonal Down-Left, Diagonal Up-Right, Diagonal Up-Left.
- **Crossword Logic**: Shared intersection letters across overlapping words.
- **Thematic Variety**: 6 dynamic themes (*Cyber & Mainframe*, *Escape & Chamber*, *Cosmos & Dimensions*, *Cryptography*, *Neural AI*, *Alchemy*).
- **Controls**: Mouse drag or touch swipe with angle snapping.
- **Progression**: Automatic transition upon locating all words.

#### Sublevel 2: Memory Core Duel vs. GlitchBot
- **Mechanics**: Turn-based card-matching duel against an AI opponent with realistic memory retention.
- **Visuals**: Animated 3D card elevation matching two-player tabletop pick-up motion.
- **HUD**: Dynamic score tracker (`[CALLSIGN]: X • BOT: Y`) and turn indicator.

#### Sublevel 3: Double Cadgy 3D Column Alignment
- **Mechanics**: 5 columns of 5 stacked tiles inspired by the Cadgy puzzle format.
- **Auto-Verification**: Selecting 5 letters immediately validates against Basic Words and Bonus Words.
- **Seamless Advance**: Once all 3 basic words are solved, the game celebrates and auto-advances without requiring a manual finish button.
- **Dynamic Boards**: Random selection from multiple curated boards (*Classic Way Out*, *Cyber Mainframe*, *Quantum Vault*, *Glitch Shift*).

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
- **Transition**: Reaching the Stage 4 portal triggers automatic progression to Level 4.

---

### Level 4: The Puppeteer Showdown (2D FPS Boss Battle)
- **Arena**: Multi-tiered floating platforms moving along horizontal and vertical axes above the digital void.
- **Boss**: **The Glitch Jester** hovering on a command platform, holding the **Author/Developer** by 3 glowing holographic cords.
- **Combat Mechanics**:
  - **Mouse-Aim FPS Blaster**: Fire energetic projectile bolts directly toward the mouse cursor.
  - **Double Jump & Glitch Dash** (<kbd>Shift</kbd>): Invulnerability frames with neon particle trails.
  - **EMP Pulse Wipe** (<kbd>E</kbd> / <kbd>Q</kbd>): Erases incoming enemy projectiles in a wide blast radius.
- **Boss Phases**:
  - *Phase 1 (The Puppet Tethers)*: Boss is shielded. Player must target and destroy all 3 tether nodes.
  - *Phase 2 (The Developer Freed)*: Shield collapses. Player damages the Jester directly.
  - *Phase 3 (Overdrive Enrage)*: Below 35% HP, the Jester unleashes rapid card spreads and chaos barrages.
- **Narrative Dialogue**: In-game speech popups addressing the player by their chosen callsign during key moments.
- **Finale**: Defeating the Jester triggers the Developer Liberation sequence and S-Rank completion epilogue.

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
| **Level 2 (2D)** | **Word Connect** | Circular Wheel Click | Direct Keyboard Typing |
| **Level 3 (2D)** | **Run Left / Right** | <kbd>A</kbd> / <kbd>D</kbd> | <kbd>←</kbd> / <kbd>→</kbd> |
| **Level 3 (2D)** | **Jump** | <kbd>Space</kbd> | Variable jump height |
| **Level 3 (2D)** | **Invert Gravity** | <kbd>G</kbd> | Floor $\leftrightarrow$ Ceiling |
| **Level 3 (2D)** | **Respawn** | <kbd>R</kbd> | Restarts current stage |
| **Level 4 (2D)** | **Platform Move** | <kbd>A</kbd> / <kbd>D</kbd> | <kbd>←</kbd> / <kbd>→</kbd> |
| **Level 4 (2D)** | **Jump / Double Jump**| <kbd>W</kbd> or <kbd>Space</kbd> | <kbd>↑</kbd> |
| **Level 4 (2D)** | **Aim & Shoot Blaster**| Mouse Cursor Position | Left Mouse Button |
| **Level 4 (2D)** | **Glitch Dash** | <kbd>Shift</kbd> | Right Mouse Button |
| **Level 4 (2D)** | **EMP Pulse Wipe** | <kbd>E</kbd> / <kbd>Q</kbd> | Projectile Eraser |

---

## 5. System Architecture & Tech Stack

```
d:/Gaming/glitch/src/
├── App.jsx                     # Narrative Director: Root Scene State Machine & Callsign
├── main.jsx                    # Application Entrypoint
├── index.css                   # Global Tailwind utility directives
├── assets/                     # 3D .glb models, ambient videos, audio assets
├── components/                 # Level-specific UI & game subsystems
│   ├── IntroVideo.jsx          # Opening cinematic with bottom-right skip button
│   ├── FiveRoomsInterior.jsx   # 3D meshes & procedural walls for Level 1
│   ├── RoomController.jsx      # Collision handling, door animations & interaction checks
│   ├── RoomDoor.jsx            # One-way threshold colliders & keypad trigger logic
│   ├── RobloxHUD.jsx           # Topbar, hearts, 2-minute timer, diamonds & badges
│   ├── RobloxKeypadModal.jsx   # Accessible keypad modal with keyboard support
│   ├── NoteModal.jsx           # Inspectable manuscript fragment modal
│   ├── WordSearchGame.jsx      # 8-direction crossword engine with angle snapping
│   ├── MemoryCardGame.jsx      # Turn-based card duel with 3D elevation
│   ├── CadgyWordGame.jsx       # 5-column Cadgy puzzle with auto-verification
│   ├── RiddleBoardGame.jsx     # Wooden memo board with circular Word Connect wheel
│   └── LevelFourGame.jsx       # 2D canvas boss battle with moving platforms & FPS blaster
├── data/                       # Dynamic datasets & mock APIs
│   ├── wordSearchThemes.js     # 6 diverse word search categories with crossword logic
│   ├── cadgyBoards.js          # Multiple 5-column stacked tile boards
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
│   ├── LevelTwoScene.jsx       # Level 2 controller (4 sequential sublevels)
│   ├── LevelThreeScene.jsx     # Level 3 controller (Dev2 Gravity Platformer)
│   └── LevelFourScene.jsx      # Level 4 controller (Boss fight & victory epilogue)
└── utils/                      # Helper modules
    ├── AudioEngine.js          # Synthesized Web Audio API sound FX
    └── LevelManager.js         # Procedural code & golden digit generator
```

---

## 6. Modern Web & Accessibility Implementation

The user interface follows modern web platform best practices:

1. **Scroll-Chaining Prevention Under Modals (`prevent-page-scroll-under-modal-dialog`)**:
   All dialog overlays ([`NoteModal.jsx`](file:///d:/Gaming/glitch/src/components/NoteModal.jsx), [`RobloxKeypadModal.jsx`](file:///d:/Gaming/glitch/src/components/RobloxKeypadModal.jsx)) implement CSS `overscroll-behavior: contain` to prevent scroll chaining to the underlying canvas without mutating global `body` overflow.
2. **Accessible Dialog Semantics**:
   Overlays are equipped with `role="dialog"`, `aria-modal="true"`, explicit `aria-labelledby` headings, and buttons with descriptive `aria-label` tags.
3. **Fluid Directional Snapping**:
   The Word Search engine uses ratio-based angle classification to ensure smooth, responsive diagonal dragging across all 4 quadrants without input jitter.
4. **Input Element Protection**:
   Key-capture listeners explicitly check `e.target.tagName !== 'INPUT'` to prevent game hotkeys from interrupting player name customization.

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
