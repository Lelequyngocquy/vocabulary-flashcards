'use client';

import React, { useState } from 'react';
import { WordItem, QuizQuestion } from '@/types';
import {
  playTapSound,
  playCorrectSound,
  playErrorSound,
  playChimeSound,
  speakText,
} from '@/lib/audio';
import confetti from 'canvas-confetti';

interface QuizTabProps {
  allWords: WordItem[];
  currentUnit: string;
  onWordMastered: (word: string) => void;
  isSoundMuted: boolean;
  onSwitchToFlashcards: () => void;
  speechRate: number;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  allWords,
  currentUnit,
  onWordMastered,
  isSoundMuted,
  onSwitchToFlashcards,
  speechRate,
}) => {
  const [viewState, setViewState] = useState<'intro' | 'active' | 'result'>('intro');
  const [quizLength, setQuizLength] = useState<string>('20');
  const [quizMode, setQuizMode] = useState<'EN_TO_VI' | 'VI_TO_EN' | 'MIX'>('MIX');

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Shuffle helper
  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Start Quiz
  const startQuiz = () => {
    let pool = currentUnit === 'ALL' ? [...allWords] : allWords.filter((w) => w.library === currentUnit);
    if (pool.length < 4) pool = [...allWords];
    pool = shuffle(pool);

    const count = quizLength === 'ALL' ? pool.length : Math.min(parseInt(quizLength, 10), pool.length);
    const generated: QuizQuestion[] = [];

    for (let i = 0; i < count; i++) {
      const target = pool[i];
      let isEnToVi = true;
      if (quizMode === 'VI_TO_EN') isEnToVi = false;
      else if (quizMode === 'MIX') isEnToVi = Math.random() > 0.5;

      const otherWords = shuffle(allWords.filter((w) => w.word !== target.word));
      const distractors = [otherWords[0], otherWords[1], otherWords[2]];

      const options = shuffle([
        { text: isEnToVi ? target.meaning : target.word, isCorrect: true },
        { text: isEnToVi ? distractors[0].meaning : distractors[0].word, isCorrect: false },
        { text: isEnToVi ? distractors[1].meaning : distractors[1].word, isCorrect: false },
        { text: isEnToVi ? distractors[2].meaning : distractors[2].word, isCorrect: false },
      ]);

      generated.push({
        target,
        isEnToVi,
        prompt: isEnToVi ? target.word : target.meaning,
        options,
      });
    }

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setAnswered(false);
    setSelectedIdx(null);
    setViewState('active');
  };

  const currentQ = questions[currentIndex];

  // Handle Answer
  const handleSelectOption = (optIdx: number) => {
    if (answered || !currentQ) return;
    setAnswered(true);
    setSelectedIdx(optIdx);

    const chosen = currentQ.options[optIdx];
    if (chosen.isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      playCorrectSound(isSoundMuted);
      onWordMastered(currentQ.target.word);
    } else {
      setStreak(0);
      playErrorSound(isSoundMuted);
    }

    // Auto advance after 1.2s
    setTimeout(() => {
      handleNextQuestion(currentIndex + 1);
    }, 1200);
  };

  const handleNextQuestion = (nextIdx: number) => {
    if (nextIdx < questions.length) {
      setCurrentIndex(nextIdx);
      setAnswered(false);
      setSelectedIdx(null);
    } else {
      setViewState('result');
      const finalPct = Math.round(((score + (questions[currentIndex]?.options[selectedIdx ?? 0]?.isCorrect ? 1 : 0)) / questions.length) * 100);
      if (finalPct >= 80) {
        playChimeSound(isSoundMuted);
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch {}
      }
    }
  };

  const handleSpeakPrompt = () => {
    if (currentQ?.target?.word) {
      playTapSound(isSoundMuted);
      speakText(currentQ.target.word, speechRate);
    }
  };

  const formattedIdx = String(currentIndex + 1).padStart(2, '0');
  const formattedTotal = String(questions.length).padStart(2, '0');
  const progressPct = questions.length > 0 ? Math.round((currentIndex / questions.length) * 100) : 0;
  const accuracyPct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <section id="tab-quiz" className="flex flex-col flex-1 w-full justify-start space-y-3 min-h-0 overflow-y-auto pb-4">
      {/* INTRO SCREEN */}
      {viewState === 'intro' && (
        <div id="quizIntro" className="bg-canvas rounded-[8px] p-6 border border-hairline text-center space-y-4 my-auto">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-canvas-soft border border-hairline text-primary font-mono text-xs">
            <span>⚡</span> VOLTAGENT_QUIZ_ENGINE
          </div>
          <div>
            <h2 className="text-2xl font-normal text-ink-strong tracking-tight">Vocabulary Evaluation</h2>
            <p className="text-xs text-body mt-1">
              4-choice algorithmic multiple choice testing with real-time accuracy telemetry.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left font-mono">
            <div className="bg-canvas-soft p-2.5 rounded-[6px] border border-hairline">
              <label className="text-[10px] text-mute uppercase tracking-widest block mb-1">QUESTIONS</label>
              <select
                id="quizLength"
                value={quizLength}
                onChange={(e) => {
                  playTapSound(isSoundMuted);
                  setQuizLength(e.target.value);
                }}
                className="w-full bg-canvas text-ink text-xs rounded-[4px] border border-hairline p-1.5 focus:border-primary outline-none cursor-pointer"
              >
                <option value="10">10 Questions</option>
                <option value="20">20 Questions</option>
                <option value="30">30 Questions</option>
                <option value="ALL">All Unit Words</option>
              </select>
            </div>
            <div className="bg-canvas-soft p-2.5 rounded-[6px] border border-hairline">
              <label className="text-[10px] text-mute uppercase tracking-widest block mb-1">DIRECTION</label>
              <select
                id="quizModeSelect"
                value={quizMode}
                onChange={(e) => {
                  playTapSound(isSoundMuted);
                  setQuizMode(e.target.value as 'EN_TO_VI' | 'VI_TO_EN' | 'MIX');
                }}
                className="w-full bg-canvas text-ink text-xs rounded-[4px] border border-hairline p-1.5 focus:border-primary outline-none cursor-pointer"
              >
                <option value="EN_TO_VI">EN ➔ VI</option>
                <option value="VI_TO_EN">VI ➔ EN</option>
                <option value="MIX">Random Mix</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound(isSoundMuted);
              startQuiz();
            }}
            className="w-full py-2.5 rounded-[6px] bg-primary hover:bg-primary-soft text-primary-on font-semibold text-xs sm:text-sm transition-all tap-bounce font-mono uppercase tracking-wider cursor-pointer"
          >
            Initialize Test ➔
          </button>
        </div>
      )}

      {/* ACTIVE QUIZ SCREEN */}
      {viewState === 'active' && currentQ && (
        <div id="quizActive" className="flex flex-col gap-3 font-mono">
          <div className="flex items-center justify-between text-xs text-mute">
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold" id="quizCurrentProgress">
                QUESTION {formattedIdx}/{formattedTotal}
              </span>
              <span className="text-hairline">•</span>
              <span id="quizStreak" className="text-ink">
                STREAK: {streak}
              </span>
            </div>
            <div className="text-primary" id="quizScoreText">
              SCORE: {score}
            </div>
          </div>

          <div className="w-full bg-canvas-soft h-1 rounded-none border-b border-hairline">
            <div
              id="quizProgressBar"
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="bg-canvas rounded-[8px] p-5 border border-hairline space-y-4">
            <div className="text-center font-sans">
              <span
                id="quizPromptType"
                className="text-[10px] font-mono uppercase tracking-[2.52px] text-mute px-2 py-0.5 rounded-[4px] bg-canvas-soft border border-hairline inline-block mb-1.5"
              >
                {currentQ.isEnToVi ? 'TERM' : 'DEFINITION'}
              </span>
              <div className="flex items-center justify-center gap-2">
                <h3
                  id="quizQuestionPrompt"
                  className="text-2xl sm:text-3xl font-medium text-ink-strong tracking-tight"
                >
                  {currentQ.prompt}
                </h3>
                {currentQ.isEnToVi && (
                  <button
                    onClick={handleSpeakPrompt}
                    id="quizAudioBtn"
                    className="text-primary p-1.5 rounded-[4px] bg-canvas-soft border border-hairline hover:bg-canvas transition-all tap-bounce cursor-pointer"
                    title="Pronounce"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div id="quizOptionsContainer" className="grid grid-cols-1 gap-3 sm:gap-3.5 pt-1 font-sans">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = 'bg-canvas-soft hover:bg-canvas border-hairline text-ink';
                let statusText = '';

                if (answered) {
                  if (opt.isCorrect) {
                    btnStyle = 'bg-canvas-soft border-primary text-primary';
                    statusText = selectedIdx === idx ? '[OK]' : '[CORRECT]';
                  } else if (selectedIdx === idx) {
                    btnStyle = 'bg-canvas-soft border-rose-500 text-rose-400';
                    statusText = '[FAIL]';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={answered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-[8px] min-h-[48px] border font-medium text-xs sm:text-sm flex items-center justify-between gap-3 active:scale-[0.98] transition-all tap-bounce cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-[4px] bg-canvas border border-hairline text-mute flex items-center justify-center text-[10px] font-mono">
                        {['A', 'B', 'C', 'D'][idx]}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                    {statusText && <span className="opt-status-icon text-xs font-mono">{statusText}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div id="quizFeedbackControls" className="flex items-center justify-end font-mono">
            {answered && (
              <button
                id="quizNextBtn"
                onClick={() => {
                  playTapSound(isSoundMuted);
                  handleNextQuestion(currentIndex + 1);
                }}
                className="px-4 py-2 rounded-[6px] bg-primary text-primary-on font-semibold text-xs transition-all tap-bounce cursor-pointer"
              >
                NEXT QUESTION ➔
              </button>
            )}
          </div>
        </div>
      )}

      {/* RESULT SCREEN */}
      {viewState === 'result' && (
        <div id="quizResult" className="bg-canvas rounded-[8px] p-6 border border-hairline text-center space-y-4 my-auto font-mono">
          <div className="text-primary text-3xl font-mono">⚡</div>
          <div>
            <h2 className="text-xl font-normal text-ink-strong tracking-tight">Evaluation Completed</h2>
            <p id="quizResultSubtitle" className="text-body text-xs mt-1">
              Accuracy Telemetry Report
            </p>
          </div>

          <div className="p-4 rounded-[6px] bg-canvas-soft border border-hairline max-w-xs mx-auto">
            <div id="quizFinalScore" className="text-3xl font-bold text-primary">
              {score} / {questions.length}
            </div>
            <div id="quizFinalPercentage" className="text-xs text-ink mt-1 font-mono">
              ACCURACY: {accuracyPct}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto text-xs">
            <button
              onClick={() => {
                playTapSound(isSoundMuted);
                startQuiz();
              }}
              className="py-2 px-3 rounded-[6px] bg-primary text-primary-on font-semibold transition-all tap-bounce cursor-pointer"
            >
              RETRY TEST
            </button>
            <button
              onClick={() => {
                playTapSound(isSoundMuted);
                onSwitchToFlashcards();
              }}
              className="py-2 px-3 rounded-[6px] bg-canvas-soft hover:bg-canvas border border-hairline text-ink transition-all tap-bounce cursor-pointer"
            >
              FLASHCARDS
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
