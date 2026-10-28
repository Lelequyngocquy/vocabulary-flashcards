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
