#!/usr/bin/env node
// Test script for cohort percentage rollouts

// Inline cohort functions for testing (copied from cohorts.ts)
function stableHash(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function isEnabledForUser(userId, flag) {
  if (!flag.rollout.enabled) return false;
  if (flag.rollout.percentage >= 100) return true;
  if (flag.rollout.percentage <= 0) return false;
  
  const bucket = stableHash(userId + ":" + flag.key) % 100;
  return bucket < flag.rollout.percentage;
}

function getUserCohortInfo(userId, flag) {
  const bucket = stableHash(userId + ":" + flag.key) % 100;
  const enabled = isEnabledForUser(userId, flag);
  
  return {
    bucket,
    enabled,
    rolloutPercentage: flag.rollout.percentage,
    flagEnabled: flag.rollout.enabled,
  };
}

// Mock feature flag for testing
const mockFlag = {
  key: 'dreams',
  label: 'Dream Journaling', 
  category: 'UserFacing',
  dependsOn: [],
  rollout: { enabled: true, percentage: 30 }, // 30% rollout
  perfCost: { cpu: 'med', memory: 'low', latencyHintMs: 10 }
};

// Test user IDs
const testUsers = [
  'user-alice-123',
  'user-bob-456', 
  'user-charlie-789',
  'user-diana-012',
  'user-eve-345',
  'user-frank-678',
  'user-grace-901',
  'user-henry-234',
  'user-iris-567',
  'user-jack-890'
];

console.log('🧪 Testing Cohort Percentage Rollouts\n');
console.log(`Feature: ${mockFlag.label} (${mockFlag.rollout.percentage}% rollout)\n`);

let enabledCount = 0;
const results = [];

for (const userId of testUsers) {
  const enabled = isEnabledForUser(userId, mockFlag);
  const cohortInfo = getUserCohortInfo(userId, mockFlag);
  
  if (enabled) enabledCount++;
  
  results.push({
    userId: userId.split('-')[1], // Show just the name part
    bucket: cohortInfo.bucket,
    enabled,
    status: enabled ? '✅ Enabled' : '❌ Disabled'
  });
}

// Display results
console.log('User Bucketing Results:');
console.log('────────────────────────');
results.forEach(r => {
  console.log(`${r.userId.padEnd(8)} | Bucket ${r.bucket.toString().padStart(2)} | ${r.status}`);
});

console.log('\n📊 Summary:');
console.log(`Expected ~30% enabled: ${Math.round(testUsers.length * 0.3)} users`);
console.log(`Actually enabled: ${enabledCount} users (${Math.round(enabledCount/testUsers.length*100)}%)`);

// Test consistency (same user should get same result)
console.log('\n🔒 Testing Consistency:');
const testUserId = 'user-alice-123';
const results1 = Array.from({length: 5}, () => isEnabledForUser(testUserId, mockFlag));
const allSame = results1.every(r => r === results1[0]);
console.log(`Same user (${testUserId.split('-')[1]}) gets consistent result: ${allSame ? '✅ YES' : '❌ NO'}`);

// Test different percentages
console.log('\n📈 Testing Different Percentages:');
for (const pct of [0, 25, 50, 75, 100]) {
  const testFlag = { ...mockFlag, rollout: { enabled: true, percentage: pct }};
  const enabled = testUsers.filter(u => isEnabledForUser(u, testFlag)).length;
  const actualPct = Math.round(enabled/testUsers.length*100);
  console.log(`${pct}% rollout → ${enabled}/${testUsers.length} users (${actualPct}%)`);
}

console.log('\n✨ Cohort testing complete!');