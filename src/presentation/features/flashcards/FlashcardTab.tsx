'use client';

import React, { useRef, useMemo } from 'react';
import { WordItem } from '@/domain/entities';
import { filterFlashcardWords, filterWordsByCategory } from '@/domain/engines/filterEngine';
import { useVocabStore } from '@/application/stores/useVocabStore';
import { useSettingsStore } from '@/application/stores/useSettingsStore';
import { useFlashcards } from '@/application/hooks/useFlashcards';
import { useCardGestures } from './useCardGestures';
import { FlashcardCard } from './FlashcardCard';
import { FlashcardControls } from './FlashcardControls';
import { FlashcardFilterModal } from './FlashcardFilterModal';

export interface FlashcardTabProps {
  words?: WordItem[];
  allUnitWordsCount?: number;
  currentIndex?: number;
  onNextCard?: () => void;
  onPrevCard?: () => void;
  currentUnit?: string;
  learnedWords?: Set<string>;
  onToggleLearned?: (word: string) => void;
  filterOnlyIncomplete?: boolean;
  onToggleFilterIncomplete?: () => void;
  isShuffled?: boolean;
  onToggleShuffle?: () => void;
  onApplyFilters?: (filterOnlyIncomplete: boolean, isShuffled: boolean) => void;
  isSoundMuted?: boolean;
  speechRate?: number;
}

export const FlashcardTab: React.FC<FlashcardTabProps> = (props) => {
  // Store subscriptions (zero prop-drilling)
  const storeAllWords = useVocabStore((s) => s.allWords);
  const storeCurrentCategory = useVocabStore((s) => s.currentCategory);
  const storeCurrentUnit = useVocabStore((s) => s.currentUnit);
  const storeCurrentIndex = useVocabStore((s) => s.currentIndex);
  const storeSetCurrentIndex = useVocabStore((s) => s.setCurrentIndex);
  const storeLearnedWords = useVocabStore((s) => s.learnedWords);
  const storeToggleLearned = useVocabStore((s) => s.toggleLearned);
  const storeFilterOnlyIncomplete = useVocabStore((s) => s.filterOnlyIncomplete);
  const storeIsShuffled = useVocabStore((s) => s.isShuffled);
  const storeApplyFlashcardFilters = useVocabStore((s) => s.applyFlashcardFilters);

  const storeIsSoundMuted = useSettingsStore((s) => s.isSoundMuted);
  const storeSpeechRate = useSettingsStore((s) => s.speechRate);

  const currentCategory = storeCurrentCategory;
  const currentUnit = props.currentUnit ?? storeCurrentUnit;
  const learnedWords = props.learnedWords ?? storeLearnedWords;
  const filterOnlyIncomplete = props.filterOnlyIncomplete ?? storeFilterOnlyIncomplete;
  const isShuffled = props.isShuffled ?? storeIsShuffled;

  // Memoize filtered words stably
  const derivedFilteredWords = useMemo(() => {
    return filterFlashcardWords({
      allWords: storeAllWords,
      category: currentCategory,
      unit: currentUnit,
      filterOnlyIncomplete,
      isShuffled,
      learnedWords,
    });
  }, [storeAllWords, currentCategory, currentUnit, filterOnlyIncomplete, isShuffled, learnedWords]);

  // Fallbacks to store
  const words = props.words ?? derivedFilteredWords;
  const currentIndex = props.currentIndex ?? storeCurrentIndex;
  const isSoundMuted = props.isSoundMuted ?? storeIsSoundMuted;
  const speechRate = props.speechRate ?? storeSpeechRate;

  const onToggleLearned = props.onToggleLearned ?? storeToggleLearned;
  const onApplyFilters = props.onApplyFilters ?? storeApplyFlashcardFilters;

  const onNextCard =
    props.onNextCard ??
    (() => {
      if (words.length === 0) return;
      storeSetCurrentIndex((currentIndex + 1) % words.length);
    });

  const onPrevCard =
    props.onPrevCard ??
    (() => {
      if (words.length === 0) return;
      storeSetCurrentIndex((currentIndex - 1 + words.length) % words.length);
    });

  const onResetFilterIncomplete =
    props.onToggleFilterIncomplete ??
    (() => {
      onApplyFilters(false, isShuffled);
    });

  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    word,
    isLearned,
    isFlipped,
    slideAnim,
    isSpeaking,
    isSpeakingExample,
    copied,
    filterModalOpen,
    setFilterModalOpen,
    handleFlip,
    handleNext,
    handlePrev,
    handleSpeakCurrent,
    handleSpeakExample,
    handleCopyExample,
    handleToggleLearned,
  } = useFlashcards({
    words,
    currentIndex,
    isSoundMuted,
    speechRate,
    learnedWords,
    onNextCard,
    onPrevCard,
    onToggleLearned,
    onApplyFilters,
  });

  // Touch Swipe & Global Keyboard listeners
  useCardGestures({
    wrapperRef,
    isFilterModalOpen: filterModalOpen,
    isSoundMuted,
    onFlip: handleFlip,
    onNext: handleNext,
    onPrev: handlePrev,
    onSpeak: handleSpeakCurrent,
    onToggleLearned: handleToggleLearned,
    onCloseModal: () => setFilterModalOpen(false),
  });

  const activeFiltersCount = (filterOnlyIncomplete ? 1 : 0) + (isShuffled ? 1 : 0);
  const formattedIdx = String(words.length > 0 ? currentIndex + 1 : 0).padStart(2, '0');
  const formattedTotal = String(words.length).padStart(2, '0');
  const progressPct =
    words.length > 0 ? Math.round(((currentIndex + 1) / words.length) * 100) : 100;

  return (
    <section
      id="tab-flashcards"
      className="flex flex-col flex-1 w-full justify-between h-full min-h-0"
    >
      {/* Top Eyebrow & Metric Progress Bar */}
      <div className="mb-2 sm:mb-3 flex-shrink-0">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span
            id="fcUnitTitle"
            className="truncate max-w-[220px] sm:max-w-xs text-primary font-semibold tracking-wide"
          >
            {currentUnit === 'ALL' ? 'All 20 Units' : currentUnit}
          </span>
          <span id="fcCounter" className="text-mute font-mono">
            {formattedIdx} / {formattedTotal}
          </span>
        </div>
        <div className="w-full bg-canvas-soft h-1 rounded-none border-b border-hairline">
          <div
            id="fcProgressBar"
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Card or Empty State */}
      <FlashcardCard
        word={word}
        totalWords={words.length}
        isFlipped={isFlipped}
        slideAnim={slideAnim}
        isLearned={isLearned}
        isSpeakingExample={isSpeakingExample}
        copied={copied}
        isSoundMuted={isSoundMuted}
        wrapperRef={wrapperRef}
        onFlip={handleFlip}
        onSpeakExample={handleSpeakExample}
        onCopyExample={handleCopyExample}
        onResetFilterIncomplete={onResetFilterIncomplete}
      />

      {/* Controls Row */}
      <FlashcardControls
        isLearned={isLearned}
        isSpeaking={isSpeaking}
        activeFiltersCount={activeFiltersCount}
        onSpeakCurrent={handleSpeakCurrent}
        onToggleLearned={handleToggleLearned}
        onOpenFilterModal={() => setFilterModalOpen(true)}
      />

      {/* Filter Modal Popup */}
      <FlashcardFilterModal
        isOpen={filterModalOpen}
        filterOnlyIncomplete={filterOnlyIncomplete}
        isShuffled={isShuffled}
        isSoundMuted={isSoundMuted}
        onClose={() => setFilterModalOpen(false)}
        onApplyFilters={onApplyFilters}
      />
    </section>
  );
};
