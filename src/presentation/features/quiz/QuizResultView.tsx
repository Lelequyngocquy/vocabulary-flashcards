'use client';

import React from 'react';
import { playTapSound } from '@/infrastructure/device/audioService';

interface QuizResultViewProps {
  score: number;
  totalQuestions: number;
  accuracyPct: number;
  isSoundMuted: boolean;
  onRetry: () => void;
  onSwitchToFlashcards: () => void;
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({
  score,
  totalQuestions,
  accuracyPct,
  isSoundMuted,
  onRetry,
  onSwitchToFlashcards,
}) => {
  return (
    <div
      id="quizResult"
      className="bg-canvas rounded-[8px] p-6 border border-hairline text-center space-y-4 my-auto font-mono"
    >
      <div className="text-primary text-3xl font-mono">⚡</div>
      <div>
        <h2 className="text-xl font-normal text-ink-strong tracking-tight">Evaluation Completed</h2>
        <p id="quizResultSubtitle" className="text-body text-xs mt-1">
          Accuracy Telemetry Report
        </p>
      </div>

      <div className="p-4 rounded-[6px] bg-canvas-soft border border-hairline max-w-xs mx-auto">
        <div id="quizFinalScore" className="text-3xl font-bold text-primary">
          {score} / {totalQuestions}
        </div>
        <div id="quizFinalPercentage" className="text-xs text-ink mt-1 font-mono">
          ACCURACY: {accuracyPct}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto text-xs">
        <button
          onClick={() => {
            playTapSound(isSoundMuted);
            onRetry();
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
  );
};
