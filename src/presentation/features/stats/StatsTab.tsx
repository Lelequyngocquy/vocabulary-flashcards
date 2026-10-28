'use client';

import React, { useMemo } from 'react';
import { WordItem } from '@/domain/entities';
import { extractUnitsForCategory, filterWordsByCategory } from '@/domain/engines/filterEngine';
import { playTapSound } from '@/infrastructure/device/audioService';
import { useVocabStore } from '@/application/stores/useVocabStore';
import { useSettingsStore } from '@/application/stores/useSettingsStore';

export interface StatsTabProps {
  totalWords?: number;
  masteredCount?: number;
  unitsList?: { name: string; count: number }[];
  allWords?: WordItem[];
  learnedWords?: Set<string>;
  speechRate?: number;
  onSpeechRateChange?: (rate: number) => void;
  onResetAllProgress?: () => void;
  isSoundMuted?: boolean;
  onToggleSound?: () => void;
}

export const StatsTab: React.FC<StatsTabProps> = (props) => {
  // Store subscriptions (zero prop-drilling)
  const storeAllWords = useVocabStore((s) => s.allWords);
  const storeCurrentCategory = useVocabStore((s) => s.currentCategory);
  const storeLearnedWords = useVocabStore((s) => s.learnedWords);
  const storeResetProgress = useVocabStore((s) => s.resetProgress);

  const storeIsSoundMuted = useSettingsStore((s) => s.isSoundMuted);
  const storeSpeechRate = useSettingsStore((s) => s.speechRate);
  const storeToggleSound = useSettingsStore((s) => s.toggleSound);
  const storeSetSpeechRate = useSettingsStore((s) => s.setSpeechRate);

  const currentCategory = storeCurrentCategory;
  const categoryWords = useMemo(
    () => (props.allWords ? props.allWords : filterWordsByCategory(storeAllWords, currentCategory)),
    [props.allWords, storeAllWords, currentCategory]
  );
  const derivedUnitsList = useMemo(
    () => extractUnitsForCategory(categoryWords),
    [categoryWords]
  );

  // Fallback to store if prop is omitted
  const allWords = categoryWords;
  const learnedWords = props.learnedWords ?? storeLearnedWords;
  const unitsList = props.unitsList ?? derivedUnitsList;
  const isSoundMuted = props.isSoundMuted ?? storeIsSoundMuted;
  const speechRate = props.speechRate ?? storeSpeechRate;

  const onToggleSound = props.onToggleSound ?? storeToggleSound;
  const onSpeechRateChange = props.onSpeechRateChange ?? storeSetSpeechRate;
  const onResetAllProgress =
    props.onResetAllProgress ??
    (() => {
      if (confirm('Reset and purge all progress data from SQLite?')) {
        storeResetProgress();
      }
    });

  const totalWords = props.totalWords ?? allWords.length;
  const masteredCount =
    props.masteredCount ?? allWords.filter((w) => learnedWords.has(w.word)).length;
  const pendingCount = Math.max(0, totalWords - masteredCount);
  const totalPercentage = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

  return (
    <section
      id="tab-stats"
      className="flex flex-col flex-1 w-full space-y-3 font-mono min-h-0 overflow-y-auto pr-1 pb-4"
    >
      {/* SYSTEM METRICS */}
      <div className="bg-canvas rounded-[8px] p-5 border border-hairline">
        <div className="text-[10px] text-mute uppercase tracking-[2.52px] mb-1">SYSTEM METRICS</div>
        <h2 className="text-lg font-normal text-ink-strong tracking-tight font-sans">
          Mastery Telemetry
        </h2>
        <p className="text-xs text-body mb-4 font-sans">Real-time status synced with SQLite backend.</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-canvas-soft p-2.5 rounded-[6px] border border-hairline text-center">
            <div className="text-[9px] text-mute uppercase tracking-widest">MASTERED</div>
            <div id="statsLearnedCount" className="text-xl font-bold text-primary mt-0.5">
              {masteredCount}
            </div>
            <div className="text-[9px] text-mute">TERMS</div>
          </div>
          <div className="bg-canvas-soft p-2.5 rounded-[6px] border border-hairline text-center">
            <div className="text-[9px] text-mute uppercase tracking-widest">PENDING</div>
            <div id="statsRemainingCount" className="text-xl font-bold text-ink mt-0.5">
              {pendingCount}
            </div>
            <div className="text-[9px] text-mute">TERMS</div>
          </div>
          <div className="bg-canvas-soft p-2.5 rounded-[6px] border border-hairline text-center">
            <div className="text-[9px] text-mute uppercase tracking-widest">RATE</div>
            <div id="statsPercentage" className="text-xl font-bold text-primary mt-0.5">
              {totalPercentage}%
            </div>
            <div className="text-[9px] text-mute">TOTAL</div>
          </div>
        </div>

        <div className="w-full bg-canvas-soft h-1 rounded-none border-b border-hairline">
          <div
            id="statsTotalProgressBar"
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${totalPercentage}%` }}
          />
        </div>
      </div>

      {/* UNIT BREAKDOWN */}
      <div className="bg-canvas rounded-[8px] p-4 border border-hairline space-y-2.5">
        <h3 className="text-xs font-mono uppercase tracking-widest text-mute">UNIT BREAKDOWN</h3>
        <div id="statsUnitList" className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {unitsList.map((u) => {
            const wordsInUnit = allWords.filter((w) => w.library === u.name);
            const learnedInUnit = wordsInUnit.filter((w) => learnedWords.has(w.word)).length;
            const uPct =
              wordsInUnit.length > 0 ? Math.round((learnedInUnit / wordsInUnit.length) * 100) : 0;

            return (
              <div
                key={u.name}
                className="bg-canvas-soft p-2.5 rounded-[4px] border border-hairline flex flex-col gap-1"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-ink truncate max-w-[220px] font-sans">{u.name}</span>
                  <span className="text-primary">
                    {learnedInUnit} / {wordsInUnit.length} ({uPct}%)
                  </span>
                </div>
                <div className="w-full bg-canvas h-1 rounded-none border-b border-hairline">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ENGINE CONFIGURATION */}
      <div className="bg-canvas rounded-[8px] p-4 border border-hairline space-y-3 font-sans">
        <h3 className="text-xs font-mono uppercase tracking-widest text-mute">ENGINE CONFIGURATION</h3>

        <div className="space-y-3">
          {/* SOUND EFFECTS TOGGLE */}
          <div className="flex items-center justify-between font-mono">
            <div>
              <p className="text-xs text-ink font-semibold">SOUND_EFFECTS</p>
              <p className="text-[10px] text-mute font-sans">
                Synthesized audio for card flips, quiz telemetry, and UI taps.
              </p>
            </div>
            <button
              onClick={onToggleSound}
              id="btnToggleSoundConfig"
              className={`px-3 py-1.5 rounded-[6px] border text-xs font-mono transition-all tap-bounce cursor-pointer flex items-center gap-1.5 ${
                !isSoundMuted
                  ? 'bg-primary/15 border-primary text-primary font-semibold'
                  : 'bg-canvas-soft border-hairline text-mute'
              }`}
            >
              <span>{isSoundMuted ? 'MUTED' : 'ENABLED'}</span>
              <span className="text-xs">{isSoundMuted ? '🔕' : '🔔'}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-hairline">
            <div className="flex items-center justify-between text-xs text-ink mb-1 font-mono">
              <span>SPEECH_VELOCITY</span>
              <span id="speechRateDisplay" className="font-bold text-primary">
                {speechRate}x
              </span>
            </div>
            <input
              type="range"
              id="speechRateRange"
              min="0.6"
              max="1.3"
              step="0.1"
              value={speechRate}
              onChange={(e) => {
                playTapSound(isSoundMuted);
                onSpeechRateChange(parseFloat(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-hairline flex items-center justify-between font-mono">
            <div>
              <p className="text-xs text-rose-400 font-semibold">PURGE_PROGRESS</p>
              <p className="text-[10px] text-mute">Reset all learned markers on SQLite database.</p>
            </div>
            <button
              onClick={() => {
                playTapSound(isSoundMuted);
                onResetAllProgress();
              }}
              className="px-2.5 py-1.5 rounded-[6px] bg-canvas-soft hover:bg-canvas text-rose-400 border border-hairline text-[11px] transition-all tap-bounce cursor-pointer"
            >
              RESET DB
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
