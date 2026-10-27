'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { WordItem, PosFilterType, StatusFilterType } from '@/types';
import {
  playTapSound,
  playChimeSound,
  speakText,
  getWordTypeBadgeClass,
} from '@/lib/audio';

interface DictionaryTabProps {
  words: WordItem[];
  currentUnit: string;
  learnedWords: Set<string>;
  onToggleLearned: (word: string) => void;
  isSoundMuted: boolean;
  speechRate: number;
}

export const DictionaryTab: React.FC<DictionaryTabProps> = ({
  words,
  currentUnit,
  learnedWords,
  onToggleLearned,
  isSoundMuted,
  speechRate,
}) => {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState<PosFilterType>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Filtered list
  const filteredList = useMemo(() => {
    let list = currentUnit === 'ALL' ? [...words] : words.filter((w) => w.library === currentUnit);

    const s = search.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (w) => w.word.toLowerCase().includes(s) || w.meaning.toLowerCase().includes(s)
      );
    }

    if (posFilter !== 'ALL') {
      list = list.filter((w) => w.type && w.type.toLowerCase().startsWith(posFilter.toLowerCase()));
    }

    if (statusFilter === 'LEARNED') {
      list = list.filter((w) => learnedWords.has(w.word));
    } else if (statusFilter === 'UNLEARNED') {
      list = list.filter((w) => !learnedWords.has(w.word));
    }

    return list;
  }, [words, currentUnit, search, posFilter, statusFilter, learnedWords]);

  // Scroll to top on filter change
  useEffect(() => {
    if (listContainerRef.current) {
      listContainerRef.current.scrollTop = 0;
    }
  }, [search, posFilter, statusFilter, currentUnit]);

  const handleSpeak = (wordText: string) => {
    playTapSound(isSoundMuted);
    speakText(wordText, speechRate);
  };

  const handleToggle = (wordText: string) => {
    if (learnedWords.has(wordText)) {
      playTapSound(isSoundMuted);
    } else {
      playChimeSound(isSoundMuted);
    }
    onToggleLearned(wordText);
  };

  return (
    <section id="tab-list" className="flex flex-col flex-1 w-full font-mono min-h-0 h-full overflow-hidden">
      {/* FIXED FILTER CARD */}
      <div id="dictFilterCard" className="flex-shrink-0 bg-canvas p-3.5 rounded-[8px] border border-hairline space-y-2 mb-3">
        <div className="relative font-sans">
          <input
            type="text"
            id="dictSearchInput"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search English term or Vietnamese definition..."
            className="w-full bg-canvas-soft text-ink placeholder-mute text-xs sm:text-sm rounded-[6px] border border-hairline pl-8 pr-3 py-2 focus:outline-none focus:border-primary transition-all font-mono"
          />
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-mute">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
          {/* POS filter pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 max-w-full">
            {(['ALL', 'n', 'v', 'adj', 'adv'] as PosFilterType[]).map((pos) => {
              const isSelected = posFilter === pos;
              let styleClass = 'bg-canvas-soft text-body hover:text-ink border border-hairline';
              if (isSelected) {
                if (pos === 'ALL') {
                  styleClass = 'bg-primary text-primary-on font-semibold';
                } else {
                  styleClass = `font-semibold border ${getWordTypeBadgeClass(pos)}`;
                }
              }
              return (
                <button
                  key={pos}
                  onClick={() => {
                    playTapSound(isSoundMuted);
                    setPosFilter(pos);
                  }}
                  className={`pos-filter-btn px-2 py-0.5 rounded-[4px] text-[11px] cursor-pointer transition-all ${styleClass}`}
                  data-pos={pos}
                >
                  {pos === 'ALL' ? 'ALL' : pos === 'n' ? 'noun' : pos === 'v' ? 'verb' : pos}
                </button>
              );
            })}
          </div>

          {/* Status filter buttons */}
          <div className="flex items-center gap-0.5 bg-canvas-soft p-0.5 rounded-[4px] border border-hairline">
            <button
              onClick={() => {
                playTapSound(isSoundMuted);
                setStatusFilter('ALL');
              }}
              id="filterStatusAll"
              className={`px-2 py-0.5 rounded-[2px] text-[10px] cursor-pointer transition-all ${
                statusFilter === 'ALL' ? 'font-bold bg-canvas text-ink' : 'text-mute hover:text-ink'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => {
                playTapSound(isSoundMuted);
                setStatusFilter('UNLEARNED');
              }}
              id="filterStatusUnlearned"
              className={`px-2 py-0.5 rounded-[2px] text-[10px] cursor-pointer transition-all ${
                statusFilter === 'UNLEARNED' ? 'font-bold bg-canvas text-ink' : 'text-mute hover:text-ink'
              }`}
            >
              LEARNING
            </button>
            <button
              onClick={() => {
                playTapSound(isSoundMuted);
                setStatusFilter('LEARNED');
              }}
              id="filterStatusLearned"
              className={`px-2 py-0.5 rounded-[2px] text-[10px] cursor-pointer transition-all ${
                statusFilter === 'LEARNED' ? 'font-bold bg-canvas text-ink' : 'text-mute hover:text-ink'
              }`}
            >
              MASTERED
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-mute pt-1 border-t border-hairline/60">
          <span id="dictResultCount">{filteredList.length} ITEMS FOUND</span>
          <span id="dictUnitIndicator" className="text-primary truncate max-w-[180px]">
            {currentUnit === 'ALL' ? 'ALL UNITS' : currentUnit}
          </span>
        </div>
      </div>

      {/* SCROLLABLE WORD LIST */}
      <div
        id="dictListContainer"
        ref={listContainerRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1 pb-4 font-sans min-h-0"
      >
        {filteredList.length === 0 ? (
          <div className="text-center py-8 bg-canvas rounded-[8px] border border-hairline text-mute font-mono">
            <p className="text-xs">// NO_MATCHING_RECORDS_FOUND</p>
          </div>
        ) : (
          filteredList.map((w, idx) => {
            const isMastered = learnedWords.has(w.word);
            const badgeClass = getWordTypeBadgeClass(w.type);

            return (
              <div
                key={w.id}
                className="bg-canvas p-3 rounded-[6px] border border-hairline flex items-start justify-between gap-2.5 hover:border-hairline-soft transition-all"
              >
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-sans font-medium text-sm text-ink-strong">{w.word}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-mono font-medium ${badgeClass}`}>
                      {w.type || 'vocab'}
                    </span>
                    <button
                      onClick={() => handleSpeak(w.word)}
                      className="text-primary hover:text-primary-soft p-1 rounded hover:bg-canvas-soft tap-bounce cursor-pointer"
                      title="Pronounce"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-primary font-sans">{w.meaning}</p>
                  {w.example && (
                    <p className="text-[11px] text-body italic line-clamp-2 font-sans">{w.example}</p>
                  )}
                </div>

                <button
                  onClick={() => handleToggle(w.word)}
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
            );
          })
        )}
      </div>
    </section>
  );
};
