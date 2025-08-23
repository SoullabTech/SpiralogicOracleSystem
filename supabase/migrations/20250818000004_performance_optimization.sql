-- =====================================================
-- PERFORMANCE OPTIMIZATION FOR CLIENT_SESSION_TRANSCRIPTS
-- =====================================================
-- Based on performance advisor recommendations
-- Run after: 20250818000002_client_transcripts_option_a.sql
-- =====================================================

BEGIN;

-- 1) Enable pg_stat_statements for query analysis
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 2) Essential indexes for Template-C join pattern and Option A
-- (These are idempotent - safe to run multiple times)

-- Option A: Direct client_id ownership
CREATE INDEX IF NOT EXISTS idx_cst_client_id
  ON public.client_session_transcripts(client_id);

-- Template-C: Session-based ownership (if using oracle_sessions join)
CREATE INDEX IF NOT EXISTS idx_cst_session_id
  ON public.client_session_transcripts(session_id);

-- Parent table owner column (for Template-C)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'oracle_sessions'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.oracle_sessions(user_id)';
  END IF;
END $$;

-- 3) Common query patterns: "my transcripts, newest first"
CREATE INDEX IF NOT EXISTS idx_cst_client_id_created_at
  ON public.client_session_transcripts(client_id, created_at DESC);

-- 4) Session-based queries with time ordering
CREATE INDEX IF NOT EXISTS idx_cst_session_id_created_at
  ON public.client_session_transcripts(session_id, created_at DESC);

-- 5) Facilitator helper function (RLS optimization)
CREATE OR REPLACE FUNCTION public.is_facilitator()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT coalesce((auth.jwt() -> 'app_metadata' ->> 'facilitator')::boolean, false)
$$;

-- 6) Full-text search capability (if needed for transcript content search)
-- Uncomment if you need to search transcript content
/*
ALTER TABLE public.client_session_transcripts
  ADD COLUMN IF NOT EXISTS tsv tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(transcript_content, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_cst_tsv 
  ON public.client_session_transcripts USING gin(tsv);
*/

-- 7) Trigram index for ILIKE '%pattern%' searches (if needed)
-- Uncomment if you need fuzzy text matching
/*
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_cst_transcript_text_trgm
  ON public.client_session_transcripts USING gin (transcript_content gin_trgm_ops);
*/

-- 8) JSONB indexing for common metadata queries (if needed)
-- Uncomment and customize based on your metadata structure
/*
-- Example: Index on a specific metadata field
CREATE INDEX IF NOT EXISTS idx_cst_metadata_status
  ON public.client_session_transcripts USING gin ((transcript_metadata->'status'));

-- Example: Functional index on metadata timestamp
CREATE INDEX IF NOT EXISTS idx_cst_metadata_processed_at
  ON public.client_session_transcripts 
  ( ((transcript_metadata->>'processed_at')::timestamptz) )
  WHERE transcript_metadata ? 'processed_at';
*/

-- 9) Update table statistics for better query planning
ANALYZE public.client_session_transcripts;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'oracle_sessions'
  ) THEN
    EXECUTE 'ANALYZE public.oracle_sessions';
  END IF;
END $$;

COMMIT;