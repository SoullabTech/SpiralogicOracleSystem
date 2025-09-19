#!/usr/bin/env ts-node
/**
 * Component Test - Maya Orchestrator
 * Focused testing of Maya's response generation
 */

import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator';

console.log('🌸 MAYA ORCHESTRATOR TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const maya = new MayaOrchestrator();

const testInputs = [
  {
    input: "Hello Maya",
    expectation: "Basic greeting response"
  },
  {
    input: "I'm feeling anxious about my future",
    expectation: "Emotional attunement with spacious response"
  },
  {
    input: "I keep procrastinating on important tasks",
    expectation: "Pattern recognition and gentle challenge"
  },
  {
    input: "What's the meaning of life?",
    expectation: "Deep space holding, not answering directly"
  }
];

for (let i = 0; i < testInputs.length; i++) {
  const test = testInputs[i];

  console.log(`\n${i + 1}. Testing: "${test.input}"`);
  console.log(`   Expected: ${test.expectation}`);

  try {
    const response = await maya.speak(test.input, `test-user-${i}`);

    console.log(`   Maya: "${response.message}"`);
    console.log(`   Element: ${response.element}`);
    console.log(`   Duration: ${response.duration}ms`);

    if (response.voiceCharacteristics) {
      console.log(`   Voice: ${response.voiceCharacteristics.pace}, ${response.voiceCharacteristics.tone}`);
    }

    // Basic quality checks
    const wordCount = response.message.split(' ').length;
    if (wordCount > 120) {
      console.log(`   ⚠️ Response too long: ${wordCount} words`);
    }

    // Check for forbidden patterns
    const forbiddenPatterns = ['i understand', 'i sense', 'i witness'];
    const hasForbidden = forbiddenPatterns.some(pattern =>
      response.message.toLowerCase().includes(pattern)
    );

    if (hasForbidden) {
      console.log(`   ❌ Contains forbidden therapy-speak`);
    } else {
      console.log(`   ✅ Maintains appropriate boundaries`);
    }

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Brief pause between tests
  await new Promise(resolve => setTimeout(resolve, 500));
}

console.log('\n📊 MAYA RESPONSE PATTERNS');
console.log('   - Length: Targeting 40-80 words');
console.log('   - Style: Conversational, not therapeutic');
console.log('   - Elements: Balanced across Fire/Water/Earth/Air/Aether');
console.log('   - Boundaries: No therapy-speak or interpretation');

console.log('\n✅ Maya Orchestrator test complete!');