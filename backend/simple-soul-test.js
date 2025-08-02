// Simple Soul Memory System Test
const Database = require('better-sqlite3');
const path = require('path');

console.log('🌀 Soul Memory System Verification');
console.log('==================================\n');

// Test 1: Database Connection
console.log('1️⃣ Testing database connection...');
try {
  const db = new Database('./soul_memory.db');
  console.log('✅ Database connected successfully\n');

  // Test 2: Schema Check
  console.log('2️⃣ Checking database schema...');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('📋 Available tables:', tables.map(t => t.name).join(', '));

  if (tables.length === 0) {
    console.log('📝 Creating soul_memory table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS soul_memory (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        content TEXT NOT NULL,
        element VARCHAR,
        archetype VARCHAR,
        emotional_tone VARCHAR,
        shadow_content BOOLEAN DEFAULT FALSE,
        transformation_marker BOOLEAN DEFAULT FALSE,
        sacred_moment BOOLEAN DEFAULT FALSE,
        oracle_response TEXT,
        ritual_context VARCHAR,
        metadata TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table created successfully\n');
  } else {
    console.log('✅ Schema exists\n');
  }

  // Test 3: Insert Test Memory
  console.log('3️⃣ Testing memory storage...');
  const testMemory = {
    id: 'test_' + Date.now(),
    user_id: 'test_user_123',
    type: 'oracle_exchange',
    content: 'I am feeling overwhelmed by all these changes in my life',
    element: 'water',
    emotional_tone: 'overwhelmed',
    sacred_moment: true
  };

  const insertStmt = db.prepare(`
    INSERT INTO soul_memory (id, user_id, type, content, element, emotional_tone, sacred_moment)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertStmt.run(
    testMemory.id,
    testMemory.user_id,
    testMemory.type,
    testMemory.content,
    testMemory.element,
    testMemory.emotional_tone,
    testMemory.sacred_moment
  );

  console.log('✅ Test memory stored successfully\n');

  // Test 4: Retrieve Memories
  console.log('4️⃣ Testing memory retrieval...');
  const memories = db.prepare('SELECT * FROM soul_memory WHERE user_id = ?').all('test_user_123');
  console.log(`📊 Found ${memories.length} memories for test user`);

  if (memories.length > 0) {
    const latest = memories[memories.length - 1];
    console.log('🔍 Latest memory:');
    console.log(`   Type: ${latest.type}`);
    console.log(`   Content: ${latest.content.substring(0, 50)}...`);
    console.log(`   Element: ${latest.element}`);
    console.log(`   Sacred: ${latest.sacred_moment}`);
    console.log(`   Timestamp: ${latest.timestamp}\n`);
  }

  // Test 5: Stats
  console.log('5️⃣ Database statistics...');
  const totalCount = db.prepare('SELECT COUNT(*) as count FROM soul_memory').get();
  const typeStats = db.prepare('SELECT type, COUNT(*) as count FROM soul_memory GROUP BY type').all();

  console.log(`📈 Total memories: ${totalCount.count}`);
  console.log('📊 Memory types:');
  typeStats.forEach(stat => {
    console.log(`   - ${stat.type}: ${stat.count}`);
  });

  db.close();
  console.log('\n✅ Soul Memory System verification complete!');
  console.log('\n🔗 Available API endpoints:');
  console.log('   - GET  /api/soul-memory/health');
  console.log('   - GET  /api/soul-memory/memories');
  console.log('   - POST /api/soul-memory/oracle/message');
  console.log('   - GET  /api/soul-memory/transformation-journey');
  console.log('   - GET  /api/soul-memory/archetypal-patterns');

} catch (error) {
  console.error('❌ Error:', error.message);
}