#!/usr/bin/env ts-node
/**
 * Component Test - Conversation Analyzer
 * Focused testing of analysis capabilities
 */

import { conversationAnalyzer } from '../lib/oracle/ConversationAnalyzer';

console.log('🔬 CONVERSATION ANALYZER TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Clear previous history
conversationAnalyzer.clearHistory();

const testExchanges = [
  {
    user: "I'm feeling lost and confused",
    maya: "Feeling lost... what's that like?",
    expectedElements: ['water']
  },
  {
    user: "I keep making the same mistakes",
    maya: "What pattern do you notice in these mistakes?",
    expectedElements: ['air']
  },
  {
    user: "I want to change but don't know how",
    maya: "What would the first small step look like?",
    expectedElements: ['earth', 'fire']
  }
];

testExchanges.forEach((exchange, i) => {
  console.log(`\n${i + 1}. Analyzing exchange:`);
  console.log(`   User: "${exchange.user}"`);
  console.log(`   Maya: "${exchange.maya}"`);

  const analysis = conversationAnalyzer.analyze(exchange.user, exchange.maya);

  console.log(`   Quality Score: ${(analysis.overall * 100).toFixed(0)}%`);
  console.log(`   Recommendations: ${analysis.recommendations.slice(0, 2).join(', ')}`);
});

// Test history tracking
const history = conversationAnalyzer.getHistory();
console.log(`\n📊 HISTORY TRACKING`);
console.log(`   Tracked turns: ${history.length}`);

if (history.length > 0) {
  const avgScore = history.reduce((sum, turn) => sum + turn.analysis.overall, 0) / history.length;
  console.log(`   Average quality: ${(avgScore * 100).toFixed(0)}%`);
}

// Test trends
const trends = conversationAnalyzer.getTrends();
console.log(`\n📈 TRENDS ANALYSIS`);
console.log(`   Improvement areas: ${trends.improvementAreas.slice(0, 3).join(', ')}`);
console.log(`   Strength areas: ${trends.strengthAreas.slice(0, 3).join(', ')}`);

console.log('\n✅ Conversation Analyzer test complete!');