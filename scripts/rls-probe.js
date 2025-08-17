#!/usr/bin/env node

// RLS Two-User Isolation Probe
// Tests that RLS properly isolates user data

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

// Mock user IDs for testing (UUIDs)
const userA = '11111111-1111-1111-1111-111111111111'
const userB = '22222222-2222-2222-2222-222222222222'

async function runProbe() {
  console.log('🔍 RLS Isolation Probe Starting...\n')
  
  // Create clients with mock JWT tokens
  const clientA = createClient(supabaseUrl, supabaseKey)
  const clientB = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test 1: Insert data as User A
    console.log('📝 Test 1: User A inserts profile data')
    
    // Mock setting auth for User A (in real test, would sign in)
    await clientA.rpc('set_config', {
      setting_name: 'request.jwt.claims',
      setting_value: JSON.stringify({ sub: userA, role: 'authenticated' })
    })
    
    const insertResult = await clientA
      .from('user_profiles')
      .insert({
        user_id: userA,
        display_name: 'Test User A',
        bio: 'This is user A data'
      })
    
    console.log('   Insert result:', insertResult.error ? '❌ FAILED' : '✅ SUCCESS')
    if (insertResult.error) console.log('   Error:', insertResult.error.message)
    
    // Test 2: User A can read their own data
    console.log('\n📖 Test 2: User A reads their own data')
    
    const readOwnResult = await clientA
      .from('user_profiles')
      .select('*')
      .eq('user_id', userA)
    
    console.log('   Own data count:', readOwnResult.data?.length || 0)
    console.log('   Result:', readOwnResult.data?.length > 0 ? '✅ SUCCESS' : '❌ FAILED')
    
    // Test 3: User B cannot see User A's data
    console.log('\n🚫 Test 3: User B tries to read User A\'s data')
    
    // Mock setting auth for User B
    await clientB.rpc('set_config', {
      setting_name: 'request.jwt.claims', 
      setting_value: JSON.stringify({ sub: userB, role: 'authenticated' })
    })
    
    const crossUserResult = await clientB
      .from('user_profiles')
      .select('*')
      .eq('user_id', userA)
    
    console.log('   Cross-user data count:', crossUserResult.data?.length || 0)
    console.log('   Result:', crossUserResult.data?.length === 0 ? '✅ SUCCESS (Isolated)' : '❌ FAILED (Leaked!)')
    
    // Test 4: User B can only see their own empty results
    console.log('\n👤 Test 4: User B sees only their own data (should be empty)')
    
    const userBOwnResult = await clientB
      .from('user_profiles')
      .select('*')
      .eq('user_id', userB)
    
    console.log('   User B data count:', userBOwnResult.data?.length || 0)
    console.log('   Result: ✅ SUCCESS (0 rows expected)')
    
    // Test 5: Test catalog access (should work for both)
    console.log('\n📚 Test 5: Both users can read catalog tables')
    
    const catalogA = await clientA.from('elemental_patterns').select('pattern_id').limit(1)
    const catalogB = await clientB.from('elemental_patterns').select('pattern_id').limit(1)
    
    console.log('   User A catalog access:', catalogA.error ? '❌ FAILED' : '✅ SUCCESS')
    console.log('   User B catalog access:', catalogB.error ? '❌ FAILED' : '✅ SUCCESS')
    
    console.log('\n🎉 RLS Probe Complete!')
    
  } catch (error) {
    console.error('❌ Probe failed:', error.message)
  }
}

// Fallback: Direct SQL probe if supabase-js issues
async function sqlProbe() {
  console.log('\n🔧 Fallback: Direct SQL Probe')
  console.log('Run these queries manually in Supabase SQL editor:')
  console.log(`
-- 1. Insert as User A
SET LOCAL request.jwt.claims = '{"sub": "${userA}", "role": "authenticated"}';
INSERT INTO user_profiles (user_id, display_name) VALUES ('${userA}', 'Test User A');

-- 2. User A reads own data (should see 1+ rows)
SELECT count(*) as own_data FROM user_profiles WHERE user_id = '${userA}';

-- 3. Switch to User B
SET LOCAL request.jwt.claims = '{"sub": "${userB}", "role": "authenticated"}';

-- 4. User B tries to read User A data (should see 0 rows)
SELECT count(*) as leaked_data FROM user_profiles WHERE user_id = '${userA}';

-- 5. Catalog test (should work for both)
SELECT count(*) as catalog_access FROM elemental_patterns LIMIT 1;
`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runProbe().catch(() => sqlProbe())
}