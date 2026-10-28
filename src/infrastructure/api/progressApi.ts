import { httpClient } from '../http/httpClient';
import { UserProgress } from '@/domain/entities';

export interface ProgressSyncPayload {
  current_category: string;
  current_unit: string;
  current_index: number;
  learned_words: string[];
  quiz_stats: Record<string, unknown>;
}

export const progressApi = {
  async syncProgress(payload: ProgressSyncPayload, token?: string | null): Promise<boolean> {
    const res = await httpClient.post<{ success: boolean; error?: string }>('/api/progress', payload, {
      token,
    });
    return res.success;
  },

  async getProgress(token?: string | null): Promise<UserProgress | null> {
    const res = await httpClient.get<{ success: boolean; progress?: UserProgress }>('/api/progress', {
      token,
    });
    return res.progress || null;
  },
};
