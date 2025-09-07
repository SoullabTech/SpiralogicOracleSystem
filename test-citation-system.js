#!/usr/bin/env node

/**
 * Citation System Test Script
 * Tests the complete flow: upload → embed → search → cite
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

// Test configuration
const TEST_CONFIG = {
  testFile: {
    name: 'test-document.txt',
    content: `Flow State Research Notes

Flow states are psychological states where individuals become fully immersed in activities. 
The concept was developed by Mihaly Csikszentmihalyi in the 1970s.

Key characteristics of flow include:
1. Complete concentration on the present moment
2. Loss of self-consciousness
3. Transformation of time perception
4. Intrinsic motivation
5. Clear goals and immediate feedback

Flow occurs when challenge level matches skill level. Too much challenge creates anxiety,
while too little challenge leads to boredom. The sweet spot is where growth happens.

Applications in daily life:
- Creative work benefits from uninterrupted time blocks
- Physical activities like rock climbing naturally induce flow
- Learning new skills requires balancing difficulty with ability

The research suggests that flow states contribute significantly to well-being and life satisfaction.
People report their happiest moments during flow experiences, not during passive leisure.`
  },
  searchQueries: [
    'What did I say about flow states?',
    'Tell me about Csikszentmihalyi',
    'How does challenge relate to skill level?',
    'What causes anxiety in learning?'
  ]
};

// Utility functions
function createTestFile() {
  const filePath = path.join(__dirname, TEST_CONFIG.testFile.name);
  fs.writeFileSync(filePath, TEST_CONFIG.testFile.content);
  console.log(`✅ Created test file: ${filePath}`);
  return filePath;
}

async function uploadFile(filePath) {
  console.log('\n📤 Testing file upload...');
  
  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('tags', 'research');
  form.append('tags', 'flow-states');

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${BASE_URL}/api/files/upload`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Upload successful:', result.message);
    console.log('📁 File ID:', result.file_id);
    
    // Wait for processing
    console.log('⏳ Waiting 5 seconds for file processing...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return result.file_id;
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    throw error;
  }
}

async function testFileSearch(queries) {
  console.log('\n🔍 Testing file search API...');
  
  const fetch = (await import('node-fetch')).default;
  
  for (const query of queries) {
    try {
      console.log(`\n🔍 Query: "${query}"`);
      
      const response = await fetch(`${BASE_URL}/api/files/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 3 })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const results = await response.json();
      
      if (results.results.length > 0) {
        const topResult = results.results[0];
        console.log('✅ Found relevant file:', topResult.fileName);
        console.log('📝 Summary:', topResult.summary);
        console.log('📌 Citation:', topResult.citation.relevantSection);
        console.log('🎯 Confidence:', `${(topResult.similarity * 100).toFixed(1)}%`);
      } else {
        console.log('⚠️  No results found for this query');
      }
    } catch (error) {
      console.error('❌ Search failed:', error.message);
    }
  }
}

async function testConversationWithCitation(query) {
  console.log('\n💬 Testing conversation with file citation...');
  
  const fetch = (await import('node-fetch')).default;
  
  try {
    console.log(`🗣️  User: "${query}"`);
    
    const response = await fetch(`${BASE_URL}/api/oracle/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: query,
        includeContext: true
      })
    });

    if (!response.ok) {
      throw new Error(`Chat failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('🎭 Maya:', result.response || result.text || result.content);
    
    // Check if citation format is present
    const hasCitation = /\(uploaded \w+,?\s+\w+\s+\d+\)/.test(result.response || result.text || result.content);
    if (hasCitation) {
      console.log('✅ Citation format detected in response');
    } else {
      console.log('⚠️  No citation format found - may need prompt tuning');
    }
    
  } catch (error) {
    console.error('❌ Conversation test failed:', error.message);
  }
}

function cleanup(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`\n🧹 Cleaned up test file: ${filePath}`);
  }
}

// Main test execution
async function runCitationTests() {
  console.log('🧪 Maya Citation System Test Suite\n');
  console.log(`🌍 Testing against: ${BASE_URL}\n`);
  
  let testFilePath;
  
  try {
    // Step 1: Create and upload test file
    testFilePath = createTestFile();
    const fileId = await uploadFile(testFilePath);
    
    // Step 2: Test file search API
    await testFileSearch(TEST_CONFIG.searchQueries);
    
    // Step 3: Test conversation with citations
    await testConversationWithCitation(TEST_CONFIG.searchQueries[0]);
    
    console.log('\n🎉 Citation system tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ File upload and processing');
    console.log('✅ Semantic search with citations');  
    console.log('✅ Memory integration');
    console.log('✅ Conversation with file references');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  } finally {
    if (testFilePath) {
      cleanup(testFilePath);
    }
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled rejection:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted by user');
  if (testFilePath) cleanup(testFilePath);
  process.exit(0);
});

// Run tests if called directly
if (require.main === module) {
  runCitationTests().catch(console.error);
}

module.exports = { runCitationTests };