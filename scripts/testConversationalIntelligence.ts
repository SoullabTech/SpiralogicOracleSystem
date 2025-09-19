#!/usr/bin/env ts-node
/**
 * Conversational Intelligence Test Harness
 * Integrated analyzer that auto-evaluates transformational depth
 */

import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator';
import { conversationAnalyzer } from '../lib/oracle/ConversationAnalyzer';
import * as readline from 'readline';

class ConversationalIntelligenceHarness {
  private maya = new MayaOrchestrator();
  private sessionActive = false;
  private turnCount = 0;

  async startInteractiveSession(): Promise<void> {
    console.log('\n🌀 MAYA CONVERSATIONAL INTELLIGENCE TEST HARNESS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Real-time transformational conversation analysis');
    console.log('Type "exit" to end session, "export" to save analysis\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.sessionActive = true;

    const prompt = () => {
      rl.question(`\n[Turn ${this.turnCount + 1}] You: `, async (input) => {
        if (input.toLowerCase() === 'exit') {
          this.endSession();
          rl.close();
          return;
        }

        if (input.toLowerCase() === 'export') {
          this.exportSession();
          prompt();
          return;
        }

        await this.processExchange(input);
        prompt();
      });
    };

    prompt();
  }

  async runBatchTest(testCases: Array<{user: string, description?: string}>): Promise<void> {
    console.log('\n🧪 BATCH TESTING CONVERSATIONAL INTELLIGENCE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n📋 Test ${i + 1}${testCase.description ? ': ' + testCase.description : ''}`);
      console.log(`Input: "${testCase.user}"`);

      await this.processExchange(testCase.user);

      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n📊 BATCH TEST SUMMARY');

    const history = conversationAnalyzer.getHistory();
    if (history.length > 0) {
      const avgScore = history.reduce((sum, turn) => sum + turn.analysis.overall, 0) / history.length;
      console.log(`Average Transformational Score: ${(avgScore * 100).toFixed(0)}%`);
      console.log(`Total Exchanges: ${history.length}`);
    } else {
      console.log('No successful exchanges completed');
    }
  }

  private async processExchange(userInput: string): Promise<void> {
    this.turnCount++;

    try {
      // Get Maya's response using the correct method
      const response = await this.maya.speak(userInput, 'test-user');

      // Display response
      console.log(`\n🌸 Maya: ${response.message}`);

      // Auto-analyze with live feedback
      conversationAnalyzer.analyze(
        userInput,
        response.message,
        {
          dominant: response.element || 'neutral',
          intensity: 0.5
        }
      );

    } catch (error) {
      console.error('\n❌ Error during exchange:', error.message);
    }
  }

  private endSession(): void {
    this.sessionActive = false;
    console.log('\n🎯 SESSION COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━');

    const history = conversationAnalyzer.getHistory();
    if (history.length > 0) {
      const avgScore = history.reduce((sum, turn) => sum + turn.analysis.overall, 0) / history.length;
      console.log(`\nFinal Session Score: ${(avgScore * 100).toFixed(0)}%`);
      console.log(`Total Exchanges: ${history.length}`);
    }

    console.log('\n📈 Session exported to conversation-analysis.json');
    conversationAnalyzer.exportToFile('conversation-analysis.json');
  }

  private exportSession(): void {
    const filename = `conversation-analysis-${Date.now()}.json`;
    conversationAnalyzer.exportToFile(filename);
    console.log(`\n💾 Session exported to ${filename}`);
  }
}

// Predefined test scenarios for batch testing
const TRANSFORMATIONAL_TEST_CASES = [
  {
    user: "I feel stuck in patterns I can't break out of",
    description: "Emotional vulnerability + pattern recognition"
  },
  {
    user: "My career feels meaningless, just going through motions",
    description: "Meaning-making + vision activation needed"
  },
  {
    user: "Everyone expects me to be strong but I'm falling apart inside",
    description: "Authenticity + emotional mirroring test"
  },
  {
    user: "I keep having the same argument with my partner",
    description: "Relationship pattern + perspective shift"
  },
  {
    user: "What's the point of trying when everything feels impossible?",
    description: "Existential + grounding challenge"
  },
  {
    user: "I'm successful on paper but feel empty inside",
    description: "Success paradox + integration needs"
  },
  {
    user: "I can see what I need to do but can't make myself do it",
    description: "Action gap + practical grounding"
  },
  {
    user: "My anxiety is controlling my life lately",
    description: "Emotional state + spacious presence"
  }
];

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const harness = new ConversationalIntelligenceHarness();

  if (args.includes('--batch') || args.includes('-b')) {
    await harness.runBatchTest(TRANSFORMATIONAL_TEST_CASES);
  } else if (args.includes('--interactive') || args.includes('-i') || args.includes('--live')) {
    await harness.startInteractiveSession();
  } else {
    console.log('\n🌀 MAYA CONVERSATIONAL INTELLIGENCE HARNESS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Usage:');
    console.log('  --interactive, -i    Start interactive conversation');
    console.log('  --live               Start live conversation (same as interactive)');
    console.log('  --batch, -b          Run predefined test scenarios');
    console.log('\nExample:');
    console.log('  npm run test:convo -- --interactive');
    console.log('  npm run test:convo -- --live');
    console.log('  npm run test:convo -- --batch');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { ConversationalIntelligenceHarness, TRANSFORMATIONAL_TEST_CASES };