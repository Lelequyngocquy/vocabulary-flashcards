export interface CategoryItem {
  id: number;
  category: string;
  display_order: number;
  count?: number;
}

export interface WordItem {
  id: number;
  word: string;
  type: string;
  meaning: string;
  example: string;
  library: string;
  category?: string;
  category_id?: number;
  topic_id?: number;
  order_index?: number;
  created_at?: string;
}

export interface UserItem {
  id: number;
  username: string;
  role: string;
  created_at?: string;
}

export interface UserProgress {
  current_category?: string;
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
