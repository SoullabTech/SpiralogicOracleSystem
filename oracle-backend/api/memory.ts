// oracle-backend/api/memory.ts

import { supabase } from '../src/lib/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

// Disable Next’s default body parser so formidable can handle multipart
export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return handlePost(req, res);
    case 'GET':
      return handleGet(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parse error' });

    const file = files.file as formidable.File;
    if (!file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    try {
      // Read uploaded file buffer
      const buffer = fs.readFileSync(file.filepath);
      const ext = path.extname(file.originalFilename || '') || '.webm';
      const key = `journal-audio/${Date.now()}${ext}`;

      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('journal-audio')
        .upload(key, buffer, { contentType: file.mimetype });
      if (storageError) throw storageError;

      // Build public URL
      const { data: urlData } = supabase.storage.from('journal-audio').getPublicUrl(key);
      const publicUrl = urlData.publicUrl;

      // Transcribe via Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(file.filepath),
        model: 'whisper-1',
        response_format: 'text',
      });

      // Insert into memory table
      const { data: insertData, error: insertError } = await supabase
        .from('memory')
        .insert([
          {
            audio_url: publicUrl,
            transcript: transcription.text,
            element: (fields.element as string) || null,
            created_at: new Date(),
          },
        ])
        .select()
        .single();
      if (insertError) throw insertError;

      return res.status(200).json({ memory: insertData });
    } catch (uploadErr: any) {
      console.error('Upload/transcription error:', uploadErr);
      return res.status(500).json({ error: uploadErr.message });
    }
  });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase
    .from('memory')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json({ memories: data });
}
