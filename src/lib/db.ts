import fs from 'fs';
import path from 'path';
import { WordItem } from '@/types';

const DB_PATH = process.env.DB_PATH || (fs.existsSync('/data') ? '/data/vocab.db' : path.join(process.cwd(), 'vocab.db'));

// Ensure parent directory exists
const dbDir = path.dirname(DB_PATH);
if (dbDir && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

interface DatabaseAdapter {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...params: unknown[]): { lastInsertRowid?: number | bigint; changes?: number };
    get(...params: unknown[]): any;
    all(...params: unknown[]): any[];
  };
  transaction?<T>(fn: (...args: any[]) => T): (...args: any[]) => T;
}

let dbInstance: DatabaseAdapter | null = null;

function getDb(): DatabaseAdapter {
  if (dbInstance) return dbInstance;

  try {
    // Try better-sqlite3 first
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    dbInstance = {
      exec: (sql: string) => db.exec(sql),
      prepare: (sql: string) => {
        const stmt = db.prepare(sql);
        return {
          run: (...params: unknown[]) => stmt.run(...params),
          get: (...params: unknown[]) => stmt.get(...params),
          all: (...params: unknown[]) => stmt.all(...params),
        };
      },
      transaction: (fn) => db.transaction(fn),
    };
  } catch {
    // Fallback to node:sqlite (Node 22.5+)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(DB_PATH);
    dbInstance = {
      exec: (sql: string) => db.exec(sql),
      prepare: (sql: string) => {
        const stmt = db.prepare(sql);
        return {
          run: (...params: unknown[]) => stmt.run(...params),
          get: (...params: unknown[]) => stmt.get(...params),
          all: (...params: unknown[]) => stmt.all(...params),
        };
      },
    };
  }

  // Initialize all tables: users, progress, and words
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS progress (
      user_id INTEGER PRIMARY KEY,
      current_unit TEXT DEFAULT 'Unit 1: Growing Up',
      current_index INTEGER DEFAULT 0,
      learned_words TEXT DEFAULT '[]',
      quiz_stats TEXT DEFAULT '{}',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      type TEXT,
      meaning TEXT NOT NULL,
      example TEXT,
      library TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_words_library ON words(library);
    CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
  `);

  // Auto-seed words from database.json if words table is empty
  seedWordsIfEmpty(dbInstance);

  return dbInstance;
}

function seedWordsIfEmpty(db: DatabaseAdapter) {
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM words').get() as { count: number } | undefined;
    const count = row?.count ?? 0;

    if (count === 0) {
      // Find JSON file to seed from
      const possiblePaths = [
        path.join(process.cwd(), 'database.json'),
        path.join(process.cwd(), 'src', 'data', 'words.json'),
      ];

      let seedData: WordItem[] | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf-8');
          seedData = JSON.parse(raw);
          break;
        }
      }

      if (seedData && Array.isArray(seedData) && seedData.length > 0) {
        db.exec('BEGIN TRANSACTION;');
        const insertStmt = db.prepare(`
          INSERT OR IGNORE INTO words (word, type, meaning, example, library)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const item of seedData) {
          insertStmt.run(
            item.word || '',
            item.type || '',
            item.meaning || '',
            item.example || '',
            item.library || 'General'
          );
        }
        db.exec('COMMIT;');
      }
    }
  } catch (err) {
    console.error('Failed to seed words into SQLite:', err);
  }
}

/* ==================== VOCABULARY WORDS QUERIES ==================== */

export function getAllWords(): WordItem[] {
  const db = getDb();
  const rows = db.prepare('SELECT word, type, meaning, example, library FROM words ORDER BY id ASC').all();
  return (rows as WordItem[]) || [];
}

export function getWordsByLibrary(library: string): WordItem[] {
  const db = getDb();
  const rows = db.prepare('SELECT word, type, meaning, example, library FROM words WHERE library = ? ORDER BY id ASC').all(library);
  return (rows as WordItem[]) || [];
}

export function getUnitsBreakdown(): { name: string; count: number }[] {
  const db = getDb();
  const rows = db.prepare('SELECT library as name, COUNT(*) as count FROM words GROUP BY library').all();
  return (rows as { name: string; count: number }[]) || [];
}

export function addWord(word: WordItem): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO words (word, type, meaning, example, library)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(word.word, word.type, word.meaning, word.example, word.library);
}

/* ==================== USER AUTH QUERIES ==================== */

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  created_at?: string;
}

export interface ProgressRow {
  user_id: number;
  current_unit: string;
  current_index: number;
  learned_words: string;
  quiz_stats: string;
  updated_at?: string | null;
}

export function findUserByUsername(username: string): UserRow | null {
  const db = getDb();
  const row = db.prepare('SELECT id, username, password_hash, created_at FROM users WHERE username = ?').get(username);
  return row || null;
}

export function findUserById(userId: number): UserRow | null {
  const db = getDb();
  const row = db.prepare('SELECT id, username, password_hash, created_at FROM users WHERE id = ?').get(userId);
  return row || null;
}

export function createUser(username: string, passwordHash: string): { id: number; username: string } {
  const db = getDb();
  const insertUser = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
  const info = insertUser.run(username, passwordHash);
  const userId = Number(info.lastInsertRowid);

  // Init progress
  const insertProg = db.prepare('INSERT INTO progress (user_id, current_unit, current_index, learned_words) VALUES (?, ?, ?, ?)');
  insertProg.run(userId, 'Unit 1: Growing Up', 0, '[]');

  return { id: userId, username };
}

/* ==================== PROGRESS QUERIES ==================== */

export function getProgress(userId: number): ProgressRow | null {
  const db = getDb();
  const row = db.prepare('SELECT user_id, current_unit, current_index, learned_words, quiz_stats, updated_at FROM progress WHERE user_id = ?').get(userId);
  return row || null;
}

export function upsertProgress(
  userId: number,
  currentUnit: string,
  currentIndex: number,
  learnedWordsJson: string,
  quizStatsJson: string
): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO progress (user_id, current_unit, current_index, learned_words, quiz_stats, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      current_unit = excluded.current_unit,
      current_index = excluded.current_index,
      learned_words = excluded.learned_words,
      quiz_stats = excluded.quiz_stats,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(userId, currentUnit, currentIndex, learnedWordsJson, quizStatsJson);
}
