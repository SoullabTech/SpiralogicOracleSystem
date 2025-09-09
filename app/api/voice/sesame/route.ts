// app/api/voice/sesame/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ ok: false, error: 'Missing text' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Check if ElevenLabs is configured with Aunt Annie voice
    const auntAnnieVoiceId = process.env.ELEVENLABS_VOICE_ID_AUNT_ANNIE || process.env.ELEVENLABS_VOICE_ID || 'y2TOWGCXSYEgBanvKsYJ';
    
    if (process.env.ELEVENLABS_API_KEY && auntAnnieVoiceId) {
      try {
        console.log('Using ElevenLabs Aunt Annie voice for Maya synthesis...', { voiceId: auntAnnieVoiceId });
        
        const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + auntAnnieVoiceId, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: text,
            model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.0,
              use_speaker_boost: true
            }
          })
        });
        
        if (elevenLabsResponse.ok) {
          console.log('ElevenLabs synthesis successful');
          const audioBuffer = await elevenLabsResponse.arrayBuffer();
          return new Response(audioBuffer, {
            status: 200,
            headers: {
              'content-type': 'audio/mpeg',
              'cache-control': 'no-store',
            }
          });
        } else {
          console.error('ElevenLabs API error:', elevenLabsResponse.status, elevenLabsResponse.statusText);
        }
      } catch (elevenLabsError) {
        console.error('ElevenLabs request failed:', elevenLabsError);
      }
    } else {
      console.log('ElevenLabs not configured:', {
        hasApiKey: !!process.env.ELEVENLABS_API_KEY,
        hasVoiceId: !!process.env.ELEVENLABS_VOICE_ID
      });
    }
    
    // Fallback: Return error so client uses Web Speech API
    return new Response(JSON.stringify({ 
      ok: false, 
      error: 'ElevenLabs voice synthesis unavailable',
      fallback: 'web_speech_api',
      message: 'Use browser Web Speech API for voice synthesis'
    }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });

  } catch (e: any) {
    console.error('Voice synthesis error:', e?.message);
    
    return new Response(JSON.stringify({ 
      ok: false, 
      error: e?.message || 'Unknown error',
      details: e?.toString?.() || 'No details available'
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}