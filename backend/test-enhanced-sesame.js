#!/usr/bin/env node

/**
 * Test script for enhanced Sesame integration with dialogue state tracking
 * 
 * This script tests:
 * 1. Intent detection across various user inputs
 * 2. Topic tracking and transitions
 * 3. Emotion analysis integration
 * 4. Dialogue stage progression
 * 5. Real-time event streaming
 */

const EventSource = require('eventsource');
const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const API_ENDPOINT = `${BASE_URL}/api/v1/enhanced/converse`;

// Test scenarios covering different intents and emotional states
const testScenarios = [
  {
    name: "Information Seeking",
    messages: [
      "What is the meaning of life?",
      "Can you explain how consciousness works?",
      "Tell me more about that"
    ],
    expectedIntent: "seeking_information",
    expectedStage: "exploring"
  },
  {
    name: "Emotional Support",
    messages: [
      "I'm feeling really overwhelmed with everything",
      "It's just been so hard lately",
      "I don't know what to do anymore"
    ],
    expectedIntent: "seeking_support",
    expectedEmotion: "distressed"
  },
  {
    name: "Resistance Pattern",
    messages: [
      "I don't think that's right",
      "But what about the other perspective?",
      "I'm not sure I agree with that"
    ],
    expectedIntent: "resistance",
    expectedStage: "challenging"
  },
  {
    name: "Breakthrough Moment",
    messages: [
      "Oh wow, I never thought of it that way",
      "This changes everything for me",
      "I finally understand what you mean!"
    ],
    expectedIntent: "breakthrough",
    expectedStage: "breakthrough"
  },
  {
    name: "Existential Exploration",
    messages: [
      "Why are we here?",
      "What's the purpose of existence?",
      "How do I find meaning in all of this?"
    ],
    expectedIntent: "existential",
    expectedStage: "deepening"
  }
];

// Helper function to create SSE connection
function createSSEConnection(query, threadId = null) {
  const url = new URL(`${API_ENDPOINT}/stream`);
  url.searchParams.append('q', query);
  url.searchParams.append('element', 'air');
  url.searchParams.append('userId', 'test-user');
  url.searchParams.append('voice', 'false');
  
  const headers = {};
  if (threadId) {
    headers['X-Thread-ID'] = threadId;
  }
  
  return new EventSource(url.toString(), { headers });
}

// Test a single conversation turn
async function testConversationTurn(message, threadId = null) {
  return new Promise((resolve, reject) => {
    console.log(colors.cyan('\n📤 User:'), message);
    
    const events = {
      intent: null,
      topic: null,
      emotion: null,
      stage: null,
      response: null,
      insights: null,
      error: null
    };
    
    const sse = createSSEConnection(message, threadId);
    
    sse.addEventListener('thread-created', (event) => {
      const data = JSON.parse(event.data);
      threadId = data.threadId;
      console.log(colors.gray('   Thread ID:'), threadId);
    });
    
    sse.addEventListener('intent-detected', (event) => {
      const data = JSON.parse(event.data);
      events.intent = data;
      console.log(colors.yellow('   🎯 Intent:'), data.intent, colors.gray(`(${Math.round(data.confidence * 100)}% confidence)`));
    });
    
    sse.addEventListener('topic-changed', (event) => {
      const data = JSON.parse(event.data);
      events.topic = data;
      console.log(colors.magenta('   📍 Topic:'), `${data.from} → ${data.to}`);
    });
    
    sse.addEventListener('emotion-shift', (event) => {
      const data = JSON.parse(event.data);
      events.emotion = data;
      console.log(colors.blue('   💭 Emotion:'), data.emotion, colors.gray(`(intensity: ${data.intensity})`));
    });
    
    sse.addEventListener('stage-transition', (event) => {
      const data = JSON.parse(event.data);
      events.stage = data;
      console.log(colors.green('   🎭 Stage:'), `${data.from} → ${data.to}`);
    });
    
    sse.addEventListener('breakthrough', (event) => {
      const data = JSON.parse(event.data);
      console.log(colors.rainbow('   ✨ BREAKTHROUGH DETECTED:'), data.marker);
    });
    
    sse.addEventListener('resistance', (event) => {
      const data = JSON.parse(event.data);
      console.log(colors.red('   🛡️ Resistance:'), data.type, colors.gray(`(intensity: ${data.intensity})`));
    });
    
    sse.addEventListener('dialogue-insights', (event) => {
      const data = JSON.parse(event.data);
      events.insights = data;
      
      if (data.insights.suggestions.length > 0) {
        console.log(colors.cyan('   💡 Suggestions:'));
        data.insights.suggestions.forEach(s => console.log(colors.gray(`      - ${s}`)));
      }
      
      if (data.refinements.voiceModulations.length > 0) {
        console.log(colors.gray('   🎵 Voice modulations:'), data.refinements.voiceModulations.join(', '));
      }
    });
    
    sse.addEventListener('response', (event) => {
      const data = JSON.parse(event.data);
      events.response = data;
      console.log(colors.green('   🤖 Maya:'), data.text);
      console.log(colors.gray('   📊 State:'), 
        `Intent: ${data.dialogueState.intent}`,
        `| Topic: ${data.dialogueState.topic}`,
        `| Emotion: ${data.dialogueState.emotion}`,
        `| Stage: ${data.dialogueState.stage}`,
        `| Momentum: ${data.dialogueState.momentum.toFixed(2)}`
      );
    });
    
    sse.addEventListener('complete', (event) => {
      const data = JSON.parse(event.data);
      console.log(colors.gray('   ⏱️ Processing time:'), `${data.processingTime}ms`);
      sse.close();
      resolve({ ...events, threadId });
    });
    
    sse.addEventListener('error', (event) => {
      const data = JSON.parse(event.data);
      events.error = data;
      console.error(colors.red('   ❌ Error:'), data.message);
      sse.close();
      reject(new Error(data.message));
    });
    
    sse.onerror = (error) => {
      console.error(colors.red('   ❌ SSE Error:'), error);
      sse.close();
      reject(error);
    };
  });
}

// Test dialogue state endpoint
async function testDialogueState(threadId) {
  try {
    const response = await axios.get(`${API_ENDPOINT}/state/${threadId}`);
    const { state, insights } = response.data;
    
    console.log(colors.cyan('\n📊 Dialogue State Summary:'));
    console.log(colors.gray('   Turn count:'), state.turnCount);
    console.log(colors.gray('   Primary intent:'), state.intent.primary);
    console.log(colors.gray('   Current topic:'), state.topic.current);
    console.log(colors.gray('   Topic coherence:'), `${(state.topic.coherenceScore * 100).toFixed(0)}%`);
    console.log(colors.gray('   Emotional trajectory:'), state.emotion.trajectory.trend);
    console.log(colors.gray('   Dialogue stage:'), state.flow.stage);
    console.log(colors.gray('   Relationship trust:'), `${(state.relationship.trust * 100).toFixed(0)}%`);
    console.log(colors.gray('   Synaptic health:'), `${(state.relationship.synapticHealth * 100).toFixed(0)}%`);
    
    if (insights.warnings.length > 0) {
      console.log(colors.red('   ⚠️ Warnings:'));
      insights.warnings.forEach(w => console.log(colors.red(`      - ${w}`)));
    }
    
    return state;
  } catch (error) {
    console.error(colors.red('Failed to get dialogue state:'), error.message);
  }
}

// Test conversation history
async function testConversationHistory(threadId) {
  try {
    const response = await axios.get(`${API_ENDPOINT}/history/${threadId}?limit=5`);
    const { messages } = response.data;
    
    console.log(colors.cyan('\n📜 Recent Conversation History:'));
    messages.forEach((msg, i) => {
      console.log(colors.gray(`\n   Turn ${i + 1}:`));
      console.log(colors.gray('   User:'), msg.userMessage);
      console.log(colors.gray('   Maya:'), msg.agentResponse);
      console.log(colors.gray('   Metrics:'), 
        `Resonance: ${msg.dialogueContext.resonance.toFixed(2)}`,
        `| Gap: ${msg.dialogueContext.synapticGap.toFixed(2)}`
      );
    });
  } catch (error) {
    console.error(colors.red('Failed to get conversation history:'), error.message);
  }
}

// Run a complete test scenario
async function runScenario(scenario) {
  console.log(colors.rainbow(`\n${'='.repeat(60)}`));
  console.log(colors.rainbow(`Running Scenario: ${scenario.name}`));
  console.log(colors.rainbow(`${'='.repeat(60)}`));
  
  let threadId = null;
  const results = [];
  
  for (const message of scenario.messages) {
    try {
      const result = await testConversationTurn(message, threadId);
      threadId = result.threadId;
      results.push(result);
      
      // Add delay between messages to simulate natural conversation
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error(colors.red('Scenario failed:'), error.message);
      break;
    }
  }
  
  // Get final dialogue state
  if (threadId) {
    await testDialogueState(threadId);
    await testConversationHistory(threadId);
  }
  
  // Validate expectations
  console.log(colors.cyan('\n✅ Scenario Validation:'));
  
  if (scenario.expectedIntent) {
    const intentMatches = results.some(r => r.intent?.intent === scenario.expectedIntent);
    console.log(
      intentMatches ? colors.green('   ✓') : colors.red('   ✗'),
      `Expected intent: ${scenario.expectedIntent}`
    );
  }
  
  if (scenario.expectedStage) {
    const stageMatches = results.some(r => 
      r.response?.dialogueState.stage === scenario.expectedStage ||
      r.stage?.to === scenario.expectedStage
    );
    console.log(
      stageMatches ? colors.green('   ✓') : colors.red('   ✗'),
      `Expected stage: ${scenario.expectedStage}`
    );
  }
  
  if (scenario.expectedEmotion) {
    const emotionDetected = results.some(r => r.emotion !== null);
    console.log(
      emotionDetected ? colors.green('   ✓') : colors.red('   ✗'),
      `Emotion detection active`
    );
  }
  
  return results;
}

// Main test execution
async function runAllTests() {
  console.log(colors.rainbow('\n🧪 Enhanced Sesame Integration Test Suite'));
  console.log(colors.gray(`Testing against: ${API_ENDPOINT}`));
  
  // Test health endpoint first
  try {
    const health = await axios.get(`${API_ENDPOINT}/health`);
    console.log(colors.green('\n✅ Health check passed:'), health.data);
  } catch (error) {
    console.error(colors.red('\n❌ Health check failed:'), error.message);
    process.exit(1);
  }
  
  // Run all scenarios
  for (const scenario of testScenarios) {
    await runScenario(scenario);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(colors.rainbow('\n🎉 All tests completed!'));
}

// Execute tests
runAllTests().catch(error => {
  console.error(colors.red('\n💥 Test suite failed:'), error);
  process.exit(1);
});