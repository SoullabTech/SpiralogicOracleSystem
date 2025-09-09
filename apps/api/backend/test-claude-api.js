#!/usr/bin/env node

// Direct test of Claude API key
const Anthropic = require('@anthropic-ai/sdk');

// Load from environment variable
require('dotenv').config({ path: '../../.env.local' });
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error('❌ Missing ANTHROPIC_API_KEY in environment variables');
  process.exit(1);
}

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