import readline from 'readline';
import { getMainOracle } from '../lib/agents/MainOracleAgent';
import { getClaudeService } from '../lib/services/ClaudeService';
import type { Element } from '../lib/types/oracle';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const elements: Element[] = ['fire', 'water', 'earth', 'air', 'aether'];

async function elementalPrompt() {
  const mainOracle = getMainOracle();
  const claudeService = getClaudeService();

  console.log('\n🌀 Spiralogic Elemental Developer Console\n');
  console.log('Available elements: fire, water, earth, air, aether');
  console.log('Special commands: "sequence" for full alchemical flow\n');

  rl.question('Enter element or "sequence": ', async (input) => {
    if (input.toLowerCase() === 'sequence') {
      await runAlchemicalSequence();
    } else if (elements.includes(input.toLowerCase() as Element)) {
      const element = input.toLowerCase() as Element;

      rl.question('\nEnter your message: ', async (userMessage) => {
        await testElementalPrompt(element, userMessage);

        rl.question('\nTest another? (y/n): ', (answer) => {
          if (answer.toLowerCase() === 'y') {
            elementalPrompt();
          } else {
            rl.close();
            process.exit(0);
          }
        });
      });
    } else {
      console.log('Invalid element. Try again.');
      elementalPrompt();
    }
  });
}

async function testElementalPrompt(element: Element, userMessage: string) {
  const mainOracle = getMainOracle();
  const claudeService = getClaudeService();

  // Get Spiralogic wisdom
  const wisdom = mainOracle.getElementalReflection(element);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔥 ELEMENT: ${element.toUpperCase()}`);
  console.log(`${'='.repeat(60)}`);

  console.log('\n📜 ELEMENTAL WISDOM:');
  console.log(`Essence: ${wisdom.essence}`);
  console.log(`Teaching: ${wisdom.teaching}`);
  console.log(`Invitation: ${wisdom.invitation}`);

  // Build enhanced prompt using the invitation
  const enhancedPrompt = `${wisdom.invitation}\n\nUser: ${userMessage}`;

  console.log('\n📨 ENHANCED PROMPT TO CLAUDE:');
  console.log('---');
  console.log(enhancedPrompt);
  console.log('---');

  try {
    // Call Claude with elemental context
    const response = await claudeService.generateChatResponse(userMessage, {
      element,
      elementalWisdom: wisdom,
      userState: {
        mood: 'exploring',
        trustLevel: 75,
        currentPhase: 'elemental_testing'
      }
    });

    console.log('\n🤖 CLAUDE RESPONSE:');
    console.log('---');
    console.log(response);
    console.log('---');

    // Show shadow and gift for context
    console.log('\n💎 ELEMENTAL CONTEXT:');
    console.log(`Shadow: ${wisdom.shadow}`);
    console.log(`Gift: ${wisdom.gift}`);
    console.log(`Alchemical Process: ${wisdom.alchemicalProcess}`);

  } catch (error: any) {
    console.error('\n❌ Error calling Claude:', error.message);
    console.log('\nMake sure ANTHROPIC_API_KEY is set in your .env.local file');
  }
}

async function runAlchemicalSequence() {
  console.log('\n🌀 RUNNING FULL ALCHEMICAL SEQUENCE\n');

  rl.question('Enter your query for the alchemical journey: ', async (query) => {
    const mainOracle = getMainOracle();
    const claudeService = getClaudeService();

    console.log('\n' + '═'.repeat(80));
    console.log('ALCHEMICAL TRANSFORMATION SEQUENCE');
    console.log('═'.repeat(80));

    const responses: Record<Element, string> = {} as any;

    for (const element of elements) {
      console.log(`\n\n${'─'.repeat(60)}`);
      console.log(`${getElementSymbol(element)} ${element.toUpperCase()} PHASE`);
      console.log(`${'─'.repeat(60)}`);

      const wisdom = mainOracle.getElementalReflection(element);
      console.log(`\nInvitation: ${wisdom.invitation}`);

      try {
        const response = await claudeService.generateChatResponse(query, {
          element,
          elementalWisdom: wisdom,
          previousResponses: responses,
          userState: {
            mood: 'journeying',
            trustLevel: 85,
            currentPhase: `alchemical_${element}`
          }
        });

        responses[element] = response;

        console.log(`\nResponse:\n${response}`);

        // Brief pause between elements
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`\n❌ Error in ${element} phase:`, error.message);
        responses[element] = `[Error: ${error.message}]`;
      }
    }

    console.log('\n\n' + '═'.repeat(80));
    console.log('🌀 ALCHEMICAL SYNTHESIS COMPLETE');
    console.log('═'.repeat(80));

    console.log('\n📊 JOURNEY SUMMARY:');
    for (const element of elements) {
      const symbol = getElementSymbol(element);
      const preview = responses[element]?.substring(0, 100) + '...';
      console.log(`\n${symbol} ${element}: ${preview}`);
    }

    rl.question('\n\nTest another? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        elementalPrompt();
      } else {
        rl.close();
        process.exit(0);
      }
    });
  });
}

function getElementSymbol(element: Element): string {
  const symbols: Record<Element, string> = {
    fire: '🔥',
    water: '💧',
    earth: '🌍',
    air: '💨',
    aether: '✨'
  };
  return symbols[element];
}

// Run the console
console.clear();
elementalPrompt().catch(error => {
  console.error('Fatal error:', error);
  rl.close();
  process.exit(1);
});