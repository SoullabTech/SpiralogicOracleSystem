-- Journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- File uploads
CREATE TABLE IF NOT EXISTS uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  summary TEXT,
  extracted_content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Voice notes
CREATE TABLE IF NOT EXISTS voice_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  transcript TEXT NOT NULL,
  audio_path TEXT,
  duration_seconds INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Generic memory index (optional, for search/debugging)
CREATE TABLE IF NOT EXISTS memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  memory_type TEXT NOT NULL, -- 'chat' | 'journal' | 'upload' | 'voice'
  reference_id INTEGER,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User trust metrics
CREATE TABLE IF NOT EXISTS user_trust_metrics (
  user_id TEXT PRIMARY KEY,
  trust_score REAL NOT NULL,
  session_count INTEGER NOT NULL,
  metrics_json TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trust evolution history
CREATE TABLE IF NOT EXISTS trust_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  trust_score REAL NOT NULL,
  stage TEXT NOT NULL,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);