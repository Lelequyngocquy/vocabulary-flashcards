'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabType } from '@/types';
import { playTapSound } from '@/lib/audio';

interface HeaderProps {
  currentUnit: string;
  unitsList: { name: string; count: number }[];
  onUnitChange: (unit: string) => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  username: string | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUnit,
  unitsList,
  onUnitChange,
  activeTab,
  onTabChange,
  isSoundMuted,
  onToggleSound,
  username,
  onOpenAuth,
  onLogout,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const totalWords = unitsList.reduce((acc, u) => acc + u.count, 0);

  return (
    <header className="sticky top-0 z-40 bg-canvas border-b border-hairline px-3 py-2 sm:px-6 pt-[max(0.5rem,env(safe-area-inset-top,0px))] flex-shrink-0">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo (Lightning Glyph + Voltagent Aesthetic) */}
        <div
          className="flex items-center gap-2 cursor-pointer tap-bounce flex-shrink-0"
          onClick={() => {
            playTapSound(isSoundMuted);
            onTabChange('flashcards');
          }}
        >
          <div className="w-8 h-8 rounded-[6px] bg-canvas-soft border border-hairline flex items-center justify-center text-primary shadow-sm font-bold text-sm">
            <svg className="w-4 h-4 fill-current text-primary" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-ink-strong text-sm">
                VOLT<span className="text-primary font-normal">VOCAB</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-canvas-soft text-primary border border-hairline uppercase tracking-wider">
                v2.4
              </span>
            </div>
          </div>
        </div>

        {/* Unit Selector Dropdown */}
        <div className="flex-1 min-w-0 max-w-[210px] sm:max-w-xs md:max-w-sm mx-1">
          <div className="relative">
            <select
              id="unitSelect"
              value={currentUnit}
              onChange={(e) => {
                playTapSound(isSoundMuted);
                onUnitChange(e.target.value);
              }}
              className="w-full bg-canvas-soft hover:bg-canvas text-ink text-xs sm:text-sm font-medium rounded-[6px] border border-hairline px-2.5 py-1.5 pr-6 focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none truncate font-sans"
            >
              <option value="ALL">All Units ({totalWords.toLocaleString()} words)</option>
              {unitsList.map((u) => (
                <option key={u.name} value={u.name}>
                  {u.name} ({u.count})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-mute">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            id="soundMuteBtn"
            className="p-1.5 rounded-[6px] bg-canvas-soft hover:bg-canvas border border-hairline text-mute hover:text-ink transition-all tap-bounce"
            title="Audio"
          >
            <span id="soundMuteIcon" className="text-xs">
              {isSoundMuted ? '🔕' : '🔔'}
            </span>
          </button>

          {/* User Profile / Login */}
          <div id="authSection" className="relative" ref={userMenuRef}>
            {!username ? (
              <button
                onClick={() => {
                  playTapSound(isSoundMuted);
                  onOpenAuth();
                }}
                id="btnLoginHeader"
                className="py-1.5 px-3 rounded-[6px] bg-primary hover:bg-primary-soft text-primary-on font-semibold text-xs shadow-sm transition-all tap-bounce flex items-center gap-1 font-mono"
              >
                <span>LOGIN</span>
              </button>
            ) : (
              <div>
                <button
                  onClick={() => {
                    playTapSound(isSoundMuted);
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  id="userProfileHeader"
                  className="flex items-center gap-1.5 bg-canvas-soft hover:bg-canvas border border-hairline py-1 px-2.5 rounded-[6px] text-xs font-mono text-ink tap-bounce cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span id="headerUsername" className="max-w-[70px] sm:max-w-[100px] truncate font-semibold">
                    {username}
                  </span>
                  <svg className="w-3 h-3 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    id="userDropdownMenu"
                    className="absolute right-0 mt-2 w-48 rounded-[8px] bg-canvas border border-hairline shadow-2xl p-2 z-50"
                  >
                    <div className="px-2.5 py-1.5 border-b border-hairline mb-1">
                      <div className="text-[10px] text-mute uppercase tracking-widest font-mono">USER_ID</div>
                      <div id="menuUsername" className="font-mono text-ink-strong text-xs truncate">
                        {username}
                      </div>
                    </div>
                    <div className="px-2.5 py-1 text-[11px] text-primary flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>DB_SYNCED</span>
                    </div>
                    <button
                      onClick={() => {
                        playTapSound(isSoundMuted);
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full mt-1.5 px-2.5 py-1.5 rounded-[6px] bg-canvas-soft hover:bg-canvas text-rose-400 border border-hairline font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>LOGOUT</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-canvas-soft p-1 rounded-[6px] border border-hairline text-xs font-medium ml-1">
            <button
              id="nav-flashcards"
              onClick={() => {
                playTapSound(isSoundMuted);
                onTabChange('flashcards');
              }}
              className={`px-3 py-1 rounded-[4px] transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-primary text-primary-on font-semibold'
                  : 'text-body hover:text-ink'
              }`}
            >
              Flashcards
            </button>
            <button
              id="nav-quiz"
              onClick={() => {
                playTapSound(isSoundMuted);
                onTabChange('quiz');
              }}
              className={`px-3 py-1 rounded-[4px] transition-all ${
                activeTab === 'quiz'
                  ? 'bg-primary text-primary-on font-semibold'
                  : 'text-body hover:text-ink'
              }`}
            >
              Quiz
            </button>
            <button
              id="nav-list"
              onClick={() => {
                playTapSound(isSoundMuted);
                onTabChange('list');
              }}
              className={`px-3 py-1 rounded-[4px] transition-all ${
                activeTab === 'list'
                  ? 'bg-primary text-primary-on font-semibold'
                  : 'text-body hover:text-ink'
              }`}
            >
              Dictionary
            </button>
            <button
              id="nav-stats"
              onClick={() => {
                playTapSound(isSoundMuted);
                onTabChange('stats');
              }}
              className={`px-3 py-1 rounded-[4px] transition-all ${
                activeTab === 'stats'
                  ? 'bg-primary text-primary-on font-semibold'
                  : 'text-body hover:text-ink'
              }`}
            >
              Metrics
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
