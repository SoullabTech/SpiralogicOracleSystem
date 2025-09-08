-- Journal Entries Migration
-- Connects reflections to soulprints for unified sacred timeline

-- Journal entries tied to soulprints
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  soulprint_id UUID REFERENCES soulprints(id) ON DELETE CASCADE,
  
  -- Journal content
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  
  -- Milestone context
  milestone TEXT CHECK (milestone IN ('first-bloom', 'pattern-keeper', 'depth-seeker', 'sacred-gardener', 'wisdom-keeper')),
  active_facets TEXT[], -- e.g., ["fire-1", "water-3"]
  
  -- Reflection metadata
  word_count INTEGER GENERATED ALWAYS AS (array_length(string_to_array(trim(response), ' '), 1)) STORED,
  reflection_quality TEXT CHECK (reflection_quality IN ('brief', 'thoughtful', 'profound')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_journal_entries_user_created ON journal_entries(user_id, created_at DESC);
CREATE INDEX idx_journal_entries_soulprint ON journal_entries(soulprint_id);
CREATE INDEX idx_journal_entries_milestone ON journal_entries(milestone);

-- Automatic reflection quality assessment
CREATE OR REPLACE FUNCTION assess_reflection_quality()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reflection_quality = CASE
    WHEN NEW.word_count <= 20 THEN 'brief'
    WHEN NEW.word_count <= 100 THEN 'thoughtful'
    ELSE 'profound'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reflection_quality
  BEFORE INSERT OR UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION assess_reflection_quality();

-- Automatic timestamp updates
CREATE TRIGGER update_journal_entries_updated_at 
  BEFORE UPDATE ON journal_entries 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sacred reflections
CREATE POLICY "Users can manage own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- Sacred timeline view combining soulprints and journal entries
CREATE OR REPLACE VIEW sacred_timeline AS
SELECT 
  'soulprint' as entry_type,
  s.id,
  s.user_id,
  s.milestone,
  s.coherence::text as content_preview,
  NULL as reflection_content,
  s.created_at,
  s.elemental_balance as metadata
FROM soulprints s

UNION ALL

SELECT 
  'journal' as entry_type,
  j.id,
  j.user_id,
  j.milestone,
  substring(j.prompt, 1, 100) as content_preview,
  j.response as reflection_content,
  j.created_at,
  json_build_object('active_facets', j.active_facets, 'word_count', j.word_count, 'quality', j.reflection_quality) as metadata
FROM journal_entries j

ORDER BY created_at ASC;

-- Comments for sacred context
COMMENT ON TABLE journal_entries IS 'Sacred reflections written in response to milestone prompts';
COMMENT ON COLUMN journal_entries.prompt IS 'The soulful prompt that inspired this reflection';
COMMENT ON COLUMN journal_entries.response IS 'The user''s heartfelt written reflection';
COMMENT ON COLUMN journal_entries.active_facets IS 'Petal facets that were active during reflection';
COMMENT ON VIEW sacred_timeline IS 'Unified chronological view of soulprints and journal entries';