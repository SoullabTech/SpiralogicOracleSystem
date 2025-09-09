/**
 * Sesame Text-to-Speech API Route
 * Converts Maya's enhanced text to natural speech using Sesame + Aunt Annie voice
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voice, rate, pitch, volume } = await request.json();

    // Get Sesame API key from headers or environment
    const sesameApiKey = request.headers.get('Authorization')?.replace('Bearer ', '') 
      || process.env.SESAME_API_KEY;

    if (!sesameApiKey) {
      return NextResponse.json(
        { error: 'Sesame API key required' },
        { status: 401 }
      );
    }

    // Call Sesame's voice synthesis API
    const sesameResponse = await fetch(`${process.env.SESAME_API_BASE_URL}/synthesize-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sesameApiKey}`,
        'X-API-Version': '2024-01',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text,
        voice_profile: voice || 'maya_aunt_annie',
        speech_config: {
          rate: rate || 1.0,
          pitch: pitch || 1.0,
          volume: volume || 0.9,
          emotion: 'warm_intelligent',
          style: 'conversational',
          breathing_pauses: true,
          natural_inflection: true
        },
        output_format: 'mp3',
        quality: 'high'
      })
    });

    if (!sesameResponse.ok) {
      throw new Error(`Sesame TTS API error: ${sesameResponse.status}`);
    }

    // Return the audio blob
    const audioBuffer = await sesameResponse.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=300', // 5 minute cache
        'X-Voice-Provider': 'sesame',
        'X-Voice-Profile': voice || 'maya_aunt_annie'
      }
    });

  } catch (error) {
    console.error('Sesame TTS error:', error);
    
    return NextResponse.json({
      error: 'Voice synthesis failed',
      message: 'Sesame TTS service unavailable',
      fallback_recommendation: 'Use Web Speech API fallback'
    }, { status: 503 });
  }
}