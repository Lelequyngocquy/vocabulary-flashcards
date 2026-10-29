'use client';

import React from 'react';
import { QuizMode } from '@/domain/entities';
import { playTapSound } from '@/infrastructure/device/audioService';

interface QuizIntroViewProps {
  quizLength: string;
  quizMode: QuizMode;
  isSoundMuted: boolean;
  onQuizLengthChange: (length: string) => void;
  onQuizModeChange: (mode: QuizMode) => void;
  onStartQuiz: () => void;
}

export const QuizIntroView: React.FC<QuizIntroViewProps> = ({
  quizLength,
  quizMode,
  isSoundMuted,
  onQuizLengthChange,
  onQuizModeChange,
  onStartQuiz,
}) => {
  return (
    <div
      id="quizIntro"
      className="bg-canvas rounded-[8px] p-6 border border-hairline text-center space-y-4 my-auto"
    >
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-canvas-soft border border-hairline text-primary font-mono text-xs">
        <span>⚡</span> VOCALNQ_QUIZ_ENGINE
      </div>
      <div>
        <h2 className="text-2xl font-normal text-ink-strong tracking-tight">Vocabulary Evaluation</h2>
        <p className="text-xs text-body mt-1">
          4-choice algorithmic multiple choice testing with real-time accuracy telemetry.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-left font-mono">
        <div className="bg-canvas-soft p-2.5 rounded-[6px] border border-hairline">
          <label className="text-[10px] text-mute uppercase tracking-widest block mb-1">
            QUESTIONS
          </label>
          <select
            id="quizLength"
            value={quizLength}
            onChange={(e) => {
              playTapSound(isSoundMuted);
              onQuizLengthChange(e.target.value);
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
          <label className="text-[10px] text-mute uppercase tracking-widest block mb-1">
            DIRECTION
          </label>
          <select
            id="quizModeSelect"
            value={quizMode}
            onChange={(e) => {
              playTapSound(isSoundMuted);
              onQuizModeChange(e.target.value as QuizMode);
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
          onStartQuiz();
        }}
        className="w-full py-2.5 rounded-[6px] bg-primary hover:bg-primary-soft text-primary-on font-semibold text-xs sm:text-sm transition-all tap-bounce font-mono uppercase tracking-wider cursor-pointer"
      >
        Initialize Test ➔
      </button>
    </div>
  );
};
