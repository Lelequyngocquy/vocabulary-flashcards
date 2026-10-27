'use client';

import React from 'react';
import { TabType } from '@/types';
import { playTapSound } from '@/lib/audio';

interface MobileNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isSoundMuted: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  isSoundMuted,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-canvas/95 backdrop-blur-md border-t border-hairline px-4 py-2 flex items-center justify-around font-mono">
      <button
        onClick={() => {
          playTapSound(isSoundMuted);
          onTabChange('flashcards');
        }}
        id="mob-flashcards"
        className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3.5 rounded-[6px] min-h-[46px] transition-all tap-bounce cursor-pointer ${
          activeTab === 'flashcards' ? 'text-primary' : 'text-mute'
        }`}
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="text-[9px] font-semibold tracking-wider">CARDS</span>
      </button>

      <button
        onClick={() => {
          playTapSound(isSoundMuted);
          onTabChange('quiz');
        }}
        id="mob-quiz"
        className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3.5 rounded-[6px] min-h-[46px] transition-all tap-bounce cursor-pointer ${
          activeTab === 'quiz' ? 'text-primary' : 'text-mute'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[9px] font-semibold tracking-wider">QUIZ</span>
      </button>

      <button
        onClick={() => {
          playTapSound(isSoundMuted);
          onTabChange('list');
        }}
        id="mob-list"
        className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3.5 rounded-[6px] min-h-[46px] transition-all tap-bounce cursor-pointer ${
          activeTab === 'list' ? 'text-primary' : 'text-mute'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <span className="text-[9px] font-semibold tracking-wider">DICT</span>
      </button>

      <button
        onClick={() => {
          playTapSound(isSoundMuted);
          onTabChange('stats');
        }}
        id="mob-stats"
        className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3.5 rounded-[6px] min-h-[46px] transition-all tap-bounce cursor-pointer ${
          activeTab === 'stats' ? 'text-primary' : 'text-mute'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span className="text-[9px] font-semibold tracking-wider">METRICS</span>
      </button>
    </div>
  );
};
