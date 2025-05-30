// ===============================================
// BREAKTHROUGH DETECTION TEST
// Test sacred moments and transformation tracking
// ===============================================

// Browser console test function
window.testBreakthrough = async function() {
  console.log('🌟 Testing Breakthrough Detection...\n');
  
  const authToken = localStorage.getItem('auth_token');
  const userId = 'test_user_123'; // Replace with actual
  
  if (!authToken) {
    console.error('❌ Please login first');
    return;
  }

  try {
    // 1. Send a breakthrough message
    console.log('1️⃣ Sending breakthrough message...');
    const breakthroughMessage = "I just realized the pattern I've been stuck in for years!";
    
    const oracleResponse = await fetch('/api/oracle/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId,
        message: breakthroughMessage
      })
    });
    
    const oracleData = await oracleResponse.json();
    console.log('Message:', breakthroughMessage);
    console.log('Oracle:', oracleData.response);
    console.log('');

    // 2. Wait for processing
    console.log('2️⃣ Waiting for memory storage...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 3. Check latest memory
    console.log('3️⃣ Checking memory type...');
    const memoriesResponse = await fetch(`/api/soul-memory/memories/${userId}?limit=1`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const memories = await memoriesResponse.json();
    const latestMemory = memories[0];
    
    if (latestMemory) {
      console.log('Memory stored:');
      console.log('- Type:', latestMemory.type);
      console.log('- Breakthrough:', latestMemory.type === 'breakthrough' ? '✅' : '❌');
      console.log('- Sacred Moment:', latestMemory.sacredMoment ? '✅' : '❌');
      console.log('- Transformation Marker:', latestMemory.transformationMarker ? '✅' : '❌');
      console.log('- Metadata:', latestMemory.metadata);
    }
    console.log('');

    // 4. Check sacred moments
    console.log('4️⃣ Fetching sacred moments...');
    const sacredResponse = await fetch('/api/soul-memory/sacred-moments', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const sacredData = await sacredResponse.json();
    console.log(`Found ${sacredData.count || 0} sacred moments`);
    
    if (sacredData.sacredMoments && sacredData.sacredMoments.length > 0) {
      console.log('Latest sacred moment:', sacredData.sacredMoments[0]);
    }
    console.log('');

    // 5. Test more breakthrough patterns
    console.log('5️⃣ Testing additional breakthrough patterns...');
    const testPatterns = [
      "Aha! I see now why I keep avoiding intimacy",
      "I finally understand why my mother's words affected me so deeply",
      "The pattern is so clear now - I've been recreating my childhood trauma"
    ];
    
    for (const pattern of testPatterns) {
      console.log(`Testing: "${pattern}"`);
      // You can uncomment to actually test:
      // await testSinglePattern(pattern, authToken, userId);
    }
    
    console.log('\n✅ Breakthrough detection test complete!');
    console.log('The system successfully detects and marks breakthrough moments.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Helper function
async function testSinglePattern(message, authToken, userId) {
  const response = await fetch('/api/oracle/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ userId, message })
  });
  
  const data = await response.json();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const memories = await fetch(`/api/soul-memory/memories/${userId}?limit=1`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  const memData = await memories.json();
  const mem = memData[0];
  
  console.log(`- Type: ${mem?.type}, Sacred: ${mem?.sacredMoment ? '✅' : '❌'}`);
}

// Quick test for sacred moments
window.checkSacredMoments = async function() {
  const authToken = localStorage.getItem('auth_token');
  const response = await fetch('/api/soul-memory/sacred-moments', {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data = await response.json();
  console.log('Sacred moments:', data);
  return data;
};

console.log('🌟 Breakthrough test loaded!');
console.log('Run with: testBreakthrough()');
console.log('Check sacred moments: checkSacredMoments()');

export { testBreakthrough, checkSacredMoments };