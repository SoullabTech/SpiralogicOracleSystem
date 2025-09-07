/**
 * Test Memory Recall Integration
 * 
 * Verifies that Maya can retrieve and inject relevant past journal entries
 * into the conversation context using semantic similarity search.
 */

import { MemoryOrchestrator } from './src/services/MemoryOrchestrator.js';
import { semanticSearch, getRelevantMemories } from './src/services/semanticRecall.js';
import { config } from 'dotenv';

config();

const TEST_USER_ID = process.env.TEST_USER_ID || 'test-user-123';

async function testSemanticSearch() {
  console.log('\n🔍 Testing Semantic Search...\n');
  
  try {
    // Test searching for stress-related memories
    const stressResults = await semanticSearch(
      "I'm feeling overwhelmed with work stress",
      TEST_USER_ID,
      3
    );
    
    console.log('✅ Stress query results:', stressResults.length, 'memories found');
    stressResults.forEach((r, i) => {
      console.log(`  ${i+1}. [${(r.similarity * 100).toFixed(0)}%] ${r.content.slice(0, 100)}...`);
    });
    
    // Test searching for dream-related memories
    const dreamResults = await semanticSearch(
      "I had a strange dream last night",
      TEST_USER_ID,
      3
    );
    
    console.log('\n✅ Dream query results:', dreamResults.length, 'memories found');
    dreamResults.forEach((r, i) => {
      console.log(`  ${i+1}. [${(r.similarity * 100).toFixed(0)}%] ${r.content.slice(0, 100)}...`);
    });
    
  } catch (error) {
    console.error('❌ Semantic search failed:', error);
  }
}

async function testMemoryInjection() {
  console.log('\n🧠 Testing Memory Injection...\n');
  
  try {
    // Test getting relevant memories with threshold
    const relevantMemories = await getRelevantMemories(
      "I keep having the same patterns with relationships",
      TEST_USER_ID,
      0.75
    );
    
    if (relevantMemories) {
      console.log('✅ Memory injection context generated:');
      console.log(relevantMemories);
    } else {
      console.log('⚠️ No memories above threshold');
    }
    
  } catch (error) {
    console.error('❌ Memory injection failed:', error);
  }
}

async function testMemoryOrchestrator() {
  console.log('\n🎭 Testing Full Memory Orchestrator...\n');
  
  try {
    const orchestrator = new MemoryOrchestrator();
    
    // Build full memory context
    const memoryContext = await orchestrator.buildContext(
      TEST_USER_ID,
      "Tell me about my journey with shadow work",
      'test-session-123',
      [
        {
          role: 'user',
          content: 'I want to explore my shadow self',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          role: 'assistant', 
          content: 'Shadow work is a powerful journey of self-discovery...',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ]
    );
    
    console.log('✅ Memory context built:');
    console.log('  - Layers used:', memoryContext.layersUsed);
    console.log('  - Total results:', memoryContext.results.length);
    console.log('  - Processing time:', memoryContext.processingTime, 'ms');
    console.log('  - Total tokens:', memoryContext.totalTokens);
    
    // Check for semantic memory injection
    const semanticMemory = (memoryContext as any).semanticMemoryContext;
    if (semanticMemory) {
      console.log('\n✅ Semantic memories injected:');
      console.log(semanticMemory.slice(0, 500), '...');
    }
    
    // Format for prompt
    const formattedPrompt = orchestrator.formatForPrompt(memoryContext, semanticMemory);
    console.log('\n📝 Formatted memory prompt:');
    console.log(formattedPrompt.slice(0, 800), '...');
    
  } catch (error) {
    console.error('❌ Memory orchestrator failed:', error);
  }
}

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('🌀 MAYA MEMORY RECALL TEST SUITE');
  console.log('='.repeat(60));
  
  await testSemanticSearch();
  await testMemoryInjection();
  await testMemoryOrchestrator();
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Memory Recall Tests Complete');
  console.log('='.repeat(60));
  
  process.exit(0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});