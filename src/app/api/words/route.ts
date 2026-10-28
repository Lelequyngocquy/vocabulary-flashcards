import { NextResponse } from 'next/server';
import {
  getAllWords,
  getWordsByLibrary,
  getWordById,
  getAllCategories,
  getAllTopics,
  getDefaultCategory,
  getDefaultTopic,
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
          { success: false, error: `Word not found with id=${id}` },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, word });
    }

    const categories = getAllCategories();
    const defaultCat = getDefaultCategory();
    const defaultTopic = getDefaultTopic(defaultCat.id);
    const topics = getAllTopics(category || undefined);
    const words = library
      ? getWordsByLibrary(library, category || undefined)
      : getAllWords(category || undefined);

    return NextResponse.json({
      success: true,
      total: words.length,
      categories,
      defaultCategory: defaultCat.category,
      defaultUnit: defaultTopic,
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
        { success: false, error: 'Please provide word, meaning, and library.' },
        { status: 400 }
      );
    }

    const defaultCat = getDefaultCategory();
    const newWord = addWord({
      word: data.word,
      type: data.type || '',
      meaning: data.meaning,
      example: data.example || '',
      library: data.library,
      category: data.category || defaultCat.category,
    });

    return NextResponse.json({
      success: true,
      message: 'Word added to SQLite database successfully.',
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
        { success: false, error: 'Missing id of the vocabulary word to update.' },
        { status: 400 }
      );
    }

    const existing = getWordById(Number(data.id));
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Word not found with id=${data.id}` },
        { status: 404 }
      );
    }

    // Role check: Only admin can modify default category (identified by id in DB)
    const user = getUserFromRequest(request);
    const isAdmin = !!(user && (user.isAdmin || user.role === 'ADMIN' || user.username.toLowerCase() === 'admin'));
    const defaultCat = getDefaultCategory();
    const isDefaultCategory =
      existing.category_id === defaultCat.id ||
      existing.category === defaultCat.category ||
      data.category === defaultCat.category;

    if (isDefaultCategory && !isAdmin) {
      return NextResponse.json(
        { success: false, error: `Only Admin accounts can modify the default category (${defaultCat.category}).` },
        { status: 403 }
      );
    }

    const success = updateWord(Number(data.id), data);
    if (!success) {
      return NextResponse.json(
        { success: false, error: `Unable to update word with id=${data.id}` },
        { status: 500 }
      );
    }

    const updated = getWordById(Number(data.id));
    return NextResponse.json({
      success: true,
      message: `Word id=${data.id} updated successfully`,
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
        { success: false, error: 'Please provide ?id=... parameter to delete.' },
        { status: 400 }
      );
    }

    const id = parseInt(idParam, 10);
    const existing = getWordById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Word not found with id=${id}` },
        { status: 404 }
      );
    }

    // Role check: Only admin can delete default category
    const user = getUserFromRequest(request);
    const isAdmin = !!(user && (user.isAdmin || user.role === 'ADMIN' || user.username.toLowerCase() === 'admin'));
    const defaultCat = getDefaultCategory();
    if ((existing.category_id === defaultCat.id || existing.category === defaultCat.category) && !isAdmin) {
      return NextResponse.json(
        { success: false, error: `Only Admin accounts can delete from the default category (${defaultCat.category}).` },
        { status: 403 }
      );
    }

    const success = deleteWord(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: `Unable to delete word with id=${id}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Word id=${id} deleted from SQLite database.`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: `Database error: ${err.message || 'Unknown'}` },
      { status: 500 }
    );
  }
}
