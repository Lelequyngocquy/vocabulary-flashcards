import { NextResponse } from 'next/server';
import { findUserByUsername, getProgress } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const data = await request.json().catch(() => ({}));
    const username = (data.username || '').trim();
    const password = (data.password || '').trim();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' },
        { status: 400 }
      );
    }

    const user = findUserByUsername(username);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { success: false, error: 'Sai tên đăng nhập hoặc mật khẩu.' },
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

    const progressData = {
      current_unit: p ? p.current_unit : 'Unit 1: Growing Up',
      current_index: p ? p.current_index : 0,
      learned_words: learnedWords,
      quiz_stats: quizStats,
    };

    const token = createToken(user.id, user.username);

    return NextResponse.json({
      success: true,
      token,
      username: user.username,
      progress: progressData,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: `Lỗi hệ thống: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
