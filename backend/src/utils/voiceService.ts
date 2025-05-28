// src/utils/voiceService.ts

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_VOICE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

export async function synthesizeVoice({
  text,
  voiceId,
}: {
  text: string;
  voiceId: string;
}): Promise<string> {
  try {
    const response = await axios.post(
      `${ELEVENLABS_VOICE_URL}/${voiceId}`,
      {
        text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      }
    );

    const buffer = Buffer.from(response.data, 'binary');
    const filename = `${uuidv4()}.mp3`;
    const outputPath = path.resolve(__dirname, '../../public/audio', filename);

    fs.writeFileSync(outputPath, buffer);
    return `/audio/${filename}`;
  } catch (err) {
    console.error('[VoiceService] Synthesis error:', err);
    throw new Error('Failed to synthesize voice');
  }
}
