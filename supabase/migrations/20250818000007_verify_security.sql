-- =====================================================
-- SECURITY VERIFICATION SCRIPT
-- =====================================================
-- Verifies that security hardening was applied correctly
-- Run after: 20250818000006_security_hardening.sql
-- =====================================================

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

SELECT '=== EXTENSION SECURITY AUDIT ===' as audit_section;

-- 1) Check extension schemas (http should be in private, vector location noted)
SELECT 
  extname as extension_name,
  n.nspname as schema_location,
  CASE 
    WHEN extname = 'http' AND n.nspname = 'private' THEN '✅ SECURE'
    WHEN extname = 'http' AND n.nspname = 'public' THEN '❌ RISK - HTTP in public'
    WHEN extname = 'vector' AND n.nspname = 'public' THEN '⚠️ ACCEPTABLE - Vector in public'
    WHEN extname = 'vector' AND n.nspname = 'private' THEN '✅ EXTRA SECURE - Vector in private'
    ELSE '✅ OK'
  END as security_status
FROM pg_extension e 
JOIN pg_namespace n ON n.oid = e.extnamespace
WHERE extname IN ('http', 'vector')
ORDER BY extname;

SELECT '=== FOREIGN TABLE SECURITY AUDIT ===' as audit_section;

-- 2) Check foreign table locations (all should be in private)
SELECT 
  table_schema,
  table_name,
  table_type,
  CASE 
    WHEN table_schema = 'private' THEN '✅ SECURE - In private schema'
    WHEN table_schema = 'public' THEN '❌ RISK - Still in public'
    ELSE '⚠️ UNKNOWN SCHEMA'
  END as security_status
FROM information_schema.tables
WHERE table_type = 'FOREIGN TABLE'
ORDER BY table_schema, table_name;

SELECT '=== SCHEMA PERMISSIONS AUDIT ===' as audit_section;

-- 3) Test API role permissions on private schema
DO $$
DECLARE
  anon_access boolean;
  auth_access boolean;
BEGIN
  -- Test anon role
  SET ROLE anon;
  SELECT has_schema_privilege('private', 'USAGE') INTO anon_access;
  RESET ROLE;
  
  -- Test authenticated role  
  SET ROLE authenticated;
  SELECT has_schema_privilege('private', 'USAGE') INTO auth_access;
  RESET ROLE;
  
  RAISE NOTICE '=== PRIVATE SCHEMA ACCESS TEST ===';
  RAISE NOTICE 'anon role can access private schema: % %', 
    anon_access, 
    CASE WHEN anon_access THEN '❌ SECURITY RISK' ELSE '✅ BLOCKED' END;
  RAISE NOTICE 'authenticated role can access private schema: % %', 
    auth_access,
    CASE WHEN auth_access THEN '❌ SECURITY RISK' ELSE '✅ BLOCKED' END;
END $$;

SELECT '=== RPC FUNCTIONS AUDIT ===' as audit_section;

-- 4) Check controlled RPC functions exist and have proper permissions
SELECT 
  p.proname as function_name,
  n.nspname as schema_name,
  p.prosecdef as is_security_definer,
  CASE 
    WHEN p.prosecdef THEN '✅ SECURITY DEFINER'
    ELSE '⚠️ Not security definer'
  END as security_mode,
  pg_get_userbyid(p.proowner) as function_owner
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' 
  AND p.proname LIKE '%notion%'
ORDER BY p.proname;

SELECT '=== FUNCTION PERMISSIONS TEST ===' as audit_section;

-- 5) Test function permissions for different roles
DO $$
DECLARE
  anon_can_execute boolean := false;
  auth_can_execute boolean := false;
BEGIN
  -- Test anon role access to notion function
  BEGIN
    SET ROLE anon;
    PERFORM has_function_privilege('public.notion_data_read(integer)', 'EXECUTE');
    SELECT has_function_privilege('public.notion_data_read(integer)', 'EXECUTE') INTO anon_can_execute;
    RESET ROLE;
  EXCEPTION WHEN others THEN
    RESET ROLE;
    anon_can_execute := false;
  END;
  
  -- Test authenticated role access
  BEGIN
    SET ROLE authenticated;
    SELECT has_function_privilege('public.notion_data_read(integer)', 'EXECUTE') INTO auth_can_execute;
    RESET ROLE;
  EXCEPTION WHEN others THEN
    RESET ROLE;
    auth_can_execute := false;
  END;
  
  RAISE NOTICE '=== FUNCTION PERMISSION TEST ===';
  RAISE NOTICE 'anon can execute notion_data_read: % %',
    anon_can_execute,
    CASE WHEN anon_can_execute THEN '❌ SECURITY RISK' ELSE '✅ BLOCKED' END;
  RAISE NOTICE 'authenticated can execute notion_data_read: % %',
    auth_can_execute,
    CASE WHEN auth_can_execute THEN '✅ CORRECT ACCESS' ELSE '⚠️ NO ACCESS' END;
END $$;

SELECT '=== SECURITY AUDIT LOG ===' as audit_section;

-- 6) Show security audit trail
SELECT 
  event_type,
  event_details->>'migration' as migration_file,
  applied_at,
  applied_by
FROM public.security_audit
WHERE event_type = 'security_hardening'
ORDER BY applied_at DESC
LIMIT 5;

SELECT '=== SECURITY SUMMARY ===' as audit_section;

-- 7) Overall security summary
WITH security_summary AS (
  SELECT 
    'Extensions' as category,
    COUNT(*) FILTER (WHERE n.nspname = 'private' AND extname = 'http') as secured_count,
    COUNT(*) FILTER (WHERE n.nspname = 'public' AND extname = 'http') as risk_count
  FROM pg_extension e 
  JOIN pg_namespace n ON n.oid = e.extnamespace
  WHERE extname = 'http'
  
  UNION ALL
  
  SELECT 
    'Foreign Tables' as category,
    COUNT(*) FILTER (WHERE table_schema = 'private') as secured_count,
    COUNT(*) FILTER (WHERE table_schema = 'public') as risk_count
  FROM information_schema.tables
  WHERE table_type = 'FOREIGN TABLE'
)
SELECT 
  category,
  secured_count,
  risk_count,
  CASE 
    WHEN risk_count = 0 THEN '✅ ALL SECURE'
    ELSE '❌ ' || risk_count || ' ITEMS AT RISK'
  END as status
FROM security_summary;