#!/usr/bin/env node

const http = require('http');

// Simple test to check basic AI integration
const testRequest = {
  input: "What is creativity?",
  type: "chat", 
  userId: "test-simple"
};

const testData = JSON.stringify(testRequest);

console.log('🧪 Testing Basic AI Integration...');
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
  timeout: 15000
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
      console.log('🧠 Response:');
      console.log('Message:', response.message);
      console.log('Element:', response.element);
      console.log('Length:', response.message.length);
      
      // Check if it&apos;s a real AI response or fallback
      if (response.message.includes('momentarily processing') || 
          response.message.includes('development mode') ||
          response.message.length < 100) {
        console.log('\n⚠️ Using fallback mode - API may not be connecting');
      } else {
        console.log('\n✅ AI appears to be responding');
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
  console.error('\n⏰ Request Timeout');
  req.destroy();
});

req.write(testData);
req.end();

console.log('\n⏱️ Waiting for response...');