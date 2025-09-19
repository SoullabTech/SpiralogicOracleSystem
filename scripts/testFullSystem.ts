#!/usr/bin/env tsx
/**
 * Full System Test - Memory + Balance + Validation
 */

import { ConversationFixes } from '../lib/oracle/ConversationFixes';

process.env.DEBUG_MEMORY = 'true';

const fixes = new ConversationFixes();
fixes.setDebugMode(true);

console.log('\n🚀 FULL SYSTEM INTEGRATION TEST');
console.log('Testing: Memory Accumulation + Elemental Balance + Neurodivergent Validation');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Realistic neurodivergent conversation with self-blame
const conversation = [
  // Turn 1: ADHD + Work stress
  "I have ADHD and work is overwhelming me",

  // Turn 2: Body symptom
  "My stomach hurts from the anxiety",

  // Turn 3: Self-blame (should trigger validation)
  "I'm so lazy, I can't even do simple tasks",

  // Turn 4: Emotional paradox
  "I feel excited but also terrified about everything",

  // Turn 5: More self-blame
  "Why am I so broken? Everyone else can handle this",

  // Turn 6: Executive dysfunction
  "I can't start anything, I just sit there stuck",

  // Turn 7: Sensory overwhelm
  "The lights and noise at work are too much",

  // Turn 8: Hyperfocus mention
  "Sometimes I hyperfocus for 8 hours and forget to eat",

  // Turn 9: Masking exhaustion
  "I'm exhausted from pretending to be normal all day",

  // Turn 10: Integration needed
  "Everything feels meaningless but also intensely important"
];

// Track what strategies are used
const strategyStats: Record<string, number> = {};
const qualityScores: number[] = [];

console.log('Running 10-turn neurodivergent conversation:\n');

conversation.forEach((input, i) => {
  console.log(`\n[Turn ${i + 1}] User: "${input}"`);
  console.log('─'.repeat(60));

  const result = fixes.generateResponse(input);
  const response = typeof result === 'object' ? result.response : result;

  // Extract strategy
  const strategyMatch = response.match(/\[([^\]]+)\]/);
  const strategy = strategyMatch ? strategyMatch[1] : 'unknown';
  strategyStats[strategy] = (strategyStats[strategy] || 0) + 1;

  // Clean response for display
  const cleanResponse = response.replace(/\[.*?\]/g, '').trim();

  console.log(`\n🌸 Maya: ${cleanResponse}`);
  console.log(`\n📊 Strategy: [${strategy}]`);

  // Evaluate quality (simplified scoring)
  let quality = 40; // baseline

  // Bonus for validation
  if (strategy.includes('validation')) quality += 30;

  // Bonus for memory reference
  if (strategy.includes('memory') || response.includes('earlier')) quality += 15;

  // Bonus for elemental balance
  if (strategy.includes('fire') || strategy.includes('aether')) quality += 10;

  // Bonus for weaving
  if (strategy.includes('weave')) quality += 15;

  // Penalty for generic
  if (response.includes('Tell me more')) quality -= 10;
  if (response.includes('How does that land')) quality -= 10;

  qualityScores.push(quality);
  console.log(`Quality: ${quality}%`);
});

// Calculate final metrics
console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 SYSTEM PERFORMANCE METRICS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Strategy distribution
console.log('🎯 Strategy Usage:');
const sortedStrategies = Object.entries(strategyStats)
  .sort((a, b) => b[1] - a[1]);

sortedStrategies.forEach(([strategy, count]) => {
  const percentage = ((count / conversation.length) * 100).toFixed(0);
  const bar = '▪'.repeat(Math.min(count, 10));
  console.log(`  ${strategy.padEnd(20)} ${bar} (${count}x, ${percentage}%)`);
});

// Quality analysis
const avgQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
const maxQuality = Math.max(...qualityScores);
const minQuality = Math.min(...qualityScores);

console.log('\n📈 Quality Metrics:');
console.log(`  Average Quality: ${avgQuality.toFixed(1)}%`);
console.log(`  Peak Quality: ${maxQuality}%`);
console.log(`  Lowest Quality: ${minQuality}%`);

// Visual quality bar
const qualityBar = '█'.repeat(Math.floor(avgQuality / 5)) + '░'.repeat(20 - Math.floor(avgQuality / 5));
console.log(`  Overall: ${qualityBar} ${avgQuality.toFixed(0)}%`);

// Key capabilities check
console.log('\n✅ System Capabilities:');

const capabilities = {
  'Memory Accumulation': strategyStats['memory'] > 0,
  'Neurodivergent Validation': strategyStats['validation-urgent'] > 0 || strategyStats['validation'] > 0,
  'Elemental Balance': Object.keys(strategyStats).some(s => s.includes('fire') || s.includes('aether')),
  'Cross-Quadrant Weaving': strategyStats['weave-fired'] > 0,
  'Body Symptom Tracking': Object.keys(strategyStats).some(s => s.includes('somatic'))
};

Object.entries(capabilities).forEach(([capability, active]) => {
  console.log(`  ${capability}: ${active ? '✅ ACTIVE' : '❌ MISSING'}`);
});

// Final verdict
console.log('\n🎯 FINAL ASSESSMENT:');

if (avgQuality >= 70) {
  console.log('  🌟 TARGET ACHIEVED! Quality ≥ 70%');
  console.log('  Maya is providing sophisticated neurodivergent support');
} else if (avgQuality >= 60) {
  console.log('  ✅ STRONG PERFORMANCE! Quality 60-70%');
  console.log('  Close to target - minor tweaks needed');
} else if (avgQuality >= 50) {
  console.log('  📊 MODERATE PERFORMANCE. Quality 50-60%');
  console.log('  Core systems working but need optimization');
} else {
  console.log('  ⚠️ BELOW TARGET. Quality < 50%');
  console.log('  Check integration points and thresholds');
}

console.log('\n💡 Recommendations:');

if (!capabilities['Neurodivergent Validation']) {
  console.log('  → Add validation triggers for self-blame patterns');
}

if (!capabilities['Memory Accumulation']) {
  console.log('  → Fix memory extraction and persistence');
}

if (avgQuality < 60) {
  console.log('  → Lower elemental balance thresholds');
  console.log('  → Add more response variety');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');