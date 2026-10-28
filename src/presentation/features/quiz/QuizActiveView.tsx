'use client';

import React from 'react';
import { QuizQuestion } from '@/domain/entities';
import { playTapSound } from '@/infrastructure/device/audioService';

interface QuizActiveViewProps {
  currentQuestion: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  answered: boolean;
  selectedIdx: number | null;
  isSoundMuted: boolean;
  onSelectOption: (idx: number) => void;
  onNextQuestion: (nextIdx: number) => void;
  onSpeakPrompt: () => void;
}

export const QuizActiveView: React.FC<QuizActiveViewProps> = ({
  currentQuestion,
  currentIndex,
  totalQuestions,
  score,
  streak,
  answered,
  selectedIdx,
  isSoundMuted,
  onSelectOption,
  onNextQuestion,
  onSpeakPrompt,
}) => {
  const formattedIdx = String(currentIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalQuestions).padStart(2, '0');
  const progressPct = totalQuestions > 0 ? Math.round((currentIndex / totalQuestions) * 100) : 0;

  return (
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
            {currentQuestion.isEnToVi ? 'TERM' : 'DEFINITION'}
          </span>
          <div className="flex items-center justify-center gap-2">
            <h3
              id="quizQuestionPrompt"
              className="text-2xl sm:text-3xl font-medium text-ink-strong tracking-tight"
            >
              {currentQuestion.prompt}
            </h3>
            {currentQuestion.isEnToVi && (
              <button
                onClick={onSpeakPrompt}
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
          {currentQuestion.options.map((opt, idx) => {
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
                onClick={() => onSelectOption(idx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-[8px] min-h-[48px] border font-medium text-xs sm:text-sm flex items-center justify-between gap-3 active:scale-[0.98] transition-all tap-bounce cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-[4px] bg-canvas border border-hairline text-mute flex items-center justify-center text-[10px] font-mono">
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <span>{opt.text}</span>
                </div>
                {statusText && (
                  <span className="opt-status-icon text-xs font-mono">{statusText}</span>
                )}
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
              onNextQuestion(currentIndex + 1);
            }}
            className="px-4 py-2 rounded-[6px] bg-primary text-primary-on font-semibold text-xs transition-all tap-bounce cursor-pointer"
          >
            NEXT QUESTION ➔
          </button>
        )}
      </div>
    </div>
  );
};
