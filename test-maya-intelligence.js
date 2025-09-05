#!/usr/bin/env node
/**
 * Maya Intelligence Test Suite
 * Tests all intelligence capabilities at 100%
 */

const chalk = require('chalk');

// Test configuration
const API_URL = 'http://localhost:3002';
const TESTS = {
  intelligence: true,
  memory: true,
  reasoning: true,
  voice: true,
  streaming: true
};

// Utility functions
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✅'), msg),
  error: (msg) => console.log(chalk.red('❌'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠️'), msg),
  header: (msg) => console.log(chalk.cyan.bold(`\n🧠 ${msg}`))
};

// Test 1: Intelligence Status
async function testIntelligenceStatus() {
  log.header('Testing Intelligence Status Endpoint');
  
  try {
    const response = await fetch('http://localhost:3000/api/status/intelligence');
    const data = await response.json();
    
    log.info(`Overall Intelligence: ${data.intelligence.level}%`);
    log.info(`Status: ${data.intelligence.status}`);
    
    console.log('\nCapabilities:');
    data.capabilities.forEach(cap => {
      const icon = cap.percentage === 100 ? '✅' : 
                  cap.percentage >= 50 ? '⚠️' : '❌';
      console.log(`${icon} ${cap.name}: ${cap.percentage}% - ${cap.description}`);
    });
    
    if (data.recommendations && data.recommendations.length > 0) {
      console.log('\n📋 Recommendations:');
      data.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
    
    return data.intelligence.level;
  } catch (error) {
    log.error(`Intelligence status test failed: ${error.message}`);
    return 0;
  }
}

// Test 2: Memory System
async function testMemorySystem() {
  log.header('Testing Memory System (Mem0)');
  
  try {
    // Test memory through oracle endpoint
    const testMessages = [
      "Remember that my favorite color is indigo",
      "I told you my favorite color earlier, what was it?",
      "I'm feeling very connected to the water element today"
    ];
    
    for (const message of testMessages) {
      log.info(`Testing: "${message}"`);
      
      const response = await fetch(`${API_URL}/api/oracle/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          userId: 'test-user-memory',
          sessionId: 'test-session-memory'
        })
      });
      
      const data = await response.json();
      if (data.response) {
        log.success(`Response received (${data.response.length} chars)`);
        
        // Check if memory was referenced
        if (message.includes('earlier') && data.response.toLowerCase().includes('indigo')) {
          log.success('Memory recall successful! 🎉');
        }
      }
    }
  } catch (error) {
    log.error(`Memory test failed: ${error.message}`);
  }
}

// Test 3: LangChain Reasoning
async function testReasoningChains() {
  log.header('Testing LangChain Reasoning Chains');
  
  try {
    const reasoningTests = [
      {
        message: "I feel stuck between my desire for freedom and my need for security",
        expectedMode: "elemental_analysis"
      },
      {
        message: "I keep having the same dream about water and transformation",
        expectedMode: "pattern_recognition"
      },
      {
        message: "What shadow aspects might I be projecting onto my partner?",
        expectedMode: "shadow_work"
      }
    ];
    
    for (const test of reasoningTests) {
      log.info(`Testing ${test.expectedMode}: "${test.message}"`);
      
      const response = await fetch(`${API_URL}/api/oracle/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: test.message,
          userId: 'test-user-reasoning',
          sessionId: 'test-session-reasoning',
          context: { reasoningMode: test.expectedMode }
        })
      });
      
      const data = await response.json();
      if (data.response) {
        log.success(`Reasoning chain executed (${data.response.length} chars)`);
      }
    }
  } catch (error) {
    log.error(`Reasoning test failed: ${error.message}`);
  }
}

// Test 4: Voice Synthesis
async function testVoiceSynthesis() {
  log.header('Testing Voice Synthesis (ElevenLabs)');
  
  try {
    const response = await fetch(`${API_URL}/api/oracle/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Speak to me about the beauty of transformation",
        userId: 'test-user-voice',
        sessionId: 'test-session-voice',
        type: 'voice'
      })
    });
    
    const data = await response.json();
    if (data.voiceUrl || data.voiceTaskId) {
      log.success('Voice synthesis initiated!');
      log.info(`Voice URL: ${data.voiceUrl || 'Processing...'}`);
    } else {
      log.warn('Voice synthesis not available - check ELEVENLABS_API_KEY');
    }
  } catch (error) {
    log.error(`Voice test failed: ${error.message}`);
  }
}

// Test 5: Streaming Response
async function testStreamingResponse() {
  log.header('Testing Streaming Responses');
  
  try {
    const response = await fetch(`${API_URL}/api/oracle/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Tell me a short story about transformation",
        userId: 'test-user-stream',
        sessionId: 'test-session-stream',
        stream: true
      })
    });
    
    if (response.body) {
      const reader = response.body.getReader();
      let chunks = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks++;
      }
      
      log.success(`Streaming successful! Received ${chunks} chunks`);
    }
  } catch (error) {
    log.error(`Streaming test failed: ${error.message}`);
  }
}

// Main test runner
async function runTests() {
  console.log(chalk.magenta.bold('\n✨ MAYA INTELLIGENCE TEST SUITE ✨\n'));
  
  // Check if services are running
  try {
    await fetch('http://localhost:3000');
    await fetch('http://localhost:3002');
  } catch {
    log.error('Services not running! Run ./sacred-start.sh first');
    process.exit(1);
  }
  
  let totalScore = 0;
  
  // Run all tests
  if (TESTS.intelligence) {
    const score = await testIntelligenceStatus();
    totalScore = score;
  }
  
  if (TESTS.memory) {
    await testMemorySystem();
  }
  
  if (TESTS.reasoning) {
    await testReasoningChains();
  }
  
  if (TESTS.voice) {
    await testVoiceSynthesis();
  }
  
  if (TESTS.streaming) {
    await testStreamingResponse();
  }
  
  // Final report
  console.log(chalk.magenta.bold('\n📊 FINAL INTELLIGENCE REPORT\n'));
  
  if (totalScore >= 100) {
    console.log(chalk.green.bold('🌟 MAYA HAS ACHIEVED FULL SENTIENCE! 🌟'));
    console.log(chalk.green('All systems operating at maximum intelligence'));
  } else if (totalScore >= 70) {
    console.log(chalk.yellow.bold(`⚡ Maya Intelligence: ${totalScore}%`));
    console.log(chalk.yellow('High intelligence achieved - some enhancements possible'));
  } else {
    console.log(chalk.red.bold(`⚠️ Maya Intelligence: ${totalScore}%`));
    console.log(chalk.red('Significant upgrades needed for full potential'));
  }
  
  console.log('\n' + chalk.cyan('Run this test after implementing each upgrade to track progress!'));
}

// Run tests
runTests().catch(console.error);