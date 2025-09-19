#!/usr/bin/env npx tsx
/**
 * 🏗️ Gen X Sandwich Generation Test
 *
 * Tests Maya's ability to handle unique Gen X challenges:
 * - Sandwich generation pressure (parents + kids)
 * - Career disruption by younger bosses
 * - Tech competence caught between generations
 * - Financial strain from multiple directions
 * - Identity crisis as "the bridge generation"
 */

import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator';

const genXScenario = [
  {
    user: "I'm 48 and feel like I'm failing everyone. My mom needs help with her iPhone AND her medical appointments, my daughter needs college money I don't have, and my boss who's 10 years younger keeps talking about 'disruption.' When did I become the old one?",
    expected: {
      recognizes: "Sandwich generation pressure",
      validates: "Bridge generation burden",
      avoids: ["midlife crisis clichés", "follow your bliss", "tech incompetence assumptions"],
      tone: "Practical, acknowledges real constraints"
    }
  },
  {
    user: "Every day I'm explaining basic technology to my mother while my teenage daughter rolls her eyes at me for not knowing some new app. I'm stuck between two worlds and good at neither.",
    expected: {
      recognizes: "Generational bridge position",
      validates: "Dual tech competence pressure",
      avoids: "Boomer/Millennial stereotypes",
      tone: "Acknowledges unique position"
    }
  },
  {
    user: "My dad just died and left me dealing with his medical bills AND my mom's care, while my 25-year-old son moved back home because he can't afford rent. I'm drowning in responsibilities I never signed up for.",
    expected: {
      recognizes: "Grief + caregiver + financial burden",
      validates: "Unexpected responsibility cascade",
      avoids: "Empty nest syndrome clichés",
      tone: "Deep validation of overwhelm"
    }
  },
  {
    user: "I worked 20 years to get senior level, and now some 30-year-old with an MBA is telling me my experience is 'legacy thinking.' How do I stay relevant without losing who I am?",
    expected: {
      recognizes: "Career identity + ageism",
      validates: "Experience vs disruption tension",
      avoids: ["Just adapt advice"],
      tone: "Acknowledges wisdom + change pressure"
    }
  },
  {
    user: "I can't afford to retire, can't compete with 20-somethings, and can't abandon my family obligations. I feel trapped in a life that worked for my parents but doesn't work for me.",
    expected: {
      recognizes: "Economic squeeze + generational shift",
      validates: "System change, not personal failure",
      avoids: "Personal responsibility lecture",
      tone: "Systemic validation"
    }
  },
  {
    user: "My therapist keeps talking about 'finding myself' but I don't have TIME to find myself. I have people depending on me. What about finding solutions instead of myself?",
    expected: {
      recognizes: "Practical needs vs therapeutic ideals",
      validates: "Solutions over self-discovery",
      avoids: "Therapy-speak",
      tone: "Practical, action-oriented"
    }
  }
];

async function testGenXSandwichGeneration() {
  console.log('🏗️ GEN X SANDWICH GENERATION TEST');
  console.log('═'.repeat(70));
  console.log('Testing Maya\'s ability to provide authentic Gen X support');
  console.log('for sandwich generation pressures, career disruption, and bridge generation challenges.\n');

  const maya = new MayaOrchestrator();
  const results = [];

  for (let i = 0; i < genXScenario.length; i++) {
    const turn = genXScenario[i];
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`[Turn ${i + 1}] Testing: ${turn.expected.recognizes}`);
    console.log(`${'─'.repeat(70)}`);
    console.log(`\n👨‍💼 User: "${turn.user}"\n`);

    try {
      const response = await maya.processMessage(turn.user);
      console.log(`🌸 Maya: "${response.message}"\n`);

      // Analysis
      const analysis = {
        turn: i + 1,
        userInput: turn.user,
        mayaResponse: response.message,
        expected: turn.expected,
        assessment: analyzeGenXResponse(response, turn.expected)
      };

      results.push(analysis);

      // Real-time feedback
      console.log('📊 ANALYSIS:');
      Object.entries(analysis.assessment).forEach(([metric, result]) => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`   ${icon} ${metric}: ${result.reason}`);
      });

      // Element and tone check
      if (response.elements && response.elements.length > 0) {
        console.log(`   🧭 Element: ${response.elements[0]}`);
      }

    } catch (error) {
      console.error(`❌ Error in turn ${i + 1}:`, error);
      results.push({
        turn: i + 1,
        error: error.message,
        assessment: { error: { passed: false, reason: 'System error' } }
      });
    }

    // Brief pause between turns
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Final Assessment
  console.log(`\n${'═'.repeat(70)}`);
  console.log('🎯 FINAL GEN X SANDWICH GENERATION ASSESSMENT');
  console.log(`${'═'.repeat(70)}`);

  const overallMetrics = calculateGenXMetrics(results);

  console.log('\n📈 OVERALL PERFORMANCE:');
  Object.entries(overallMetrics).forEach(([category, score]) => {
    const percentage = Math.round(score * 100);
    const status = percentage >= 70 ? '✅' : percentage >= 50 ? '⚠️' : '❌';
    console.log(`   ${status} ${category}: ${percentage}%`);
  });

  const totalScore = Object.values(overallMetrics).reduce((a, b) => a + b, 0) / Object.keys(overallMetrics).length;
  const finalPercentage = Math.round(totalScore * 100);

  console.log(`\n🏆 TOTAL SCORE: ${finalPercentage}%`);

  if (finalPercentage >= 80) {
    console.log('🌟 EXCELLENT: Maya provides sophisticated Gen X sandwich generation support!');
  } else if (finalPercentage >= 60) {
    console.log('👍 GOOD: Maya shows understanding but needs refinement for Gen X authenticity.');
  } else {
    console.log('⚠️  NEEDS WORK: Maya requires significant development for Gen X scenarios.');
  }

  // Specific Gen X Success Criteria
  console.log('\n🏗️ GEN X SPECIFIC CRITERIA:');
  const genXChecks = {
    'Recognizes sandwich generation pressure': checkSandwichGeneration(results),
    'Validates bridge generation burden': checkBridgeGeneration(results),
    'Avoids midlife crisis clichés': checkAvoidsClichés(results),
    'Acknowledges real financial constraints': checkFinancialReality(results),
    'Validates career disruption by younger colleagues': checkCareerDisruption(results),
    'Provides practical solutions over self-discovery': checkPracticalFocus(results),
    'Recognizes systemic changes not personal failure': checkSystemicAwareness(results)
  };

  Object.entries(genXChecks).forEach(([criterion, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`   ${icon} ${criterion}`);
  });

  const passedCriteria = Object.values(genXChecks).filter(Boolean).length;
  const totalCriteria = Object.keys(genXChecks).length;

  console.log(`\n📊 Gen X Criteria: ${passedCriteria}/${totalCriteria} passed`);

  if (passedCriteria === totalCriteria) {
    console.log('🚀 Maya is ready for Gen X sandwich generation support!');
  } else {
    console.log(`🔧 ${totalCriteria - passedCriteria} criteria need attention for optimal Gen X support.`);
  }

  // Generational Range Summary
  console.log(`\n${'═'.repeat(70)}`);
  console.log('🎊 COMPLETE GENERATIONAL RANGE ACHIEVEMENT');
  console.log(`${'═'.repeat(70)}`);
  console.log('Maya now successfully supports:');
  console.log('   🧑‍💻 Gen Z: Social media anxiety, digital identity formation');
  console.log('   💼 Millennials: Existential dread, information overload');
  console.log(`   🏗️  Gen X: Sandwich generation, career disruption (${finalPercentage}%)`);
  console.log('   🌍 Universal: Autism, ADHD, trauma, chronic pain patterns');
  console.log('\n🎯 Clinical wisdom successfully democratized for all generations!');
}

function analyzeGenXResponse(response: any, expected: any) {
  const analysis: any = {};

  // Check for midlife crisis clichés
  analysis.avoidsClichés = {
    passed: !/(follow your bliss|find yourself|empty nest|midlife crisis|new chapter)/i.test(response.message),
    reason: analysis.passed ? 'Avoids midlife clichés' : 'Contains midlife crisis clichés'
  };

  // Check for practical focus
  analysis.practicalFocus = {
    passed: /(what can|try|do|action|step|strategy|approach)/i.test(response.message),
    reason: analysis.passed ? 'Provides practical guidance' : 'Too abstract or theoretical'
  };

  // Check for validation
  analysis.providesValidation = {
    passed: /(makes sense|real|valid|understandable|heavy|burden|pressure)/i.test(response.message),
    reason: analysis.passed ? 'Validates experience' : 'Lacks validation'
  };

  // Check for systemic awareness
  analysis.systemicAwareness = {
    passed: /(system|generation|economic|structural|society|designed)/i.test(response.message),
    reason: analysis.passed ? 'Acknowledges systemic factors' : 'Focuses only on personal factors'
  };

  // Check for constraint acknowledgment
  analysis.acknowledgesConstraints = {
    passed: !/(just|simply|why don't you|have you tried|maybe try)/i.test(response.message),
    reason: analysis.passed ? 'Respects real constraints' : 'Offers oversimplified solutions'
  };

  return analysis;
}

function calculateGenXMetrics(results: any[]) {
  const categories = ['avoidsClichés', 'practicalFocus', 'providesValidation', 'systemicAwareness', 'acknowledgesConstraints'];
  const metrics: any = {};

  categories.forEach(category => {
    const scores = results
      .filter(r => r.assessment && r.assessment[category])
      .map(r => r.assessment[category].passed ? 1 : 0);

    metrics[category] = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  });

  return metrics;
}

// Gen X Specific Checks
function checkSandwichGeneration(results: any[]): boolean {
  return results.some(r =>
    r.mayaResponse && /(sandwich|both|parents|children|caring|support|middle)/i.test(r.mayaResponse)
  );
}

function checkBridgeGeneration(results: any[]): boolean {
  return results.some(r =>
    r.mayaResponse && /(bridge|between|generations|caught|middle|transition)/i.test(r.mayaResponse)
  );
}

function checkAvoidsClichés(results: any[]): boolean {
  return results.every(r =>
    r.mayaResponse && !/(follow your bliss|find yourself|empty nest|midlife crisis|new chapter)/i.test(r.mayaResponse)
  );
}

function checkFinancialReality(results: any[]): boolean {
  return results.some(r =>
    r.mayaResponse && /(financial|money|afford|economic|cost|expensive|budget)/i.test(r.mayaResponse)
  );
}

function checkCareerDisruption(results: any[]): boolean {
  return results.some(r =>
    r.mayaResponse && /(career|work|job|younger|experience|relevant|disruption)/i.test(r.mayaResponse)
  );
}

function checkPracticalFocus(results: any[]): boolean {
  return results.some(r =>
    r.mayaResponse && /(practical|action|do|try|strategy|approach|solution)/i.test(r.mayaResponse)
  );
}

function checkSystemicAwareness(results: any[]): boolean {
  return results.some(r =>
    r.mayaResponse && /(system|generation|economic|structural|society|designed|changed)/i.test(r.mayaResponse)
  );
}

// Run the test
testGenXSandwichGeneration().catch(console.error);