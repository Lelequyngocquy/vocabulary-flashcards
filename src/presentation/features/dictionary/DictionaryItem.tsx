'use client';

import React from 'react';
import { WordItem } from '@/domain/entities';
import { getWordTypeBadgeClass } from '@/presentation/shared/ui/wordBadge';

interface DictionaryItemProps {
  word: WordItem;
  isMastered: boolean;
  onSpeak: (word: string) => void;
  onToggleLearned: (word: string) => void;
  onOpenEdit: (word: WordItem) => void;
}

export const DictionaryItem: React.FC<DictionaryItemProps> = ({
  word,
  isMastered,
  onSpeak,
  onToggleLearned,
  onOpenEdit,
}) => {
  const badgeClass = getWordTypeBadgeClass(word.type);

  return (
    <div className="bg-canvas p-3 rounded-[6px] border border-hairline flex items-start justify-between gap-2.5 hover:border-hairline-soft transition-all">
      <div className="flex-1 space-y-0.5 min-w-0 pr-1">
        <div className="flex items-center gap-1.5 font-mono flex-wrap">
          <span className="font-sans font-medium text-sm text-ink-strong">{word.word}</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-mono font-medium ${badgeClass}`}
          >
            {word.type || 'vocab'}
          </span>
          <button
            onClick={() => onSpeak(word.word)}
            className="text-primary hover:text-primary-soft p-1 rounded hover:bg-canvas-soft tap-bounce cursor-pointer"
            title="Pronounce"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
          </button>
        </div>
        <p className="text-xs font-semibold text-primary font-sans">{word.meaning}</p>
        {word.example && (
          <p className="text-[11px] text-body italic line-clamp-2 font-sans">{word.example}</p>
        )}
      </div>

      {/* Action Buttons: Setting / Edit + Mark Mastered */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onOpenEdit(word)}
          className="p-2 rounded-[4px] bg-canvas-soft hover:bg-canvas text-mute hover:text-primary border border-hairline hover:border-primary/50 transition-all tap-bounce cursor-pointer flex items-center justify-center"
          title="Edit Word, Topic & Category"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        <button
          onClick={() => onToggleLearned(word.word)}
          className={`p-2 rounded-[4px] transition-all tap-bounce font-mono text-[11px] cursor-pointer ${
            isMastered
              ? 'bg-canvas-soft text-primary border border-primary'
              : 'bg-canvas-soft text-mute border border-hairline hover:text-ink'
          }`}
          title={isMastered ? 'Mastered' : 'Mark Mastered'}
        >
          {isMastered ? '●' : '○'}
        </button>
      </div>
    </div>
  );
};
