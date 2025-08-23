-- =====================================================
-- VERIFICATION SCRIPT FOR CLIENT_SESSION_TRANSCRIPTS RLS
-- =====================================================
-- Paste-and-run verification for session-scoped privacy
-- Run after: 20250818000000_fix_transcript_schema.sql
-- =====================================================

-- 🔍 PASTE-AND-RUN VERIFICATION (psql)
-- docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d postgres

DO $$
DECLARE
  u1 uuid := '11111111-1111-1111-1111-111111111111';
  u2 uuid := '22222222-2222-2222-2222-222222222222';
  s1 uuid;
  s2 uuid;
  test_result text;
BEGIN
  RAISE NOTICE '=== CLIENT_SESSION_TRANSCRIPTS RLS VERIFICATION ===';
  
  -- 0) Confirm table shapes
  RAISE NOTICE '✅ Checking table structures...';
  
  PERFORM 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'oracle_sessions';
  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ oracle_sessions table missing';
  END IF;
  
  PERFORM 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'client_session_transcripts';
  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ client_session_transcripts table missing';
  END IF;
  
  -- 1) Verify RLS is ON
  RAISE NOTICE '✅ Checking RLS status...';
  
  SELECT CASE WHEN relrowsecurity THEN 'ON' ELSE 'OFF' END INTO test_result
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND relname='client_session_transcripts';
  
  IF test_result != 'ON' THEN
    RAISE EXCEPTION '❌ RLS not enabled on client_session_transcripts';
  END IF;
  
  RAISE NOTICE '✅ RLS Status: %', test_result;
  
  -- 2) Verify policies exist
  RAISE NOTICE '✅ Checking policies...';
  
  PERFORM 1 FROM pg_policies 
  WHERE schemaname='public' 
    AND tablename='client_session_transcripts'
    AND policyname='client_session_transcripts_select_self';
  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ SELECT policy missing';
  END IF;
  
  -- 3) Clean up any existing test data
  DELETE FROM public.client_session_transcripts WHERE session_id IN (
    SELECT id FROM public.oracle_sessions WHERE user_id IN (u1, u2)
  );
  DELETE FROM public.oracle_sessions WHERE user_id IN (u1, u2);
  
  -- 4) Create test sessions
  RAISE NOTICE '✅ Creating test sessions...';
  
  INSERT INTO public.oracle_sessions (id, user_id, created_at)
  VALUES (gen_random_uuid(), u1, now()),
         (gen_random_uuid(), u2, now());
  
  SELECT id INTO s1 FROM public.oracle_sessions WHERE user_id = u1;
  SELECT id INTO s2 FROM public.oracle_sessions WHERE user_id = u2;
  
  RAISE NOTICE '✅ User1 session: %', s1;
  RAISE NOTICE '✅ User2 session: %', s2;
  
  -- 5) Test as user1: insert transcript
  RAISE NOTICE '✅ Testing user1 operations...';
  
  -- Simulate user1 JWT
  PERFORM set_config('request.jwt.claims', 
    json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  
  -- Should succeed
  INSERT INTO public.client_session_transcripts (session_id, transcript_text)
  VALUES (s1, 'User1 transcript in their own session');
  
  -- Should see only their transcript
  SELECT COUNT(*) INTO test_result::int
  FROM public.client_session_transcripts;
  
  IF test_result::int != 1 THEN
    RAISE EXCEPTION '❌ User1 should see exactly 1 transcript, saw: %', test_result;
  END IF;
  
  RAISE NOTICE '✅ User1 sees their transcript: % rows', test_result;
  
  -- 6) Test as user2: should NOT see user1's transcript
  RAISE NOTICE '✅ Testing user2 isolation...';
  
  -- Simulate user2 JWT
  PERFORM set_config('request.jwt.claims', 
    json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  
  -- Should see nothing
  SELECT COUNT(*) INTO test_result::int
  FROM public.client_session_transcripts;
  
  IF test_result::int != 0 THEN
    RAISE EXCEPTION '❌ User2 should see 0 transcripts, saw: %', test_result;
  END IF;
  
  RAISE NOTICE '✅ User2 isolation verified: % rows (correct)', test_result;
  
  -- 7) Test cross-tenant insert (should fail)
  BEGIN
    INSERT INTO public.client_session_transcripts (session_id, transcript_text)
    VALUES (s1, 'User2 trying to hack user1 session');
    RAISE EXCEPTION '❌ Cross-tenant insert should have failed!';
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN
    RAISE NOTICE '✅ Cross-tenant insert properly blocked';
  END;
  
  -- 8) Test facilitator read-only access
  RAISE NOTICE '✅ Testing facilitator oversight...';
  
  -- Simulate facilitator JWT
  PERFORM set_config('request.jwt.claims', 
    json_build_object('sub', u2, 'role', 'authenticated', 'facilitator', true)::text, true);
  
  -- Should see all transcripts now
  SELECT COUNT(*) INTO test_result::int
  FROM public.client_session_transcripts;
  
  IF test_result::int != 1 THEN
    RAISE EXCEPTION '❌ Facilitator should see all transcripts, saw: %', test_result;
  END IF;
  
  RAISE NOTICE '✅ Facilitator oversight verified: % rows', test_result;
  
  -- 9) Test facilitator write restrictions (should fail)
  BEGIN
    UPDATE public.client_session_transcripts 
    SET transcript_text = '[edited by facilitator]'
    WHERE session_id = s1;
    RAISE EXCEPTION '❌ Facilitator UPDATE should have failed (read-only oversight)!';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '✅ Facilitator write restrictions verified (read-only)';
  END;
  
  -- Cleanup
  DELETE FROM public.client_session_transcripts WHERE session_id IN (s1, s2);
  DELETE FROM public.oracle_sessions WHERE id IN (s1, s2);
  
  RAISE NOTICE '🎉 ALL TESTS PASSED - RLS working correctly!';
  RAISE NOTICE '✅ Template C pattern: Session-scoped privacy with facilitator read-only oversight';
  
END;
$$;