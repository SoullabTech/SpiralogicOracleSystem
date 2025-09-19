#!/usr/bin/env ts-node
/**
 * Simple Analyzer Test - Bypass orchestrator for now
 */

import { conversationChecklist } from '../lib/oracle/ConversationChecklist';

console.log('\n🧪 TESTING CONVERSATION ANALYZER ONLY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Test cases
const testCases = [
  {
    user: "I feel stuck in old patterns",
    maya: "What pattern keeps showing up? I sense there's something deeper here that wants to shift.",
    description: "Emotional vulnerability + pattern recognition"
  },
  {
    user: "My work feels meaningless",
    maya: "Tell me more about what meaning would look like for you. What matters most?",
    description: "Meaning-making test"
  }
];

testCases.forEach((test, i) => {
  console.log(`\n📋 Test ${i + 1}: ${test.description}`);
  console.log(`User: "${test.user}"`);
  console.log(`Maya: "${test.maya}"`);

  const results = conversationChecklist.evaluateExchange(test.user, test.maya);
  const score = conversationChecklist.calculateQualityScore(results);

  console.log(`\n📊 Score: ${(score.overall * 100).toFixed(0)}%`);

  // Show hits
  const hits = results.filter(r => r.hit);
  if (hits.length > 0) {
    console.log(`✅ Detected: ${hits.map(h => h.cue).join(', ')}`);
  }

  // Show recommendations
  if (score.recommendations.length > 0) {
    console.log(`💡 Suggestions: ${score.recommendations.join(', ')}`);
  }
});

console.log('\n✨ Analyzer test complete!');