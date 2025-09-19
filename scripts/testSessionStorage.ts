#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { sessionStorage } from '../lib/services/sessionStorage';
import { betaAnalytics } from '../lib/services/betaAnalytics';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testSessionStorage() {
  console.log('🧪 Testing Session Storage Connection...\n');

  // Test 1: Connection
  console.log('1️⃣ Testing Supabase connection...');
  const isConnected = await sessionStorage.testConnection();
  console.log(`   Status: ${isConnected ? '✅ Connected' : '❌ Not connected'}`);

  if (!isConnected) {
    console.log('\n⚠️  Session storage is not connected.');
    console.log('   Please ensure the following environment variables are set:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  // Test 2: Store a test session
  console.log('\n2️⃣ Testing session storage...');
  const testSession = {
    sessionId: `test-${Date.now()}`,
    timestamp: new Date().toISOString(),
    elementalBalance: {
      fire: 0.3,
      water: 0.2,
      earth: 0.2,
      air: 0.2,
      aether: 0.1
    },
    spiralStage: {
      element: 'fire',
      stage: 2
    },
    reflection: 'What patterns are emerging in your journey?',
    practice: 'Observe your breath for one minute',
    archetype: 'The Phoenix rising'
  };

  const result = await sessionStorage.storeSession(
    'test-user-123',
    'How can I transform my challenges into growth?',
    testSession,
    {
      mode: 'beta-test',
      metadata: {
        test: true,
        version: 'test-1.0'
      }
    }
  );

  console.log(`   Storage result: ${result.success ? '✅ Success' : '❌ Failed'}`);
  if (!result.success) {
    console.log(`   Error: ${result.error}`);
    return;
  }
  console.log(`   Session ID: ${result.sessionId}`);

  // Test 3: Retrieve the session
  console.log('\n3️⃣ Testing session retrieval...');
  const retrieved = await sessionStorage.getSession(testSession.sessionId);
  console.log(`   Retrieval: ${retrieved ? '✅ Success' : '❌ Failed'}`);
  if (retrieved) {
    console.log(`   Session found: ${retrieved.session_id}`);
    console.log(`   Query: ${retrieved.query}`);
    console.log(`   Reflection: ${retrieved.reflection}`);
  }

  // Test 4: Get user sessions
  console.log('\n4️⃣ Testing user session history...');
  const userSessions = await sessionStorage.getUserSessions('test-user-123', 5);
  console.log(`   Found ${userSessions.length} session(s)`);
  userSessions.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.session_id} - ${new Date(s.created_at || '').toLocaleDateString()}`);
  });

  // Test 5: Analytics
  console.log('\n5️⃣ Testing session analytics...');
  const analytics = await sessionStorage.getSessionAnalytics('test-user-123');
  if (analytics) {
    console.log(`   Total sessions: ${analytics.totalSessions}`);
    console.log(`   Elemental tendencies:`, analytics.elementalTendencies);
    console.log(`   Spiral journey:`, analytics.spiralJourney);
  } else {
    console.log('   No analytics available');
  }

  // Test 6: Beta analytics
  console.log('\n6️⃣ Testing beta analytics...');
  const journey = await betaAnalytics.trackUserJourney('test-user-123');
  if (journey) {
    console.log(`   User journey tracked`);
    console.log(`   Dominant element: ${journey.insights.dominantElement}`);
    console.log(`   Current stage: ${journey.insights.currentStage}`);
    console.log(`   Growth pattern: ${journey.insights.growthPattern}`);
  }

  console.log('\n✅ All tests completed!');
  console.log('\n📊 Session storage is ready for beta testing.');
  console.log('   Sessions will be automatically collected when users interact with the Oracle.');
}

// Run the test
testSessionStorage().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});