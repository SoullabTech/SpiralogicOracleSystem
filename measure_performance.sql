-- =====================================================
-- PERFORMANCE MEASUREMENT AND ANALYSIS
-- =====================================================
-- Run after deploying performance_optimization.sql
-- This measures your actual workload performance
-- =====================================================

-- 1) Reset stats to measure fresh (run first)
SELECT pg_stat_statements_reset();

-- Wait here - generate some app traffic, then continue below...

-- =====================================================
-- BASELINE SNAPSHOT SYSTEM
-- =====================================================

-- Create snapshot table (first run only)
CREATE TABLE IF NOT EXISTS perf_snapshots (
  taken_at timestamptz PRIMARY KEY,
  top_queries jsonb
);

-- =====================================================
-- 2) ANALYZE SLOW QUERIES (run after generating traffic)
-- =====================================================

-- Save snapshot and display results
WITH top_queries AS (
  SELECT queryid, calls,
         round(mean_exec_time::numeric,2)  AS mean_ms,
         round(total_exec_time::numeric,1) AS total_ms,
         rows,
         left(regexp_replace(query, '\s+', ' ', 'g'), 400) AS sample_query
  FROM pg_stat_statements
  WHERE query NOT ILIKE '%pg_stat_statements%'
    AND query NOT ILIKE '%WITH tables as%'  -- Filter advisor queries
    AND query NOT ILIKE '%information_schema%'
    AND query NOT ILIKE '%pg_policies%'
    AND query NOT ILIKE '%pg_stat_user%'
    AND query NOT ILIKE '%perf_snapshots%'
  ORDER BY mean_exec_time DESC
  LIMIT 25
)
INSERT INTO perf_snapshots (taken_at, top_queries)
SELECT now(), jsonb_agg(to_jsonb(top_queries)) FROM top_queries;

-- Display current results
SELECT 
  '=== TOP SLOW QUERIES (SNAPSHOT SAVED) ===' as analysis,
  '' as spacer;

SELECT queryid, calls, mean_ms, total_ms, rows, sample_query
FROM (
  SELECT queryid, calls,
         round(mean_exec_time::numeric,2)  AS mean_ms,
         round(total_exec_time::numeric,1) AS total_ms,
         rows,
         left(regexp_replace(query, '\s+', ' ', 'g'), 180) AS sample_query
  FROM pg_stat_statements
  WHERE query NOT ILIKE '%pg_stat_statements%'
    AND query NOT ILIKE '%WITH tables as%'
    AND query NOT ILIKE '%information_schema%'
    AND query NOT ILIKE '%pg_policies%'
    AND query NOT ILIKE '%pg_stat_user%'
    AND query NOT ILIKE '%perf_snapshots%'
  ORDER BY mean_exec_time DESC
  LIMIT 15
) q;

-- =====================================================  
-- 3) RLS AND INDEX HEALTH CHECK
-- =====================================================

SELECT 
  '=== RLS STATUS ===' as analysis,
  '' as spacer;

-- RLS enabled check
SELECT relname, 
       CASE WHEN relrowsecurity THEN 'ON' ELSE 'OFF' END AS rls_status
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' 
  AND relname IN ('oracle_sessions','client_session_transcripts');

SELECT 
  '=== RLS POLICIES ===' as analysis,
  '' as spacer;

-- Active policies
SELECT tablename, policyname, cmd, 
       left(qual, 100) as policy_condition,
       left(with_check, 100) as with_check_condition
FROM pg_policies
WHERE schemaname='public' AND tablename='client_session_transcripts'
ORDER BY policyname, cmd;

SELECT 
  '=== INDEX USAGE ANALYSIS ===' as analysis,
  '' as spacer;

-- Index usage stats
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND (tablename LIKE '%transcript%' OR tablename LIKE '%session%')
ORDER BY idx_scan DESC;

-- =====================================================
-- ENHANCED HEALTH PROBES
-- =====================================================

SELECT 
  '=== INDEX USAGE RATIO PER TABLE ===' as analysis,
  '' as spacer;

-- High seq scans = red flag
SELECT relname AS table_name,
       idx_scan,
       seq_scan,
       CASE WHEN (idx_scan+seq_scan)=0 THEN 100
            ELSE round(100.0*idx_scan/(idx_scan+seq_scan),2) END AS idx_usage_pct
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY idx_usage_pct ASC, (idx_scan+seq_scan) DESC;

SELECT 
  '=== BIG TABLES (INDEX THOUGHTFULLY) ===' as analysis,
  '' as spacer;

-- Size matters for index strategy
SELECT schemaname, relname AS table_name, 
       pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_statio_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 15;

SELECT 
  '=== ACTIVE SEQUENTIAL SCANS ===' as analysis,
  '' as spacer;

-- What's still doing seq scans?
SELECT relname AS table_name, seq_scan, seq_tup_read,
       CASE WHEN seq_scan = 0 THEN 'none' 
            ELSE 'needs index' END AS status
FROM pg_stat_user_tables
WHERE schemaname = 'public' AND seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 15;

SELECT 
  '=== TRANSCRIPT TABLES SCAN PATTERNS ===' as analysis,
  '' as spacer;

-- Specific to our transcript tables
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