import { WordItem } from './word';

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  target: WordItem;
  isEnToVi: boolean;
  prompt: string;
  options: QuizOption[];
}

export type QuizMode = 'EN_TO_VI' | 'VI_TO_EN' | 'MIX';

export type QuizViewState = 'intro' | 'active' | 'result';
