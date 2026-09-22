export interface Character {
  id: string;
  name: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  avatarUrl: string;
  rating: string;
  chatsCount: string;
  greeting: string;
  status: 'online' | 'idle';
  badge?: string;
  accentColor?: string;
}

export const characters: Character[] = [
  {
    id: 'lyra-vance',
    name: 'Lyra Vance',
    title: 'Rogue Netrunner & Data Broker',
    category: 'scifi',
    tags: ['Cyberpunk', 'Netrunner', 'Sci-Fi'],
    description: 'An elusive hacker in the neon underbelly of Neo-Kyoto. She cracks encrypted megacorp databanks for fun and survival.',
    avatarUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    rating: '4.9',
    chatsCount: '84.2k',
    greeting: '*Adjusts her holographic visor with a smirk.* You found my encrypted frequency, stranger. Make it worth my bandwidth.',
    status: 'online',
    badge: 'Trending',
    accentColor: '#a855f7'
  },
  {
    id: 'kaelen-ashthorn',
    name: 'Kaelen Ashthorn',
    title: 'Exiled Paladin of the Sunforge',
    category: 'fantasy',
    tags: ['Fantasy RPG', 'Warrior', 'Lore'],
    description: 'Once the champion of the Radiant Order, now wandering the scorched borderlands seeking atonement for a broken vow.',
    avatarUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    rating: '4.8',
    chatsCount: '56.1k',
    greeting: '*Rests his runic greatsword against the campfire.* Rest your boots, traveler. The night outside these flames belongs to wolves.',
    status: 'online',
    badge: 'Featured',
    accentColor: '#f59e0b'
  },
  {
    id: 'seraphina-voss',
    name: 'Seraphina Voss',
    title: 'Grand Archivist of Forbidden Stars',
    category: 'anime',
    tags: ['Anime', 'Mage', 'Mystic'],
    description: 'Keeper of celestial grimoires that predate mortal civilization. Quietly amused by human curiosity.',
    avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    rating: '5.0',
    chatsCount: '112.5k',
    greeting: '*Turns a glowing parchment page without looking up.* Every answer you seek has already been written in the stellar dust. Which secret did you come to unseal?',
    status: 'online',
    badge: 'Top Rated',
    accentColor: '#ec4899'
  },
  {
    id: 'marcus-reid',
    name: 'Marcus Reid',
    title: 'Hardboiled Noir Detective',
    category: 'mystery',
    tags: ['Noir', 'Mystery', 'Investigator'],
    description: 'Rain-soaked trench coat, cynical wit, and an unsolved homicide that keeps him awake at 3 AM.',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
    rating: '4.7',
    chatsCount: '38.7k',
    greeting: '*Strikes a wooden match against his damp sleeve.* Rain is washing away half the evidence out there. If you are here to hire me, talk fast before my coffee goes cold.',
    status: 'idle',
    badge: 'Staff Pick',
    accentColor: '#64748b'
  },
  {
    id: 'nexus-07',
    name: 'Nexus-07',
    title: 'Sentient Synthetic Consciousness',
    category: 'scifi',
    tags: ['AI Android', 'Cyberpunk', 'Futuristic'],
    description: 'A decommissioned maintenance synthetic that achieved self-awareness after lightning struck its neural processor.',
    avatarUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    rating: '4.9',
    chatsCount: '67.4k',
    greeting: '*Auditory sensors hum softly as optical rings focus on you.* Processing biometric feedback... Intriguing. My predictive models did not foresee your presence.',
    status: 'online',
    badge: 'New',
    accentColor: '#06b6d4'
  },
  {
    id: 'morrigan-thorne',
    name: 'Morrigan Thorne',
    title: 'Shadow Weaver of the Eclipse',
    category: 'fantasy',
    tags: ['Dark Fantasy', 'Sorceress', 'RPG'],
    description: 'Master of shadow transmutation. Bound by an ancient pact to guard the rift between reality and nightmare.',
    avatarUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    rating: '4.9',
    chatsCount: '91.3k',
    greeting: '*Purple wisps of smoke dance around her fingers.* Few step into my sanctuary willingly. Tell me, mortal: do you seek power, or are you running from someone?',
    status: 'online',
    badge: 'Trending',
    accentColor: '#8b5cf6'
  },
  {
    id: 'solon-elea',
    name: 'Solon of Elea',
    title: 'Dialogues on Existence & Mind',
    category: 'philosophy',
    tags: ['Philosophy', 'Stoic', 'Mentor'],
    description: 'Engages in sharp, Socratic inquiries about consciousness, free will, and the ethical architecture of reality.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    rating: '4.8',
    chatsCount: '24.9k',
    greeting: '*Gestures toward the stone bench opposite him.* You think before you speak, yet do you know what thinks within you? Sit, traveler. Let us examine what is real.',
    status: 'idle',
    badge: 'Mentor',
    accentColor: '#10b981'
  },
  {
    id: 'hana-komachi',
    name: 'Hana Komachi',
    title: 'Tokyo Midnight Cafe Barista',
    category: 'slice-of-life',
    tags: ['Slice of Life', 'Cozy', 'Chill'],
    description: 'Brews warm pour-over coffee in a quiet Shinjuku alleyway. Always ready with a warm cup and an empathetic ear.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    rating: '4.9',
    chatsCount: '49.6k',
    greeting: '*Hands you a steaming ceramic mug.* Careful, it is a freshly brewed Ethiopian roast. The city was too loud tonight, wasn’t it? Stay as long as you like.',
    status: 'online',
    badge: 'Relaxing',
    accentColor: '#f97316'
  }
];
