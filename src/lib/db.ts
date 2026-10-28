import fs from 'fs';
import path from 'path';
import { WordItem, CategoryItem, UserItem } from '@/types';

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
    db.pragma('foreign_keys = ON');
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
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
    dbInstance = {
      exec: (sql: string) => db.exec(sql),
      prepare: (sql: string) => {
        const stmt = db.prepare(sql);
        return {
          run: (...params: unknown[]) => {
            const res = stmt.run(...params);
            return {
              lastInsertRowid: res.lastInsertRowid ? Number(res.lastInsertRowid) : undefined,
              changes: res.changes,
            };
          },
          get: (...params: unknown[]) => stmt.get(...params),
          all: (...params: unknown[]) => stmt.all(...params),
        };
      },
    };
  }

  // Auto-migrate to 1:N Hierarchical Architecture (Option 1)
  ensureOptimalSchema(dbInstance);

  return dbInstance;
}

/**
 * Ensures normalized 1:N schema:
 * Categories (1) -> (N) Topics (1) -> (N) Words
 * Eliminates redundant junction tables (category_topics, category_words, topic_words).
 */
function ensureOptimalSchema(db: DatabaseAdapter) {
  // Check if users table exists and has role
  try {
    const userTableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    if (userTableCheck) {
      const userCols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
      if (!userCols.some((c) => c.name === 'role')) {
        db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'USER';");
        db.exec("UPDATE users SET role = 'ADMIN' WHERE LOWER(username) = 'admin';");
      }
    } else {
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL COLLATE NOCASE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'USER',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    // Ensure progress table has current_category column
    const progressTableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='progress'").get();
    if (progressTableCheck) {
      const progressCols = db.prepare("PRAGMA table_info(progress)").all() as { name: string }[];
      if (!progressCols.some((c) => c.name === 'current_category')) {
        db.exec("ALTER TABLE progress ADD COLUMN current_category TEXT;");
      }
    }
  } catch (err) {
    console.error('Error checking users/progress schema:', err);
  }

  // Ensure categories table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT UNIQUE NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    INSERT OR IGNORE INTO categories (id, category, display_order)
    VALUES (1, 'Cambridge Vocabulary', 1);
  `);

  // Check if topics has category_id column
  let needsTopicsMigration = false;
  try {
    const topicsCols = db.prepare("PRAGMA table_info(topics)").all() as { name: string }[];
    if (topicsCols.length > 0 && !topicsCols.some((c) => c.name === 'category_id')) {
      needsTopicsMigration = true;
    }
  } catch {}

  // Check if words has topic_id column
  let needsWordsMigration = false;
  try {
    const wordsCols = db.prepare("PRAGMA table_info(words)").all() as { name: string }[];
    if (wordsCols.length > 0 && !wordsCols.some((c) => c.name === 'topic_id')) {
      needsWordsMigration = true;
    }
  } catch {}

  if (needsTopicsMigration || needsWordsMigration) {
    console.log('[SQLite] Migrating database to 1:N architecture (Option 1)...');
    const doMigration = () => {
      // 1. Create topics_new
      db.exec(`
        CREATE TABLE IF NOT EXISTS topics_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER NOT NULL DEFAULT 1,
          name TEXT NOT NULL,
          display_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
          UNIQUE(category_id, name)
        );
      `);

      // Check if category_topics exists
      const hasCatTopics = !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='category_topics'").get();
      if (hasCatTopics) {
        db.exec(`
          INSERT INTO topics_new (id, category_id, name, display_order, created_at)
          SELECT 
            t.id, 
            COALESCE(ct.category_id, 1) as category_id,
            t.name, 
            t.display_order,
            t.created_at
          FROM topics t
          LEFT JOIN category_topics ct ON t.id = ct.topic_id;
        `);
      } else {
        db.exec(`
          INSERT INTO topics_new (id, category_id, name, display_order, created_at)
          SELECT id, 1 as category_id, name, display_order, created_at FROM topics;
        `);
      }

      // 2. Create words_new
      db.exec(`
        CREATE TABLE IF NOT EXISTS words_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          topic_id INTEGER NOT NULL,
          word TEXT NOT NULL,
          type TEXT,
          meaning TEXT NOT NULL,
          example TEXT,
          order_index INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (topic_id) REFERENCES topics_new(id) ON DELETE CASCADE
        );
      `);

      // Check if topic_words exists
      const hasTopicWords = !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='topic_words'").get();
      if (hasTopicWords) {
        db.exec(`
          INSERT INTO words_new (id, topic_id, word, type, meaning, example, order_index, created_at)
          SELECT 
            w.id,
            COALESCE(tw.topic_id, 1) as topic_id,
            w.word,
            w.type,
            w.meaning,
            w.example,
            COALESCE(tw.order_index, 0) as order_index,
            w.created_at
          FROM words w
          LEFT JOIN topic_words tw ON w.id = tw.word_id;
        `);
      } else {
        db.exec(`
          INSERT INTO words_new (id, topic_id, word, type, meaning, example, order_index, created_at)
          SELECT id, 1 as topic_id, word, type, meaning, example, id as order_index, created_at FROM words;
        `);
      }

      // 3. Swap tables and drop redundant tables
      db.exec(`
        DROP TABLE IF EXISTS topics;
        ALTER TABLE topics_new RENAME TO topics;

        DROP TABLE IF EXISTS words;
        ALTER TABLE words_new RENAME TO words;

        DROP TABLE IF EXISTS category_topics;
        DROP TABLE IF EXISTS category_words;
        DROP TABLE IF EXISTS topic_words;
      `);
    };

    if (db.transaction) {
      db.transaction(doMigration)();
    } else {
      doMigration();
    }
    console.log('[SQLite] 1:N Architecture migration completed successfully.');
  } else {
    // Basic table creation if database is completely new
    db.exec(`
      CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL DEFAULT 1,
        name TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE(category_id, name)
      );

      CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_id INTEGER NOT NULL,
        word TEXT NOT NULL,
        type TEXT,
        meaning TEXT NOT NULL,
        example TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      );
    `);
  }

  // Ensure user_words and progress tables exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_words (
      user_id INTEGER NOT NULL,
      word_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'MASTERED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, word_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS progress (
      user_id INTEGER PRIMARY KEY,
      current_category TEXT,
      current_unit TEXT,
      current_index INTEGER DEFAULT 0,
      quiz_stats TEXT DEFAULT '{}',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Optimized performance indexes
    CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
    CREATE INDEX IF NOT EXISTS idx_topics_cat ON topics(category_id, display_order);
    CREATE INDEX IF NOT EXISTS idx_words_topic ON words(topic_id, order_index);
    CREATE INDEX IF NOT EXISTS idx_words_name ON words(word);
    CREATE INDEX IF NOT EXISTS idx_user_words_user ON user_words(user_id, word_id);
  `);

  // Auto-seed topics and words from scripts/words.sql if empty
  seedWordsIfEmpty(db);
}

function seedWordsIfEmpty(db: DatabaseAdapter) {
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM words').get() as { count: number } | undefined;
    const count = row?.count ?? 0;

    if (count === 0) {
      const sqlPaths = [
        path.join(process.cwd(), 'scripts', 'words.sql'),
        path.join(__dirname, '..', '..', 'scripts', 'words.sql'),
        '/app/scripts/words.sql',
      ];

      for (const p of sqlPaths) {
        if (fs.existsSync(p)) {
          console.log(`[SQLite] Seeding 1:N schema from pure SQL: ${p}`);
          const sql = fs.readFileSync(p, 'utf-8');
          db.exec(sql);
          break;
        }
      }
    }
  } catch (err) {
    console.error('Failed to seed words into SQLite:', err);
  }
}

/* ==================== CATEGORIES & WORDS QUERIES (OPTIMIZED 1:N) ==================== */

export function getAllCategories(): CategoryItem[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT 
      c.id,
      c.category,
      c.display_order,
      COUNT(w.id) as count
    FROM categories c
    LEFT JOIN topics t ON c.id = t.category_id
    LEFT JOIN words w ON t.id = w.topic_id
    GROUP BY c.id, c.category, c.display_order
    ORDER BY c.display_order ASC
  `).all();
  return (rows as CategoryItem[]) || [];
}

export function getDefaultCategory(): CategoryItem {
  const db = getDb();
  let row = db.prepare('SELECT id, category, display_order FROM categories WHERE id = 1').get() as CategoryItem | undefined;
  if (!row) {
    row = db.prepare('SELECT id, category, display_order FROM categories ORDER BY display_order ASC, id ASC LIMIT 1').get() as CategoryItem | undefined;
  }
  if (!row) {
    const firstWord = db.prepare('SELECT category FROM words WHERE category IS NOT NULL LIMIT 1').get() as { category: string } | undefined;
    return {
      id: 1,
      category: firstWord?.category || 'General Vocabulary',
      display_order: 1,
    };
  }
  return row;
}

export function getDefaultTopic(categoryId?: number): string {
  const db = getDb();
  const catId = categoryId ?? getDefaultCategory().id;
  const row = db.prepare('SELECT name FROM topics WHERE category_id = ? ORDER BY display_order ASC, id ASC LIMIT 1').get(catId) as { name: string } | undefined;
  if (row?.name) return row.name;

  const wordRow = db.prepare(`
    SELECT t.name 
    FROM words w 
    JOIN topics t ON w.topic_id = t.id 
    WHERE t.category_id = ? 
    LIMIT 1
  `).get(catId) as { name: string } | undefined;

  return wordRow?.name || 'Unit 1';
}

export function getAllWords(categoryParam?: string): WordItem[] {
  const db = getDb();
  if (categoryParam) {
    const rows = db.prepare(`
      SELECT 
        w.id,
        w.word,
        w.type,
        w.meaning,
        w.example,
        w.order_index,
        w.topic_id,
        t.name AS library,
        c.id AS category_id,
        c.category AS category,
        w.created_at
      FROM words w
      JOIN topics t ON w.topic_id = t.id
      JOIN categories c ON t.category_id = c.id
      WHERE c.category = ? OR c.id = ?
      ORDER BY c.display_order ASC, t.display_order ASC, w.order_index ASC, w.id ASC
    `).all(categoryParam, Number(categoryParam) || 0);
    return (rows as WordItem[]) || [];
  }

  const rows = db.prepare(`
    SELECT 
      w.id,
      w.word,
      w.type,
      w.meaning,
      w.example,
      w.order_index,
      w.topic_id,
      t.name AS library,
      c.id AS category_id,
      c.category AS category,
      w.created_at
    FROM words w
    JOIN topics t ON w.topic_id = t.id
    JOIN categories c ON t.category_id = c.id
    ORDER BY c.display_order ASC, t.display_order ASC, w.order_index ASC, w.id ASC
  `).all();
  return (rows as WordItem[]) || [];
}

export function getWordsByLibrary(library: string, categoryParam?: string): WordItem[] {
  const db = getDb();
  if (categoryParam) {
    const rows = db.prepare(`
      SELECT 
        w.id,
        w.word,
        w.type,
        w.meaning,
        w.example,
        w.order_index,
        w.topic_id,
        t.name AS library,
        c.id AS category_id,
        c.category AS category,
        w.created_at
      FROM words w
      JOIN topics t ON w.topic_id = t.id
      JOIN categories c ON t.category_id = c.id
      WHERE t.name = ? AND (c.category = ? OR c.id = ?)
      ORDER BY w.order_index ASC, w.id ASC
    `).all(library, categoryParam, Number(categoryParam) || 0);
    return (rows as WordItem[]) || [];
  }

  const rows = db.prepare(`
    SELECT 
      w.id,
      w.word,
      w.type,
      w.meaning,
      w.example,
      w.order_index,
      w.topic_id,
      t.name AS library,
      c.id AS category_id,
      c.category AS category,
      w.created_at
    FROM words w
    JOIN topics t ON w.topic_id = t.id
    JOIN categories c ON t.category_id = c.id
    WHERE t.name = ?
    ORDER BY w.order_index ASC, w.id ASC
  `).all(library);
  return (rows as WordItem[]) || [];
}

export function getWordById(id: number): WordItem | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT 
      w.id,
      w.word,
      w.type,
      w.meaning,
      w.example,
      w.order_index,
      w.topic_id,
      t.name AS library,
      c.id AS category_id,
      c.category AS category,
      w.created_at
    FROM words w
    JOIN topics t ON w.topic_id = t.id
    JOIN categories c ON t.category_id = c.id
    WHERE w.id = ?
    LIMIT 1
  `).get(id);
  return (row as WordItem) || null;
}

export function getUnitsBreakdown(categoryParam?: string): { name: string; count: number }[] {
  const db = getDb();
  if (categoryParam) {
    const rows = db.prepare(`
      SELECT 
        t.name,
        COUNT(w.id) as count
      FROM topics t
      JOIN categories c ON t.category_id = c.id
      LEFT JOIN words w ON t.id = w.topic_id
      WHERE c.category = ? OR c.id = ?
      GROUP BY t.id, t.name, t.display_order
      ORDER BY t.display_order ASC
    `).all(categoryParam, Number(categoryParam) || 0);
    return (rows as { name: string; count: number }[]) || [];
  }

  const rows = db.prepare(`
    SELECT 
      t.name,
      COUNT(w.id) as count
    FROM topics t
    LEFT JOIN words w ON t.id = w.topic_id
    GROUP BY t.id, t.name, t.display_order
    ORDER BY t.display_order ASC
  `).all();
  return (rows as { name: string; count: number }[]) || [];
}

export function getAllTopics(categoryParam?: string): { id: number; name: string; display_order: number; category_id?: number }[] {
  const db = getDb();
  if (categoryParam) {
    const rows = db.prepare(`
      SELECT t.id, t.name, t.display_order, t.category_id
      FROM topics t
      JOIN categories c ON t.category_id = c.id
      WHERE c.category = ? OR c.id = ?
      ORDER BY t.display_order ASC
    `).all(categoryParam, Number(categoryParam) || 0);
    return (rows as { id: number; name: string; display_order: number; category_id?: number }[]) || [];
  }
  const rows = db.prepare('SELECT id, name, display_order, category_id FROM topics ORDER BY display_order ASC').all();
  return (rows as { id: number; name: string; display_order: number; category_id?: number }[]) || [];
}

export function addWord(word: Omit<WordItem, 'id' | 'created_at'> & { category?: string }): WordItem {
  const db = getDb();

  // 1. Ensure category exists
  const defaultCat = getDefaultCategory();
  const categoryName = word.category || defaultCat.category;
  let cat = db.prepare('SELECT id FROM categories WHERE category = ?').get(categoryName) as { id: number } | undefined;
  if (!cat) {
    const maxOrderRow = db.prepare('SELECT MAX(display_order) as maxOrder FROM categories').get() as { maxOrder: number | null };
    const nextOrder = (maxOrderRow?.maxOrder ?? 0) + 1;
    const res = db.prepare('INSERT INTO categories (category, display_order) VALUES (?, ?)').run(categoryName, nextOrder);
    cat = { id: Number(res.lastInsertRowid) };
  }

  // 2. Ensure topic exists within this category
  const defaultTopic = getDefaultTopic(cat.id);
  const topicName = word.library || defaultTopic;
  let topic = db.prepare('SELECT id FROM topics WHERE category_id = ? AND name = ?').get(cat.id, topicName) as { id: number } | undefined;
  if (!topic) {
    const maxOrderRow = db.prepare('SELECT MAX(display_order) as maxOrder FROM topics WHERE category_id = ?').get(cat.id) as { maxOrder: number | null };
    const nextOrder = (maxOrderRow?.maxOrder ?? 0) + 1;
    const res = db.prepare('INSERT INTO topics (category_id, name, display_order) VALUES (?, ?, ?)').run(cat.id, topicName, nextOrder);
    topic = { id: Number(res.lastInsertRowid) };
  }

  // 3. Compute next order_index
  const maxIdxRow = db.prepare('SELECT MAX(order_index) as maxIdx FROM words WHERE topic_id = ?').get(topic.id) as { maxIdx: number | null };
  const nextOrderIndex = (maxIdxRow?.maxIdx ?? 0) + 1;

  // 4. Insert directly into words table
  const insertWord = db.prepare(`
    INSERT INTO words (topic_id, word, type, meaning, example, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const wordRes = insertWord.run(
    topic.id,
    word.word,
    word.type || '',
    word.meaning,
    word.example || '',
    nextOrderIndex
  );
  const wordId = Number(wordRes.lastInsertRowid);

  return getWordById(wordId)!;
}

export function updateWord(id: number, data: Partial<Omit<WordItem, 'id' | 'created_at'>> & { category?: string }): boolean {
  const db = getDb();
  const existing = getWordById(id);
  if (!existing) return false;

  const word = data.word ?? existing.word;
  const type = data.type ?? existing.type;
  const meaning = data.meaning ?? existing.meaning;
  const example = data.example ?? existing.example;

  const defaultCat = getDefaultCategory();
  const defaultTopic = getDefaultTopic(defaultCat.id);
  const targetCategoryName = data.category ?? existing.category ?? defaultCat.category;
  const targetLibraryName = data.library ?? existing.library ?? defaultTopic;

  // 1. Ensure target category exists
  let cat = db.prepare('SELECT id FROM categories WHERE category = ?').get(targetCategoryName) as { id: number } | undefined;
  if (!cat) {
    const maxOrderRow = db.prepare('SELECT MAX(display_order) as maxOrder FROM categories').get() as { maxOrder: number | null };
    const nextOrder = (maxOrderRow?.maxOrder ?? 0) + 1;
    const res = db.prepare('INSERT INTO categories (category, display_order) VALUES (?, ?)').run(targetCategoryName, nextOrder);
    cat = { id: Number(res.lastInsertRowid) };
  }

  // 2. Ensure target topic exists in target category
  let topic = db.prepare('SELECT id FROM topics WHERE category_id = ? AND name = ?').get(cat.id, targetLibraryName) as { id: number } | undefined;
  if (!topic) {
    const maxOrderRow = db.prepare('SELECT MAX(display_order) as maxOrder FROM topics WHERE category_id = ?').get(cat.id) as { maxOrder: number | null };
    const nextOrder = (maxOrderRow?.maxOrder ?? 0) + 1;
    const res = db.prepare('INSERT INTO topics (category_id, name, display_order) VALUES (?, ?, ?)').run(cat.id, targetLibraryName, nextOrder);
    topic = { id: Number(res.lastInsertRowid) };
  }

  // 3. Update word row (Single atomic update!)
  db.prepare(`
    UPDATE words
    SET word = ?, type = ?, meaning = ?, example = ?, topic_id = ?
    WHERE id = ?
  `).run(word, type, meaning, example, topic.id, id);

  return true;
}

export function deleteWord(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM words WHERE id = ?');
  const result = stmt.run(id);
  return (result.changes ?? 0) > 0;
}

/* ==================== USER AUTH QUERIES ==================== */

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  role: string;
  created_at?: string;
}

export interface ProgressRow {
  user_id: number;
  current_category?: string;
  current_unit: string;
  current_index: number;
  learned_words: string;
  quiz_stats: string;
  updated_at?: string | null;
}

export function findUserByUsername(username: string): UserRow | null {
  const db = getDb();
  const row = db.prepare('SELECT id, username, password_hash, role, created_at FROM users WHERE username = ? COLLATE NOCASE').get(username);
  return (row as UserRow) || null;
}

export function findUserById(userId: number): UserRow | null {
  const db = getDb();
  const row = db.prepare('SELECT id, username, password_hash, role, created_at FROM users WHERE id = ?').get(userId);
  return (row as UserRow) || null;
}

export function createUser(username: string, passwordHash: string, role = 'USER'): { id: number; username: string; role: string } {
  const db = getDb();
  const assignedRole = username.toLowerCase() === 'admin' ? 'ADMIN' : role;
  const insertUser = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
  const info = insertUser.run(username, passwordHash, assignedRole);
  const userId = Number(info.lastInsertRowid);

  // Init progress with dynamic defaults from database
  const defaultCat = getDefaultCategory();
  const defaultTopic = getDefaultTopic(defaultCat.id);
  const insertProg = db.prepare('INSERT INTO progress (user_id, current_category, current_unit, current_index, quiz_stats) VALUES (?, ?, ?, ?, ?)');
  insertProg.run(userId, defaultCat.category, defaultTopic, 0, '{}');

  return { id: userId, username, role: assignedRole };
}

export function updateUserPassword(userId: number, newPasswordHash: string): boolean {
  const db = getDb();
  const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
  const result = stmt.run(newPasswordHash, userId);
  return (result.changes ?? 0) > 0;
}

/* ==================== USER WORDS & PROGRESS (NORMALIZED) ==================== */

export function getUserLearnedWords(userId: number): string[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT DISTINCT w.word
    FROM user_words uw
    JOIN words w ON uw.word_id = w.id
    WHERE uw.user_id = ?
    ORDER BY uw.created_at ASC
  `).all(userId);
  return (rows as { word: string }[]).map((r) => r.word);
}

export function getUserLearnedWordIds(userId: number): number[] {
  const db = getDb();
  const rows = db.prepare('SELECT word_id FROM user_words WHERE user_id = ?').all(userId);
  return (rows as { word_id: number }[]).map((r) => r.word_id);
}

export function syncUserLearnedWords(userId: number, wordsList: (string | number)[]): void {
  const db = getDb();

  const targetWordIds = new Set<number>();
  for (const item of wordsList) {
    if (typeof item === 'number') {
      targetWordIds.add(item);
    } else if (typeof item === 'string' && item.trim()) {
      const matches = db.prepare('SELECT id FROM words WHERE word = ?').all(item.trim()) as { id: number }[];
      for (const m of matches) {
        targetWordIds.add(m.id);
      }
    }
  }

  const sync = () => {
    db.prepare('DELETE FROM user_words WHERE user_id = ?').run(userId);
    const insertStmt = db.prepare('INSERT OR IGNORE INTO user_words (user_id, word_id, status) VALUES (?, ?, ?)');
    for (const wId of targetWordIds) {
      insertStmt.run(userId, wId, 'MASTERED');
    }
  };

  if (db.transaction) {
    db.transaction(sync)();
  } else {
    db.exec('BEGIN TRANSACTION;');
    try {
      sync();
      db.exec('COMMIT;');
    } catch (e) {
      db.exec('ROLLBACK;');
      throw e;
    }
  }
}

export function toggleUserWord(userId: number, wordId: number): boolean {
  const db = getDb();
  const existing = db.prepare('SELECT 1 FROM user_words WHERE user_id = ? AND word_id = ?').get(userId, wordId);

  if (existing) {
    db.prepare('DELETE FROM user_words WHERE user_id = ? AND word_id = ?').run(userId, wordId);
    return false;
  } else {
    db.prepare('INSERT INTO user_words (user_id, word_id, status) VALUES (?, ?, ?)').run(userId, wordId, 'MASTERED');
    return true;
  }
}

export function getProgress(userId: number): ProgressRow | null {
  const db = getDb();
  const row = db.prepare('SELECT user_id, current_category, current_unit, current_index, quiz_stats, updated_at FROM progress WHERE user_id = ?').get(userId) as
    | { user_id: number; current_category?: string; current_unit: string; current_index: number; quiz_stats: string; updated_at?: string }
    | undefined;

  if (!row) return null;

  const learnedWords = getUserLearnedWords(userId);
  const defaultCat = getDefaultCategory();
  const defaultTopic = getDefaultTopic(defaultCat.id);

  return {
    user_id: row.user_id,
    current_category: row.current_category || defaultCat.category,
    current_unit: row.current_unit || defaultTopic,
    current_index: row.current_index,
    learned_words: JSON.stringify(learnedWords),
    quiz_stats: row.quiz_stats,
    updated_at: row.updated_at,
  };
}

export function upsertProgress(
  userId: number,
  currentCategoryOrUnit: string,
  currentUnitOrIndex: string | number,
  currentIndexOrLearned: number | string | string[],
  learnedWordsOrQuizStats: string | string[],
  quizStatsJson?: string
): void {
  const db = getDb();

  const defaultCat = getDefaultCategory();
  const defaultTopic = getDefaultTopic(defaultCat.id);

  let currentCategory = defaultCat.category;
  let currentUnit = defaultTopic;
  let currentIndex = 0;
  let learnedWordsParam: string | string[] = [];
  let quizStats = '{}';

  if (typeof currentUnitOrIndex === 'string') {
    currentCategory = currentCategoryOrUnit || defaultCat.category;
    currentUnit = currentUnitOrIndex;
    currentIndex = typeof currentIndexOrLearned === 'number' ? currentIndexOrLearned : 0;
    learnedWordsParam = learnedWordsOrQuizStats;
    quizStats = quizStatsJson || '{}';
  } else {
    currentUnit = currentCategoryOrUnit || defaultTopic;
    currentIndex = currentUnitOrIndex;
    learnedWordsParam = currentIndexOrLearned as string | string[];
    quizStats = (learnedWordsOrQuizStats as string) || '{}';
  }

  const stmt = db.prepare(`
    INSERT INTO progress (user_id, current_category, current_unit, current_index, quiz_stats, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      current_category = excluded.current_category,
      current_unit = excluded.current_unit,
      current_index = excluded.current_index,
      quiz_stats = excluded.quiz_stats,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(userId, currentCategory, currentUnit, currentIndex, quizStats);

  let wordsList: (string | number)[] = [];
  if (Array.isArray(learnedWordsParam)) {
    wordsList = learnedWordsParam;
  } else if (typeof learnedWordsParam === 'string') {
    try {
      wordsList = JSON.parse(learnedWordsParam);
    } catch {
      wordsList = [];
    }
  }

  syncUserLearnedWords(userId, wordsList);
}
