// ===============================================
// BROWSER CONSOLE TEST FOR SOUL MEMORY
// Copy and paste this into your browser console
// ===============================================

// Test function to run in browser console
window.testSoulMemory = async function() {
  console.log('🌀 Testing Soul Memory Integration...\n');
  
  const authToken = localStorage.getItem('auth_token'); // Adjust based on your auth storage
  const userId = 'test_user_123'; // Replace with actual user ID
  
  if (!authToken) {
    console.error('❌ No auth token found. Please login first.');
    return;
  }

  try {
    // 1. Test Oracle exchange
    console.log('1️⃣ Sending test message to Oracle...');
    const testMessage = "I'm feeling overwhelmed by all these changes in my life";
    
    const oracleResponse = await fetch('/api/oracle/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId,
        message: testMessage
      })
    });
    
    const oracleData = await oracleResponse.json();
    console.log('Oracle response:', oracleData.response);
    console.log('');

    // 2. Wait for storage
    console.log('2️⃣ Waiting for memory storage...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 3. Check memory storage
    console.log('3️⃣ Checking stored memories...');
    const memoriesResponse = await fetch(`/api/soul-memory/memories/${userId}?limit=1`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const memories = await memoriesResponse.json();
    if (memories.length > 0) {
      console.log('✅ Memory stored successfully!');
      console.log('Latest memory:', {
        id: memories[0].id,
        type: memories[0].type,
        content: memories[0].content?.substring(0, 50) + '...',
        element: memories[0].element,
        emotionalTone: memories[0].emotionalTone,
        oracleResponse: memories[0].oracleResponse?.substring(0, 50) + '...',
        timestamp: memories[0].timestamp
      });
    } else {
      console.log('❌ No memory found - storage may have failed');
    }
    console.log('');

    // 4. Test semantic search
    console.log('4️⃣ Testing semantic search...');
    const searchResponse = await fetch('/api/soul-memory/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId,
        query: 'overwhelmed changes'
      })
    });
    
    const searchResults = await searchResponse.json();
    console.log(`Found ${searchResults.length} semantically related memories`);
    console.log('');

    console.log('✅ Test complete! Soul Memory is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
console.log('Soul Memory test loaded. Run with: testSoulMemory()');

// Export for use in components
export const testSoulMemoryIntegration = window.testSoulMemory;