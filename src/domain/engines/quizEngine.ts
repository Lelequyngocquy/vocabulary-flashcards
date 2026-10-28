import { WordItem, QuizQuestion, QuizMode, QuizOption } from '../entities';

export interface GenerateQuizConfig {
  allWords: WordItem[];
  currentUnit: string;
  quizMode: QuizMode;
  quizLength: number | 'ALL';
}

export function shuffleArray<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateQuizQuestions(config: GenerateQuizConfig): QuizQuestion[] {
  const { allWords, currentUnit, quizMode, quizLength } = config;

  if (!allWords || allWords.length === 0) return [];

  let pool =
    currentUnit === 'ALL'
      ? [...allWords]
      : allWords.filter((w) => w.library === currentUnit);

  if (pool.length < 4) {
    pool = [...allWords];
  }
  pool = shuffleArray(pool);

  const count =
    quizLength === 'ALL'
      ? pool.length
      : Math.min(typeof quizLength === 'number' ? quizLength : parseInt(String(quizLength), 10) || pool.length, pool.length);

  const questions: QuizQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const target = pool[i];
    let isEnToVi = true;
    if (quizMode === 'VI_TO_EN') isEnToVi = false;
    else if (quizMode === 'MIX') isEnToVi = Math.random() > 0.5;

    const candidateDistractors = shuffleArray(allWords.filter((w) => w.word !== target.word));
    const distractorWords = [
      candidateDistractors[0] || target,
      candidateDistractors[1] || target,
      candidateDistractors[2] || target,
    ];

    const rawOptions: QuizOption[] = [
      { text: isEnToVi ? target.meaning : target.word, isCorrect: true },
      { text: isEnToVi ? distractorWords[0].meaning : distractorWords[0].word, isCorrect: false },
      { text: isEnToVi ? distractorWords[1].meaning : distractorWords[1].word, isCorrect: false },
      { text: isEnToVi ? distractorWords[2].meaning : distractorWords[2].word, isCorrect: false },
    ];

    const options = shuffleArray(rawOptions);

    questions.push({
      target,
      isEnToVi,
      prompt: isEnToVi ? target.word : target.meaning,
      options,
    });
  }

  return questions;
}

export function evaluateQuizAnswer(
  question: QuizQuestion,
  selectedOptionIndex: number
): { isCorrect: boolean; correctOptionIndex: number } {
  const correctOptionIndex = question.options.findIndex((opt) => opt.isCorrect);
  const selectedOption = question.options[selectedOptionIndex];
  const isCorrect = selectedOption ? selectedOption.isCorrect : false;

  return {
    isCorrect,
    correctOptionIndex: correctOptionIndex !== -1 ? correctOptionIndex : 0,
  };
}

export function calculateQuizAccuracy(score: number, total: number): {
  accuracyPct: number;
  isMastered: boolean;
} {
  if (total <= 0) return { accuracyPct: 0, isMastered: false };
  const accuracyPct = Math.round((score / total) * 100);
  return {
    accuracyPct,
    isMastered: accuracyPct >= 80,
  };
}
