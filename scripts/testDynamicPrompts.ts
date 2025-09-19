#!/usr/bin/env ts-node

/**
 * Dynamic Transformational Prompt Test Console
 * Tests Maya's dynamic prompt assembly and transformational response capabilities
 */

import { dynamicPrompts } from '../lib/oracle/DynamicPromptOrchestrator';
import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator';
import { transformationalConversation } from '../lib/oracle/TransformationalConversationCore';
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
 * Test dynamic prompt assembly and response generation
 */
async function testDynamicPrompts(input: string) {
  console.log(`\n${colors.bright}${colors.magenta}🌀 DYNAMIC TRANSFORMATIONAL PROMPT TEST${colors.reset}`);
  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`${colors.bright}User Input:${colors.reset} "${input}"`);

  // Step 1: Pattern Detection
  const patterns = dynamicPrompts.detectPatterns(input);
  console.log(`\n${colors.cyan}🔍 Pattern Detection:${colors.reset}`);
  console.log(`  Abstraction Level: ${getBar(patterns.abstractionLevel)} ${(patterns.abstractionLevel * 100).toFixed(0)}%`);
  console.log(`  Vulnerability: ${getBar(patterns.vulnerability)} ${(patterns.vulnerability * 100).toFixed(0)}%`);
  console.log(`  Stuck Loops: ${patterns.stuckLoops}`);
  console.log(`  Needs Grounding: ${patterns.needsGrounding ? '✓' : '✗'}`);
  console.log(`  Needs Challenge: ${patterns.needsChallenge ? '✓' : '✗'}`);
  console.log(`  Needs Safety: ${patterns.needsSafety ? '✓' : '✗'}`);

  if (patterns.transformationalMarkers.length > 0) {
    console.log(`  Transformational Markers: ${colors.magenta}${patterns.transformationalMarkers.join(', ')}${colors.reset}`);
  }

  // Step 2: Spiral State Detection
  const spiralState = dynamicPrompts.determineSpiralState(input);
  console.log(`\n${colors.yellow}🌀 Spiral State:${colors.reset}`);
  console.log(`  Dominant Element: ${elementColors[spiralState.dominant]}${spiralState.dominant.toUpperCase()}${colors.reset}`);
  console.log(`  Intensity: ${getBar(spiralState.intensity)} ${(spiralState.intensity * 100).toFixed(0)}%`);
  console.log(`  Direction: ${spiralState.direction}`);

  // Step 3: Context Building
  const context = dynamicPrompts.buildContext(input);
  console.log(`\n${colors.green}📊 Conversation Context:${colors.reset}`);
  console.log(`  Depth: ${getDepthIcon(context.conversationDepth)} ${context.conversationDepth}`);
  console.log(`  Emotional Trend: ${context.emotionalTrend}`);

  if (context.significantMetaphors.length > 0) {
    console.log(`  Metaphors: ${colors.blue}${context.significantMetaphors.join(', ')}${colors.reset}`);
  }

  // Step 4: Dynamic Prompt Assembly
  const assembledPrompt = dynamicPrompts.assembleTransformationalPrompt(input, context, spiralState, patterns);
  console.log(`\n${colors.magenta}🎭 Dynamic Prompt Assembly:${colors.reset}`);
  console.log(`${colors.dim}━━━ ASSEMBLED PROMPT ━━━${colors.reset}`);

  // Show key sections of the prompt
  const promptLines = assembledPrompt.split('\n');
  const keyLines = promptLines.filter(line =>
    line.includes('PRIORITY') ||
    line.includes('Time for') ||
    line.includes('Mirror their') ||
    line.includes('Transformation energy') ||
    line.includes('Notice:') ||
    line.trim().startsWith('-')
  ).slice(0, 8); // Show up to 8 key directive lines

  keyLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('PRIORITY')) {
      console.log(`  ${colors.red}${trimmed}${colors.reset}`);
    } else if (trimmed.startsWith('Time for')) {
      console.log(`  ${colors.yellow}${trimmed}${colors.reset}`);
    } else if (trimmed.startsWith('Mirror')) {
      console.log(`  ${colors.blue}${trimmed}${colors.reset}`);
    } else if (trimmed.startsWith('Transformation')) {
      console.log(`  ${colors.magenta}${trimmed}${colors.reset}`);
    } else {
      console.log(`  ${colors.dim}${trimmed}${colors.reset}`);
    }
  });

  console.log(`${colors.dim}━━━ (showing key directives) ━━━${colors.reset}`);

  // Step 5: Maya's Response
  const maya = new MayaOrchestrator();
  const response = await maya.speak(input, 'test-user');

  console.log(`\n${colors.bright}🌸 Maya's Dynamic Response:${colors.reset}`);
  console.log(`  "${colors.white}${response.message}${colors.reset}"`);
  console.log(`  Element: ${elementColors[response.element as keyof typeof elementColors]}${response.element}${colors.reset}`);
  console.log(`  Duration: ${response.duration}ms`);

  // Step 6: Transformational Evaluation
  const evaluation = transformationalConversation.evaluateConversation(input, response.message);

  console.log(`\n${colors.bright}📈 Transformational Quality:${colors.reset}`);
  console.log(`  Overall Score: ${getBar(evaluation.overall.score)} ${(evaluation.overall.score * 100).toFixed(0)}%`);
  console.log(`  Potential: ${getTransformationalBadge(evaluation.overall.transformationalPotential)}`);

  // Show element scores
  const elements = ['fire', 'water', 'earth', 'air', 'aether'] as const;
  elements.forEach(element => {
    const patterns = evaluation[element];
    const elementScore = patterns.reduce((sum, p) => sum + (p.present ? p.confidence : 0), 0) / patterns.length;
    const icon = getElementIcon(element);
    console.log(`  ${elementColors[element]}${icon} ${element}: ${getBar(elementScore)} ${(elementScore * 100).toFixed(0)}%${colors.reset}`);
  });

  // Show recommendations
  if (evaluation.overall.recommendations.length > 0) {
    console.log(`\n  ${colors.cyan}💡 Improvements:${colors.reset}`);
    evaluation.overall.recommendations.slice(0, 3).forEach(rec => {
      console.log(`    • ${rec}`);
    });
  }

  console.log(`\n${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

/**
 * Helper functions
 */
function getBar(score: number): string {
  const filled = Math.round(score * 10);
  const empty = 10 - filled;
  const color = score > 0.7 ? colors.green : score > 0.4 ? colors.yellow : colors.red;
  return `${color}${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset}`;
}

function getElementIcon(element: string): string {
  const icons = { fire: '🔥', water: '💧', earth: '🌍', air: '🌬️', aether: '✨' };
  return icons[element as keyof typeof icons] || '○';
}

function getDepthIcon(depth: string): string {
  const icons = { surface: '🏄', midwater: '🐟', deep: '🐋' };
  return icons[depth as keyof typeof icons] || '○';
}

function getTransformationalBadge(potential: string): string {
  const badges = {
    low: `${colors.red}⚪ Low${colors.reset}`,
    moderate: `${colors.yellow}🟡 Moderate${colors.reset}`,
    high: `${colors.green}🟢 High${colors.reset}`
  };
  return badges[potential as keyof typeof badges] || badges.low;
}

/**
 * Training scenarios for different conversation types
 */
async function runTrainingScenarios() {
  console.log(`\n${colors.bright}${colors.magenta}🎯 MAYA TRAINING SCENARIOS${colors.reset}\n`);

  const scenarios = [
    {
      category: "🔥 Fire - Challenge/Vision",
      inputs: [
        "I want to start my own business but I'm scared",
        "I keep procrastinating on my creative projects",
        "I have this vision but don't know how to make it real"
      ]
    },
    {
      category: "💧 Water - Emotion/Shadow",
      inputs: [
        "I feel like I'm drowning in sadness",
        "Part of me wants this but another part is sabotaging",
        "I'm scared to let people see the real me"
      ]
    },
    {
      category: "🌍 Earth - Grounding/Structure",
      inputs: [
        "Everything feels overwhelming and scattered",
        "I have all these ideas but can't focus",
        "I need to make a practical decision about my career"
      ]
    },
    {
      category: "🌬️ Air - Perspective/Patterns",
      inputs: [
        "I keep ending up in the same relationships",
        "I can't see the forest for the trees",
        "What if I'm looking at this all wrong?"
      ]
    },
    {
      category: "✨ Aether - Integration/Meaning",
      inputs: [
        "What's the point of all this suffering?",
        "I feel like I'm at a major life threshold",
        "How do all these pieces fit together?"
      ]
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n${colors.bright}${scenario.category}${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(50)}${colors.reset}`);

    for (const input of scenario.inputs) {
      console.log(`\n${colors.cyan}Testing:${colors.reset} "${input}"`);

      // Quick analysis without full display
      const patterns = dynamicPrompts.detectPatterns(input);
      const spiralState = dynamicPrompts.determineSpiralState(input);
      const maya = new MayaOrchestrator();
      const response = await maya.speak(input, 'test-user');

      console.log(`${colors.white}Response:${colors.reset} "${response.message}"`);

      // Quick quality check
      const evaluation = transformationalConversation.evaluateConversation(input, response.message);
      const score = evaluation.overall.score;
      const scoreColor = score > 0.7 ? colors.green : score > 0.4 ? colors.yellow : colors.red;

      console.log(`${colors.dim}Element: ${spiralState.dominant} | Quality: ${scoreColor}${(score * 100).toFixed(0)}%${colors.reset} | Safety: ${patterns.needsSafety ? '🛡️' : '○'} | Challenge: ${patterns.needsChallenge ? '⚡' : '○'}`);

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  console.log(`\n${colors.bright}🎯 Training Complete!${colors.reset}`);
}

/**
 * Interactive mode with dynamic prompt inspection
 */
async function runInteractive() {
  console.log(`\n${colors.bright}${colors.cyan}🎤 DYNAMIC PROMPT INSPECTOR${colors.reset}`);
  console.log(`${colors.dim}Enter messages to see dynamic prompt assembly. Commands:${colors.reset}`);
  console.log(`${colors.dim}  'train' - Run training scenarios${colors.reset}`);
  console.log(`${colors.dim}  'element [fire|water|earth|air|aether]' - Test element question${colors.reset}`);
  console.log(`${colors.dim}  'exit' - Quit${colors.reset}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${colors.cyan}Input: ${colors.reset}`
  });

  rl.prompt();

  rl.on('line', async (input) => {
    const trimmed = input.trim().toLowerCase();

    if (trimmed === 'exit') {
      console.log(`\n${colors.dim}Dynamic training complete! 🌙${colors.reset}\n`);
      rl.close();
      process.exit(0);
    }

    if (trimmed === 'train') {
      await runTrainingScenarios();
      rl.prompt();
      return;
    }

    if (trimmed.startsWith('element ')) {
      const element = trimmed.split(' ')[1];
      const question = dynamicPrompts.getElementQuestion(element);
      console.log(`\n${elementColors[element as keyof typeof elementColors]}${element.toUpperCase()} Question:${colors.reset} "${question}"\n`);
      rl.prompt();
      return;
    }

    await testDynamicPrompts(input);
    rl.prompt();
  });
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await runInteractive();
  } else if (args[0] === '--train') {
    await runTrainingScenarios();
  } else if (args[0] === '--test') {
    const input = args.slice(1).join(' ');
    if (input) {
      await testDynamicPrompts(input);
    } else {
      console.error('Please provide input to test');
    }
  } else {
    await testDynamicPrompts(args.join(' '));
  }
}

// Run the script
main().catch(console.error);