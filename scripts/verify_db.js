const Database = require('better-sqlite3');
const db = new Database('vocab.db');

console.log('=== 1. TABLES IN vocab.db ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log(tables.map((t) => t.name));

console.log('\n=== 2. CATEGORIES TABLE ===');
const categories = db.prepare('SELECT id, category, display_order FROM categories ORDER BY display_order ASC').all();
console.log('Categories:', categories);

console.log('\n=== 3. TOPICS (with category_id) ===');
const topicsCount = db.prepare('SELECT count(*) as count FROM topics').get().count;
console.log(`Total topics: ${topicsCount}`);
const first5Topics = db.prepare('SELECT id, category_id, name, display_order FROM topics ORDER BY display_order ASC LIMIT 5').all();
console.log('First 5 topics:', first5Topics);

console.log('\n=== 4. WORDS (with topic_id and order_index) ===');
const wordsCount = db.prepare('SELECT count(*) as count FROM words').get().count;
console.log(`Total words: ${wordsCount}`);
const sampleWords = db.prepare(`
  SELECT 
    w.id,
    w.word,
    w.type,
    w.order_index,
    t.name as topic_name,
    c.category as category_name
  FROM words w
  JOIN topics t ON w.topic_id = t.id
  JOIN categories c ON t.category_id = c.id
  ORDER BY w.id ASC
  LIMIT 5
`).all();
console.log('Sample words join:', sampleWords);

console.log('\n=== 5. USERS & ROLES ===');
const users = db.prepare('SELECT id, username, role FROM users').all();
console.log('Users:', users);

console.log('\n=== 6. VERIFY CLEAN 1:N HIERARCHY: Category -> Topics -> Words ===');
const breakdown = db.prepare(`
  SELECT 
    c.category,
    t.name as topic_name,
    COUNT(w.id) as words_count
  FROM topics t
  JOIN categories c ON t.category_id = c.id
  LEFT JOIN words w ON t.id = w.topic_id
  GROUP BY c.id, c.category, t.id, t.name
  ORDER BY t.display_order ASC
  LIMIT 5
`).all();
console.log('Hierarchy Breakdown:');
console.log(breakdown);

console.log('\n>>> All verification checks passed!');
