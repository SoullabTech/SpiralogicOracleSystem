// Oracle Insights API Route - Integrates Pipeline with Existing Services

import { NextRequest, NextResponse } from 'next/server';
import OraclePipeline from '@/services/oracle-pipeline';
// import { ElementalContentService } from '@/services/ElementalContentService'; // Service not implemented
import { createClient } from '@supabase/supabase-js';

// Initialize services
const pipeline = new OraclePipeline(process.env.ANTHROPIC_API_KEY!);
// const elementalService = new ElementalContentService(); // Service not implemented

// Supabase for persistence
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { 
      query, 
      userId, 
      sessionId,
      mode = 'cascade', // 'cascade' | 'elemental' | 'quick'
      debug = false 
    } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Mode routing
    switch (mode) {
      case 'cascade': {
        // Full 5-stage oracle pipeline
        const result = await pipeline.runPipeline(query, {
          debug,
          userId,
          sessionId,
          useTemporalContext: true
        });

        // Persist to database if user is authenticated
        if (userId) {
          await persistOracleSession({
            userId,
            sessionId: result.sessionId!,
            query,
            response: result.final,
            stages: result.stages,
            elements: result.elements
          });
        }

        return NextResponse.json({
          response: result.final,
          sessionId: result.sessionId,
          ...(debug && { 
            stages: result.stages,
            elements: result.elements 
          })
        });
      }

      case 'elemental': {
        // ElementalContentService not implemented - returning placeholder
        const elements = {
          fire: 'Action awaits',
          water: 'Emotions flow',
          earth: 'Ground yourself',
          air: 'New perspectives'
        };

        return NextResponse.json({
          response: formatElementalResponse(elements),
          elements
        });
      }

      case 'quick': {
        // Single-shot response without cascade
        const response = await generateQuickOracleResponse(query);
        
        return NextResponse.json({
          response
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid mode' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Oracle insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate oracle insights' },
      { status: 500 }
    );
  }
}

// GET endpoint for pattern analysis
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  try {
    // Load user's temporal buffer from DB
    const { data: sessions } = await supabase
      .from('oracle_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Analyze patterns
    const patterns = analyzeUserPatterns(sessions || []);

    return NextResponse.json({
      patterns,
      recentSessions: sessions?.slice(0, 5)
    });
  } catch (error) {
    console.error('Pattern analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze patterns' },
      { status: 500 }
    );
  }
}

// Helper functions

async function persistOracleSession(data: {
  userId: string;
  sessionId: string;
  query: string;
  response: string;
  stages?: any[];
  elements?: Record<string, string>;
}) {
  const { error } = await supabase
    .from('oracle_sessions')
    .insert({
      user_id: data.userId,
      session_id: data.sessionId,
      query: data.query,
      response: data.response,
      stages: data.stages || [],
      elements: data.elements || {},
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Failed to persist session:', error);
  }
}

function formatElementalResponse(elements: Record<string, string>): string {
  const lines = Object.entries(elements)
    .map(([element, insight]) => `**${element}**: ${insight}`)
    .join('\n\n');

  return `*The elements speak:*\n\n${lines}\n\n*Integration awaits your synthesis.*`;
}

async function generateQuickOracleResponse(query: string): Promise<string> {
  // Simplified single-prompt oracle response
  const prompt = `
As an oracle combining ancient wisdom with modern insight, respond to this query
with depth and practicality. Be concise but soulful.

Query: ${query}

Provide:
- A core insight
- A practical next step
- A closing reflection
`;

  // Use your existing LLM service here
  // This is a placeholder
  return `*The Oracle speaks...*\n\n[Response would be generated here]`;
}

function analyzeUserPatterns(sessions: any[]): {
  dominantElement: string;
  evolutionArc: string;
  keyThemes: string[];
  nextSuggestion: string;
} {
  if (!sessions || sessions.length === 0) {
    return {
      dominantElement: 'uncharted',
      evolutionArc: 'beginning',
      keyThemes: [],
      nextSuggestion: 'Begin with a question that matters to you.'
    };
  }

  // Count element frequencies across all sessions
  const elementCounts: Record<string, number> = {};
  const allThemes: string[] = [];

  for (const session of sessions) {
    if (session.elements) {
      for (const element of Object.keys(session.elements)) {
        elementCounts[element] = (elementCounts[element] || 0) + 1;
      }
    }
    
    // Extract themes from queries
    const words = session.query.toLowerCase().split(/\s+/);
    allThemes.push(...words.filter((w: string) => w.length > 5));
  }

  // Find dominant element
  const dominantElement = Object.entries(elementCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'balanced';

  // Detect evolution
  const firstElements = sessions[sessions.length - 1]?.elements;
  const lastElements = sessions[0]?.elements;
  const evolutionArc = describeEvolution(firstElements, lastElements);

  // Find key themes
  const themeFreq: Record<string, number> = {};
  for (const theme of allThemes) {
    themeFreq[theme] = (themeFreq[theme] || 0) + 1;
  }
  
  const keyThemes = Object.entries(themeFreq)
    .filter(([,count]) => count > 2)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([theme]) => theme);

  // Generate suggestion based on patterns
  const nextSuggestion = generateNextSuggestion(dominantElement, keyThemes);

  return {
    dominantElement,
    evolutionArc,
    keyThemes,
    nextSuggestion
  };
}

function describeEvolution(
  first: Record<string, string> | undefined,
  last: Record<string, string> | undefined
): string {
  if (!first || !last) return 'emerging';

  const firstDominant = getDominantFromElements(first);
  const lastDominant = getDominantFromElements(last);

  if (firstDominant === lastDominant) {
    return `deepening in ${firstDominant}`;
  }
  
  return `evolving from ${firstDominant} to ${lastDominant}`;
}

function getDominantFromElements(elements: Record<string, string>): string {
  let maxLength = 0;
  let dominant = 'balanced';

  for (const [element, insight] of Object.entries(elements)) {
    if (insight.length > maxLength) {
      maxLength = insight.length;
      dominant = element;
    }
  }

  return dominant;
}

function generateNextSuggestion(
  dominant: string,
  themes: string[]
): string {
  const suggestions: Record<string, string> = {
    fire: 'Consider what action has been waiting for your courage.',
    water: 'Let yourself feel what has been held beneath the surface.',
    earth: 'Ground your insights in one concrete, physical practice.',
    air: 'Step back to see the larger pattern connecting your questions.',
    aether: 'You are ready for synthesis. What wants to be born?',
    balanced: 'Your elements are in harmony. Trust your next intuition.'
  };

  return suggestions[dominant] || suggestions.balanced;
}