/**
 * Test Voice Response Quality
 * Ensures Maya's voice responses are intelligent and generationally aware
 */

import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator';

const testInputs = [
  {
    input: "Hi",
    expectation: "Simple greeting - should be warm and natural"
  },
  {
    input: "im super tired and i am stressed",
    expectation: "Should acknowledge both tiredness and stress with empathy"
  },
  {
    input: "what do you mean",
    expectation: "Should clarify or provide context"
  },
  {
    input: "cringe",
    expectation: "Should respond to Gen Z language naturally"
  },
  {
    input: "its good",
    expectation: "Should acknowledge positive sentiment"
  },
  {
    input: "my instagram feed is making me feel like trash",
    expectation: "Should show Gen Z social media awareness"
  },
  {
    input: "i cant focus my brain is fried from doom scrolling",
    expectation: "Should address digital exhaustion authentically"
  },
  {
    input: "my parents dont get me",
    expectation: "Should validate generational disconnect"
  }
];

async function testVoiceQuality() {
  console.log('🎯 Testing Voice Response Quality\n');
  console.log('=' .repeat(70));

  const maya = new MayaOrchestrator();

  for (const test of testInputs) {
    console.log(`\n📝 Input: "${test.input}"`);
    console.log(`   Expectation: ${test.expectation}`);
    console.log('-'.repeat(50));

    try {
      const response = await maya.speak(test.input, 'test-user');

      console.log(`✅ Response: ${response.message}`);
      console.log(`   Element: ${response.element}`);
      console.log(`   Duration: ${response.duration}ms`);

      // Check quality metrics
      const wordCount = response.message.split(/\s+/).length;
      const hasTherapySpeak = /i sense|hold space|witness|attune/.test(response.message);
      const isNatural = /yeah|like|kinda|honestly|actually/.test(response.message.toLowerCase());

      console.log('\n   Quality Metrics:');
      console.log(`   • Word count: ${wordCount} ${wordCount > 150 ? '⚠️ Too long' : '✅'}`);
      console.log(`   • Natural language: ${isNatural ? '✅ Yes' : '⚠️ Could be more natural'}`);
      console.log(`   • No therapy-speak: ${!hasTherapySpeak ? '✅ Clean' : '❌ Contains therapy-speak'}`);

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n\n✨ Voice Quality Test Complete!\n');
}

// Run the test
testVoiceQuality().catch(console.error);