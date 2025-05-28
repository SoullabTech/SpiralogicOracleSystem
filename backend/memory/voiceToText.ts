// /oracle-backend/memory/voiceToText.ts
import { createReadStream } from 'fs';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function transcribeAudio(filePath: string) {
  const transcription = await openai.audio.transcriptions.create({
    file: createReadStream(filePath),
    model: 'whisper-1',
  });
  return transcription.text;
}