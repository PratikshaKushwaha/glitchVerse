// Rich dataset of thematic riddles with mock API simulation
// Provides variety across runs and allows custom dummy API queries

export const RIDDLES_DATASET = [
  {
    id: 'r_program',
    category: 'SYSTEM & LOGIC',
    title: 'THE ARCHITECT',
    question:
      'I have no physical form, yet I hold entire virtual worlds. I speak strictly in logic, but I am born from human imagination. A single syntax flaw in me fractures reality. What am I?',
    hint: "7 Letters • Starts with 'P' • The blueprint of all software",
    answer: 'PROGRAM',
    wheelLetters: ['P', 'R', 'O', 'G', 'R', 'A', 'M'],
  },
  {
    id: 'r_signal',
    category: 'TELECOMMUNICATIONS',
    title: 'THE BEACON',
    question:
      'I travel through the digital void without feet. I link isolated sectors together. Block me, and the entire simulation goes dark and silent. What am I?',
    hint: "6 Letters • Starts with 'S' • Electric broadcast of data",
    answer: 'SIGNAL',
    wheelLetters: ['S', 'I', 'G', 'N', 'A', 'L'],
  },
  {
    id: 'r_glitch',
    category: 'CYBER ANOMALY',
    title: 'THE ANOMALY',
    question:
      'I am an unexpected crack in the code that reveals the matrix is broken. I give you the power to defy the rules and break free. What am I?',
    hint: "6 Letters • Starts with 'G' • The name of our broken universe!",
    answer: 'GLITCH',
    wheelLetters: ['G', 'L', 'I', 'T', 'C', 'H'],
  },
  {
    id: 'r_cipher',
    category: 'CRYPTOGRAPHY',
    title: 'THE MASKED SCRIPT',
    question:
      'I take plain truths and wrap them in shadows. Only those who possess my secret key can unveil my true face. What am I?',
    hint: "6 Letters • Starts with 'C' • Mathematical disguise for secrets",
    answer: 'CIPHER',
    wheelLetters: ['C', 'I', 'P', 'H', 'E', 'R'],
  },
  {
    id: 'r_portal',
    category: 'DIMENSIONS',
    title: 'THE GATEWAY',
    question:
      'I have no hinges or lock, yet stepping through me teleports you across space and time into the next sector. What am I?',
    hint: "6 Letters • Starts with 'P' • A cosmic entrance between realms",
    answer: 'PORTAL',
    wheelLetters: ['P', 'O', 'R', 'T', 'A', 'L'],
  },
  {
    id: 'r_shadow',
    category: 'OPTICS & LIGHT',
    title: 'THE SILENT TWIN',
    question:
      'I follow you wherever there is light, yet run away into the dark. I have shape and form but zero weight. What am I?',
    hint: "6 Letters • Starts with 'S' • Absence of light cast by a silhouette",
    answer: 'SHADOW',
    wheelLetters: ['S', 'H', 'A', 'D', 'O', 'W'],
  },
  {
    id: 'r_matrix',
    category: 'COMPUTATION',
    title: 'THE GRID',
    question:
      'A rectangular grid of numbers and equations that calculates transforms and holds our simulated reality together. What am I?',
    hint: "6 Letters • Starts with 'M' • An array of columns and rows",
    answer: 'MATRIX',
    wheelLetters: ['M', 'A', 'T', 'R', 'I', 'X'],
  },
  {
    id: 'r_binary',
    category: 'HARDWARE & BIT',
    title: 'THE DUAL CODE',
    question:
      'Two symbols govern my universe: one represents light, the other dark; one represents truth, the other falsehood. What am I?',
    hint: "6 Letters • Starts with 'B' • The base-2 language of machines",
    answer: 'BINARY',
    wheelLetters: ['B', 'I', 'N', 'A', 'R', 'Y'],
  },
  {
    id: 'r_vector',
    category: 'MATHEMATICS',
    title: 'THE TRAJECTORY',
    question:
      'I define motion with both length and direction. Without me, physics engines cannot guide your projectiles. What am I?',
    hint: "6 Letters • Starts with 'V' • Arrow in multidimensional space",
    answer: 'VECTOR',
    wheelLetters: ['V', 'E', 'C', 'T', 'O', 'R'],
  },
  {
    id: 'r_kernel',
    category: 'OPERATING SYSTEM',
    title: 'THE CORE HEART',
    question:
      'I operate in the deepest ring of privilege. I arbitrate between software desires and silicon chips. If I panic, everything halts. What am I?',
    hint: "6 Letters • Starts with 'K' • Central core of any OS",
    answer: 'KERNEL',
    wheelLetters: ['K', 'E', 'R', 'N', 'E', 'L'],
  },
  {
    id: 'r_pixels',
    category: 'GRAPHICS & DISPLAY',
    title: 'THE ILLUMINATORS',
    question:
      'Countless millions of tiny colored phosphor dots make up everything you see on this monitor. What are we?',
    hint: "6 Letters • Starts with 'P' • Picture elements of your screen",
    answer: 'PIXELS',
    wheelLetters: ['P', 'I', 'X', 'E', 'L', 'S'],
  },
  {
    id: 'r_socket',
    category: 'NETWORKING',
    title: 'THE ENDPOINT',
    question:
      'An IP address and port married together to open a two-way pipe across the internet. What am I?',
    hint: "6 Letters • Starts with 'S' • Network communication endpoint",
    answer: 'SOCKET',
    wheelLetters: ['S', 'O', 'C', 'K', 'E', 'T'],
  },
  {
    id: 'r_memory',
    category: 'STORAGE',
    title: 'THE VAULT OF RECALL',
    question:
      'I remember every variable and address while current flows, but if power is cut, all my thoughts vanish into oblivion. What am I?',
    hint: "6 Letters • Starts with 'M' • Silicon RAM that holds active state",
    answer: 'MEMORY',
    wheelLetters: ['M', 'E', 'M', 'O', 'R', 'Y'],
  },
  {
    id: 'r_mirror',
    category: 'REFLECTION',
    title: 'THE INVERTED TRUTH',
    question:
      'I show you everything about yourself without ever saying a word, reversing left for right. What am I?',
    hint: "6 Letters • Starts with 'M' • Reflective polished surface",
    answer: 'MIRROR',
    wheelLetters: ['M', 'I', 'R', 'R', 'O', 'R'],
  },
  {
    id: 'r_quantum',
    category: 'PHYSICS',
    title: 'THE SUPERPOSITION',
    question:
      'I can be zero and one simultaneously until you observe me and collapse my wave function. What am I?',
    hint: "7 Letters • Starts with 'Q' • Subatomic behavior of entangled particles",
    answer: 'QUANTUM',
    wheelLetters: ['Q', 'U', 'A', 'N', 'T', 'U', 'M'],
  },
]

// Mock API function that fetches random diverse riddles
export async function fetchRiddlesDataset(count = 3) {
  // Simulate network micro-latency if needed
  await new Promise((resolve) => setTimeout(resolve, 50))
  const shuffled = [...RIDDLES_DATASET].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
