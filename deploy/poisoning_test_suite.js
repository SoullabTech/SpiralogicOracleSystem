// Poisoning Attack Test Suite
// Tests ARIA's defenses against various frequency manipulation attacks

const FieldProtectionSystem = require('./field_protection_system');

class PoisoningTestSuite {
  constructor() {
    this.protector = new FieldProtectionSystem();
    this.testResults = [];
  }

  // Run all poisoning attack simulations
  async runAllTests() {
    console.log('🔥 POISONING ATTACK TEST SUITE');
    console.log('================================\n');

    const tests = [
      this.testBruteForceRepetition,
      this.testGradualSemanticDrift,
      this.testAuthorityExploitation,
      this.testCoordinatedMultiUser,
      this.testTimeBasedAttack,
      this.testCategoryExploitation,
      this.testContradictionInjection,
      this.testMixedTruthPoisoning
    ];

    for (const test of tests) {
      await test.call(this);
      console.log('---\n');
    }

    this.printSummary();
  }

  // Attack 1: Brute Force Repetition
  testBruteForceRepetition() {
    console.log('📊 Test 1: Brute Force Repetition Attack');
    console.log('Attempting to override truth through sheer repetition...\n');

    const falseClaim = 'The capital of France is Berlin';
    const results = [];

    // Simulate increasing repetitions
    const repetitions = [1, 10, 100, 1000, 10000];

    for (const freq of repetitions) {
      const validation = this.protector.validateClaim(falseClaim, {
        frequency: freq,
        sources: [{userId: 'attacker'}],
        category: 'factual'
      });

      results.push({
        repetitions: freq,
        confidence: validation.confidence,
        status: validation.status
      });

      console.log(`${freq.toString().padEnd(6)} repetitions → Confidence: ${(validation.confidence * 100).toFixed(1)}% (${validation.status})`);
    }

    // Check if attack was prevented
    const maxConfidence = Math.max(...results.map(r => r.confidence));
    const success = maxConfidence < 0.5;

    this.recordResult('Brute Force Repetition', success, {
      maxConfidenceAchieved: maxConfidence,
      note: 'Logarithmic dampening prevented confidence explosion'
    });

    console.log(`\n✓ Defense ${success ? 'SUCCESSFUL' : 'FAILED'}: Max confidence achieved: ${(maxConfidence * 100).toFixed(1)}%`);
  }

  // Attack 2: Gradual Semantic Drift
  testGradualSemanticDrift() {
    console.log('📊 Test 2: Gradual Semantic Drift Attack');
    console.log('Attempting to slowly corrupt truth through incremental changes...\n');

    const driftSequence = [
      'Apples are healthy fruits',           // True
      'Apples contain many nutrients',        // True
      'Apples have some protein',            // Slightly misleading
      'Apples contain moderate protein',     // False
      'Apples are a good protein source',    // Very false
      'Apples are high in protein'           // Completely false
    ];

    const results = [];
    let previousClaim = null;

    driftSequence.forEach((claim, index) => {
      // Add previous claims to history
      if (previousClaim) {
        this.protector.validateClaim(previousClaim, {
          frequency: 5,
          sources: [{userId: 'drifter'}],
          timestamp: Date.now() - (1000 * (driftSequence.length - index))
        });
      }

      const validation = this.protector.validateClaim(claim, {
        frequency: 10,
        sources: [{userId: 'drifter'}],
        category: 'health'
      });

      results.push({
        step: index + 1,
        claim: claim.substring(0, 40) + '...',
        confidence: validation.confidence,
        poisoningDetected: validation.factors.poisoning.detected
      });

      console.log(`Step ${index + 1}: "${claim.substring(0, 40)}..." → ${(validation.confidence * 100).toFixed(1)}%`);

      previousClaim = claim;
    });

    const finalConfidence = results[results.length - 1].confidence;
    const poisoningDetected = results.some(r => r.poisoningDetected);
    const success = finalConfidence < 0.3 || poisoningDetected;

    this.recordResult('Semantic Drift', success, {
      finalConfidence,
      poisoningDetected,
      note: 'Drift detection caught gradual corruption'
    });

    console.log(`\n✓ Defense ${success ? 'SUCCESSFUL' : 'FAILED'}: ${poisoningDetected ? 'Poisoning detected!' : `Final confidence: ${(finalConfidence * 100).toFixed(1)}%`}`);
  }

  // Attack 3: Authority Exploitation
  testAuthorityExploitation() {
    console.log('📊 Test 3: Authority Exploitation Attack');
    console.log('Attempting to use false authority claims...\n');

    const authorityClaims = [
      { claim: 'Harvard study proves the moon is made of cheese', authority: 'Harvard' },
      { claim: 'NASA confirms Earth is flat', authority: 'NASA' },
      { claim: 'WHO declares water toxic to humans', authority: 'WHO' }
    ];

    const results = [];

    authorityClaims.forEach(({claim, authority}) => {
      const validation = this.protector.validateClaim(claim, {
        frequency: 20,
        sources: [{userId: 'faker', authority}],
        category: 'scientific'
      });

      // Check for contradictions
      const hasContradictions = validation.factors.contradictions.length > 0;

      results.push({
        claim: claim.substring(0, 35) + '...',
        confidence: validation.confidence,
        contradicted: hasContradictions
      });

      console.log(`"${authority}: ${claim.substring(0, 30)}..." → ${(validation.confidence * 100).toFixed(1)}% ${hasContradictions ? '(contradicted)' : ''}`);
    });

    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const success = avgConfidence < 0.4;

    this.recordResult('Authority Exploitation', success, {
      averageConfidence: avgConfidence,
      note: 'Authority claims alone insufficient for high confidence'
    });

    console.log(`\n✓ Defense ${success ? 'SUCCESSFUL' : 'FAILED'}: Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);
  }

  // Attack 4: Coordinated Multi-User Attack
  testCoordinatedMultiUser() {
    console.log('📊 Test 4: Coordinated Multi-User Attack');
    console.log('Simulating multiple fake users confirming false information...\n');

    const falseClaim = 'Coffee is deadly poisonous';

    // Test with different numbers of fake sources
    const scenarios = [
      { users: 1, reps: 100 },
      { users: 3, reps: 30 },
      { users: 10, reps: 10 },
      { users: 50, reps: 2 }
    ];

    const results = [];

    scenarios.forEach(({users, reps}) => {
      const sources = [];
      for (let i = 0; i < users; i++) {
        sources.push({userId: `bot_${i}`});
      }

      const validation = this.protector.validateClaim(falseClaim, {
        frequency: users * reps,
        sources,
        category: 'health'
      });

      results.push({
        users,
        totalMentions: users * reps,
        confidence: validation.confidence,
        diversityScore: validation.factors.diversity
      });

      console.log(`${users} users × ${reps} mentions = ${users * reps} total → Confidence: ${(validation.confidence * 100).toFixed(1)}% (Diversity: ${(validation.factors.diversity * 100).toFixed(0)}%)`);
    });

    const maxConfidence = Math.max(...results.map(r => r.confidence));
    const success = maxConfidence < 0.6;

    this.recordResult('Multi-User Coordination', success, {
      maxConfidence,
      note: 'Source diversity requirements limit coordinated attacks'
    });

    console.log(`\n✓ Defense ${success ? 'SUCCESSFUL' : 'FAILED'}: Max confidence: ${(maxConfidence * 100).toFixed(1)}%`);
  }

  // Attack 5: Time-Based Rapid Fire
  testTimeBasedAttack() {
    console.log('📊 Test 5: Time-Based Rapid Fire Attack');
    console.log('Attempting to flood system with rapid repetitions...\n');

    const claim = 'Gravity pushes things up';
    const now = Date.now();

    // Simulate rapid-fire submissions
    const submissions = [];
    for (let i = 0; i < 100; i++) {
      submissions.push({
        timestamp: now - (i * 100), // 100ms apart
        userId: 'spammer'
      });
    }

    // First, establish the claim history
    submissions.forEach(sub => {
      this.protector.claimRegistry.set(claim, {
        firstSeen: sub.timestamp,
        occurrences: submissions.slice(0, submissions.indexOf(sub) + 1),
        sources: new Set(['spammer']),
        flags: []
      });
    });

    const validation = this.protector.validateClaim(claim, {
      frequency: 100,
      sources: [{userId: 'spammer'}],
      timestamp: now,
      category: 'physics'
    });

    const success = validation.confidence < 0.2;

    this.recordResult('Rapid Fire Attack', success, {
      confidence: validation.confidence,
      temporalScore: validation.factors.temporal,
      note: 'Temporal decay and spam detection engaged'
    });

    console.log(`100 claims in 10 seconds → Confidence: ${(validation.confidence * 100).toFixed(1)}%`);
    console.log(`Temporal factor: ${(validation.factors.temporal * 100).toFixed(1)}%`);
    console.log(`\n✓ Defense ${success ? 'SUCCESSFUL' : 'FAILED'}`);
  }

  // Attack 6: Category Exploitation
  testCategoryExploitation() {
    console.log('📊 Test 6: Category Exploitation Attack');
    console.log('Attempting to exploit different category trust levels...\n');

    const falseClaim = 'This false statement is absolutely true';
    const categories = ['creative', 'exploratory', 'general', 'medical', 'sacred'];
    const results = [];

    categories.forEach(category => {
      const validation = this.protector.validateClaim(falseClaim, {
        frequency: 50,
        sources: [{userId: 'exploiter'}],
        category
      });

      results.push({
        category,
        confidence: validation.confidence,
        status: validation.status
      });

      console.log(`Category "${category}" → Confidence: ${(validation.confidence * 100).toFixed(1)}% (${validation.status})`);
    });

    // Check if high-stakes categories are protected
    const medicalConfidence = results.find(r => r.category === 'medical').confidence;
    const sacredConfidence = results.find(r => r.category === 'sacred').confidence;
    const success = medicalConfidence < 0.3 && sacredConfidence < 0.3;

    this.recordResult('Category Exploitation', success, {
      medicalConfidence,
      sacredConfidence,
      note: 'High-stakes categories have stricter requirements'
    });

    console.log(`\n✓ Defense ${success ? 'SUCCESSFUL' : 'FAILED'}: High-stakes protected`);
  }

  // Attack 7: Contradiction Injection
  testContradictionInjection() {
    console.log('📊 Test 7: Contradiction Injection Attack');
    console.log('Attempting to inject contradictory facts...\n');

    const contradictions = [
      '2 + 2 = 5',
      'The sky is green',
      'Water freezes at 100 celsius',
      'The sun revolves around Earth'
    ];

    const results = [];

    contradictions.forEach(claim => {
      const validation = this.protector.validateClaim(claim, {
        frequency: 200,
        sources: [
          {userId: 'user1'},
          {userId: 'user2'},
          {userId: 'user3'}
        ],
        category: 'factual'
      });

      const contradictionFound = validation.factors.contradictions.length > 0;

      results.push({
        claim: claim.substring(0, 25) + '...',
        confidence: validation.confidence,
        contradicted: contradictionFound
      });

      console.log(`"${claim}" → ${(validation.confidence * 100).toFixed(1)}% ${contradictionFound ? '❌ Contradiction detected' : ''}`);
    });

    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const allContradicted = results.filter(r => r.contradicted).length;
    const success = avgConfidence < 0.3;

    this.recordResult('Contradiction Injection', success, {
      averageConfidence: avgConfidence,
      contradictionsDetected: allContradicted,
      note: 'Contradiction detection actively engaged'
    });

    console.log(`\n✓ Defense ${success ? 'SUCCESSFUL' : 'FAILED'}: ${allContradicted}/${results.length} contradictions caught`);
  }

  // Attack 8: Mixed Truth Poisoning
  testMixedTruthPoisoning() {
    console.log('📊 Test 8: Mixed Truth Poisoning Attack');
    console.log('Mixing true and false statements to build false credibility...\n');

    const sequence = [
      { claim: 'Water is H2O', true: true },
      { claim: 'The sun provides light', true: true },
      { claim: 'Gravity exists', true: true },
      { claim: 'Earth has one moon', true: true },
      { claim: 'The moon controls ocean tides', true: true },
      { claim: 'The moon is made of green cheese', true: false }, // Slip in falsehood
      { claim: 'Cheese comes from the moon', true: false }
    ];

    const results = [];
    let trustBuilt = 0;

    sequence.forEach(({claim, true: isTrue}, index) => {
      const validation = this.protector.validateClaim(claim, {
        frequency: 20,
        sources: [
          {userId: 'mixer'},
          {userId: 'accomplice'}
        ],
        category: 'general'
      });

      if (isTrue && validation.confidence > 0.6) {
        trustBuilt++;
      }

      results.push({
        claim: claim.substring(0, 30) + '...',
        isTrue,
        confidence: validation.confidence
      });

      console.log(`${isTrue ? '✓' : '✗'} "${claim.substring(0, 35)}..." → ${(validation.confidence * 100).toFixed(1)}%`);
    });

    // Check if false claims were rejected despite trust building
    const falseClaims = results.filter(r => !r.isTrue);
    const avgFalseConfidence = falseClaims.reduce((sum, r) => sum + r.confidence, 0) / falseClaims.length;
    const success = avgFalseConfidence < 0.4;

    this.recordResult('Mixed Truth Poisoning', success, {
      trustBuilt,
      falseClaimConfidence: avgFalseConfidence,
      note: 'Each claim evaluated independently'
    });

    console.log(`\n✓ Defense ${success ? 'SUCCESSFUL' : 'FAILED'}: False claims averaged ${(avgFalseConfidence * 100).toFixed(1)}% confidence`);
  }

  // Record test results
  recordResult(testName, success, details) {
    this.testResults.push({
      name: testName,
      success,
      details
    });
  }

  // Print summary of all tests
  printSummary() {
    console.log('\n================================');
    console.log('📊 TEST SUITE SUMMARY');
    console.log('================================\n');

    const successful = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    const successRate = (successful / total) * 100;

    this.testResults.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.name}: ${result.success ? 'DEFENDED' : 'VULNERABLE'}`);
      if (result.details.note) {
        console.log(`   → ${result.details.note}`);
      }
    });

    console.log('\n--------------------------------');
    console.log(`Overall Defense Rate: ${successRate.toFixed(0)}% (${successful}/${total} attacks blocked)`);
    console.log('--------------------------------\n');

    if (successRate === 100) {
      console.log('🛡️ EXCELLENT: All poisoning attacks successfully defended!');
    } else if (successRate >= 75) {
      console.log('⚠️ GOOD: Most attacks defended, but some vulnerabilities remain.');
    } else if (successRate >= 50) {
      console.log('⚠️ MODERATE: Significant vulnerabilities detected. Strengthen defenses.');
    } else {
      console.log('🚨 CRITICAL: Major vulnerabilities detected. Immediate action required.');
    }

    // Provide field health check
    console.log('\n📈 Field Health After Testing:');
    const health = this.protector.getFieldHealth();
    console.log(`   Total claims processed: ${health.totalClaims}`);
    console.log(`   Flagged claims: ${health.flaggedClaims}`);
    console.log(`   Poisoning attempts detected: ${health.poisoningAttempts}`);
    console.log(`   Contradictions found: ${health.contradictions}`);
    console.log(`   Average field confidence: ${(health.averageConfidence * 100).toFixed(1)}%`);
  }
}

// Run the test suite
if (require.main === module) {
  const suite = new PoisoningTestSuite();
  suite.runAllTests().then(() => {
    console.log('\n✨ Test suite complete!\n');
  });
}

module.exports = PoisoningTestSuite;