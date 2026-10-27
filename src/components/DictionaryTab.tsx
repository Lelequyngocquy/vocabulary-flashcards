'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { WordItem, PosFilterType, StatusFilterType } from '@/types';
import {
  playTapSound,
  playChimeSound,
  speakText,
  getWordTypeBadgeClass,
} from '@/lib/audio';
import { EditWordModal } from '@/components/EditWordModal';

interface DictionaryTabProps {
  words: WordItem[];
  allWords?: WordItem[];
  currentUnit: string;
  learnedWords: Set<string>;
  onToggleLearned: (word: string) => void;
  isSoundMuted: boolean;
  speechRate: number;
  categoriesList?: { id: number; category: string }[];
  allTopicsList?: { name: string }[];
  onWordUpdated?: (updatedWord: WordItem) => void;
  isAdmin?: boolean;
  authToken?: string | null;
  onShowToast?: (msg: string, isError?: boolean) => void;
}

export const DictionaryTab: React.FC<DictionaryTabProps> = ({
  words,
  allWords = [],
  currentUnit,
  learnedWords,
  onToggleLearned,
  isSoundMuted,
  speechRate,
  categoriesList = [{ id: 1, category: 'Cambridge Vocabulary' }],
  allTopicsList = [],
  onWordUpdated,
  isAdmin = false,
  authToken = null,
  onShowToast,
}) => {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState<PosFilterType>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');
  const [editingWord, setEditingWord] = useState<WordItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
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

  const handleOpenEdit = (w: WordItem) => {
    playTapSound(isSoundMuted);
    const isDefaultCat = !w.category || w.category === 'Cambridge Vocabulary';
    if (isDefaultCat && !isAdmin) {
      if (onShowToast) {
        onShowToast('Kho từ vựng mặc định (Cambridge Vocabulary) chỉ có tài khoản Admin mới được chỉnh sửa.', true);
      } else {
        alert('Kho từ vựng mặc định (Cambridge Vocabulary) chỉ có tài khoản Admin mới được chỉnh sửa.');
      }
      return;
    }
    setEditingWord(w);
    setIsEditModalOpen(true);
  };

  const handleWordUpdated = (updated: WordItem) => {
    if (onWordUpdated) {
      onWordUpdated(updated);
    }
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
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
            {(['ALL', 'n', 'v', 'adj', 'adv'] as PosFilterType[]).map((pos) => (
              <button
                key={pos}
                onClick={() => {
                  playTapSound(isSoundMuted);
                  setPosFilter(pos);
                }}
                className={`px-2 py-0.5 rounded-[4px] border text-[10px] font-mono uppercase transition-all cursor-pointer ${
                  posFilter === pos
                    ? 'bg-primary text-primary-on border-primary font-bold shadow-sm'
                    : 'bg-canvas-soft text-mute border-hairline hover:text-ink hover:border-hairline-soft'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Mastered/Learning Status filter toggle */}
          <div className="flex items-center bg-canvas-soft p-0.5 rounded-[4px] border border-hairline font-mono">
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
              id="filterStatusLearning"
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
          filteredList.map((w) => {
            const isMastered = learnedWords.has(w.word);
            const badgeClass = getWordTypeBadgeClass(w.type);

            return (
              <div
                key={w.id}
                className="bg-canvas p-3 rounded-[6px] border border-hairline flex items-start justify-between gap-2.5 hover:border-hairline-soft transition-all"
              >
                <div className="flex-1 space-y-0.5 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 font-mono flex-wrap">
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

                {/* Action Buttons: Setting / Edit + Mark Mastered */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(w)}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

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
              </div>
            );
          })
        )}
      </div>

      {/* Edit Word Modal */}
      {isEditModalOpen && (
        <EditWordModal
          word={editingWord}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onWordUpdated={handleWordUpdated}
          categoriesList={categoriesList}
          allWords={allWords.length > 0 ? allWords : words}
          isSoundMuted={isSoundMuted}
          isAdmin={isAdmin}
          authToken={authToken}
        />
      )}
    </section>
  );
};
