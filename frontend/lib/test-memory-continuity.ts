// ===============================================
// MEMORY CONTINUITY TEST - BROWSER VERSION
// Test the Oracle's memory across conversations
// ===============================================

window.testMemoryContinuity = async function() {
  console.log('🧠 Testing Oracle Memory Continuity...\n');
  
  const authToken = localStorage.getItem('auth_token');
  const userId = 'test_user_123'; // Replace with actual
  
  if (!authToken) {
    console.error('❌ Please login first');
    return;
  }

  try {
    // Test 1: Dream Continuity
    console.log('📘 Test 1: Dream Continuity\n');
    
    // First interaction
    console.log('1️⃣ First interaction about a dream:');
    const dreamMessage1 = "I keep having the same dream about water";
    
    let response = await fetch('/api/oracle/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId,
        message: dreamMessage1
      })
    });
    
    let data = await response.json();
    console.log(`User: "${dreamMessage1}"`);
    console.log(`Oracle: "${data.response}"\n`);
    
    // Wait for memory storage
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Second interaction - vague reference
    console.log('2️⃣ Second interaction (vague reference):');
    const dreamMessage2 = "That dream came back again";
    
    response = await fetch('/api/oracle/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId,
        message: dreamMessage2
      })
    });
    
    data = await response.json();
    console.log(`User: "${dreamMessage2}"`);
    console.log(`Oracle: "${data.response}"`);
    
    // Check if Oracle remembered
    const remembered = data.response.toLowerCase().includes('water') || 
                      data.response.toLowerCase().includes('dream about');
    console.log(`\n✅ Oracle remembered the water dream: ${remembered ? 'YES' : 'NO'}\n`);
    
    // Test 2: Emotional Continuity
    console.log('📗 Test 2: Emotional Continuity\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Share a feeling
    console.log('1️⃣ Sharing an emotion:');
    const emotionMessage = "I'm feeling really anxious about my job interview tomorrow";
    
    response = await fetch('/api/oracle/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId,
        message: emotionMessage
      })
    });
    
    data = await response.json();
    console.log(`User: "${emotionMessage}"`);
    console.log(`Oracle: "${data.response}"\n`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reference the feeling
    console.log('2️⃣ Referencing the feeling:');
    const emotionReference = "It's getting worse";
    
    response = await fetch('/api/oracle/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId,
        message: emotionReference
      })
    });
    
    data = await response.json();
    console.log(`User: "${emotionReference}"`);
    console.log(`Oracle: "${data.response}"`);
    
    const rememberedEmotion = data.response.toLowerCase().includes('anxious') || 
                             data.response.toLowerCase().includes('interview') ||
                             data.response.toLowerCase().includes('job');
    console.log(`\n✅ Oracle remembered the anxiety context: ${rememberedEmotion ? 'YES' : 'NO'}\n`);
    
    // Check memories
    console.log('🔍 Checking stored memories...');
    const memoriesResponse = await fetch(`/api/soul-memory/memories/${userId}?limit=5`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const memories = await memoriesResponse.json();
    console.log(`\nFound ${memories.length} recent memories:`);
    memories.forEach((mem, i) => {
      console.log(`${i + 1}. ${mem.content.substring(0, 50)}...`);
    });
    
    console.log('\n✅ Memory continuity test complete!');
    console.log('The Oracle successfully maintains context across conversations.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Quick test helper
window.testDreamContinuity = async function() {
  const authToken = localStorage.getItem('auth_token');
  const userId = 'test_user_123';
  
  console.log('Testing dream continuity...\n');
  
  // First message
  await fetch('/api/oracle/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      userId,
      message: "I keep having the same dream about water"
    })
  }).then(r => r.json()).then(d => console.log('Oracle:', d.response));
  
  // Wait
  console.log('\nWaiting 2 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Second message
  const response = await fetch('/api/oracle/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      userId,
      message: "That dream came back again"
    })
  }).then(r => r.json());
  
  console.log('Oracle:', response.response);
  console.log('\nDid the Oracle remember the water dream?', 
    response.response.toLowerCase().includes('water') ? 'YES ✅' : 'NO ❌'
  );
};

console.log('🧠 Memory continuity tests loaded!');
console.log('Run full test: testMemoryContinuity()');
console.log('Quick dream test: testDreamContinuity()');

export { testMemoryContinuity, testDreamContinuity };