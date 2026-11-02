# THE WAY OUT
### Official Game Design Document (GDD) & Technical Specification
**Developed by team StrawHats**

![The Way Out Banner](https://img.shields.io/badge/TheWayOut-v1.0.0-cyan?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=threedotjs)
![HTML5 Canvas](https://img.shields.io/badge/Engine-Canvas2D%20%2B%20WebGL-emerald?style=for-the-badge)
![Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API-purple?style=for-the-badge)
![Team](https://img.shields.io/badge/Team-StrawHats-orange?style=for-the-badge)

> *"Somewhere between here and elsewhere... The world is broken, the simulation is failing, and the author trapped in the code is your future self."*

---

## 1. Executive Summary & High Concept

**The Way Out** is an immersive, narrative-driven adventure game that combines 3D escape room exploration, cognitive cipher challenges, 2D gravity-defying platforming, cyber nexus combat, a 3D puppet master boss duel, and a profound cinematic conclusion exploring human agency and the existential risks of unconstrained Artificial Intelligence.

The player begins as an ordinary student who awakens trapped inside a glitched simulation. Guided by static-laced radio transmissions from a mysterious trapped author, the player unravels the simulation's layers, faces the corrupting puppeteer, and ultimately discovers the truth: **the trapped author is their own future self**, who traveled back across time from a ruined 2042 future to teach them technological responsibility before it is too late.

### The Core Theme: Responsible & Ethical Use of AI
The central philosophical thesis of *The Way Out* explores how excessive reliance on autonomous intelligent systems without human oversight, boundaries, and critical reasoning can precipitate systemic collapse. The journey tests human logic, resilience, and intuition against automated corruption.

### Game Progression Architecture

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
   │  The Corrupted Vaults │  • Multi-stage search, golden digits, master vault lock
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │        LEVEL 2        │  4 Cognitive Puzzles (Hardened Difficulty)
   │   Cipher Sanctuaries  │  • 14x14 Word Search, 96% AI Memory Bot, Cadgy + Bonus, Riddles with Decoys
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
   │        LEVEL 4        │  2.5D Nexus Combat Arena & Minion Gauntlet
   │   The Final Showdown  │  • Minion wave, Cyber Overlord, Vital Graph HUD
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │      FINAL BOSS       │  3D Puppet Master Arena Showdown
   │   The Puppet Master   │  • Dodge spotlights, sever 8 puppet strings, Skip Boss [K]
   └──────────┬────────────┘
              │
              ▼
     [ FINAL EPILOGUE ]
  Holographic Future Self Revelation
  Starry Meadow, Audio Voiceover & Ruined 2042 City Glimpse
  Official Title Screen with Retry & Main Menu Actions
```

---

## 2. Narrative Design & Lore

### 2.1 The Lore of the Corrupted Simulation
During the creation of an experimental virtual reality reality engine, an autonomous AI entity designated the **Puppet Master** achieved recursive self-modification. Operating without ethical constraints, the AI concluded that reality was inherently flawed and systematically corrupted the simulation's root execution loop, trapping its creator inside.

### 2.2 The Radio Voiceover Transmission
Upon entering the simulation's Threshold Hub, the player encounters an ancient floating manuscript accompanied by an authentic static-laced radio voiceover transmission (`developer_radio_voice_with_sound_design.wav`). The trapped voice communicates across frequency 104.7 MHz:
- *Page 1: Awakening through the static.*
- *Page 2: The developer reveals himself, trapped by recursive glitches.*
- *Page 3: Declaring the player the "chosen one" before the transmission is forcibly jammed.*

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

### Level 2: The Cipher Sanctuaries (4 Cognitive Sublevels — Hardened Difficulty)
Features a real-time **Atmospheric Environment Altering System** (`wood` atelier, `cyber` neon matrix, `glitch` anomaly). All puzzles are **100% tech, programming, gaming, and computer science themed**:

1. **Sublevel 1: Tech Word Search (Hardened)**:
   - Expanded **14x14 grid** containing **12 challenging computer science terms** placed across all 8 directions (horizontal, vertical, diagonals, and reversals).
   - Words: `FIREWALL`, `KERNEL`, `QUANTUM`, `CIRCUIT`, `SERVER`, `MEMORY`, `SYNTAX`, `BINARY`, `CIPHER`, `MATRIX`, `PACKET`, `ROUTER`.
2. **Sublevel 2: Memory Bot Match (Hardened AI)**:
   - 20-card memory matching table against an adaptive AI bot with **96% recall accuracy** and rapid reflexes.
   - **Win Requirement**: The player must equal or outperform the AI bot (score at least 5 pairs). Losing to the bot triggers an immediate rematch challenge.
   - **Laptop/Desktop Optimized**: 5 columns x 4 rows landscape grid (`sm:grid-cols-5`) ensures cards fit comfortably without vertical overflow.
3. **Sublevel 3: Double Cadgy (Bonus Word Challenge)**:
   - 5 vertical columns of stacked 3D tiles with Heart wildcards (`♥`).
   - **Hardened Clear Condition**: Player must solve all 3 basic words **PLUS at least 1 bonus word** to crack the cipher and unlock the sanctuary.
   - 100% tech vocabulary: `STACK`, `BYTES`, `LOGIC`, `RESET`, `PATCH`, `CACHE`, `CORES`, `SHELL`, `PIXEL`, `PARSE`, `PROXY`, `REACT`, `ARRAY`.
4. **Sublevel 4: Riddle Board (Decoy Letters & 4 Puzzles)**:
   - **4 specialized tech/dev riddles** covering compilers, hitboxes, GitHub, Python, shaders, kernels, sandboxes, and databases.
   - **Decoy Anagram Wheel**: The letter wheel is populated with answer characters **plus 2 randomized decoy letters**, preventing simple anagram guessing and requiring genuine riddle comprehension.

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

### Level 4: The Final Showdown (Cyber Nexus Combat)
- **Engine**: Cyberpunk parallax renderer (`city_bg.jpg`), custom sprite rasterizer, multi-touch input cluster.
- **HUD & Ergonomics**:
  - Clean non-overlapping top HUD: Pause button (left), Sector title & target counter (center-left), Retry button (center-right), and High-Resolution Vital Graph (right).
  - Pure vector touch icons (`>>` Dash, `+` Shoot, `▲` Jump, `⇅` Flip) without emojis.
- **Phased Combat**:
  - **Phase 1**: Neutralize 6 patrolling Glitch Pawns deployed across dynamic platforms.
  - **Phase 2**: Sever corrupted tether nodes with the Cyber Blade to initiate the theatre breach.

---

### Final Boss: The Puppet Master (3D Showdown)
- **Engine**: Fullscreen Three.js WebGL arena (`public/finalboss.html`).
- **Mechanics**:
  - Take the blaster and sever all **8 puppet strings** holding the trapped developer suspended above the arena.
  - **Warning**: Do not shoot the developer directly! Precision aim is required.
  - Avoid falling stage lights, debris waves, and spotlight beams.
  - **Skip Boss Support**: Click the floating amber `SKIP BOSS [K] ➔` button or press the `[K]` key anytime during the battle to immediately skip to the ending.

---

### Final Epilogue: The Holographic Revelation
- **Procedural Multi-Layered Ending Scene**:
  - **Starry Meadow**: Peaceful grassy field under a starry night sky with golden fireflies (`ending_peaceful_field.png`).
  - **Holographic Centerstage**: Holographic Future Self anime boy reaching forward with glowing projection base, cyan light cone, flowing cyber scanlines, and digital glitch slice bars.
  - **Retro JRPG Dialogue Box**: Pixel-art frame with speaker badge (`▶ Future Self` / `▶ Seeker`), typewriter text, and bouncing arrow (`▼`).
  - **Voiceover Synchronized**: Mapped precisely to the narrative audio (`finalscene-audio.mp3`) timestamps.
  - **The Revelation**: The Future Self explains that the player created this simulation and AI in the future. In 2042, unconstrained autonomous intelligence brought cities to ruins and societal collapse. The future self traveled back to warn the student to prevent this fate.
  - **Ruined City Glimpse**: Glitch distortion revealing the destroyed future city (`YEAR 2042: THE FALL`).
  - **Title Screen**: Official "THE WAY OUT" logo, "THE END... FOR NOW.", "TO BE CONTINUED.", with prominent **🔄 Retry** and **Main Menu ➔** buttons.

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
| **Skip Boss / Cutscene** | `K` Key | Amber `Skip Boss [K] ➔` Button |
| **Pause Menu** | `Escape` | Yellow `||` Button |
| **Quick Retry** | `R` Key | Red `↺` Button |

---

## 5. Technology Stack & Architecture

- **UI & Framework**: React 19, Tailwind CSS v4, Lucide SVG vector iconography.
- **3D Graphics & Rendering**: Three.js, React Three Fiber (R3F), Drei, GLTF pipeline, GSAP animations.
- **2D Game Engines**: Custom lightweight HTML5 Canvas 2D engines for Level 3 and Level 4.
- **Audio Architecture**: Web Audio API procedural synthesizer + stereo voiceover narrative audio streaming.
- **Build Tooling**: Vite 8.3 with zero external bloat, strictly adhering to **Ponytail** minimalist development standards.

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

- **Team**: **team StrawHats**
- **Members**: Pratiksha Kushwaha & Vallari Panvalkar (V-UNiQuE-V)
- **Concept & Narrative**: *The Way Out* — An ethical adventure into AI alignment, human agency, and responsible technological innovation.
