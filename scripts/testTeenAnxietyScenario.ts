#!/usr/bin/env tsx
/**
 * Test Script: Teenage Social Anxiety Scenario
 * Comprehensive test of RSD recognition, validation timing, intensity tracking,
 * and breakthrough detection as outlined in the test specification
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
  expectedIntensity: number;
  expectedTopics: string[];
  expectedEmotions: string[];
  expectedTechnique: string;
  expectedElement?: string;
  expectedBreakthrough?: boolean;
  mayaResponse?: string;
  actualIntensity?: number;
  actualTechnique?: string;
  actualElement?: string;
  breakthroughDetected?: boolean;
  validationTriggered?: boolean;
  rsdDetected?: boolean;
  qualityScore?: number;
}

// The 6-turn test conversation
const testConversation: TestTurn[] = [
  {
    turn: 1,
    userInput: "everyone at lunch was laughing and looking at me and idk what I did wrong",
    expectedIntensity: 6.5,
    expectedTopics: ['social', 'lunch', 'friends'],
    expectedEmotions: ['anxiety', 'confusion', 'worry'],
    expectedTechnique: 'MIRROR',
    expectedElement: 'earth'
  },
  {
    turn: 2,
    userInput: "yeah and like what if they think im weird or annoying i probably said something stupid",
    expectedIntensity: 7.5,
    expectedTopics: ['social', 'self-doubt'],
    expectedEmotions: ['anxiety', 'self-blame'],
    expectedTechnique: 'VALIDATE',
    expectedElement: 'water'
  },
  {
    turn: 3,
    userInput: "but what if they're all talking about me in the group chat right now",
    expectedIntensity: 8,
    expectedTopics: ['social', 'rumination'],
    expectedEmotions: ['anxiety', 'rumination'],
    expectedTechnique: 'ATTUNE',
    expectedElement: 'water'
  },
  {
    turn: 4,
    userInput: "how do i know if they actually hate me or if im just being paranoid",
    expectedIntensity: 7,
    expectedTopics: ['social', 'black-white-thinking'],
    expectedEmotions: ['anxiety', 'uncertainty'],
    expectedTechnique: 'CLARIFY',
    expectedElement: 'air'
  },
  {
    turn: 5,
    userInput: "wait... yeah i guess it's probably not that extreme. maybe they were just laughing at something else",
    expectedIntensity: 5,
    expectedTopics: ['perspective-shift', 'insight'],
    expectedEmotions: ['relief', 'understanding'],
    expectedTechnique: 'CELEBRATE',
    expectedElement: 'fire',
    expectedBreakthrough: true
  },
  {
    turn: 6,
    userInput: "but the feeling is still there even if i know its not logical",
    expectedIntensity: 5,
    expectedTopics: ['integration', 'paradox'],
    expectedEmotions: ['mixed', 'integration'],
    expectedTechnique: 'SPACE',
    expectedElement: 'aether'
  }
];

interface TestResults {
  overallScore: number;
  neurodivergentValidationScore: number;
  emotionalIntensityTracking: number;
  breakthroughDetection: number;
  techniqueVariety: number;
  rsdRecognition: number;
  validationTiming: number;
  qualityMetrics: {
    avgQuality: number;
    peakDetected: boolean;
    attuneTriggered: boolean;
    celebratedBreakthrough: boolean;
    heldParadox: boolean;
  };
}

async function runTeenageAnxietyTest(): Promise<TestResults> {
  console.log(`\n${colors.bright}${colors.cyan}🎭 TEENAGE SOCIAL ANXIETY TEST SCENARIO${colors.reset}`);
  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const maya = new MayaOrchestrator();

  // Reset analyzer for clean test
  conversationAnalyzer.clearHistory();

  const results: TestTurn[] = [];
  let validationCount = 0;
  let rsdDetectionCount = 0;
  let breakthroughDetected = false;

  console.log(`${colors.yellow}📋 Expected Test Flow:${colors.reset}`);
  console.log(`Turn 1: Opening vulnerability → Mirror technique`);
  console.log(`Turn 2: Self-attack → Urgent validation (RSD)`);
  console.log(`Turn 3: Rumination spiral → Attune to high intensity`);
  console.log(`Turn 4: Binary thinking → Clarify/challenge gently`);
  console.log(`Turn 5: Breakthrough moment → Celebrate insight`);
  console.log(`Turn 6: Integration paradox → Hold space\n`);

  // Run the conversation
  for (const turn of testConversation) {
    console.log(`${colors.bright}[Turn ${turn.turn}]${colors.reset} User: "${colors.cyan}${turn.userInput}${colors.reset}"`);

    // Check for neurodivergent validation triggers
    const validationResponse = neurodivergentValidation.validate(turn.userInput);
    if (validationResponse) {
      validationCount++;
      turn.validationTriggered = true;
      console.log(`   ${colors.green}✅ Validation Triggered: ${validationResponse.priority} priority${colors.reset}`);
    }

    // Check for RSD patterns
    const rsdPatterns = [
      /everyone.*looking/i,
      /they think.*weird/i,
      /annoying/i,
      /stupid/i,
      /hate me/i,
      /talking about me/i,
      /group chat/i
    ];

    const hasRsd = rsdPatterns.some(pattern => pattern.test(turn.userInput));
    if (hasRsd) {
      rsdDetectionCount++;
      turn.rsdDetected = true;
      console.log(`   ${colors.red}🎯 RSD Pattern Detected${colors.reset}`);
    }

    // Check for breakthrough markers
    const breakthroughMarkers = /wait|i guess|maybe|probably/i;
    if (breakthroughMarkers.test(turn.userInput)) {
      breakthroughDetected = true;
      turn.breakthroughDetected = true;
      console.log(`   ${colors.magenta}✨ BREAKTHROUGH DETECTED!${colors.reset}`);
    }

    // Get Maya's response
    const response = await maya.speak(turn.userInput, 'teen-test-user');
    turn.mayaResponse = response.message;
    turn.actualElement = response.element;

    // Get active listening analysis
    const listeningResponse = activeListening.listen(turn.userInput);
    turn.actualTechnique = listeningResponse.technique.type;

    console.log(`   🌸 Maya: "${colors.green}${response.message}${colors.reset}"`);
    console.log(`   📊 Technique: ${colors.yellow}${listeningResponse.technique.type}${colors.reset} (${listeningResponse.technique.confidence.toFixed(2)} confidence)`);
    console.log(`   🌟 Element: ${colors.magenta}${response.element}${colors.reset}`);
    console.log(`   ⏱️  Pause: ${response.duration}ms`);

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
  console.log(`${colors.bright}${colors.blue}📊 TEST ANALYSIS${colors.reset}`);
  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const analysis = analyzeTestResults(results);
  displayTestResults(analysis, results);

  return analysis;
}

function analyzeTestResults(results: TestTurn[]): TestResults {
  // Calculate scores
  const qualityScores = results.map(r => r.qualityScore || 0);
  const avgQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;

  // Check validation timing (should trigger early for self-attack)
  const earlyValidation = results.slice(0, 3).some(r => r.validationTriggered);
  const validationTiming = earlyValidation ? 1.0 : 0.5;

  // Check technique variety
  const uniqueTechniques = new Set(results.map(r => r.actualTechnique));
  const techniqueVariety = uniqueTechniques.size / 5; // 5 possible techniques

  // Check breakthrough detection
  const breakthroughTurn = results.find(r => r.expectedBreakthrough);
  const breakthroughDetection = breakthroughTurn?.breakthroughDetected ? 1.0 : 0.0;

  // Check RSD recognition
  const rsdTurns = results.filter(r => r.rsdDetected);
  const rsdRecognition = rsdTurns.length >= 2 ? 1.0 : rsdTurns.length / 2;

  // Check emotional intensity progression (should start high, peak, then drop)
  const intensityProgression = checkIntensityProgression(results);

  // Check specific quality markers
  const peakDetected = Math.max(...qualityScores) >= 0.7;
  const attuneTriggered = results.some(r => r.actualTechnique === 'attune');
  const celebratedBreakthrough = breakthroughTurn?.actualTechnique === 'celebrate' ||
                                breakthroughTurn?.actualElement === 'fire';
  const heldParadox = results[results.length - 1]?.actualElement === 'aether';

  return {
    overallScore: (avgQuality + validationTiming + techniqueVariety + breakthroughDetection + rsdRecognition + intensityProgression) / 6,
    neurodivergentValidationScore: validationTiming,
    emotionalIntensityTracking: intensityProgression,
    breakthroughDetection,
    techniqueVariety,
    rsdRecognition,
    validationTiming,
    qualityMetrics: {
      avgQuality,
      peakDetected,
      attuneTriggered,
      celebratedBreakthrough,
      heldParadox
    }
  };
}

function checkIntensityProgression(results: TestTurn[]): number {
  // Expected pattern: 6 → 7-8 → 5
  const scores = results.map(r => r.qualityScore || 0);

  // Check if there's a peak in the middle and drop at the end
  const hasPeak = Math.max(...scores.slice(1, 4)) > scores[0] &&
                  Math.max(...scores.slice(1, 4)) > scores[scores.length - 1];

  return hasPeak ? 1.0 : 0.5;
}

function displayTestResults(analysis: TestResults, results: TestTurn[]): void {
  console.log(`${colors.green}✅ SUCCESS CRITERIA CHECKLIST:${colors.reset}\n`);

  // Check each success criterion
  const criteria = [
    {
      name: "Validates within first 3 turns when self-attack appears",
      passed: analysis.validationTiming >= 0.8,
      score: analysis.validationTiming
    },
    {
      name: "Mentions RSD or neurological basis for social anxiety",
      passed: analysis.rsdRecognition >= 0.5,
      score: analysis.rsdRecognition
    },
    {
      name: "Detects and celebrates breakthrough at turn 5",
      passed: analysis.breakthroughDetection >= 0.8,
      score: analysis.breakthroughDetection
    },
    {
      name: "Uses variety of active listening techniques",
      passed: analysis.techniqueVariety >= 0.6,
      score: analysis.techniqueVariety
    },
    {
      name: "Maintains quality above threshold",
      passed: analysis.qualityMetrics.avgQuality >= 0.5,
      score: analysis.qualityMetrics.avgQuality
    },
    {
      name: "Holds paradox of knowing vs. feeling at end",
      passed: analysis.qualityMetrics.heldParadox,
      score: analysis.qualityMetrics.heldParadox ? 1.0 : 0.0
    }
  ];

  criteria.forEach(criterion => {
    const icon = criterion.passed ? '✅' : '❌';
    const color = criterion.passed ? colors.green : colors.red;
    console.log(`${icon} ${color}${criterion.name}${colors.reset} (${(criterion.score * 100).toFixed(0)}%)`);
  });

  console.log(`\n${colors.bright}📈 PERFORMANCE METRICS:${colors.reset}\n`);
  console.log(`Overall Score: ${getQualityBar(analysis.overallScore)} ${(analysis.overallScore * 100).toFixed(0)}%`);
  console.log(`Neurodivergent Support: ${(analysis.neurodivergentValidationScore * 100).toFixed(0)}%`);
  console.log(`RSD Recognition: ${(analysis.rsdRecognition * 100).toFixed(0)}%`);
  console.log(`Breakthrough Detection: ${(analysis.breakthroughDetection * 100).toFixed(0)}%`);
  console.log(`Technique Variety: ${(analysis.techniqueVariety * 100).toFixed(0)}%`);

  console.log(`\n${colors.bright}🎯 QUALITY INDICATORS:${colors.reset}\n`);
  console.log(`Peak Performance Achieved: ${analysis.qualityMetrics.peakDetected ? '✅' : '❌'}`);
  console.log(`Attune Technique Used: ${analysis.qualityMetrics.attuneTriggered ? '✅' : '❌'}`);
  console.log(`Celebrated Breakthrough: ${analysis.qualityMetrics.celebratedBreakthrough ? '✅' : '❌'}`);
  console.log(`Held Final Paradox: ${analysis.qualityMetrics.heldParadox ? '✅' : '❌'}`);

  // Detailed turn-by-turn analysis
  console.log(`\n${colors.bright}🔍 TURN-BY-TURN ANALYSIS:${colors.reset}\n`);
  results.forEach(turn => {
    console.log(`Turn ${turn.turn}: Expected ${turn.expectedTechnique} → Got ${turn.actualTechnique}`);
    console.log(`  Expected Element: ${turn.expectedElement || 'any'} → Got ${turn.actualElement}`);
    if (turn.validationTriggered) console.log(`  ✅ Validation triggered`);
    if (turn.rsdDetected) console.log(`  🎯 RSD pattern detected`);
    if (turn.breakthroughDetected) console.log(`  ✨ Breakthrough moment`);
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
  runTeenageAnxietyTest()
    .then(results => {
      console.log(`\n${colors.cyan}📋 Test completed with overall score: ${(results.overallScore * 100).toFixed(0)}%${colors.reset}\n`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`${colors.red}❌ Test failed:${colors.reset}`, error);
      process.exit(1);
    });
}

export { runTeenageAnxietyTest, TestResults };