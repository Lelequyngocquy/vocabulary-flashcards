"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { WordItem } from "@/types";
import {
  playTapSound,
  playFlipSound,
  playChimeSound,
  speakText,
  getWordTypeBadgeClass,
  getWordTypeLabel,
} from "@/lib/audio";
import confetti from "canvas-confetti";

interface FlashcardTabProps {
  words: WordItem[];
  allUnitWordsCount: number;
  currentIndex: number;
  onNextCard: () => void;
  onPrevCard: () => void;
  currentUnit: string;
  learnedWords: Set<string>;
  onToggleLearned: (word: string) => void;
  filterOnlyIncomplete: boolean;
  onToggleFilterIncomplete: () => void;
  isShuffled: boolean;
  onToggleShuffle: () => void;
  isSoundMuted: boolean;
  speechRate: number;
}

export const FlashcardTab: React.FC<FlashcardTabProps> = ({
  words,
  currentIndex,
  onNextCard,
  onPrevCard,
  currentUnit,
  learnedWords,
  onToggleLearned,
  filterOnlyIncomplete,
  onToggleFilterIncomplete,
  isShuffled,
  onToggleShuffle,
  isSoundMuted,
  speechRate,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideAnim, setSlideAnim] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingExample, setIsSpeakingExample] = useState(false);
  const [copied, setCopied] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isTouchSwiping = useRef(false);

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
        () => setIsSpeaking(false),
      );
    }, 100);
    return () => clearTimeout(timer);
  }, [currentIndex, word, isSoundMuted, speechRate]);

  // Handle flip card
  const handleFlip = useCallback(() => {
    if (isTouchSwiping.current || !word) return;
    playFlipSound(isSoundMuted);
    setIsFlipped((prev) => {
      const next = !prev;
      if (next && word.example && !isSoundMuted) {
        // Auto-speak example on flip
        setTimeout(() => {
          speakText(
            word.example,
            speechRate,
            () => setIsSpeakingExample(true),
            () => setIsSpeakingExample(false),
          );
        }, 150);
      } else if (!next) {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      }
      return next;
    });
  }, [isSoundMuted, word, speechRate]);

  // Next card with animation
  const handleNext = useCallback(() => {
    if (words.length === 0) return;
    setSlideAnim("slide-out-left");
    setTimeout(() => {
      onNextCard();
      setSlideAnim("slide-in-right");
      setTimeout(() => setSlideAnim(""), 220);
    }, 140);
  }, [words.length, onNextCard]);

  // Prev card with animation
  const handlePrev = useCallback(() => {
    if (words.length === 0) return;
    setSlideAnim("slide-out-right");
    setTimeout(() => {
      onPrevCard();
      setSlideAnim("slide-in-left");
      setTimeout(() => setSlideAnim(""), 220);
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
      () => setIsSpeaking(false),
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
        () => setIsSpeakingExample(false),
      );
    },
    [word, isSoundMuted, speechRate],
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
          // Fallback
          const ta = document.createElement("textarea");
          ta.value = textToCopy;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
    },
    [word, isSoundMuted],
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
          handleNext();
        } else {
          handlePrev();
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

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleNext, handlePrev, isSoundMuted]);

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

      if (e.code === "ArrowDown" || e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        playTapSound(isSoundMuted);
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        playTapSound(isSoundMuted);
        handlePrev();
      } else if (e.code === "KeyS" || e.code === "ArrowUp") {
        e.preventDefault();
        handleSpeakCurrent();
      } else if (e.code === "KeyM") {
        e.preventDefault();
        handleToggleLearned();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    handleFlip,
    handleNext,
    handlePrev,
    handleSpeakCurrent,
    handleToggleLearned,
    isSoundMuted,
  ]);

  // Responsive font sizes
  const wordLen = word?.word?.length || 0;
  let wordFontClass =
    "text-4xl sm:text-6xl md:text-7xl font-bold tracking-[-0.8px]";
  if (wordLen > 20) {
    wordFontClass = "text-xl sm:text-2xl md:text-3xl font-bold tracking-normal";
  } else if (wordLen > 13) {
    wordFontClass =
      "text-2xl sm:text-3xl md:text-5xl font-bold tracking-[-0.4px]";
  } else if (wordLen > 8) {
    wordFontClass =
      "text-3xl sm:text-5xl md:text-6xl font-bold tracking-[-0.6px]";
  }

  const meaningLen = word?.meaning?.length || 0;
  let meaningFontClass = "text-xl sm:text-2xl md:text-3xl font-bold";
  if (meaningLen > 40) {
    meaningFontClass = "text-base sm:text-lg md:text-xl font-medium";
  } else if (meaningLen > 22) {
    meaningFontClass = "text-lg sm:text-xl md:text-2xl font-semibold";
  }

  const exampleLen = word?.example?.length || 0;
  let exampleFontClass = "text-sm sm:text-base";
  if (exampleLen > 105) {
    exampleFontClass = "text-[11px] sm:text-xs md:text-sm";
  } else if (exampleLen > 70) {
    exampleFontClass = "text-xs sm:text-sm md:text-base";
  }

  // Highlight word in example
  const renderExampleHtml = () => {
    if (!word || !word.example) {
      return (
        <span className="text-mute italic font-mono">
          // No example context attached.
        </span>
      );
    }
    try {
      const regex = new RegExp(`\\b(${word.word})\\b`, "gi");
      const parts = word.example.split(regex);
      return parts.map((part, i) =>
        part.toLowerCase() === word.word.toLowerCase() ? (
          <span
            key={i}
            className="text-primary font-semibold underline decoration-primary/40"
          >
            {part}
          </span>
        ) : (
          part
        ),
      );
    } catch {
      return word.example;
    }
  };

  const formattedIdx = String(words.length > 0 ? currentIndex + 1 : 0).padStart(
    2,
    "0",
  );
  const formattedTotal = String(words.length).padStart(2, "0");
  const progressPct =
    words.length > 0
      ? Math.round(((currentIndex + 1) / words.length) * 100)
      : 100;

  return (
    <section
      id="tab-flashcards"
      className="flex flex-col flex-1 w-full justify-between h-full min-h-0"
    >
      {/* Top Eyebrow & Metric Progress Bar */}
      <div className="mb-2 sm:mb-3 flex-shrink-0">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span
            id="fcUnitTitle"
            className="truncate max-w-[220px] sm:max-w-xs text-primary font-semibold tracking-wide"
          >
            {currentUnit === "ALL" ? "All 20 Units" : currentUnit}
          </span>
          <span id="fcCounter" className="text-mute font-mono">
            {formattedIdx} / {formattedTotal}
          </span>
        </div>
        <div className="w-full bg-canvas-soft h-1 rounded-none border-b border-hairline">
          <div
            id="fcProgressBar"
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Card or Empty State */}
      <div
        id="flashcardWrapper"
        ref={wrapperRef}
        className={`perspective-1000 w-full min-h-[260px] sm:min-h-[290px] flex-1 max-h-[300px] select-none cursor-pointer my-auto ${slideAnim}`}
        onClick={handleFlip}
      >
        {words.length === 0 ? (
          /* Empty State */
          <div
            id="fcEmptyState"
            className="relative w-full h-full min-h-[320px] sm:min-h-[360px] rounded-[10px] border border-hairline bg-canvas p-6 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-2xl font-mono">
              ✓
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-ink font-sans">
                ĐÃ MASTER TOÀN BỘ UNIT!
              </h3>
              <p className="text-xs sm:text-sm text-mute mt-1.5 font-sans max-w-xs leading-relaxed">
                Tất cả từ vựng trong danh sách này đều đã được đánh dấu thuộc.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playTapSound(isSoundMuted);
                onToggleFilterIncomplete();
              }}
              className="py-2.5 px-4 rounded-[6px] bg-primary text-primary-on text-xs sm:text-sm font-semibold font-mono tracking-wider tap-bounce cursor-pointer"
            >
              XEM LẠI TẤT CẢ TỪ
            </button>
          </div>
        ) : (
          /* Card with Front & Back */
          <div
            id="flashcardInner"
            className={`relative w-full h-full transform-style-3d card-transition min-h-[320px] sm:min-h-[360px] rounded-[10px] border border-hairline bg-canvas ${
              isFlipped ? "rotate-y-180" : ""
            }`}
          >
            {/* FRONT OF CARD */}
            <div className="absolute inset-0 w-full h-full backface-hidden rounded-[10px] p-4 sm:p-6 md:p-7 flex flex-col justify-between overflow-hidden bg-canvas border border-hairline">
              {/* Front Top Metadata */}
              <div className="flex items-center justify-between">
                <span
                  id="fcFrontType"
                  className={`px-2.5 py-1 rounded-[4px] text-xs sm:text-sm font-mono font-medium uppercase tracking-wider border ${getWordTypeBadgeClass(
                    word?.type || "",
                  )}`}
                >
                  {getWordTypeLabel(word?.type || "")}
                </span>
                <div
                  id="fcFrontLearnedIndicator"
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-mono px-2.5 py-1 rounded-[4px] bg-canvas-soft border ${
                    isLearned
                      ? "text-primary border-primary/50"
                      : "text-mute border-hairline"
                  }`}
                >
                  <span id="fcFrontLearnedIcon">{isLearned ? "●" : "○"}</span>
                  <span id="fcFrontLearnedLabel">
                    {isLearned ? "MASTERED" : "LEARNING"}
                  </span>
                </div>
              </div>

              {/* Front Center (Word) */}
              <div className="my-auto text-center py-2 sm:py-4 flex-1 flex flex-col justify-center items-center">
                <h2
                  id="fcWord"
                  className={`${wordFontClass} text-ink-strong leading-tight font-sans break-words max-w-full`}
                >
                  {word?.word}
                </h2>
                <div className="inline-flex items-center gap-2 mt-2 sm:mt-3 text-xs sm:text-sm font-mono text-mute">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>CAMBRIDGE VOCABULARY SPEC</span>
                </div>
              </div>

              {/* Front Bottom Eyebrow */}
              <div className="text-center text-[11px] sm:text-xs text-mute flex items-center justify-center gap-1.5 font-mono uppercase tracking-[1.5px] sm:tracking-[2px] pt-2 border-t border-hairline/60">
                <span className="text-primary text-sm font-bold">➔</span>
                <span>CHẠM HOẶC [↓] ĐỂ LẬT • VUỐT ĐỂ CHUYỂN TỪ</span>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[10px] p-4 sm:p-6 md:p-7 flex flex-col justify-between overflow-hidden bg-canvas border border-hairline">
              {/* Back Top Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-hairline gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    id="fcBackWord"
                    className="font-sans font-bold text-lg sm:text-2xl text-ink-strong truncate max-w-[180px] sm:max-w-xs"
                  >
                    {word?.word}
                  </span>
                  <span
                    id="fcBackType"
                    className={`text-xs font-mono px-2 py-0.5 rounded uppercase border font-medium shrink-0 ${getWordTypeBadgeClass(
                      word?.type || "",
                    )}`}
                  >
                    {word?.type}
                  </span>
                </div>
                <div
                  id="fcBackLearnedIndicator"
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-mono px-2.5 py-1 rounded-[4px] bg-canvas-soft border shrink-0 ${
                    isLearned
                      ? "text-primary border-primary/50"
                      : "text-mute border-hairline"
                  }`}
                >
                  <span id="fcBackLearnedIcon">{isLearned ? "●" : "○"}</span>
                  <span id="fcBackLearnedLabel">
                    {isLearned ? "MASTERED" : "LEARNING"}
                  </span>
                </div>
              </div>

              {/* Meaning & Example Container */}
              <div className="my-auto py-1.5 sm:py-2.5 space-y-2 sm:space-y-3 min-h-0 flex-1 flex flex-col justify-center">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-mono text-mute uppercase tracking-[2px] mb-1 font-medium">
                    VIETNAMESE DEFINITION
                  </p>
                  <p
                    id="fcMeaning"
                    className={`${meaningFontClass} text-primary leading-snug font-sans`}
                  >
                    {word?.meaning}
                  </p>
                </div>

                {/* Context Example */}
                <div
                  id="fcExampleContainer"
                  className="bg-canvas-soft p-2.5 sm:p-3.5 rounded-[8px] border border-hairline"
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="text-[10px] sm:text-[11px] font-mono text-mute uppercase tracking-widest font-medium flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-primary font-bold">//</span>
                      <span>IELTS CONTEXT EXAMPLE</span>
                    </div>
                    {word?.example && (
                      <div className="flex items-center gap-1 shrink-0 -mr-0.5">
                        <button
                          type="button"
                          onClick={handleSpeakExample}
                          id="fcSpeakExampleBtn"
                          className={`p-1 rounded-[4px] hover:bg-canvas transition-all tap-bounce flex items-center justify-center cursor-pointer ${
                            isSpeakingExample
                              ? "text-primary"
                              : "text-mute hover:text-primary"
                          }`}
                          title="Listen to example"
                        >
                          <svg
                            className="w-3.5 h-3.5 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyExample}
                          id="fcCopyExampleBtn"
                          className="p-1 rounded-[4px] hover:bg-canvas text-mute hover:text-primary transition-all tap-bounce flex items-center justify-center cursor-pointer"
                          title="Copy example"
                        >
                          {copied ? (
                            <svg
                              className="w-3.5 h-3.5 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  <p
                    id="fcExample"
                    className={`${exampleFontClass} text-body leading-snug sm:leading-relaxed font-sans font-normal line-clamp-3`}
                  >
                    {renderExampleHtml()}
                  </p>
                </div>
              </div>

              {/* Back Bottom Eyebrow */}
              <div className="text-center text-[11px] sm:text-xs text-mute flex items-center justify-center gap-1.5 font-mono uppercase tracking-[1.5px] sm:tracking-[2px] pt-2 border-t border-hairline/60">
                <span className="text-primary text-sm font-bold">➔</span>
                <span>CHẠM HOẶC [↓] ĐỂ QUAY LẠI TỪ VỰNG</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Row */}
      <div className="mt-3 sm:mt-5 flex flex-col gap-2.5 sm:gap-3 flex-shrink-0">
        {/* Full-width Pronounce Button */}
        <div>
          <button
            onClick={handleSpeakCurrent}
            id="fcAudioBtn"
            className="w-full py-2.5 sm:py-3 px-4 rounded-[8px] bg-primary hover:bg-primary-soft text-primary-on font-semibold text-xs sm:text-sm min-h-[44px] flex items-center justify-center gap-2 transition-all tap-bounce font-mono uppercase tracking-wider cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            <span id="fcAudioBtnText">PRONOUNCE (US/UK)</span>
            {isSpeaking && (
              <div id="fcAudioWave" className="flex items-center gap-0.5 ml-1">
                <span className="soundwave-bar w-0.5 bg-primary-on" />
                <span className="soundwave-bar w-0.5 bg-primary-on" />
                <span className="soundwave-bar w-0.5 bg-primary-on" />
                <span className="soundwave-bar w-0.5 bg-primary-on" />
              </div>
            )}
          </button>
        </div>

        {/* Status & Auxiliary Actions: MARK MASTERED, Incomplete, SHUFFLE */}
        <div className="flex items-center justify-between gap-2 sm:gap-2.5 text-xs sm:text-sm font-mono">
          <button
            onClick={handleToggleLearned}
            id="fcToggleLearnedAction"
            className={`flex-1 py-2.5 sm:py-3 px-3 rounded-[8px] min-h-[44px] flex items-center justify-center gap-2 transition-all tap-bounce font-mono cursor-pointer ${
              isLearned
                ? "bg-canvas-soft border border-primary text-primary font-semibold"
                : "bg-canvas hover:bg-canvas-soft border border-hairline text-ink"
            }`}
          >
            <span id="fcActionLearnedIcon" className="text-primary font-bold">
              {isLearned ? "●" : "○"}
            </span>
            <span id="fcActionLearnedText">
              {isLearned ? "MASTERED (REVOKE)" : "MARK MASTERED"}
            </span>
          </button>

          <button
            onClick={() => {
              playTapSound(isSoundMuted);
              onToggleFilterIncomplete();
            }}
            id="btnFilterIncomplete"
            className={`py-2.5 sm:py-3 px-3 rounded-[8px] min-h-[44px] flex items-center justify-center gap-1.5 transition-all tap-bounce font-mono text-xs sm:text-sm cursor-pointer ${
              filterOnlyIncomplete
                ? "bg-primary/15 hover:bg-primary/25 border border-primary text-primary font-semibold"
                : "bg-canvas hover:bg-canvas-soft border border-hairline text-body"
            }`}
            title="Lọc từ chưa thuộc"
          >
            <span id="filterIncompleteIcon">
              {filterOnlyIncomplete ? "●" : "○"}
            </span>
            <span id="filterIncompleteText">
              {filterOnlyIncomplete
                ? `Incomplete (${words.length})`
                : "Incomplete"}
            </span>
          </button>

          <button
            onClick={() => {
              playTapSound(isSoundMuted);
              onToggleShuffle();
            }}
            id="btnShuffle"
            className={`py-2.5 sm:py-3 px-3 rounded-[8px] border min-h-[44px] flex items-center justify-center gap-1.5 transition-all tap-bounce font-mono cursor-pointer ${
              isShuffled
                ? "bg-primary text-primary-on border-primary font-semibold"
                : "bg-canvas hover:bg-canvas-soft border-hairline text-body"
            }`}
          >
            <span>SHUFFLE</span>
          </button>
        </div>
      </div>
    </section>
  );
};
