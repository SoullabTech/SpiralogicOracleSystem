/**
 * Test Session Memory Indicators
 * Tests the memory indicator system end-to-end
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Verify env vars are loaded
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Loaded' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Loaded' : '❌ Missing');

import { UserMemoryService } from './src/services/UserMemoryService.js';

const TEST_USER_ID = 'test-user-' + Date.now();

async function testMemoryIndicators() {
  console.log('\n🧪 Testing Session Memory Indicators\n');
  console.log('━'.repeat(50));

  try {
    // Test 1: New user should have no indicators
    console.log('\n📝 Test 1: New user (no indicators expected)');
    let indicators = await UserMemoryService.getSessionIndicators(TEST_USER_ID);
    console.log('Result:', indicators.length === 0 ? '✅ No indicators' : '❌ Unexpected indicators');
    console.log('Indicators:', JSON.stringify(indicators, null, 2));

    // Test 2: Add some session history
    console.log('\n📝 Test 2: Adding session history');
    await UserMemoryService.saveSessionSummary(TEST_USER_ID, 'fire', 'initiation');
    await new Promise(resolve => setTimeout(resolve, 100));
    await UserMemoryService.saveSessionSummary(TEST_USER_ID, 'fire', 'challenge');
    await new Promise(resolve => setTimeout(resolve, 100));
    await UserMemoryService.saveSessionSummary(TEST_USER_ID, 'water', 'challenge');
    console.log('✅ Added 3 sessions');

    // Test 3: Check indicators with history
    console.log('\n📝 Test 3: Checking indicators with history');
    indicators = await UserMemoryService.getSessionIndicators(TEST_USER_ID);
    console.log('Found indicators:', indicators.length);
    indicators.forEach(ind => {
      console.log(`  - Type: ${ind.type}, Content: ${ind.content}, Sessions: ${ind.sessionCount}, Confidence: ${ind.confidence}`);
    });

    // Test 4: Check element dominance
    const elementIndicator = indicators.find(i => i.type === 'element');
    if (elementIndicator) {
      console.log('\n✅ Element indicator found:', elementIndicator.content);
      console.log('   Expected: fire (2 sessions)');
    } else {
      console.log('\n⚠️ No element indicator found (expected fire)');
    }

    // Test 5: Check phase consistency
    const phaseIndicator = indicators.find(i => i.type === 'phase');
    if (phaseIndicator) {
      console.log('\n✅ Phase indicator found:', phaseIndicator.content);
      console.log('   Expected: challenge (2 sessions)');
    } else {
      console.log('\n⚠️ No phase indicator found (expected challenge)');
    }

    console.log('\n' + '━'.repeat(50));
    console.log('✨ Session Memory Indicators test complete!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test
testMemoryIndicators().catch(console.error);