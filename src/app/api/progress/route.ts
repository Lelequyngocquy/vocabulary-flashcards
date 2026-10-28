import { NextResponse } from 'next/server';
import { getProgress, upsertProgress, getDefaultCategory, getDefaultTopic } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated or invalid token.' },
        { status: 401 }
      );
    }

    const p = getProgress(user.userId);
    let learnedWords: string[] = [];
    let quizStats: Record<string, unknown> = {};

    try {
      if (p && p.learned_words) {
        learnedWords = JSON.parse(p.learned_words);
      }
    } catch {
      learnedWords = [];
    }

    try {
      if (p && p.quiz_stats) {
        quizStats = JSON.parse(p.quiz_stats);
      }
    } catch {
      quizStats = {};
    }

    const defaultCat = getDefaultCategory();
    const defaultTopic = getDefaultTopic(defaultCat.id);

    const progressData = {
      current_category: p?.current_category || defaultCat.category,
      current_unit: p?.current_unit || defaultTopic,
      current_index: p ? p.current_index : 0,
      learned_words: learnedWords,
      quiz_stats: quizStats,
      updated_at: p ? p.updated_at : null,
    };

    return NextResponse.json({
      success: true,
      progress: progressData,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: `System error: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated or invalid token.' },
        { status: 401 }
      );
    }

    const defaultCat = getDefaultCategory();
    const defaultTopic = getDefaultTopic(defaultCat.id);

    const data = await request.json().catch(() => ({}));
    const currentCategory = data.current_category || defaultCat.category;
    const currentUnit = data.current_unit || defaultTopic;
    const currentIndex = parseInt(String(data.current_index ?? 0), 10) || 0;
    const learnedWords = Array.isArray(data.learned_words) ? data.learned_words : [];
    const quizStats = data.quiz_stats || {};

    const learnedWordsJson = JSON.stringify(learnedWords);
    const quizStatsJson = JSON.stringify(quizStats);

    upsertProgress(user.userId, currentCategory, currentUnit, currentIndex, learnedWordsJson, quizStatsJson);

    return NextResponse.json({
      success: true,
      message: 'Progress saved successfully',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: `System error: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
