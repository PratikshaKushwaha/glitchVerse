// Rich dataset of thematic tech, code, dev, gaming, and programming riddles
// Specifically crafted around coding concepts, game dev mechanics, computer science, and tech GK

export const RIDDLES_DATASET = [
  {
    id: 'r_compiler',
    category: 'PROGRAMMING & DEV',
    title: 'THE TRANSLATOR',
    question:
      'I read the code you write in human syntax and translate it into raw machine opcode. Forget a single semicolon or mismatched brace, and I will refuse to build your world. What am I?',
    hint: "8 Letters • Starts with 'C' • Translates source code into machine executables",
    answer: 'COMPILER',
    wheelLetters: ['C', 'O', 'M', 'P', 'I', 'L', 'E', 'R'],
  },
  {
    id: 'r_hitbox',
    category: 'GAME DEVELOPMENT',
    title: 'THE INVISIBLE COLLIDER',
    question:
      'You never see me rendered on screen, yet every sword strike, laser collision, and jump physics depends on my geometry. If my bounds are too generous, players cry foul. What am I?',
    hint: "6 Letters • Starts with 'H' • Invisible collision boundary in video games",
    answer: 'HITBOX',
    wheelLetters: ['H', 'I', 'T', 'B', 'O', 'X'],
  },
  {
    id: 'r_github',
    category: 'DEV TOOLS & VCS',
    title: 'THE FORGE OF REPOSITORIES',
    question:
      'Millions of developers push their code to my octocat mascot. I preserve commit histories, resolve merge conflicts, and host pull requests across branches. What am I?',
    hint: "6 Letters • Starts with 'G' • The world's largest Git repository platform",
    answer: 'GITHUB',
    wheelLetters: ['G', 'I', 'T', 'H', 'U', 'B'],
  },
  {
    id: 'r_python',
    category: 'CODING LANGUAGES',
    title: 'THE INDENTED SERPENT',
    question:
      'Named not after a reptile, but a surreal British comedy troupe. I enforce whitespace indentation, shun curly brackets, and reign supreme across artificial intelligence and data science. What am I?',
    hint: "6 Letters • Starts with 'P' • Popular high-level interpreted programming language",
    answer: 'PYTHON',
    wheelLetters: ['P', 'Y', 'T', 'H', 'O', 'N'],
  },
  {
    id: 'r_shaders',
    category: 'GRAPHICS & GAMING',
    title: 'THE LIGHT WEAVERS',
    question:
      'We execute millions of times per frame across GPU parallel compute cores, rendering ray tracing, neon bloom, reflections, and shadow transforms in modern games. What are we?',
    hint: "7 Letters • Starts with 'S' • GPU programs calculating lighting and pixel colors",
    answer: 'SHADERS',
    wheelLetters: ['S', 'H', 'A', 'D', 'E', 'R', 'S'],
  },
  {
    id: 'r_kernel',
    category: 'OPERATING SYSTEMS',
    title: 'THE RING-ZERO MASTER',
    question:
      'I reside in the deepest privilege level of the CPU. I allocate memory pages, schedule threads, and govern device drivers. If I encounter an unhandled fault, a Blue Screen or panic erupts. What am I?',
    hint: "6 Letters • Starts with 'K' • Core heart of Linux, Windows, and macOS",
    answer: 'KERNEL',
    wheelLetters: ['K', 'E', 'R', 'N', 'E', 'L'],
  },
  {
    id: 'r_binary',
    category: 'COMPUTER ARCHITECTURE',
    title: 'THE PRIMORDIAL DUALITY',
    question:
      'High voltage and low voltage, closed and open switch, true and false. Through only zeroes and ones, all computing, digital audio, and video games are born. What am I?',
    hint: "6 Letters • Starts with 'B' • Base-2 numerical language of digital processors",
    answer: 'BINARY',
    wheelLetters: ['B', 'I', 'N', 'A', 'R', 'Y'],
  },
  {
    id: 'r_recurse',
    category: 'ALGORITHMS & LOGIC',
    title: 'THE MIRROR CALL',
    question:
      'To understand me, you must first understand me. I solve problems by calling myself repeatedly, and without a base condition, I will trigger a fatal stack overflow. What do I do?',
    hint: "7 Letters • Starts with 'R' • A function calling itself recursively",
    answer: 'RECURSE',
    wheelLetters: ['R', 'E', 'C', 'U', 'R', 'S', 'E'],
  },
  {
    id: 'r_server',
    category: 'NETWORKING & CLOUD',
    title: 'THE ENDLESS HOST',
    question:
      'I live rack-mounted in refrigerated data centers, listening continuously on network ports to answer incoming HTTP requests, WebSocket messages, and database queries. What am I?',
    hint: "6 Letters • Starts with 'S' • Dedicated host machine serving network clients",
    answer: 'SERVER',
    wheelLetters: ['S', 'E', 'R', 'V', 'E', 'R'],
  },
  {
    id: 'r_sprite',
    category: 'RETRO GAMING',
    title: 'THE PIXEL VESSEL',
    question:
      'In classic 2D games from arcade cabinets to handheld classics, I am an animated bitmap sheet containing the frames of heroes, monsters, and items. What am I?',
    hint: "6 Letters • Starts with 'S' • Fundamental 2D image asset in video games",
    answer: 'SPRITE',
    wheelLetters: ['S', 'P', 'R', 'I', 'T', 'E'],
  },
  {
    id: 'r_pointer',
    category: 'LOW-LEVEL PROGRAMMING',
    title: 'THE MEMORY ARROW',
    question:
      'In C and C++, I do not hold values directly. Instead, I store the exact hexadecimal memory address where other data resides. Dereference me when null, and a segmentation fault strikes. What am I?',
    hint: "7 Letters • Starts with 'P' • Variable referencing a memory address",
    answer: 'POINTER',
    wheelLetters: ['P', 'O', 'I', 'N', 'T', 'E', 'R'],
  },
  {
    id: 'r_glitch',
    category: 'GAMING ANOMALY',
    title: 'THE EXPLOIT ANOMALY',
    question:
      'Speedrunners hunt me through walls, clipping out of level boundaries to bypass hours of gameplay. Developers scramble to patch me in day-one updates. What am I?',
    hint: "6 Letters • Starts with 'G' • Unintended software bug or collision flaw",
    answer: 'GLITCH',
    wheelLetters: ['G', 'L', 'I', 'T', 'C', 'H'],
  },
  {
    id: 'r_cipher',
    category: 'CYBERSECURITY',
    title: 'THE ENCRYPTED VEIL',
    question:
      'From ancient Caesar shifts to modern AES-256 and RSA public keys, I transform readable plaintext into scrambled ciphertext to protect secrets from network eavesdroppers. What am I?',
    hint: "6 Letters • Starts with 'C' • Mathematical encryption algorithm",
    answer: 'CIPHER',
    wheelLetters: ['C', 'I', 'P', 'H', 'E', 'R'],
  },
  {
    id: 'r_socket',
    category: 'NETWORKING PROTOCOLS',
    title: 'THE DUPLEX PIPE',
    question:
      'When an IP address pairs with a port number, I open a bidirectional duplex communication channel over TCP or UDP for real-time multiplayer gaming. What am I?',
    hint: "6 Letters • Starts with 'S' • Network communication endpoint",
    answer: 'SOCKET',
    wheelLetters: ['S', 'O', 'C', 'K', 'E', 'T'],
  },
  {
    id: 'r_sandbox',
    category: 'DEV & SECURITY',
    title: 'THE CONTAINMENT ZONE',
    question:
      'In security, I isolate untrusted processes so malicious payloads cannot harm your OS. In game design, I give players open-ended creative freedom with no strict goals. What am I?',
    hint: "7 Letters • Starts with 'S' • Isolated runtime environment or creative game mode",
    answer: 'SANDBOX',
    wheelLetters: ['S', 'A', 'N', 'D', 'B', 'O', 'X'],
  },
  {
    id: 'r_database',
    category: 'DATA PERSISTENCE',
    title: 'THE VAULT OF RECORDS',
    question:
      'Whether structured in relational SQL tables or unstructured JSON collections, I guarantee ACID compliance and ensure millions of player records and high scores persist forever. What am I?',
    hint: "8 Letters • Starts with 'D' • Persistent structured store for application data",
    answer: 'DATABASE',
    wheelLetters: ['D', 'A', 'T', 'A', 'B', 'A', 'S', 'E'],
  },
  {
    id: 'r_vector',
    category: 'GAME PHYSICS & MATH',
    title: 'THE ARROW OF VELOCITY',
    question:
      'In game engines like Unity, Godot, and Unreal, I define physical motion through magnitude and direction, calculating character velocity and projectile arcs. What am I?',
    hint: "6 Letters • Starts with 'V' • Mathematical entity with magnitude and direction",
    answer: 'VECTOR',
    wheelLetters: ['V', 'E', 'C', 'T', 'O', 'R'],
  },
  {
    id: 'r_pixels',
    category: 'HARDWARE & DISPLAYS',
    title: 'THE ILLUMINATING MATRIX',
    question:
      'Composed of microscopic red, green, and blue sub-elements, millions of us refresh at 144Hz or 240Hz to project code, game worlds, and graphics onto your monitor. What are we?',
    hint: "6 Letters • Starts with 'P' • Picture elements of your visual display",
    answer: 'PIXELS',
    wheelLetters: ['P', 'I', 'X', 'E', 'L', 'S'],
  },
]

// Mock API function that fetches random diverse tech riddles
export async function fetchRiddlesDataset(count = 3) {
  // Simulate network micro-latency if needed
  await new Promise((resolve) => setTimeout(resolve, 50))
  const shuffled = [...RIDDLES_DATASET].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
