#!/usr/bin/env tsx
/**
 * Debug Elemental Balancer - Why isn't it firing consistently?
 */

import { ElementalBalancer } from '../lib/oracle/ElementalBalancer';

console.log('\n🔥 ELEMENTAL BALANCER DIAGNOSTIC');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const balancer = new ElementalBalancer();

// Test scenarios that SHOULD trigger balance enforcement
const testScenarios = [
  {
    name: 'High Earth (Body Symptoms)',
    state: {
      earth: 0.7,  // Strong body symptoms
      water: 1,
      air: 1,
      fire: 0,
      aether: 0,
      lastElements: ['earth', 'earth']
    },
    expected: 'fire-urgent'
  },
  {
    name: 'Water Overflow',
    state: {
      earth: 0.3,
      water: 3,  // Multiple emotions
      air: 1,
      fire: 0,
      aether: 0,
      lastElements: ['water', 'water']
    },
    expected: 'fire-high'
  },
  {
    name: 'Water + Paradox',
    state: {
      earth: 0.2,
      water: 2,
      air: 1,
      fire: 0,
      aether: 0.6,  // Paradox detected
      lastElements: ['water', 'water']
    },
    expected: 'aether-high'
  },
  {
    name: 'Earth/Air Loop',
    state: {
      earth: 0.4,
      water: 1,
      air: 2,
      fire: 0,
      aether: 0,
      lastElements: ['earth', 'air', 'earth', 'air']
    },
    expected: 'aether-normal'
  },
  {
    name: 'Repetition Pattern',
    state: {
      earth: 0.3,
      water: 1,
      air: 1,
      fire: 0,
      aether: 0,
      lastElements: ['water', 'water', 'water']
    },
    expected: 'fire or aether'
  },
  {
    name: 'Balanced State (No Override)',
    state: {
      earth: 0.3,
      water: 1,
      air: 1,
      fire: 0.3,
      aether: 0.2,
      lastElements: ['earth', 'water', 'fire']
    },
    expected: 'none'
  }
];

console.log('Testing balance enforcement rules:\n');

let successCount = 0;
let failureCount = 0;

testScenarios.forEach((scenario, i) => {
  console.log(`Test ${i + 1}: ${scenario.name}`);
  console.log(`  State: Earth=${scenario.state.earth}, Water=${scenario.state.water}, Air=${scenario.state.air}`);
  console.log(`  Last elements: [${scenario.state.lastElements.join(', ')}]`);

  const result = balancer.enforce(scenario.state);

  if (result) {
    console.log(`  ✅ TRIGGERED: ${result.element}-${result.priority}`);
    console.log(`  Response: "${result.response.substring(0, 50)}..."`);
    successCount++;

    // Check if it matches expected
    const matchesExpected = scenario.expected.includes(result.element) ||
                          scenario.expected.includes(result.priority);
    if (!matchesExpected && scenario.expected !== 'fire or aether') {
      console.log(`  ⚠️ WARNING: Expected ${scenario.expected}, got ${result.element}-${result.priority}`);
    }
  } else {
    console.log(`  ❌ NO OVERRIDE`);
    if (scenario.expected !== 'none') {
      console.log(`  ⚠️ ERROR: Expected ${scenario.expected}, got nothing!`);
      failureCount++;
    }
  }
  console.log();
});

// Test specific thresholds
console.log('\n📊 THRESHOLD TESTS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const thresholdTests = [
  { earth: 0.5, expected: 'no trigger' },
  { earth: 0.6, expected: 'TRIGGER fire-urgent' },
  { earth: 0.7, expected: 'TRIGGER fire-urgent' },
  { earth: 0.9, expected: 'TRIGGER fire-urgent' }
];

console.log('Testing Earth threshold (0.6):');
thresholdTests.forEach(test => {
  const state = {
    earth: test.earth,
    water: 1,
    air: 1,
    fire: 0,
    aether: 0,
    lastElements: []
  };

  const result = balancer.enforce(state);
  const triggered = result && result.priority === 'urgent';

  console.log(`  Earth=${test.earth}: ${triggered ? '✅ Triggered' : '❌ No trigger'} (expected: ${test.expected})`);
});

// Test Water thresholds
console.log('\nTesting Water threshold (2):');
const waterTests = [
  { water: 1, expected: 'no trigger' },
  { water: 2, expected: 'depends on aether' },
  { water: 3, expected: 'TRIGGER fire-high' },
  { water: 4, expected: 'TRIGGER fire-high' }
];

waterTests.forEach(test => {
  const state = {
    earth: 0.3,
    water: test.water,
    air: 1,
    fire: 0,
    aether: 0,
    lastElements: []
  };

  const result = balancer.enforce(state);
  const triggered = result !== null;

  console.log(`  Water=${test.water}: ${triggered ? '✅ Triggered' : '❌ No trigger'} (expected: ${test.expected})`);
});

// Summary
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 DIAGNOSTIC SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`Tests passed: ${successCount}/${testScenarios.length}`);
console.log(`Critical failures: ${failureCount}`);

console.log('\nKey Findings:');
if (failureCount > 0) {
  console.log('  ⚠️ Some balance rules are not triggering as expected');
  console.log('  → Check threshold values and condition logic');
  console.log('  → Verify lastElements array is being populated correctly');
}

if (successCount === testScenarios.length) {
  console.log('  ✅ All balance rules are working correctly!');
  console.log('  → If still seeing 0% in tests, check integration point');
  console.log('  → Ensure ElementsState is calculated correctly from memory');
}

console.log('\nRecommendations:');
console.log('  1. Lower Water threshold from 3 to 2 for earlier intervention');
console.log('  2. Add Fire injection when Water >= 2 without paradox');
console.log('  3. Track element repetitions more aggressively');
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');