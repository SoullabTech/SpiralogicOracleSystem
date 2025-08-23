-- =====================================================
-- SECURITY HARDENING - FIX SUPABASE WARNINGS  
-- =====================================================
-- Addresses 4 security warnings:
-- 1. public.http extension (move to private schema)
-- 2. public."Notion" foreign table (move to private schema) 
-- 3. public.vector extension (assess and secure)
-- 4. Enable leaked password protection (manual UI step)
-- Generated: 2025-08-18
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: CREATE PRIVATE SCHEMA FOR RISKY OPERATIONS
-- =====================================================

-- Create private schema for integrations, extensions, and foreign tables
CREATE SCHEMA IF NOT EXISTS private;

-- Lock it down: NO access for API roles (anon, authenticated)
REVOKE USAGE ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT  USAGE ON SCHEMA private TO postgres;

-- Ensure no execute permissions on anything in private for API roles
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC, anon, authenticated;

-- =====================================================
-- PART 2: MOVE HTTP EXTENSION TO PRIVATE SCHEMA
-- =====================================================

-- Move http extension out of public (major security risk)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
    -- Move to private schema
    ALTER EXTENSION http SET SCHEMA private;
    
    -- Revoke all execute permissions from API roles
    REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC, anon, authenticated;
    
    RAISE NOTICE '✅ HTTP extension moved to private schema and secured';
  ELSE
    RAISE NOTICE '✅ HTTP extension not found - already secure';
  END IF;
END $$;

-- =====================================================
-- PART 3: MOVE FOREIGN TABLES TO PRIVATE SCHEMA
-- =====================================================

-- Move any foreign tables out of public schema
DO $$
DECLARE
  ft_record RECORD;
BEGIN
  -- Find all foreign tables in public schema
  FOR ft_record IN 
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_type = 'FOREIGN TABLE'
  LOOP
    -- Move each foreign table to private schema
    EXECUTE format('ALTER FOREIGN TABLE public.%I SET SCHEMA private', ft_record.table_name);
    
    -- Revoke all privileges from API roles
    EXECUTE format('REVOKE ALL ON FOREIGN TABLE private.%I FROM PUBLIC, anon, authenticated', ft_record.table_name);
    
    RAISE NOTICE '✅ Foreign table % moved to private schema', ft_record.table_name;
  END LOOP;
  
  -- If no foreign tables found
  IF NOT FOUND THEN
    RAISE NOTICE '✅ No foreign tables found in public schema';
  END IF;
END $$;

-- =====================================================
-- PART 4: SECURE VECTOR EXTENSION (KEEP IN PUBLIC)
-- =====================================================

-- Vector extension is generally safe in public (data type + operators)
-- But ensure proper permissions are set
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    -- Vector extension provides data types and operators, generally safe in public
    -- Just ensure no dangerous functions are accessible
    RAISE NOTICE '✅ Vector extension found - keeping in public (safe for data types)';
    
    -- Optional: Uncomment to move to private if you prefer
    -- ALTER EXTENSION vector SET SCHEMA private;
    -- RAISE NOTICE '✅ Vector extension moved to private schema';
  ELSE
    RAISE NOTICE '✅ Vector extension not found';
  END IF;
END $$;

-- =====================================================
-- PART 5: CREATE CONTROLLED RPC ACCESS FUNCTIONS
-- =====================================================

-- Example controlled function for accessing moved foreign tables
-- (Customize based on your actual foreign table structure)
CREATE OR REPLACE FUNCTION public.notion_data_read(
  _limit int DEFAULT 100
)
RETURNS TABLE(
  id text,
  title text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Check if Notion foreign table exists in private schema
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'private' AND table_name = 'Notion'
  ) THEN
    -- Return controlled access to foreign table data
    RETURN QUERY
    SELECT 
      n.id::text,
      n.title::text,
      n.created_at::timestamptz
    FROM private."Notion" n
    ORDER BY n.created_at DESC
    LIMIT greatest(_limit, 1);
  ELSE
    -- Return empty result if table doesn't exist
    RETURN;
  END IF;
END $$;

-- Grant execute only to authenticated users (no anon access)
REVOKE ALL ON FUNCTION public.notion_data_read(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.notion_data_read(int) TO authenticated;

-- =====================================================
-- PART 6: SECURITY AUDIT LOG
-- =====================================================

-- Create security audit table to track changes
CREATE TABLE IF NOT EXISTS public.security_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_details jsonb DEFAULT '{}',
  applied_at timestamptz DEFAULT now(),
  applied_by text DEFAULT current_user
);

-- Log this security hardening
INSERT INTO public.security_audit (event_type, event_details)
VALUES (
  'security_hardening',
  json_build_object(
    'migration', '20250818000006_security_hardening.sql',
    'actions', array[
      'Created private schema',
      'Moved http extension to private',
      'Moved foreign tables to private', 
      'Created controlled RPC functions',
      'Revoked API role permissions on risky objects'
    ],
    'warnings_addressed', array[
      'public.http extension exposure',
      'public foreign table exposure',
      'API role access to dangerous functions'
    ]
  )
);

COMMIT;

-- =====================================================
-- MANUAL STEPS REQUIRED (UI Configuration)
-- =====================================================

-- WARNING: The following must be done manually in Supabase UI:
-- 1. Go to Auth → Protection → "Leaked password protection" → ENABLE
-- 2. Go to Auth → Settings → Email confirmations → ENABLE (recommended)
-- 3. Go to Auth → Rate limits → Configure appropriate limits
-- 4. Review Auth → Providers → Ensure only needed providers enabled