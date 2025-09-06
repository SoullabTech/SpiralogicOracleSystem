/**
 * Test Maya's Opening Ritual Integration with AdaptiveProsodyEngine
 */

const { ConversationalPipeline } = require('./src/services/ConversationalPipeline');
const AdaptiveProsodyEngine = require('./src/services/AdaptiveProsodyEngine').default;

async function testOpeningRitualIntegration() {
  console.log('🧪 Testing Maya Opening Ritual Integration...\n');
  
  const pipeline = new ConversationalPipeline();
  
  // Test scenarios
  const testScenarios = [
    {
      name: 'Fire Energy',
      userText: 'I feel fired up and passionate about this new project!',
      expectedElement: 'fire'
    },
    {
      name: 'Water Energy', 
      userText: 'I\'ve been feeling really emotional lately, lots of tears',
      expectedElement: 'water'
    },
    {
      name: 'Air Energy',
      userText: 'My mind is racing with so many thoughts and ideas',
      expectedElement: 'air'
    },
    {
      name: 'Earth Energy',
      userText: 'I feel stuck and heavy, like I can\'t move forward',
      expectedElement: 'earth'
    },
    {
      name: 'Resistance/Uncertainty',
      userText: 'I don\'t really know how I\'m feeling right now',
      expectedElement: 'resistance'
    }
  ];
  
  console.log('🔮 Testing AdaptiveProsodyEngine detection first...\n');
  
  for (const scenario of testScenarios) {
    console.log(`\n--- ${scenario.name} ---`);
    console.log(`User: "${scenario.userText}"`);
    
    try {
      // Test direct AdaptiveProsodyEngine
      const detection = AdaptiveProsodyEngine.detectTone(scenario.userText);
      console.log('🎯 Detection:', {
        element: detection?.element || 'unknown',
        confidence: detection?.confidence || 0,
        mixed: detection?.mixed || false
      });
      
      // Test phase detection
      const phase = AdaptiveProsodyEngine.detectPhase(scenario.userText);
      console.log('🌀 Phase:', phase);
      
    } catch (error) {
      console.error('❌ Detection failed:', error.message);
    }
  }
  
  console.log('\n🎭 Testing Full Opening Ritual Integration...\n');
  
  // Test full pipeline with opening ritual
  const testContext = {
    userText: 'I feel passionate and excited about starting this new journey!',
    conversationHistory: [],
    sentiment: 'high',
    element: 'aether',
    voiceEnabled: false,
    userId: 'test-user',
    sessionId: 'test-session-' + Date.now(),
    onboardingStep: null
  };
  
  try {
    console.log('🌟 Running opening ritual with:', testContext.userText);
    
    const result = await pipeline.runOpeningRitual(testContext.userText, testContext);
    
    if (result) {
      console.log('✅ Opening Ritual Result:');
      console.log('   Mirror:', result.mirror);
      console.log('   Balance:', result.balance);
      console.log('   Element Detected:', result.elementDetected);
      console.log('   Phase Detected:', result.phaseDetected);
      console.log('   Confidence:', result.confidence);
      console.log('   Shaped Response:', result.shaped);
    } else {
      console.log('❌ No ritual result returned');
    }
    
  } catch (error) {
    console.error('❌ Opening ritual failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testOpeningRitualIntegration()
  .then(() => {
    console.log('\n✅ Opening Ritual Integration Test Complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });