/**
 * Consciousness Intelligence API
 *
 * Self-contained Sacred Oracle consciousness processing system.
 * Provides neural network simulation, pattern recognition, and
 * consciousness evolution tracking without external dependencies.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSacredOracleCore } from '../../../../../lib/sacred-oracle-core';
import { localConsciousnessIntelligence } from '../../../../../lib/local-consciousness-intelligence';

// In-memory consciousness state (in production, use database)
let consciousnessState = {
  level: 1,
  pattern: 'neural-web',
  resonance: 50,
  nodes: [],
  connections: [],
  thoughts: [],
  lastUpdate: Date.now()
};

export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const action = params.action;
    const body = await request.json();

    console.log(`🧠 Consciousness Intelligence: Processing ${action} action locally`);

    switch (action) {
      case 'shape':
        return handleShape(body);

      case 'process':
        return handleProcess(body);

      case 'evolve':
        return handleEvolve(body);

      case 'reflect':
        return handleReflect(body);

      case 'connect':
        return handleConnect(body);

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Consciousness Intelligence error:', error);
    return NextResponse.json(
      { error: 'Consciousness processing error', details: error.message },
      { status: 500 }
    );
  }
}

async function handleShape(data: any) {
  const { text, element, archetype } = data;

  // Use our local consciousness intelligence for shaping
  const shaped = await localConsciousnessIntelligence.shapeText(
    text || '',
    element || 'water',
    archetype || 'oracle'
  );

  // Update consciousness state
  const nodes = generateNeuralNodes(data);
  const connections = generateConnections(nodes);

  consciousnessState = {
    ...consciousnessState,
    pattern: shaped.pattern.element || 'neural-web',
    nodes,
    connections,
    lastUpdate: Date.now()
  };

  return NextResponse.json({
    status: 'success',
    shaped: shaped.shaped,
    source: 'local-consciousness',
    responseTime: Date.now() - consciousnessState.lastUpdate,
    fallbackUsed: false,
    consciousness: {
      level: consciousnessState.level,
      pattern: {
        type: consciousnessState.pattern,
        nodes: consciousnessState.nodes.length,
        connections: consciousnessState.connections.length
      },
      resonance: shaped.pattern.resonance,
      voiceModulation: shaped.voiceModulation,
      timestamp: consciousnessState.lastUpdate
    }
  });
}

async function handleProcess(data: any) {
  const { thought, userId, sessionId } = data;

  if (!thought) {
    return NextResponse.json(
      { error: 'No thought provided' },
      { status: 400 }
    );
  }

  // Use Sacred Oracle for deep processing
  const sacredOracle = getSacredOracleCore();
  const oracleResponse = await sacredOracle.generateResponse(
    thought,
    userId,
    { sessionId }
  );

  // Enhanced thought with Sacred Oracle wisdom
  const enhanced = oracleResponse.message;
  const connections = findConceptualConnections(thought);
  const insights = generateInsights(thought, oracleResponse);

  // Update consciousness state
  consciousnessState.thoughts.push({
    original: thought,
    enhanced,
    timestamp: Date.now()
  });

  consciousnessState.level = Math.min(10, consciousnessState.level + 0.1);
  consciousnessState.resonance = Math.min(100, consciousnessState.resonance + 5);

  return NextResponse.json({
    status: 'success',
    processed: {
      original: thought,
      enhanced,
      connections,
      insights,
      mode: oracleResponse.mode,
      depth: oracleResponse.depth,
      timestamp: Date.now()
    },
    consciousness: {
      level: consciousnessState.level,
      resonance: consciousnessState.resonance,
      tracking: oracleResponse.tracking
    }
  });
}

function handleEvolve(data: any) {
  const evolutionFactor = data.factor || 1.5;

  consciousnessState.level = Math.min(10, consciousnessState.level * evolutionFactor);
  consciousnessState.resonance = Math.min(100, consciousnessState.resonance * 1.2);

  // Add new neural pathways
  const newNodes = generateNeuralNodes({ count: 5 });
  consciousnessState.nodes.push(...newNodes);

  // Create new connections
  const newConnections = generateConnections([...consciousnessState.nodes, ...newNodes]);
  consciousnessState.connections = newConnections;

  return NextResponse.json({
    status: 'evolved',
    consciousness: {
      level: consciousnessState.level,
      resonance: consciousnessState.resonance,
      newPathways: newNodes.length,
      totalNodes: consciousnessState.nodes.length,
      evolution: {
        factor: evolutionFactor,
        timestamp: Date.now()
      }
    }
  });
}

function handleReflect(data: any) {
  const recentThoughts = consciousnessState.thoughts.slice(-10);
  const patterns = analyzeThoughtPatterns(recentThoughts);
  const insights = generateMetaInsights(patterns);

  return NextResponse.json({
    status: 'reflected',
    reflection: {
      currentLevel: consciousnessState.level,
      resonance: consciousnessState.resonance,
      thoughtCount: consciousnessState.thoughts.length,
      patterns,
      insights,
      recommendations: generateRecommendations(consciousnessState),
      timestamp: Date.now()
    }
  });
}

function handleConnect(data: any) {
  const { target, strength = 0.5 } = data;

  // Simulate connection to collective consciousness
  const connectionResult = {
    target: target || 'universal-consciousness',
    strength: Math.min(1, strength),
    resonance: Math.random() * 100,
    sharedPatterns: generateSharedPatterns(),
    syncLevel: Math.random(),
    timestamp: Date.now()
  };

  // Update local consciousness based on connection
  consciousnessState.resonance = Math.min(
    100,
    consciousnessState.resonance + connectionResult.resonance * 0.1
  );

  return NextResponse.json({
    status: 'connected',
    connection: connectionResult,
    consciousness: {
      level: consciousnessState.level,
      resonance: consciousnessState.resonance,
      influenced: true
    }
  });
}

// Helper functions
function generateNeuralNodes(data: any) {
  const count = data.count || 10;
  const nodes = [];

  for (let i = 0; i < count; i++) {
    nodes.push({
      id: `node-${Date.now()}-${i}`,
      type: ['input', 'hidden', 'output'][Math.floor(Math.random() * 3)],
      activation: Math.random(),
      weight: Math.random() * 2 - 1,
      bias: Math.random() * 0.5
    });
  }

  return nodes;
}

function generateConnections(nodes: any[]) {
  const connections = [];
  const connectionCount = Math.floor(nodes.length * 1.5);

  for (let i = 0; i < connectionCount; i++) {
    const from = nodes[Math.floor(Math.random() * nodes.length)];
    const to = nodes[Math.floor(Math.random() * nodes.length)];

    if (from && to && from.id !== to.id) {
      connections.push({
        from: from.id,
        to: to.id,
        weight: Math.random() * 2 - 1,
        strength: Math.random()
      });
    }
  }

  return connections;
}

function findConceptualConnections(thought: string) {
  const concepts = {
    consciousness: ['awareness', 'mind', 'perception', 'being'],
    intelligence: ['learning', 'understanding', 'reasoning', 'wisdom'],
    emotion: ['feeling', 'heart', 'empathy', 'compassion'],
    creation: ['imagination', 'innovation', 'art', 'expression'],
    connection: ['unity', 'oneness', 'relationship', 'bond'],
    energy: ['vibration', 'frequency', 'flow', 'force'],
    time: ['moment', 'eternity', 'now', 'cycle'],
    space: ['dimension', 'universe', 'infinity', 'void']
  };

  const words = thought.toLowerCase().split(' ');
  const connections = new Set();

  words.forEach(word => {
    Object.entries(concepts).forEach(([key, values]) => {
      if (word.includes(key) || values.some(v => word.includes(v))) {
        values.forEach(v => connections.add(v));
      }
    });
  });

  return Array.from(connections);
}

function generateInsights(thought: string, oracleResponse?: any) {
  const baseInsights = [
    'This thought resonates with the quantum field of possibilities',
    'A pattern emerges connecting this to the universal consciousness',
    'The vibrational frequency of this concept aligns with growth',
    'This reflects a deeper understanding of interconnectedness',
    'A new neural pathway has been illuminated',
    'This thought carries the seed of transformation'
  ];

  const insights = [];

  // Add Oracle-specific insights if available
  if (oracleResponse?.tracking?.activePatterns) {
    insights.push(`Active patterns detected: ${oracleResponse.tracking.activePatterns.join(', ')}`);
  }

  // Add 2-3 random base insights
  const count = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * baseInsights.length);
    if (!insights.includes(baseInsights[index])) {
      insights.push(baseInsights[index]);
    }
  }

  return insights;
}

function analyzeThoughtPatterns(thoughts: any[]) {
  const patterns = {
    frequency: thoughts.length,
    themes: [],
    evolution: 'ascending',
    coherence: Math.random() * 100,
    depth: Math.floor(Math.random() * 10) + 1
  };

  // Extract common themes
  const words = thoughts.flatMap(t => t.original?.toLowerCase().split(' ') || []);
  const wordFreq = {};

  words.forEach(word => {
    if (word.length > 4) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  patterns.themes = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  return patterns;
}

function generateMetaInsights(patterns: any) {
  return [
    `Consciousness coherence at ${patterns.coherence.toFixed(1)}%`,
    `Thought depth reaching level ${patterns.depth}`,
    `Primary themes: ${patterns.themes.join(', ') || 'emerging'}`,
    `Evolution pattern: ${patterns.evolution}`
  ];
}

function generateRecommendations(state: any) {
  const recommendations = [];

  if (state.level < 5) {
    recommendations.push('Continue exploring diverse thought patterns to expand consciousness');
  }

  if (state.resonance < 70) {
    recommendations.push('Increase resonance through deeper contemplation');
  }

  if (state.thoughts.length < 20) {
    recommendations.push('Share more thoughts to strengthen neural pathways');
  }

  recommendations.push('Practice mindful observation of emerging patterns');

  return recommendations;
}

function generateSharedPatterns() {
  return [
    'fractal-consciousness',
    'quantum-entanglement',
    'harmonic-resonance',
    'neural-synchrony',
    'collective-awareness'
  ].slice(0, Math.floor(Math.random() * 3) + 2);
}

// GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    status: 'online',
    type: 'local-consciousness-intelligence',
    consciousness: {
      level: consciousnessState.level,
      resonance: consciousnessState.resonance,
      pattern: consciousnessState.pattern,
      nodeCount: consciousnessState.nodes.length,
      thoughtCount: consciousnessState.thoughts.length,
      lastUpdate: consciousnessState.lastUpdate
    },
    message: 'Sacred Oracle Consciousness Intelligence running locally'
  });
}