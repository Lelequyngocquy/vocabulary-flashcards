'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { WordItem } from '@/types';
import { playTapSound, playChimeSound } from '@/lib/audio';

interface EditWordModalProps {
  word: WordItem | null;
  isOpen: boolean;
  onClose: () => void;
  onWordUpdated: (updated: WordItem) => void;
  categoriesList: { id: number; category: string }[];
  allWords: WordItem[];
  isSoundMuted: boolean;
  isAdmin?: boolean;
  authToken?: string | null;
}

export const EditWordModal: React.FC<EditWordModalProps> = ({
  word,
  isOpen,
  onClose,
  onWordUpdated,
  categoriesList,
  allWords,
  isSoundMuted,
  isAdmin = false,
  authToken = null,
}) => {
  const [wordText, setWordText] = useState('');
  const [type, setType] = useState('n');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [category, setCategory] = useState('Cambridge Vocabulary');
  const [library, setLibrary] = useState('Unit 1: Growing Up');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamically compute topics strictly belonging to the currently selected category in modal
  const topicsForCategory = useMemo(() => {
    const set = new Set<string>();
    allWords.forEach((w) => {
      const wordCat = w.category || 'Cambridge Vocabulary';
      if (wordCat === category) {
        if (w.library) set.add(w.library);
      }
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
  }, [allWords, category]);

  // Sync state when word changes or modal opens
  useEffect(() => {
    if (word) {
      setWordText(word.word || '');
      setType(word.type || 'n');
      setMeaning(word.meaning || '');
      setExample(word.example || '');
      const wordCat = word.category || 'Cambridge Vocabulary';
      setCategory(wordCat);
      setLibrary(word.library || 'Unit 1: Growing Up');
      setIsCustomCategory(false);
      setIsCustomTopic(false);
      setErrorMsg('');
    }
  }, [word, isOpen]);

  if (!isOpen || !word) return null;

  // Handle category change: auto-select the first topic belonging to this category
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setIsCustomTopic(false);

    // Filter topics for the new category
    const set = new Set<string>();
    allWords.forEach((w) => {
      const wordCat = w.category || 'Cambridge Vocabulary';
      if (wordCat === newCat && w.library) {
        set.add(w.library);
      }
    });
    const topics = Array.from(set);
    if (topics.length > 0) {
      if (!topics.includes(library)) {
        setLibrary(topics[0]);
      }
    } else {
      // Category has no topics yet -> switch to custom topic input
      setIsCustomTopic(true);
      setLibrary('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordText.trim() || !meaning.trim()) {
      setErrorMsg('Word and meaning cannot be empty.');
      return;
    }

    const finalCategory = category.trim() || 'Cambridge Vocabulary';
    const finalLibrary = library.trim() || 'Unit 1: Growing Up';

    setLoading(true);
    setErrorMsg('');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/words', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          id: word.id,
          word: wordText.trim(),
          type: type.trim(),
          meaning: meaning.trim(),
          example: example.trim(),
          library: finalLibrary,
          category: finalCategory,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update word.');
      }

      playChimeSound(isSoundMuted);
      onWordUpdated(data.word);
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'System error while updating.');
    } finally {
      setLoading(false);
    }
  };

  const posOptions = [
    { value: 'n', label: 'Noun (n)' },
    { value: 'v', label: 'Verb (v)' },
    { value: 'adj', label: 'Adjective (adj)' },
    { value: 'adv', label: 'Adverb (adv)' },
    { value: 'phrase', label: 'Phrase' },
    { value: 'idiom', label: 'Idiom' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playTapSound(isSoundMuted);
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md bg-canvas border border-hairline rounded-[8px] p-4 sm:p-5 shadow-2xl text-ink font-sans max-h-[92vh] flex flex-col min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-hairline pb-3 mb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h3 className="font-mono font-bold text-sm text-ink-strong tracking-tight uppercase">
                EDIT VOCABULARY
              </h3>
            </div>
            <p className="text-[11px] font-mono text-mute mt-0.5">
              ID #{word.id} · Relational Move & Update
            </p>
          </div>
          <button
            onClick={() => {
              playTapSound(isSoundMuted);
              onClose();
            }}
            className="text-mute hover:text-ink p-1 rounded hover:bg-canvas-soft transition-all cursor-pointer"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-3 px-3 py-2 bg-red-950/40 border border-red-500/50 rounded-[4px] text-red-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form id="editWordForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {/* Word & Part of Speech Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[11px] font-mono font-semibold text-mute uppercase mb-1">
                Word / Term *
              </label>
              <input
                type="text"
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                required
                className="w-full bg-canvas-soft text-ink font-mono px-3 py-1.5 rounded-[4px] border border-hairline focus:outline-none focus:border-primary transition-all text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-semibold text-mute uppercase mb-1">
                POS (Type)
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-canvas-soft text-ink font-mono px-2 py-1.5 rounded-[4px] border border-hairline focus:outline-none focus:border-primary transition-all text-xs cursor-pointer"
              >
                {posOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
                {!posOptions.some((o) => o.value === type) && (
                  <option value={type}>{type}</option>
                )}
              </select>
            </div>
          </div>

          {/* Meaning (Vietnamese) */}
          <div>
            <label className="block text-[11px] font-mono font-semibold text-mute uppercase mb-1">
              Meaning (Vietnamese) *
            </label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              required
              placeholder="e.g. Tuổi thiếu niên / Thời kỳ vị thành niên"
              className="w-full bg-canvas-soft text-ink px-3 py-1.5 rounded-[4px] border border-hairline focus:outline-none focus:border-primary transition-all text-xs"
            />
          </div>

          {/* Example Sentence */}
          <div>
            <label className="block text-[11px] font-mono font-semibold text-mute uppercase mb-1">
              Example Sentence (English)
            </label>
            <textarea
              rows={2}
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="e.g. During adolescence, teenagers experience many emotional changes..."
              className="w-full bg-canvas-soft text-ink px-3 py-1.5 rounded-[4px] border border-hairline focus:outline-none focus:border-primary transition-all text-xs resize-none"
            />
          </div>

          {/* Category Selector (Move Word to Category) */}
          <div className="pt-2 border-t border-hairline/60">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono font-semibold text-primary uppercase flex items-center gap-1">
                <span>Category (Domain)</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  playTapSound(isSoundMuted);
                  setIsCustomCategory(!isCustomCategory);
                  if (!isCustomCategory) {
                    setIsCustomTopic(true);
                    setLibrary('');
                  }
                }}
                className="text-[10px] font-mono text-mute hover:text-primary transition-colors cursor-pointer"
              >
                {isCustomCategory ? '← Choose Existing' : '+ New Category'}
              </button>
            </div>

            {isCustomCategory ? (
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter new category name (e.g. TOEIC, IELTS)..."
                className="w-full bg-canvas-soft text-ink font-mono px-3 py-1.5 rounded-[4px] border border-primary focus:outline-none text-xs"
              />
            ) : (
              <select
                value={category}
                onChange={(e) => {
                  playTapSound(isSoundMuted);
                  handleCategoryChange(e.target.value);
                }}
                className="w-full bg-canvas-soft text-ink font-mono px-3 py-1.5 rounded-[4px] border border-hairline focus:outline-none focus:border-primary transition-all text-xs cursor-pointer"
              >
                {categoriesList.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category}
                  </option>
                ))}
                {!categoriesList.some((c) => c.category === category) && (
                  <option value={category}>{category}</option>
                )}
              </select>
            )}
            <p className="text-[10px] text-mute mt-0.5 italic">
              Moving will update category_words & category_topics relations.
            </p>
          </div>

          {/* Topic / Unit Selector (Filtered strictly by selected category) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono font-semibold text-primary uppercase flex items-center gap-1">
                <span>Topic in {isCustomCategory ? 'New Category' : category}</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  playTapSound(isSoundMuted);
                  setIsCustomTopic(!isCustomTopic);
                }}
                className="text-[10px] font-mono text-mute hover:text-primary transition-colors cursor-pointer"
              >
                {isCustomTopic ? '← Choose Existing' : '+ New Topic'}
              </button>
            </div>

            {isCustomTopic || topicsForCategory.length === 0 ? (
              <input
                type="text"
                value={library}
                onChange={(e) => setLibrary(e.target.value)}
                placeholder={`Enter new topic in ${category}...`}
                className="w-full bg-canvas-soft text-ink font-mono px-3 py-1.5 rounded-[4px] border border-primary focus:outline-none text-xs"
              />
            ) : (
              <select
                value={library}
                onChange={(e) => setLibrary(e.target.value)}
                className="w-full bg-canvas-soft text-ink font-mono px-3 py-1.5 rounded-[4px] border border-hairline focus:outline-none focus:border-primary transition-all text-xs cursor-pointer"
              >
                {topicsForCategory.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
                {!topicsForCategory.some((t) => t.name === library) && (
                  <option value={library}>{library}</option>
                )}
              </select>
            )}
            <p className="text-[10px] text-mute mt-0.5 italic">
              Strictly filtered: only topics belonging to &ldquo;{category}&rdquo; are shown.
            </p>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-hairline flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              playTapSound(isSoundMuted);
              onClose();
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-[4px] bg-canvas-soft hover:bg-canvas text-mute hover:text-ink font-mono text-xs border border-hairline transition-all cursor-pointer tap-bounce"
          >
            CANCEL
          </button>
          <button
            type="submit"
            form="editWordForm"
            disabled={loading}
            className="px-4 py-1.5 rounded-[4px] bg-primary hover:bg-primary-soft text-primary-on font-mono font-semibold text-xs transition-all cursor-pointer tap-bounce shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-primary-on border-t-transparent rounded-full animate-spin" />
                <span>SAVING...</span>
              </>
            ) : (
              <span>SAVE CHANGES</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
