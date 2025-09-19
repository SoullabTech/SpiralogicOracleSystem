#!/usr/bin/env tsx
/**
 * End-to-end integration smoke test for:
 * - Maya conversation pipeline
 * - ConversationFixes with memory
 * - Body symptom tracking
 * - Elemental balance enforcement
 * - Debug tag verification
 */

import { ConversationFixes } from '../lib/oracle/ConversationFixes';
import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator';
import { SimpleConversationMemory } from '../lib/oracle/SimpleConversationMemory';
import fs from 'fs';
import path from 'path';

// Debug tag counters
const tagCounts: Record<string, number> = {
  'earth-body': 0,
  'fire-balance': 0,
  'air-balance': 0,
  'aether-echo': 0,
  'aether-balance': 0,
  'neuro-echo': 0,
  'memory': 0,
  'clarifier': 0,
  'echo': 0,
  'recap': 0
};

async function run() {
  console.log('\n🔗 MAIA Integration Smoke Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const testConversations = [
    {
      id: 'body-symptoms',
      turns: [
        "I've been overwhelmed, my stomach hurts when I work late",
        "The pain gets worse at night",
        "My head is spinning too",
        "I can't focus at all"
      ],
      expectTags: ['earth-body', 'memory']
    },
    {
      id: 'elemental-balance',
      turns: [
        "I feel so sad and lost", // Water
        "Everything is heavy", // Water
        "I don't know what to do", // Should trigger Fire
        "Nothing makes sense" // Should get Air
      ],
      expectTags: ['fire-balance', 'air-balance']
    },
    {
      id: 'neurodivergence',
      turns: [
        "My ADHD is really bad today",
        "The sensory stuff is overwhelming",
        "I keep shutting down",
        "Masking all day is exhausting"
      ],
      expectTags: ['neuro-echo']
    },
    {
      id: 'meaninglessness',
      turns: [
        "Everything feels meaningless",
        "There's just emptiness",
        "It's all pointless",
        "The void is consuming me"
      ],
      expectTags: ['aether-echo', 'aether-balance']
    }
  ];

  // Test 1: ConversationFixes with debug tags
  console.log('\n1️⃣ ConversationFixes Debug Tag Verification');
  console.log('───────────────────────────────────────────');

  const fixes = new ConversationFixes();
  fixes.setDebugMode(true);

  for (const conv of testConversations) {
    console.log(`\n📋 Test: ${conv.id}`);
    console.log('Expected tags:', conv.expectTags.join(', '));
    console.log();

    let foundExpected = false;

    for (let i = 0; i < conv.turns.length; i++) {
      const input = conv.turns[i];
      const response = fixes.generateResponse(input);

      // Extract tag
      const tagMatch = response.match(/\[([^\]]+)\]/);
      const tag = tagMatch ? tagMatch[1] : 'none';

      if (tag !== 'none') {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        if (conv.expectTags.includes(tag)) {
          foundExpected = true;
        }
      }

      console.log(`Turn ${i+1}: "${input}"`);
      console.log(`🌸 Maya: ${response}`);
      console.log(`   Tag: [${tag}]`);
    }

    console.log(`✓ Expected tags found: ${foundExpected ? 'YES ✅' : 'NO ❌'}`);
    fixes.reset();
  }

  // Test 2: Memory system integration
  console.log('\n\n2️⃣ Memory System Integration');
  console.log('───────────────────────────────────────────');

  const memory = new SimpleConversationMemory();

  // Simulate conversation with body symptoms
  console.log('\nTesting body symptom memory:');
  memory.recordBodySymptom('stomach', 'pain', 0.8);
  memory.recordBodySymptom('head', 'spinning', 0.6);
  memory.advanceTurn();
  memory.advanceTurn();
  memory.advanceTurn();

  const activeSymptoms = memory.getActiveBodySymptoms();
  console.log(`Active symptoms tracked: ${activeSymptoms.length}`);
  activeSymptoms.forEach(([part, state]) => {
    console.log(`  - ${part}: ${state.symptom} (intensity: ${state.intensity})`);
  });

  // Test memory-based response generation
  const memResponse = memory.generateContextAwareResponse("I'm feeling better now");
  console.log(`\nMemory-aware response: ${memResponse || 'None generated'}`);

  // Test question repetition prevention
  console.log('\nTesting repetition prevention:');
  memory.recordQuestion("How does that land in your body?");
  const isRepeat = memory.hasAskedRecently("how does that land in your body", 3);
  console.log(`Question repetition detected: ${isRepeat ? 'YES ✅' : 'NO ❌'}`);

  // Test 3: Maya Orchestrator integration
  console.log('\n\n3️⃣ Maya Orchestrator Integration');
  console.log('───────────────────────────────────────────');

  const maya = new MayaOrchestrator();

  const orchestratorTests = [
    { input: "My stomach hurts and I feel dizzy", expectElement: 'earth' },
    { input: "I have ADHD and can't focus", expectElement: 'water' },
    { input: "Everything feels meaningless", expectElement: 'aether' }
  ];

  for (const test of orchestratorTests) {
    try {
      const response = await maya.speak(test.input, 'test-user');
      const hasDebugTag = response.message.includes('[') && response.message.includes(']');

      console.log(`\nInput: "${test.input}"`);
      console.log(`Maya response: "${response.message.substring(0, 100)}..."`);
      console.log(`Element: ${response.element} (expected: ${test.expectElement})`);
      console.log(`Has debug tag: ${hasDebugTag ? 'YES' : 'NO'}`);
      console.log(`Using ConversationFixes: ${hasDebugTag ? 'YES ✅' : 'NO ❌'}`);
    } catch (err: any) {
      console.log(`Error: ${err.message}`);
    }
  }

  // Test 4: Component connectivity verification
  console.log('\n\n4️⃣ Component Connectivity');
  console.log('───────────────────────────────────────────');

  const components = {
    ConversationFixes: typeof ConversationFixes !== 'undefined',
    SimpleConversationMemory: typeof SimpleConversationMemory !== 'undefined',
    MayaOrchestrator: typeof MayaOrchestrator !== 'undefined'
  };

  Object.entries(components).forEach(([name, loaded]) => {
    console.log(`${name}: ${loaded ? 'LOADED ✅' : 'MISSING ❌'}`);
  });

  // Test 5: Debug tag statistics
  console.log('\n\n5️⃣ Debug Tag Statistics');
  console.log('───────────────────────────────────────────');

  const sortedTags = Object.entries(tagCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  sortedTags.forEach(([tag, count]) => {
    const bar = '▪'.repeat(Math.min(count, 20));
    console.log(`${tag.padEnd(15)} ${bar} (${count})`);
  });

  // Calculate totals by category
  const categories = {
    body: tagCounts['earth-body'] || 0,
    elemental: (tagCounts['fire-balance'] || 0) + (tagCounts['air-balance'] || 0),
    aether: (tagCounts['aether-echo'] || 0) + (tagCounts['aether-balance'] || 0),
    neuro: (tagCounts['neuro-echo'] || 0) + (tagCounts['neuro-marker'] || 0),
    memory: tagCounts['memory'] || 0,
    clarifier: tagCounts['clarifier'] || 0
  };

  console.log('\nCategory Totals:');
  Object.entries(categories).forEach(([cat, total]) => {
    if (total > 0) {
      console.log(`  ${cat}: ${total}`);
    }
  });

  // Final summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 Integration Test Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const totalTags = Object.values(tagCounts).reduce((a, b) => a + b, 0);
  const uniqueTags = Object.keys(tagCounts).filter(k => tagCounts[k] > 0).length;

  console.log(`Total responses processed: ${totalTags}`);
  console.log(`Unique tag types used: ${uniqueTags}`);
  console.log(`Body awareness active: ${categories.body > 0 ? 'YES ✅' : 'NO ❌'}`);
  console.log(`Elemental balance working: ${categories.elemental > 0 ? 'YES ✅' : 'NO ❌'}`);
  console.log(`Aether injection active: ${categories.aether > 0 ? 'YES ✅' : 'NO ❌'}`);
  console.log(`Neurodivergence support: ${categories.neuro > 0 ? 'YES ✅' : 'NO ❌'}`);
  console.log(`Memory system integrated: ${categories.memory > 0 ? 'YES ✅' : 'NO ❌'}`);

  console.log('\n✨ Integration test complete!');
}

// Run the test
run().catch(e => {
  console.error('\n❌ Fatal integration test error:', e);
  console.error(e.stack);
  process.exit(1);
});