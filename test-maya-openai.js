#!/usr/bin/env node

const http = require('http');

// Test data for creative inquiry (should trigger Fire element and OpenAI)
const testRequest = {
  input: "I want to create something meaningful and inspire others. What creative project should I start?",
  type: "chat", 
  userId: "test-creative-user"
};

const testData = JSON.stringify(testRequest);

console.log('🔥 Testing Maya Fire Intelligence with OpenAI...');
console.log('Request:', JSON.stringify(testRequest, null, 2));

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/oracle/unified',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  },
  timeout: 30000 // Longer timeout for OpenAI
};

const req = http.request(options, (res) => {
  console.log(`\n✅ Status: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
    process.stdout.write('.');
  });
  
  res.on('end', () => {
    console.log('\n');
    try {
      const response = JSON.parse(data);
      console.log('🧠 Maya\'s Response:');
      console.log('Element:', response.element);
      console.log('Confidence:', response.confidence);
      console.log('\n💬 Message:');
      console.log(response.message);
      console.log('\n📊 Metadata:');
      console.log(JSON.stringify(response.metadata, null, 2));
      
      // Check if this looks like an OpenAI response vs fallback
      if (response.message.length > 200 && !response.message.includes("momentarily processing")) {
        console.log('\n🚀 SUCCESS: Maya is using OpenAI intelligence!');
      } else if (response.message.includes("momentarily processing") || response.message.includes("technical")) {
        console.log('\n⚠️ Maya is using fallback response - OpenAI may not be connecting');
      } else {
        console.log('\n✨ Maya is responding with intelligence!');
      }
    } catch (error) {
      console.log('\n⚠️ Parse Error:', error.message);
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request Error:', error.message);
});

req.on('timeout', () => {
  console.error('\n⏰ Request Timeout - Maya is thinking deeply...');
  req.destroy();
});

// Send the request
req.write(testData);
req.end();

console.log('\n🤔 Maya is contemplating your creative vision...');