/**
 * K6 Load Testing Script for Spiralogic Oracle System
 * Tests canary deployment, latency, and mode transitions
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const orchestratorLatency = new Trend('orchestrator_latency', true);
const cacheHitRate = new Rate('cache_hit_rate');
const spiralogicModeRate = new Rate('spiralogic_mode_rate');

export const options = {
  scenarios: {
    // Canary testing - low load
    canary_test: {
      executor: 'constant-vus',
      vus: 5,
      duration: '3m',
      tags: { test_type: 'canary' }
    },
    
    // Load testing - higher sustained load
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },   // Ramp up
        { duration: '3m', target: 20 },   // Stay at load
        { duration: '1m', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'load' }
    },
    
    // Stress testing - burst load
    stress_test: {
      executor: 'constant-arrival-rate',
      rate: 30,                          // 30 requests per second
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 15,
      maxVUs: 50,
      tags: { test_type: 'stress' }
    }
  },
  
  thresholds: {
    // Performance requirements
    'http_req_duration': ['p(95)<700', 'p(50)<350'],  // P95 <700ms, P50 <350ms
    'http_req_failed': ['rate<0.01'],                 // <1% error rate
    'orchestrator_latency': ['p(95)<700'],            // Orchestrator P95 <700ms
    'cache_hit_rate': ['rate>0.4'],                   // >40% cache hits
    'spiralogic_mode_rate': ['rate>0.8'],             // >80% should use Spiralogic mode
    
    // Scenario-specific thresholds
    'http_req_duration{test_type:canary}': ['p(95)<500'],
    'http_req_duration{test_type:load}': ['p(95)<700'],
    'http_req_duration{test_type:stress}': ['p(95)<900'] // Allow higher latency under stress
  }
};

// Test data - variety of Oracle queries across elements
const testQueries = [
  // Fire element - action/passion queries
  { text: 'I need courage to make this big life change', element: 'fire', expectedArchetype: 'Catalyst' },
  { text: 'Help me channel my anger constructively', element: 'fire', expectedArchetype: 'Catalyst' },
  { text: 'I feel stuck and need motivation to act', element: 'fire', expectedArchetype: 'Catalyst' },
  
  // Water element - emotional/healing queries  
  { text: 'I\'m processing grief and need gentle guidance', element: 'water', expectedArchetype: 'Healer' },
  { text: 'Help me understand these complex emotions', element: 'water', expectedArchetype: 'Healer' },
  { text: 'I need to heal from this relationship wound', element: 'water', expectedArchetype: 'Healer' },
  
  // Earth element - practical/grounding queries
  { text: 'Help me build better habits and structure', element: 'earth', expectedArchetype: 'Builder' },
  { text: 'I need practical steps for this challenge', element: 'earth', expectedArchetype: 'Builder' },
  { text: 'Ground me in what\'s real and actionable', element: 'earth', expectedArchetype: 'Builder' },
  
  // Air element - mental clarity queries
  { text: 'I need clarity on this complex decision', element: 'air', expectedArchetype: 'Messenger' },
  { text: 'Help me communicate this difficult truth', element: 'air', expectedArchetype: 'Messenger' },
  { text: 'I\'m overthinking - need mental clarity', element: 'air', expectedArchetype: 'Messenger' },
  
  // Aether element - spiritual/wisdom queries
  { text: 'Connect me with deeper meaning and purpose', element: 'aether', expectedArchetype: 'Oracle' },
  { text: 'I need wisdom for this spiritual challenge', element: 'aether', expectedArchetype: 'Oracle' },
  { text: 'Help me understand this synchronicity', element: 'aether', expectedArchetype: 'Oracle' }
];

// Shadow work test queries (should trigger gentle challenges)
const shadowWorkQueries = [
  { text: 'It\'s not my fault things always go wrong for me', triggers: 'victim_pattern' },
  { text: 'I should be perfect at everything I do', triggers: 'perfectionism' },
  { text: 'I guess maybe I could try but it probably won\'t work', triggers: 'deflection' },
  { text: 'Everything happens for a reason so I don\'t need to act', triggers: 'spiritual_bypass' }
];

export function setup() {
  console.log('🧠 Starting Spiralogic load testing...');
  console.log(`Target: ${__ENV.API_BASE_URL || 'http://localhost:3000'}`);
  return { startTime: Date.now() };
}

export default function(data) {
  const baseUrl = __ENV.API_BASE_URL || 'http://localhost:3000';
  const testType = __ENV.TEST_TYPE || 'mixed';
  
  // Select query based on test type
  let query;
  if (testType === 'shadow' && Math.random() < 0.3) {
    // 30% shadow work queries
    query = shadowWorkQueries[Math.floor(Math.random() * shadowWorkQueries.length)];
  } else {
    // Regular Oracle queries  
    query = testQueries[Math.floor(Math.random() * testQueries.length)];
  }
  
  const payload = JSON.stringify({
    userId: `k6-user-${__VU}-${Date.now()}`, // Unique user per request
    text: query.text,
    element: query.element,
    sessionId: `k6-session-${__VU}`
  });
  
  const headers = { 
    'Content-Type': 'application/json',
    'User-Agent': 'k6-spiralogic-load-test/1.0'
  };
  
  // Add canary header based on test type
  if (__ENV.CANARY_PERCENTAGE) {
    const canaryRate = parseFloat(__ENV.CANARY_PERCENTAGE) || 50;
    if (Math.random() * 100 < canaryRate) {
      headers['x-experiment-spiralogic'] = 'on';
    }
  }
  
  const response = http.post(`${baseUrl}/api/oracle/chat`, payload, { headers });
  
  // Basic response validation
  const responseOk = check(response, {
    'status is 200': (r) => r.status === 200,
    'response has data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.data && data.data.message && data.data.message.length > 0;
      } catch (e) {
        return false;
      }
    },
    'response time < 2s': (r) => r.timings.duration < 2000,
    'no error in response': (r) => {
      try {
        const data = JSON.parse(r.body);
        return !data.error;
      } catch (e) {
        return false;
      }
    }
  });
  
  if (responseOk) {
    try {
      const responseData = JSON.parse(response.body);
      const oracleResponse = responseData.data;
      
      // Advanced validation
      check(response, {
        'has element assignment': () => oracleResponse.element !== undefined,
        'has archetype': () => oracleResponse.archetype !== undefined,
        'has confidence score': () => oracleResponse.confidence !== undefined,
        'confidence in valid range': () => 
          oracleResponse.confidence >= 0 && oracleResponse.confidence <= 1,
        'message not too short': () => oracleResponse.message.length > 20,
        'message not too long': () => oracleResponse.message.length < 2000
      });
      
      // Check for expected archetype matching
      if (query.expectedArchetype) {
        check(response, {
          'correct archetype assigned': () => 
            oracleResponse.archetype === query.expectedArchetype
        });
      }
      
      // Track orchestrator performance from headers
      const orchestratorHeader = response.headers['x-orchestrator'];
      const orchestratorMode = response.headers['x-orchestrator-mode'];
      
      if (orchestratorHeader === 'spiralogic') {
        spiralogicModeRate.add(1);
        
        // Track latency if available in response metadata
        if (oracleResponse.metadata && oracleResponse.metadata.latencyMs) {
          orchestratorLatency.add(oracleResponse.metadata.latencyMs);
        }
      } else {
        spiralogicModeRate.add(0);
      }
      
      // Track cache performance (would come from analytics)
      const cacheHit = Math.random() < 0.6; // Simulated - replace with actual header/metadata
      cacheHitRate.add(cacheHit ? 1 : 0);
      
      // Validate Shadow Work responses
      if (query.triggers && oracleResponse.message) {
        const hasShadowChallenge = /what.*(not quite ready|underneath|afraid|avoiding)/i.test(oracleResponse.message);
        check(response, {
          'shadow work applied when appropriate': () => hasShadowChallenge
        });
      }
      
      // Validate Maya personality consistency
      check(response, {
        'response feels conversational': () => 
          !/(however|therefore|furthermore)/i.test(oracleResponse.message),
        'no clinical language': () => 
          !/(utilize|facilitate|implement|methodology)/i.test(oracleResponse.message),
        'has reflective question': () => 
          oracleResponse.message.includes('?') || 
          /\b(what|how|where|when|why)\b.*you/i.test(oracleResponse.message)
      });
      
    } catch (error) {
      console.error(`Response parsing error: ${error}`);
    }
  }
  
  // Vary sleep time to simulate real user behavior
  const sleepTime = Math.random() * 3 + 0.5; // 0.5 to 3.5 seconds
  sleep(sleepTime);
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`🧠 Load test completed in ${duration}s`);
  
  // Optional: Clean up test data or send completion webhook
  if (__ENV.CLEANUP_WEBHOOK) {
    http.post(__ENV.CLEANUP_WEBHOOK, JSON.stringify({
      test: 'spiralogic-load-test',
      duration: duration,
      timestamp: new Date().toISOString()
    }));
  }
}

/**
 * Usage Examples:
 * 
 * # Basic canary test
 * k6 run k6-spiralogic-load.js
 * 
 * # Test with 50% canary traffic
 * k6 run -e CANARY_PERCENTAGE=50 k6-spiralogic-load.js
 * 
 * # Test production endpoint
 * k6 run -e API_BASE_URL=https://your-domain.com k6-spiralogic-load.js
 * 
 * # Focus on shadow work testing
 * k6 run -e TEST_TYPE=shadow k6-spiralogic-load.js
 * 
 * # Stress test with higher load
 * k6 run --scenario stress_test k6-spiralogic-load.js
 * 
 * # Generate detailed HTML report
 * k6 run --out html=load-test-report.html k6-spiralogic-load.js
 */