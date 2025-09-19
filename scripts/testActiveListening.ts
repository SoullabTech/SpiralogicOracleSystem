#!/usr/bin/env ts-node

/**
 * Active Listening Test Console
 * Tests Maya's active listening capabilities
 */

import { activeListening } from '../lib/oracle/ActiveListeningCore';
import { sacredListening } from '../lib/oracle/SacredListeningDetector';
import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator';
import * as readline from 'readline';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

/**
 * Test active listening on a specific input
 */
async function testActiveListening(input: string) {
  console.log(`\n${colors.bright}${colors.cyan}🌀 ACTIVE LISTENING TEST${colors.reset}`);
  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`${colors.bright}User Input:${colors.reset} "${input}"`);

  // Test Active Listening Detection
  const listeningResponse = activeListening.listen(input);
  console.log(`\n${colors.yellow}📡 Active Listening Analysis:${colors.reset}`);
  console.log(`  Technique: ${colors.bright}${listeningResponse.technique.type}${colors.reset}`);
  console.log(`  Element: ${colors.magenta}${listeningResponse.technique.element}${colors.reset}`);
  console.log(`  Confidence: ${listeningResponse.technique.confidence}`);
  console.log(`  Suggested Response: "${colors.cyan}${listeningResponse.response}${colors.reset}"`);
  if (listeningResponse.followUp) {
    console.log(`  Follow-up: "${colors.cyan}${listeningResponse.followUp}${colors.reset}"`);
  }
  console.log(`  Silence Duration: ${listeningResponse.silenceDuration}ms`);

  // Test Sacred Listening Detection
  const cues = sacredListening.detectCues(input);
  console.log(`\n${colors.green}🔮 Sacred Listening Cues:${colors.reset}`);
  if (cues.length > 0) {
    cues.forEach(cue => {
      console.log(`  ${cue.type}: ${colors.bright}${cue.confidence}${colors.reset} confidence`);
      if (cue.topic) {
        console.log(`    Topic: "${colors.blue}${cue.topic}${colors.reset}"`);
      }
    });
  } else {
    console.log(`  ${colors.dim}No specific cues detected${colors.reset}`);
  }

  // Test Maya's Response
  const maya = new MayaOrchestrator();
  const response = await maya.speak(input, 'test-user');

  console.log(`\n${colors.magenta}🌸 Maya's Response:${colors.reset}`);
  console.log(`  "${colors.bright}${response.message}${colors.reset}"`);
  console.log(`  Element: ${response.element}`);
  console.log(`  Pause Duration: ${response.duration}ms`);

  // Evaluate the response
  const evaluation = activeListening.evaluateListening(input, response.message);
  console.log(`\n${colors.blue}📊 Listening Quality Scores:${colors.reset}`);
  console.log(`  Mirroring: ${getBar(evaluation.mirroring)} ${(evaluation.mirroring * 100).toFixed(0)}%`);
  console.log(`  Clarifying: ${getBar(evaluation.clarifying)} ${(evaluation.clarifying * 100).toFixed(0)}%`);
  console.log(`  Attunement: ${getBar(evaluation.attunement)} ${(evaluation.attunement * 100).toFixed(0)}%`);
  console.log(`  Space/Brevity: ${getBar(evaluation.space)} ${(evaluation.space * 100).toFixed(0)}%`);
  console.log(`  ${colors.bright}Overall: ${getBar(evaluation.overall)} ${(evaluation.overall * 100).toFixed(0)}%${colors.reset}`);

  console.log(`\n${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

/**
 * Create a visual bar for scores
 */
function getBar(score: number): string {
  const filled = Math.round(score * 10);
  const empty = 10 - filled;
  const color = score > 0.7 ? colors.green : score > 0.4 ? colors.yellow : colors.red;
  return `${color}${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset}`;
}

/**
 * Test Suite with common scenarios
 */
async function runTestSuite() {
  console.log(`\n${colors.bright}${colors.magenta}🧪 ACTIVE LISTENING TEST SUITE${colors.reset}\n`);

  const testCases = [
    // Interest/sharing scenarios
    "I love it. Its a beautiful day and my work is progressing",
    "me too. my work brings that kind of joy",

    // Emotional scenarios
    "I feel stuck in cycles I can't break",
    "I'm feeling overwhelmed by everything",

    // Questioning scenarios
    "What's the point of all this?",
    "Why do I keep doing the same things?",

    // Celebration scenarios
    "I finally finished my project!",
    "Everything is clicking into place",

    // Vague references
    "That thing we talked about is bothering me",
    "They said something that really hurt",

    // Deep sharing
    "I've been thinking about death lately and what it all means",
    "Sometimes I wonder if I'm on the right path in life"
  ];

  for (const testCase of testCases) {
    await testActiveListening(testCase);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/**
 * Interactive mode
 */
async function runInteractive() {
  console.log(`\n${colors.bright}${colors.cyan}🎤 INTERACTIVE ACTIVE LISTENING TEST${colors.reset}`);
  console.log(`${colors.dim}Type your message and see how Maya listens. Type 'exit' to quit.${colors.reset}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${colors.cyan}You: ${colors.reset}`
  });

  rl.prompt();

  rl.on('line', async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log(`\n${colors.dim}Goodbye! 🌙${colors.reset}\n`);
      rl.close();
      process.exit(0);
    }

    await testActiveListening(input);
    rl.prompt();
  });
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // No arguments - run interactive mode
    await runInteractive();
  } else if (args[0] === '--suite') {
    // Run test suite
    await runTestSuite();
  } else if (args[0] === '--test') {
    // Test specific input
    const input = args.slice(1).join(' ');
    if (input) {
      await testActiveListening(input);
    } else {
      console.error('Please provide input to test');
    }
  } else {
    // Direct input
    await testActiveListening(args.join(' '));
  }
}

// Run the script
main().catch(console.error);