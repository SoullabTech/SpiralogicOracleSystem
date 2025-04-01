-- Add feedback and review features to sessions and journal entries
ALTER TABLE sessions
  ADD COLUMN feedback TEXT,
  ADD COLUMN practitioner_notes TEXT,
  ADD COLUMN review_status TEXT CHECK (review_status IN ('pending', 'reviewed', 'flagged')),
  ADD COLUMN reviewed_by UUID REFERENCES user_profiles(id),
  ADD COLUMN reviewed_at TIMESTAMPTZ;

-- Add journal review features
ALTER TABLE journal_entries
  ADD COLUMN practitioner_feedback TEXT,
  ADD COLUMN review_status TEXT CHECK (review_status IN ('pending', 'reviewed', 'flagged')),
  ADD COLUMN reviewed_by UUID REFERENCES user_profiles(id),
  ADD COLUMN reviewed_at TIMESTAMPTZ,
  ADD COLUMN review_tags TEXT[],
  ADD COLUMN progression_indicators JSONB DEFAULT '{}'::jsonb;

-- Create function to add practitioner feedback
CREATE OR REPLACE FUNCTION add_session_feedback(
  p_session_id UUID,
  p_feedback TEXT,
  p_review_status TEXT DEFAULT 'reviewed'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user is a practitioner
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_types rt ON ur.role_id = rt.id
    WHERE ur.user_id = auth.uid()
    AND rt.name IN ('practitioner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Only practitioners can add session feedback';
  END IF;

  -- Update session with feedback
  UPDATE sessions
  SET
    feedback = p_feedback,
    review_status = p_review_status,
    reviewed_by = (SELECT id FROM user_profiles WHERE user_id = auth.uid()),
    reviewed_at = now()
  WHERE id = p_session_id
  AND EXISTS (
    SELECT 1 FROM practitioner_assignments pa
    WHERE pa.client_id = sessions.client_id
    AND pa.practitioner_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    AND pa.status = 'active'
  );
END;
$$;

-- Create function to add journal feedback
CREATE OR REPLACE FUNCTION add_journal_feedback(
  p_entry_id UUID,
  p_feedback TEXT,
  p_review_status TEXT DEFAULT 'reviewed',
  p_tags TEXT[] DEFAULT NULL,
  p_indicators JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user is a practitioner
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_types rt ON ur.role_id = rt.id
    WHERE ur.user_id = auth.uid()
    AND rt.name IN ('practitioner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Only practitioners can add journal feedback';
  END IF;

  -- Update journal entry with feedback
  UPDATE journal_entries
  SET
    practitioner_feedback = p_feedback,
    review_status = p_review_status,
    reviewed_by = (SELECT id FROM user_profiles WHERE user_id = auth.uid()),
    reviewed_at = now(),
    review_tags = COALESCE(p_tags, review_tags),
    progression_indicators = COALESCE(p_indicators, progression_indicators)
  WHERE id = p_entry_id
  AND EXISTS (
    SELECT 1 FROM practitioner_assignments pa
    WHERE pa.client_id = journal_entries.user_id
    AND pa.practitioner_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    AND pa.status = 'active'
  );
END;
$$;

-- Create view for practitioner journal review
CREATE OR REPLACE VIEW practitioner_journal_review AS
SELECT
  je.id as entry_id,
  je.user_id as client_id,
  up.name as client_name,
  je.content,
  je.mood,
  je.elemental_tags,
  je.archetype_tags,
  je.created_at,
  je.practitioner_feedback,
  je.review_status,
  je.review_tags,
  je.progression_indicators,
  reviewer.name as reviewed_by_name,
  je.reviewed_at
FROM journal_entries je
JOIN user_profiles up ON up.id = je.user_id
LEFT JOIN user_profiles reviewer ON reviewer.id = je.reviewed_by
WHERE EXISTS (
  SELECT 1 FROM practitioner_assignments pa
  WHERE pa.client_id = je.user_id
  AND pa.practitioner_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
  AND pa.status = 'active'
);

-- Add RLS policies for feedback
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can review assigned client sessions"
  ON sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practitioner_assignments pa
      WHERE pa.client_id = sessions.client_id
      AND pa.practitioner_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
      AND pa.status = 'active'
    )
  );

CREATE POLICY "Clients can view feedback on their sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (
    client_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
  );

-- Add indexes for better performance
CREATE INDEX sessions_review_status_idx ON sessions(review_status);
CREATE INDEX journal_entries_review_status_idx ON journal_entries(review_status);
CREATE INDEX journal_entries_reviewed_by_idx ON journal_entries(reviewed_by);