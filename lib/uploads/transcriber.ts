import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranscriptionResult {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  language?: string;
  duration?: number;
}

export async function transcribeAudio(fileUrl: string, options: {
  language?: string;
  provider?: 'openai' | 'whisper_local';
} = {}): Promise<TranscriptionResult> {
  const provider = options.provider || process.env.TRANSCRIBE_PROVIDER || 'openai';
  
  switch (provider) {
    case 'openai':
      return transcribeWithOpenAI(fileUrl, options.language);
    case 'whisper_local':
      return transcribeWithLocalWhisper(fileUrl, options.language);
    default:
      throw new Error(`Unsupported transcription provider: ${provider}`);
  }
}

async function transcribeWithOpenAI(fileUrl: string, language?: string): Promise<TranscriptionResult> {
  try {
    // Download the file from the signed URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const file = new File([arrayBuffer], 'audio.mp3', { type: 'audio/mpeg' });
    
    // Transcribe with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: language || process.env.TRANSCRIBE_LANG || 'en',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    });
    
    return {
      text: transcription.text,
      segments: transcription.segments?.map(segment => ({
        start: segment.start,
        end: segment.end,
        text: segment.text
      })),
      language: transcription.language,
      duration: transcription.duration
    };
  } catch (error) {
    console.error('OpenAI transcription failed:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function transcribeWithLocalWhisper(fileUrl: string, language?: string): Promise<TranscriptionResult> {
  // Placeholder for local Whisper implementation
  // This would use a local Python script or subprocess
  throw new Error('Local Whisper transcription not implemented yet');
}

export async function summarizeText(text: string, options: {
  maxLength?: number;
  style?: 'bullet' | 'paragraph';
} = {}): Promise<string> {
  const maxLength = options.maxLength || 200;
  const style = options.style || 'paragraph';
  
  try {
    const prompt = style === 'bullet' 
      ? `Summarize this text in 3-5 bullet points:\n\n${text}`
      : `Summarize this text in ${maxLength} characters or less:\n\n${text}`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise, accurate summaries. Focus on key insights and main points.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.3
    });
    
    return completion.choices[0]?.message?.content || 'Summary generation failed';
  } catch (error) {
    console.warn('Text summarization failed:', error);
    // Fallback to simple truncation
    return text.length > maxLength 
      ? text.substring(0, maxLength - 3) + '...'
      : text;
  }
}

export function extractTextFromPDF(fileUrl: string): Promise<string> {
  // Placeholder for PDF text extraction
  // Would use pdf-parse or similar library
  throw new Error('PDF text extraction not implemented yet');
}

export function validateFileType(mimeType: string): boolean {
  const allowedTypes = (process.env.ALLOWED_MIME_TYPES || '').split(',');
  return allowedTypes.includes(mimeType);
}

export function isAudioFile(mimeType: string): boolean {
  return mimeType.startsWith('audio/') || mimeType.startsWith('video/');
}

export function isTextFile(mimeType: string): boolean {
  return mimeType.startsWith('text/') || mimeType === 'application/pdf';
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}