/**
 * Test Voice Integration with ConversationIntelligenceEngine
 * Verifies that voice input properly connects to Maya's full intelligence
 */

import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator';
import { ConversationIntelligenceEngine } from '../lib/oracle/ConversationIntelligenceEngine';

// Test scenarios that should trigger different generational responses
const testScenarios = [
  {
    generation: 'Gen Z',
    input: "my instagram feed is making me feel like trash, everyone's life looks so perfect",
    expectedPatterns: ['social media', 'comparison', 'authentic']
  },
  {
    generation: 'Gen Z',
    input: "i can't focus on anything, my brain feels fried from all the doom scrolling",
    expectedPatterns: ['dopamine', 'attention', 'digital']
  },
  {
    generation: 'Gen Alpha',
    input: "my friends are being mean on roblox and won't let me join their game",
    expectedPatterns: ['friends', 'game', 'feelings']
  },
  {
    generation: 'Millennial',
    input: "I'm burnt out from work but can't afford to take a break with these student loans",
    expectedPatterns: ['burnout', 'financial', 'work-life']
  },
  {
    generation: 'Gen X',
    input: "Taking care of my aging parents while trying to manage teenagers is overwhelming",
    expectedPatterns: ['sandwich generation', 'family', 'balance']
  },
  {
    generation: 'Boomer',
    input: "I'm worried about my health and don't understand all these medical terms",
    expectedPatterns: ['health', 'clear', 'explain']
  }
];

async function testVoiceIntegration() {
  console.log('🎤 Testing Voice Integration with ConversationIntelligenceEngine\n');
  console.log('=' .repeat(70));

  const maya = new MayaOrchestrator();
  const conversationEngine = new ConversationIntelligenceEngine();

  for (const scenario of testScenarios) {
    console.log(`\n📱 ${scenario.generation} Scenario:`);
    console.log(`Input: "${scenario.input}"`);
    console.log('-'.repeat(50));

    try {
      // Test MayaOrchestrator (used by voice)
      const mayaResponse = await maya.speak(scenario.input, `test-${scenario.generation}`);
      console.log('Maya Voice Response:', mayaResponse.message);
      console.log('Element:', mayaResponse.element);

      // Test if it's using ConversationIntelligenceEngine features
      const hasGenerationalAwareness = scenario.expectedPatterns.some(pattern =>
        mayaResponse.message.toLowerCase().includes(pattern.toLowerCase())
      );

      if (hasGenerationalAwareness) {
        console.log('✅ Response shows generational awareness');
      } else {
        console.log('⚠️  Response may not be using full intelligence');
      }

      // Also test ConversationIntelligenceEngine directly for comparison
      const directResponse = await conversationEngine.processConversation(scenario.input, {
        userId: `test-${scenario.generation}`,
        sessionId: `test-session-${Date.now()}`
      });

      if (directResponse && directResponse.response) {
        console.log('\n🧠 Direct ConversationIntelligence Response:', directResponse.response);
        console.log('Context Detected:', directResponse.context);
      }

    } catch (error) {
      console.log('❌ Error:', error.message);
    }

    console.log('-'.repeat(50));
  }

  // Test that voice responses are authentic and not robotic
  console.log('\n\n🔍 Testing Response Authenticity\n');
  console.log('=' .repeat(70));

  const authenticityTests = [
    "hey maya",
    "I'm feeling really anxious about everything",
    "my parents don't understand me",
    "I hate my life",
    "everything feels meaningless"
  ];

  for (const input of authenticityTests) {
    console.log(`\nInput: "${input}"`);
    const response = await maya.speak(input, 'authenticity-test');

    // Check for forbidden therapy-speak
    const hasTherapySpeak = /i sense|hold space|witness|attune|present moment/.test(response.message);

    console.log('Response:', response.message);
    console.log(hasTherapySpeak ? '❌ Contains therapy-speak' : '✅ Natural language');
  }

  console.log('\n\n✨ Voice Integration Test Complete!\n');
}

// Run the test
testVoiceIntegration().catch(console.error);