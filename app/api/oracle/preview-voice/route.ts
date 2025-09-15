/**
 * Preview Voice API - Generate short preview audio for voice selection
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voice } = await request.json();

    if (!text || !voice) {
      return NextResponse.json(
        { error: 'Text and voice are required' },
        { status: 400 }
      );
    }

    // Check if ElevenLabs is configured
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({
        audio: 'web-speech-fallback'
      });
    }

    // Select voice ID based on selection
    const voiceId = voice === 'anthony'
      ? 'c6SfcYrb2t09NHXiT80T'  // Anthony's voice
      : 'LcfcDJNUP1GQjkzn1xUU'; // Maya's voice (Emily)

    // Simple voice settings for preview
    const voiceSettings = {
      stability: 0.15,
      similarity_boost: 0.30,
      style: 0.20,
      use_speaker_boost: false
    };

    try {
      const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: text.substring(0, 100), // Limit preview length
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings,
          output_format: 'mp3_44100_128'
        })
      });

      if (voiceResponse.ok) {
        const audioBlob = await voiceResponse.blob();
        const buffer = await audioBlob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');

        // Check size
        if (base64.length > 500000) {
          // Too large for preview
          return NextResponse.json({
            audio: 'web-speech-fallback'
          });
        }

        return NextResponse.json({
          audio: `data:audio/mpeg;base64,${base64}`
        });
      } else {
        console.error('ElevenLabs preview error:', voiceResponse.status);
        return NextResponse.json({
          audio: 'web-speech-fallback'
        });
      }
    } catch (error) {
      console.error('Voice preview generation failed:', error);
      return NextResponse.json({
        audio: 'web-speech-fallback'
      });
    }
  } catch (error) {
    console.error('Preview voice error:', error);
    return NextResponse.json(
      { error: 'Preview unavailable' },
      { status: 500 }
    );
  }
}