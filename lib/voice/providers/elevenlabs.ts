// lib/voice/providers/elevenlabs.ts
export async function elevenlabsTTS(opts: { text: string; voiceId: string }): Promise<Blob> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY missing');

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${opts.voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: opts.text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.5, similarity_boost: 0.8 },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs TTS failed: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return new Blob([arrayBuffer], { type: 'audio/mpeg' });
}