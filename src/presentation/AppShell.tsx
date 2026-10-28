'use client';

import React, { useEffect, useRef } from 'react';
import { WordItem, CategoryItem } from '@/domain/entities';
import { useVocabStore } from '@/application/stores/useVocabStore';
import { useAuthStore } from '@/application/stores/useAuthStore';
import { useSettingsStore } from '@/application/stores/useSettingsStore';
import { useToastStore } from '@/application/stores/useToastStore';
import { wordApi } from '@/infrastructure/api/wordApi';
import { Header } from '@/presentation/shared/Header';
import { MobileNav } from '@/presentation/shared/MobileNav';
import { Toast } from '@/presentation/shared/Toast';
import { FlashcardTab } from '@/presentation/features/flashcards/FlashcardTab';
import { QuizTab } from '@/presentation/features/quiz/QuizTab';
import { DictionaryTab } from '@/presentation/features/dictionary/DictionaryTab';
import { StatsTab } from '@/presentation/features/stats/StatsTab';
import { AuthModal } from '@/presentation/features/auth/AuthModal';
import { ForgotPasswordModal } from '@/presentation/features/auth/ForgotPasswordModal';
import { ChangePasswordModal } from '@/presentation/features/auth/ChangePasswordModal';

export interface AppShellProps {
  initialWords: WordItem[];
  initialCategories?: CategoryItem[];
  defaultCategory?: string;
  defaultUnit?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  initialWords,
  initialCategories = [],
  defaultCategory = '',
  defaultUnit = '',
}) => {
  // Synchronous initial store population so SSR matches client initial render!
  const currentStore = useVocabStore.getState();
  if (currentStore.allWords.length === 0 && initialWords && initialWords.length > 0) {
    const resolvedCat = defaultCategory || initialCategories[0]?.category || initialWords[0]?.category || '';
    const resolvedUnit = defaultUnit || initialWords[0]?.library || '';
    useVocabStore.setState({
      allWords: initialWords,
      categoriesList: initialCategories,
      currentCategory: resolvedCat,
      currentUnit: resolvedUnit,
    });
  }

  const activeTab = useVocabStore((s) => s.activeTab);
  const setInitialWords = useVocabStore((s) => s.setInitialWords);
  const hydrateFromProgress = useVocabStore((s) => s.hydrateFromProgress);

  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const showToast = useToastStore((s) => s.showToast);

  const initializedRef = useRef(false);

  // Sync initialWords from server props and load categories once on mount
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;

      // Safely hydrate client-specific preferences after hydration
      useVocabStore.getState().hydrateFromLocalStorage();
      useSettingsStore.getState().hydrateFromLocalStorage();

      if (initialWords && initialWords.length > 0) {
        setInitialWords(initialWords, initialCategories, defaultCategory, defaultUnit);
      }
      wordApi
        .getAll()
        .then((data) => {
          if (data.categories.length > 0) {
            setInitialWords(
              initialWords && initialWords.length > 0 ? initialWords : data.words,
              data.categories,
              data.defaultCategory || defaultCategory,
              data.defaultUnit || defaultUnit
            );
          }
        })
        .catch(() => {});
    }
  }, [initialWords, initialCategories, defaultCategory, defaultUnit, setInitialWords]);

  // Session recovery & Mobile event listeners
  useEffect(() => {
    const token = localStorage.getItem('ielts_auth_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.username) {
            login(token, data.username, data.role, data.progress);
            if (data.progress) {
              hydrateFromProgress(data.progress);
            }
            showToast(`RESUMED: @${data.username}`);
          } else {
            logout();
            setTimeout(() => openAuthModal(), 400);
          }
        })
        .catch(() => {});
    } else {
      setTimeout(() => openAuthModal(), 400);
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
  }, [login, logout, hydrateFromProgress, openAuthModal, showToast]);

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

  return (
    <div
      className="fixed inset-0 w-full flex flex-col overflow-hidden bg-canvas text-ink select-none"
      style={{ height: 'var(--app-height, 100dvh)' }}
    >
      <Toast />

      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-3 sm:px-5 py-2 sm:py-3 flex flex-col justify-start min-h-0 overflow-hidden">
        {activeTab === 'flashcards' && <FlashcardTab />}
        {activeTab === 'quiz' && <QuizTab />}
        {activeTab === 'list' && <DictionaryTab />}
        {activeTab === 'stats' && <StatsTab />}
      </main>

      <MobileNav />

      <AuthModal />
      <ForgotPasswordModal />
      <ChangePasswordModal />
    </div>
  );
};
