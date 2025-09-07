-- Migration: Add Daimonic Encounters table
-- This table stores symbolic encounters that emerge during deep conversations

CREATE TABLE IF NOT EXISTS daimonic_encounters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  encounter_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  symbol TEXT NOT NULL,
  message TEXT NOT NULL,
  action_prompt TEXT NOT NULL,
  archetype TEXT NOT NULL,
  energy_state TEXT NOT NULL,
  trigger_context TEXT NOT NULL, -- JSON string with context that triggered the encounter
  timestamp INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient user queries
CREATE INDEX IF NOT EXISTS idx_daimonic_encounters_user_id ON daimonic_encounters(user_id);
CREATE INDEX IF NOT EXISTS idx_daimonic_encounters_timestamp ON daimonic_encounters(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_daimonic_encounters_archetype ON daimonic_encounters(archetype);
CREATE INDEX IF NOT EXISTS idx_daimonic_encounters_energy_state ON daimonic_encounters(energy_state);