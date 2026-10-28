import { useState, useMemo } from 'react';
import { WordItem, PosFilterType, StatusFilterType } from '@/domain/entities';
import { filterDictionaryWords } from '@/domain/engines/filterEngine';

export interface UseDictionaryOptions {
  words: readonly WordItem[];
  currentUnit: string;
  learnedWords: ReadonlySet<string>;
}

export function useDictionary(options: UseDictionaryOptions) {
  const { words, currentUnit, learnedWords } = options;

  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState<PosFilterType>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');

  const [editingWord, setEditingWord] = useState<WordItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const filteredWords = useMemo(() => {
    return filterDictionaryWords({
      words,
      unit: currentUnit,
      searchQuery: search,
      posFilter,
      statusFilter,
      learnedWords,
    });
  }, [words, currentUnit, search, posFilter, statusFilter, learnedWords]);

  const openEditWord = (word: WordItem) => {
    setEditingWord(word);
    setIsEditModalOpen(true);
  };

  const closeEditWord = () => {
    setEditingWord(null);
    setIsEditModalOpen(false);
  };

  return {
    search,
    posFilter,
    statusFilter,
    filteredWords,
    editingWord,
    isEditModalOpen,
    setSearch,
    setPosFilter,
    setStatusFilter,
    openEditWord,
    closeEditWord,
  };
}
