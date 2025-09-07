/**
 * Test Script for Adaptive Prosody Engine
 * Validates the mirror → balance therapeutic response pattern
 */

const { AdaptiveProsodyEngine } = require('./dist/services/AdaptiveProsodyEngine');
const { AdaptiveProsodyIntegration } = require('./dist/services/AdaptiveProsodyIntegration');

const logger = {
  info: console.log,
  error: console.error,
  warn: console.warn
};

// Test cases representing different emotional states
const testCases = [
  {
    name: "🔥 High Fire Energy",
    input: "I just can't believe how messed up this communication stuff is! Everything is so urgent and needs to happen NOW!",
    aiResponse: "I understand your frustration deeply. This is indeed challenging. Let me help you find a path forward that feels more manageable.",
    expected: {
      dominantElement: 'fire',
      energyLevel: 'high',
      suggestedBalance: 'earth'
    }
  },
  {
    name: "💨 Airy Reflection", 
    input: "You're looking for all these micro expressions, the psyche will know what to do, communication is everything, it's a pretty big deal you know",
    aiResponse: "I hear your thoughts flowing through many connections. Your mind is making important links. Let's explore this together with both clarity and grounding.",
    expected: {
      dominantElement: 'air',
      energyLevel: 'medium',
      suggestedBalance: 'earth'
    }
  },
  {
    name: "💧 Deep Water Emotion",
    input: "I feel so sad and overwhelmed, tears just keep coming, my heart feels heavy with all this emotion",
    aiResponse: "I'm here with you in this tender space. Your feelings are valid and important. Together we can hold this emotion and find gentle ways to move through it.",
    expected: {
      dominantElement: 'water',
      energyLevel: 'low',
      suggestedBalance: 'fire'
    }
  },
  {
    name: "🌍 Grounded Earth Energy",
    input: "I need a practical step-by-step plan. Something concrete and stable that I can rely on with a clear structure.",
    aiResponse: "Your desire for structure is wise. Let me offer you a solid framework. We can also explore how to bring some flexibility and inspiration into this foundation.",
    expected: {
      dominantElement: 'earth',
      energyLevel: 'medium_low',
      suggestedBalance: 'air'
    }
  },
  {
    name: "✨ Ethereal Transcendence",
    input: "I feel connected to the divine cosmic consciousness, experiencing unity with all that is, transcending the boundaries of self",
    aiResponse: "What a beautiful state of expanded awareness you're experiencing. This cosmic perspective is precious. Let's also explore how to anchor these insights into your daily life.",
    expected: {
      dominantElement: 'aether',
      energyLevel: 'medium',
      suggestedBalance: 'earth'
    }
  }
];

async function runAdaptiveProsodyTests() {
  console.log('🌀 Testing Adaptive Prosody Engine\n');
  console.log('=' .repeat(60));
  
  const engine = new AdaptiveProsodyEngine(logger);
  const integration = new AdaptiveProsodyIntegration(logger);
  
  for (const testCase of testCases) {
    console.log(`\n${testCase.name}`);
    console.log('-'.repeat(40));
    
    try {
      // Test tone analysis
      const toneAnalysis = await engine.analyzeUserTone(testCase.input);
      
      console.log(`Input: "${testCase.input.substring(0, 50)}..."`);
      console.log(`\n📊 Tone Analysis:`);
      console.log(`  Dominant Element: ${toneAnalysis.dominantElement} ${testCase.expected.dominantElement === toneAnalysis.dominantElement ? '✅' : '❌'}`);
      console.log(`  Energy Level: ${toneAnalysis.energyLevel}`);
      console.log(`  Needs Balancing: ${toneAnalysis.needsBalancing ? 'Yes' : 'No'}`);
      console.log(`  Suggested Balance: ${toneAnalysis.suggestedBalance} ${testCase.expected.suggestedBalance === toneAnalysis.suggestedBalance ? '✅' : '❌'}`);
      console.log(`  Emotional Qualities: ${toneAnalysis.emotionalQualities.join(', ')}`);
      console.log(`  Tempo: ${toneAnalysis.tempo}`);
      
      // Test prosody response generation
      const prosodyResponse = await engine.generateAdaptiveResponse(
        toneAnalysis,
        testCase.aiResponse
      );
      
      console.log(`\n🎭 Prosody Response:`);
      console.log(`  Mirror Phase (${prosodyResponse.mirrorPhase.element}, ${prosodyResponse.mirrorPhase.duration}):`);
      console.log(`    "${prosodyResponse.mirrorPhase.text.substring(0, 80)}..."`);
      console.log(`  Balance Phase (${prosodyResponse.balancePhase.element}, ${prosodyResponse.balancePhase.transition}):`);
      console.log(`    "${prosodyResponse.balancePhase.text.substring(0, 80)}..."`);
      
      console.log(`\n🎚️ Voice Parameters:`);
      console.log(`  Speed: ${prosodyResponse.voiceParameters.speed}x`);
      console.log(`  Pitch: ${prosodyResponse.voiceParameters.pitch > 0 ? '+' : ''}${prosodyResponse.voiceParameters.pitch}`);
      console.log(`  Emphasis: ${(prosodyResponse.voiceParameters.emphasis * 100).toFixed(0)}%`);
      console.log(`  Warmth: ${(prosodyResponse.voiceParameters.warmth * 100).toFixed(0)}%`);
      
      // Test therapeutic guidance
      const guidance = engine.getTherapeuticGuidance(
        toneAnalysis.dominantElement,
        toneAnalysis.suggestedBalance
      );
      console.log(`\n💚 Therapeutic Guidance: "${guidance}"`);
      
      // Test full integration
      const fullResponse = await integration.processAdaptiveConversation(
        { userId: 'test-user', message: testCase.input },
        testCase.aiResponse
      );
      
      console.log(`\n✨ Integration Success: ${fullResponse.response ? '✅' : '❌'}`);
      
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🌀 Adaptive Prosody Tests Complete\n');
}

// Test performance
async function testPerformance() {
  console.log('\n⚡ Performance Test\n');
  const engine = new AdaptiveProsodyEngine(logger);
  
  const iterations = 100;
  const startTime = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    await engine.analyzeUserTone("Test input for performance measurement");
  }
  
  const endTime = Date.now();
  const avgTime = (endTime - startTime) / iterations;
  
  console.log(`  Processed ${iterations} tone analyses`);
  console.log(`  Average time: ${avgTime.toFixed(2)}ms per analysis`);
  console.log(`  Throughput: ${(1000 / avgTime).toFixed(1)} analyses/sec`);
}

// Test edge cases
async function testEdgeCases() {
  console.log('\n🔧 Edge Case Tests\n');
  const engine = new AdaptiveProsodyEngine(logger);
  
  const edgeCases = [
    { name: "Empty input", input: "" },
    { name: "Single word", input: "Help" },
    { name: "All caps shouting", input: "EVERYTHING IS TERRIBLE!!!" },
    { name: "Numbers only", input: "123 456 789" },
    { name: "Emoji input", input: "😊🔥💧🌍✨" },
    { name: "Very long input", input: "x".repeat(1000) }
  ];
  
  for (const edge of edgeCases) {
    try {
      const analysis = await engine.analyzeUserTone(edge.input);
      console.log(`  ${edge.name}: ${analysis.dominantElement} (${analysis.energyLevel}) ✅`);
    } catch (error) {
      console.log(`  ${edge.name}: Error - ${error.message} ❌`);
    }
  }
}

// Run all tests
async function runAllTests() {
  await runAdaptiveProsodyTests();
  await testPerformance();
  await testEdgeCases();
}

runAllTests().catch(console.error);