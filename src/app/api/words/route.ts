import { NextResponse } from 'next/server';
import { getAllWords, getWordsByLibrary, addWord } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const library = searchParams.get('library');

    const words = library ? getWordsByLibrary(library) : getAllWords();

    return NextResponse.json({
      success: true,
      total: words.length,
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

    addWord({
      word: data.word,
      type: data.type || '',
      meaning: data.meaning,
      example: data.example || '',
      library: data.library,
    });

    return NextResponse.json({
      success: true,
      message: 'Từ vựng đã được thêm vào cơ sở dữ liệu SQLite.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: `Database error: ${err.message || 'Unknown'}` },
      { status: 500 }
    );
  }
}
