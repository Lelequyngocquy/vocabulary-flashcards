'use client';

import { useEffect, useRef } from 'react';
import { playTapSound } from '@/infrastructure/device/audioService';

interface UseCardGesturesOptions {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  isFilterModalOpen: boolean;
  isSoundMuted: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSpeak: () => void;
  onToggleLearned: () => void;
  onCloseModal?: () => void;
}

export function useCardGestures(options: UseCardGesturesOptions) {
  const {
    wrapperRef,
    isFilterModalOpen,
    isSoundMuted,
    onFlip,
    onNext,
    onPrev,
    onSpeak,
    onToggleLearned,
    onCloseModal,
  } = options;

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isTouchSwiping = useRef(false);

  // Touch Swipe Listeners
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].clientX;
      touchStartY.current = e.changedTouches[0].clientY;
      isTouchSwiping.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      const curX = e.changedTouches[0].clientX;
      const curY = e.changedTouches[0].clientY;
      const diffX = curX - touchStartX.current;
      const diffY = curY - touchStartY.current;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 20) {
        isTouchSwiping.current = true;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX.current;
      const diffY = touchEndY - touchStartY.current;
      const threshold = 40;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        isTouchSwiping.current = true;
        playTapSound(isSoundMuted);
        if (diffX < 0) {
          onNext();
        } else {
          onPrev();
        }
        setTimeout(() => {
          isTouchSwiping.current = false;
        }, 320);
      } else {
        setTimeout(() => {
          isTouchSwiping.current = false;
        }, 80);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [wrapperRef, onNext, onPrev, isSoundMuted]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (isFilterModalOpen) {
        if (e.code === 'Escape' && onCloseModal) {
          e.preventDefault();
          playTapSound(isSoundMuted);
          onCloseModal();
        }
        return;
      }

      if (e.code === 'ArrowDown' || e.code === 'Space') {
        e.preventDefault();
        onFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        playTapSound(isSoundMuted);
        onNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        playTapSound(isSoundMuted);
        onPrev();
      } else if (e.code === 'KeyS' || e.code === 'ArrowUp') {
        e.preventDefault();
        onSpeak();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        onToggleLearned();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isFilterModalOpen,
    isSoundMuted,
    onFlip,
    onNext,
    onPrev,
    onSpeak,
    onToggleLearned,
    onCloseModal,
  ]);

  return { isTouchSwiping };
}
