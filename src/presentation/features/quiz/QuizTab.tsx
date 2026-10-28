'use client';

import React, { useMemo } from 'react';
import { WordItem } from '@/domain/entities';
import { filterWordsByCategory } from '@/domain/engines/filterEngine';
import { useQuiz } from '@/application/hooks/useQuiz';
import { useVocabStore } from '@/application/stores/useVocabStore';
import { useSettingsStore } from '@/application/stores/useSettingsStore';
import { QuizIntroView } from './QuizIntroView';
import { QuizActiveView } from './QuizActiveView';
import { QuizResultView } from './QuizResultView';

export interface QuizTabProps {
  allWords?: WordItem[];
  currentUnit?: string;
  onWordMastered?: (word: string) => void;
  isSoundMuted?: boolean;
  onSwitchToFlashcards?: () => void;
  speechRate?: number;
}

export const QuizTab: React.FC<QuizTabProps> = (props) => {
  // Store subscriptions (zero prop-drilling)
  const storeAllWords = useVocabStore((s) => s.allWords);
  const storeCurrentCategory = useVocabStore((s) => s.currentCategory);
  const storeCurrentUnit = useVocabStore((s) => s.currentUnit);
  const storeToggleLearned = useVocabStore((s) => s.toggleLearned);
  const storeSetActiveTab = useVocabStore((s) => s.setActiveTab);

  const storeIsSoundMuted = useSettingsStore((s) => s.isSoundMuted);
  const storeSpeechRate = useSettingsStore((s) => s.speechRate);

  const categoryWords = useMemo(
    () => (props.allWords ? props.allWords : filterWordsByCategory(storeAllWords, storeCurrentCategory)),
    [props.allWords, storeAllWords, storeCurrentCategory]
  );

  // Fallbacks to store
  const allWords = categoryWords;
  const currentUnit = props.currentUnit ?? storeCurrentUnit;
  const isSoundMuted = props.isSoundMuted ?? storeIsSoundMuted;
  const speechRate = props.speechRate ?? storeSpeechRate;

  const onWordMastered = props.onWordMastered ?? storeToggleLearned;
  const onSwitchToFlashcards = props.onSwitchToFlashcards ?? (() => storeSetActiveTab('flashcards'));

  const {
    viewState,
    quizLength,
    quizMode,
    questions,
    currentIndex,
    currentQuestion,
    score,
    streak,
    answered,
    selectedIdx,
    accuracyPct,
    setQuizLength,
    setQuizMode,
    startQuiz,
    selectOption,
    speakPrompt,
    restartQuiz,
  } = useQuiz({
    allWords,
    currentUnit,
    isSoundMuted,
    speechRate,
    onWordMastered,
  });

  return (
    <section
      id="tab-quiz"
      className="flex flex-col flex-1 w-full justify-start space-y-3 min-h-0 overflow-y-auto pb-4"
    >
      {viewState === 'intro' && (
        <QuizIntroView
          quizLength={quizLength}
          quizMode={quizMode}
          isSoundMuted={isSoundMuted}
          onQuizLengthChange={setQuizLength}
          onQuizModeChange={setQuizMode}
          onStartQuiz={() => startQuiz()}
        />
      )}

      {viewState === 'active' && currentQuestion && (
        <QuizActiveView
          currentQuestion={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          score={score}
          streak={streak}
          answered={answered}
          selectedIdx={selectedIdx}
          isSoundMuted={isSoundMuted}
          onSelectOption={selectOption}
          onNextQuestion={(nextIdx) => {
            // Managed internally by useQuiz onSelectOption auto-advance
          }}
          onSpeakPrompt={speakPrompt}
        />
      )}

      {viewState === 'result' && (
        <QuizResultView
          score={score}
          totalQuestions={questions.length}
          accuracyPct={accuracyPct}
          isSoundMuted={isSoundMuted}
          onRetry={restartQuiz}
          onSwitchToFlashcards={onSwitchToFlashcards}
        />
      )}
    </section>
  );
};
