// ===============================================
// API TEST FOR ORACLE + SOUL MEMORY
// Quick test to verify the integration via API endpoints
// ===============================================
import axios from 'axios';
const API_BASE = 'http://localhost:3000/api';
const TEST_USER_ID = 'test_user_123';
const AUTH_TOKEN = 'your_auth_token_here'; // Replace with actual token
async function testOracleMemoryAPI() {
    console.log('🌀 Testing Oracle + Soul Memory Integration via API\n');
    try {
        // 1. Initialize Soul Memory for user
        console.log('1️⃣ Initializing Soul Memory...');
        const initResponse = await axios.post(`${API_BASE}/soul-memory/initialize`, { userId: TEST_USER_ID }, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } });
        console.log('Response:', initResponse.data);
        console.log('');
        // 2. Send message to Oracle
        console.log('2️⃣ Sending message to Oracle...');
        const testMessage = "I'm feeling overwhelmed by all these changes in my life";
        const oracleResponse = await axios.post(`${API_BASE}/oracle/message`, {
            userId: TEST_USER_ID,
            message: testMessage
        }, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } });
        console.log('User:', testMessage);
        console.log('Oracle:', oracleResponse.data.response);
        console.log('');
        // 3. Check if memory was stored
        console.log('3️⃣ Checking stored memories...');
        const memoriesResponse = await axios.get(`${API_BASE}/soul-memory/memories/${TEST_USER_ID}?limit=1`, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } });
        const latestMemory = memoriesResponse.data[0];
        if (latestMemory) {
            console.log('✅ Latest memory found:');
            console.log({
                id: latestMemory.id,
                type: latestMemory.type,
                content: latestMemory.content.substring(0, 50) + '...',
                element: latestMemory.element,
                emotionalTone: latestMemory.emotionalTone,
                timestamp: latestMemory.timestamp
            });
        }
        else {
            console.log('❌ No memory found');
        }
        console.log('');
        // 4. Test semantic search
        console.log('4️⃣ Testing semantic search...');
        const searchResponse = await axios.post(`${API_BASE}/soul-memory/search`, {
            userId: TEST_USER_ID,
            query: 'overwhelmed changes'
        }, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } });
        console.log(`Found ${searchResponse.data.length} related memories`);
        console.log('');
        // 5. Record a ritual moment
        console.log('5️⃣ Recording ritual moment...');
        const ritualResponse = await axios.post(`${API_BASE}/ritual/record`, {
            userId: TEST_USER_ID,
            ritualType: 'morning_intention',
            content: 'Setting intention to embrace change with grace',
            element: 'water'
        }, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } });
        console.log('Ritual recorded:', ritualResponse.data.memory.id);
        console.log('Oracle guidance:', ritualResponse.data.guidance.substring(0, 100) + '...');
        console.log('');
        // 6. Get sacred moments
        console.log('6️⃣ Retrieving sacred moments...');
        const sacredResponse = await axios.get(`${API_BASE}/memories/sacred/${TEST_USER_ID}`, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } });
        console.log(`Found ${sacredResponse.data.length} sacred moments`);
        console.log('');
        // 7. Get transformation journey
        console.log('7️⃣ Getting transformation journey...');
        const journeyResponse = await axios.get(`${API_BASE}/memories/transformation/${TEST_USER_ID}`, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } });
        console.log('Transformation journey:', {
            currentPhase: journeyResponse.data.currentPhase,
            milestones: journeyResponse.data.milestones.length,
            nextSuggestion: journeyResponse.data.nextSpiralSuggestion
        });
        console.log('\n✅ All tests completed successfully!');
    }
    catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}
// Frontend test example
console.log('\n📱 Frontend Test Example:\n');
console.log(`
// In your React component:

const testOracleMemory = async () => {
  // Test Oracle exchange memory
  const testMessage = "I'm feeling overwhelmed by all these changes in my life";
  
  // Send to Oracle
  const oracleResponse = await fetch('/api/oracle/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${authToken}\`
    },
    body: JSON.stringify({
      userId: currentUser.id,
      message: testMessage
    })
  });
  
  const { response } = await oracleResponse.json();
  console.log('Oracle response:', response);

  // Check if it was stored
  const recentMemories = await fetch(\`/api/soul-memory/memories/\${currentUser.id}?limit=1\`, {
    headers: {
      'Authorization': \`Bearer \${authToken}\`
    }
  });
  
  const memories = await recentMemories.json();
  console.log('Latest memory:', memories[0]);
  // Should show the exchange with emotional tone, element, etc.
};
`);
// Run the API test
if (require.main === module) {
    testOracleMemoryAPI();
}
export { testOracleMemoryAPI };
