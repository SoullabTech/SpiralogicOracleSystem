-- =====================================================
-- CLIENT_SESSION_TRANSCRIPTS - OPTION A (client_id = auth.uid())
-- =====================================================
-- Direct ownership via client_id column
-- Generated: 2025-08-18 (Corrected syntax)
-- =====================================================

BEGIN;

-- Prerequisites
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Create table if missing
CREATE TABLE IF NOT EXISTS public.client_session_transcripts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid NOT NULL,
  session_id          uuid,
  transcript_content  text NOT NULL,
  transcript_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- 1a) Add FK to Supabase auth.users(id) if not exists
DO $fkey$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name   = 'client_session_transcripts'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name = 'client_session_transcripts_client_id_fkey'
  ) THEN
    ALTER TABLE public.client_session_transcripts
      ADD CONSTRAINT client_session_transcripts_client_id_fkey
      FOREIGN KEY (client_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
END
$fkey$ LANGUAGE plpgsql;

-- 2) Helper function for updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $func$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$func$;

-- 3) Recreate trigger safely
DROP TRIGGER IF EXISTS trg_cst_set_updated_at ON public.client_session_transcripts;
CREATE TRIGGER trg_cst_set_updated_at
BEFORE UPDATE ON public.client_session_transcripts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4) Performance index
CREATE INDEX IF NOT EXISTS idx_cst_client_id
  ON public.client_session_transcripts(client_id);

-- 5) Enable RLS
ALTER TABLE public.client_session_transcripts ENABLE ROW LEVEL SECURITY;

-- 6) Clean slate policies (use simple DROP IF EXISTS)
DROP POLICY IF EXISTS client_session_transcripts_select_self ON public.client_session_transcripts;
DROP POLICY IF EXISTS client_session_transcripts_insert_self ON public.client_session_transcripts;
DROP POLICY IF EXISTS client_session_transcripts_update_self ON public.client_session_transcripts;
DROP POLICY IF EXISTS client_session_transcripts_delete_self ON public.client_session_transcripts;

-- 7) Option A policies: client_id = auth.uid()
CREATE POLICY client_session_transcripts_select_self
ON public.client_session_transcripts
FOR SELECT
USING (client_id = auth.uid());

CREATE POLICY client_session_transcripts_insert_self
ON public.client_session_transcripts
FOR INSERT
WITH CHECK (client_id = auth.uid());

CREATE POLICY client_session_transcripts_update_self
ON public.client_session_transcripts
FOR UPDATE
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

CREATE POLICY client_session_transcripts_delete_self
ON public.client_session_transcripts
FOR DELETE
USING (client_id = auth.uid());

-- 8) Grants (Supabase-style)
REVOKE ALL ON public.client_session_transcripts FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_session_transcripts TO authenticated;

COMMIT;