const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const targetDbPath = process.env.TARGET_DB || path.join(__dirname, '..', 'vocab.db');
const outputSqlPath = path.join(__dirname, 'words.sql');

console.log(`Connecting to SQLite at: ${targetDbPath}`);
const db = new Database(targetDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = OFF'); // Temporarily off for atomic table migrations

console.log('>>> 1. Migrating to 1:N Hierarchical Architecture (Option 1)...');

const migrate = db.transaction(() => {
  // 1. Ensure categories table exists
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

  // 2. Ensure users table exists with role column
  const userTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  if (userTable) {
    const userCols = db.prepare("PRAGMA table_info(users)").all();
    if (!userCols.some((c) => c.name === 'role')) {
      db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'USER';");
    }
    db.exec("UPDATE users SET role = 'ADMIN' WHERE LOWER(username) = 'admin';");
  }

  // 3. Migrate topics (add category_id)
  const topicsCols = db.prepare("PRAGMA table_info(topics)").all();
  if (!topicsCols.some((c) => c.name === 'category_id')) {
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

    db.exec(`
      DROP TABLE IF EXISTS topics;
      ALTER TABLE topics_new RENAME TO topics;
    `);
  }

  // 4. Migrate words (add topic_id and order_index)
  const wordsCols = db.prepare("PRAGMA table_info(words)").all();
  if (!wordsCols.some((c) => c.name === 'topic_id')) {
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
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      );
    `);

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

    db.exec(`
      DROP TABLE IF EXISTS words;
      ALTER TABLE words_new RENAME TO words;
    `);
  }

  // 5. Drop redundant junction tables
  db.exec(`
    DROP TABLE IF EXISTS category_topics;
    DROP TABLE IF EXISTS category_words;
    DROP TABLE IF EXISTS topic_words;
  `);

  // 6. Ensure progress and user_words exist
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
      current_category TEXT DEFAULT 'Cambridge Vocabulary',
      current_unit TEXT DEFAULT 'Unit 1: Growing Up',
      current_index INTEGER DEFAULT 0,
      quiz_stats TEXT DEFAULT '{}',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 7. Create performance indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
    CREATE INDEX IF NOT EXISTS idx_topics_cat ON topics(category_id, display_order);
    CREATE INDEX IF NOT EXISTS idx_words_topic ON words(topic_id, order_index);
    CREATE INDEX IF NOT EXISTS idx_words_name ON words(word);
    CREATE INDEX IF NOT EXISTS idx_user_words_user ON user_words(user_id, word_id);
  `);
});

migrate();
db.pragma('foreign_keys = ON');

// Checkpoint WAL
db.pragma('wal_checkpoint(TRUNCATE)');

console.log('>>> 2. Verifying migrated database:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('Active tables:', tables.map((t) => t.name));

const wordsCount = db.prepare('SELECT count(*) as count FROM words').get().count;
const topicsCount = db.prepare('SELECT count(*) as count FROM topics').get().count;
const categoriesCount = db.prepare('SELECT count(*) as count FROM categories').get().count;
console.log(`Categories: ${categoriesCount}, Topics: ${topicsCount}, Words: ${wordsCount}`);

// 8. Generate clean words.sql
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

console.log(`>>> 3. Exporting clean 1:N seed file to: ${outputSqlPath}`);
const sqlLines = [
  '-- SQLite Normalized Vocabulary Seed Data (1:N Hierarchical Architecture)',
  '-- Hierarchy: Categories (1) -> (N) Topics (1) -> (N) Words',
  'BEGIN TRANSACTION;',
  '',
  '-- 1. CATEGORIES',
];

const categoriesList = db.prepare('SELECT id, category, display_order FROM categories ORDER BY display_order ASC').all();
for (const c of categoriesList) {
  sqlLines.push(`INSERT OR IGNORE INTO categories (id, category, display_order) VALUES (${c.id}, ${escapeSql(c.category)}, ${c.display_order});`);
}

sqlLines.push('', '-- 2. TOPICS (with category_id)');
const topicsList = db.prepare('SELECT id, category_id, name, display_order FROM topics ORDER BY category_id ASC, display_order ASC').all();
for (const t of topicsList) {
  sqlLines.push(`INSERT OR IGNORE INTO topics (id, category_id, name, display_order) VALUES (${t.id}, ${t.category_id}, ${escapeSql(t.name)}, ${t.display_order});`);
}

sqlLines.push('', '-- 3. WORDS (with topic_id and order_index)');
const wordsList = db.prepare('SELECT id, topic_id, word, type, meaning, example, order_index FROM words ORDER BY id ASC').all();
for (const w of wordsList) {
  sqlLines.push(
    `INSERT OR IGNORE INTO words (id, topic_id, word, type, meaning, example, order_index) VALUES (${w.id}, ${w.topic_id}, ${escapeSql(w.word)}, ${escapeSql(w.type)}, ${escapeSql(w.meaning)}, ${escapeSql(w.example)}, ${w.order_index});`
  );
}

sqlLines.push('', 'COMMIT;');
fs.writeFileSync(outputSqlPath, sqlLines.join('\n'), 'utf-8');
console.log(`Exported ${sqlLines.length} SQL lines successfully.`);

db.close();
console.log('>>> Migration and export completed successfully!');
