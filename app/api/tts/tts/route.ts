import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      voice = 'alloy',
      speed = 1.0,
      model = 'tts-1' // or 'tts-1-hd' for higher quality
    } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided for TTS' },
        { status: 400 }
      );
    }

    // Validate voice option
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const selectedVoice = validVoices.includes(voice) ? voice : 'alloy';

    // Generate speech
    const mp3 = await openai.audio.speech.create({
      model: model as 'tts-1' | 'tts-1-hd',
      voice: selectedVoice as any,
      input: text,
      speed: Math.max(0.25, Math.min(4.0, speed)) // Clamp speed to valid range
    });

    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Return audio with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('TTS generation error:', error);

    // Detailed error response
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'TTS generation failed', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'TTS generation failed' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check TTS status
export async function GET() {
  try {
    // Check if API key is configured
    const isConfigured = !!process.env.OPENAI_API_KEY;

    return NextResponse.json({
      status: isConfigured ? 'ready' : 'not configured',
      availableVoices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
      models: ['tts-1', 'tts-1-hd'],
      speedRange: { min: 0.25, max: 4.0 }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'TTS service check failed' },
      { status: 500 }
    );
  }
}