-- Whispers System Monitoring Queries
-- Use these for production monitoring and debugging

-- 1. User adoption metrics
SELECT 
  date_trunc('day', created_at) as day,
  count(distinct user_id) as users_with_memories,
  count(*) as total_memories,
  avg(array_length(nd_tags, 1)) as avg_tags_per_memory
FROM public.micro_memories
WHERE created_at >= now() - interval '30 days'
GROUP BY 1 
ORDER BY 1 DESC;

-- 2. Top tags by usage (for weight tuning insights)
SELECT
  tag,
  count(*) as usage_count,
  count(distinct user_id) as unique_users,
  round(avg(case when energy = 'high' then 3 when energy = 'medium' then 2 else 1 end), 2) as avg_energy
FROM public.micro_memories mm
CROSS JOIN LATERAL unnest(mm.nd_tags) as tag
WHERE mm.created_at >= now() - interval '14 days'
GROUP BY tag
ORDER BY usage_count DESC
LIMIT 20;

-- 3. Whisper weights distribution
SELECT 
  (weights->>'elementBoost')::numeric as element_boost,
  (weights->>'recencyHalfLifeDays')::numeric as recency_days,
  (weights->>'recallBoost')::numeric as recall_boost,
  count(*) as users_with_settings,
  updated_at
FROM public.whisper_weights
GROUP BY 1, 2, 3, 5
ORDER BY users_with_settings DESC;

-- 4. Memory recall patterns (for algorithm tuning)
SELECT
  case 
    when recall_at is null then 'no_recall'
    when recall_at <= now() then 'due'
    when recall_at > now() then 'future'
  end as recall_status,
  count(*) as memory_count,
  round(100.0 * count(*) / sum(count(*)) over(), 1) as percentage
FROM public.micro_memories
WHERE created_at >= now() - interval '30 days'
GROUP BY 1
ORDER BY memory_count DESC;

-- 5. Element distribution (for balancing algorithm)
SELECT
  coalesce(element, 'unclassified') as element,
  count(*) as memory_count,
  count(distinct user_id) as unique_users,
  round(100.0 * count(*) / sum(count(*)) over(), 1) as percentage
FROM public.micro_memories
WHERE created_at >= now() - interval '30 days'
GROUP BY element
ORDER BY memory_count DESC;

-- 6. User engagement with personalized weights
WITH weight_users AS (
  SELECT user_id, true as has_custom_weights
  FROM public.whisper_weights
), memory_stats AS (
  SELECT 
    mm.user_id,
    count(*) as total_memories,
    max(mm.created_at) as last_memory_at,
    coalesce(wu.has_custom_weights, false) as has_custom_weights
  FROM public.micro_memories mm
  LEFT JOIN weight_users wu ON mm.user_id = wu.user_id
  WHERE mm.created_at >= now() - interval '30 days'
  GROUP BY mm.user_id, wu.has_custom_weights
)
SELECT
  has_custom_weights,
  count(*) as user_count,
  round(avg(total_memories), 1) as avg_memories_per_user,
  count(*) filter (where last_memory_at >= now() - interval '7 days') as active_last_7d
FROM memory_stats
GROUP BY has_custom_weights
ORDER BY has_custom_weights DESC;

-- 7. Performance monitoring (if you add timing logs)
-- This assumes you add timing data to a telemetry table
/*
SELECT
  date_trunc('hour', created_at) as hour,
  count(*) as api_calls,
  round(avg(duration_ms), 1) as avg_duration_ms,
  round(percentile_cont(0.95) within group (order by duration_ms), 1) as p95_duration_ms,
  count(*) filter (where duration_ms > 200) as slow_calls,
  count(*) filter (where status >= 400) as error_calls
FROM public.api_telemetry
WHERE endpoint = '/api/whispers/context'
  AND created_at >= now() - interval '24 hours'
GROUP BY 1
ORDER BY 1 DESC;
*/

-- 8. Weight fallback rate (requires telemetry)
/*
SELECT
  date_trunc('day', created_at) as day,
  count(*) filter (where event_type = 'weights_fallback_localStorage') as localStorage_fallbacks,
  count(*) filter (where event_type = 'weights_fallback_default') as default_fallbacks,
  count(*) filter (where event_type = 'weights_loaded_server') as successful_loads,
  round(100.0 * count(*) filter (where event_type like 'weights_fallback%') / 
               nullif(count(*), 0), 2) as fallback_rate_pct
FROM public.telemetry
WHERE event_type like 'weights_%'
  AND created_at >= now() - interval '7 days'
GROUP BY 1
ORDER BY 1 DESC;
*/

-- 9. Memory age distribution (for recency tuning)
SELECT
  case 
    when age_hours < 1 then '<1h'
    when age_hours < 24 then '1-24h'
    when age_hours < 168 then '1-7d' -- 168 hours = 7 days
    when age_hours < 720 then '1-30d' -- 720 hours = 30 days
    else '>30d'
  end as age_bucket,
  count(*) as memory_count,
  round(100.0 * count(*) / sum(count(*)) over(), 1) as percentage
FROM (
  SELECT 
    extract(epoch from (now() - created_at)) / 3600 as age_hours
  FROM public.micro_memories
  WHERE created_at >= now() - interval '60 days'
) aged_memories
GROUP BY 1
ORDER BY 
  case 
    when age_bucket = '<1h' then 1
    when age_bucket = '1-24h' then 2
    when age_bucket = '1-7d' then 3
    when age_bucket = '1-30d' then 4
    else 5
  end;

-- 10. RLS verification - ensure all queries are user-scoped
-- This should return 0 rows if RLS is working correctly
-- (Only run in development/staging)
/*
SET ROLE postgres; -- Temporarily bypass RLS for testing
SELECT 
  'micro_memories' as table_name,
  count(*) as total_rows,
  count(distinct user_id) as unique_users
FROM public.micro_memories
UNION ALL
SELECT 
  'whisper_weights' as table_name,
  count(*) as total_rows,
  count(distinct user_id) as unique_users  
FROM public.whisper_weights;
RESET ROLE;
*/