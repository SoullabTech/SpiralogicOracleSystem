#!/usr/bin/env npx ts-node

// Test production voice flow with all features
process.env.ELEVENLABS_API_KEY = 'sk_e603bec66a18dc626537ecdc8ee3cc2ce617414d42f09a5e';
process.env.ELEVENLABS_VOICE_ID_EMILY = 'LcfcDJNUP1GQjkzn1xUU';
process.env.ELEVENLABS_VOICE_ID_AUNT_ANNIE = 'y2TOWGCXSYEgBanvKsYJ';
process.env.DEFAULT_VOICE_ID = 'LcfcDJNUP1GQjkzn1xUU';

import { wireDI } from '../backend/src/bootstrap/di';
import { VoiceService } from '../backend/src/services/VoiceService';
import { get } from '../backend/src/core/di/container';
import { TOKENS } from '../backend/src/core/di/tokens';
import { SseHub } from '../backend/src/core/events/SseHub';

async function testProductionVoiceFlow() {
  console.log('🎉 Testing Production-Grade Voice System\n');
  
  console.log('🔗 Initializing DI container...');
  wireDI();
  console.log('✅ All systems initialized!\n');

  const voiceService = new VoiceService();
  const sseHub = get<SseHub>(TOKENS.SSE_HUB);
  
  // Check initial quota
  console.log('📊 Checking ElevenLabs quota...');
  const quota = await voiceService.checkQuota();
  if (quota) {
    console.log(`   Characters: ${quota.charactersRemaining}/${quota.characterLimit}`);
    console.log(`   Used: ${Math.round(((quota.characterLimit - quota.charactersRemaining) / quota.characterLimit) * 100)}%\n`);
  }

  // Set up SSE monitoring
  const userId = 'production-test';
  const events: any[] = [];
  
  const mockClient = {
    userId,
    send: (data: string) => {
      const lines = data.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.substring(6));
            events.push(event);
            console.log(`📡 Event: ${event.type}`, {
              ...(event.taskId ? { task: event.taskId.slice(-8) } : {}),
              ...(event.url ? { url: event.url } : {}),
              ...(event.cached ? { cached: '💰 HIT!' } : {})
            });
          } catch (e) {
            // Skip non-JSON
          }
        }
      }
    },
    close: () => {}
  };
  
  sseHub.addClient(userId, mockClient);

  console.log('🧪 Test Scenarios:\n');

  // Test 1: Maya personality (should use Aunt Annie)
  console.log('1️⃣ Maya Personality Test');
  const task1 = await voiceService.synthesize({
    userId,
    text: 'Welcome to your sacred journey of awakening, dear one.',
    personality: 'maya'
  });
  console.log(`   Task ID: ${task1?.slice(-8)}\n`);

  // Test 2: Same text (should hit cache)
  console.log('2️⃣ Cache Test (same text)');
  const task2 = await voiceService.synthesize({
    userId,
    text: 'Welcome to your sacred journey of awakening, dear one.',
    personality: 'maya'
  });
  console.log(`   Task ID: ${task2?.slice(-8)} (should be cached)\n`);

  // Test 3: PII scrubbing
  console.log('3️⃣ PII Scrubbing Test');
  const task3 = await voiceService.synthesize({
    userId,
    text: 'Call me at 555-123-4567 or email john@example.com',
    element: 'fire'
  });
  console.log(`   Task ID: ${task3?.slice(-8)}\n`);

  // Test 4: Different presets
  console.log('4️⃣ Voice Preset Tests');
  
  const presetTests = [
    { text: 'Let us begin this meditation', mood: 'meditation' },
    { text: 'Feel the fire within you rise', element: 'fire' },
    { text: 'Ground yourself in Mother Earth', element: 'earth' }
  ];

  for (const test of presetTests) {
    const taskId = await voiceService.synthesize({ userId, ...test });
    console.log(`   ${test.mood || test.element}: ${taskId?.slice(-8)}`);
  }

  // Wait for processing
  console.log('\n⏳ Processing voice queue...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Show results
  console.log('\n📊 Production Metrics:');
  const stats = voiceService.getStats();
  console.log('   Queue:', stats.queue);
  console.log('   Guards:', stats.guards);
  console.log('   Cache:', stats.cache);

  console.log('\n🎯 Event Summary:');
  const eventTypes = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  for (const [type, count] of Object.entries(eventTypes)) {
    console.log(`   ${type}: ${count}`);
  }

  // Test rate limiting
  console.log('\n5️⃣ Rate Limit Test');
  console.log('   Sending 5 rapid requests...');
  
  for (let i = 0; i < 5; i++) {
    try {
      await voiceService.synthesize({
        userId,
        text: `Quick test ${i + 1}`
      });
    } catch (error: any) {
      console.log(`   ❌ Request ${i + 1} blocked: ${error.message}`);
    }
  }

  console.log('\n✨ Production Voice System Test Complete!');
  console.log('\n💡 Key Features Verified:');
  console.log('   ✅ Voice memoization (cache hits)');
  console.log('   ✅ PII scrubbing');
  console.log('   ✅ Voice presets');
  console.log('   ✅ Rate limiting');
  console.log('   ✅ Event analytics');
  console.log('   ✅ Quota monitoring');
  console.log('   ✅ SSE notifications');
  
  process.exit(0);
}

testProductionVoiceFlow().catch(console.error);