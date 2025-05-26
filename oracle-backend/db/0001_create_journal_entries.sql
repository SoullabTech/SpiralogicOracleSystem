// /oracle-backend/db/migrations/0001_create_journal_entries.sql
-- SQL for Supabase
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content TEXT,
  symbols TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
