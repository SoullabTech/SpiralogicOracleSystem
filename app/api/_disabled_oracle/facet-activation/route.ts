import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PersonalOracleAgent } from '@/apps/api/backend/src/agents/PersonalOracleAgent';
import { getFacetById } from '@/data/spiralogic-facets-complete';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey
  // Fixed above
  
);

export async function POST(req: NextRequest) {
  try {
    const {
      facetId,
      facet,
      intensity,
      elementalBalance,
      mode,
      prompt,
      context
    } = await req.json();

    // Get user session
    const userId = req.headers.get('x-user-id') || 'anonymous';
    const sessionId = req.headers.get('x-session-id') || `holoflower-${Date.now()}`;

    // Validate facet data
    const validatedFacet = getFacetById(facetId);
    if (!validatedFacet) {
      return NextResponse.json(
        { error: 'Invalid facet ID' },
        { status: 400 }
      );
    }

    // Initialize PersonalOracleAgent with facet context
    const agent = new PersonalOracleAgent({
      userId,
      sessionId,
      context: {
        ...context,
        interactionType: 'holoflower-facet-activation',
        facetId,
        element: facet.element,
        stage: facet.stage,
        intensity,
        elementalBalance,
        mode
      }
    });

    // Process through Oracle with facet-aware prompting
    const oracleResponse = await agent.processQuery(prompt, {
      facetContext: {
        activated: facetId,
        element: facet.element,
        stage: facet.stage,
        archetype: facet.archetype,
        essence: facet.essence,
        intensity,
        practice: facet.practice
      },
      elementalBalance,
      mode
    });

    // Calculate coherence based on elemental balance and intensity
    const coherenceBoost = intensity * 0.3; // Max 0.3 boost from activation
    const balanceCoherence = calculateBalanceCoherence(elementalBalance);
    const totalCoherence = Math.min(1, balanceCoherence + coherenceBoost);

    // Store facet activation in Supabase
    const { error: dbError } = await supabase
      .from('maia_messages')
      .insert([
        {
          session_id: sessionId,
          user_id: userId,
          role: 'user',
          content: `[Facet Activation: ${facet.facet}]`,
          context: 'holoflower-interaction',
          metadata: {
            facetId,
            element: facet.element,
            stage: facet.stage,
            intensity,
            elementalBalance
          }
        },
        {
          session_id: sessionId,
          user_id: userId,
          role: 'maia',
          content: oracleResponse.text,
          coherence_level: totalCoherence,
          motion_state: oracleResponse.motionState || 'responding',
          elements: elementalBalance,
          context: 'holoflower-interaction',
          is_breakthrough: totalCoherence > 0.85,
          metadata: {
            facetActivated: facetId,
            archetype: facet.archetype,
            intensityLevel: intensity,
            oracleMode: mode
          }
        }
      ]);

    if (dbError) {
      console.warn('Database storage error:', dbError);
      // Continue - don't fail the request for DB issues
    }

    // Log coherence change
    await supabase
      .from('maia_coherence_log')
      .insert({
        user_id: userId,
        session_id: sessionId,
        coherence_level: totalCoherence,
        trigger_type: 'facet_activation',
        context: `${facet.element}-${facet.stage}:${intensity.toFixed(2)}`
      })
      .catch(err => console.warn('Coherence logging error:', err));

    // Generate response with enhanced metadata
    const response = {
      messageId: `facet-${facetId}-${Date.now()}`,
      response: oracleResponse.text,
      coherenceLevel: totalCoherence,
      motionState: oracleResponse.motionState || 'responding',
      elements: elementalBalance,
      isBreakthrough: totalCoherence > 0.85,
      facetActivated: {
        id: facetId,
        element: facet.element,
        stage: facet.stage,
        archetype: facet.archetype,
        intensity
      },
      practices: extractPractices(oracleResponse.text, facet.practice),
      elementalSuggestions: generateElementalSuggestions(elementalBalance),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Facet activation Oracle error:', error);
    
    // Fallback response maintaining the facet connection
    const fallbackResponse = {
      messageId: `fallback-${Date.now()}`,
      response: "The facets of your being resonate with ancient knowing... though the signal grows faint. Trust what emerges.",
      coherenceLevel: 0.6,
      motionState: 'responding',
      elements: { fire: 0.25, water: 0.25, earth: 0.25, air: 0.25 },
      isBreakthrough: false,
      error: 'Oracle connection unstable',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}

// Helper functions
function calculateBalanceCoherence(elementalBalance: Record<string, number>): number {
  // Coherence is higher when elements are more balanced
  const elements = Object.values(elementalBalance);
  const mean = elements.reduce((sum, val) => sum + val, 0) / elements.length;
  const variance = elements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / elements.length;
  
  // Lower variance = higher balance = higher coherence
  // Invert and normalize variance to 0-0.7 coherence range
  const balanceScore = Math.max(0, 0.7 - (variance * 10));
  return Math.min(0.7, balanceScore + 0.3); // Base coherence + balance bonus
}

function extractPractices(oracleText: string, facetPractice: string): string[] {
  const practices = [facetPractice];
  
  // Extract any practice suggestions from Oracle response
  const practiceKeywords = ['practice', 'try', 'consider', 'perhaps', 'invite'];
  const sentences = oracleText.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    if (practiceKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      const cleanSentence = sentence.trim();
      if (cleanSentence.length > 10 && cleanSentence.length < 100) {
        practices.push(cleanSentence);
      }
    }
  });
  
  return practices.slice(0, 3); // Max 3 practices
}

function generateElementalSuggestions(balance: Record<string, number>): Record<string, string> {
  const suggestions: Record<string, string> = {};
  
  // Find underactive elements (< 0.2) and suggest activation
  Object.entries(balance).forEach(([element, value]) => {
    if (value < 0.2) {
      const elementalAdvice = {
        fire: "Consider activating your creative fire - what wants to be expressed?",
        water: "Your emotional depths call for attention - what needs to be felt?", 
        earth: "Ground yourself in practical action - what seeks manifestation?",
        air: "Mental clarity awaits - what truth wants to be spoken?"
      };
      
      suggestions[element] = elementalAdvice[element as keyof typeof elementalAdvice] || 
                            `Your ${element} nature seeks more expression.`;
    }
  });
  
  return suggestions;
}