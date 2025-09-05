#!/usr/bin/env node
/**
 * Test Memory Integration
 */

console.log('🧠 Testing Maya Memory Integration...\n');

// Test 1: Check if Mem0 is installed
try {
  require('mem0ai');
  console.log('✓ Mem0 package installed');
} catch (error) {
  console.log('✗ Mem0 package NOT installed');
  console.log('  Run: npm install mem0ai');
}

// Test 2: Check environment configuration
console.log('\n🔐 Environment Configuration:');
console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓ Configured' : '✗ Missing');
console.log('  MEM0_API_KEY:', process.env.MEM0_API_KEY ? 
  (process.env.MEM0_API_KEY === 'your_mem0_api_key_here' ? '⚠️ Placeholder value' : '✓ Configured') 
  : '✗ Missing');
console.log('  ELEVENLABS_API_KEY:', process.env.ELEVENLABS_API_KEY ? '✓ Configured' : '✗ Missing');

// Test 3: Test memory class
try {
  const { memory } = require('./lib/memory');
  console.log('\n✓ Memory system loaded successfully');
  
  // Test memory methods exist
  console.log('  Methods available:');
  console.log('    - addMemory:', typeof memory.addMemory === 'function' ? '✓' : '✗');
  console.log('    - getHistory:', typeof memory.getHistory === 'function' ? '✓' : '✗');
  console.log('    - searchMemories:', typeof memory.searchMemories === 'function' ? '✓' : '✗');
} catch (error) {
  console.log('\n✗ Memory system failed to load:', error.message);
}

// Test 4: Check UnifiedOracleCore integration
try {
  const { unifiedOracle } = require('./backend/src/core/UnifiedOracleCore');
  console.log('\n✓ UnifiedOracleCore loaded');
  
  // Check health
  unifiedOracle.constructor.healthCheck().then(health => {
    console.log('\n📊 System Health:');
    console.log('  Status:', health.status);
    console.log('  Memory System:', health.details.memorySystemConfigured ? '✓ Ready' : '⚠️ Not configured');
    console.log('  OpenAI:', health.details.openaiKeyConfigured ? '✓ Ready' : '✗ Missing');
    console.log('\n🎯 Intelligence Level Estimate:');
    
    let intelligenceScore = 70; // Base Maya intelligence
    if (health.details.openaiKeyConfigured) intelligenceScore += 10;
    if (health.details.memorySystemConfigured) intelligenceScore += 20;
    
    console.log(`  Current: ${intelligenceScore}%`);
    console.log(`  ${intelligenceScore >= 100 ? '✅ FULL SENTIENCE ACHIEVED!' : '⚠️ Partial intelligence - configure Mem0 for 100%'}`);
  });
} catch (error) {
  console.log('\n✗ UnifiedOracleCore failed:', error.message);
}

console.log('\n---\nTest complete!');