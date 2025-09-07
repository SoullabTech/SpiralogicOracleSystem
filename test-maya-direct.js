#!/usr/bin/env node

const http = require('http');

// Test data
const testRequest = {
  input: "Hello Maya, I'm feeling lost and need guidance. Can you help me?",
  type: "chat", 
  userId: "test-user-simple"
};

const testData = JSON.stringify(testRequest);

console.log('🚀 Testing Maya Intelligence...');
console.log('Request:', JSON.stringify(testRequest, null, 2));
console.log('\nConnecting to http://localhost:3000/api/oracle/unified');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/oracle/unified',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  },
  timeout: 10000
};

const req = http.request(options, (res) => {
  console.log(`\n✅ Status: ${res.statusCode}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
    console.log('📦 Receiving data...', chunk.length, 'bytes');
  });
  
  res.on('end', () => {
    console.log('\n📝 Raw Response Length:', data.length);
    if (data.length > 0) {
      try {
        const response = JSON.parse(data);
        console.log('\n🧠 Maya\'s Response:');
        console.log(JSON.stringify(response, null, 2));
        if (response.message) {
          console.log('\n💬 Message:', response.message);
        }
        console.log('\n🎉 SUCCESS: Maya is responding!');
      } catch (error) {
        console.log('\n⚠️ Parse Error:', error.message);
        console.log('Raw Response:', data);
      }
    } else {
      console.log('\n⚠️ Empty response received');
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request Error:', error.message);
});

req.on('timeout', () => {
  console.error('\n⏰ Request Timeout (10s)');
  req.destroy();
});

// Send the request
req.write(testData);
req.end();

console.log('\n⏱️ Waiting for Maya\'s response...');