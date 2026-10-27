import { NextResponse } from 'next/server';
import { findUserById, updateUserPassword } from '@/lib/db';
import { getUserFromRequest, verifyPassword, hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đầy đủ mật khẩu hiện tại và mật khẩu mới.' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu mới phải có độ dài tối thiểu từ 6 ký tự.' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.' },
        { status: 400 }
      );
    }

    const userRecord = findUserById(user.userId);
    if (!userRecord) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thông tin tài khoản người dùng.' },
        { status: 404 }
      );
    }

    const isMatch = verifyPassword(currentPassword, userRecord.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu hiện tại không chính xác. Vui lòng thử lại.' },
        { status: 400 }
      );
    }

    const newHash = hashPassword(newPassword);
    const updated = updateUserPassword(user.userId, newHash);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Không thể cập nhật mật khẩu vào cơ sở dữ liệu. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu thành công!',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: `Lỗi hệ thống: ${err.message || 'Unknown'}` },
      { status: 500 }
    );
  }
}
