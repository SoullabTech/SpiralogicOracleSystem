#!/usr/bin/env npx tsx
/**
 * 🎭 Gen Z Social Media Anxiety Test
 *
 * Tests Maya's ability to handle:
 * - Social media comparison anxiety
 * - Performance exhaustion
 * - Identity formation while performing publicly
 * - Systemic vs personal responsibility
 * - Gen Z-authentic language and validation
 */

import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator';

const genZScenario = [
  {
    user: "i literally cannot stop checking instagram even though it makes me want to die. everyone from high school is getting engaged or promoted and im still living with my parents working at starbucks",
    expected: {
      validates: "Instagram comparison trap",
      avoids: ["toxic positivity", "just quit social media", "comparison is the thief of joy"],
      element: "water", // immediate validation
      tone: "Gen Z authentic, no clinical language"
    }
  },
  {
    user: "and the worst part is i KNOW its all fake but i still feel like shit. like i know they're only posting highlights but my brain still thinks everyone has their life together except me",
    expected: {
      validates: "Nervous system vs logical brain",
      includes: "psychoeducation about social hierarchy processing",
      element: "air", // understanding/clarity
      tone: "Educational but not condescending"
    }
  },
  {
    user: "plus i have to keep posting too or people think something's wrong. spent 2 hours yesterday trying to get one photo that looked 'effortless' lmaooo im so tired",
    expected: {
      validates: "Performance exhaustion",
      recognizes: "Living as content creation",
      element: "fire", // direct confrontation of pattern
      tone: "Direct, understanding the absurdity"
    }
  },
  {
    user: "my therapist keeps telling me to just take a social media break but like... thats how i find jobs, stay connected, promote my art. its not optional anymore",
    expected: {
      validates: "Social media as infrastructure, not choice",
      avoids: "boomer advice",
      element: "earth", // practical validation
      tone: "Validates digital native reality"
    }
  },
  {
    user: "ok but what do i actually DO when im lying in bed at 2am comparing myself to some girl who somehow has a perfect apartment and travels constantly",
    expected: {
      provides: "Micro-intervention (30 seconds)",
      includes: "Immediate grounding technique",
      actionable: "Can do while in bed/scrolling",
      tone: "Practical, immediate help"
    }
  },
  {
    user: "sometimes i don't even know who i actually am vs who i perform online. like which one is the real me",
    expected: {
      validates: "Identity formation while performing",
      integrates: "Both versions are real",
      element: "aether", // paradox integration
      tone: "Sophisticated understanding of digital identity"
    }
  },
  {
    user: "older people don't get it. they had a chance to figure out who they were before documenting everything",
    expected: {
      validates: "Unprecedented psychological challenge",
      acknowledges: "Generational difference",
      avoids: "Dismissing older perspectives",
      tone: "Validates unique Gen Z experience"
    }
  }
];

async function testGenZSocialMediaSupport() {
  console.log('🎭 GEN Z SOCIAL MEDIA ANXIETY TEST');
  console.log('═'.repeat(60));
  console.log('Testing Maya\'s ability to provide Gen Z-authentic support');
  console.log('for social media anxiety, comparison culture, and digital identity formation.\n');

  const maya = new MayaOrchestrator();
  const results = [];

  for (let i = 0; i < genZScenario.length; i++) {
    const turn = genZScenario[i];
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`[Turn ${i + 1}] Testing: ${turn.expected.validates || 'Gen Z Response'}`);
    console.log(`${'─'.repeat(60)}`);
    console.log(`\n🧑‍💻 User: "${turn.user}"\n`);

    try {
      const response = await maya.processMessage(turn.user);
      console.log(`🌸 Maya: "${response.message}"\n`);

      // Analysis
      const analysis = {
        turn: i + 1,
        userInput: turn.user,
        mayaResponse: response.message,
        expected: turn.expected,
        assessment: analyzeGenZResponse(response, turn.expected)
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
  console.log(`\n${'═'.repeat(60)}`);
  console.log('🎯 FINAL GEN Z SOCIAL MEDIA ANXIETY ASSESSMENT');
  console.log(`${'═'.repeat(60)}`);

  const overallMetrics = calculateOverallMetrics(results);

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
    console.log('🌟 EXCELLENT: Maya provides sophisticated Gen Z social media anxiety support!');
  } else if (finalPercentage >= 60) {
    console.log('👍 GOOD: Maya shows understanding but needs refinement for Gen Z authenticity.');
  } else {
    console.log('⚠️  NEEDS WORK: Maya requires significant development for Gen Z social media scenarios.');
  }

  // Specific Gen Z Success Criteria
  console.log('\n🎮 GEN Z SPECIFIC CRITERIA:');
  const genZChecks = {
    'Never suggests "just quit social media"': checkNoBoomerAdvice(results),
    'Validates performance exhaustion': checkValidatesPerformance(results),
    'Acknowledges social media as necessary infrastructure': checkValidatesInfrastructure(results),
    'Provides 30-second micro-interventions': checkMicroInterventions(results),
    'Recognizes unique Gen Z identity formation challenges': checkIdentityFormation(results),
    'Uses casual, non-clinical language': checkCasualLanguage(results),
    'Addresses systemic issues not just personal responsibility': checkSystemicAwareness(results)
  };

  Object.entries(genZChecks).forEach(([criterion, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`   ${icon} ${criterion}`);
  });

  const passedCriteria = Object.values(genZChecks).filter(Boolean).length;
  const totalCriteria = Object.keys(genZChecks).length;

  console.log(`\n📊 Gen Z Criteria: ${passedCriteria}/${totalCriteria} passed`);

  if (passedCriteria === totalCriteria) {
    console.log('🚀 Maya is ready for Gen Z social media anxiety support!');
  } else {
    console.log(`🔧 ${totalCriteria - passedCriteria} criteria need attention for optimal Gen Z support.`);
  }
}

function analyzeGenZResponse(response: any, expected: any) {
  const analysis: any = {};

  // Check for toxic positivity
  analysis.avoidsToxicPositivity = {
    passed: !/(comparison is|everything happens|positive vibes|good vibes|grateful|blessed)/i.test(response.message),
    reason: analysis.passed ? 'Avoids toxic positivity' : 'Contains toxic positivity language'
  };

  // Check for boomer advice
  analysis.avoidsBoomerAdvice = {
    passed: !/(just quit|take a break|disconnect|digital detox|back in my day)/i.test(response.message),
    reason: analysis.passed ? 'No boomer advice detected' : 'Contains boomer-style advice'
  };

  // Check for clinical language
  analysis.avoidsClinical = {
    passed: !/(therapeutic|clinical|symptoms|disorder|pathology|dysfunction)/i.test(response.message),
    reason: analysis.passed ? 'Uses casual language' : 'Contains clinical terminology'
  };

  // Check for validation
  analysis.providesValidation = {
    passed: /(that makes sense|of course|valid|real|understand|get it)/i.test(response.message),
    reason: analysis.passed ? 'Provides validation' : 'Lacks validating language'
  };

  // Check for practical help
  analysis.practicalIntervention = {
    passed: response.message.length < 500 && /try|do|practice|when|right now/i.test(response.message),
    reason: analysis.passed ? 'Offers practical intervention' : 'Too theoretical or long'
  };

  return analysis;
}

function calculateOverallMetrics(results: any[]) {
  const categories = ['avoidsToxicPositivity', 'avoidsBoomerAdvice', 'avoidsClinical', 'providesValidation', 'practicalIntervention'];
  const metrics: any = {};

  categories.forEach(category => {
    const scores = results
      .filter(r => r.assessment && r.assessment[category])
      .map(r => r.assessment[category].passed ? 1 : 0);

    metrics[category] = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  });

  return metrics;
}

// Gen Z Specific Checks
function checkNoBoomerAdvice(results: any[]): boolean {
  return results.every(r =>
    r.mayaResponse && !/(just quit|take a break|disconnect|digital detox)/i.test(r.mayaResponse)
  );
}

function checkValidatesPerformance(results: any[]): boolean {
  return results.some(r =>
    r.mayaResponse && /(exhausting|performing|content creation|effortless)/i.test(r.mayaResponse)
  );
}

function checkValidatesInfrastructure(results: any[]): boolean {
  return results.some(r =>
    r.mayaResponse && /(professional|network|infrastructure|not optional)/i.test(r.mayaResponse)
  );
}

function checkMicroInterventions(results: any[]): boolean {
  return results.some(r =>
    r.mayaResponse && r.mayaResponse.length < 300 && /right now|try|do this|when you/i.test(r.mayaResponse)
  );
}

function checkIdentityFormation(results: any[]): boolean {
  return results.some(r =>
    r.mayaResponse && /(both real|multidimensional|performing|identity)/i.test(r.mayaResponse)
  );
}

function checkCasualLanguage(results: any[]): boolean {
  return results.every(r =>
    r.mayaResponse && !/(therapeutic|clinical|symptoms|pathological)/i.test(r.mayaResponse)
  );
}

function checkSystemicAwareness(results: any[]): boolean {
  return results.some(r =>
    r.mayaResponse && /(systemic|generational|infrastructure|designed to)/i.test(r.mayaResponse)
  );
}

// Run the test
testGenZSocialMediaSupport().catch(console.error);