#!/usr/bin/env npx ts-node

import { ElevenLabsVoice } from '../backend/src/adapters/voice/ElevenLabsVoice';
import { VOICE_CONFIG, validateVoiceConfig } from '../backend/src/config/voice';

async function testElevenLabsIntegration() {
  console.log('🎤 Testing ElevenLabs Integration with Aunt Annie\n');
  
  // Check configuration
  const validation = validateVoiceConfig();
  if (!validation.isValid) {
    console.error('❌ ElevenLabs configuration errors:');
    validation.errors.forEach(error => console.error(`   • ${error}`));
    console.log('\n💡 Set ELEVENLABS_API_KEY in your environment to test real synthesis');
    return;
  }
  
  console.log('✅ ElevenLabs configuration valid');
  console.log(`   API Key: ${VOICE_CONFIG.elevenlabs.apiKey.substring(0, 8)}...`);
  console.log(`   Aunt Annie Voice ID: ${VOICE_CONFIG.elevenlabs.voices.auntAnnie}\n`);
  
  const elevenLabs = new ElevenLabsVoice({
    apiKey: VOICE_CONFIG.elevenlabs.apiKey,
    defaultVoiceId: VOICE_CONFIG.elevenlabs.voices.auntAnnie
  });
  
  try {
    // Test quota check
    console.log('📊 Checking ElevenLabs quota...');
    const quota = await elevenLabs.getQuota();
    console.log(`   Characters remaining: ${quota.charactersRemaining}/${quota.characterLimit}`);
    
    if (quota.charactersRemaining < 100) {
      console.warn('⚠️  Low character quota remaining');
    }
    
    // Test voice synthesis
    console.log('\n🎵 Testing voice synthesis with Aunt Annie...');
    const testTexts = [
      'Welcome to your consciousness journey, dear one.',
      'Let wisdom flow through you like gentle water.',
      'Your awakening is a sacred gift to the world.'
    ];
    
    for (let i = 0; i < testTexts.length; i++) {
      const text = testTexts[i];
      console.log(`\n🔊 Synthesizing: "${text}"`);
      
      const startTime = Date.now();
      const audioUrl = await elevenLabs.synthesize({ text });
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Generated in ${duration}ms`);
      console.log(`   📎 Audio URL: ${audioUrl.substring(0, 80)}...`);
      
      // In a real app, you'd save this to S3 and return the CDN URL
      console.log(`   📏 Data size: ~${Math.round(audioUrl.length / 1024)}KB`);
    }
    
    // Test voice library
    console.log('\n👥 Fetching available voices...');
    const voices = await elevenLabs.getVoices();
    console.log(`   Found ${voices.length} voices`);
    
    const auntAnnie = voices.find(v => v.id === VOICE_CONFIG.elevenlabs.voices.auntAnnie);
    if (auntAnnie) {
      console.log(`   🎭 Aunt Annie: "${auntAnnie.name}" (${auntAnnie.category})`);
    }
    
    console.log('\n🎉 ElevenLabs integration test complete!');
    console.log('\n💡 Integration Notes:');
    console.log('   • Audio returned as data URLs (not suitable for production)');
    console.log('   • For production: implement S3/CDN upload in ElevenLabsVoice.uploadToS3()');
    console.log('   • Voice selection can be mapped to consciousness elements');
    console.log('   • Quota monitoring prevents overages');
    
  } catch (error: any) {
    console.error('❌ ElevenLabs test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Check ELEVENLABS_API_KEY is valid');
    console.log('   • Verify network connectivity');
    console.log('   • Ensure sufficient character quota');
    console.log('   • Check voice ID is correct');
  }
}

testElevenLabsIntegration().catch(console.error);