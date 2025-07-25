// Test Soul Memory API Endpoints
const http = require('http');

const testEndpoints = [
  'GET /api/soul-memory/health',
  'GET /api/soul-memory/memories?userId=test_user_123',
  'GET /api/soul-memory/sacred-moments?userId=test_user_123',
  'GET /api/soul-memory/archetypal-patterns?userId=test_user_123',
  'GET /api/soul-memory/transformation-journey?userId=test_user_123'
];

console.log('🧪 Soul Memory API Endpoint Tests');
console.log('==================================\n');

async function testEndpoint(method, path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_token'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 'ERROR',
        error: err.message
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔌 Testing server connection...');
  
  // Test basic health endpoint first
  const healthTest = await testEndpoint('GET', '/health');
  
  if (healthTest.status === 'ERROR') {
    console.log('❌ Server not running. Please start the server first:');
    console.log('   cd backend && npm run start');
    return;
  }
  
  if (healthTest.status === 200) {
    console.log('✅ Server is responding\\n');
  } else {
    console.log(`⚠️ Server responding with status: ${healthTest.status}\\n`);
  }
  
  // Test each endpoint
  for (const endpoint of testEndpoints) {
    const [method, path] = endpoint.split(' ');
    console.log(`Testing: ${endpoint}`);
    
    const result = await testEndpoint(method, path);
    
    if (result.status === 'ERROR') {
      console.log(`❌ ${result.error}`);
    } else if (result.status === 200) {
      try {
        const data = JSON.parse(result.data);
        console.log(`✅ Status ${result.status} - ${data.success ? 'Success' : 'Response received'}`);
        
        // Show relevant data
        if (data.memories) console.log(`   📊 ${data.memories.length} memories`);
        if (data.sacredMoments) console.log(`   ✨ ${data.sacredMoments.length} sacred moments`);
        if (data.patterns) console.log(`   🎭 ${data.patterns.length} archetypal patterns`);
        if (data.journey) console.log(`   🌟 Journey phase: ${data.journey.currentPhase}`);
        
      } catch (e) {
        console.log(`✅ Status ${result.status} - Response received`);
      }
    } else {
      console.log(`⚠️ Status ${result.status}`);
    }
    
    console.log('');
  }
  
  console.log('🔗 Manual API Test Commands:');
  console.log('curl http://localhost:3001/health');
  console.log('curl http://localhost:3001/api/soul-memory/health');
  console.log('curl "http://localhost:3001/api/soul-memory/memories?userId=test_user_123"');
}

runTests();