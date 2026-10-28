import {
  WordItem,
  CategoryItem,
  UnitItem,
  PosFilterType,
  StatusFilterType,
} from '../entities';
import { shuffleArray } from './quizEngine';

export function parseUnitNumber(unitName: string): number {
  const match = unitName.match(/Unit\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : 999;
}

export function extractCategories(
  words: readonly WordItem[],
  existingCategories: readonly CategoryItem[] = []
): CategoryItem[] {
  if (existingCategories.length > 0) {
    return [...existingCategories];
  }

  const categorySet = new Set<string>();
  words.forEach((w) => {
    if (w.category) categorySet.add(w.category);
  });

  return Array.from(categorySet).map((cat, idx) => ({
    id: idx + 1,
    category: cat,
    display_order: idx + 1,
  }));
}

export function filterWordsByCategory(
  words: readonly WordItem[],
  category: string
): WordItem[] {
  if (!category) return [...words];
  return words.filter((w) => !w.category || w.category === category);
}

export function extractUnitsForCategory(
  categoryWords: readonly WordItem[]
): UnitItem[] {
  const countMap = new Map<string, number>();
  categoryWords.forEach((w) => {
    if (w.library) {
      countMap.set(w.library, (countMap.get(w.library) || 0) + 1);
    }
  });

  const list: UnitItem[] = Array.from(countMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  list.sort((a, b) => parseUnitNumber(a.name) - parseUnitNumber(b.name));
  return list;
}

export function extractAllTopics(words: readonly WordItem[]): { name: string }[] {
  const topicSet = new Set<string>();
  words.forEach((w) => {
    if (w.library) topicSet.add(w.library);
  });

  const list = Array.from(topicSet).map((name) => ({ name }));
  list.sort((a, b) => parseUnitNumber(a.name) - parseUnitNumber(b.name));
  return list;
}

export interface FilterFlashcardsParams {
  allWords: readonly WordItem[];
  category?: string;
  unit: string;
  filterOnlyIncomplete: boolean;
  isShuffled: boolean;
  learnedWords: ReadonlySet<string>;
}

export function filterFlashcardWords(params: FilterFlashcardsParams): WordItem[] {
  const { allWords, category, unit, filterOnlyIncomplete, isShuffled, learnedWords } = params;

  let pool = category ? filterWordsByCategory(allWords, category) : [...allWords];

  if (unit && unit !== 'ALL') {
    pool = pool.filter((w) => w.library === unit);
  }

  if (filterOnlyIncomplete) {
    pool = pool.filter((w) => !learnedWords.has(w.word));
  }

  if (isShuffled) {
    pool = shuffleArray(pool);
  }

  return pool;
}

export interface FilterDictionaryParams {
  words: readonly WordItem[];
  unit: string;
  searchQuery: string;
  posFilter: PosFilterType;
  statusFilter: StatusFilterType;
  learnedWords: ReadonlySet<string>;
}

export function filterDictionaryWords(params: FilterDictionaryParams): WordItem[] {
  const { words, unit, searchQuery, posFilter, statusFilter, learnedWords } = params;

  let result = unit === 'ALL' ? [...words] : words.filter((w) => w.library === unit);

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    result = result.filter(
      (w) => w.word.toLowerCase().includes(query) || w.meaning.toLowerCase().includes(query)
    );
  }

  if (posFilter !== 'ALL') {
    const targetPos = posFilter.toLowerCase();
    result = result.filter((w) => w.type && w.type.toLowerCase().startsWith(targetPos));
  }

  if (statusFilter === 'LEARNED') {
    result = result.filter((w) => learnedWords.has(w.word));
  } else if (statusFilter === 'UNLEARNED') {
    result = result.filter((w) => !learnedWords.has(w.word));
  }

  return result;
}
