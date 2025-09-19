#!/usr/bin/env tsx
/**
 * Test Memory Accumulation Fix
 */

import { ConversationFixes } from '../lib/oracle/ConversationFixes';

process.env.DEBUG_MEMORY = 'true';

const fixes = new ConversationFixes();
fixes.setDebugMode(true);

console.log('\n✅ MEMORY ACCUMULATION TEST - POST FIX');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const conversation = [
  "I have ADHD and feel anxious about work",
  "My stomach hurts when I think about meetings",
  "I'm both excited and overwhelmed",
  "Work stress is killing me"
];

conversation.forEach((input, i) => {
  console.log(`\n[Turn ${i + 1}] Input: "${input}"`);

  const result = fixes.generateResponse(input);

  // Extract response text
  const responseText = typeof result === 'object' ? result.response : result;

  console.log(`🌸 Maya: ${responseText}\n`);
});

// Final stats
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 FINAL MEMORY STATE CHECK');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Note: We can't directly access memory from outside, but the debug overlay should show it

console.log('✅ Test complete!');
console.log('\nExpected to see:');
console.log('  - Topics accumulating: ADHD, work, anxiety');
console.log('  - Emotions accumulating: anxiety, excitement, overwhelm');
console.log('  - Body states tracked: stomach distress');
console.log('\nIf these appear in the memory snapshots above, accumulation is FIXED!\n');