-- =====================================================
-- PERFORMANCE OPTIMIZATION - QUICK WINS
-- =====================================================
-- Run this script to apply immediate performance improvements
-- Based on RLS Template-C and Option A patterns
-- =====================================================

-- PRE-FLIGHT GUARDS
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- for ILIKE '%pattern%' searches
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid
SET statement_timeout = '30s';

BEGIN;

-- 2) Essential indexes for RLS patterns

-- Option A: Direct client_id ownership
CREATE INDEX IF NOT EXISTS idx_cst_client_id
  ON public.client_session_transcripts(client_id);

-- Template-C: Session-based join pattern  
CREATE INDEX IF NOT EXISTS idx_cst_session_id
  ON public.client_session_transcripts(session_id);

-- Parent table owner column (if oracle_sessions exists)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id
  ON public.oracle_sessions(user_id);

-- 3) Common query patterns: "my transcripts, newest first"
CREATE INDEX IF NOT EXISTS idx_cst_client_id_created_at
  ON public.client_session_transcripts(client_id, created_at DESC);

-- Session-based queries with time ordering
CREATE INDEX IF NOT EXISTS idx_cst_session_id_created_at
  ON public.client_session_transcripts(session_id, created_at DESC);

-- 4) RLS optimization: STABLE facilitator helper
CREATE OR REPLACE FUNCTION public.is_facilitator()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT coalesce((auth.jwt() -> 'app_metadata' ->> 'facilitator')::boolean, false)
$$;

COMMIT;

-- 5) Update table statistics for better query planning (after commit)
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

-- =====================================================
-- DIAGNOSTICS QUERIES (run separately to check performance)
-- =====================================================

-- Find your actual slow queries (not advisor introspection)
SELECT 'SLOW QUERIES ANALYSIS:' as analysis_type;

SELECT queryid,
       calls,
       round(total_exec_time::numeric,1) AS total_ms,
       round(mean_exec_time::numeric,2)  AS mean_ms,
       rows,
       left(regexp_replace(query, '\s+', ' ', 'g'), 180) AS sample_query
FROM pg_stat_statements
WHERE query NOT ILIKE '%pg_stat_statements%'
  AND query NOT ILIKE '%WITH tables as%'  -- Filter advisor queries
  AND query NOT ILIKE '%information_schema%'
  AND query NOT ILIKE '%pg_policies%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT 'INDEX USAGE ANALYSIS:' as analysis_type;

SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND (tablename LIKE '%transcript%' OR tablename LIKE '%session%')
ORDER BY idx_scan DESC;

-- Table scan vs index usage
SELECT 'SCAN PATTERNS:' as analysis_type;

SELECT 
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  CASE 
    WHEN seq_scan + idx_scan = 0 THEN 0
    ELSE round(100.0 * idx_scan / (seq_scan + idx_scan), 2)
  END AS index_usage_pct
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND (tablename LIKE '%transcript%' OR tablename LIKE '%session%');