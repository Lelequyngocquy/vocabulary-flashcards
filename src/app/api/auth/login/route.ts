import { NextResponse } from 'next/server';
import { findUserByUsername, getProgress, getDefaultCategory, getDefaultTopic } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const data = await request.json().catch(() => ({}));
    const username = (data.username || '').trim();
    const password = (data.password || '').trim();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both username and password.' },
        { status: 400 }
      );
    }

    const user = findUserByUsername(username);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const p = getProgress(user.id);
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
    };

    const userRole = user.role || (user.username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER');
    const isAdmin = userRole === 'ADMIN' || user.username.toLowerCase() === 'admin';
    const token = createToken(user.id, user.username, userRole);

    return NextResponse.json({
      success: true,
      token,
      username: user.username,
      role: userRole,
      isAdmin,
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
