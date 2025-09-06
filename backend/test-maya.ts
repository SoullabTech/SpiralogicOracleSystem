/**
 * Maya Canonical Prompt Test Harness
 * Verifies that Maya is using the correct canonical system prompt
 * and not falling back to cached/generic responses
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from parent .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import { personalOracleAgent } from './src/agents/PersonalOracleAgent';

interface TestCase {
  name: string;
  input: string;
  shouldNotContain: string[];
  shouldContain: string[];
  expectedPattern: RegExp;
}

const testCases: TestCase[] = [
  {
    name: "Mystical Filler Test",
    input: "I'm feeling anxious about my job",
    shouldNotContain: [
      "gentle breeze",
      "ethereal chimes", 
      "sacred flame",
      "cosmic energy",
      "divine light",
      "universal wisdom"
    ],
    shouldContain: [
      "notice",
      "curious",
      "what",
      "feel"
    ],
    expectedPattern: /^(I notice|I'm curious|What|There's something)/
  },
  {
    name: "Advice Redirect Test", 
    input: "What should I do about my relationship?",
    shouldNotContain: [
      "You should",
      "The problem is",
      "You need to",
      "I recommend"
    ],
    shouldContain: [
      "wisdom",
      "notice",
      "feel",
      "what"
    ],
    expectedPattern: /\?$/  // Should end with a question
  },
  {
    name: "Professional Voice Test",
    input: "I don't know what I want in life",
    shouldNotContain: [
      "Everyone knows",
      "This means that",
      "Obviously",
      "Clearly"
    ],
    shouldContain: [
      "I'm here",
      "notice",
      "curious"
    ],
    expectedPattern: /^[A-Z][^.]{10,}[.?]$/  // Proper sentence structure
  }
];

async function testMayaCanonicalPrompt(): Promise<void> {
  console.log('🔮 Maya Canonical Prompt Test Harness');
  console.log('=====================================\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Input: "${testCase.input}"`);
    
    try {
      // Test Maya response
      const result = await personalOracleAgent.consult({
        userId: 'test-user',
        input: testCase.input,
        targetElement: 'aether',
        sessionId: 'test-session'
      });

      if (!result.success || !result.data) {
        console.log(`❌ FAILED: API error - ${result.errors?.join(', ') || 'Unknown error'}`);
        failed++;
        continue;
      }

      const response = result.data.message;
      console.log(`Response: "${response}"\n`);

      // Test 1: Should not contain mystical filler
      const failedShouldNotContain = testCase.shouldNotContain.filter(
        phrase => response.toLowerCase().includes(phrase.toLowerCase())
      );
      
      if (failedShouldNotContain.length > 0) {
        console.log(`❌ FAILED: Contains forbidden phrases: ${failedShouldNotContain.join(', ')}`);
        failed++;
        continue;
      }

      // Test 2: Should contain professional patterns
      const foundShouldContain = testCase.shouldContain.filter(
        phrase => response.toLowerCase().includes(phrase.toLowerCase())
      );
      
      if (foundShouldContain.length === 0) {
        console.log(`❌ FAILED: Missing expected patterns: ${testCase.shouldContain.join(', ')}`);
        failed++;
        continue;
      }

      // Test 3: Should match expected pattern
      if (!testCase.expectedPattern.test(response)) {
        console.log(`❌ FAILED: Doesn&apos;t match expected pattern: ${testCase.expectedPattern}`);
        failed++;
        continue;
      }

      console.log(`✅ PASSED: Maya using canonical prompt correctly`);
      passed++;

    } catch (error) {
      console.log(`❌ FAILED: Exception - ${error}`);
      failed++;
    }

    console.log('---\n');
  }

  // Summary
  console.log(`\n📊 Test Summary:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log(`\n🎉 All tests passed! Maya is using the canonical prompt correctly.`);
  } else {
    console.log(`\n⚠️  Some tests failed. Maya may be using cached/fallback responses.`);
  }
}

// Quick single test function
async function quickTest(input: string): Promise<void> {
  console.log(`🔮 Quick Maya Test: "${input}"`);
  
  try {
    const result = await personalOracleAgent.consult({
      userId: 'quick-test-user',
      input,
      targetElement: 'aether',
      sessionId: 'quick-test-session'
    });

    if (result.success && result.data) {
      console.log(`Response: "${result.data.message}"`);
      console.log(`Element: ${result.data.element}`);
      console.log(`Confidence: ${result.data.confidence}`);
    } else {
      console.log(`Error: ${result.errors?.join(', ') || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`Exception: ${error}`);
  }
}

// Export for command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Quick test mode with custom input
    quickTest(args.join(' '));
  } else {
    // Full test suite
    testMayaCanonicalPrompt();
  }
}

export { testMayaCanonicalPrompt, quickTest };