// pages/api/elevenlabs/whisper.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voiceId } = req.body;

  if (!text || !voiceId) {
    return res.status(400).json({ error: 'Missing text or voiceId' });
  }

  try {
    const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!elevenResponse.ok) {
      const error = await elevenResponse.text();
      return res.status(500).json({ error: `ElevenLabs error: ${error}` });
    }

    const audioBuffer = await elevenResponse.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Whisper error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
