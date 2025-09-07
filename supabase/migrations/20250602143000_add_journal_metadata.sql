ALTER TABLE journal_entries
ADD COLUMN mood TEXT,
ADD COLUMN elemental_tag TEXT,
ADD COLUMN archetype_tag TEXT,
ADD COLUMN metadata JSONB;
-- optional timestamp tracking
ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
