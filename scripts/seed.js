const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || (fs.existsSync('/data') ? '/data/vocab.db' : path.join(process.cwd(), 'vocab.db'));

const dbDir = path.dirname(DB_PATH);
if (dbDir && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`Connecting to SQLite at: ${DB_PATH}`);
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Initialize 1:N Hierarchical Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT UNIQUE NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

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
    current_category TEXT DEFAULT 'Cambridge Vocabulary',
    current_unit TEXT DEFAULT 'Unit 1: Growing Up',
    current_index INTEGER DEFAULT 0,
    quiz_stats TEXT DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
  CREATE INDEX IF NOT EXISTS idx_topics_cat ON topics(category_id, display_order);
  CREATE INDEX IF NOT EXISTS idx_words_topic ON words(topic_id, order_index);
  CREATE INDEX IF NOT EXISTS idx_words_name ON words(word);
  CREATE INDEX IF NOT EXISTS idx_user_words_user ON user_words(user_id, word_id);
`);

// 2. Ensure default Cambridge Vocabulary exists
db.prepare(`
  INSERT OR IGNORE INTO categories (id, category, display_order)
  VALUES (1, 'Cambridge Vocabulary', 1)
`).run();

// Ensure current_category column exists in progress table
const progressCols = db.prepare("PRAGMA table_info(progress)").all();
if (!progressCols.some((c) => c.name === 'current_category')) {
  db.exec("ALTER TABLE progress ADD COLUMN current_category TEXT DEFAULT 'Cambridge Vocabulary';");
  db.exec("UPDATE progress SET current_category = 'Cambridge Vocabulary' WHERE current_category IS NULL;");
}

// 3. Auto-seed words from words.sql if words table is empty
const wordCountRow = db.prepare('SELECT COUNT(*) as count FROM words').get();
const wordCount = wordCountRow ? wordCountRow.count : 0;

if (wordCount === 0) {
  const sqlPath = path.join(__dirname, 'words.sql');
  if (fs.existsSync(sqlPath)) {
    console.log(`[Seed] Populating 1:N normalized schema from: ${sqlPath}`);
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    db.exec(sqlContent);
    const newCount = db.prepare('SELECT COUNT(*) as count FROM words').get().count;
    console.log(`[Seed] Successfully seeded ${newCount} vocabulary words!`);
  } else {
    console.warn(`[Seed] words.sql not found at ${sqlPath}. Skipping seed.`);
  }
} else {
  console.log(`[Seed] Database already contains ${wordCount} words. No seed required.`);
}

db.close();
console.log('[Seed] SQLite initialization complete.');
