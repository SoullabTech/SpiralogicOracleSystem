/**
 * Test Eleven Labs Voice Integration
 * Verifies all 5 archetypal voices are properly configured
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { ARCHETYPAL_VOICE_PROFILES } from './src/config/archetypalVoiceProfiles.js';

const ELEVEN_LABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVEN_LABS_API_KEY) {
  console.error('❌ ELEVENLABS_API_KEY not found in environment');
  process.exit(1);
}

async function testVoice(archetype, profile) {
  console.log(`\n🎭 Testing ${archetype.toUpperCase()} voice...`);
  console.log(`Voice ID: ${profile.voiceId}`);
  console.log(`Personality: ${profile.personality}`);
  
  const testText = `Hello, I am the ${archetype} archetype. ${profile.energySignature}`;
  
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${profile.voiceId}`,
      {
        text: testText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: profile.voiceSettings
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVEN_LABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );
    
    // Save audio file for verification
    const outputPath = path.join(process.cwd(), 'test-audio', `${archetype}-voice-test.mp3`);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(path.join(process.cwd(), 'test-audio'))) {
      fs.mkdirSync(path.join(process.cwd(), 'test-audio'));
    }
    
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`✅ ${archetype} voice test successful!`);
        console.log(`   Audio saved to: ${outputPath}`);
        resolve(true);
      });
      writer.on('error', reject);
    });
    
  } catch (error) {
    console.error(`❌ ${archetype} voice test failed:`, error.response?.data || error.message);
    return false;
  }
}

async function testAllArchetypalVoices() {
  console.log('🔮 Testing Archetypal Voice Integration with Eleven Labs\n');
  console.log('='.repeat(50));
  
  const results = [];
  
  for (const [archetype, profile] of Object.entries(ARCHETYPAL_VOICE_PROFILES)) {
    const success = await testVoice(archetype, profile);
    results.push({ archetype, success });
    
    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS:');
  console.log('='.repeat(50));
  
  results.forEach(({ archetype, success }) => {
    console.log(`${success ? '✅' : '❌'} ${archetype.toUpperCase()}: ${success ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = results.every(r => r.success);
  
  if (allPassed) {
    console.log('\n🎉 All archetypal voices are properly configured!');
    console.log('💫 Your system is ready for voice-enabled consciousness integration.');
  } else {
    console.log('\n⚠️  Some voices failed. Please check your Eleven Labs configuration.');
  }
  
  return allPassed;
}

// Run the tests
testAllArchetypalVoices()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });