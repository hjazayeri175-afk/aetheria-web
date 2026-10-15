export interface LoreEntry {
  id: string;
  name: string;
  keys: string[];
  secondaryKeys?: string[];
  content: string;
  enabled: boolean;
  insertionOrder?: number;
  position?: 'before_char' | 'after_char';
}

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
  alternateGreetings?: string[];
  alternate_greetings?: string[];
  status: 'online' | 'idle';
  badge?: string;
  accentColor?: string;
  starterPrompts: string[];
  fallbackReplies: string[];
  personality?: string;
  scenario?: string;
  speechStyle?: string;
  mesExample?: string;
  systemPrompt?: string;
  lorebook?: LoreEntry[];
}

/**
 * Pre-installed default characters.
 * Empty by default to empower users to import and create their own tailored personas (BYOK Personal Sandbox).
 */
export const characters: Character[] = [];

export const customCharacterPlaceholder: Character = {
  id: 'custom',
  name: 'Custom Persona',
  title: 'User-Defined Entity',
  category: 'Custom',
  tags: ['Custom', 'User-Created', 'BYOK'],
  description: 'A custom roleplay persona created and stored entirely in your local browser sandbox.',
  avatarUrl: '/avatars/anime_girl.webp',
  rating: '5.0',
  chatsCount: 'New',
  status: 'online',
  badge: 'Custom',
  starterPrompts: [
    'Tell me about your origins.',
    'What is your primary mission in this world?',
    'What do you think of {{user}}?'
  ],
  fallbackReplies: [
    '*Looks toward you thoughtfully.* "I am ready when you are, {{user}}."',
    '*Nods gently.* "Tell me what direction you wish our story to take."',
    '*Smiles warmly.* "The stage is yours."'
  ],
  greeting: '*Greets you with quiet anticipation, waiting for your first step.* "Welcome, {{user}}. Our journey begins now."'
};
