import { NextResponse } from 'next/server';
import {
  getAllWords,
  getWordsByLibrary,
  getWordById,
  getAllCategories,
  getAllTopics,
  addWord,
  updateWord,
  deleteWord,
} from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const library = searchParams.get('library');
    const category = searchParams.get('category');
    const idParam = searchParams.get('id');

    if (idParam) {
      const id = parseInt(idParam, 10);
      const word = getWordById(id);
      if (!word) {
        return NextResponse.json(
          { success: false, error: `Không tìm thấy từ vựng với id=${id}` },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, word });
    }

    const categories = getAllCategories();
    const topics = getAllTopics(category || undefined);
    const words = library
      ? getWordsByLibrary(library, category || undefined)
      : getAllWords(category || undefined);

    return NextResponse.json({
      success: true,
      total: words.length,
      categories,
      topics,
      words,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: `Database error: ${err.message || 'Unknown'}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.word || !data.meaning || !data.library) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp word, meaning và library.' },
        { status: 400 }
      );
    }

    const newWord = addWord({
      word: data.word,
      type: data.type || '',
      meaning: data.meaning,
      example: data.example || '',
      library: data.library,
      category: data.category || 'Cambridge Vocabulary',
    });

    return NextResponse.json({
      success: true,
      message: 'Từ vựng đã được thêm vào cơ sở dữ liệu SQLite.',
      word: newWord,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: `Database error: ${err.message || 'Unknown'}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu trường id của từ vựng cần cập nhật.' },
        { status: 400 }
      );
    }

    const existing = getWordById(Number(data.id));
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy từ vựng với id=${data.id}` },
        { status: 404 }
      );
    }

    // Role check: Only admin can modify default Cambridge Vocabulary
    const user = getUserFromRequest(request);
    const isAdmin = !!(user && (user.isAdmin || user.role === 'ADMIN' || user.username.toLowerCase() === 'admin'));
    const isDefaultCategory =
      existing.category === 'Cambridge Vocabulary' ||
      data.category === 'Cambridge Vocabulary' ||
      existing.category_id === 1;

    if (isDefaultCategory && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Chỉ tài khoản Admin mới có quyền chỉnh sửa kho từ vựng mặc định (Cambridge Vocabulary).' },
        { status: 403 }
      );
    }

    const success = updateWord(Number(data.id), data);
    if (!success) {
      return NextResponse.json(
        { success: false, error: `Không thể cập nhật từ vựng với id=${data.id}` },
        { status: 500 }
      );
    }

    const updated = getWordById(Number(data.id));
    return NextResponse.json({
      success: true,
      message: `Đã cập nhật thành công từ vựng id=${data.id}`,
      word: updated,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: `Database error: ${err.message || 'Unknown'}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp tham số ?id=... để xóa.' },
        { status: 400 }
      );
    }

    const id = parseInt(idParam, 10);
    const existing = getWordById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy từ vựng với id=${id}` },
        { status: 404 }
      );
    }

    // Role check: Only admin can delete default Cambridge Vocabulary
    const user = getUserFromRequest(request);
    const isAdmin = !!(user && (user.isAdmin || user.role === 'ADMIN' || user.username.toLowerCase() === 'admin'));
    if ((existing.category === 'Cambridge Vocabulary' || existing.category_id === 1) && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Chỉ tài khoản Admin mới có quyền xóa từ vựng mặc định (Cambridge Vocabulary).' },
        { status: 403 }
      );
    }

    const success = deleteWord(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: `Không thể xóa từ vựng với id=${id}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa từ vựng id=${id} khỏi cơ sở dữ liệu SQLite.`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: `Database error: ${err.message || 'Unknown'}` },
      { status: 500 }
    );
  }
}
