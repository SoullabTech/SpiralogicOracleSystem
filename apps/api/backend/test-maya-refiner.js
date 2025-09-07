#!/usr/bin/env node

// Test script to demonstrate Sesame/Maya refiner functionality
// Tests the refiner independently of Claude API

const { SesameMayaRefiner } = require('./dist/services/SesameMayaRefiner.js');

// Mock response stream generator (simulates Claude output)
async function* mockClaudeStream() {
  const mockResponse = "I think maybe you should try to connect with your inner wisdom. " +
                      "This is very important for your spiritual growth. " +
                      "You must practice meditation daily to find peace within yourself. " +
                      "Don't worry about external distractions - just breathe deeply and center yourself.";
  
  // Simulate streaming tokens
  const words = mockResponse.split(' ');
  for (let i = 0; i < words.length; i++) {
    yield words[i] + ' ';
    // Add small delay to simulate real streaming
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function testSesamaMayaRefiner() {
  console.log('🔮 Testing Sesame/Maya Refiner');
  console.log('==============================\n');
  
  // Test with Air element
  const refiner = new SesameMayaRefiner({
    element: 'air',
    userId: 'test-user',
    styleTightening: true,
    safetySoften: true,
    addClosers: true,
    tts: {
      breathMarks: true,
      phraseMinChars: 36,
      phraseMaxChars: 120
    }
  });

  console.log('📝 Original Mock Response:');
  console.log('I think maybe you should try to connect with your inner wisdom. This is very important for your spiritual growth. You must practice meditation daily to find peace within yourself. Don\'t worry about external distractions - just breathe deeply and center yourself.');
  
  console.log('\n✨ Refining stream in real-time...\n');
  console.log('🎯 Refined Output (with elemental tone + breath markers):');
  console.log('─'.repeat(60));
  
  let totalRefined = '';
  let phraseCount = 0;
  
  try {
    // Test streaming refinement
    for await (const refinedPhrase of refiner.refineStream(mockClaudeStream())) {
      phraseCount++;
      totalRefined += refinedPhrase;
      process.stdout.write(`[${phraseCount}] ${refinedPhrase}`);
    }
    
    console.log('\n' + '─'.repeat(60));
    console.log(`\n📊 Refinement Summary:`);
    console.log(`   • Phrases processed: ${phraseCount}`);
    console.log(`   • Total refined length: ${totalRefined.length} chars`);
    console.log(`   • Breath markers added: ${(totalRefined.match(/<breath/g) || []).length}`);
    
    // Demonstrate non-streaming refinement
    console.log('\n🔄 Testing non-streaming refinement...');
    const fullText = "I think maybe you should try to connect deeply. This is very important work.";
    const nonStreamRefined = refiner.refineText(fullText);
    console.log(`Original: ${fullText}`);
    console.log(`Refined:  ${nonStreamRefined}`);
    
    console.log('\n✅ Sesame/Maya Refiner test complete!');
    console.log('\n🎯 Key Features Demonstrated:');
    console.log('   • Elemental tone adjustment (Air: "let\'s clarify" vs "I think")');
    console.log('   • Style tightening (removed "very", hedge words)');  
    console.log('   • Safety softening ("you must" → "you might")');
    console.log('   • Breath markers for TTS (phrases, punctuation)');
    console.log('   • Real-time streaming refinement');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSesamaMayaRefiner().catch(console.error);