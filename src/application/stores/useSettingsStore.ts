import { create } from 'zustand';
import { localStorageAdapter, STORAGE_KEYS } from '@/infrastructure/storage/localStorageAdapter';
import { playChimeSound } from '@/infrastructure/device/audioService';

interface SettingsState {
  isSoundMuted: boolean;
  speechRate: number;
  toggleSound: () => void;
  setSpeechRate: (rate: number) => void;
  setSoundMuted: (muted: boolean) => void;
  hydrateFromLocalStorage: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => {
  return {
    isSoundMuted: false,
    speechRate: 0.9,

    hydrateFromLocalStorage: () => {
      const muted = localStorageAdapter.getItem(STORAGE_KEYS.SOUND_MUTED) === 'true';
      const rawRate = localStorageAdapter.getItem(STORAGE_KEYS.SPEECH_RATE);
      const parsedRate = rawRate ? parseFloat(rawRate) : 0.9;
      set({
        isSoundMuted: muted,
        speechRate: !isNaN(parsedRate) && parsedRate > 0 ? parsedRate : 0.9,
      });
    },

    toggleSound: () =>
      set((state) => {
        const next = !state.isSoundMuted;
        localStorageAdapter.setItem(STORAGE_KEYS.SOUND_MUTED, String(next));
        if (!next) {
          playChimeSound(false);
        }
        return { isSoundMuted: next };
      }),

    setSpeechRate: (rate: number) => {
      localStorageAdapter.setItem(STORAGE_KEYS.SPEECH_RATE, String(rate));
      set({ speechRate: rate });
    },

    setSoundMuted: (muted: boolean) => {
      localStorageAdapter.setItem(STORAGE_KEYS.SOUND_MUTED, String(muted));
      set({ isSoundMuted: muted });
    },
  };
});
