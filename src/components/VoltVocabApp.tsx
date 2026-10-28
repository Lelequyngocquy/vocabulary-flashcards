'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { WordItem, TabType, UserProgress, CategoryItem } from '@/types';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { FlashcardTab } from '@/components/FlashcardTab';
import { QuizTab } from '@/components/QuizTab';
import { DictionaryTab } from '@/components/DictionaryTab';
import { StatsTab } from '@/components/StatsTab';
import { AuthModal } from '@/components/AuthModal';
import { ForgotPasswordModal } from '@/components/ForgotPasswordModal';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { Toast } from '@/components/Toast';
import { playTapSound, playChimeSound } from '@/lib/audio';

interface VoltVocabAppProps {
  initialWords: WordItem[];
}

export const VoltVocabApp: React.FC<VoltVocabAppProps> = ({ initialWords }) => {
  const [allWords, setAllWords] = useState<WordItem[]>(initialWords);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('Cambridge Vocabulary');
  const [currentUnit, setCurrentUnit] = useState<string>('Unit 1: Growing Up');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [filterOnlyIncomplete, setFilterOnlyIncomplete] = useState<boolean>(false);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('flashcards');

  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.9);

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('USER');
  const isAdmin = userRole === 'ADMIN' || username?.toLowerCase() === 'admin';

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [forgotPassModalOpen, setForgotPassModalOpen] = useState<boolean>(false);
  const [changePassModalOpen, setChangePassModalOpen] = useState<boolean>(false);

  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastIsError, setToastIsError] = useState<boolean>(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // If initialWords was empty or needs categories, fetch from SQLite API
  useEffect(() => {
    fetch('/api/words')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.words)) {
          if (allWords.length === 0) setAllWords(data.words);
        }
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategoriesList(data.categories);
        }
      })
      .catch(() => {});
  }, [allWords.length]);

  // Derived categories list with fallback
  const categories = useMemo(() => {
    if (categoriesList.length > 0) return categoriesList;
    const set = new Set<string>();
    allWords.forEach((w) => {
      if (w.category) set.add(w.category);
    });
    if (set.size === 0) set.add('Cambridge Vocabulary');
    return Array.from(set).map((cat, i) => ({
      id: i + 1,
      category: cat,
      display_order: i + 1,
    }));
  }, [categoriesList, allWords]);

  // Words belonging to the active category
  const categoryWords = useMemo(() => {
    if (!currentCategory) return allWords;
    return allWords.filter((w) => !w.category || w.category === currentCategory);
  }, [allWords, currentCategory]);

  // Extract units list specifically for the active category
  const unitsList = useMemo(() => {
    const map = new Map<string, number>();
    categoryWords.forEach((w) => {
      map.set(w.library, (map.get(w.library) || 0) + 1);
    });

    const list = Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    list.sort((a, b) => {
      const getNum = (str: string) => {
        const m = str.match(/Unit\s+(\d+)/i);
        return m ? parseInt(m[1], 10) : 999;
      };
      return getNum(a.name) - getNum(b.name);
    });

    return list;
  }, [categoryWords]);

  // Extract all available topics across the entire database
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    allWords.forEach((w) => {
      if (w.library) set.add(w.library);
    });
    const list = Array.from(set).map((name) => ({ name }));
    list.sort((a, b) => {
      const getNum = (str: string) => {
        const m = str.match(/Unit\s+(\d+)/i);
        return m ? parseInt(m[1], 10) : 999;
      };
      return getNum(a.name) - getNum(b.name);
    });
    return list;
  }, [allWords]);

  // Show Toast
  const showToast = useCallback((msg: string, isError = false) => {
    setToastMsg(msg);
    setToastIsError(isError);
    setToastVisible(true);

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  }, []);

  // Sync to database
  const triggerDatabaseSync = useCallback(
    (category: string, unit: string, index: number, learned: Set<string>) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ielts_learned_words', JSON.stringify(Array.from(learned)));
        } catch {}
      }

      if (!authToken) return;

      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch('/api/progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              current_category: category,
              current_unit: unit,
              current_index: index,
              learned_words: Array.from(learned),
              quiz_stats: {},
            }),
          });
          const data = await res.json();
          if (!data.success) {
            showToast(data.error || 'Lỗi đồng bộ dữ liệu', true);
          }
        } catch {
          showToast('Mất kết nối máy chủ khi đồng bộ', true);
        }
      }, 500);
    },
    [authToken, showToast]
  );

  // Base words for current unit inside the active category
  const baseUnitWords = useMemo(() => {
    return currentUnit === 'ALL'
      ? categoryWords
      : categoryWords.filter((w) => w.library === currentUnit);
  }, [categoryWords, currentUnit]);

  // Filtered words for flashcards
  const filteredWords = useMemo(() => {
    let list = filterOnlyIncomplete
      ? baseUnitWords.filter((w) => !learnedWords.has(w.word))
      : [...baseUnitWords];

    if (isShuffled) {
      const copy = [...list];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      list = copy;
    }

    return list;
  }, [baseUnitWords, filterOnlyIncomplete, isShuffled, learnedWords]);

  // Adjust currentIndex if out of bounds
  useEffect(() => {
    if (currentIndex >= filteredWords.length && filteredWords.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredWords.length, currentIndex]);

  // Mount initialization: localStorage and auth
  useEffect(() => {
    setIsMounted(true);

    const muted = localStorage.getItem('ielts_sound_muted') === 'true';
    setIsSoundMuted(muted);

    const rate = parseFloat(localStorage.getItem('ielts_speech_rate') || '0.9');
    if (!isNaN(rate)) setSpeechRate(rate);

    const savedCat = localStorage.getItem('ielts_current_category');
    if (savedCat) setCurrentCategory(savedCat);

    try {
      const savedLearned = JSON.parse(localStorage.getItem('ielts_learned_words') || '[]');
      if (Array.isArray(savedLearned) && savedLearned.length > 0) {
        setLearnedWords(new Set(savedLearned));
      }
    } catch {}

    const token = localStorage.getItem('ielts_auth_token');
    if (token) {
      setAuthToken(token);
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.username) {
            setUsername(data.username);
            if (data.role) setUserRole(data.role);
            else if (data.username?.toLowerCase() === 'admin') setUserRole('ADMIN');
            if (data.progress) {
              const p = data.progress;
              if (p.current_category) setCurrentCategory(p.current_category);
              if (p.current_unit) setCurrentUnit(p.current_unit);
              if (Array.isArray(p.learned_words)) {
                setLearnedWords(new Set(p.learned_words));
              }
              if (typeof p.current_index === 'number') {
                setCurrentIndex(p.current_index);
              }
            }
            showToast(`RESUMED: @${data.username}`);
          } else {
            localStorage.removeItem('ielts_auth_token');
            setAuthToken(null);
            setTimeout(() => setAuthModalOpen(true), 400);
          }
        })
        .catch(() => {});
    } else {
      setTimeout(() => setAuthModalOpen(true), 400);
    }

    // Double-click prevent zoom on mobile
    const handleDblClick = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('dblclick', handleDblClick, { passive: false });

    // Pre-cache speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        try {
          window.speechSynthesis.getVoices();
        } catch {}
      };
    }

    return () => {
      document.removeEventListener('dblclick', handleDblClick);
    };
  }, [showToast]);

  // Mobile viewport visualViewport resize handler
  useEffect(() => {
    const updateAppHeight = () => {
      if (typeof window !== 'undefined') {
        const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        document.documentElement.style.setProperty('--app-height', `${height}px`);
      }
    };

    updateAppHeight();
    window.addEventListener('resize', updateAppHeight);
    window.addEventListener('orientationchange', updateAppHeight);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateAppHeight);
      window.visualViewport.addEventListener('scroll', updateAppHeight);
    }
    return () => {
      window.removeEventListener('resize', updateAppHeight);
      window.removeEventListener('orientationchange', updateAppHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateAppHeight);
        window.visualViewport.removeEventListener('scroll', updateAppHeight);
      }
    };
  }, []);

  // Handle Tab Switch
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Handle Category Change (Filter category first, then reset topic)
  const handleCategoryChange = (newCat: string) => {
    setCurrentCategory(newCat);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ielts_current_category', newCat);
      } catch {}
    }
    setCurrentUnit('ALL');
    setCurrentIndex(0);
    triggerDatabaseSync(newCat, 'ALL', 0, learnedWords);
  };

  // Handle Unit Change
  const handleUnitChange = (unit: string) => {
    setCurrentUnit(unit);
    setCurrentIndex(0);
    triggerDatabaseSync(currentCategory, unit, 0, learnedWords);
  };

  // Toggle Sound Mute
  const handleToggleSound = () => {
    setIsSoundMuted((prev) => {
      const next = !prev;
      localStorage.setItem('ielts_sound_muted', String(next));
      if (!next) playChimeSound(false);
      return next;
    });
  };

  // Toggle Shuffle
  const handleToggleShuffle = () => {
    setIsShuffled((prev) => !prev);
    setCurrentIndex(0);
  };

  // Toggle Incomplete Filter
  const handleToggleFilterIncomplete = () => {
    setFilterOnlyIncomplete((prev) => !prev);
    setCurrentIndex(0);
  };

  // Apply Filter Modal Changes (called only when user clicks Done in Flashcard_filters)
  const handleApplyFilters = useCallback(
    (newFilterOnlyIncomplete: boolean, newIsShuffled: boolean) => {
      const filterChanged = newFilterOnlyIncomplete !== filterOnlyIncomplete;
      const shuffleChanged = newIsShuffled !== isShuffled;

      if (filterChanged || shuffleChanged) {
        setFilterOnlyIncomplete(newFilterOnlyIncomplete);
        setIsShuffled(newIsShuffled);
        setCurrentIndex(0);
      }
    },
    [filterOnlyIncomplete, isShuffled]
  );

  // Next / Prev card
  const handleNextCard = () => {
    if (filteredWords.length === 0) return;
    const nextIdx = (currentIndex + 1) % filteredWords.length;
    setCurrentIndex(nextIdx);
    triggerDatabaseSync(currentCategory, currentUnit, nextIdx, learnedWords);
  };

  const handlePrevCard = () => {
    if (filteredWords.length === 0) return;
    const prevIdx = (currentIndex - 1 + filteredWords.length) % filteredWords.length;
    setCurrentIndex(prevIdx);
    triggerDatabaseSync(currentCategory, currentUnit, prevIdx, learnedWords);
  };

  // Toggle Learned
  const handleToggleLearned = (wordStr: string) => {
    setLearnedWords((prev) => {
      const next = new Set(prev);
      if (next.has(wordStr)) {
        next.delete(wordStr);
      } else {
        next.add(wordStr);
      }
      triggerDatabaseSync(currentCategory, currentUnit, currentIndex, next);
      return next;
    });
  };

  // Speech Rate Change
  const handleSpeechRateChange = (rate: number) => {
    setSpeechRate(rate);
    localStorage.setItem('ielts_speech_rate', String(rate));
  };

  // Reset Progress
  const handleResetProgress = () => {
    if (confirm('Reset and purge all progress data from SQLite?')) {
      const empty = new Set<string>();
      setLearnedWords(empty);
      playChimeSound(isSoundMuted);
      triggerDatabaseSync(currentCategory, currentUnit, 0, empty);
      showToast('PROGRESS_PURGED');
    }
  };

  // Handle Word Updated in Dictionary (Move / Edit)
  const handleWordUpdated = useCallback((updatedWord: WordItem) => {
    setAllWords((prev) =>
      prev.map((w) => (w.id === updatedWord.id ? updatedWord : w))
    );
    showToast(`UPDATED: ${updatedWord.word}`);
  }, [showToast]);

  // Auth Success Callback
  const handleAuthSuccess = (token: string, authedUsername: string, progress?: UserProgress, role?: string) => {
    setAuthToken(token);
    setUsername(authedUsername);
    const assignedRole = role || (authedUsername.toLowerCase() === 'admin' ? 'ADMIN' : 'USER');
    setUserRole(assignedRole);
    localStorage.setItem('ielts_auth_token', token);

    if (progress) {
      if (progress.current_category) setCurrentCategory(progress.current_category);
      if (progress.current_unit) setCurrentUnit(progress.current_unit);
      if (Array.isArray(progress.learned_words)) {
        setLearnedWords(new Set(progress.learned_words));
      }
      if (typeof progress.current_index === 'number') {
        setCurrentIndex(progress.current_index);
      }
    }
    showToast(`AUTH_SUCCESS: @${authedUsername}`);
  };

  // Logout
  const handleLogout = () => {
    if (confirm('Disconnect session and log out?')) {
      setAuthToken(null);
      setUsername(null);
      setUserRole('USER');
      localStorage.removeItem('ielts_auth_token');
      playTapSound(isSoundMuted);
      showToast('DISCONNECTED');
      setAuthModalOpen(true);
    }
  };

  return (
    <div
      className="fixed inset-0 w-full flex flex-col overflow-hidden bg-canvas text-ink select-none"
      style={{ height: 'var(--app-height, 100dvh)' }}
    >
      <Toast message={toastMsg} visible={toastVisible} isError={toastIsError} />

      <Header
        currentCategory={currentCategory}
        categoriesList={categories}
        onCategoryChange={handleCategoryChange}
        currentUnit={currentUnit}
        unitsList={unitsList}
        onUnitChange={handleUnitChange}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isSoundMuted={isSoundMuted}
        onToggleSound={handleToggleSound}
        username={username}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenChangePassword={() => setChangePassModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-3 sm:px-5 py-2 sm:py-3 flex flex-col justify-start min-h-0 overflow-hidden">
        {activeTab === 'flashcards' && (
          <FlashcardTab
            words={filteredWords}
            allUnitWordsCount={baseUnitWords.length}
            currentIndex={currentIndex}
            onNextCard={handleNextCard}
            onPrevCard={handlePrevCard}
            currentUnit={currentUnit}
            learnedWords={learnedWords}
            onToggleLearned={handleToggleLearned}
            filterOnlyIncomplete={filterOnlyIncomplete}
            onToggleFilterIncomplete={handleToggleFilterIncomplete}
            isShuffled={isShuffled}
            onToggleShuffle={handleToggleShuffle}
            onApplyFilters={handleApplyFilters}
            isSoundMuted={isSoundMuted}
            speechRate={speechRate}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizTab
            allWords={categoryWords}
            currentUnit={currentUnit}
            onWordMastered={(w) => {
              setLearnedWords((prev) => {
                const next = new Set(prev);
                next.add(w);
                triggerDatabaseSync(currentCategory, currentUnit, currentIndex, next);
                return next;
              });
            }}
            isSoundMuted={isSoundMuted}
            onSwitchToFlashcards={() => setActiveTab('flashcards')}
            speechRate={speechRate}
          />
        )}

        {activeTab === 'list' && (
          <DictionaryTab
            words={categoryWords}
            allWords={allWords}
            currentUnit={currentUnit}
            learnedWords={learnedWords}
            onToggleLearned={handleToggleLearned}
            isSoundMuted={isSoundMuted}
            speechRate={speechRate}
            categoriesList={categories}
            allTopicsList={allTopics}
            onWordUpdated={handleWordUpdated}
            isAdmin={isAdmin}
            authToken={authToken}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab
            totalWords={categoryWords.length}
            masteredCount={learnedWords.size}
            unitsList={unitsList}
            allWords={categoryWords}
            learnedWords={learnedWords}
            speechRate={speechRate}
            onSpeechRateChange={handleSpeechRateChange}
            onResetAllProgress={handleResetProgress}
            isSoundMuted={isSoundMuted}
            onToggleSound={handleToggleSound}
          />
        )}
      </main>

      <MobileNav activeTab={activeTab} onTabChange={handleTabChange} isSoundMuted={isSoundMuted} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onOpenForgotPass={() => {
          setAuthModalOpen(false);
          setForgotPassModalOpen(true);
        }}
        isSoundMuted={isSoundMuted}
        onAuthSuccess={handleAuthSuccess}
      />

      <ForgotPasswordModal
        isOpen={forgotPassModalOpen}
        onClose={() => setForgotPassModalOpen(false)}
        isSoundMuted={isSoundMuted}
      />

      <ChangePasswordModal
        isOpen={changePassModalOpen}
        onClose={() => setChangePassModalOpen(false)}
        authToken={authToken}
        isSoundMuted={isSoundMuted}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};
