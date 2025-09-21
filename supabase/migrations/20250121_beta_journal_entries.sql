-- Beta Journal Entries Table
-- Stores journal reflections from beta explorers

CREATE TABLE IF NOT EXISTS beta_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explorer_id TEXT NOT NULL, -- betaUserId from session
  explorer_name TEXT NOT NULL, -- MAIA-NAME format

  -- Journal content
  content TEXT NOT NULL,
  prompt TEXT, -- Optional reflection prompt that was shown

  -- Metadata
  word_count INT GENERATED ALWAYS AS (array_length(string_to_array(trim(content), ' '), 1)) STORED,
  session_id TEXT, -- Track which conversation session this relates to
  message_count INT, -- How many messages were in conversation when journaling

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_beta_journal_explorer ON beta_journal_entries(explorer_id, created_at DESC);
CREATE INDEX idx_beta_journal_session ON beta_journal_entries(session_id);
CREATE INDEX idx_beta_journal_created ON beta_journal_entries(created_at DESC);

-- Grant permissions
GRANT ALL ON beta_journal_entries TO authenticated;
GRANT ALL ON beta_journal_entries TO anon; -- For beta testing without auth

-- View for explorer journal insights
CREATE OR REPLACE VIEW explorer_journal_insights AS
SELECT
  explorer_id,
  explorer_name,
  COUNT(*) as total_entries,
  AVG(word_count) as avg_word_count,
  MIN(created_at) as first_entry,
  MAX(created_at) as latest_entry,
  ARRAY_AGG(DISTINCT DATE(created_at)) as journal_days
FROM beta_journal_entries
GROUP BY explorer_id, explorer_name
ORDER BY total_entries DESC;