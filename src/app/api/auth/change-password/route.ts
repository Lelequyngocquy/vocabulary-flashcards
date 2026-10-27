import { NextResponse } from 'next/server';
import { findUserById, updateUserPassword } from '@/lib/db';
import { getUserFromRequest, verifyPassword, hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Session expired or invalid. Please log in again.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Please provide both current password and new password.' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: 'New password must differ from current password.' },
        { status: 400 }
      );
    }

    const userRecord = findUserById(user.userId);
    if (!userRecord) {
      return NextResponse.json(
        { success: false, error: 'User account not found.' },
        { status: 404 }
      );
    }

    const isMatch = verifyPassword(currentPassword, userRecord.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Incorrect current password. Please try again.' },
        { status: 400 }
      );
    }

    const newHash = hashPassword(newPassword);
    const updated = updateUserPassword(user.userId, newHash);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update password in database. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: `System error: ${err.message || 'Unknown'}` },
      { status: 500 }
    );
  }
}
