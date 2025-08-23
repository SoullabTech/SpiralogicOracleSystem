-- =====================================================
-- QUERY DIAGNOSTICS FOR PERFORMANCE ANALYSIS
-- =====================================================
-- Run this to identify slow queries and analyze performance
-- Use in SQL editor or psql for performance troubleshooting
-- =====================================================

-- 1) Top slow queries (excluding advisor introspection)
SELECT 
  queryid,
  calls,
  round(total_exec_time::numeric, 1) AS total_ms,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  rows,
  left(regexp_replace(query, '\s+', ' ', 'g'), 180) AS sample_query
FROM pg_stat_statements
WHERE query NOT ILIKE '%pg_stat_statements%'
  AND query NOT ILIKE '%WITH tables as%'  -- Filter out advisor queries
  AND query NOT ILIKE '%information_schema%'
  AND query NOT ILIKE '%pg_policies%'
ORDER BY mean_exec_time DESC
LIMIT 15;

-- 2) RLS-related queries (check for policy overhead)
SELECT 
  queryid,
  calls,
  round(total_exec_time::numeric, 1) AS total_ms,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  left(regexp_replace(query, '\s+', ' ', 'g'), 200) AS sample_query
FROM pg_stat_statements
WHERE query ILIKE '%client_session_transcripts%'
   OR query ILIKE '%oracle_sessions%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 3) Index usage analysis
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND (tablename = 'client_session_transcripts' OR tablename = 'oracle_sessions')
ORDER BY idx_scan DESC;

-- 4) Table scan vs index scan ratio
SELECT 
  schemaname,
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
  AND (tablename = 'client_session_transcripts' OR tablename = 'oracle_sessions');

-- 5) Current RLS policies (for reference)
SELECT 
  tablename,
  policyname,
  cmd,
  permissive,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'client_session_transcripts'
ORDER BY tablename, policyname, cmd;

-- 6) Connection and lock analysis
SELECT 
  datname,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  left(query, 100) AS current_query
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT ILIKE '%pg_stat_activity%'
ORDER BY query_start;

-- 7) Table sizes and bloat estimation
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
  AND (tablename = 'client_session_transcripts' OR tablename = 'oracle_sessions')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;