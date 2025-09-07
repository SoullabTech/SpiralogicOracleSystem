-- ============================================
-- CRITICAL SUPABASE SECURITY FIXES - PHASE 1
-- Apply these first to fix the most important warnings
-- ============================================

-- ============================================
-- PART 1: Fix Function Security (5 functions)
-- These are flagged as security risks
-- ============================================

-- Fix search path vulnerability in set_updated_at
ALTER FUNCTION public.set_updated_at() 
  SET search_path = pg_catalog, public
  SECURITY DEFINER;

-- Fix search path vulnerability in get_file_stats
ALTER FUNCTION public.get_file_stats(user_uuid uuid) 
  SET search_path = pg_catalog, public
  SECURITY DEFINER;

-- Fix search path vulnerability in match_file_embeddings
ALTER FUNCTION public.match_file_embeddings(
  user_id uuid,
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter jsonb
) 
  SET search_path = pg_catalog, public
  SECURITY DEFINER;

-- Fix search path vulnerability in match_file_chunks
ALTER FUNCTION public.match_file_chunks(
  user_id uuid,
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter jsonb
) 
  SET search_path = pg_catalog, public
  SECURITY DEFINER;

-- Fix search path vulnerability in update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() 
  SET search_path = pg_catalog, public
  SECURITY DEFINER;

-- ============================================
-- PART 2: Enable RLS on Critical User Tables
-- Start with the most important tables
-- ============================================

-- AGENTS TABLE - Users' AI agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own agents
CREATE POLICY "Users can view own agents"
  ON public.agents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own agents
CREATE POLICY "Users can create own agents"
  ON public.agents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own agents
CREATE POLICY "Users can update own agents"
  ON public.agents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete only their own agents
CREATE POLICY "Users can delete own agents"
  ON public.agents
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ORACLES TABLE - Oracle sessions
-- ============================================

ALTER TABLE public.oracles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own oracle sessions"
  ON public.oracles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create oracle sessions"
  ON public.oracles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own oracle sessions"
  ON public.oracles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- KNOWLEDGE_BASE TABLE - User knowledge
-- ============================================

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own knowledge"
  ON public.knowledge_base
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add knowledge"
  ON public.knowledge_base
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge"
  ON public.knowledge_base
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge"
  ON public.knowledge_base
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- VERIFICATION QUERY
-- Run this to check if fixes were applied
-- ============================================

/*
Run this separately to verify:

SELECT 
  'Functions Fixed:' as check_type,
  COUNT(*) as fixed_count,
  5 as expected
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
AND proname IN ('set_updated_at', 'get_file_stats', 'match_file_embeddings', 
                'match_file_chunks', 'update_updated_at_column')
AND prosecdef = true
AND proconfig IS NOT NULL

UNION ALL

SELECT 
  'RLS Enabled Tables:' as check_type,
  COUNT(*) as fixed_count,
  3 as expected
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('agents', 'oracles', 'knowledge_base')
AND rowsecurity = true;
*/