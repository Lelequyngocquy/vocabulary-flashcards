import { useState, useCallback, useRef, useEffect } from 'react';
import { WordItem, QuizQuestion, QuizMode, QuizViewState } from '@/domain/entities';
import {
  generateQuizQuestions,
  evaluateQuizAnswer,
  calculateQuizAccuracy,
} from '@/domain/engines/quizEngine';
import {
  playTapSound,
  playCorrectSound,
  playErrorSound,
  playChimeSound,
} from '@/infrastructure/device/audioService';
import { speakText } from '@/infrastructure/device/speechService';
import confetti from 'canvas-confetti';

export interface UseQuizOptions {
  allWords: WordItem[];
  currentUnit: string;
  isSoundMuted: boolean;
  speechRate: number;
  onWordMastered?: (word: string) => void;
}

export function useQuiz(options: UseQuizOptions) {
  const { allWords, currentUnit, isSoundMuted, speechRate, onWordMastered } = options;

  const [viewState, setViewState] = useState<QuizViewState>('intro');
  const [quizLength, setQuizLength] = useState<string>('20');
  const [quizMode, setQuizMode] = useState<QuizMode>('MIX');

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, []);

  const startQuiz = useCallback(
    (customLength?: string, customMode?: QuizMode) => {
      const activeLength = customLength || quizLength;
      const activeMode = customMode || quizMode;

      const generated = generateQuizQuestions({
        allWords,
        currentUnit,
        quizMode: activeMode,
        quizLength: activeLength === 'ALL' ? 'ALL' : parseInt(activeLength, 10) || 20,
      });

      setQuestions(generated);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setAnswered(false);
      setSelectedIdx(null);
      setViewState('active');
    },
    [allWords, currentUnit, quizLength, quizMode]
  );

  const currentQuestion = questions[currentIndex] || null;

  const handleNextQuestion = useCallback(
    (nextIdx: number, currentScore: number) => {
      if (nextIdx < questions.length) {
        setCurrentIndex(nextIdx);
        setAnswered(false);
        setSelectedIdx(null);
      } else {
        setViewState('result');
        const { isMastered } = calculateQuizAccuracy(currentScore, questions.length);
        if (isMastered) {
          playChimeSound(isSoundMuted);
          try {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          } catch {}
        }
      }
    },
    [questions.length, isSoundMuted]
  );

  const selectOption = useCallback(
    (optIdx: number) => {
      if (answered || !currentQuestion) return;

      setAnswered(true);
      setSelectedIdx(optIdx);

      const { isCorrect } = evaluateQuizAnswer(currentQuestion, optIdx);

      let newScore = score;
      if (isCorrect) {
        newScore = score + 1;
        setScore(newScore);
        setStreak((s) => s + 1);
        playCorrectSound(isSoundMuted);
        if (onWordMastered) {
          onWordMastered(currentQuestion.target.word);
        }
      } else {
        setStreak(0);
        playErrorSound(isSoundMuted);
      }

      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = setTimeout(() => {
        handleNextQuestion(currentIndex + 1, newScore);
      }, 1200);
    },
    [answered, currentQuestion, score, isSoundMuted, onWordMastered, handleNextQuestion, currentIndex]
  );

  const speakPrompt = useCallback(() => {
    if (currentQuestion?.target?.word) {
      playTapSound(isSoundMuted);
      speakText(currentQuestion.target.word, speechRate);
    }
  }, [currentQuestion, isSoundMuted, speechRate]);

  const restartQuiz = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    setViewState('intro');
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setAnswered(false);
    setSelectedIdx(null);
  }, []);

  const accuracy = calculateQuizAccuracy(score, questions.length);

  return {
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
    accuracyPct: accuracy.accuracyPct,
    setQuizLength,
    setQuizMode,
    startQuiz,
    selectOption,
    speakPrompt,
    restartQuiz,
  };
}
