#!/usr/bin/env ts-node

/**
 * Transformational Conversation Test Console
 * Evaluates conversations against research-based transformation criteria
 */

import { transformationalConversation } from '../lib/oracle/TransformationalConversationCore';
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
  red: '\x1b[31m',
  white: '\x1b[37m'
};

// Element colors
const elementColors = {
  fire: colors.red,
  water: colors.blue,
  earth: colors.green,
  air: colors.cyan,
  aether: colors.magenta
};

/**
 * Test transformational qualities of a conversation
 */
async function testTransformationalQualities(input: string) {
  console.log(`\n${colors.bright}${colors.magenta}🌀 TRANSFORMATIONAL CONVERSATION TEST${colors.reset}`);
  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`${colors.bright}User:${colors.reset} "${input}"`);

  // Get Maya's response
  const maya = new MayaOrchestrator();
  const response = await maya.speak(input, 'test-user');
  console.log(`${colors.bright}Maya:${colors.reset} "${response.message}"\n`);

  // Evaluate transformational qualities
  const evaluation = transformationalConversation.evaluateConversation(input, response.message);

  // Display element-by-element breakdown
  console.log(`${colors.bright}${colors.white}📊 Elemental Analysis:${colors.reset}\n`);

  const elements = ['fire', 'water', 'earth', 'air', 'aether'] as const;

  for (const element of elements) {
    const elementIcon = getElementIcon(element);
    const elementColor = elementColors[element];

    console.log(`${elementColor}${elementIcon} ${element.toUpperCase()}${colors.reset}`);

    const patterns = evaluation[element];
    patterns.forEach(pattern => {
      const status = pattern.present ? '✓' : '✗';
      const statusColor = pattern.present ? colors.green : colors.red;
      const confidence = `${(pattern.confidence * 100).toFixed(0)}%`;

      console.log(`  ${statusColor}${status}${colors.reset} ${pattern.type.replace(/_/g, ' ')} (${confidence})`);

      if (pattern.evidence) {
        console.log(`     ${colors.dim}"${pattern.evidence}"${colors.reset}`);
      }
    });

    console.log(''); // Add spacing between elements
  }

  // Overall assessment
  console.log(`${colors.bright}${colors.white}🎯 Overall Assessment:${colors.reset}`);
  console.log(`  Score: ${getScoreBar(evaluation.overall.score)} ${(evaluation.overall.score * 100).toFixed(0)}%`);
  console.log(`  Potential: ${getTransformationalBadge(evaluation.overall.transformationalPotential)}`);

  if (evaluation.overall.missingElements.length > 0) {
    console.log(`\n  ${colors.yellow}⚠ Missing Elements:${colors.reset}`);
    evaluation.overall.missingElements.forEach(element => {
      console.log(`    - ${elementColors[element as keyof typeof elementColors]}${element}${colors.reset}`);
    });
  }

  if (evaluation.overall.recommendations.length > 0) {
    console.log(`\n  ${colors.cyan}💡 Recommendations:${colors.reset}`);
    evaluation.overall.recommendations.forEach(rec => {
      console.log(`    • ${rec}`);
    });
  }

  // Generate improvements
  const improvements = transformationalConversation.generateImprovements(evaluation);
  if (improvements.length > 0) {
    console.log(`\n  ${colors.magenta}✨ Specific Improvements:${colors.reset}`);
    improvements.slice(0, 3).forEach(imp => {
      console.log(`    → ${imp}`);
    });
  }

  console.log(`\n${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

/**
 * Get icon for each element
 */
function getElementIcon(element: string): string {
  const icons = {
    fire: '🔥',
    water: '💧',
    earth: '🌍',
    air: '🌬️',
    aether: '✨'
  };
  return icons[element as keyof typeof icons] || '○';
}

/**
 * Create visual score bar
 */
function getScoreBar(score: number): string {
  const filled = Math.round(score * 10);
  const empty = 10 - filled;
  const color = score > 0.7 ? colors.green : score > 0.4 ? colors.yellow : colors.red;
  return `${color}${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset}`;
}

/**
 * Get badge for transformational potential
 */
function getTransformationalBadge(potential: string): string {
  const badges = {
    low: `${colors.red}⚪ Low${colors.reset}`,
    moderate: `${colors.yellow}🟡 Moderate${colors.reset}`,
    high: `${colors.green}🟢 High${colors.reset}`
  };
  return badges[potential as keyof typeof badges] || badges.low;
}

/**
 * Test suite with transformational scenarios
 */
async function runTestSuite() {
  console.log(`\n${colors.bright}${colors.magenta}🧪 TRANSFORMATIONAL TEST SUITE${colors.reset}\n`);

  const testCases = [
    // Identity/transformation scenarios
    "I don't know who I am anymore",
    "Everything is changing and I feel lost",
    "I'm at a threshold in my life",

    // Shadow work scenarios
    "I keep repeating the same patterns",
    "Part of me wants this but part of me is terrified",
    "I hate this side of myself",

    // Vision/possibility scenarios
    "I wonder what's possible for me",
    "I'm ready for something new",
    "I feel called to something bigger",

    // Values/meaning scenarios
    "What's the point of all this work?",
    "I've lost touch with what matters",
    "My values are shifting",

    // Collective/connection scenarios
    "I feel so alone in this journey",
    "How do others handle this?",
    "I need to find my people"
  ];

  for (const testCase of testCases) {
    await testTransformationalQualities(testCase);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary statistics
  console.log(`\n${colors.bright}${colors.white}📈 Suite Complete${colors.reset}`);
}

/**
 * Interactive mode with live evaluation
 */
async function runInteractive() {
  console.log(`\n${colors.bright}${colors.cyan}🎤 TRANSFORMATIONAL CONVERSATION MODE${colors.reset}`);
  console.log(`${colors.dim}Enter messages to test transformational qualities. Type 'exit' to quit.${colors.reset}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${colors.cyan}You: ${colors.reset}`
  });

  // Track conversation history
  const conversationHistory: string[] = [];

  rl.prompt();

  rl.on('line', async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log(`\n${colors.dim}Ending transformational space... 🌙${colors.reset}\n`);
      rl.close();
      process.exit(0);
    }

    if (input.toLowerCase() === 'history') {
      console.log(`\n${colors.bright}Conversation History:${colors.reset}`);
      conversationHistory.forEach((msg, i) => {
        console.log(`  ${i + 1}. ${msg}`);
      });
      rl.prompt();
      return;
    }

    conversationHistory.push(input);
    await testTransformationalQualities(input);
    rl.prompt();
  });
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`\n${colors.bright}${colors.white}🌀 Transformational Conversation Tester${colors.reset}\n`);

  console.log(`${colors.bright}Usage:${colors.reset}`);
  console.log(`  npx ts-node scripts/testTransformational.ts              # Interactive mode`);
  console.log(`  npx ts-node scripts/testTransformational.ts --suite      # Run test suite`);
  console.log(`  npx ts-node scripts/testTransformational.ts --test "..." # Test specific input`);
  console.log(`  npx ts-node scripts/testTransformational.ts --help       # Show this help`);

  console.log(`\n${colors.bright}Evaluation Criteria:${colors.reset}`);
  console.log(`  ${elementColors.fire}🔥 Fire${colors.reset}    - Challenge, vision, meaningful friction`);
  console.log(`  ${elementColors.water}💧 Water${colors.reset}   - Empathy, vulnerability, mirroring`);
  console.log(`  ${elementColors.earth}🌍 Earth${colors.reset}   - Grounding, values, steady safety`);
  console.log(`  ${elementColors.air}🌬️  Air${colors.reset}     - Questions, perspectives, clarity`);
  console.log(`  ${elementColors.aether}✨ Aether${colors.reset}  - Integration, meaning, sacred field`);

  console.log(`\n${colors.bright}Research-Based Patterns:${colors.reset}`);
  console.log(`  • Open-ended questions that invite discovery`);
  console.log(`  • Perspective-taking and empathic attunement`);
  console.log(`  • Values alignment and meaning-making`);
  console.log(`  • Safe relational space for vulnerability`);
  console.log(`  • Feedback loops and reflection`);
  console.log(`  • Language matching and resonance`);

  console.log(`\n${colors.dim}Based on modern research in transformational dialogue,`);
  console.log(`psychology, and leadership studies.${colors.reset}\n`);
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
      await testTransformationalQualities(input);
    } else {
      console.error('Please provide input to test');
    }
  } else if (args[0] === '--help' || args[0] === '-h') {
    showHelp();
  } else {
    // Direct input
    await testTransformationalQualities(args.join(' '));
  }
}

// Run the script
main().catch(console.error);