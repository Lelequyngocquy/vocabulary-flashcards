'use client';

import React from 'react';

interface FlashcardControlsProps {
  isLearned: boolean;
  isSpeaking: boolean;
  activeFiltersCount: number;
  onSpeakCurrent: () => void;
  onToggleLearned: () => void;
  onOpenFilterModal: () => void;
}

export const FlashcardControls: React.FC<FlashcardControlsProps> = ({
  isLearned,
  isSpeaking,
  activeFiltersCount,
  onSpeakCurrent,
  onToggleLearned,
  onOpenFilterModal,
}) => {
  return (
    <div className="mt-2 sm:mt-4 flex flex-col gap-2 sm:gap-2.5 flex-shrink-0">
      {/* Full-width Pronounce Button */}
      <div>
        <button
          onClick={onSpeakCurrent}
          id="fcAudioBtn"
          className="w-full py-2 sm:py-2.5 px-4 rounded-[8px] bg-primary hover:bg-primary-soft text-primary-on font-semibold text-xs sm:text-sm min-h-[40px] sm:min-h-[44px] flex items-center justify-center gap-2 transition-all tap-bounce font-mono uppercase tracking-wider cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
          <span id="fcAudioBtnText">PRONOUNCE (US/UK)</span>
          {isSpeaking && (
            <div id="fcAudioWave" className="flex items-center gap-0.5 ml-1">
              <span className="soundwave-bar w-0.5 bg-primary-on" />
              <span className="soundwave-bar w-0.5 bg-primary-on" />
              <span className="soundwave-bar w-0.5 bg-primary-on" />
              <span className="soundwave-bar w-0.5 bg-primary-on" />
            </div>
          )}
        </button>
      </div>

      {/* Status & Auxiliary Actions: MARK MASTERED & FILTER MODAL */}
      <div className="flex items-center justify-between gap-2 sm:gap-2.5 text-xs sm:text-sm font-mono">
        <button
          onClick={onToggleLearned}
          id="fcToggleLearnedAction"
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-[8px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center gap-2 transition-all tap-bounce font-mono cursor-pointer ${
            isLearned
              ? 'bg-canvas-soft border border-primary text-primary font-semibold'
              : 'bg-canvas hover:bg-canvas-soft border border-hairline text-ink'
          }`}
        >
          <span id="fcActionLearnedIcon" className="text-primary font-bold">
            {isLearned ? '●' : '○'}
          </span>
          <span id="fcActionLearnedText">{isLearned ? 'REVOKE' : 'MARK MASTERED'}</span>
        </button>

        {/* FILTER BUTTON */}
        <button
          onClick={onOpenFilterModal}
          id="fcFilterBtn"
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-[8px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center gap-2 transition-all tap-bounce font-mono cursor-pointer ${
            activeFiltersCount > 0
              ? 'bg-primary/15 hover:bg-primary/25 border border-primary text-primary font-semibold'
              : 'bg-canvas hover:bg-canvas-soft border border-hairline text-ink'
          }`}
          title="Filter Options"
        >
          <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>FILTER</span>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-primary text-primary-on text-[10px] font-bold leading-tight">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
