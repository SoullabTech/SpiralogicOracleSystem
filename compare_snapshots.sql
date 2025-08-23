-- =====================================================
-- COMPARE PERFORMANCE SNAPSHOTS
-- =====================================================
-- Compare performance improvements between runs
-- Run this after making optimizations to measure impact
-- =====================================================

-- Show latest snapshots for comparison
SELECT 
  '=== RECENT PERFORMANCE SNAPSHOTS ===' as comparison_type,
  '' as spacer;

SELECT 
  taken_at,
  jsonb_array_length(top_queries) as query_count,
  CASE 
    WHEN taken_at = (SELECT MAX(taken_at) FROM perf_snapshots) THEN '← LATEST'
    ELSE ''
  END as marker
FROM perf_snapshots
ORDER BY taken_at DESC
LIMIT 10;

-- Compare top slow queries between latest two snapshots
WITH latest_two AS (
  SELECT taken_at, top_queries,
         row_number() OVER (ORDER BY taken_at DESC) as rn
  FROM perf_snapshots
),
current_run AS (
  SELECT jsonb_array_elements(top_queries) as query_data
  FROM latest_two WHERE rn = 1
),
previous_run AS (
  SELECT jsonb_array_elements(top_queries) as query_data  
  FROM latest_two WHERE rn = 2
)
SELECT 
  '=== PERFORMANCE COMPARISON ===' as comparison_type,
  '' as spacer;

SELECT 
  c.query_data->>'sample_query' as query,
  (c.query_data->>'mean_ms')::numeric as current_mean_ms,
  COALESCE((p.query_data->>'mean_ms')::numeric, 0) as previous_mean_ms,
  CASE 
    WHEN p.query_data IS NULL THEN 'NEW QUERY'
    WHEN (c.query_data->>'mean_ms')::numeric < (p.query_data->>'mean_ms')::numeric THEN 
      '↓ IMPROVED by ' || round(((p.query_data->>'mean_ms')::numeric - (c.query_data->>'mean_ms')::numeric), 2) || 'ms'
    WHEN (c.query_data->>'mean_ms')::numeric > (p.query_data->>'mean_ms')::numeric THEN 
      '↑ SLOWER by ' || round(((c.query_data->>'mean_ms')::numeric - (p.query_data->>'mean_ms')::numeric), 2) || 'ms'
    ELSE '→ NO CHANGE'
  END as performance_delta
FROM current_run c
LEFT JOIN previous_run p ON 
  -- Match by query pattern (first 100 chars)
  left(c.query_data->>'sample_query', 100) = left(p.query_data->>'sample_query', 100)
ORDER BY (c.query_data->>'mean_ms')::numeric DESC
LIMIT 10;

-- Export current snapshot to CSV (uncomment to use)
-- \copy (
--   SELECT 
--     (query_data->>'queryid')::bigint as queryid,
--     (query_data->>'calls')::int as calls,
--     (query_data->>'mean_ms')::numeric as mean_ms,
--     (query_data->>'total_ms')::numeric as total_ms,
--     (query_data->>'rows')::bigint as rows,
--     query_data->>'sample_query' as sample_query
--   FROM (
--     SELECT jsonb_array_elements(top_queries) as query_data
--     FROM perf_snapshots 
--     WHERE taken_at = (SELECT MAX(taken_at) FROM perf_snapshots)
--   ) sub
--   ORDER BY (query_data->>'mean_ms')::numeric DESC
-- ) TO '/tmp/perf_latest.csv' CSV HEADER;