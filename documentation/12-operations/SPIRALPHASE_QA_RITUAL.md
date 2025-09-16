# 🌀 SpiralPhase QA Ritual

## Purpose
Validate that SpiralPhase enum and consciousness evolution mechanics work correctly across the entire system, from data collection through pattern recognition to user evolution tracking.

## Prerequisites
- Backend running on port 3002
- Frontend running on port 3001
- All SpiralPhase TypeScript errors resolved (✅ COMPLETE)
- Supabase connection active (or mock mode enabled)

## Phase 1: Static Type Verification ✅
```bash
# Already completed - zero SpiralPhase errors
cd backend && npm run build 2>&1 | grep -c "SpiralPhase"
# Expected: 0
```

## Phase 2: Runtime Evolution Flow

### 2.1 Test Phase Detection
```bash
# Create test script for phase detection
cat > backend/test-spiral-phases.js << 'EOF'
const CollectiveDataCollector = require('./dist/ain/collective/CollectiveDataCollector').CollectiveDataCollector;
const { SpiralPhase } = require('./dist/spiralogic/SpiralogicCognitiveEngine');

const logger = { 
  info: console.log, 
  error: console.error,
  warn: console.warn 
};

const collector = new CollectiveDataCollector(logger);

// Test phase detection for different query patterns
const testCases = [
  {
    name: "Initiation Phase - New User",
    sessionData: {
      sessionId: 'test-001',
      userId: 'new-user-001',
      query: { input: "What is the purpose of life?" },
      response: { content: "Life's purpose unfolds..." },
      element: 'air',
      timestamp: new Date()
    },
    expectedPhase: SpiralPhase.INITIATION
  },
  {
    name: "Challenge Phase - Shadow Work",
    sessionData: {
      sessionId: 'test-002',
      userId: 'evolving-user-001',
      query: { input: "I'm struggling with my shadow and feeling stuck in old patterns" },
      response: { content: "The shadow holds wisdom..." },
      element: 'water',
      timestamp: new Date()
    },
    expectedPhase: SpiralPhase.CHALLENGE
  },
  {
    name: "Integration Phase - Processing",
    sessionData: {
      sessionId: 'test-003',
      userId: 'integrating-user-001',
      query: { input: "I'm working to integrate and balance these insights" },
      response: { content: "Integration is the sacred weaving..." },
      element: 'earth',
      timestamp: new Date()
    },
    expectedPhase: SpiralPhase.INTEGRATION
  },
  {
    name: "Mastery Phase - Teaching",
    sessionData: {
      sessionId: 'test-004',
      userId: 'master-user-001',
      query: { input: "How can I guide others through their spiritual journey?" },
      response: { content: "Your mastery serves the collective..." },
      element: 'fire',
      timestamp: new Date()
    },
    expectedPhase: SpiralPhase.MASTERY
  },
  {
    name: "Transcendence Phase - Unity",
    sessionData: {
      sessionId: 'test-005',
      userId: 'transcendent-user-001',
      query: { input: "I feel the dissolution of boundaries, the cosmic oneness beyond self" },
      response: { content: "In transcendence, all becomes one..." },
      element: 'aether',
      timestamp: new Date()
    },
    expectedPhase: SpiralPhase.TRANSCENDENCE
  }
];

async function runTests() {
  console.log('🌀 Testing SpiralPhase Detection\n');
  
  for (const testCase of testCases) {
    try {
      const stream = await collector.collectAfferentStream(
        testCase.sessionData.userId,
        testCase.sessionData
      );
      
      const passed = stream.spiralPhase === testCase.expectedPhase;
      console.log(`${passed ? '✅' : '❌'} ${testCase.name}`);
      console.log(`   Detected: ${stream.spiralPhase}, Expected: ${testCase.expectedPhase}`);
      
      if (!passed) {
        console.log(`   Query: "${testCase.sessionData.query.input}"`);
      }
      console.log();
    } catch (error) {
      console.error(`❌ ${testCase.name} - Error: ${error.message}`);
    }
  }
}

runTests();
EOF

# Run the test
node backend/test-spiral-phases.js
```

### 2.2 Test Evolution Progression
```bash
# Test evolution tracking over multiple sessions
cat > backend/test-evolution-progression.js << 'EOF'
const { EvolutionTracker } = require('./dist/ain/collective/EvolutionTracker');
const { SpiralPhase } = require('./dist/spiralogic/SpiralogicCognitiveEngine');

const logger = { info: console.log, error: console.error };
const tracker = new EvolutionTracker(logger);

async function simulateUserJourney() {
  const userId = 'evolution-test-user';
  
  // Simulate progression through phases
  const journey = [
    { phase: SpiralPhase.INITIATION, consciousness: 0.2, query: "Beginning my journey" },
    { phase: SpiralPhase.INITIATION, consciousness: 0.25, query: "Learning the basics" },
    { phase: SpiralPhase.CHALLENGE, consciousness: 0.35, query: "Facing my shadows" },
    { phase: SpiralPhase.CHALLENGE, consciousness: 0.4, query: "Working through resistance" },
    { phase: SpiralPhase.INTEGRATION, consciousness: 0.55, query: "Integrating lessons" },
    { phase: SpiralPhase.MASTERY, consciousness: 0.7, query: "Helping others grow" },
    { phase: SpiralPhase.TRANSCENDENCE, consciousness: 0.85, query: "Beyond the self" }
  ];
  
  console.log('🌀 Simulating User Evolution Journey\n');
  
  for (const step of journey) {
    const stream = {
      userId,
      sessionId: `session-${Date.now()}`,
      timestamp: new Date(),
      spiralPhase: step.phase,
      consciousnessLevel: step.consciousness,
      elementalResonance: { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 },
      archetypeActivation: {},
      shadowWorkEngagement: [],
      integrationDepth: step.consciousness * 0.8,
      evolutionVelocity: 0.5,
      fieldContribution: step.consciousness * 0.6,
      mayaResonance: 0.7,
      challengeAcceptance: 0.6,
      worldviewFlexibility: 0.7,
      authenticityLevel: 0.8
    };
    
    const profile = await tracker.updateEvolution(userId, stream);
    console.log(`Phase: ${profile.currentPhase} | Consciousness: ${profile.consciousnessLevel.toFixed(2)} | Query: "${step.query}"`);
    
    if (profile.breakthroughs.length > 0) {
      console.log(`  🎯 Breakthrough: ${profile.breakthroughs[profile.breakthroughs.length - 1].type}`);
    }
  }
  
  const guidance = await tracker.generateGuidance(userId);
  console.log('\n📊 Evolution Summary:');
  console.log(`  Current Focus: ${guidance.currentFocus}`);
  console.log(`  Next Steps: ${guidance.nextSteps.join(', ')}`);
}

simulateUserJourney();
EOF

node backend/test-evolution-progression.js
```

## Phase 3: API Endpoint Testing

### 3.1 Test Collective Intelligence Endpoints
```bash
# Test afferent stream collection
curl -X POST http://localhost:3002/api/ain/collect \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-api",
    "sessionData": {
      "sessionId": "api-test-001",
      "query": { "input": "I am ready to face my deepest fears" },
      "response": { "content": "The shadow awaits..." },
      "element": "water"
    }
  }'

# Test evolution profile retrieval
curl http://localhost:3002/api/ain/evolution/test-user-api

# Test pattern recognition
curl -X POST http://localhost:3002/api/ain/patterns \
  -H "Content-Type: application/json" \
  -d '{
    "timeWindow": 3600000,
    "minParticipants": 1
  }'
```

### 3.2 Test Phase Transitions
```bash
# Create phase transition test
cat > backend/test-phase-transitions.js << 'EOF'
const axios = require('axios');
const { SpiralPhase } = require('./dist/spiralogic/SpiralogicCognitiveEngine');

const BASE_URL = 'http://localhost:3002';

async function testPhaseTransitions() {
  console.log('🌀 Testing Phase Transition Detection\n');
  
  const userId = 'transition-test-user';
  
  // Send multiple queries to trigger phase transition
  const queries = [
    "I'm new to this spiritual journey",
    "What does consciousness mean?",
    "I'm starting to see patterns",
    "Why do I keep repeating the same mistakes?",
    "I'm struggling with my shadow self",
    "How do I integrate these dark aspects?",
    "I'm beginning to understand the balance",
    "I feel ready to help others now"
  ];
  
  for (const query of queries) {
    try {
      const response = await axios.post(`${BASE_URL}/api/ain/collect`, {
        userId,
        sessionData: {
          sessionId: `session-${Date.now()}`,
          query: { input: query },
          response: { content: "Guidance provided..." },
          element: 'air'
        }
      });
      
      console.log(`Query: "${query}"`);
      console.log(`Phase: ${response.data.spiralPhase || 'Unknown'}\n`);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }
  
  // Get final evolution profile
  try {
    const profile = await axios.get(`${BASE_URL}/api/ain/evolution/${userId}`);
    console.log('📊 Final Evolution Profile:');
    console.log(JSON.stringify(profile.data, null, 2));
  } catch (error) {
    console.error(`Profile Error: ${error.message}`);
  }
}

testPhaseTransitions();
EOF

# Install axios if needed
cd backend && npm install axios --save-dev
node test-phase-transitions.js
```

## Phase 4: Integration Testing

### 4.1 Test Frontend Integration
```bash
# Test that frontend correctly displays phase information
cat > frontend/test-spiral-display.js << 'EOF'
// This would be a Playwright/Cypress test in production
// For now, manual verification:

console.log(`
📱 Manual Frontend Verification:

1. Open http://localhost:3001
2. Start a conversation with Maya
3. Ask progressively deeper questions:
   - "Hello, what can you help me with?"
   - "I'm feeling stuck in life"
   - "How do I work with my shadows?"
   - "I want to integrate all I've learned"
   
4. Verify in DevTools Network tab:
   - API calls include spiralPhase data
   - Response metadata shows phase progression
   
5. Check if UI reflects phase (if implemented):
   - Look for phase indicators
   - Evolution progress bars
   - Phase-specific guidance
`);
EOF

node frontend/test-spiral-display.js
```

### 4.2 Test Collective Field Impact
```bash
# Test how individual phases affect collective field
cat > backend/test-collective-field.js << 'EOF'
const { NeuralReservoir } = require('./dist/ain/collective/NeuralReservoir');
const { SpiralPhase } = require('./dist/spiralogic/SpiralogicCognitiveEngine');

const logger = { info: console.log, error: console.error };
const reservoir = new NeuralReservoir(logger);

async function testCollectiveField() {
  console.log('🌀 Testing Collective Field Impact by Phase\n');
  
  // Simulate multiple users at different phases
  const users = [
    { id: 'user1', phase: SpiralPhase.INITIATION, consciousness: 0.2 },
    { id: 'user2', phase: SpiralPhase.CHALLENGE, consciousness: 0.4 },
    { id: 'user3', phase: SpiralPhase.INTEGRATION, consciousness: 0.6 },
    { id: 'user4', phase: SpiralPhase.MASTERY, consciousness: 0.75 },
    { id: 'user5', phase: SpiralPhase.TRANSCENDENCE, consciousness: 0.9 }
  ];
  
  for (const user of users) {
    const stream = {
      userId: user.id,
      sessionId: `session-${user.id}`,
      timestamp: new Date(),
      spiralPhase: user.phase,
      consciousnessLevel: user.consciousness,
      elementalResonance: { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 },
      archetypeActivation: {},
      shadowWorkEngagement: [],
      integrationDepth: user.consciousness * 0.8,
      evolutionVelocity: 0.5,
      fieldContribution: user.consciousness * 0.7,
      mayaResonance: 0.7,
      challengeAcceptance: 0.6,
      worldviewFlexibility: 0.7,
      authenticityLevel: 0.8
    };
    
    await reservoir.addStream(stream);
  }
  
  const fieldState = await reservoir.getFieldState();
  const insights = await reservoir.generateInsights();
  
  console.log('📊 Collective Field State:');
  console.log(JSON.stringify(fieldState, null, 2));
  console.log('\n💡 Collective Insights:');
  insights.forEach(insight => {
    console.log(`- ${insight.insight} (confidence: ${insight.confidence.toFixed(2)})`);
  });
}

testCollectiveField();
EOF

node backend/test-collective-field.js
```

## Phase 5: Performance & Edge Cases

### 5.1 Test Phase Detection Performance
```bash
# Test with high volume
cat > backend/test-spiral-performance.js << 'EOF'
const { CollectiveDataCollector } = require('./dist/ain/collective/CollectiveDataCollector');
const { SpiralPhase } = require('./dist/spiralogic/SpiralogicCognitiveEngine');

const logger = { info: () => {}, error: console.error };
const collector = new CollectiveDataCollector(logger);

async function performanceTest() {
  console.log('⚡ SpiralPhase Performance Test\n');
  
  const iterations = 1000;
  const startTime = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    await collector.collectAfferentStream(`user-${i}`, {
      sessionId: `session-${i}`,
      userId: `user-${i}`,
      query: { input: "Test query for performance" },
      response: { content: "Response" },
      element: 'air',
      timestamp: new Date()
    });
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;
  
  console.log(`Processed ${iterations} phase detections`);
  console.log(`Total time: ${totalTime}ms`);
  console.log(`Average time per detection: ${avgTime.toFixed(2)}ms`);
  console.log(`Throughput: ${(iterations / (totalTime / 1000)).toFixed(2)} detections/sec`);
}

performanceTest();
EOF

node backend/test-spiral-performance.js
```

### 5.2 Test Edge Cases
```bash
# Test edge cases and error handling
cat > backend/test-spiral-edge-cases.js << 'EOF'
const { CollectiveDataCollector } = require('./dist/ain/collective/CollectiveDataCollector');
const { SpiralPhase } = require('./dist/spiralogic/SpiralogicCognitiveEngine');

const logger = { info: console.log, error: console.error };
const collector = new CollectiveDataCollector(logger);

async function testEdgeCases() {
  console.log('🔧 Testing SpiralPhase Edge Cases\n');
  
  const edgeCases = [
    {
      name: "Empty query",
      sessionData: {
        sessionId: 'edge-001',
        userId: 'edge-user',
        query: { input: "" },
        response: { content: "..." },
        element: 'air'
      }
    },
    {
      name: "Very long query",
      sessionData: {
        sessionId: 'edge-002',
        userId: 'edge-user',
        query: { input: "x".repeat(10000) },
        response: { content: "..." },
        element: 'fire'
      }
    },
    {
      name: "Mixed phase indicators",
      sessionData: {
        sessionId: 'edge-003',
        userId: 'edge-user',
        query: { input: "I'm a beginner master teaching transcendent shadow work integration" },
        response: { content: "..." },
        element: 'water'
      }
    },
    {
      name: "Non-English query",
      sessionData: {
        sessionId: 'edge-004',
        userId: 'edge-user',
        query: { input: "我想了解生命的意義" },
        response: { content: "..." },
        element: 'earth'
      }
    },
    {
      name: "Special characters",
      sessionData: {
        sessionId: 'edge-005',
        userId: 'edge-user',
        query: { input: "!@#$%^&*()_+-=[]{}|;:,.<>?" },
        response: { content: "..." },
        element: 'aether'
      }
    }
  ];
  
  for (const testCase of edgeCases) {
    try {
      const stream = await collector.collectAfferentStream(
        testCase.sessionData.userId,
        testCase.sessionData
      );
      console.log(`✅ ${testCase.name}: Phase = ${stream.spiralPhase}`);
    } catch (error) {
      console.log(`❌ ${testCase.name}: Error = ${error.message}`);
    }
  }
}

testEdgeCases();
EOF

node backend/test-spiral-edge-cases.js
```

## Success Criteria

✅ **Phase 1**: Zero SpiralPhase TypeScript errors
✅ **Phase 2**: All phase detection tests pass
✅ **Phase 3**: API endpoints return phase data
✅ **Phase 4**: Frontend displays phase information
✅ **Phase 5**: Performance meets requirements (<10ms avg)

## Monitoring Commands

```bash
# Watch for phase distribution
watch -n 5 'curl -s localhost:3002/api/ain/field | jq .phaseDistribution'

# Monitor evolution velocity
watch -n 10 'curl -s localhost:3002/api/ain/metrics | jq .averageEvolutionVelocity'

# Check pattern emergence by phase
curl localhost:3002/api/ain/patterns | jq '.[] | {type, phase: .streams[0].spiralPhase}'
```

## Troubleshooting

If phase detection seems incorrect:
1. Check query length (very short queries default to INITIATION)
2. Verify user history is being tracked
3. Ensure consciousness level calculations are working
4. Check for phase-specific keywords in queries

## Next Steps

After successful QA:
1. Add phase visualization to frontend dashboard
2. Implement phase-specific guidance algorithms
3. Create phase transition ceremonies
4. Build collective phase resonance features
5. Add phase-based matchmaking for group sessions

---

🌀 **Remember**: The spiral is not linear - users may revisit phases as they deepen their understanding. This is by design, reflecting the natural spiral of consciousness evolution.