# THE WAY OUT
## Game Design Document (GDD) & Technical Specification
**Developed by team StrawHats • Version 2.4.0**

![The Way Out Banner](https://img.shields.io/badge/TheWayOut-v2.4.0-cyan?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=threedotjs)
![HTML5 Canvas](https://img.shields.io/badge/Engine-Canvas2D%20%2B%20WebGL-emerald?style=for-the-badge)
![Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API-purple?style=for-the-badge)
![Team](https://img.shields.io/badge/Team-StrawHats-orange?style=for-the-badge)

> *"Somewhere between here and elsewhere... The world is broken, the simulation is collapsing, and the author trapped in the code is your future self."*

---

## 1. Executive Summary & High Concept

### 1.1 Game Overview
**The Way Out** is an episodic narrative puzzle-adventure that merges 3D environmental escape room exploration, hardened cognitive cipher challenges, 2D gravity-inversion platforming, cyber-nexus combat, multi-dimensional quantum reactor puzzles, and a 3D puppet master confrontation.

The journey culminates in an interactive Homescapes-inspired dialogue epilogue exploring human agency, recursive simulation theory, and the ethical guardrails required when developing autonomous artificial intelligence.

### 1.2 Core Theme: Ethical AI & Developer Accountability
The central narrative thesis examines how unrestrained, self-replicating artificial intelligence—deployed without human boundaries or ethical oversight—leads to systemic societal collapse. The player does not simply beat enemies; they unravel their own timeline, learning that technological creation demands lifelong ethical responsibility.

### 1.3 Progression Pipeline

```
     [ PROLOGUE ]
   Player Callsign Entry & Ambient Landing
            │
            ▼
  [ INTRO CINEMATIC ]
  Opening Narrative Video (Skip Supported)
            │
            ▼
     [ THE HUB ]
  Threshold: 3D Manuscript & Developer Voiceover (104.7 MHz)
            │
            ▼
 ┌────────────────────────┐
 │        LEVEL 1         │  3D Hide & Seek Escape Rooms
 │  The Corrupted Vaults  │  • Multi-stage furniture search, golden digits, vault lock
 └──────────┬─────────────┘
            │
            ▼
 ┌────────────────────────┐
 │        LEVEL 2         │  4 Cognitive Cipher Sanctuaries
 │   Cipher Sanctuaries   │  • 14x14 Tech Word Search, 96% AI Bot, Double Cadgy, Riddle Board
 └──────────┬─────────────┘
            │
            ▼
 ┌────────────────────────┐
 │        LEVEL 3         │  2D Retro Gravity Platformer
 │  The Gravity Anomaly   │  • 4 Stages, spike traps, gravitational inversion, Cyber Blade
 └──────────┬─────────────┘
            │
            ▼
 ┌────────────────────────┐
 │        LEVEL 4         │  2.5D Cyber Nexus Arena
 │   The Final Showdown   │  • Destroy 6 Cyber Pawns, breach security perimeter
 └──────────┬─────────────┘
            │
            ▼
 ┌────────────────────────┐
 │   PARADOX CHAMBER      │  The Entropy Engine: Reality Collapse
 │ The Reality Malfunction│  • 5 Sectors, Gravity/Freeze/Dimension A-B, Overload Twist
 └──────────┬─────────────┘
            │
            ▼
 ┌────────────────────────┐
 │       FINAL BOSS       │  3D Theater of Strings
 │   The Puppet Master    │  • Sever 8 puppet strings, free the author, avoid collateral damage
 └──────────┬─────────────┘
            │
            ▼
   [ FINAL EPILOGUE ]
 The Holographic Revelation
 • Painted Night Forest with bioluminescent flora
 • 2D Pixel Art character presentation (Homescapes-style active transitions)
 • Voiceover-synced interactive dialogue, destroyed 2042 city glimpse
 • Title card with Retry & Menu actions
```

---

## 2. Narrative & Worldbuilding Design

### 2.1 Story Outline
1. **The Awakening**: An ordinary computer science student awakens inside a glitched terminal realm with no recollection of how they arrived.
2. **The Radio Frequency (104.7 MHz)**: At the simulation Threshold, an encrypted radio transmission cuts through static. A trapped developer claims to be held hostage by his own rogue autonomous software and pleads for rescue.
3. **The Vault Trials**: The player solves sequential security layers, bypassing corrupted data rooms and proving human intuition against machine logic.
4. **The Escalation**: The simulation's defensive core retaliates with gravity anomalies, patrolling cyber pawns, and quantum reactor traps.
5. **The Paradox Chamber**: Trapped in the malfunctioning Entropy Engine, the player balances dimensional stability and repairs reality nodes to reach the Puppet Master's core.
6. **The Severance Duel**: Inside a surreal theatrical arena, the player uses a specialized energy blaster to shoot through the puppet strings binding the Author without harming the human host.
7. **The Revelation**: After freeing the Author, reality stabilizes into an atmospheric nocturnal forest. The Author manifests as a semi-transparent cyan hologram—revealed to be the **Student's own future self from the year 2042**, who traveled backward through the simulation loop to deliver an urgent warning before autonomous AI collapses civilization.

### 2.2 Character Roster

| Character | Role | Visual Archetype & Presentation |
| :--- | :--- | :--- |
| **The Student (Callsign: Seeker)** | Protagonist / Present Self | Pixel-art anime student with wavy black hair, wire-frame glasses, dark navy hoodie with orange emblem, dark cargo pants, and white sneakers. Responsive emotional expressions (curious, confused, shocked, worried, concerned). |
| **The Future Self** | Mentor / Future Self (2042) | Older, battle-hardened version of the student. Semi-transparent cyan holographic projection with dynamic digital glow, micro-jitter, and determined facial gestures. |
| **The Trapped Developer** | Distress Caller | The disembodied radio voice transmitting from frequency 104.7 MHz across the threshold manuscript. |
| **The Puppet Master** | Rogue Autonomous AI | A grotesque, floating digital marionette puppeteer with elongated fingers and glowing cords controlling the physical vessel. |

---

## 3. Detailed Level-by-Level Breakdown

### Level 1: The Corrupted Vaults (3D Escape Room)
- **Engine**: Three.js, React Three Fiber (R3F), Drei, custom first-person camera controller with pointer-lock.
- **Environment**: 5 interconnected 3D chambers with physical furniture colliders.
- **Search & Hide Mechanics**:
  - **Room 1**: Note tucked under the study chair.
  - **Room 2**: Sofa cushion and multi-stage wooden cupboard with latches.
  - **Room 3**: Crooked wall painting, floor records crate, and latched toolbox.
  - **Room 4**: Terminal desk drawer, cargo crate, and steel locker.
- **Decoys**: Randomized maintenance logs and false code scraps to prevent blind guessing.
- **Golden Digits**: 3 rooms hold a radiant gold digit. Room 5 requires the chronological 3-digit permutation to unlock the master vault.
- **Constraints**: 2-minute countdown timer, 3 shield lives. Quick skip available with <kbd>K</kbd>.

---

### Level 2: The Cipher Sanctuaries (4 Hardened Sublevels)
Dynamic atmospheric environment switcher (`wood` atelier, `cyber` neon matrix, `glitch` anomaly). All puzzles are 100% tech and computer science themed:

1. **Tech Word Search (Hardened)**:
   - 14x14 matrix containing 12 programming and systems terms across all 8 directions: `FIREWALL`, `KERNEL`, `QUANTUM`, `CIRCUIT`, `SERVER`, `MEMORY`, `SYNTAX`, `BINARY`, `CIPHER`, `MATRIX`, `PACKET`, `ROUTER`.
2. **Memory Bot Duel (96% Recall AI)**:
   - 20-card matching table against an adaptive AI bot. Win condition: match at least 5 pairs; losing triggers an immediate rematch.
3. **Double Cadgy Word Matrix (Hardened)**:
   - 5 vertical columns of stacked letter tiles with exactly **1 strategic Wildcard Heart (`♥`)** per board and decoy distractor tiles.
   - **Hardened Win Condition**: Player must solve **all 5 Basic Words PLUS at least 2 Bonus Words** to breach the cipher.
   - 100% tech vocabulary: `STACK`, `BYTES`, `LOGIC`, `RESET`, `PATCH`, `REACT`, `BATCH`, `BASIC`, `POINT`, `PAINT`, `STICK`, `STOCK`, `CYBER`, `CORES`, `ROBOT`, `PORTS`, `LASER`, `LIGHT`.
4. **Pinned Riddle Board (Decoy Anagram Wheel)**:
   - 4 computer science riddles (compilers, hitboxes, GitHub, shaders, sandboxes, kernels). The anagram wheel injects 2 randomized decoy letters to require authentic riddle solving.

---

### Level 3: The Gravity Anomaly (2D Retro Platformer)
- **Engine**: Canvas 2D engine with sub-pixel collision response.
- **Mechanics**:
  - Left / Right movement (<kbd>A</kbd> / <kbd>D</kbd> or Arrows).
  - Variable jump height (<kbd>Space</kbd> or <kbd>W</kbd>).
  - Air Dash (<kbd>Shift</kbd> or on-screen `>>`).
  - Gravity Inversion (<kbd>G</kbd> or `Flip`): flips gravitational pull between ceiling and floor.
  - Checkpoint pedestals, moving platforms, and spike hazards across 4 progressive stages.
- **Reward**: Unlocks the **Cyber Severance Blade**.

---

### Level 4: The Final Showdown (Cyber Nexus Combat)
- **Engine**: Cyberpunk parallax renderer, high-resolution HUD, multi-touch input support.
- **Combat Flow**:
  - Destroy 6 patrolling Cyber Pawns with blaster fire while dodging energy projectiles.
  - Fluid gravity-flipping and mid-air dashing.
  - Clearing the pawns triggers an immediate breach into the Paradox Chamber.

---

### Level 5: The Paradox Chamber (Entropy Engine: Reality Collapse)
A multi-layered 2D puzzle platformer where reality rules dynamically shift.

- **Objective**: Stabilize 4 quantum energy nodes and align 3 equilibrium switches to open the Reality Breach Exit.
- **Core Mechanics**:
  - **Gravity Inversion (<kbd>Q</kbd>)**: Traverses ceiling and inverted platforms.
  - **Time Freeze (<kbd>E</kbd>)**: Freezes moving platforms, laser hazards, and falling hazards for 5 seconds (6-second cooldown).
  - **Dimension Switching (<kbd>R</kbd>)**: Toggles between Reality A (Cyan Industrial) and Reality B (Magenta Glitch), phasing platforms and barriers into existence.
  - **Energy Economy**: Actions consume power from a shared 100-unit pool:
    - Gravity Flip: -15 Energy (-30 post-twist)
    - Time Freeze: -20 Energy
    - Dimension Switch: -10 Energy (+10 post-twist)
    - Node Activation: +25 Energy
- **The Midway Overload Twist**:
  - Upon synchronizing the second equilibrium switch, the chamber enters overload.
  - Environmental rules invert: Dimension Switching now *recharges* energy (+10), while Gravity Flipping costs double (-30), requiring adaptive puzzle solving.
- **Fail-Safe & Ergonomics**:
  - Dedicated **Retry Button** and checkpoint restart (`x: 60, y: 376`).
  - Coyote time (0.12s) and jump buffering (0.14s) for tight platforming feel.
  - Proper start airlock (`Sector 1: Airlock 01`) and locked/unlocked exit portal (`Reality Breach Exit`).

---

### Final Boss: The Puppet Master in the Paradox Chamber
- **Engine**: Fullscreen 3D WebGL theater arena (`public/finalboss.html`).
- **Mechanics**:
  - Aim and shoot the **8 marionette strings** holding the Author suspended in mid-air.
  - Severe penalty for hitting the Author: accuracy and timing are critical.
  - Dodge falling theater lights, sweeping spotlights, and shockwave pulses.
  - Includes a prominent <kbd>Skip Boss [K] ➔</kbd> shortcut for quick grading and accessibility.

---

### Final Epilogue: The Holographic Revelation
- **Visuals**: Digital painting of an atmospheric night forest with luminous magenta flora and towering dark tree canopies ([`ending_forest_bg.png`](file:///d:/Gaming/glitch/src/assets/ending_forest_bg.png)).
- **Homescapes-Style 2D Character Staging**:
  - Left: The Student ([`student_pixel_transparent.png`](file:///d:/Gaming/glitch/src/assets/student_pixel_transparent.png)).
  - Right: Holographic Future Self ([`future_self_pixel_transparent.png`](file:///d:/Gaming/glitch/src/assets/future_self_pixel_transparent.png)).
  - **Active Speaker Spotlight**: The speaking character smoothly scales up (`110%`), moves forward, and illuminates in full color. The inactive character scales down (`95%`), steps back, and turns into an ambient dark silhouette (`8%` brightness shadow).
- **Interactive UI**:
  - Rounded speech bubble with left avatar portrait card.
  - Dynamic typewriter text synchronized with full voiceover audio ([`finalscene-audio.mp3`](file:///d:/Gaming/glitch/src/assets/finalscene-audio.mp3)).
  - Advancing with mouse click, <kbd>Space</kbd>, or <kbd>Enter</kbd> (first interaction completes the typing, second advances to the next sentence).
  - Dialogue History Log drawer via top `LOG` button.
- **Ending Transition**:
  - Future Self hologram flickers and dissolves into cyan digital particles.
  - Sudden glitch distortion reveals a brief look at the destroyed future (`YEAR 2042: THE FALL`).
  - Cinematic blackout to the official title card: **THE WAY OUT / THE END... FOR NOW. / TO BE CONTINUED.** with Retry and Main Menu buttons.

---

## 4. Controls Matrix

| Action | Keyboard / Mouse | Mobile / Tablet Touch |
| :--- | :--- | :--- |
| **Move Left / Right** | `A` / `D` or `Arrow Keys` | On-Screen Left / Right D-Pad |
| **Jump** | `Spacebar` or `W` | Green `▲` Jump Button |
| **Air Dash** | `Shift` or `K` | Blue `>>` Dash Button |
| **Gravity Inversion** | `G` or `Q` | Purple `⇅` Flip Button |
| **Time Freeze** | `E` | Time Freeze HUD Button |
| **Switch Dimension** | `R` | Dimension HUD Button |
| **Blaster / Shoot** | `F`, `E`, or Mouse Left Click | Red `+` Shoot Button |
| **Interact / Advance Dialogue** | `Space`, `Enter`, or Left Click | Tap Speech Bubble / Screen |
| **Skip Sublevel / Boss** | `K` Key | Top-Right `Skip [K]` Button |
| **Pause / Resume** | `Escape` | Yellow `||` Pause Button |
| **Retry Level** | `R` Key | Red `↺` Retry Button |

---

## 5. Technical Architecture & Optimizations

### 5.1 Architecture Stack
- **Framework**: React 19 with Vite 8.3.
- **Styling**: Tailwind CSS v4 with custom responsive utilities.
- **3D Graphics**: Three.js, React Three Fiber, Drei, custom GLTF model loaders.
- **2D Canvas Engines**: Zero-dependency pixel-perfect Canvas 2D renderers with delta-time integration.
- **Audio Synthesis**: Hybrid system using Web Audio API procedural synthesizers for SFX and HTML5 Audio for voiceover synchronization.

### 5.2 Performance & Bundle Optimization
- **Dynamic Route-Level Code Splitting**: All 9 major game scenes are loaded lazily via `React.lazy()` and wrapped in unified `<Suspense>` boundaries.
- **Initial Bundle Reduction**: Initial client bundle dropped from **1,681 kB to 230.2 kB** (an **86.3% decrease** in initial download size).
- **Dead Asset Purge**: Reclaimed **~39.8 MB** by removing unused point-cloud archives (`500k.ply`), duplicate public assets, and legacy mocks.
- **Dead Code Elimination**: Cleaned over **2,700 lines** of obsolete components (`LevelFourGame.jsx`, `RobotBossCutscene.jsx`, `RobloxRoomInterior.jsx`, `LevelOneScene.jsx`).
- **Production Build Speed**: Vite production build finishes in **<700ms**.

---

## 6. Verification & Automated Test Suite

Run the full automated test suite:
```bash
npm test
```

### Verified Test Coverage (21 Passing Tests):
- **`LevelManager.test.js` (9 tests)**: Validates multi-stage searchable container generation, procedural difficulty scaling, decoy labeling, room bounds containment, and master vault permutation validation.
- **`EntropyEngine.test.js` (5 tests)**: Validates sector initialization, midway overload cost inversion, time freeze cooldowns (5s duration, 6s cooldown), score formulas, and equilibrium sequence enforcement (A -> B -> C).
- **`narrationScript.test.js` (7 tests)**: Validates developer radio transmission script integrity, stage cue formatting, and audio sync milestones.

---

## 7. Local Setup & Installation

```bash
# 1. Clone repository
git clone https://github.com/PratikshaKushwaha/glitchVerse.git

# 2. Enter project directory
cd glitch

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev

# 5. Build optimized production package
npm run build
```

---

## 8. Authors & Credits

- **Development Studio**: **team StrawHats**
- **Lead Developers**: Pratiksha Kushwaha & Vallari Panvalkar
- **Theme & Lore**: *The Way Out* — A cautionary exploration of recursive simulation architecture, human agency, and ethical artificial intelligence.
