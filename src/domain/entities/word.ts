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

export type PosFilterType = 'ALL' | 'n' | 'v' | 'adj' | 'adv';

export type StatusFilterType = 'ALL' | 'UNLEARNED' | 'LEARNED';
