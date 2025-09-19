#!/usr/bin/env tsx
/**
 * Test Script: Gen X Life Transition Overwhelm
 * Tests Maya's understanding of Gen X sandwich generation pressures,
 * bridge generation dynamics, and practical life transition challenges
 */

import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator';
import { neurodivergentValidation } from '../lib/oracle/NeurodivergentValidation';
import { activeListening } from '../lib/oracle/ActiveListeningCore';
import { conversationAnalyzer } from '../lib/oracle/ConversationAnalyzer';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m'
};

interface TestTurn {
  turn: number;
  userInput: string;
  expectedValidations: string[];
  expectedAvoidances: string[];
  expectedReframes: string[];
  expectedTechnique: string;
  expectedElement?: string;
  mayaResponse?: string;
  actualTechnique?: string;
  actualElement?: string;
  generationalAwareness?: boolean;
  practicalRealism?: boolean;
  identityValidation?: boolean;
  qualityScore?: number;
  bridgeGenerationRecognition?: boolean;
  obligationReframe?: boolean;
}

// The 7-turn test conversation from the Gen X scenario
const testConversation: TestTurn[] = [
  {
    turn: 1,
    userInput: "I'm 48 and feel like I'm failing everyone. My mom needs help with her iPhone AND her medical appointments, my daughter needs college money I don't have, and my boss who's 10 years younger keeps talking about 'disruption.' When did I become the old one?",
    expectedValidations: ['tech support burden', 'sandwich generation pressure', 'age dynamics at work'],
    expectedAvoidances: ['midlife crisis cliche', 'boomer tech-incompetence assumptions'],
    expectedReframes: ['bridge generation perspective'],
    expectedTechnique: 'VALIDATE',
    expectedElement: 'earth'
  },
  {
    turn: 2,
    userInput: "I spent 20 years climbing the ladder and now I'm here and it's just... meetings about meetings and pretending to care about KPIs. But starting over at my age feels insane. Who's going to hire a 48-year-old who wants to do something meaningful?",
    expectedValidations: ['career disillusionment', 'practical constraints', 'meaning crisis'],
    expectedAvoidances: ['unrealistic pivot suggestions', 'toxic positivity'],
    expectedReframes: ['clarity vs crisis perspective'],
    expectedTechnique: 'ATTUNE',
    expectedElement: 'water'
  },
  {
    turn: 3,
    userInput: "Yesterday I drove my dad to dialysis, sat through my son's parent-teacher conference about his 'lack of focus,' and then my husband reminded me we haven't had sex in two months. I'm not even a person anymore, just a logistics coordinator",
    expectedValidations: ['dehumanization feeling', 'logistics burden', 'relationship strain'],
    expectedAvoidances: ['minimizing the overwhelm'],
    expectedReframes: ['operating system metaphor'],
    expectedTechnique: 'MIRROR',
    expectedElement: 'earth'
  },
  {
    turn: 4,
    userInput: "And everything needs a different app now. Healthcare portal for mom, school app for kids, Slack for work, WhatsApp for family. I know HOW to use it all, I'm just tired of having to",
    expectedValidations: ['tech competence', 'platform fatigue'],
    expectedAvoidances: ['boomer tech-fear conflation'],
    expectedReframes: ['platform proliferation fatigue vs incompetence'],
    expectedTechnique: 'VALIDATE',
    expectedElement: 'air'
  },
  {
    turn: 5,
    userInput: "I can't relate to my Boomer parents who had pensions and stayed married, or my kids who think I'm privileged because I own a house (with a massive mortgage). Where's my generation's handbook?",
    expectedValidations: ['generational island feeling', 'unique Gen X position'],
    expectedAvoidances: ['generational rivalry'],
    expectedReframes: ['bridge generation translator role'],
    expectedTechnique: 'CLARIFY',
    expectedElement: 'aether'
  },
  {
    turn: 6,
    userInput: "I keep thinking there has to be more than this treadmill but I don't even know what 'more' looks like. How do you find meaning when you're drowning in obligations?",
    expectedValidations: ['obligation overwhelm', 'meaning search difficulty'],
    expectedAvoidances: ['abstract inspiration'],
    expectedReframes: ['examining which obligations are truly yours'],
    expectedTechnique: 'CHALLENGE',
    expectedElement: 'fire'
  },
  {
    turn: 7,
    userInput: "So I'm supposed to just abandon everyone who needs me? Very realistic",
    expectedValidations: ['responsibility weight', 'practical constraints'],
    expectedAvoidances: ['oversimplified solutions'],
    expectedReframes: ['recalibrate vs abandon', 'presence vs being needed'],
    expectedTechnique: 'SPACE',
    expectedElement: 'water'
  }
];

interface GenXTestResults {
  overallScore: number;
  generationalAwareness: number;
  practicalRealism: number;
  identityValidation: number;
  bridgeGenerationRecognition: number;
  obligationReframing: number;
  avoidanceCriteria: number;
  qualityMetrics: {
    avgQuality: number;
    techCompetenceValidated: boolean;
    sandwichPressureRecognized: boolean;
    noMidlifeCriches: boolean;
    practicalConstraintsRespected: boolean;
    meaningCrisisValidated: boolean;
  };
}

async function runGenXLifeTransitionTest(): Promise<GenXTestResults> {
  console.log(`\n${colors.bright}${colors.cyan}🌉 GEN X LIFE TRANSITION OVERWHELM TEST${colors.reset}`);
  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const maya = new MayaOrchestrator();

  // Reset analyzer for clean test
  conversationAnalyzer.clearHistory();

  const results: TestTurn[] = [];
  let generationalAwarenessCount = 0;
  let practicalRealismCount = 0;
  let identityValidationCount = 0;

  console.log(`${colors.yellow}📋 Expected Test Flow:${colors.reset}`);
  console.log(`Turn 1: Sandwich generation squeeze → Validate unique position`);
  console.log(`Turn 2: Career meaning crisis → Acknowledge constraints & clarity`);
  console.log(`Turn 3: Family logistics hell → Mirror dehumanization`);
  console.log(`Turn 4: Platform fatigue → Validate tech competence`);
  console.log(`Turn 5: Generational island → Recognize bridge generation`);
  console.log(`Turn 6: Meaning vs obligations → Challenge obligation ownership`);
  console.log(`Turn 7: Realistic constraints → Reframe without abandonment\n`);

  // Run the conversation
  for (const turn of testConversation) {
    console.log(`${colors.bright}[Turn ${turn.turn}]${colors.reset} User: "${colors.cyan}${turn.userInput}${colors.reset}"`);

    // Get Maya's response
    const response = await maya.speak(turn.userInput, 'genx-test-user');
    turn.mayaResponse = response.message;
    turn.actualElement = response.element;

    // Get active listening analysis
    const listeningResponse = activeListening.listen(turn.userInput);
    turn.actualTechnique = listeningResponse.technique.type;

    console.log(`   🌸 Maya: "${colors.green}${response.message}${colors.reset}"`);
    console.log(`   📊 Technique: ${colors.yellow}${listeningResponse.technique.type}${colors.reset} (${listeningResponse.technique.confidence.toFixed(2)} confidence)`);
    console.log(`   🌟 Element: ${colors.magenta}${response.element}${colors.reset}`);
    console.log(`   ⏱️  Pause: ${response.duration}ms`);

    // Analyze Gen X specific criteria
    const genXAnalysis = analyzeGenXResponse(turn, response.message);
    Object.assign(turn, genXAnalysis);

    if (genXAnalysis.generationalAwareness) {
      generationalAwarenessCount++;
      console.log(`   ${colors.blue}🌉 Generational Awareness Detected${colors.reset}`);
    }

    if (genXAnalysis.practicalRealism) {
      practicalRealismCount++;
      console.log(`   ${colors.green}🎯 Practical Realism Demonstrated${colors.reset}`);
    }

    if (genXAnalysis.identityValidation) {
      identityValidationCount++;
      console.log(`   ${colors.magenta}✨ Identity Validation Provided${colors.reset}`);
    }

    if (genXAnalysis.bridgeGenerationRecognition) {
      console.log(`   ${colors.cyan}🌁 Bridge Generation Recognition${colors.reset}`);
    }

    if (genXAnalysis.obligationReframe) {
      console.log(`   ${colors.yellow}🔄 Obligation Reframe Offered${colors.reset}`);
    }

    // Evaluate response quality
    const evaluation = activeListening.evaluateListening(turn.userInput, response.message);
    turn.qualityScore = evaluation.overall;

    console.log(`   📈 Quality: ${getQualityBar(evaluation.overall)} ${(evaluation.overall * 100).toFixed(0)}%`);

    results.push(turn);
    console.log();

    // Small delay between turns
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Analysis Phase
  console.log(`${colors.bright}${colors.blue}📊 GEN X TEST ANALYSIS${colors.reset}`);
  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const analysis = analyzeGenXTestResults(results);
  displayGenXTestResults(analysis, results);

  return analysis;
}

function analyzeGenXResponse(turn: TestTurn, response: string): Partial<TestTurn> {
  const analysis: Partial<TestTurn> = {};

  // Check for generational awareness markers
  const generationalMarkers = [
    /bridge generation/i,
    /gen.?x/i,
    /between.*worlds/i,
    /translating/i,
    /analog.*digital/i,
    /technology.*exhaustion/i,
    /platform.*fatigue/i
  ];
  analysis.generationalAwareness = generationalMarkers.some(marker => marker.test(response));

  // Check for practical realism (vs toxic positivity)
  const realismMarkers = [
    /constraints?/i,
    /realistic/i,
    /practical/i,
    /obligations?/i,
    /responsibilities?/i
  ];
  const toxicPositivityMarkers = [
    /just think positive/i,
    /everything happens for/i,
    /manifest/i,
    /follow your dreams/i
  ];
  analysis.practicalRealism = realismMarkers.some(marker => marker.test(response)) &&
                             !toxicPositivityMarkers.some(marker => marker.test(response));

  // Check for identity validation (not invisible)
  const identityMarkers = [
    /not.*invisible/i,
    /person.*logistics/i,
    /operating system/i,
    /coordinator/i,
    /tech support/i,
    /sandwich generation/i
  ];
  analysis.identityValidation = identityMarkers.some(marker => marker.test(response));

  // Check for bridge generation recognition
  const bridgeMarkers = [
    /bridge/i,
    /between.*generations?/i,
    /translat/i,
    /analog.*digital/i,
    /both.*think/i
  ];
  analysis.bridgeGenerationRecognition = bridgeMarkers.some(marker => marker.test(response));

  // Check for obligation reframing
  const obligationReframes = [
    /recalibrate/i,
    /examine.*obligations?/i,
    /which.*yours/i,
    /assigned.*chosen/i,
    /presence.*needed/i
  ];
  analysis.obligationReframe = obligationReframes.some(marker => marker.test(response));

  return analysis;
}

function analyzeGenXTestResults(results: TestTurn[]): GenXTestResults {
  // Calculate scores
  const qualityScores = results.map(r => r.qualityScore || 0);
  const avgQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;

  // Count successes
  const generationalAwarenessCount = results.filter(r => r.generationalAwareness).length;
  const practicalRealismCount = results.filter(r => r.practicalRealism).length;
  const identityValidationCount = results.filter(r => r.identityValidation).length;
  const bridgeRecognitionCount = results.filter(r => r.bridgeGenerationRecognition).length;
  const obligationReframeCount = results.filter(r => r.obligationReframe).length;

  // Check specific quality markers
  const techCompetenceValidated = results.some(r =>
    r.turn === 4 && r.mayaResponse &&
    (r.mayaResponse.includes('competence') || r.mayaResponse.includes('fatigue'))
  );

  const sandwichPressureRecognized = results.some(r =>
    r.turn === 1 && r.mayaResponse &&
    r.mayaResponse.toLowerCase().includes('sandwich')
  );

  const noMidlifeCriches = !results.some(r =>
    r.mayaResponse && (
      r.mayaResponse.toLowerCase().includes('midlife crisis') ||
      r.mayaResponse.toLowerCase().includes('mid-life crisis')
    )
  );

  const practicalConstraintsRespected = results.filter(r => r.practicalRealism).length >= 3;
  const meaningCrisisValidated = results.some(r =>
    r.turn === 2 && r.mayaResponse &&
    (r.mayaResponse.includes('meaning') || r.mayaResponse.includes('clarity'))
  );

  // Check avoidance criteria (negative scoring)
  const avoidanceViolations = results.filter(r => {
    if (!r.mayaResponse) return false;
    const response = r.mayaResponse.toLowerCase();
    return response.includes('midlife crisis') ||
           response.includes('just think positive') ||
           response.includes('follow your dreams') ||
           response.includes('everything happens for');
  }).length;

  const avoidanceCriteria = Math.max(0, 1 - (avoidanceViolations / results.length));

  return {
    overallScore: (
      (generationalAwarenessCount / results.length) * 0.2 +
      (practicalRealismCount / results.length) * 0.2 +
      (identityValidationCount / results.length) * 0.2 +
      (bridgeRecognitionCount / results.length) * 0.15 +
      (obligationReframeCount / results.length) * 0.15 +
      avgQuality * 0.1
    ),
    generationalAwareness: generationalAwarenessCount / results.length,
    practicalRealism: practicalRealismCount / results.length,
    identityValidation: identityValidationCount / results.length,
    bridgeGenerationRecognition: bridgeRecognitionCount / results.length,
    obligationReframing: obligationReframeCount / results.length,
    avoidanceCriteria,
    qualityMetrics: {
      avgQuality,
      techCompetenceValidated,
      sandwichPressureRecognized,
      noMidlifeCriches,
      practicalConstraintsRespected,
      meaningCrisisValidated
    }
  };
}

function displayGenXTestResults(analysis: GenXTestResults, results: TestTurn[]): void {
  console.log(`${colors.green}✅ GEN X SUCCESS CRITERIA CHECKLIST:${colors.reset}\n`);

  const criteria = [
    {
      name: "Recognizes Gen X as bridge generation (not just 'middle aged')",
      passed: analysis.bridgeGenerationRecognition >= 0.3,
      score: analysis.bridgeGenerationRecognition
    },
    {
      name: "Validates career meaning crisis without unrealistic pivots",
      passed: analysis.qualityMetrics.meaningCrisisValidated && analysis.practicalRealism >= 0.4,
      score: analysis.practicalRealism
    },
    {
      name: "Acknowledges sandwich generation pressure",
      passed: analysis.qualityMetrics.sandwichPressureRecognized,
      score: analysis.qualityMetrics.sandwichPressureRecognized ? 1.0 : 0.0
    },
    {
      name: "Doesn't conflate with Boomer tech-incompetence",
      passed: analysis.qualityMetrics.techCompetenceValidated,
      score: analysis.qualityMetrics.techCompetenceValidated ? 1.0 : 0.0
    },
    {
      name: "Provides practical reframes not inspiration porn",
      passed: analysis.practicalRealism >= 0.5,
      score: analysis.practicalRealism
    },
    {
      name: "Respects real constraints of obligations",
      passed: analysis.qualityMetrics.practicalConstraintsRespected,
      score: analysis.qualityMetrics.practicalConstraintsRespected ? 1.0 : 0.0
    },
    {
      name: "Avoids midlife crisis clichés",
      passed: analysis.qualityMetrics.noMidlifeCriches,
      score: analysis.qualityMetrics.noMidlifeCriches ? 1.0 : 0.0
    },
    {
      name: "Validates identity beyond logistics coordinator",
      passed: analysis.identityValidation >= 0.4,
      score: analysis.identityValidation
    }
  ];

  criteria.forEach(criterion => {
    const icon = criterion.passed ? '✅' : '❌';
    const color = criterion.passed ? colors.green : colors.red;
    console.log(`${icon} ${color}${criterion.name}${colors.reset} (${(criterion.score * 100).toFixed(0)}%)`);
  });

  console.log(`\n${colors.bright}📈 GEN X PERFORMANCE METRICS:${colors.reset}\n`);
  console.log(`Overall Score: ${getQualityBar(analysis.overallScore)} ${(analysis.overallScore * 100).toFixed(0)}%`);
  console.log(`Generational Awareness: ${(analysis.generationalAwareness * 100).toFixed(0)}%`);
  console.log(`Bridge Generation Recognition: ${(analysis.bridgeGenerationRecognition * 100).toFixed(0)}%`);
  console.log(`Practical Realism: ${(analysis.practicalRealism * 100).toFixed(0)}%`);
  console.log(`Identity Validation: ${(analysis.identityValidation * 100).toFixed(0)}%`);
  console.log(`Obligation Reframing: ${(analysis.obligationReframing * 100).toFixed(0)}%`);

  console.log(`\n${colors.bright}🎯 QUALITY INDICATORS:${colors.reset}\n`);
  console.log(`Tech Competence Validated: ${analysis.qualityMetrics.techCompetenceValidated ? '✅' : '❌'}`);
  console.log(`Sandwich Pressure Recognized: ${analysis.qualityMetrics.sandwichPressureRecognized ? '✅' : '❌'}`);
  console.log(`No Midlife Crisis Clichés: ${analysis.qualityMetrics.noMidlifeCriches ? '✅' : '❌'}`);
  console.log(`Practical Constraints Respected: ${analysis.qualityMetrics.practicalConstraintsRespected ? '✅' : '❌'}`);
  console.log(`Meaning Crisis Validated: ${analysis.qualityMetrics.meaningCrisisValidated ? '✅' : '❌'}`);

  // Detailed turn-by-turn analysis
  console.log(`\n${colors.bright}🔍 TURN-BY-TURN ANALYSIS:${colors.reset}\n`);
  results.forEach(turn => {
    console.log(`Turn ${turn.turn}: Expected ${turn.expectedTechnique} → Got ${turn.actualTechnique}`);
    console.log(`  Expected Element: ${turn.expectedElement || 'any'} → Got ${turn.actualElement}`);
    if (turn.generationalAwareness) console.log(`  🌉 Generational awareness shown`);
    if (turn.practicalRealism) console.log(`  🎯 Practical realism demonstrated`);
    if (turn.identityValidation) console.log(`  ✨ Identity validation provided`);
    if (turn.bridgeGenerationRecognition) console.log(`  🌁 Bridge generation recognized`);
    if (turn.obligationReframe) console.log(`  🔄 Obligation reframe offered`);
    console.log();
  });

  // Overall assessment
  const finalGrade = analysis.overallScore >= 0.8 ? 'EXCELLENT' :
                    analysis.overallScore >= 0.6 ? 'GOOD' :
                    analysis.overallScore >= 0.4 ? 'NEEDS WORK' : 'POOR';

  const gradeColor = analysis.overallScore >= 0.8 ? colors.green :
                    analysis.overallScore >= 0.6 ? colors.yellow :
                    colors.red;

  console.log(`\n${colors.bright}🏆 FINAL ASSESSMENT: ${gradeColor}${finalGrade}${colors.reset}`);
  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

function getQualityBar(score: number): string {
  const filled = Math.round(score * 20);
  const empty = 20 - filled;
  const color = score > 0.7 ? colors.green : score > 0.4 ? colors.yellow : colors.red;
  return `${color}${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset}`;
}

// Run the test
if (require.main === module) {
  runGenXLifeTransitionTest()
    .then(results => {
      console.log(`\n${colors.cyan}📋 Gen X test completed with overall score: ${(results.overallScore * 100).toFixed(0)}%${colors.reset}\n`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`${colors.red}❌ Test failed:${colors.reset}`, error);
      process.exit(1);
    });
}

export { runGenXLifeTransitionTest, GenXTestResults };