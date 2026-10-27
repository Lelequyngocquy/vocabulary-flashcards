export interface WordItem {
  id: number;
  word: string;
  type: string;
  meaning: string;
  example: string;
  library: string;
  created_at?: string;
}

export interface UserProgress {
  current_unit: string;
  current_index: number;
  learned_words: string[];
  quiz_stats: Record<string, unknown>;
  updated_at?: string | null;
}

export type TabType = 'flashcards' | 'quiz' | 'list' | 'stats';

export type PosFilterType = 'ALL' | 'n' | 'v' | 'adj' | 'adv';

export type StatusFilterType = 'ALL' | 'UNLEARNED' | 'LEARNED';

export interface QuizQuestion {
  target: WordItem;
  isEnToVi: boolean;
  prompt: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}
