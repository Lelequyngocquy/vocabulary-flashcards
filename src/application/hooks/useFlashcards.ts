import { useState, useCallback, useRef, useEffect } from 'react';
import { WordItem } from '@/domain/entities';
import { playTapSound, playFlipSound, playChimeSound } from '@/infrastructure/device/audioService';
import { speakText, cancelSpeech } from '@/infrastructure/device/speechService';
import confetti from 'canvas-confetti';

export interface UseFlashcardsOptions {
  words: readonly WordItem[];
  currentIndex: number;
  isSoundMuted: boolean;
  speechRate: number;
  learnedWords: ReadonlySet<string>;
  onNextCard: () => void;
  onPrevCard: () => void;
  onToggleLearned: (word: string) => void;
  onApplyFilters?: (filterOnlyIncomplete: boolean, isShuffled: boolean) => void;
}

export function useFlashcards(options: UseFlashcardsOptions) {
  const {
    words,
    currentIndex,
    isSoundMuted,
    speechRate,
    learnedWords,
    onNextCard,
    onPrevCard,
    onToggleLearned,
  } = options;

  const [isFlipped, setIsFlipped] = useState(false);
  const [slideAnim, setSlideAnim] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingExample, setIsSpeakingExample] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const word = words[currentIndex] || null;
  const isLearned = word ? learnedWords.has(word.word) : false;

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex, words]);

  // Auto-speak on card switch
  useEffect(() => {
    if (!word || isSoundMuted) return;
    const timer = setTimeout(() => {
      speakText(
        word.word,
        speechRate,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }, 100);
    return () => clearTimeout(timer);
  }, [currentIndex, word, isSoundMuted, speechRate]);

  // Handle flip card
  const handleFlip = useCallback(() => {
    if (!word) return;
    playFlipSound(isSoundMuted);
    setIsFlipped((prev) => {
      const next = !prev;
      if (next && word.example && !isSoundMuted) {
        setTimeout(() => {
          speakText(
            word.example,
            speechRate,
            () => setIsSpeakingExample(true),
            () => setIsSpeakingExample(false)
          );
        }, 150);
      } else if (!next) {
        cancelSpeech();
      }
      return next;
    });
  }, [isSoundMuted, word, speechRate]);

  // Next card with animation
  const handleNext = useCallback(() => {
    if (words.length === 0) return;
    setSlideAnim('slide-out-left');
    setTimeout(() => {
      onNextCard();
      setSlideAnim('slide-in-right');
      setTimeout(() => setSlideAnim(''), 220);
    }, 140);
  }, [words.length, onNextCard]);

  // Prev card with animation
  const handlePrev = useCallback(() => {
    if (words.length === 0) return;
    setSlideAnim('slide-out-right');
    setTimeout(() => {
      onPrevCard();
      setSlideAnim('slide-in-left');
      setTimeout(() => setSlideAnim(''), 220);
    }, 140);
  }, [words.length, onPrevCard]);

  // Pronounce word
  const handleSpeakCurrent = useCallback(() => {
    if (!word) return;
    playTapSound(isSoundMuted);
    speakText(
      word.word,
      speechRate,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  }, [word, isSoundMuted, speechRate]);

  // Pronounce example
  const handleSpeakExample = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!word || !word.example) return;
      playTapSound(isSoundMuted);
      speakText(
        word.example,
        speechRate,
        () => setIsSpeakingExample(true),
        () => setIsSpeakingExample(false)
      );
    },
    [word, isSoundMuted, speechRate]
  );

  // Copy example
  const handleCopyExample = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!word || !word.example) return;
      playTapSound(isSoundMuted);
      const textToCopy = word.example.trim();
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
        .catch(() => {
          const ta = document.createElement('textarea');
          ta.value = textToCopy;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
    },
    [word, isSoundMuted]
  );

  // Toggle learned status
  const handleToggleLearned = useCallback(() => {
    if (!word) return;
    if (isLearned) {
      playTapSound(isSoundMuted);
    } else {
      playChimeSound(isSoundMuted);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {}
    }
    onToggleLearned(word.word);
  }, [word, isLearned, isSoundMuted, onToggleLearned]);

  return {
    word,
    isLearned,
    isFlipped,
    slideAnim,
    isSpeaking,
    isSpeakingExample,
    copied,
    filterModalOpen,
    setFilterModalOpen,
    handleFlip,
    handleNext,
    handlePrev,
    handleSpeakCurrent,
    handleSpeakExample,
    handleCopyExample,
    handleToggleLearned,
  };
}
