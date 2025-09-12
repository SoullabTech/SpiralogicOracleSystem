/**
 * Sesame Text Enhancement API Route
 * Enhances Maya's responses with conversational intelligence
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let text = 'Hello. How are you today?'; // Default fallback
  
  try {
    const body = await request.json();
    const { text: requestText, personality, context, voice_config } = body;
    text = requestText || text; // Use request text or fallback

    // Get Sesame API key from headers or environment
    const sesameApiKey = request.headers.get('Authorization')?.replace('Bearer ', '') 
      || process.env.SESAME_API_KEY;

    if (!sesameApiKey) {
      return NextResponse.json(
        { error: 'Sesame API key required' },
        { status: 401 }
      );
    }

    // Call Sesame's conversational intelligence API
    const sesameResponse = await fetch(`${process.env.SESAME_API_BASE_URL}/enhance-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sesameApiKey}`,
        'X-API-Version': '2024-01'
      },
      body: JSON.stringify({
        original_text: text,
        personality_profile: personality || 'maya_natural_intelligent',
        context: {
          conversation_stage: context?.stage || 'ongoing',
          user_engagement: context?.engagement || 'medium',
          emotional_tone: context?.emotion || 'neutral',
          ...context
        },
        enhancement_config: {
          style: voice_config?.style || 'conversational',
          emotion: voice_config?.emotion || 'warm_intelligent',
          pacing: voice_config?.pacing || 'natural',
          max_sentence_length: 12, // Mastery Voice specification
          use_modern_language: true,
          avoid_mystical_jargon: true,
          ground_cosmic_insights: true
        }
      })
    });

    if (!sesameResponse.ok) {
      throw new Error(`Sesame API error: ${sesameResponse.status}`);
    }

    const enhancedData = await sesameResponse.json();

    return NextResponse.json({
      enhanced_text: enhancedData.enhanced_text || text,
      improvements: enhancedData.improvements || [],
      confidence: enhancedData.confidence || 0.8,
      processing_time: enhancedData.processing_time || 0,
      personality_applied: personality || 'maya_natural_intelligent'
    });

  } catch (error) {
    console.error('Sesame enhancement error:', error);
    
    // Graceful fallback - use the text variable that's now safely defined
    return NextResponse.json({
      enhanced_text: text, // text is now guaranteed to be defined
      improvements: [],
      confidence: 0.0,
      error: 'Enhancement service unavailable, using original text',
      fallback: true
    });
  }
}