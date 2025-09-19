#!/usr/bin/env tsx
/**
 * Test body symptom recognition and elemental balance
 */

import { ConversationFixes } from '../lib/oracle/ConversationFixes';

const fixes = new ConversationFixes();
fixes.setDebugMode(true);

const testScenarios = [
  {
    name: "Body Symptoms Recognition",
    inputs: [
      "my head hurts and my stomach is churning",
      "I can't focus at all",
      "my chest is so tight I can't breathe",
      "I keep shaking and trembling",
      "feeling dizzy and lightheaded"
    ]
  },
  {
    name: "Elemental Balance Enforcement",
    inputs: [
      "I feel so sad and overwhelmed", // Water
      "it's all just heavy", // Water
      "everything hurts", // Should trigger Fire injection
      "I don't know what to do", // Response
      "nothing makes sense anymore" // Should get Air
    ]
  },
  {
    name: "Aether Injection for Meaninglessness",
    inputs: [
      "everything feels meaningless",
      "it's all pointless",
      "I feel empty inside",
      "there's just a void",
      "nothing matters anymore"
    ]
  }
];

console.log("\n🧪 BODY SYMPTOM & ELEMENTAL BALANCE TEST");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

const stats: Record<string, number> = {};

testScenarios.forEach(scenario => {
  console.log(`📋 ${scenario.name}`);
  console.log("───────────────────────────────────────────\n");

  scenario.inputs.forEach((input, i) => {
    const response = fixes.generateResponse(input);

    // Track which tags appear
    const tagMatch = response.match(/\[([^\]]+)\]/);
    if (tagMatch) {
      const tag = tagMatch[1];
      stats[tag] = (stats[tag] || 0) + 1;
    }

    console.log(`Turn ${i+1}: "${input}"`);
    console.log(`🌸 Maya: ${response}`);

    // Show element if detected
    if (response.includes('[earth-body]')) {
      console.log(`   🌍 Earth element (embodiment)`);
    } else if (response.includes('[fire-balance]')) {
      console.log(`   🔥 Fire element (challenge/growth)`);
    } else if (response.includes('[air-balance]')) {
      console.log(`   💨 Air element (clarity)`);
    } else if (response.includes('[aether-echo]') || response.includes('[aether-balance]')) {
      console.log(`   ✨ Aether element (spaciousness)`);
    } else if (response.includes('[neuro-echo]') || response.includes('[water]')) {
      console.log(`   💧 Water element (empathy)`);
    }

    console.log();
  });

  fixes.reset(); // Reset between scenarios
  console.log();
});

// Final statistics
console.log("\n📊 RULE DISTRIBUTION");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

Object.entries(stats).forEach(([tag, count]) => {
  const bar = "▪".repeat(count);
  console.log(`  ${tag}: ${bar} (${count})`);
});

// Get conversation stats
const convStats = fixes.getStats();
console.log("\n📈 CONVERSATION METRICS");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
Object.entries(convStats).forEach(([metric, count]) => {
  if (count > 0) {
    console.log(`  ${metric}: ${count}`);
  }
});

console.log("\n✅ Body symptom test complete!");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");