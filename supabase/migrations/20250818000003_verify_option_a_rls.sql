-- =====================================================
-- VERIFICATION SCRIPT FOR CLIENT_SESSION_TRANSCRIPTS OPTION A
-- =====================================================
-- Test client_id = auth.uid() RLS policies
-- Run after: 20250818000002_client_transcripts_option_a.sql
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  u1 uuid := '11111111-1111-1111-1111-111111111111';
  u2 uuid := '22222222-2222-2222-2222-222222222222';
  test_result int;
  rls_status text;
BEGIN
  RAISE NOTICE '=== CLIENT_SESSION_TRANSCRIPTS OPTION A VERIFICATION ===';
  
  -- 1) Verify table exists and RLS is enabled
  RAISE NOTICE '✅ Checking table and RLS status...';
  
  PERFORM 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'client_session_transcripts';
  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ client_session_transcripts table missing';
  END IF;
  
  SELECT CASE WHEN relrowsecurity THEN 'ON' ELSE 'OFF' END INTO rls_status
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND relname='client_session_transcripts';
  
  IF rls_status != 'ON' THEN
    RAISE EXCEPTION '❌ RLS not enabled on client_session_transcripts';
  END IF;
  
  RAISE NOTICE '✅ RLS Status: %', rls_status;
  
  -- 2) Verify policies exist
  RAISE NOTICE '✅ Checking policies exist...';
  
  PERFORM 1 FROM pg_policies 
  WHERE schemaname='public' 
    AND tablename='client_session_transcripts'
    AND policyname='client_session_transcripts_select_self';
  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ SELECT policy missing';
  END IF;
  
  PERFORM 1 FROM pg_policies 
  WHERE schemaname='public' 
    AND tablename='client_session_transcripts'
    AND policyname='client_session_transcripts_insert_self';
  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ INSERT policy missing';
  END IF;
  
  -- 3) Clean up any existing test data
  DELETE FROM public.client_session_transcripts WHERE client_id IN (u1, u2);
  
  -- 4) Test as user1: insert transcript
  RAISE NOTICE '✅ Testing user1 operations...';
  
  -- Simulate user1 JWT
  PERFORM set_config('request.jwt.claims', 
    json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  
  -- Should succeed
  INSERT INTO public.client_session_transcripts (client_id, transcript_content)
  VALUES (u1, 'User1 transcript - own data');
  
  -- Should see only their transcript
  SELECT COUNT(*) INTO test_result
  FROM public.client_session_transcripts;
  
  IF test_result != 1 THEN
    RAISE EXCEPTION '❌ User1 should see exactly 1 transcript, saw: %', test_result;
  END IF;
  
  RAISE NOTICE '✅ User1 sees their transcript: % rows', test_result;
  
  -- 5) Test as user2: should NOT see user1's transcript
  RAISE NOTICE '✅ Testing user2 isolation...';
  
  -- Simulate user2 JWT
  PERFORM set_config('request.jwt.claims', 
    json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  
  -- Should see nothing
  SELECT COUNT(*) INTO test_result
  FROM public.client_session_transcripts;
  
  IF test_result != 0 THEN
    RAISE EXCEPTION '❌ User2 should see 0 transcripts, saw: %', test_result;
  END IF;
  
  RAISE NOTICE '✅ User2 isolation verified: % rows (correct)', test_result;
  
  -- 6) Test user2 can insert their own data
  RAISE NOTICE '✅ Testing user2 can insert own data...';
  
  INSERT INTO public.client_session_transcripts (client_id, transcript_content)
  VALUES (u2, 'User2 transcript - own data');
  
  SELECT COUNT(*) INTO test_result
  FROM public.client_session_transcripts;
  
  IF test_result != 1 THEN
    RAISE EXCEPTION '❌ User2 should see exactly 1 transcript (their own), saw: %', test_result;
  END IF;
  
  RAISE NOTICE '✅ User2 can create and see their own data: % rows', test_result;
  
  -- 7) Test cross-tenant insert (should fail)
  BEGIN
    INSERT INTO public.client_session_transcripts (client_id, transcript_content)
    VALUES (u1, 'User2 trying to impersonate user1');
    RAISE EXCEPTION '❌ Cross-tenant insert should have failed!';
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN
    RAISE NOTICE '✅ Cross-tenant insert properly blocked';
  END;
  
  -- 8) Verify both users see only their own data
  RAISE NOTICE '✅ Final isolation check...';
  
  -- Back to user1
  PERFORM set_config('request.jwt.claims', 
    json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  
  SELECT COUNT(*) INTO test_result
  FROM public.client_session_transcripts;
  
  IF test_result != 1 THEN
    RAISE EXCEPTION '❌ User1 should still see exactly 1 transcript, saw: %', test_result;
  END IF;
  
  -- Back to user2
  PERFORM set_config('request.jwt.claims', 
    json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  
  SELECT COUNT(*) INTO test_result
  FROM public.client_session_transcripts;
  
  IF test_result != 1 THEN
    RAISE EXCEPTION '❌ User2 should still see exactly 1 transcript, saw: %', test_result;
  END IF;
  
  -- Cleanup
  DELETE FROM public.client_session_transcripts WHERE client_id IN (u1, u2);
  
  RAISE NOTICE '🎉 ALL TESTS PASSED - OPTION A RLS WORKING CORRECTLY!';
  RAISE NOTICE '✅ Direct ownership: client_id = auth.uid()';
  RAISE NOTICE '✅ Perfect tenant isolation verified';
  
END;
$$;