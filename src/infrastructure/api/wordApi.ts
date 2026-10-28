import { httpClient } from '../http/httpClient';
import { WordItem, CategoryItem } from '@/domain/entities';

export interface WordsResponse {
  success: boolean;
  words: WordItem[];
  categories: CategoryItem[];
  defaultCategory?: string;
  defaultUnit?: string;
}

export interface WordMutationResponse {
  success: boolean;
  word: WordItem;
  error?: string;
}

export const wordApi = {
  async getAll(): Promise<{ words: WordItem[]; categories: CategoryItem[]; defaultCategory?: string; defaultUnit?: string }> {
    const res = await httpClient.get<WordsResponse>('/api/words');
    return {
      words: Array.isArray(res.words) ? res.words : [],
      categories: Array.isArray(res.categories) ? res.categories : [],
      defaultCategory: res.defaultCategory,
      defaultUnit: res.defaultUnit,
    };
  },

  async updateWord(
    payload: {
      id: number;
      word: string;
      type: string;
      meaning: string;
      example: string;
      library: string;
      category?: string;
    },
    token?: string | null
  ): Promise<WordItem> {
    const res = await httpClient.put<WordMutationResponse>('/api/words', payload, { token });
    return res.word;
  },

  async createWord(
    payload: {
      word: string;
      type: string;
      meaning: string;
      example: string;
      library: string;
      category?: string;
    },
    token?: string | null
  ): Promise<WordItem> {
    const res = await httpClient.post<WordMutationResponse>('/api/words', payload, { token });
    return res.word;
  },

  async deleteWord(id: number, token?: string | null): Promise<boolean> {
    const res = await httpClient.delete<{ success: boolean }>(`/api/words?id=${id}`, { token });
    return res.success;
  },
};
