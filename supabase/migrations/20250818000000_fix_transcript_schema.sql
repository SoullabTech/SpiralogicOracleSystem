-- =====================================================
-- FIX CLIENT_SESSION_TRANSCRIPTS SCHEMA
-- =====================================================
-- Template C: Join through parent table (oracle_sessions) ownership
-- User-scoped access + facilitator read-only oversight
-- Generated: 2025-08-18
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: CREATE TABLE IF MISSING
-- =====================================================

DO $$
BEGIN
  -- Only create if the table doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'client_session_transcripts'
  ) THEN
    
    -- ✅ SANITY CHECK: Proper schema with FK cascade
    CREATE TABLE public.client_session_transcripts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL REFERENCES public.oracle_sessions(id) ON DELETE CASCADE,
      transcript_text text,
      metadata jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    -- ✅ SANITY CHECK: Enable RLS
    ALTER TABLE public.client_session_transcripts ENABLE ROW LEVEL SECURITY;
    
    -- ✅ SANITY CHECK: Verify oracle_sessions has user_id owner column
    -- (This will fail if oracle_sessions doesn't have user_id, which is good)
    PERFORM 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'oracle_sessions' 
    AND column_name = 'user_id';
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'oracle_sessions table missing user_id column - cannot create transcript policies';
    END IF;

  END IF;
END;
$$;

-- =====================================================
-- PART 2: IDEMPOTENT RLS POLICIES (Template C Pattern)
-- =====================================================

-- SELECT: User owns session OR facilitator read-only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_session_transcripts'
      AND policyname = 'client_session_transcripts_select_self'
  ) THEN
    CREATE POLICY client_session_transcripts_select_self
    ON public.client_session_transcripts
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.oracle_sessions s
        WHERE s.id = client_session_transcripts.session_id
          AND s.user_id = auth.uid()
      )
      OR COALESCE((auth.jwt()->>'facilitator')::boolean, false)
    );
  END IF;
END;
$$;

-- INSERT: User owns session (no facilitator insert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_session_transcripts'
      AND policyname = 'client_session_transcripts_insert_self'
  ) THEN
    CREATE POLICY client_session_transcripts_insert_self
    ON public.client_session_transcripts
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.oracle_sessions s
        WHERE s.id = client_session_transcripts.session_id
          AND s.user_id = auth.uid()
      )
    );
  END IF;
END;
$$;

-- UPDATE: User owns session (no facilitator update - read-only oversight)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_session_transcripts'
      AND policyname = 'client_session_transcripts_update_self'
  ) THEN
    CREATE POLICY client_session_transcripts_update_self
    ON public.client_session_transcripts
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1
        FROM public.oracle_sessions s
        WHERE s.id = client_session_transcripts.session_id
          AND s.user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.oracle_sessions s
        WHERE s.id = client_session_transcripts.session_id
          AND s.user_id = auth.uid()
      )
    );
  END IF;
END;
$$;

-- DELETE: User owns session (no facilitator delete - read-only oversight)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_session_transcripts'
      AND policyname = 'client_session_transcripts_delete_self'
  ) THEN
    CREATE POLICY client_session_transcripts_delete_self
    ON public.client_session_transcripts
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1
        FROM public.oracle_sessions s
        WHERE s.id = client_session_transcripts.session_id
          AND s.user_id = auth.uid()
      )
    );
  END IF;
END;
$$;

-- =====================================================
-- PART 3: PERFORMANCE INDEXES
-- =====================================================

-- ✅ SANITY CHECK: Performance indexes for join queries
CREATE INDEX IF NOT EXISTS idx_client_session_transcripts_session_id
  ON public.client_session_transcripts(session_id);

CREATE INDEX IF NOT EXISTS idx_oracle_sessions_user_id
  ON public.oracle_sessions(user_id);

-- =====================================================
-- PART 4: SUPABASE GRANTS
-- =====================================================

-- ✅ SANITY CHECK: Proper grants for authenticated users
REVOKE ALL ON public.client_session_transcripts FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_session_transcripts TO authenticated;

COMMIT;