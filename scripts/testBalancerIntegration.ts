#!/usr/bin/env tsx
/**
 * Test Elemental Balancer Integration with Real Conversations
 */

import { ConversationFixes } from '../lib/oracle/ConversationFixes';

process.env.DEBUG_MEMORY = 'true';

const fixes = new ConversationFixes();
fixes.setDebugMode(true);

console.log('\n🔥 ELEMENTAL BALANCER INTEGRATION TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Scenarios designed to trigger specific balance rules
const scenarios = [
  {
    name: 'Water Overload (Should trigger Fire)',
    conversation: [
      "I feel so sad and anxious",
      "Everything is overwhelming",
      "I'm scared and confused",
      "The emotions are too much"
    ],
    expectedBalance: 'fire'
  },
  {
    name: 'Earth Dominance (Should trigger Aether/Fire)',
    conversation: [
      "My stomach hurts so badly",
      "The pain is getting worse",
      "My head is spinning",
      "I can't handle these symptoms"
    ],
    expectedBalance: 'fire or aether'
  },
  {
    name: 'Repetition Loop (Should break pattern)',
    conversation: [
      "Tell me more about work",
      "What about work stresses you?",
      "How does work affect you?",
      "Work seems important"
    ],
    expectedBalance: 'different element'
  },
  {
    name: 'Paradox Present (Should trigger Aether)',
    conversation: [
      "I'm excited but terrified",
      "Want everything and nothing",
      "Too much but not enough",
      "Happy and sad simultaneously"
    ],
    expectedBalance: 'aether'
  }
];

// Track what actually fires
const balanceStats = {
  'fire-urgent': 0,
  'fire-high': 0,
  'fire-normal': 0,
  'aether-high': 0,
  'aether-normal': 0,
  'water': 0,
  'earth': 0,
  'air': 0,
  'no-balance': 0
};

scenarios.forEach(scenario => {
  console.log(`\n📋 ${scenario.name}`);
  console.log(`Expected: ${scenario.expectedBalance}`);
  console.log('───────────────────────────────────────────\n');

  scenario.conversation.forEach((input, i) => {
    console.log(`[Turn ${i + 1}] Input: "${input}"`);

    const result = fixes.generateResponse(input);
    const response = typeof result === 'object' ? result.response : result;

    // Extract reason/strategy from response
    const strategyMatch = response.match(/\[(.*?)\]/);
    const strategy = strategyMatch ? strategyMatch[1] : 'unknown';

    console.log(`Maya: ${response.substring(0, 80)}...`);
    console.log(`Strategy: [${strategy}]`);

    // Track balance usage
    if (strategy.includes('urgent')) balanceStats['fire-urgent']++;
    else if (strategy.includes('fire')) balanceStats['fire-high']++;
    else if (strategy.includes('aether')) balanceStats['aether-high']++;
    else if (strategy.includes('balance')) balanceStats['no-balance']++;

    console.log();
  });

  // Check memory state at end
  console.log('Final Memory State:');
  // Note: Can't directly access, but debug overlay should show it
  console.log('───────────────────────────────────────────\n');

  fixes.reset();
});

// Print statistics
console.log('\n📊 BALANCE ENFORCEMENT STATISTICS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

Object.entries(balanceStats).forEach(([type, count]) => {
  if (count > 0) {
    const bar = '▪'.repeat(Math.min(count, 20));
    console.log(`${type.padEnd(15)} ${bar} (${count}x)`);
  }
});

const totalResponses = scenarios.length * 4; // 4 turns per scenario
const balanceUsage = Object.values(balanceStats).reduce((a, b) => a + b, 0);
const balancePercentage = ((balanceUsage / totalResponses) * 100).toFixed(1);

console.log(`\nBalance enforcement rate: ${balancePercentage}%`);
console.log('Target: 30-40% for optimal variety\n');

// Diagnostic insights
console.log('💡 INSIGHTS:');
if (balancePercentage < 20) {
  console.log('  ⚠️ Balance under-firing - Check thresholds and element calculation');
  console.log('  → Water threshold may be too high (currently 3)');
  console.log('  → Earth threshold may need adjustment');
}

if (balanceStats['fire-urgent'] === 0) {
  console.log('  ⚠️ Fire-urgent never triggered - Earth intensity not being calculated?');
}

if (balanceStats['aether-high'] === 0) {
  console.log('  ⚠️ Aether never triggered - Paradox detection not working?');
}

console.log('\n✅ Test complete!\n');
console.log('Next steps:');
console.log('  1. If balance < 20%, lower thresholds');
console.log('  2. If specific elements never fire, check their triggers');
console.log('  3. Add more verbose logging to ElementsState calculation');
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');