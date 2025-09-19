#!/usr/bin/env ts-node
/**
 * Component Test - Active Listening Core
 * Focused testing of listening capabilities
 */

import { activeListening } from '../lib/oracle/ActiveListeningCore';

console.log('🎧 ACTIVE LISTENING CORE TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const testCases = [
  {
    input: "I feel stuck in my job",
    expected: "water element (emotional attunement)"
  },
  {
    input: "Always the same problems",
    expected: "fire element (challenge pattern)"
  },
  {
    input: "Something is bothering me",
    expected: "air element (clarification)"
  },
  {
    input: "Why does life feel meaningless?",
    expected: "aether element (deep space holding)"
  }
];

testCases.forEach((test, i) => {
  console.log(`\n${i + 1}. Testing: "${test.input}"`);

  const response = activeListening.listen(test.input);

  console.log(`   Response: "${response.response}"`);
  console.log(`   Element: ${response.technique.element} (${response.technique.confidence})`);
  console.log(`   Expected: ${test.expected}`);

  if (response.silenceDuration) {
    console.log(`   Pause: ${response.silenceDuration}ms`);
  }

  if (response.followUp) {
    console.log(`   Follow-up: "${response.followUp}"`);
  }
});

// Test summarization
console.log('\n📝 SUMMARIZATION TEST');
const messages = [
  "I feel overwhelmed by work",
  "Everything seems impossible lately",
  "I need to find a way forward"
];

const summary = activeListening.summarize(messages);
console.log(`Summary: "${summary}"`);

console.log('\n✅ Active Listening Core test complete!');