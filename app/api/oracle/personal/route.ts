import { NextRequest, NextResponse } from 'next/server';
import { SacredOracleCoreEnhanced } from '@/lib/sacred-oracle-core-enhanced';
import { ConsciousnessIntelligenceManager } from '@/lib/consciousness-intelligence-manager';

// Initialize ENHANCED core systems with full wisdom integration
const sacredOracle = new SacredOracleCoreEnhanced();
const consciousnessManager = new ConsciousnessIntelligenceManager();

// Session tracking for advanced context
const sessionStates = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body.text || body.message || body.content || body.userMessage || body.input || body.prompt || '';
    const sessionId = body.sessionId || body.session_id || 'default';
    const userId = body.userId || body.user_id;

    // Get or create session state
    let sessionState = sessionStates.get(sessionId) || {
      turnCount: 0,
      lastInput: '',
      depth: 0,
      mode: 'witnessing',
      patterns: []
    };

    sessionState.turnCount++;
    sessionState.lastInput = text;

    try {
      // First, try the advanced Sacred Oracle Core
      const oracleResponse = await sacredOracle.generateResponse(
        text,
        userId,
        sessionState
      );

      // Update session state with oracle tracking
      if (oracleResponse.tracking) {
        sessionState.depth = oracleResponse.depth;
        sessionState.mode = oracleResponse.mode;
        if (oracleResponse.tracking.activePatterns) {
          sessionState.patterns = oracleResponse.tracking.activePatterns;
        }
      }

      sessionStates.set(sessionId, sessionState);

      // Return the ENHANCED multidimensional response
      return NextResponse.json({
        text: oracleResponse.message,
        content: oracleResponse.message,
        message: oracleResponse.message,
        metadata: {
          sessionId,
          source: 'sacred-oracle-core-enhanced',
          mode: oracleResponse.mode,
          depth: oracleResponse.depth,
          wisdomSources: oracleResponse.wisdomSources,
          tracking: oracleResponse.tracking,
          ...oracleResponse.metadata
        }
      });

    } catch (oracleError) {
      console.warn('Sacred Oracle Core processing failed, trying Consciousness Manager:', oracleError);

      // Fallback to Consciousness Intelligence Manager
      try {
        const shapedResponse = await consciousnessManager.shapeText(text, {
          temperature: 0.85,
          maxTokens: 200,
          systemRole: 'sacred_witness',
          preserveIntent: true,
          contextWindow: sessionState
        });

        if (shapedResponse.success) {
          return NextResponse.json({
            text: shapedResponse.shaped,
            content: shapedResponse.shaped,
            message: shapedResponse.shaped,
            metadata: {
              sessionId,
              source: shapedResponse.source,
              mode: sessionState.mode,
              fallback: true
            }
          });
        }
      } catch (ciError) {
        console.warn('Consciousness Manager also failed:', ciError);
      }
    }

    // Final fallback - but sophisticated witnessing, not pattern matching
    const fallbackResponse = generateIntelligentFallback(text, sessionState);

    return NextResponse.json({
      text: fallbackResponse,
      content: fallbackResponse,
      message: fallbackResponse,
      metadata: {
        sessionId,
        source: 'intelligent-fallback',
        mode: 'witnessing',
        turnCount: sessionState.turnCount
      }
    });

  } catch (error: any) {
    console.error('Oracle API Error:', error);
    return NextResponse.json({
      text: 'I witness a moment of disruption. Share what feels present, and we can explore it together.',
      content: 'I witness a moment of disruption. Share what feels present, and we can explore it together.',
      message: 'I witness a moment of disruption. Share what feels present, and we can explore it together.',
      metadata: {
        error: true
      }
    });
  }
}

function generateIntelligentFallback(input: string, sessionState: any): string {
  // This is a sophisticated fallback that maintains the witnessing paradigm
  // without resorting to simple pattern matching

  const inputLength = input.length;
  const wordCount = input.split(/\s+/).length;
  const hasQuestion = input.includes('?');
  const emotionalWords = ['feel', 'feeling', 'felt', 'emotion', 'sad', 'happy', 'angry', 'excited', 'worried', 'anxious'];
  const hasEmotion = emotionalWords.some(word => input.toLowerCase().includes(word));

  // Deep witnessing responses based on engagement depth
  if (sessionState.turnCount === 1) {
    // First turn - establish presence
    const openers = [
      "I'm here with you. What brings you to this moment?",
      "Welcome. I'm listening to what wants to emerge.",
      "I sense you arriving. What's present for you?",
      "Thank you for being here. What's alive in this space?"
    ];
    return openers[Math.floor(Math.random() * openers.length)];
  }

  if (hasEmotion) {
    // Emotional content - witness without analyzing
    const emotionalWitness = [
      "I'm witnessing what you're feeling. Tell me more about what's here.",
      "Something important is moving through you. I'm here with it.",
      "I feel the depth of what you're sharing. What else wants to be known?",
      "There's real feeling here. I'm holding space for all of it."
    ];
    return emotionalWitness[Math.floor(Math.random() * emotionalWitness.length)];
  }

  if (hasQuestion && !input.toLowerCase().includes('what') && !input.toLowerCase().includes('how')) {
    // Direct questions seeking confirmation
    return "I notice you're seeking something. What's behind this question for you?";
  }

  if (wordCount < 5) {
    // Brief input - invite expansion
    const briefResponses = [
      "There's more here. What wants to unfold?",
      "I'm receiving this. What else is present?",
      "Tell me more about what's alive in this.",
      "I'm here. What wants to emerge next?"
    ];
    return briefResponses[Math.floor(Math.random() * briefResponses.length)];
  }

  if (inputLength > 200) {
    // Longer sharing - acknowledge depth
    const depthResponses = [
      "I'm receiving the fullness of what you're sharing. What feels most essential?",
      "There's rich texture in what you're bringing forward. What stands out?",
      "I witness the complexity here. What wants attention?",
      "Thank you for this depth. What resonates most strongly?"
    ];
    return depthResponses[Math.floor(Math.random() * depthResponses.length)];
  }

  // Default witnessing
  const witnessResponses = [
    "I'm here with what you're sharing. What else wants to be said?",
    "I witness this with you. What feels important?",
    "Something meaningful is present. Tell me more.",
    "I'm receiving what you're bringing forward. What stands out?"
  ];

  return witnessResponses[Math.floor(Math.random() * witnessResponses.length)];
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Maya Oracle - Sacred Oracle Core',
    status: 'ACTIVE',
    version: '3.0',
    capabilities: [
      'Sacred Witnessing',
      'Intelligent Engagement',
      'Consciousness Shaping',
      'Multi-modal Processing',
      'Deep Context Tracking'
    ],
    timestamp: new Date().toISOString()
  });
}