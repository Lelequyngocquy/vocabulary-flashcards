import { NextResponse } from 'next/server';
import { createUser, findUserByUsername, getDefaultCategory, getDefaultTopic } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const data = await request.json().catch(() => ({}));
    const username = (data.username || '').trim();
    const password = (data.password || '').trim();

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { success: false, error: 'Username must be between 3 and 30 characters.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const existing = findUserByUsername(username);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This username is already taken. Please choose another.' },
        { status: 400 }
      );
    }

    const hashedPw = hashPassword(password);
    const user = createUser(username, hashedPw);
    const userRole = user.role || (user.username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER');
    const isAdmin = userRole === 'ADMIN';
    const token = createToken(user.id, user.username, userRole);

    const defaultCat = getDefaultCategory();
    const defaultTopic = getDefaultTopic(defaultCat.id);

    return NextResponse.json({
      success: true,
      token,
      username: user.username,
      role: userRole,
      isAdmin,
      progress: {
        current_category: defaultCat.category,
        current_unit: defaultTopic,
        current_index: 0,
        learned_words: [],
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: `System error: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
