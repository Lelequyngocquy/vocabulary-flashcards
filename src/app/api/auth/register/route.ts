import { NextResponse } from 'next/server';
import { createUser, findUserByUsername } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const data = await request.json().catch(() => ({}));
    const username = (data.username || '').trim();
    const password = (data.password || '').trim();

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { success: false, error: 'Tên đăng nhập phải từ 3 đến 30 ký tự.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' },
        { status: 400 }
      );
    }

    const existing = findUserByUsername(username);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.' },
        { status: 400 }
      );
    }

    const hashedPw = hashPassword(password);
    const user = createUser(username, hashedPw);
    const userRole = user.role || (user.username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER');
    const isAdmin = userRole === 'ADMIN';
    const token = createToken(user.id, user.username, userRole);

    return NextResponse.json({
      success: true,
      token,
      username: user.username,
      role: userRole,
      isAdmin,
      progress: {
        current_category: 'Cambridge Vocabulary',
        current_unit: 'Unit 1: Growing Up',
        current_index: 0,
        learned_words: [],
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: `Lỗi hệ thống: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
