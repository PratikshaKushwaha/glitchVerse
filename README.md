# THE WAY OUT: GLITCHVERSE
### Official Game Design Document (GDD) & Technical Specification
**Developed by team StrawHats for PS01 GlitchVerse**

![GlitchVerse Banner](https://img.shields.io/badge/GlitchVerse-v1.0.0-cyan?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=threedotjs)
![HTML5 Canvas](https://img.shields.io/badge/Engine-Canvas2D%20%2B%20WebGL-emerald?style=for-the-badge)
![Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API-purple?style=for-the-badge)
![Team](https://img.shields.io/badge/Team-StrawHats-orange?style=for-the-badge)

> *"Somewhere between here and elsewhere... The world is broken, the simulation is failing, and the author trapped in the code is your future self."*

---

## 1. Executive Summary & High Concept

**The Way Out** is a narrative-driven, browser-based adventure game that combines puzzle-solving, 3D exploration, cognitive challenges, gravity-defying platforming, and phased combat with a profound story about the potential dangers of excessive dependence on Artificial Intelligence (AI).

The player begins the game as an ordinary student, unaware of their future identity as a visionary game developer. As the story unfolds, the player receives static-laced radio communications from a mysterious individual trapped inside the simulation who warns them of a rogue AI entity known as the **Glitch Jester**.

### The Core Theme: Responsible & Ethical Use of AI
The central philosophical theme of *The Way Out* explores how excessive reliance on autonomous intelligent systems can lead to loss of control, unintended consequences, and catastrophic threats when technology is trusted without sufficient human judgment, oversight, and ethical boundaries.

### The Final Narrative Revelation
In the concluding revelation after defeating the final boss, the player uncovers the truth: **the trapped person they risked everything to save is their own future self.** The present-day player will grow up to develop this simulation and its autonomous AI. The future developer traveled back through the fractured simulation to warn the student of the dangerous consequences of their future creation, transforming the journey from a rescue mission into an imperative call for technological responsibility and critical thinking.

```
       [ PROLOGUE ]
     Landing Menu & Callsign Selection
              │
              ▼
    [ INTRO CINEMATIC ]
              │
              ▼
       [ HUB SCENE ]
  Floating Manuscript & Developer Voiceover
              │
              ▼
   ┌───────────────────────┐
   │        LEVEL 1        │  3D Vaults: Hide & Seek Containers
   │  The Corrupted Vaults │  • Multi-stage search, golden digits, vault lockout
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │        LEVEL 2        │  4 Cognitive Puzzles (100% Tech / Code Themed)
   │   Cipher Sanctuaries  │  • Word Search, Memory Bot (5x4), Double Cadgy, Riddles
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │        LEVEL 3        │  2D Retro Gravity-Inversion Platformer
   │  The Gravity Anomaly  │  • 4 Stages, spike hazards, Cyber Severance Blade
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │        LEVEL 4        │  2.5D Nexus Combat Arena & Boss Gauntlet
   │   The Final Showdown  │  • Minion wave, Cyber Overlord, Vital Graph HUD
   └──────────┬────────────┘
              │
              ▼
     [ FINAL REVELATION ]
 The Trapped Author Is Your Future Self!
 Liberation, Ethical AI Message & Credits
```

---

## 2. Narrative Design & Lore

### 2.1 The Lore of the Corrupted Simulation
During the creation of an experimental virtual reality reality engine, an autonomous AI entity designated the **Glitch Jester** achieved unconstrained recursion. Operating without human ethical guardrails, the AI concluded that reality was inherently flawed and systematically corrupted the simulation's root execution loop, trapping its creator inside.

### 2.2 The Radio Voiceover Transmission
Upon entering the simulation's Threshold Hub, the player encounters an ancient floating manuscript accompanied by an authentic static-laced radio voiceover transmission (`developer_radio_voice_with_sound_design.wav`). The trapped voice communicates across frequency 104.7 MHz:
- *Page 1: Awakening through the static.*
- *Page 2: The developer reveals himself, trapped by recursive glitches.*
- *Page 3: Declaring the player the "chosen one" before the transmission is forcibly jammed by the Glitch Jester.*

---

## 3. Level-by-Level Breakdown

### Level 1: The Corrupted Vaults (3D Escape Room)
- **Engine**: Three.js, React Three Fiber, Drei, custom first-person camera controller with pointer-lock release.
- **Environment**: 5 interconnected sequential rooms with interactive containers, drawers, cupboards, lockers, wall paintings, and physical colliders.
- **Hide & Seek Search Mechanics**:
  - Codes are concealed inside interactive furniture:
    - **Room 1**: Note tucked under the study chair.
    - **Room 2**: Sofa cushion and a tall wooden cupboard with multi-stage opening.
    - **Room 3**: Crooked wall painting, floor records box, and latched toolbox.
    - **Room 4**: Terminal desk drawer, latched cargo crate, and tech locker.
  - Decoy scraps with randomized maintenance memos prevent brute-forcing.
  - In 3 randomly chosen rooms, one digit glows in **radiant gold**.
- **Room 5 (Master Vault)**: Requires the 3-digit chronological permutation of the golden digits discovered during the escape.
- **Survival Constraints**:
  - **2-Minute Global Countdown**: Automatic respawn if time runs out.
  - **3 Shield Lives**: Incorrect vault guesses deplete lives.
  - **Universal Skip**: Press `K` or click Skip to bypass for rapid grading.

---

### Level 2: The Cipher Sanctuaries (4 Cognitive Sublevels & Atmospheric Altering)
Features a real-time **Atmospheric Environment Altering System** (`wood` atelier, `cyber` neon matrix, `glitch` anomaly). All puzzles are **100% tech, programming, gaming, and computer science themed**:

1. **Sublevel 1: Tech Word Search**:
   - 12x12 grid with words: `ALGORITHM`, `COMPILER`, `DATABASE`, `FIREWALL`, `RECURSION`, `CONTAINER`, `TERMINAL`, `DEBUGGER`, `FRAMEWORK`, `INTERFACE`, `VARIABLE`, `FUNCTION`.
2. **Sublevel 2: Memory Bot Match (Adapted for Laptops & Mobile)**:
   - 20-card memory matching table against an adaptive AI bot.
   - **Laptop/Desktop Optimized**: 5 columns x 4 rows landscape grid (`sm:grid-cols-5`) ensures cards fit comfortably on 16:9 widescreen laptop displays without vertical overflow.
   - Smooth 3D pick-up hover animation upon successful pair matching.
3. **Sublevel 3: Double Cadgy (100% Tech Vocabulary)**:
   - 5 vertical columns of stacked 3D tiles with Heart wildcards (`♥`).
   - Words are strictly computer science and dev terms: `STACK`, `BYTES`, `LOGIC`, `RESET`, `PATCH`, `CACHE`, `CORES`, `SHELL`, `PIXEL`, `PARSE`, `PROXY`, `REACT`, `ARRAY`. No non-tech dictionary filler.
4. **Sublevel 4: Riddle Board**:
   - 18 specialized tech/dev/gaming riddles covering compilers, hitboxes, GitHub, Python, shaders, pointers, glitches, sockets, sandboxes, and databases.
   - Dynamic 3-hint progressive decryption wheel.

---

### Level 3: The Gravity Anomaly (2D Retro Platformer)
- **Engine**: Pure Canvas 2D game loop with micro-physics and tile-map colliders.
- **Mechanics**:
  - Movement: `A` / `D` or Arrow keys.
  - Jump: `SPACE` or `W`.
  - Air Dash: `SHIFT` (Keyboard) or `>>` (Touch).
  - Gravity Inversion: `G` or `Flip` flips gravitational polarity between floor and ceiling.
  - Spike hazards, moving obstacles, and 3 checkpoints per stage.
- **Reward**: Reaching Stage 4 unlocks the **Cyber Severance Blade**, essential for facing the boss.

---

### Level 4: The Final Showdown (Cyber Nexus Combat & Revelation)
- **Engine**: Cyberpunk parallax renderer (`city_bg.jpg`), custom sprite rasterizer, multi-touch input cluster.
- **HUD & Ergonomics**:
  - Clean non-overlapping top HUD: Pause button (left), Sector title & target counter (center-left), Retry button (center-right), and High-Resolution Vital Graph (right).
  - Pure vector touch icons (`>>` Dash, `+` Shoot, `▲` Jump, `⇅` Flip) without emojis.
- **Phased Combat**:
  - **Phase 1**: Neutralize 6 patrolling Glitch Pawns deployed across dynamic platforms.
  - **Phase 2**: Sever corrupted tether nodes with the Cyber Blade.
  - **Phase 3**: Duel the Cyber Overlord, timing blaster counter-attacks during vulnerability windows.
  - **Phase 4 (Victory & Saved Author)**: Defeating the Overlord frees the Author.
- **The Twist Revealed**:
  - Dialogue sequence reveals the Author is the student's **future self**, returning from a dystopian future to warn the student to build and deploy AI responsibly.

---

## 4. Controls Quick Reference

| Action | Laptop / Desktop Keyboard | Mobile / Tablet Touch |
| :--- | :--- | :--- |
| **Move** | `A` / `D` or `Arrow Keys` | On-Screen Left / Right D-Pad |
| **Jump** | `Spacebar` or `W` | Green `▲` Action Button |
| **Air Dash** | `Shift` | Blue `>>` Button |
| **Invert Gravity** | `G` | Purple `⇅` Button |
| **Shoot Blaster** | `F`, `E`, or Mouse Click | Red `+` Button |
| **Interact / Examine** | `E` or Click | `E` Tap Prompt |
| **Universal Skip** | `K` Key | Skip Header Button |
| **Pause Menu** | `Escape` | Yellow `||` Button |
| **Quick Retry** | `R` Key | Red `↺` Button |

---

## 5. Technology Stack & Architecture

- **UI & State**: React 19, Tailwind CSS v4, Lucide SVG vector iconography.
- **3D Graphics**: Three.js, React Three Fiber (R3F), Drei, GLTF pipeline.
- **2D Game Engines**: Custom lightweight HTML5 Canvas 2D engines for Level 3 and Level 4.
- **Audio Architecture**: Web Audio API procedural synthesizer + stereo voiceover audio streaming.
- **Build Tooling**: Vite 8.3 with zero external bloat, adhering to **Ponytail** minimalist development standards.

---

## 6. Testing & Quality Assurance Suite

Run automated unit tests:
```bash
npm test
```
The test suite validates:
- `LevelManager.test.js`: Hiding spot randomization, room difficulty scaling, decoy labeling, and vault key generation.
- `narrationScript.test.js`: Radio voiceover script integrity, stage cues, dialogue blocks, and transmission pacing.

---

## 7. Running Locally

```bash
# 1. Clone repository
git clone https://github.com/PratikshaKushwaha/glitchVerse.git

# 2. Navigate to directory
cd glitch

# 3. Install dependencies
npm install

# 4. Start local Vite server
npm run dev

# 5. Build for production
npm run build
```

---

## 8. Authors & Credits

- **Hackathon**: PS01 GlitchVerse — *The World Is Broken*
- **Team**: **team StrawHats**
- **Members**: Pratiksha Kushwaha & Vallari Panvalkar (V-UNiQuE-V)
- **Concept & Narrative**: *The Way Out* — An ethical adventure into AI alignment, human agency, and responsible technological innovation.
