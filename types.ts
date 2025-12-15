export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  CODE = 'Code Snippet'
}

export enum KeyboardLayout {
  QWERTY = 'QWERTY',
  AZERTY = 'AZERTY',
  DVORAK = 'DVORAK'
}

export interface TestStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  errors: number;
  timeElapsed: number;
  missedKeys: Record<string, number>;
}

export interface HistoryItem extends TestStats {
  id: string;
  date: string;
  difficulty: Difficulty;
}

export interface KeyState {
  key: string;
  status: 'default' | 'active' | 'correct' | 'incorrect';
  finger?: number; // 0-9 for finger mapping
}