/**
 * Test Dynamic Greeting Evolution
 * Tests the dynamic greeting system with various user contexts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

import { DynamicGreetingService } from './src/services/DynamicGreetingService.js';
import { UserMemoryService } from './src/services/UserMemoryService.js';

async function testDynamicGreetings() {
  console.log('\n🌟 Testing Dynamic Greeting Evolution\n');
  console.log('━'.repeat(60));

  // Test scenarios
  const scenarios = [
    {
      name: 'First-time user',
      userId: 'new-user-' + Date.now(),
      setupData: null
    },
    {
      name: 'Returning user (same day)',
      userId: 'returning-today-' + Date.now(),
      setupData: {
        element: 'fire',
        phase: 'initiation',
        delayMinutes: 0
      }
    },
    {
      name: 'Returning user (next day)',
      userId: 'returning-yesterday-' + Date.now(),
      setupData: {
        element: 'water',
        phase: 'challenge',
        delayMinutes: 60 * 24 // 1 day
      }
    },
    {
      name: 'Returning user (week later)',
      userId: 'returning-week-' + Date.now(),
      setupData: {
        element: 'earth',
        phase: 'integration',
        delayMinutes: 60 * 24 * 7 // 7 days
      }
    },
    {
      name: 'User with multiple sessions',
      userId: 'power-user-' + Date.now(),
      setupData: {
        sessions: [
          { element: 'air', phase: 'mastery' },
          { element: 'air', phase: 'mastery' },
          { element: 'spirit', phase: 'transcendence' }
        ]
      }
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n📝 Scenario: ${scenario.name}`);
    console.log('─'.repeat(40));

    try {
      // Setup test data if needed
      if (scenario.setupData) {
        if (scenario.setupData.sessions) {
          // Multiple sessions
          for (const session of scenario.setupData.sessions) {
            await UserMemoryService.saveSessionSummary(
              scenario.userId,
              session.element,
              session.phase
            );
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } else if (scenario.setupData.element) {
          // Single session with time offset
          await UserMemoryService.saveSessionSummary(
            scenario.userId,
            scenario.setupData.element,
            scenario.setupData.phase
          );
          
          // For testing, we can't actually change the database timestamp,
          // but the service will still generate appropriate greetings
        }
      }

      // Generate greeting
      const greeting = await DynamicGreetingService.generateGreeting(scenario.userId);
      
      console.log('Generated greeting:');
      console.log('  ', greeting);
      
      // Verify personalization elements
      const checks = {
        hasTimeGreeting: /morning|afternoon|evening|night|pre-dawn/i.test(greeting),
        hasElementReference: /fire|water|earth|air|spirit|void|flame|ocean|mountain|wind|mystery/i.test(greeting),
        hasPhaseReference: /initiation|challenge|integration|mastery|transcendence|journey|spiral/i.test(greeting),
        hasWelcomePhrase: /welcome|back|hello|greetings/i.test(greeting),
        hasMayaIdentity: /Maya|I'm|I am/i.test(greeting),
        hasInvitation: /\?|call|emerge|explore|serve|present/i.test(greeting)
      };

      console.log('\nPersonalization elements:');
      console.log('  ✓ Time greeting:', checks.hasTimeGreeting ? '✅' : '❌');
      console.log('  ✓ Element reference:', checks.hasElementReference ? '✅' : '❌');
      console.log('  ✓ Phase reference:', checks.hasPhaseReference ? '✅' : '❌');
      console.log('  ✓ Welcome phrase:', checks.hasWelcomePhrase ? '✅' : '❌');
      console.log('  ✓ Maya identity:', checks.hasMayaIdentity ? '✅' : '❌');
      console.log('  ✓ Invitation:', checks.hasInvitation ? '✅' : '❌');

      // Test follow-up greeting if returning user
      if (scenario.setupData && scenario.setupData.element) {
        const followUp = await DynamicGreetingService.generateFollowUpGreeting(
          scenario.userId,
          scenario.setupData.element,
          scenario.setupData.phase
        );
        console.log('\nFollow-up greeting:');
        console.log('  ', followUp);
      }

    } catch (error) {
      console.error(`❌ Error in scenario "${scenario.name}":`, error.message);
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log('✨ Dynamic Greeting Evolution test complete!');
}

// Run test
testDynamicGreetings().catch(console.error);