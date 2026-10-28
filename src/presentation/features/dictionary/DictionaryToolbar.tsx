'use client';

import React from 'react';
import { PosFilterType, StatusFilterType } from '@/domain/entities';
import { playTapSound } from '@/infrastructure/device/audioService';

interface DictionaryToolbarProps {
  search: string;
  posFilter: PosFilterType;
  statusFilter: StatusFilterType;
  resultsCount: number;
  currentUnit: string;
  isSoundMuted: boolean;
  onSearchChange: (search: string) => void;
  onPosFilterChange: (pos: PosFilterType) => void;
  onStatusFilterChange: (status: StatusFilterType) => void;
}

export const DictionaryToolbar: React.FC<DictionaryToolbarProps> = ({
  search,
  posFilter,
  statusFilter,
  resultsCount,
  currentUnit,
  isSoundMuted,
  onSearchChange,
  onPosFilterChange,
  onStatusFilterChange,
}) => {
  return (
    <div className="bg-canvas rounded-[8px] p-3 sm:p-4 border border-hairline space-y-2.5 flex-shrink-0">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          id="dictSearch"
          placeholder="SEARCH VOCABULARY OR MEANING..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-canvas-soft text-ink placeholder:text-mute text-xs rounded-[6px] border border-hairline pl-8 pr-3 py-2 font-mono outline-none focus:border-primary transition-colors"
        />
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-mute">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
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
                onPosFilterChange(pos);
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
              onStatusFilterChange('ALL');
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
              onStatusFilterChange('UNLEARNED');
            }}
            id="filterStatusLearning"
            className={`px-2 py-0.5 rounded-[2px] text-[10px] cursor-pointer transition-all ${
              statusFilter === 'UNLEARNED'
                ? 'font-bold bg-canvas text-ink'
                : 'text-mute hover:text-ink'
            }`}
          >
            LEARNING
          </button>
          <button
            onClick={() => {
              playTapSound(isSoundMuted);
              onStatusFilterChange('LEARNED');
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

      <div className="flex items-center justify-between text-[11px] text-mute pt-1 border-t border-hairline/60 font-mono">
        <span id="dictResultCount">{resultsCount} ITEMS FOUND</span>
        <span id="dictUnitIndicator" className="text-primary truncate max-w-[180px]">
          {currentUnit === 'ALL' ? 'ALL UNITS' : currentUnit}
        </span>
      </div>
    </div>
  );
};
