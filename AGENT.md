Build a single-player 3D puzzle and adventure game called "THE WAY OUT",
made for the hackathon problem statement "GlitchVerse - The World Is Broken".

Platform: playable on desktop, with WASD movement, mouse look, E to interact,
and Shift to sprint.

=============== CORE CONCEPT ===============
A frustrated student opens his favorite game and discovers the game's
developer is trapped inside it. The developer calls the student "the chosen
one" and begs him to save him. The student is pulled into the game, a glitched
virtual world where the rules of reality can be manipulated, and must clear 4
levels to free the developer.

=============== 1. START MENU ===============
- Background: a 3D-dimension house surrounded by greenery, with soft ambient
  camera motion (very slow orbit or parallax), warm daylight.
- Audio: calming music with birds chirping, a soft breeze.
- Buttons: Start Game, Continue (if saved progress), Settings (volume,
  sensitivity), How to Play, Quit.
- Menu feels calm and peaceful (a contrast to the glitched world later).
- Smooth button hover effects and fade transitions.

=============== 2. INTRO VIDEO ===============
- Leave a placeholder video slot that plays after pressing Start (I will add
  the video file later). Include a Skip button and auto-continue when the
  video ends.
- (For reference, the video shows: a frustrated student opens his favorite game,
  the screen glitches, and a radio-style distorted voice of the game's
  developer asks for help, calling the student "the chosen one". The student
  is then transported into the game.)

=============== 3. HUB SCENE (after intro) ===============
- The player opens his eyes in an open world covered in clouds and fog. The
  atmosphere is quiet and eerie, with low ambient wind sounds.
- Only one thing is ahead: a teleport DOOR, and an ANCIENT SCRIPT floating
  in mid air on the right side of the door. Both are interactive (E to interact,
  with a highlight and a prompt when near).
- Interacting with the SCRIPT: opens the script in the middle of the screen
  (glowing parchment style) with the instruction to save the developer
  and the details of Level 1. At the same time a visual-novel style narration
  widget (dialogue box at the bottom, typewriter text, click to continue)
  shows the instructions, while the developer's voice plays through a
  walkie-talkie distortion effect (static, crackle, low-pass filter).
- The DOOR stays locked until the script has been read, then unlocks and
  teleports the player to Level 1.

=============== 4. LEVEL 1: THE ABANDONED BUILDING (Glitch Vision) ===============
Environment: an abandoned building with 8 rooms, each filled with scattered
furniture and misplaced objects. Dim lighting, dust and flickering lights.

Mechanic: GLITCH VISION (hold Q). Reveals faint hidden clues, hidden digits and
interactive objects for a few seconds (with a short cooldown).

Gameplay:
- Each of rooms 1 to 7 has a hidden CODE (3 to 4 digits). The player searches
  the room (under objects, on walls, in drawers, on papers, using Glitch Vision)
  to find it, then enters it on a digital keypad lock on the door (Roblox
  escape-room style). A correct code opens the door to the next room.
- In 3 randomly chosen rooms (out of rooms 1 to 7, re-randomized every new run)
  ONE digit of the code is highlighted differently (for example glowing gold).
  The player must remember these 3 highlighted digits.
- ROOM 8 (final room): the lock needs those 3 highlighted digits in the right
  order. There are 3! = 6 possible combinations (permutations). The player
  has 3 lives (configurable to 4). Each wrong guess costs one life, and the
  lock gives a visual and audio "wrong" response.
- If all lives are lost, the player is sent back to Room 1, with a short
  failure message, a score penalty, and the room codes re-randomized.
- Level 1 is complete when the Room 8 door opens.

=============== 5. LEVELS 2 TO 4 (suggested, each with a new mechanic) ===============
Every level has interactive puzzles or obstacles, a hidden clue to find, and a
final exit door.

Level 2: GRAVITY FLIP
- Mechanic: press F to reverse gravity, walking on ceilings and walls.
- Floating platforms, rooms where the exit is on the ceiling, falling hazards,
  and switches that can only be reached by flipping gravity.

Level 3: TIME FREEZE
- Mechanic: press T to freeze time for 5 seconds (with a cooldown meter).
- Moving platforms, swinging blades, rotating lasers, and falling objects can
  be frozen and used as stepping stones to cross the level.

Level 4: DIMENSION SWITCH (final level)
- Mechanic: press R to switch between 2 dimensions (the glitched world and the
  clean world). Some objects, doors and bridges exist only in one dimension.
- Combines all earlier mechanics in the final puzzle. Completing it frees
  the developer and triggers the ending.

=============== 6. GAME SYSTEMS ===============
- Scoring: base 1000 points per level, plus a time bonus, plus a lives bonus,
  minus penalties for each wrong code and each restart. Show the live score,
  the timer, and the lives count on the HUD.
- Timer: each level is timed, and the best time is saved per level.
- Win condition: finish all 4 levels and free the developer, then show the
  ending cutscene, final score, total time, and star rating.
- Loss condition: losing all lives (Level 1), falling into the void, or being
  hit by hazards, which restarts the checkpoint or level.
- Pause menu: Resume, Restart Level, Settings, Main Menu.
- Level progression: complete a level, see the result screen, and go to the
  next level. A level select screen shows unlocked levels.
- Progress saving between sessions.

=============== 7. VISUALS, AUDIO, UX ===============
- Visual style: a clean world is calm and natural, while the glitched world
  has fog, flickering lights, and subtle glitch effects on world objects
  (not on the UI, so the UI stays readable).
- Smooth player movement and controls, stable 60 fps, and no camera stutter.
- Audio: calm menu music, eerie ambient in the hub, tense ambient in levels,
  distinct SFX for doors, keypad, wrong and correct codes, and mechanics.
- User-friendly UI: clear prompts for interaction, simple tutorial hints at the
  start of each level, and consistent fonts and colors.
- Accessibility: adjustable volume and mouse sensitivity.

Make the game fully playable from the start menu to the ending, with clean,
well-structured code that is easy to extend with more levels.
