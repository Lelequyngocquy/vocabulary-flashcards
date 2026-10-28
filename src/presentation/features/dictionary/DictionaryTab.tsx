'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { WordItem } from '@/domain/entities';
import {
  extractCategories,
  extractAllTopics,
  filterWordsByCategory,
} from '@/domain/engines/filterEngine';
import { playTapSound, playChimeSound } from '@/infrastructure/device/audioService';
import { speakText } from '@/infrastructure/device/speechService';
import { useVocabStore } from '@/application/stores/useVocabStore';
import { useSettingsStore } from '@/application/stores/useSettingsStore';
import { useAuthStore } from '@/application/stores/useAuthStore';
import { useToastStore } from '@/application/stores/useToastStore';
import { useDictionary } from '@/application/hooks/useDictionary';
import { DictionaryToolbar } from './DictionaryToolbar';
import { DictionaryItem } from './DictionaryItem';
import { EditWordModal } from './EditWordModal';

export interface DictionaryTabProps {
  words?: WordItem[];
  allWords?: WordItem[];
  currentUnit?: string;
  learnedWords?: Set<string>;
  onToggleLearned?: (word: string) => void;
  isSoundMuted?: boolean;
  speechRate?: number;
  categoriesList?: { id: number; category: string }[];
  allTopicsList?: { name: string }[];
  onWordUpdated?: (updatedWord: WordItem) => void;
  isAdmin?: boolean;
  authToken?: string | null;
  onShowToast?: (msg: string, isError?: boolean) => void;
}

export const DictionaryTab: React.FC<DictionaryTabProps> = (props) => {
  // Store subscriptions (zero prop-drilling)
  const storeAllWords = useVocabStore((s) => s.allWords);
  const storeCategoriesList = useVocabStore((s) => s.categoriesList);
  const storeCurrentCategory = useVocabStore((s) => s.currentCategory);
  const storeCurrentUnit = useVocabStore((s) => s.currentUnit);
  const storeLearnedWords = useVocabStore((s) => s.learnedWords);
  const storeToggleLearned = useVocabStore((s) => s.toggleLearned);
  const storeUpdateWord = useVocabStore((s) => s.updateWord);

  const storeIsSoundMuted = useSettingsStore((s) => s.isSoundMuted);
  const storeSpeechRate = useSettingsStore((s) => s.speechRate);

  const storeAuthToken = useAuthStore((s) => s.authToken);
  const storeIsAdmin = useAuthStore((s) => s.isAdmin);
  const storeShowToast = useToastStore((s) => s.showToast);

  // Fallbacks to store
  const allWords = props.allWords ?? storeAllWords;
  const currentCategory = storeCurrentCategory;

  const derivedCategoryWords = useMemo(
    () => filterWordsByCategory(allWords, currentCategory),
    [allWords, currentCategory]
  );
  const words = props.words ?? derivedCategoryWords;

  const derivedCategories = useMemo(
    () => extractCategories(allWords, storeCategoriesList),
    [allWords, storeCategoriesList]
  );
  const categoriesList = props.categoriesList ?? derivedCategories;

  const derivedTopics = useMemo(
    () => extractAllTopics(allWords),
    [allWords]
  );
  const allTopicsList = props.allTopicsList ?? derivedTopics;

  const currentUnit = props.currentUnit ?? storeCurrentUnit;
  const learnedWords = props.learnedWords ?? storeLearnedWords;
  const isSoundMuted = props.isSoundMuted ?? storeIsSoundMuted;
  const speechRate = props.speechRate ?? storeSpeechRate;
  const isAdmin = props.isAdmin !== undefined ? props.isAdmin : storeIsAdmin;
  const authToken = props.authToken !== undefined ? props.authToken : storeAuthToken;

  const onToggleLearned = props.onToggleLearned ?? storeToggleLearned;
  const onWordUpdated = props.onWordUpdated ?? storeUpdateWord;
  const onShowToast = props.onShowToast ?? storeShowToast;

  const listContainerRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useDictionary({
    words,
    currentUnit,
    learnedWords,
  });

  // Auto scroll to top on filter change
  useEffect(() => {
    if (listContainerRef.current) {
      listContainerRef.current.scrollTop = 0;
    }
  }, [search, posFilter, statusFilter, currentUnit]);

  const handleSpeak = (wordText: string) => {
    playTapSound(isSoundMuted);
    speakText(wordText, speechRate);
  };

  const handleToggle = (wordText: string) => {
    if (learnedWords.has(wordText)) {
      playTapSound(isSoundMuted);
    } else {
      playChimeSound(isSoundMuted);
    }
    onToggleLearned(wordText);
  };

  const handleOpenEdit = (w: WordItem) => {
    playTapSound(isSoundMuted);
    const defaultCatName = categoriesList[0]?.category || 'General';
    const isDefaultCat = w.category_id === 1 || !w.category || w.category === defaultCatName;
    if (isDefaultCat && !isAdmin) {
      onShowToast(`Only Admin accounts can modify the default ${defaultCatName}.`, true);
      return;
    }
    openEditWord(w);
  };

  return (
    <section
      id="tab-dictionary"
      className="flex flex-col flex-1 w-full justify-start space-y-2.5 min-h-0 overflow-hidden"
    >
      {/* Search & Filter Toolbar */}
      <DictionaryToolbar
        search={search}
        posFilter={posFilter}
        statusFilter={statusFilter}
        resultsCount={filteredWords.length}
        currentUnit={currentUnit}
        isSoundMuted={isSoundMuted}
        onSearchChange={setSearch}
        onPosFilterChange={setPosFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Scrollable Word List */}
      <div
        id="dictListContainer"
        ref={listContainerRef}
        className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1 pb-4"
      >
        {filteredWords.length === 0 ? (
          <div className="text-center py-8 bg-canvas rounded-[8px] border border-hairline text-mute font-mono">
            <p className="text-xs">// NO_MATCHING_RECORDS_FOUND</p>
          </div>
        ) : (
          filteredWords.map((w) => (
            <DictionaryItem
              key={w.id}
              word={w}
              isMastered={learnedWords.has(w.word)}
              onSpeak={handleSpeak}
              onToggleLearned={handleToggle}
              onOpenEdit={handleOpenEdit}
            />
          ))
        )}
      </div>

      {/* Edit Word Modal */}
      <EditWordModal
        word={editingWord}
        isOpen={isEditModalOpen}
        onClose={closeEditWord}
        onWordUpdated={onWordUpdated}
        categoriesList={categoriesList}
        allWords={allWords}
        isSoundMuted={isSoundMuted}
        isAdmin={isAdmin}
        authToken={authToken}
      />
    </section>
  );
};
