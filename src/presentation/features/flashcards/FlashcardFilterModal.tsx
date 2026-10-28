'use client';

import React, { useState, useEffect } from 'react';
import { playTapSound } from '@/infrastructure/device/audioService';

interface FlashcardFilterModalProps {
  isOpen: boolean;
  filterOnlyIncomplete: boolean;
  isShuffled: boolean;
  isSoundMuted: boolean;
  onClose: () => void;
  onApplyFilters: (filterOnlyIncomplete: boolean, isShuffled: boolean) => void;
}

export const FlashcardFilterModal: React.FC<FlashcardFilterModalProps> = ({
  isOpen,
  filterOnlyIncomplete,
  isShuffled,
  isSoundMuted,
  onClose,
  onApplyFilters,
}) => {
  const [draftFilterOnlyIncomplete, setDraftFilterOnlyIncomplete] = useState(filterOnlyIncomplete);
  const [draftIsShuffled, setDraftIsShuffled] = useState(isShuffled);

  // Synchronize draft states when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftFilterOnlyIncomplete(filterOnlyIncomplete);
      setDraftIsShuffled(isShuffled);
    }
  }, [isOpen, filterOnlyIncomplete, isShuffled]);

  if (!isOpen) return null;

  const draftActiveFiltersCount =
    (draftFilterOnlyIncomplete ? 1 : 0) + (draftIsShuffled ? 1 : 0);

  const handleApply = () => {
    playTapSound(isSoundMuted);
    onApplyFilters(draftFilterOnlyIncomplete, draftIsShuffled);
    onClose();
  };

  const handleClose = () => {
    playTapSound(isSoundMuted);
    onClose();
  };

  return (
    <div
      id="fcFilterModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-sm rounded-[10px] bg-canvas border border-hairline shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-5 sm:p-6 space-y-4 font-mono select-none">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-mute hover:text-ink p-1 rounded hover:bg-canvas-soft transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-canvas-soft border border-hairline text-primary font-mono text-[11px] mb-2">
            <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>FLASHCARD_FILTERS</span>
          </div>
          <h2 className="text-xl font-medium text-ink-strong tracking-tight font-sans">
            Filter & Display Options
          </h2>
          <p className="text-xs text-body mt-0.5 font-sans">
            Configure study mode and word card filtering
          </p>
        </div>

        {/* Options List */}
        <div className="space-y-2.5 pt-1">
          {/* Option 1: Incomplete Only */}
          <div
            onClick={() => {
              playTapSound(isSoundMuted);
              setDraftFilterOnlyIncomplete((prev) => !prev);
            }}
            className={`p-3 rounded-[8px] border transition-all cursor-pointer flex items-center justify-between gap-3 tap-bounce ${
              draftFilterOnlyIncomplete
                ? 'bg-primary/10 border-primary text-ink'
                : 'bg-canvas-soft hover:bg-canvas border-hairline text-mute hover:text-ink'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-medium text-xs sm:text-sm text-ink-strong">
                  Incomplete Words Only
                </span>
                <span className="text-[10px] text-mute uppercase font-mono">(Unmastered)</span>
              </div>
              <p className="text-[11px] text-mute font-sans mt-0.5">
                Hide terms already marked as Mastered
              </p>
            </div>

            <div
              className={`w-14 h-6 flex items-center justify-center text-[10px] font-mono rounded uppercase border font-semibold shrink-0 ${
                draftFilterOnlyIncomplete
                  ? 'bg-primary text-primary-on border-primary'
                  : 'bg-canvas border-hairline text-mute'
              }`}
            >
              {draftFilterOnlyIncomplete ? 'ACTIVE' : 'OFF'}
            </div>
          </div>

          {/* Option 2: Shuffle Order */}
          <div
            onClick={() => {
              playTapSound(isSoundMuted);
              setDraftIsShuffled((prev) => !prev);
            }}
            className={`p-3 rounded-[8px] border transition-all cursor-pointer flex items-center justify-between gap-3 tap-bounce ${
              draftIsShuffled
                ? 'bg-primary/10 border-primary text-ink'
                : 'bg-canvas-soft hover:bg-canvas border-hairline text-mute hover:text-ink'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-medium text-xs sm:text-sm text-ink-strong">
                  Shuffle Flashcards
                </span>
                <span className="text-[10px] text-mute uppercase font-mono">(Randomize)</span>
              </div>
              <p className="text-[11px] text-mute font-sans mt-0.5">
                Randomize the study order of flashcards
              </p>
            </div>

            <div
              className={`w-14 h-6 flex items-center justify-center text-[10px] font-mono rounded uppercase border font-semibold shrink-0 ${
                draftIsShuffled
                  ? 'bg-primary text-primary-on border-primary'
                  : 'bg-canvas border-hairline text-mute'
              }`}
            >
              {draftIsShuffled ? 'ACTIVE' : 'OFF'}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex items-center gap-2">
          {draftActiveFiltersCount > 0 && (
            <button
              type="button"
              onClick={() => {
                playTapSound(isSoundMuted);
                setDraftFilterOnlyIncomplete(false);
                setDraftIsShuffled(false);
              }}
              className="py-2.5 px-3 rounded-[6px] bg-canvas-soft hover:bg-canvas border border-hairline text-rose-400 hover:text-rose-300 text-xs font-semibold tap-bounce transition-colors cursor-pointer"
            >
              Reset All
            </button>
          )}
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-[6px] bg-primary hover:bg-primary-soft text-primary-on font-semibold text-xs tracking-wider tap-bounce transition-colors cursor-pointer text-center"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
