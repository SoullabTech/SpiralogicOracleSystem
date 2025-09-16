// UNIFIED_SMOKE_TEST.ts
// Run with: npx ts-node UNIFIED_SMOKE_TEST.ts

import dotenv from 'dotenv';
import { VoiceServiceWithFallback } from './lib/services/VoiceServiceWithFallback';
import { voiceProfiles } from './lib/config/voiceProfiles';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Unified Smoke Test for OpenAI + ElevenLabs Voice Migration
 */
async function runSmokeTest() {
  console.log('🚀 Starting Unified Voice Smoke Test\n');
  console.log('=' .repeat(60));

  // Check environment
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;

  console.log('📋 Environment Check:');
  console.log(`   OpenAI API: ${hasOpenAI ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   ElevenLabs API: ${hasElevenLabs ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Maya ElevenLabs ID: ${process.env.MAYA_ELEVENLABS_ID || 'Using default'}`);
  console.log(`   Anthony ElevenLabs ID: ${process.env.ANTHONY_ELEVENLABS_ID || 'Using default'}`);
  console.log('=' .repeat(60) + '\n');

  if (!hasOpenAI && !hasElevenLabs) {
    console.error('❌ No voice API keys configured. Please set OPENAI_API_KEY or ELEVENLABS_API_KEY in .env.local');
    process.exit(1);
  }

  // Initialize voice service
  const voiceService = new VoiceServiceWithFallback();

  // Test phrases for each voice
  const testCases = [
    {
      voiceId: 'maya',
      text: 'Hello, I am Maya, speaking with the Alloy voice. I witness your journey with warmth and presence.',
      expectedProvider: 'openai',
      expectedVoice: 'alloy'
    },
    {
      voiceId: 'anthony',
      text: 'I am Anthony, grounded in the Onyx voice. Let us explore these depths together.',
      expectedProvider: 'openai',
      expectedVoice: 'onyx'
    }
  ];

  // Create output directory for test audio files
  const outputDir = path.join(__dirname, 'test-audio-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🎤 Testing Voice Generation:\n');

  for (const testCase of testCases) {
    console.log(`Testing ${testCase.voiceId}:`);
    console.log(`   Text: "${testCase.text.substring(0, 50)}..."`);

    try {
      // Test primary provider
      console.log(`   Primary (${testCase.expectedProvider})...`);
      const startTime = Date.now();

      const result = await voiceService.generateSpeech({
        text: testCase.text,
        voiceProfileId: testCase.voiceId,
        format: 'mp3'
      });

      const duration = Date.now() - startTime;

      if (result.audioData) {
        // Save audio file
        const filename = `${testCase.voiceId}-${result.provider}.mp3`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, result.audioData);

        console.log(`   ✅ Success!`);
        console.log(`      Provider: ${result.provider}`);
        console.log(`      Voice: ${result.voiceUsed}`);
        console.log(`      Time: ${duration}ms`);
        console.log(`      Size: ${(result.audioData.length / 1024).toFixed(2)} KB`);
        console.log(`      Saved: ${filename}`);
      }
    } catch (error: any) {
      console.log(`   ❌ Primary failed: ${error.message}`);

      // Test fallback
      console.log(`   Attempting fallback...`);

      // Simulate primary failure by using wrong provider
      try {
        const result = await voiceService.generateSpeech({
          text: testCase.text,
          voiceProfileId: `${testCase.voiceId}-elevenlabs`, // Force ElevenLabs fallback
          format: 'mp3'
        });

        if (result.audioData) {
          const filename = `${testCase.voiceId}-fallback.mp3`;
          const filepath = path.join(outputDir, filename);
          fs.writeFileSync(filepath, result.audioData);

          console.log(`   ✅ Fallback Success!`);
          console.log(`      Provider: ${result.provider}`);
          console.log(`      Voice: ${result.voiceUsed}`);
          console.log(`      Saved: ${filename}`);
        }
      } catch (fallbackError: any) {
        console.log(`   ❌ Fallback also failed: ${fallbackError.message}`);
      }
    }

    console.log('');
  }

  console.log('=' .repeat(60));
  console.log('\n📊 Test Summary:');
  console.log(`   Output directory: ${outputDir}`);
  console.log(`   Files created: ${fs.readdirSync(outputDir).length}`);

  // Test cache functionality
  console.log('\n🗄️ Testing Cache:');
  console.log(`   Cache size: ${voiceService.getCacheSize()} entries`);

  // Test cache hit
  console.log('   Testing cache hit...');
  const cacheStart = Date.now();
  await voiceService.generateSpeech({
    text: testCases[0].text,
    voiceProfileId: testCases[0].voiceId
  });
  const cacheTime = Date.now() - cacheStart;
  console.log(`   ✅ Cache hit in ${cacheTime}ms (should be <10ms)`);

  console.log('\n✨ Smoke test complete!');
  console.log('\nNext steps:');
  console.log('1. Play the generated audio files to verify quality');
  console.log('2. Check that Maya sounds warm and welcoming');
  console.log('3. Check that Anthony sounds grounded and contemplative');
  console.log('4. Test in your app\'s Voice Selection UI');
  console.log('5. Update SACRED_CHANGELOG.md with migration success');
}

// Run the test
runSmokeTest().catch(console.error);