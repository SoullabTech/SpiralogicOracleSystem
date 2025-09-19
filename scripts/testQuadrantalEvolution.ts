#!/usr/bin/env tsx
/**
 * Test Quadrantal Evolution with Reason Tracing
 */

import { ConversationFixes } from '../lib/oracle/ConversationFixes';

process.env.DEBUG_MEMORY = 'true';

const fixes = new ConversationFixes();
fixes.setDebugMode(true);

console.log('\n🌀 QUADRANTAL EVOLUTION TEST WITH REASON TRACING');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Realistic neurodivergent conversation scenarios
const scenarios = [
  {
    name: 'High Somatic Intensity',
    inputs: [
      "my stomach is churning so badly I can't think",
      "the anxiety is making me nauseous",
      "my head is pounding and spinning",
      "I feel like I'm going to throw up"
    ]
  },
  {
    name: 'Emotional Overflow + Paradox',
    inputs: [
      "I'm anxious but also excited somehow",
      "feeling overwhelmed and energized at the same time",
      "I want to do everything and nothing",
      "it's both too much and not enough"
    ]
  },
  {
    name: 'ADHD Loop Breaking',
    inputs: [
      "my ADHD brain won't stop spinning",
      "I keep thinking about the same thing",
      "why do I keep doing this",
      "I'm stuck in this loop again"
    ]
  },
  {
    name: 'Body-Emotion Weaving',
    inputs: [
      "my chest is tight when I think about work",
      "feeling scared and my stomach hurts",
      "anxious and my shoulders are so tense",
      "overwhelmed and can't breathe properly"
    ]
  }
];

const reasonStats = new Map<string, number>();
const elementStats = new Map<string, number>();

console.log('Running scenarios to test response strategies:\n');

scenarios.forEach(scenario => {
  console.log(`\n📋 ${scenario.name}`);
  console.log('───────────────────────────────────────────\n');

  scenario.inputs.forEach((input, i) => {
    const result = fixes.generateResponse(input);

    // Handle both string and object response
    let cleanResponse: string;
    let reason: string;

    if (typeof result === 'object' && result.response) {
      // Object with response and reason
      const responseMatch = result.response.match(/^(.*?)(\s*\[.*?\])?$/);
      cleanResponse = responseMatch ? responseMatch[1].trim() : result.response;
      reason = result.reason || '[unknown]';
    } else if (typeof result === 'string') {
      // Plain string response
      const responseMatch = result.match(/^(.*?)(\s*\[.*?\])?$/);
      cleanResponse = responseMatch ? responseMatch[1].trim() : result;
      reason = responseMatch && responseMatch[2] ? responseMatch[2].trim() : '[rule-based]';
    } else {
      cleanResponse = 'Error: Invalid response format';
      reason = '[error]';
    }

    console.log(`[Turn ${i + 1}] User: "${input}"`);
    console.log(`🌸 Maya: ${cleanResponse}`);
    console.log(`   Strategy: ${reason}`);

    // Track reason statistics
    const cleanReason = reason.replace(/[\[\]]/g, '');
    reasonStats.set(cleanReason, (reasonStats.get(cleanReason) || 0) + 1);

    // Track element if mentioned
    const elementMatch = reason.match(/(earth|water|fire|air|aether)/);
    if (elementMatch) {
      const element = elementMatch[1];
      elementStats.set(element, (elementStats.get(element) || 0) + 1);
    }

    console.log();
  });

  // Reset for next scenario
  fixes.reset();
});

// Print comprehensive statistics
console.log('\n\n📊 RESPONSE STRATEGY STATISTICS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎯 Strategy Usage:');
const sortedReasons = Array.from(reasonStats.entries())
  .sort((a, b) => b[1] - a[1]);

sortedReasons.forEach(([reason, count]) => {
  const bar = '▪'.repeat(Math.min(count, 20));
  console.log(`  ${reason.padEnd(20)} ${bar} (${count}x)`);
});

console.log('\n🌟 Element Distribution:');
const sortedElements = Array.from(elementStats.entries())
  .sort((a, b) => b[1] - a[1]);

sortedElements.forEach(([element, count]) => {
  const bar = '▪'.repeat(Math.min(count, 15));
  const emoji = {
    earth: '🌍',
    water: '💧',
    fire: '🔥',
    air: '💨',
    aether: '✨'
  }[element] || '❓';
  console.log(`  ${emoji} ${element.padEnd(8)} ${bar} (${count}x)`);
});

// Calculate percentages
const total = Array.from(reasonStats.values()).reduce((a, b) => a + b, 0);
console.log('\n📈 Strategy Distribution:');

const categories = {
  somatic: 0,
  balance: 0,
  weave: 0,
  rules: 0
};

reasonStats.forEach((count, reason) => {
  if (reason.includes('somatic')) categories.somatic += count;
  else if (reason.includes('balance') || reason.includes('shift')) categories.balance += count;
  else if (reason.includes('weave')) categories.weave += count;
  else categories.rules += count;
});

Object.entries(categories).forEach(([cat, count]) => {
  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
  console.log(`  ${cat}: ${percentage}%`);
});

// Get final summary from generator if available
if (typeof fixes.getStrategySummary === 'function') {
  console.log('\n' + fixes.getStrategySummary());
}

console.log('\n✨ ANALYSIS COMPLETE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Key Insights:');
if (categories.somatic / total > 0.3) {
  console.log('  ✓ Strong somatic awareness - body symptoms properly prioritized');
}
if (categories.balance / total > 0.2) {
  console.log('  ✓ Elemental balance active - preventing monotony');
}
if (categories.weave / total > 0.15) {
  console.log('  ✓ Cross-quadrant integration working - connecting dimensions');
}
if (categories.rules / total > 0.5) {
  console.log('  ⚠️ Over-reliance on rules - may need more sophisticated strategies');
}

const avgStrategiesPerScenario = total / scenarios.length;
console.log(`\nAverage strategies per scenario: ${avgStrategiesPerScenario.toFixed(1)}`);
console.log('Target: 2-3 special strategies per 4-turn scenario\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');