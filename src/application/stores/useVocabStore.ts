import { create } from 'zustand';
import { WordItem, CategoryItem, UnitItem, TabType } from '@/domain/entities';
import {
  extractCategories,
  filterWordsByCategory,
  extractUnitsForCategory,
  extractAllTopics,
  filterFlashcardWords,
} from '@/domain/engines/filterEngine';
import { localStorageAdapter, STORAGE_KEYS } from '@/infrastructure/storage/localStorageAdapter';
import { progressApi } from '@/infrastructure/api/progressApi';

interface VocabState {
  allWords: WordItem[];
  categoriesList: CategoryItem[];
  currentCategory: string;
  currentUnit: string;
  currentIndex: number;
  learnedWords: Set<string>;
  filterOnlyIncomplete: boolean;
  isShuffled: boolean;
  activeTab: TabType;

  // Actions
  setInitialWords: (
    words: WordItem[],
    categories?: CategoryItem[],
    defaultCategory?: string,
    defaultUnit?: string
  ) => void;
  setCategory: (category: string) => void;
  setUnit: (unit: string) => void;
  setCurrentIndex: (index: number) => void;
  setActiveTab: (tab: TabType) => void;
  toggleLearned: (word: string) => void;
  applyFlashcardFilters: (incomplete: boolean, shuffled: boolean) => void;
  updateWord: (updatedWord: WordItem) => void;
  resetProgress: () => void;
  hydrateFromLocalStorage: () => void;
  hydrateFromProgress: (progress: {
    current_category?: string;
    current_unit?: string;
    current_index?: number;
    learned_words?: string[];
  }) => void;

  // Computed Selectors
  getCategories: () => CategoryItem[];
  getCategoryWords: () => WordItem[];
  getUnitsList: () => UnitItem[];
  getAllTopics: () => { name: string }[];
  getFilteredFlashcardWords: () => WordItem[];
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

function triggerDebouncedSync(category: string, unit: string, index: number, learned: Set<string>) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      await progressApi.syncProgress({
        current_category: category,
        current_unit: unit,
        current_index: index,
        learned_words: Array.from(learned),
        quiz_stats: {},
      });
    } catch {}
  }, 600);
}

export const useVocabStore = create<VocabState>((set, get) => {
  return {
    allWords: [],
    categoriesList: [],
    currentCategory: '',
    currentUnit: '',
    currentIndex: 0,
    learnedWords: new Set<string>(),
    filterOnlyIncomplete: false,
    isShuffled: false,
    activeTab: 'flashcards',

    hydrateFromLocalStorage: () => {
      const cachedCategory = localStorageAdapter.getItem(STORAGE_KEYS.CURRENT_CATEGORY);
      const cachedLearned = localStorageAdapter.getJSON<string[]>(STORAGE_KEYS.LEARNED_WORDS, []);
      if (cachedCategory || (cachedLearned && cachedLearned.length > 0)) {
        set((state) => ({
          currentCategory: cachedCategory || state.currentCategory,
          learnedWords: cachedLearned && cachedLearned.length > 0 ? new Set(cachedLearned) : state.learnedWords,
        }));
      }
    },

    setInitialWords: (words, categories = [], defaultCategory, defaultUnit) => {
      const state = get();
      const wordsChanged = words.length > 0 && (state.allWords.length === 0 || state.allWords !== words);
      const categoriesChanged = categories.length > 0 && state.categoriesList !== categories;

      const resolvedCategory =
        state.currentCategory ||
        defaultCategory ||
        (categories.length > 0 ? categories[0].category : (words[0]?.category || ''));
      const resolvedUnit =
        state.currentUnit ||
        defaultUnit ||
        (words[0]?.library || '');

      set({
        allWords: wordsChanged ? words : state.allWords,
        categoriesList: categoriesChanged ? categories : state.categoriesList,
        currentCategory: resolvedCategory,
        currentUnit: resolvedUnit,
      });
    },

    setCategory: (newCategory) => {
      localStorageAdapter.setItem(STORAGE_KEYS.CURRENT_CATEGORY, newCategory);
      set({
        currentCategory: newCategory,
        currentUnit: 'ALL',
        currentIndex: 0,
      });
      triggerDebouncedSync(newCategory, 'ALL', 0, get().learnedWords);
    },

    setUnit: (newUnit) => {
      set({ currentUnit: newUnit, currentIndex: 0 });
      triggerDebouncedSync(get().currentCategory, newUnit, 0, get().learnedWords);
    },

    setCurrentIndex: (index) => {
      set({ currentIndex: index });
      triggerDebouncedSync(get().currentCategory, get().currentUnit, index, get().learnedWords);
    },

    setActiveTab: (activeTab) => set({ activeTab }),

    toggleLearned: (word) => {
      set((state) => {
        const next = new Set(state.learnedWords);
        if (next.has(word)) {
          next.delete(word);
        } else {
          next.add(word);
        }
        localStorageAdapter.setJSON(STORAGE_KEYS.LEARNED_WORDS, Array.from(next));
        triggerDebouncedSync(state.currentCategory, state.currentUnit, state.currentIndex, next);
        return { learnedWords: next };
      });
    },

    applyFlashcardFilters: (incomplete, shuffled) => {
      set((state) => {
        const filterChanged = incomplete !== state.filterOnlyIncomplete;
        const shuffleChanged = shuffled !== state.isShuffled;
        return {
          filterOnlyIncomplete: incomplete,
          isShuffled: shuffled,
          currentIndex: filterChanged || shuffleChanged ? 0 : state.currentIndex,
        };
      });
    },

    updateWord: (updatedWord) => {
      set((state) => ({
        allWords: state.allWords.map((w) => (w.id === updatedWord.id ? updatedWord : w)),
      }));
    },

    resetProgress: () => {
      const empty = new Set<string>();
      localStorageAdapter.setJSON(STORAGE_KEYS.LEARNED_WORDS, []);
      set({ learnedWords: empty, currentIndex: 0 });
      triggerDebouncedSync(get().currentCategory, get().currentUnit, 0, empty);
    },

    hydrateFromProgress: (progress) => {
      set((state) => {
        const newCategory = progress.current_category || state.currentCategory;
        const newUnit = progress.current_unit || state.currentUnit;
        const newIndex = typeof progress.current_index === 'number' ? progress.current_index : state.currentIndex;
        const newLearned = Array.isArray(progress.learned_words)
          ? new Set(progress.learned_words)
          : state.learnedWords;

        if (progress.current_category) {
          localStorageAdapter.setItem(STORAGE_KEYS.CURRENT_CATEGORY, progress.current_category);
        }
        if (progress.learned_words) {
          localStorageAdapter.setJSON(STORAGE_KEYS.LEARNED_WORDS, progress.learned_words);
        }

        return {
          currentCategory: newCategory,
          currentUnit: newUnit,
          currentIndex: newIndex,
          learnedWords: newLearned,
        };
      });
    },

    // Computed
    getCategories: () => {
      const s = get();
      return extractCategories(s.allWords, s.categoriesList);
    },

    getCategoryWords: () => {
      const s = get();
      return filterWordsByCategory(s.allWords, s.currentCategory);
    },

    getUnitsList: () => {
      const s = get();
      const catWords = filterWordsByCategory(s.allWords, s.currentCategory);
      return extractUnitsForCategory(catWords);
    },

    getAllTopics: () => {
      const s = get();
      return extractAllTopics(s.allWords);
    },

    getFilteredFlashcardWords: () => {
      const s = get();
      return filterFlashcardWords({
        allWords: s.allWords,
        category: s.currentCategory,
        unit: s.currentUnit,
        filterOnlyIncomplete: s.filterOnlyIncomplete,
        isShuffled: s.isShuffled,
        learnedWords: s.learnedWords,
      });
    },
  };
});
