export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ielts_auth_token',
  LEARNED_WORDS: 'ielts_learned_words',
  SOUND_MUTED: 'ielts_sound_muted',
  SPEECH_RATE: 'ielts_speech_rate',
  CURRENT_CATEGORY: 'ielts_current_category',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS] | string;

export const localStorageAdapter = {
  getItem(key: StorageKey): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: StorageKey, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {}
  },

  removeItem(key: StorageKey): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {}
  },

  getJSON<T>(key: StorageKey, fallback: T): T {
    const raw = this.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  setJSON(key: StorageKey, value: unknown): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch {}
  },
};
