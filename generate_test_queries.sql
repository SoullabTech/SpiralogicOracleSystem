-- =====================================================
-- GENERATE REALISTIC TEST WORKLOAD
-- =====================================================
-- Simulates typical app queries to measure performance
-- Run after performance_optimization.sql
-- =====================================================

-- Test user IDs
\set u1 '11111111-1111-1111-1111-111111111111'
\set u2 '22222222-2222-2222-2222-222222222222'
\set u3 '33333333-3333-3333-3333-333333333333'

-- 1) Create test sessions (if oracle_sessions exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'oracle_sessions'
  ) THEN
    -- Clean up old test data
    DELETE FROM oracle_sessions WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
    
    -- Create test sessions
    INSERT INTO oracle_sessions (id, user_id, created_at) VALUES
      (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', now() - interval '1 hour'),
      (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', now() - interval '30 minutes'),
      (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', now() - interval '45 minutes'),
      (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', now() - interval '15 minutes');
  END IF;
END $$;

-- 2) Create test transcript data
-- Clean up first
DELETE FROM client_session_transcripts WHERE client_id IN (:'u1', :'u2', :'u3');

-- Generate test transcripts with various patterns
INSERT INTO client_session_transcripts (client_id, transcript_content, transcript_metadata, created_at)
SELECT 
  (ARRAY[:'u1', :'u2', :'u3'])[floor(random() * 3 + 1)::int],
  'Sample transcript content ' || generate_series,
  json_build_object('session_type', (ARRAY['oracle', 'guidance', 'reflection'])[floor(random() * 3 + 1)::int]),
  now() - (random() * interval '7 days')
FROM generate_series(1, 100);

-- 3) SIMULATE REALISTIC APP QUERIES
-- These are the queries your app would typically run

-- Simulate user1 session
SELECT set_config('request.jwt.claims', 
  json_build_object('sub', :'u1', 'role', 'authenticated')::text, true);

-- Query 1: List my recent transcripts (common pagination query)
SELECT id, transcript_content, created_at
FROM client_session_transcripts
WHERE client_id = :'u1'
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Query 2: Search my transcripts (if you have text search)
SELECT id, transcript_content, created_at
FROM client_session_transcripts
WHERE client_id = :'u1'
  AND transcript_content ILIKE '%guidance%'
ORDER BY created_at DESC
LIMIT 10;

-- Query 3: Count my transcripts
SELECT COUNT(*) 
FROM client_session_transcripts
WHERE client_id = :'u1';

-- Query 4: Recent transcripts with metadata filter
SELECT id, transcript_content, transcript_metadata, created_at
FROM client_session_transcripts
WHERE client_id = :'u1'
  AND transcript_metadata->>'session_type' = 'oracle'
ORDER BY created_at DESC
LIMIT 10;

-- Simulate user2 session
SELECT set_config('request.jwt.claims', 
  json_build_object('sub', :'u2', 'role', 'authenticated')::text, true);

-- Query 5: User2's recent transcripts (should be isolated)
SELECT id, transcript_content, created_at
FROM client_session_transcripts
WHERE client_id = :'u2'
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Simulate facilitator session (if using facilitator override)
SELECT set_config('request.jwt.claims', 
  json_build_object('sub', :'u3', 'role', 'authenticated', 'app_metadata', json_build_object('facilitator', true))::text, true);

-- Query 6: Facilitator overview (should see all transcripts)
SELECT client_id, COUNT(*) as transcript_count,
       MAX(created_at) as last_activity
FROM client_session_transcripts
GROUP BY client_id
ORDER BY last_activity DESC;

-- Template-C pattern query (if using oracle_sessions join)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'oracle_sessions'
  ) THEN
    -- Set back to user1
    PERFORM set_config('request.jwt.claims', 
      json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'role', 'authenticated')::text, true);
    
    -- Query 7: Join pattern (session-based access)
    PERFORM id, transcript_content, t.created_at
    FROM client_session_transcripts t
    JOIN oracle_sessions s ON t.session_id = s.id
    WHERE s.user_id = '11111111-1111-1111-1111-111111111111'::uuid
    ORDER BY t.created_at DESC
    LIMIT 10;
  END IF;
END $$;

SELECT 'Test workload generated successfully!' as status;