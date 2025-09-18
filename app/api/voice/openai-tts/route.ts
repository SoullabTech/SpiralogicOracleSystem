/**
 * OpenAI TTS Route - Maya with Alloy Voice
 * Natural, conversational voice synthesis without artificial pauses
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface MayaVoiceConfig {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number;
  model: 'tts-1' | 'tts-1-hd';
}

// Maya's natural voice configuration with Alloy
const MAYA_VOICE_CONFIG: MayaVoiceConfig = {
  voice: 'alloy',     // Calm, composed, warm presence
  speed: 0.95,        // Slightly slower for natural conversational pace
  model: 'tts-1-hd'   // Higher quality for better clarity
};

/**
 * Clean text for natural speech synthesis
 * Removes artificial pauses and markup while preserving natural flow
 */
function cleanTextForSpeech(text: string): string {
  return text
    // Remove stage directions and markup
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    // Remove artificial pause markers
    .replace(/\.\.\./g, ',')     // Convert ellipses to commas for natural flow
    .replace(/—/g, ',')           // Convert em-dash to comma
    .replace(/\s*-\s*/g, ' ')     // Remove hyphens used as pauses
    // Clean up multiple punctuation
    .replace(/([.!?])\s*\1+/g, '$1')
    // Remove explicit breath or pause words
    .replace(/\b(pause|breath|hmm+|mmm+|uhh+|umm+)\b/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { text, speed, voice, prosody } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        {
          error: 'Voice synthesis unavailable',
          fallback: 'web_speech_api'
        },
        { status: 503 }
      );
    }

    // Clean the text for natural speech
    const cleanedText = cleanTextForSpeech(text);

    // Use provided settings or defaults, including prosody adjustments
    const config = {
      ...MAYA_VOICE_CONFIG,
      ...(speed && { speed }),
      ...(voice && { voice })
    };

    // Apply prosody adjustments if provided
    if (prosody) {
      if (prosody.speed) config.speed *= prosody.speed;
      if (prosody.pitch) {
        // OpenAI doesn't support pitch directly, but we can adjust speed slightly
        // Higher pitch = slightly faster, lower pitch = slightly slower
        config.speed *= (0.9 + (prosody.pitch * 0.2));
      }
    }

    console.log('Generating speech with OpenAI TTS:', {
      voice: config.voice,
      speed: config.speed,
      textLength: cleanedText.length
    });

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        input: cleanedText,
        voice: config.voice,
        speed: config.speed,
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI TTS error:', response.status, error);
      throw new Error(`OpenAI TTS failed: ${response.status}`);
    }

    // Get the audio data
    const audioData = await response.arrayBuffer();

    // Return the audio with proper headers
    return new NextResponse(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
        'Content-Length': audioData.byteLength.toString(),
      }
    });

  } catch (error: any) {
    console.error('OpenAI TTS error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Voice synthesis failed',
        fallback: 'web_speech_api',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

// Optional GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    config: {
      voice: MAYA_VOICE_CONFIG.voice,
      speed: MAYA_VOICE_CONFIG.speed,
      model: MAYA_VOICE_CONFIG.model
    },
    description: 'Maya voice with OpenAI Alloy - natural conversational presence'
  });
}