-- =====================================================
-- KEYSET PAGINATION RPC FOR HIGH PERFORMANCE
-- =====================================================
-- Creates optimized pagination functions that scale well
-- Replaces OFFSET-based pagination with keyset cursors
-- =====================================================

BEGIN;

-- 1) Main keyset pagination RPC
CREATE OR REPLACE FUNCTION public.list_my_transcripts(
  _after_ts timestamptz DEFAULT NULL,
  _after_id uuid DEFAULT NULL,
  _limit int DEFAULT 20
)
RETURNS SETOF public.client_session_transcripts
LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  SELECT *
  FROM public.client_session_transcripts
  WHERE client_id = auth.uid()
    AND (created_at, id) < (
      coalesce(_after_ts, 'infinity'::timestamptz), 
      coalesce(_after_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)
    )
  ORDER BY created_at DESC, id DESC
  LIMIT greatest(_limit, 1)
$$;

-- 2) Session-based keyset pagination (Template-C pattern)
CREATE OR REPLACE FUNCTION public.list_session_transcripts(
  _session_id uuid,
  _after_ts timestamptz DEFAULT NULL,
  _after_id uuid DEFAULT NULL,
  _limit int DEFAULT 20
)
RETURNS SETOF public.client_session_transcripts
LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  SELECT t.*
  FROM public.client_session_transcripts t
  JOIN public.oracle_sessions s ON t.session_id = s.id
  WHERE s.id = _session_id
    AND s.user_id = auth.uid()  -- RLS enforcement
    AND (t.created_at, t.id) < (
      coalesce(_after_ts, 'infinity'::timestamptz), 
      coalesce(_after_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)
    )
  ORDER BY t.created_at DESC, t.id DESC
  LIMIT greatest(_limit, 1)
$$;

-- 3) Search with keyset pagination (for ILIKE queries)
CREATE OR REPLACE FUNCTION public.search_my_transcripts(
  _search_term text,
  _after_ts timestamptz DEFAULT NULL,
  _after_id uuid DEFAULT NULL,
  _limit int DEFAULT 20
)
RETURNS SETOF public.client_session_transcripts
LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  SELECT *
  FROM public.client_session_transcripts
  WHERE client_id = auth.uid()
    AND transcript_content ILIKE '%' || _search_term || '%'
    AND (created_at, id) < (
      coalesce(_after_ts, 'infinity'::timestamptz), 
      coalesce(_after_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)
    )
  ORDER BY created_at DESC, id DESC
  LIMIT greatest(_limit, 1)
$$;

-- 4) Metadata filter with keyset pagination
CREATE OR REPLACE FUNCTION public.list_transcripts_by_type(
  _session_type text,
  _after_ts timestamptz DEFAULT NULL,
  _after_id uuid DEFAULT NULL,
  _limit int DEFAULT 20
)
RETURNS SETOF public.client_session_transcripts
LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  SELECT *
  FROM public.client_session_transcripts
  WHERE client_id = auth.uid()
    AND transcript_metadata->>'session_type' = _session_type
    AND (created_at, id) < (
      coalesce(_after_ts, 'infinity'::timestamptz), 
      coalesce(_after_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)
    )
  ORDER BY created_at DESC, id DESC
  LIMIT greatest(_limit, 1)
$$;

-- 5) Lightweight count function (avoids exact counting overhead)
CREATE OR REPLACE FUNCTION public.transcript_count_estimate(
  _client_id uuid DEFAULT NULL
)
RETURNS bigint
LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  SELECT CASE 
    WHEN _client_id IS NOT NULL THEN
      -- Facilitator getting count for specific user
      (SELECT count(*) FROM public.client_session_transcripts WHERE client_id = _client_id)
    ELSE
      -- User getting their own count
      (SELECT count(*) FROM public.client_session_transcripts WHERE client_id = auth.uid())
  END
$$;

-- 6) Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.list_my_transcripts(timestamptz, uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_session_transcripts(uuid, timestamptz, uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_my_transcripts(text, timestamptz, uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_transcripts_by_type(text, timestamptz, uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transcript_count_estimate(uuid) TO authenticated;

COMMIT;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example 1: First page (no cursor)
SELECT * FROM public.list_my_transcripts(NULL, NULL, 20);

-- Example 2: Next page (use last row's created_at and id as cursor)
SELECT * FROM public.list_my_transcripts('2025-08-18 10:30:00'::timestamptz, '12345678-1234-1234-1234-123456789012'::uuid, 20);

-- Example 3: Search with pagination
SELECT * FROM public.search_my_transcripts('guidance', NULL, NULL, 10);

-- Example 4: Filter by session type
SELECT * FROM public.list_transcripts_by_type('oracle', NULL, NULL, 15);

-- Example 5: Get approximate count (fast)
SELECT public.transcript_count_estimate();