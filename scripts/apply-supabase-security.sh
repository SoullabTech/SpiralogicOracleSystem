#!/bin/bash

# Supabase Security Fix Application Script
# This script helps apply security fixes in a controlled manner

SUPABASE_PROJECT_URL="https://jkbetmadzcpoinjogkli.supabase.co"

echo "🔒 Supabase Security Fix Application"
echo "====================================="
echo ""
echo "This script will guide you through applying security fixes."
echo "You'll need to run the SQL commands in the Supabase SQL Editor."
echo ""
echo "Project: $SUPABASE_PROJECT_URL"
echo ""

# Function to prompt user
prompt_continue() {
    read -p "Press Enter to continue or Ctrl+C to abort..."
}

echo "📋 Step 1: Backup Your Data"
echo "----------------------------"
echo "Before applying any fixes, ensure you have a backup."
echo "Go to: $SUPABASE_PROJECT_URL/project/jkbetmadzcpoinjogkli/settings/general"
echo "Click 'Backups' and create a backup if needed."
echo ""
prompt_continue

echo "📋 Step 2: Open SQL Editor"
echo "----------------------------"
echo "Open the SQL Editor at:"
echo "$SUPABASE_PROJECT_URL/project/jkbetmadzcpoinjogkli/sql"
echo ""
prompt_continue

echo "📋 Step 3: Fix Function Search Paths (5 functions)"
echo "----------------------------------------------------"
cat << 'EOF'
Run this SQL to fix function security:

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
EOF
echo ""
echo "Copy and run the above SQL, then check for any errors."
prompt_continue

echo "📋 Step 4: Add RLS to Critical Tables"
echo "---------------------------------------"
echo "Now we'll add Row Level Security to your main tables."
echo "Run each table's RLS policies one at a time:"
echo ""
cat << 'EOF'
-- AGENTS TABLE
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agents"
  ON public.agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agents"
  ON public.agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
  ON public.agents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
  ON public.agents FOR DELETE
  USING (auth.uid() = user_id);
EOF
echo ""
echo "After running the agents table RLS, test that your app still works."
prompt_continue

echo "📋 Step 5: Verify Security Fixes"
echo "----------------------------------"
echo "Run this verification query to check your progress:"
echo ""
cat << 'EOF'
-- Check function security
SELECT 
  proname as function_name,
  prosecdef as security_definer,
  proconfig as config
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
AND proname IN ('set_updated_at', 'get_file_stats', 
                'match_file_embeddings', 'match_file_chunks', 
                'update_updated_at_column');

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename IN ('agents', 'oracles', 'knowledge_base', 
                  'oracle_feedback', 'agent_prompts', 
                  'agent_relations', 'agent_wisdom_exchanges', 
                  'collective_salons', 'meta_sync_queue')
ORDER BY tablename;
EOF
echo ""
prompt_continue

echo "📋 Step 6: Enable Leaked Password Protection"
echo "---------------------------------------------"
echo "In the Supabase Dashboard:"
echo "1. Go to Authentication → Providers"
echo "2. Click Email provider"
echo "3. Scroll to Security"
echo "4. Toggle ON: 'Enable leaked password protection'"
echo "5. Click Save"
echo ""
echo "Dashboard link: $SUPABASE_PROJECT_URL/project/jkbetmadzcpoinjogkli/auth/providers"
echo ""
prompt_continue

echo "📋 Step 7: Test Your Application"
echo "---------------------------------"
echo "After applying fixes, test that your app still works:"
echo ""
echo "1. Start backend: cd backend && npm start"
echo "2. Start frontend: npm run dev"
echo "3. Test user authentication"
echo "4. Test voice features"
echo "5. Check that agents/oracles still load"
echo ""

echo "✅ Security Fix Application Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Monitor your application for any issues"
echo "2. Review remaining tables for RLS policies"
echo "3. Consider moving extensions to 'extensions' schema (optional)"
echo "4. Secure the Notion foreign table (if using)"
echo ""
echo "Full documentation: docs/SUPABASE_SECURITY_FIX.md"