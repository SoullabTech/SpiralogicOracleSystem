// app/api/voice/sesame/route.ts
import { synthesizeToWav, checkHealth } from '@/lib/northflankSesame';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Standard timeout for Northflank

export async function POST(req: Request) {
  try {
    // Development mock mode for testing
    if (process.env.NODE_ENV === 'development' && !process.env.NORTHFLANK_SESAME_URL?.includes('northflank.app')) {
      console.log('[Dev Mode] Using beep fallback - Northflank not configured');
    }
    
    // Warm-up endpoint for keeping service alive
    const url = new URL(req.url);
    if (url.searchParams.get('warm') === '1') {
      const serviceUrl = process.env.NORTHFLANK_SESAME_URL;
      if (serviceUrl) {
        const healthy = await checkHealth({ serviceUrl });
        return new Response(JSON.stringify({ ok: true, status: 'warm', healthy }), {
          headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
        });
      }
      return new Response(JSON.stringify({ ok: true, status: 'warm' }), {
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
      });
    }

    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ ok: false, error: 'Missing text' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Check voice provider configuration
    const voiceProvider = process.env.VOICE_PROVIDER || 'sesame';
    const sesameProvider = process.env.SESAME_PROVIDER || 'northflank';
    
    console.log('Voice configuration:', { voiceProvider, sesameProvider });

    // Check if we should use Northflank Sesame
    if (voiceProvider === 'sesame' && sesameProvider === 'northflank') {
      if (!process.env.NORTHFLANK_SESAME_URL) {
        console.log('Missing Northflank Sesame URL, falling back to beep');
        const beepBlob = makeBeepWav(800, 1);
        const wavBuffer = await beepBlob.arrayBuffer();
        return new Response(wavBuffer, {
          status: 200,
          headers: {
            'content-type': 'audio/wav',
            'cache-control': 'no-store',
          }
        });
      }
    } else {
      // Other providers not implemented yet, use beep
      console.log(`Provider ${voiceProvider}/${sesameProvider} not implemented, using beep`);
      const beepBlob = makeBeepWav(800, 1);
      const wavBuffer = await beepBlob.arrayBuffer();
      return new Response(wavBuffer, {
        status: 200,
        headers: {
          'content-type': 'audio/wav',
          'cache-control': 'no-store',
        }
      });
    }

    // NORTHFLANK: Maya voice enabled!
    console.log('Attempting Northflank Sesame synthesis for:', text.substring(0, 50));
    console.log('Northflank config:', {
      serviceUrl: process.env.NORTHFLANK_SESAME_URL,
      hasApiKey: !!process.env.NORTHFLANK_SESAME_API_KEY
    });
    
    try {
      const wavBuffer = await synthesizeToWav(text, {
        serviceUrl: process.env.NORTHFLANK_SESAME_URL!,
        apiKey: process.env.NORTHFLANK_SESAME_API_KEY,
        timeout: 30000, // 30 seconds timeout
      });
      console.log('Northflank Sesame synthesis successful, audio size:', wavBuffer.byteLength);
      return new Response(wavBuffer, {
        status: 200,
        headers: {
          'content-type': 'audio/wav',
          'cache-control': 'no-store',
        }
      });
    } catch (error: any) {
      console.error('Northflank synthesis failed:', error.message);
      throw error;
    }
  } catch (e: any) {
    console.error('Voice synthesis error:', e?.message, e?.stack);
    
    // Return detailed error for debugging
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

// --- tiny WAV generator (mono 16-bit 16kHz) to prove end-to-end wiring ---
function makeBeepWav(freq: number, seconds: number) {
  const sampleRate = 16000;
  const numSamples = Math.floor(sampleRate * seconds);
  const headerSize = 44;
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(headerSize + numSamples * bytesPerSample);
  const view = new DataView(buffer);

  // RIFF/WAVE header
  writeStr(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * bytesPerSample, true);
  writeStr(view, 8, 'WAVE');
  writeStr(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true);  // PCM format
  view.setUint16(22, 1, true);  // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true); // bits per sample
  writeStr(view, 36, 'data');
  view.setUint32(40, numSamples * bytesPerSample, true);

  // samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const s = Math.sin(2 * Math.PI * freq * t);
    const val = Math.max(-1, Math.min(1, s));      // clamp
    view.setInt16(offset, val * 32767, true);
    offset += 2;
  }
  return new Blob([view], { type: 'audio/wav' });
}
function writeStr(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}