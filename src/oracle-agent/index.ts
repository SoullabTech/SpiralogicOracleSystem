import 'dotenv/config';
import { OracleAgent } from './oracleAgent';
import { MasterControl } from './masterControl';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import process from 'process';

// Handle both ESM and CommonJS environments
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    const masterControl = new MasterControl({
      claudeApiKey: process.env.VITE_CLAUDE_API_KEY || '',
      openAiApiKey: process.env.VITE_OPENAI_API_KEY || ''
    });

    const agent = new OracleAgent(masterControl);
    
    const testCases = [
      {
        userId: 'test-user-1',
        input: 'What is my current phase telling me about my growth?',
        context: {
          element: 'fire',
          phase: 'exploration',
          archetype: 'Seeker',
          focusAreas: ['personal growth', 'creativity']
        }
      },
      {
        userId: 'test-user-2',
        input: 'How can I better integrate my learning?',
        context: {
          element: 'water',
          phase: 'integration',
          archetype: 'Scholar',
          focusAreas: ['wisdom', 'understanding']
        }
      }
    ];

    for (const testCase of testCases) {
      console.log('\n--- Testing Oracle Agent ---');
      console.log('Query:', testCase);
      const response = await agent.processQuery(testCase);
      console.log('Response:', response);
      console.log('Analysis:', response.analysis);
      console.log('------------------------\n');
    }

  } catch (error) {
    console.error('Error running Oracle agent:', error);
    process.exit(1);
  }
}

// Check if this is the main module being run
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { main };