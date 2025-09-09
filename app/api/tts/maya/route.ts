import { NextRequest, NextResponse } from 'next/server';
import { speakPetalMessage, shapeTextWithCI } from '@/lib/voice/sesameTTS';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = 'maya', element = 'aether' } = body;

    console.log('TTS API called:', { voice, element, textLength: text?.length });

    // Validate input
    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'No text provided for synthesis' },
        { status: 400 }
      );
    }

    // Shape text with conversational intelligence if available
    const shaped = await shapeTextWithCI(text, element, voice);
    const finalText = shaped?.shaped || text;

    // Generate speech using Sesame TTS
    const audioBase64 = await speakPetalMessage(finalText, voice, element);

    if (!audioBase64) {
      console.error('TTS synthesis failed - no audio generated');
      return NextResponse.json(
        { error: 'TTS synthesis failed' },
        { status: 500 }
      );
    }

    // Return the base64 audio
    return NextResponse.json({
      success: true,
      audio: audioBase64,
      voice,
      element,
      duration_ms: Math.max(2000, text.split(' ').length * 200), // Estimate duration
      shaped_text: finalText
    });

  } catch (error: any) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { 
        error: 'TTS processing failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}