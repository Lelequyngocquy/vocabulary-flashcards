'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { WordItem } from '@/domain/entities';
import { extractCategories } from '@/domain/engines/filterEngine';
import { playTapSound, playChimeSound } from '@/infrastructure/device/audioService';
import { wordApi } from '@/infrastructure/api/wordApi';
import { useVocabStore } from '@/application/stores/useVocabStore';
import { useAuthStore } from '@/application/stores/useAuthStore';
import { useSettingsStore } from '@/application/stores/useSettingsStore';
import { useToastStore } from '@/application/stores/useToastStore';

export interface EditWordModalProps {
  word: WordItem | null;
  isOpen: boolean;
  onClose: () => void;
  onWordUpdated?: (updated: WordItem) => void;
  categoriesList?: { id: number; category: string }[];
  allWords?: WordItem[];
  isSoundMuted?: boolean;
  isAdmin?: boolean;
  authToken?: string | null;
}

export const EditWordModal: React.FC<EditWordModalProps> = (props) => {
  const { word, isOpen, onClose } = props;

  // Stores
  const storeAllWords = useVocabStore((s) => s.allWords);
  const storeCategoriesList = useVocabStore((s) => s.categoriesList);
  const storeUpdateWord = useVocabStore((s) => s.updateWord);

  const storeAuthToken = useAuthStore((s) => s.authToken);
  const storeIsAdmin = useAuthStore((s) => s.isAdmin);

  const storeIsSoundMuted = useSettingsStore((s) => s.isSoundMuted);
  const storeShowToast = useToastStore((s) => s.showToast);

  // Fallback to store
  const allWords = props.allWords ?? storeAllWords;
  const derivedCategories = useMemo(
    () => extractCategories(allWords, storeCategoriesList),
    [allWords, storeCategoriesList]
  );
  const categoriesList = props.categoriesList ?? derivedCategories;
  const authToken = props.authToken !== undefined ? props.authToken : storeAuthToken;
  const isAdmin = props.isAdmin !== undefined ? props.isAdmin : storeIsAdmin;
  const isSoundMuted = props.isSoundMuted ?? storeIsSoundMuted;

  const onWordUpdated = props.onWordUpdated ?? storeUpdateWord;

  // Form states
  const [wordText, setWordText] = useState('');
  const [type, setType] = useState('n');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [category, setCategory] = useState(word?.category || categoriesList[0]?.category || '');
  const [library, setLibrary] = useState(word?.library || '');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamically compute topics strictly belonging to the currently selected category in modal
  const topicsForCategory = useMemo(() => {
    const defaultCatName = categoriesList[0]?.category || '';
    const set = new Set<string>();
    allWords.forEach((w) => {
      const wordCat = w.category || defaultCatName;
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
  }, [allWords, category, categoriesList]);

  // Sync state when word changes or modal opens
  useEffect(() => {
    if (word) {
      setWordText(word.word || '');
      setType(word.type || 'n');
      setMeaning(word.meaning || '');
      setExample(word.example || '');
      const wordCat = word.category || categoriesList[0]?.category || '';
      setCategory(wordCat);
      setLibrary(word.library || '');
      setIsCustomCategory(false);
      setIsCustomTopic(false);
      setErrorMsg('');
    }
  }, [word, isOpen, categoriesList]);

  if (!isOpen || !word) return null;

  // Handle category change: auto-select the first topic belonging to this category
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setIsCustomTopic(false);

    const defaultCatName = categoriesList[0]?.category || '';
    const set = new Set<string>();
    allWords.forEach((w) => {
      const wordCat = w.category || defaultCatName;
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
      setIsCustomTopic(true);
      setLibrary('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordText.trim() || !meaning.trim()) {
      setErrorMsg('Word and meaning are required.');
      return;
    }

    const finalCategory = isCustomCategory ? category.trim() : category;
    const finalLibrary = isCustomTopic ? library.trim() : library;

    if (!finalCategory) {
      setErrorMsg('Please specify a category.');
      return;
    }
    if (!finalLibrary) {
      setErrorMsg('Please specify a topic / unit.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const updated = await wordApi.updateWord(
        {
          id: word.id,
          word: wordText.trim(),
          type: type.trim(),
          meaning: meaning.trim(),
          example: example.trim(),
          library: finalLibrary,
          category: finalCategory,
        },
        authToken
      );

      playChimeSound(isSoundMuted);
      onWordUpdated(updated);
      storeShowToast(`UPDATED: ${updated.word}`);
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
      <div className="relative w-full max-w-lg rounded-[10px] bg-canvas border border-hairline shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-4 sm:p-6 space-y-4 font-mono max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-canvas-soft border border-hairline text-primary font-mono text-[10px] sm:text-[11px] mb-1">
              <span>EDIT_VOCABULARY</span>
            </div>
            <h2 className="text-lg sm:text-xl font-medium text-ink-strong tracking-tight font-sans">
              Modify Word & Placement
            </h2>
          </div>
          <button
            onClick={() => {
              playTapSound(isSoundMuted);
              onClose();
            }}
            className="text-mute hover:text-ink p-1 rounded hover:bg-canvas-soft transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-[6px] bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-sans">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Word & POS */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] text-mute uppercase tracking-wider">Word</label>
              <input
                type="text"
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                required
                className="w-full bg-canvas-soft text-ink rounded-[6px] border border-hairline px-3 py-2 outline-none focus:border-primary font-sans text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-mute uppercase tracking-wider">POS</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-canvas-soft text-ink rounded-[6px] border border-hairline px-2 py-2 outline-none focus:border-primary text-xs cursor-pointer"
              >
                {posOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Meaning */}
          <div className="space-y-1">
            <label className="text-[10px] text-mute uppercase tracking-wider">
              Vietnamese Meaning
            </label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              required
              className="w-full bg-canvas-soft text-ink rounded-[6px] border border-hairline px-3 py-2 outline-none focus:border-primary font-sans text-sm"
            />
          </div>

          {/* Example */}
          <div className="space-y-1">
            <label className="text-[10px] text-mute uppercase tracking-wider">
              Context Example (English)
            </label>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={2}
              className="w-full bg-canvas-soft text-ink rounded-[6px] border border-hairline px-3 py-2 outline-none focus:border-primary font-sans text-xs resize-none"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-1 pt-1 border-t border-hairline/60">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-mute uppercase tracking-wider">
                Library / Category
              </label>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-[10px] text-primary hover:underline cursor-pointer"
                >
                  {isCustomCategory ? 'Choose Existing' : '+ New Category'}
                </button>
              )}
            </div>
            {isCustomCategory ? (
              <input
                type="text"
                placeholder="Enter new category name..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-canvas-soft text-ink rounded-[6px] border border-primary px-3 py-2 outline-none font-sans text-xs"
              />
            ) : (
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-canvas-soft text-ink rounded-[6px] border border-hairline px-3 py-2 outline-none focus:border-primary text-xs cursor-pointer font-sans"
              >
                {categoriesList.map((c) => (
                  <option key={c.id || c.category} value={c.category}>
                    {c.category}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Topic / Unit Selection */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-mute uppercase tracking-wider">Topic / Unit</label>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsCustomTopic(!isCustomTopic)}
                  className="text-[10px] text-primary hover:underline cursor-pointer"
                >
                  {isCustomTopic ? 'Choose Existing' : '+ New Topic'}
                </button>
              )}
            </div>
            {isCustomTopic || topicsForCategory.length === 0 ? (
              <input
                type="text"
                placeholder="e.g. Unit 21: Artificial Intelligence..."
                value={library}
                onChange={(e) => setLibrary(e.target.value)}
                className="w-full bg-canvas-soft text-ink rounded-[6px] border border-primary px-3 py-2 outline-none font-sans text-xs"
              />
            ) : (
              <select
                value={library}
                onChange={(e) => setLibrary(e.target.value)}
                className="w-full bg-canvas-soft text-ink rounded-[6px] border border-hairline px-3 py-2 outline-none focus:border-primary text-xs cursor-pointer font-sans"
              >
                {topicsForCategory.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-hairline">
            <button
              type="button"
              onClick={() => {
                playTapSound(isSoundMuted);
                onClose();
              }}
              disabled={loading}
              className="px-4 py-2 rounded-[6px] bg-canvas-soft hover:bg-canvas border border-hairline text-mute hover:text-ink text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-[6px] bg-primary hover:bg-primary-soft text-primary-on font-semibold text-xs tracking-wider transition-all tap-bounce cursor-pointer flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-primary-on border-t-transparent rounded-full animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : (
                <span>SAVE CHANGES</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
