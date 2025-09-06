# 🔒 Supabase Security Fix Ritual

## Overview
This document contains SQL migrations to fix all 9 security warnings and configure RLS policies for the Spiralogic Oracle System.

---

## Part 1: Fix Security Warnings (9 Issues)

### 1. Fix Function Search Path Issues (5 functions)

Run this in the SQL Editor to secure all functions:

```sql
-- Fix search path for all vulnerable functions
ALTER FUNCTION public.set_updated_at() 
  SET search_path = pg_catalog, public
  SECURITY DEFINER;

ALTER FUNCTION public.get_file_stats(user_uuid uuid) 
  SET search_path = pg_catalog, public
  SECURITY DEFINER;

ALTER FUNCTION public.match_file_embeddings(
  user_id uuid,
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter jsonb
) 
  SET search_path = pg_catalog, public
  SECURITY DEFINER;

ALTER FUNCTION public.match_file_chunks(
  user_id uuid,
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter jsonb
) 
  SET search_path = pg_catalog, public
  SECURITY DEFINER;

ALTER FUNCTION public.update_updated_at_column() 
  SET search_path = pg_catalog, public
  SECURITY DEFINER;
```

### 2. Move Extensions to Secure Schema

```sql
-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage to necessary roles
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- Move extensions (if they support it)
-- Note: Some extensions may need to be dropped and recreated
BEGIN;
  -- For http extension
  DROP EXTENSION IF EXISTS http CASCADE;
  CREATE EXTENSION http WITH SCHEMA extensions;
  
  -- For vector extension (pgvector)
  -- Vector extension typically needs to stay in public for RLS
  -- But we can limit its exposure
  REVOKE ALL ON EXTENSION vector FROM PUBLIC;
  GRANT USAGE ON EXTENSION vector TO authenticated, service_role;
COMMIT;
```

### 3. Secure Foreign Tables

```sql
-- Remove public access to Notion foreign table
REVOKE ALL ON FOREIGN TABLE public."Notion" FROM anon, authenticated;

-- Only allow service role access
GRANT SELECT ON FOREIGN TABLE public."Notion" TO service_role;

-- Or move to private schema
CREATE SCHEMA IF NOT EXISTS private;
ALTER FOREIGN TABLE public."Notion" SET SCHEMA private;
```

### 4. Enable Leaked Password Protection

**In Supabase Dashboard:**
1. Go to **Authentication** → **Providers**
2. Click **Email** provider
3. Scroll to **Security**
4. Toggle ON: **Enable leaked password protection**
5. Click **Save**

---

## Part 2: Add RLS Policies (9 Tables)

### Core Tables RLS Policies

```sql
-- ===================================
-- AGENTS TABLE
-- ===================================

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Users can view their own agents
CREATE POLICY "Users can view own agents"
  ON public.agents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own agents  
CREATE POLICY "Users can create own agents"
  ON public.agents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own agents
CREATE POLICY "Users can update own agents"
  ON public.agents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own agents
CREATE POLICY "Users can delete own agents"
  ON public.agents
  FOR DELETE
  USING (auth.uid() = user_id);

-- ===================================
-- ORACLES TABLE
-- ===================================

-- Enable RLS
ALTER TABLE public.oracles ENABLE ROW LEVEL SECURITY;

-- Users can view their own oracle sessions
CREATE POLICY "Users can view own oracle sessions"
  ON public.oracles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create oracle sessions
CREATE POLICY "Users can create oracle sessions"
  ON public.oracles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own oracle sessions
CREATE POLICY "Users can update own oracle sessions"
  ON public.oracles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ===================================
-- KNOWLEDGE_BASE TABLE
-- ===================================

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Users can view their own knowledge
CREATE POLICY "Users can view own knowledge"
  ON public.knowledge_base
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add to their knowledge base
CREATE POLICY "Users can add knowledge"
  ON public.knowledge_base
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own knowledge
CREATE POLICY "Users can update own knowledge"
  ON public.knowledge_base
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own knowledge
CREATE POLICY "Users can delete own knowledge"
  ON public.knowledge_base
  FOR DELETE
  USING (auth.uid() = user_id);

-- ===================================
-- ORACLE_FEEDBACK TABLE
-- ===================================

-- Enable RLS
ALTER TABLE public.oracle_feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON public.oracle_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can submit feedback
CREATE POLICY "Users can submit feedback"
  ON public.oracle_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===================================
-- AGENT_PROMPTS TABLE
-- ===================================

-- Enable RLS
ALTER TABLE public.agent_prompts ENABLE ROW LEVEL SECURITY;

-- Service role only for now (system managed)
CREATE POLICY "Service role full access"
  ON public.agent_prompts
  FOR ALL
  USING (auth.role() = 'service_role');

-- ===================================
-- AGENT_RELATIONS TABLE
-- ===================================

-- Enable RLS
ALTER TABLE public.agent_relations ENABLE ROW LEVEL SECURITY;

-- Service role only (system managed)
CREATE POLICY "Service role full access"
  ON public.agent_relations
  FOR ALL
  USING (auth.role() = 'service_role');

-- ===================================
-- AGENT_WISDOM_EXCHANGES TABLE
-- ===================================

-- Enable RLS
ALTER TABLE public.agent_wisdom_exchanges ENABLE ROW LEVEL SECURITY;

-- Users can view wisdom exchanges for their agents
CREATE POLICY "Users can view agent wisdom exchanges"
  ON public.agent_wisdom_exchanges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_wisdom_exchanges.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- ===================================
-- COLLECTIVE_SALONS TABLE
-- ===================================

-- Enable RLS
ALTER TABLE public.collective_salons ENABLE ROW LEVEL SECURITY;

-- Public read for collective salons (community feature)
CREATE POLICY "Public can view salons"
  ON public.collective_salons
  FOR SELECT
  USING (true);

-- Authenticated users can create salons
CREATE POLICY "Authenticated can create salons"
  ON public.collective_salons
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ===================================
-- META_SYNC_QUEUE TABLE
-- ===================================

-- Enable RLS
ALTER TABLE public.meta_sync_queue ENABLE ROW LEVEL SECURITY;

-- Service role only (system managed)
CREATE POLICY "Service role full access"
  ON public.meta_sync_queue
  FOR ALL
  USING (auth.role() = 'service_role');
```

---

## Part 3: Verification Queries

Run these to verify the fixes:

```sql
-- Check function security
SELECT 
  proname as function_name,
  prosecdef as security_definer,
  proconfig as config
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
AND proname IN ('set_updated_at', 'get_file_stats', 'match_file_embeddings', 'match_file_chunks', 'update_updated_at_column');

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename IN ('agents', 'oracles', 'knowledge_base', 'oracle_feedback', 'agent_prompts', 'agent_relations', 'agent_wisdom_exchanges', 'collective_salons', 'meta_sync_queue')
ORDER BY tablename;

-- Check extension schemas
SELECT 
  extname as extension,
  nspname as schema
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE extname IN ('http', 'vector');
```

---

## Part 4: Quick Rollback (If Needed)

If something breaks, here's how to rollback:

```sql
-- Rollback function changes
ALTER FUNCTION public.set_updated_at() RESET search_path;
ALTER FUNCTION public.set_updated_at() SECURITY INVOKER;

-- Rollback RLS (DANGEROUS - only in emergency)
ALTER TABLE public.agents DISABLE ROW LEVEL SECURITY;
-- Repeat for other tables

-- Drop all policies on a table
DROP POLICY IF EXISTS "Users can view own agents" ON public.agents;
DROP POLICY IF EXISTS "Users can create own agents" ON public.agents;
DROP POLICY IF EXISTS "Users can update own agents" ON public.agents;
DROP POLICY IF EXISTS "Users can delete own agents" ON public.agents;
```

---

## Implementation Order

1. **First**: Fix function search paths (lowest risk)
2. **Second**: Add RLS policies to critical tables (agents, oracles, knowledge_base)
3. **Third**: Move extensions to secure schema (medium risk)
4. **Fourth**: Secure foreign tables (if using)
5. **Last**: Enable leaked password protection in dashboard

---

## Testing After Implementation

```javascript
// Test in your app that authenticated users can:
// 1. Create an agent
const { data, error } = await supabase
  .from('agents')
  .insert({ 
    user_id: user.id,
    name: 'Test Agent',
    // ... other fields
  });

// 2. Read their own data
const { data: myAgents } = await supabase
  .from('agents')
  .select('*')
  .eq('user_id', user.id);

// 3. Cannot read others' data (should return empty)
const { data: othersAgents } = await supabase
  .from('agents')
  .select('*')
  .neq('user_id', user.id);
console.log(othersAgents); // Should be []
```

---

## Notes

- **Service Role Key**: Bypasses RLS - use only in backend, never in frontend
- **Anon Key**: Respects RLS - safe for frontend
- **Test thoroughly**: RLS can lock you out of your own data if misconfigured
- **Backup first**: Export your data before making changes

---

**Last Updated**: 2025-09-05
**Security Level**: Production Ready After Implementation