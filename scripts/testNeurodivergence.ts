#!/usr/bin/env tsx
/**
 * Test script for neurodivergence-aware conversation handling
 * Tests ADHD, sensory, overwhelm responses and loop prevention
 */

import { conversationFixes } from '../lib/oracle/ConversationFixes';
import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator';

const scenarios = [
  "I've been so overwhelmed lately, my ADHD makes it hard to keep up.",
  "Noise and lights at work are just too much sometimes.",
  "I just shut down when it piles up.",
  "Sometimes I also feel excited, like bursts of energy.",
  "It makes my head spin and my stomach hurt.",
  "I get distracted so easily when I try to focus.",
  "I go into hyperfocus and lose track of time.",
  "The sensory stuff is overwhelming today",
  "My executive function is just gone",
  "I've been masking all day and I'm exhausted"
];

async function runNeuroTest() {
  console.log("\n🧠 NEURODIVERGENCE CONVERSATION TEST");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Aggregate tracking
  const ruleCount: Record<string, number> = {};
  const elementCount: Record<string, number> = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
  let qualityScores: number[] = [];
  let markerCount = 0;

  console.log("📝 Testing ConversationFixes module directly:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Test ConversationFixes directly
  for (let i = 0; i < scenarios.length; i++) {
    const input = scenarios[i];
    const response = conversationFixes.generateResponse(input);

    console.log(`[Turn ${i + 1}] You: ${input}`);
    console.log(`🌸 Maya: ${response}`);

    // Track which rule fired
    const ruleMatch = response.match(/^\[(.*?)\]/);
    if (ruleMatch) {
      const rule = ruleMatch[1];
      console.log(`   📌 Rule: ${rule}`);
      ruleCount[rule] = (ruleCount[rule] || 0) + 1;
    }

    // Analyze quality based on response characteristics
    let quality = 20; // baseline
    let element = 'earth'; // default

    if (ruleMatch) {
      const rule = ruleMatch[1];

      // Rule-based quality adjustment
      if (rule.includes('neuro')) {
        quality += 30;
        element = 'water';
      } else if (rule === 'echo') {
        quality += 25;
        element = 'water';
      } else if (rule === 'recap') {
        quality += 20;
        element = 'air';
      } else if (rule === 'loop-break') {
        quality += 15;
        element = 'aether';
      } else if (rule === 'marker' || rule.includes('marker')) {
        quality += 10;
        element = 'aether';
        markerCount++;
      } else if (rule === 'confusion') {
        quality -= 5;
        element = 'earth';
      } else if (rule === 'clarifier') {
        quality += 5;
        element = 'earth';
      }
    }

    // Additional quality boost for content engagement
    const lowerResponse = response.toLowerCase();
    if (lowerResponse.includes('adhd') || lowerResponse.includes('sensory') || lowerResponse.includes('overwhelm')) {
      quality += 10;
    }

    qualityScores.push(quality);
    elementCount[element]++;

    // Display quality bar
    const qualityBar = '█'.repeat(Math.floor(quality / 5)) + '░'.repeat(20 - Math.floor(quality / 5));
    console.log(`   📊 Quality: ${qualityBar} ${quality}%`);
    console.log(`   🌟 Element: ${element}`);
    console.log();
  }

  // Calculate aggregates
  const avgQuality = Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length);
  const minQuality = Math.min(...qualityScores);
  const maxQuality = Math.max(...qualityScores);

  // Find strongest element
  const sortedElements = Object.entries(elementCount).sort((a, b) => b[1] - a[1]);
  const [strongestElement, strongestCount] = sortedElements[0];
  const [weakestElement, weakestCount] = sortedElements[sortedElements.length - 1];

  // Most used rules
  const sortedRules = Object.entries(ruleCount).sort((a, b) => b[1] - a[1]);

  console.log("\n📊 AGGREGATE SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Average Quality: ${avgQuality}% (min: ${minQuality}%, max: ${maxQuality}%)`);
  console.log(`Quality Trend: ${qualityScores.map(q => q >= 40 ? '↑' : q >= 30 ? '→' : '↓').join(' ')}`);
  console.log();
  console.log("🎯 Rule Distribution:");
  sortedRules.forEach(([rule, count]) => {
    const bar = '▪'.repeat(count);
    console.log(`  ${rule}: ${bar} (${count})`);
  });
  console.log();
  console.log("🌟 Elemental Balance:");
  Object.entries(elementCount).forEach(([elem, count]) => {
    const percentage = Math.round((count / scenarios.length) * 100);
    const bar = '■'.repeat(Math.floor(percentage / 10));
    console.log(`  ${elem.toUpperCase()}: ${bar} ${percentage}%`);
  });
  console.log();
  console.log(`Strongest Element: ${strongestElement.toUpperCase()} (${strongestCount} turns)`);
  console.log(`Weakest Element: ${weakestElement.toUpperCase()} (${weakestCount} turns)`);
  console.log(`Transformation Markers: ${markerCount}`);

  // Get final statistics from ConversationFixes
  const stats = conversationFixes.getStats();
  console.log("\n📈 Module Statistics:");
  Object.entries(stats).forEach(([stat, count]) => {
    if (count > 0) {
      console.log(`  ${stat}: ${count}`);
    }
  });

  // Recommendations based on analysis
  console.log("\n💡 RECOMMENDATIONS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (avgQuality < 40) {
    console.log("⚠️ Quality below target (40%). Issues:");
  }

  if (elementCount.fire === 0) {
    console.log("  - No Fire element: Add challenge/growth questions");
  }

  if (elementCount.water < 3) {
    console.log("  - Low Water element: Increase emotional attunement");
  }

  if (elementCount.aether < 2) {
    console.log("  - Low Aether element: Add spacious pauses and meaning");
  }

  if (ruleCount['confusion'] > 2) {
    console.log("  - High confusion responses: Improve context tracking");
  }

  if (ruleCount['clarifier'] > 4) {
    console.log("  - Overusing clarifiers: More specific echoing needed");
  }

  console.log("\n✅ Test complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Now test Maya Orchestrator integration
  console.log("🔍 TESTING MAYA ORCHESTRATOR INTEGRATION:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const maya = new MayaOrchestrator();
  const integrationTests = [
    "I have ADHD and it's overwhelming",
    "The sensory stuff is too much",
    "I keep shutting down"
  ];

  for (const input of integrationTests) {
    const mayaResponse = await maya.speak(input, 'test-user');
    console.log(`Input: "${input}"`);
    console.log(`Maya Response: "${mayaResponse.message}"`);
    console.log(`Element: ${mayaResponse.element}`);

    // Check if ConversationFixes is being used
    const hasDebugTag = mayaResponse.message.match(/^\[.*?\]/);
    console.log(`Using ConversationFixes: ${hasDebugTag ? 'YES ✅' : 'NO ❌'}`);
    console.log();
  }

  // Reset for next run
  conversationFixes.reset();
}

// Run the test
runNeuroTest().catch(console.error);