// Test endpoint for audio functionality
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🎵 Test audio endpoint called');

  try {
    // Test 1: Check if ElevenLabs API key exists
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({
        error: 'No ElevenLabs API key found',
        suggestion: 'Add ELEVENLABS_API_KEY to your .env.local file'
      });
    }

    // Test 2: Make a simple ElevenLabs request
    const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Default voice ID
    const testText = 'Testing audio. Can you hear me?';

    console.log('📤 Calling ElevenLabs API...');
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: testText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    console.log('📥 ElevenLabs response:', {
      status: response.status,
      contentType: response.headers.get('content-type')
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: `ElevenLabs API error: ${response.status}`,
        details: errorText
      });
    }

    // Test 3: Process the audio data
    const audioBuffer = await response.arrayBuffer();
    console.log('🎵 Audio buffer size:', audioBuffer.byteLength);

    if (audioBuffer.byteLength === 0) {
      return NextResponse.json({
        error: 'Empty audio buffer received',
        suggestion: 'Check ElevenLabs API response'
      });
    }

    // Test 4: Convert to base64 (try multiple methods)
    let base64Audio;

    // Method 1: Using Buffer (Node.js way)
    try {
      base64Audio = Buffer.from(audioBuffer).toString('base64');
      console.log('✅ Method 1 (Buffer) successful');
    } catch (e) {
      console.error('❌ Method 1 failed:', e);

      // Method 2: Using Uint8Array
      try {
        const uint8Array = new Uint8Array(audioBuffer);
        base64Audio = Buffer.from(uint8Array).toString('base64');
        console.log('✅ Method 2 (Uint8Array) successful');
      } catch (e2) {
        console.error('❌ Method 2 failed:', e2);
        return NextResponse.json({
          error: 'Failed to encode audio to base64',
          details: e2.message
        });
      }
    }

    // Test 5: Validate base64
    console.log('📊 Base64 stats:', {
      length: base64Audio.length,
      first50: base64Audio.substring(0, 50),
      last50: base64Audio.substring(base64Audio.length - 50)
    });

    // Test 6: Create data URL
    const dataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    // Test 7: Validate it can be decoded
    try {
      const testDecode = Buffer.from(base64Audio.substring(0, 100), 'base64');
      console.log('✅ Base64 validation successful');
    } catch (e) {
      console.error('❌ Base64 validation failed:', e);
    }

    return NextResponse.json({
      success: true,
      audioUrl: dataUrl,
      debug: {
        originalBufferSize: audioBuffer.byteLength,
        base64Length: base64Audio.length,
        dataUrlLength: dataUrl.length,
        expectedDuration: '~1 second',
        mimeType: 'audio/mpeg'
      },
      instructions: 'Copy the audioUrl and test it in your browser console with: new Audio(audioUrl).play()'
    });

  } catch (error: any) {
    console.error('❌ Test audio error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error.message,
      stack: error.stack
    });
  }
}

// Also support POST for testing with custom text
export async function POST(request: Request) {
  try {
    const { text = 'Hello, this is a test.' } = await request.json();

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'No API key configured' });
    }

    const voiceId = 'EXAVITQu4vr4xnSDxMaL';

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1'
      })
    });

    if (!response.ok) {
      return NextResponse.json({ error: `API error: ${response.status}` });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
      textLength: text.length,
      audioSize: audioBuffer.byteLength
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}