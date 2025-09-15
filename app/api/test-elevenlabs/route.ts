import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'No API key' });
  }

  try {
    // Test with minimal text
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello, this is a test.',
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    console.log('ElevenLabs status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({
        error: 'ElevenLabs API error',
        status: response.status,
        details: error
      });
    }

    // Get audio as array buffer
    const audioBuffer = await response.arrayBuffer();
    console.log('Audio buffer size:', audioBuffer.byteLength);

    // Convert to base64
    const base64 = Buffer.from(audioBuffer).toString('base64');
    console.log('Base64 length:', base64.length);

    // Create proper data URL
    const dataUrl = `data:audio/mpeg;base64,${base64}`;

    // Test that base64 is valid
    try {
      Buffer.from(base64, 'base64');
      console.log('✅ Base64 is valid');
    } catch (e) {
      console.error('❌ Invalid base64');
    }

    return NextResponse.json({
      success: true,
      bufferSize: audioBuffer.byteLength,
      base64Length: base64.length,
      audioUrl: dataUrl,
      preview: dataUrl.substring(0, 100) + '...'
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to generate audio',
      details: error.message
    });
  }
}