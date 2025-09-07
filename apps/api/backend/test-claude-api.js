#!/usr/bin/env node

// Direct test of Claude API key
const Anthropic = require('@anthropic-ai/sdk');

const apiKey = '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';

console.log('🔮 Testing Claude API Key');
console.log('=========================');
console.log(`API Key: ${apiKey.substring(0, 20)}...${apiKey.slice(-10)}`);
console.log(`Key Length: ${apiKey.length}`);

const client = new Anthropic({
  apiKey: apiKey
});

async function testClaude() {
  try {
    console.log('\n📡 Making test request to Claude...');
    
    const response = await client.messages.create({
      model: 'claude-3-sonnet-20241022',
      max_tokens: 50,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: 'Say hello and confirm you are working.'
        }
      ]
    });

    console.log('✅ Claude API Test Successful!');
    console.log('Response:', response.content[0].text);
    console.log('Model:', response.model);
    console.log('Usage:', response.usage);
    
  } catch (error) {
    console.error('❌ Claude API Test Failed:');
    console.error('Error:', error.message);
    if (error.status) console.error('Status:', error.status);
    if (error.error) console.error('Details:', error.error);
  }
}

testClaude();