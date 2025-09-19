#!/usr/bin/env tsx
/**
 * Debug Memory Accumulation - Why are Topics/Emotions empty?
 */

import { ConversationFixes } from '../lib/oracle/ConversationFixes';
import { SimpleConversationMemory } from '../lib/oracle/SimpleConversationMemory';

console.log('\n🔍 MEMORY ACCUMULATION DIAGNOSTIC');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Direct Memory Class Test
console.log('📋 Test 1: Direct SimpleConversationMemory');
console.log('───────────────────────────────────────────\n');

const memory = new SimpleConversationMemory();

const testInputs = [
  "I have ADHD and it's overwhelming",
  "Work stress is killing me",
  "I feel anxious and excited",
  "My stomach hurts when I think about meetings"
];

testInputs.forEach((input, i) => {
  console.log(`Input ${i+1}: "${input}"`);

  // Call all extraction methods
  memory.extractTopics(input);
  memory.extractEmotions(input);
  memory.updateProfile(input);

  // Check what was extracted
  console.log(`  Topics: ${Array.from(memory.topics).join(', ') || 'EMPTY ❌'}`);
  console.log(`  Emotions: ${Array.from(memory.emotions).join(', ') || 'EMPTY ❌'}`);

  // Check body symptoms
  const symptoms = memory.getActiveBodySymptoms();
  if (symptoms.length > 0) {
    console.log(`  Body: ${symptoms.map(([part, state]) => `${part}: ${state.symptom}`).join(', ')}`);
  } else {
    console.log(`  Body: EMPTY ❌`);
  }
  console.log();
});

// Test 2: ConversationFixes Integration
console.log('\n📋 Test 2: ConversationFixes Memory Integration');
console.log('───────────────────────────────────────────\n');

const fixes = new ConversationFixes();
fixes.setDebugMode(true);

// Enable memory debug
process.env.DEBUG_MEMORY = 'true';

console.log('Testing if ConversationFixes updates memory...\n');

testInputs.forEach((input, i) => {
  const result = fixes.generateResponse(input);

  // Try to access internal memory state
  // Note: This might need adjustment based on actual class structure
  console.log(`After input ${i+1}: "${input}"`);

  // Check if memory is being updated
  const stats = fixes.getStats();
  console.log(`  Rules fired: ${Object.entries(stats).filter(([k,v]) => v > 0).map(([k,v]) => `${k}: ${v}`).join(', ')}`);
  console.log();
});

// Test 3: Check extraction patterns
console.log('\n📋 Test 3: Pattern Matching Verification');
console.log('───────────────────────────────────────────\n');

const patterns = {
  topics: [
    { pattern: /work|job|career|office|meeting/i, topic: 'work', test: 'work meetings are stressful' },
    { pattern: /adhd|attention|focus|distract/i, topic: 'ADHD', test: 'my ADHD is acting up' },
    { pattern: /anxiety|stress|overwhelm/i, topic: 'anxiety', test: 'feeling overwhelmed today' }
  ],
  emotions: [
    { pattern: /anxious|worried|nervous|scared/i, emotion: 'anxiety', test: 'I am so anxious' },
    { pattern: /excited|happy|joy/i, emotion: 'excitement', test: 'feeling excited' },
    { pattern: /sad|down|depressed/i, emotion: 'sadness', test: 'feeling down' }
  ]
};

console.log('Testing Topic Patterns:');
patterns.topics.forEach(({ pattern, topic, test }) => {
  const matches = pattern.test(test);
  console.log(`  ${topic}: ${matches ? '✅ MATCHES' : '❌ FAILS'} on "${test}"`);
});

console.log('\nTesting Emotion Patterns:');
patterns.emotions.forEach(({ pattern, emotion, test }) => {
  const matches = pattern.test(test);
  console.log(`  ${emotion}: ${matches ? '✅ MATCHES' : '❌ FAILS'} on "${test}"`);
});

// Test 4: Direct method calls
console.log('\n📋 Test 4: Direct Method Call Chain');
console.log('───────────────────────────────────────────\n');

const testMemory = new SimpleConversationMemory();
const testInput = "I have ADHD and feel anxious about work";

console.log(`Testing: "${testInput}"\n`);

// Test each method individually
console.log('Calling extractTopics()...');
testMemory.extractTopics(testInput);
console.log(`  Topics after: [${Array.from(testMemory.topics).join(', ')}]`);

console.log('\nCalling extractEmotions()...');
testMemory.extractEmotions(testInput);
console.log(`  Emotions after: [${Array.from(testMemory.emotions).join(', ')}]`);

console.log('\nCalling updateProfile()...');
testMemory.updateProfile(testInput);
console.log(`  Topics after updateProfile: [${Array.from(testMemory.topics).join(', ')}]`);
console.log(`  Emotions after updateProfile: [${Array.from(testMemory.emotions).join(', ')}]`);

// Test 5: Check if properties exist
console.log('\n📋 Test 5: Memory Object Structure');
console.log('───────────────────────────────────────────\n');

const structureTest = new SimpleConversationMemory();
console.log('SimpleConversationMemory properties:');
console.log(`  has 'topics': ${structureTest.topics !== undefined ? '✅' : '❌'}`);
console.log(`  has 'emotions': ${structureTest.emotions !== undefined ? '✅' : '❌'}`);
console.log(`  topics is Set: ${structureTest.topics instanceof Set ? '✅' : '❌'}`);
console.log(`  emotions is Set: ${structureTest.emotions instanceof Set ? '✅' : '❌'}`);

// Summary
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 DIAGNOSTIC SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Potential issues to investigate:');
console.log('  1. Check if extraction methods are being called');
console.log('  2. Verify regex patterns match input format');
console.log('  3. Ensure memory object is properly initialized');
console.log('  4. Confirm memory is passed between components');
console.log('  5. Check if reset() is being called prematurely');
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');