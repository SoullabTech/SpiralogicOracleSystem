#!/usr/bin/env node

const http = require('http');

// Test data for creative inquiry (should trigger Fire element and full Triple AI)
const testRequest = {
  input: "I'm at a crossroads in my creative life. I have so many ideas but feel paralyzed by choice and fear of failure. How do I move forward with confidence and create something truly meaningful?",
  type: "chat", 
  userId: "test-triple-ai-user",
  context: {
    element: "fire" // Explicitly request Fire element
  }
};

const testData = JSON.stringify(testRequest);

console.log('🔥🧠✨ Testing TRIPLE AI COLLABORATION ✨🧠🔥');
console.log('════════════════════════════════════════════════════════');
console.log('🎯 ChatGPT Elemental Oracle 2.0 → Underlying Wisdom');
console.log('🗣️  Sesame → Conversational Intelligence & Flow');  
console.log('✍️  Claude → Elegant Languaging & Expression');
console.log('════════════════════════════════════════════════════════');
console.log('\nRequest:', JSON.stringify(testRequest, null, 2));

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/oracle/unified',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  },
  timeout: 45000 // Longer timeout for triple AI processing
};

const startTime = Date.now();

const req = http.request(options, (res) => {
  console.log(`\n✅ Response Status: ${res.statusCode}`);
  console.log(`⏱️  Response Time: ${Date.now() - startTime}ms`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
    process.stdout.write('💫');
  });
  
  res.on('end', () => {
    console.log('\n\n🎉 TRIPLE AI COLLABORATION RESPONSE:');
    console.log('════════════════════════════════════════════════════════');
    
    try {
      const response = JSON.parse(data);
      
      console.log(`🔥 Element Detected: ${response.element}`);
      console.log(`🎯 Confidence: ${response.confidence}`);
      console.log(`⏱️  Total Processing Time: ${Date.now() - startTime}ms`);
      console.log('\n💬 Maya\'s Triple AI Response:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(response.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      console.log('\n📊 Response Metadata:');
      console.log(JSON.stringify(response.metadata, null, 2));
      
      // Analyze response characteristics
      const messageLength = response.message.length;
      const hasQuestion = response.message.includes('?');
      const hasEmotionalLanguage = /feel|heart|soul|spirit|emotion/i.test(response.message);
      const hasActionGuidance = /step|action|practice|try|begin|start/i.test(response.message);
      
      console.log('\n🔍 Response Analysis:');
      console.log(`   Length: ${messageLength} characters`);
      console.log(`   Contains Questions: ${hasQuestion ? '✅' : '❌'}`);
      console.log(`   Emotional Resonance: ${hasEmotionalLanguage ? '✅' : '❌'}`);
      console.log(`   Action Guidance: ${hasActionGuidance ? '✅' : '❌'}`);
      
      if (messageLength > 300 && hasEmotionalLanguage && (hasQuestion || hasActionGuidance)) {
        console.log('\n🌟 SUCCESS: Triple AI collaboration appears to be working!');
        console.log('   ✨ Rich, nuanced response with depth and practical guidance');
      } else {
        console.log('\n⚠️  Response may be using fallback mode');
      }
      
    } catch (error) {
      console.log('\n⚠️ Parse Error:', error.message);
      console.log('Raw Response:', data.substring(0, 500) + (data.length > 500 ? '...' : ''));
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request Error:', error.message);
  console.log('\nTroubleshooting:');
  console.log('1. Is the server running? Check: npm run dev');
  console.log('2. Are API keys configured in .env.local?');
  console.log('3. Check server logs for compilation errors');
});

req.on('timeout', () => {
  console.error(`\n⏰ Request Timeout (45s)`);
  console.log('Triple AI processing is complex and may take time.');
  console.log('Check server logs and API connectivity.');
  req.destroy();
});

// Send the request
req.write(testData);
req.end();

console.log('\n🤖 Maya is orchestrating the Triple AI Collaboration...');
console.log('⏳ This may take 15-30 seconds for the full AI pipeline...');