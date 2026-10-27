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

db.exec(`
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

const countRow = db.prepare('SELECT COUNT(*) as count FROM words').get();
console.log(`Current words count in DB: ${countRow.count}`);

if (countRow.count === 0) {
  const sqlPath = path.join(__dirname, 'words.sql');
  if (fs.existsSync(sqlPath)) {
    console.log(`Seeding words from pure SQL (${sqlPath})...`);
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    db.exec(sql);

    const finalCount = db.prepare('SELECT COUNT(*) as count FROM words').get();
    console.log(`Seeding complete! Total words in SQLite: ${finalCount.count}`);
  } else {
    console.warn(`words.sql not found at ${sqlPath}`);
  }
} else {
  console.log('Database already contains words. Skipping seed.');
}
