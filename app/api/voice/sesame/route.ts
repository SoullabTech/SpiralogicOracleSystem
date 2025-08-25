// app/api/voice/sesame/route.ts
import { synthesizeToWav } from '@/lib/runpodSesame';

export const runtime = 'nodejs';
export const maxDuration = 300; // Allow up to 5 minutes for RunPod cold starts

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ ok: false, error: 'Missing text' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Check environment variables and fallback to beep if missing
    if (!process.env.RUNPOD_ENDPOINT_ID || !process.env.RUNPOD_API_KEY) {
      console.log('Missing RunPod env vars, falling back to beep');
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

    // RUNPOD: Maya voice enabled!
    console.log('Attempting RunPod synthesis for:', text.substring(0, 50));
    console.log('RunPod config:', {
      endpoint: process.env.RUNPOD_ENDPOINT_ID?.substring(0, 8) + '...',
      hasApiKey: !!process.env.RUNPOD_API_KEY
    });
    
    try {
      // Try sync first with longer timeout
      const wavBuffer = await synthesizeToWav(text, {
        endpointId: process.env.RUNPOD_ENDPOINT_ID!,
        apiKey: process.env.RUNPOD_API_KEY!,
        timeout: 45000, // Increased to 45 seconds
      });
      console.log('RunPod synthesis successful, audio size:', wavBuffer.byteLength);
      return new Response(wavBuffer, {
        status: 200,
        headers: {
          'content-type': 'audio/wav',
          'cache-control': 'no-store',
        }
      });
    } catch (syncError: any) {
      console.log('Sync synthesis failed, trying async method:', syncError.message);
      
      // Fallback to async method
      const { synthesizeToWavAsync } = await import('@/lib/runpodSesame');
      const wavBuffer = await synthesizeToWavAsync(text, {
        endpointId: process.env.RUNPOD_ENDPOINT_ID!,
        apiKey: process.env.RUNPOD_API_KEY!,
        timeout: 60000, // 1 minute for async
      });
      console.log('RunPod async synthesis successful, audio size:', wavBuffer.byteLength);
      return new Response(wavBuffer, {
        status: 200,
        headers: {
          'content-type': 'audio/wav',
          'cache-control': 'no-store',
        }
      });
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