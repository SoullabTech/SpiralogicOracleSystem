#!/usr/bin/env tsx
/**
 * Test memory flow and body symptom tracking
 */

import { ConversationFixes } from '../lib/oracle/ConversationFixes';

const fixes = new ConversationFixes();
fixes.setDebugMode(true);

console.log('\n🧠 MEMORY FLOW TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const conversation = [
  "My stomach hurts when I think about work",
  "The meetings are overwhelming",
  "My head is spinning from all the pressure",
  "I have ADHD and it makes everything harder",
  "I feel anxious and lost",
  "The noise at work is too much",
  "Everything feels heavy"
];

console.log('📝 Simulating conversation with body symptoms and topics:\n');

conversation.forEach((input, i) => {
  console.log(`[Turn ${i + 1}] User: "${input}"`);

  const response = fixes.generateResponse(input);

  // Extract debug tag
  const tagMatch = response.match(/\[([^\]]+)\]/);
  const tag = tagMatch ? tagMatch[1] : 'none';

  console.log(`🌸 Maya: ${response}`);
  console.log(`   Tag: [${tag}]`);

  // Show if memory was used
  if (tag === 'memory' || tag === 'memory-alt') {
    console.log('   ✨ Memory reference activated!');
  }

  console.log();
});

// Get final stats
const stats = fixes.getStats();
console.log('\n📊 CONVERSATION STATISTICS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

Object.entries(stats).forEach(([key, value]) => {
  if (value > 0) {
    const bar = '▪'.repeat(Math.min(value, 10));
    console.log(`${key.padEnd(15)} ${bar} (${value})`);
  }
});

console.log('\n✅ Memory flow test complete!\n');