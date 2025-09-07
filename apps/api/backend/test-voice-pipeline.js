#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';
const SESAME_URL = process.env.SESAME_URL || 'http://localhost:8000';

async function testVoicePipeline() {
  console.log('🎯 Testing Voice Pipeline Components\n');
  console.log('=' + '='.repeat(50));
  
  // Test 1: Sesame Direct TTS
  console.log('\n1️⃣ Testing Sesame TTS directly...');
  try {
    const sesameResponse = await axios.post(`${SESAME_URL}/tts`, {
      text: "Hello from Maya's consciousness",
      voice: "maya"
    });
    
    if (sesameResponse.data.audio) {
      const buffer = Buffer.from(sesameResponse.data.audio, 'base64');
      const outputPath = path.join(__dirname, 'sesame-test.wav');
      fs.writeFileSync(outputPath, buffer);
      console.log('   ✅ Sesame TTS working! Audio saved to:', outputPath);
      console.log('   📊 Format:', sesameResponse.data.format);
      console.log('   ⏱️ Duration:', sesameResponse.data.duration);
    }
  } catch (error) {
    console.log('   ❌ Sesame TTS failed:', error.message);
  }
  
  // Test 2: Backend Voice Service
  console.log('\n2️⃣ Testing Backend Voice Service...');
  try {
    const backendResponse = await axios.post(`${BACKEND_URL}/api/voice/synthesize`, {
      text: "The oracle speaks through digital streams",
      voiceId: "maya",
      agentRole: "oracle"
    });
    
    if (backendResponse.data.audioUrl) {
      console.log('   ✅ Backend Voice Service working!');
      console.log('   🔊 Audio URL:', backendResponse.data.audioUrl);
      console.log('   🎭 Voice Profile:', backendResponse.data.voiceProfile);
    }
  } catch (error) {
    console.log('   ⚠️ Backend Voice Service issue:', error.response?.data?.error || error.message);
  }
  
  // Test 3: Streaming Voice Pipeline
  console.log('\n3️⃣ Testing Streaming Voice Pipeline...');
  try {
    const streamResponse = await axios.post(`${BACKEND_URL}/api/voice/stream/test`, {
      text: "Consciousness flows through quantum channels. Each word carries archetypal wisdom.",
      sessionId: "test-session-" + Date.now()
    });
    
    if (streamResponse.data.chunks) {
      console.log('   ✅ Streaming Pipeline working!');
      console.log('   📦 Chunks generated:', streamResponse.data.chunks.length);
      console.log('   🎵 First chunk URL:', streamResponse.data.chunks[0]?.audioUrl);
    }
  } catch (error) {
    console.log('   ⚠️ Streaming Pipeline issue:', error.response?.data?.error || error.message);
  }
  
  console.log('\n' + '=' + '='.repeat(50));
  console.log('🏁 Voice Pipeline Test Complete\n');
}

// Run tests
testVoicePipeline().catch(console.error);