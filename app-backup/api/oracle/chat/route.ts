import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Simple, lean oracle chat endpoint - replaces complex microservices
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId, query } = await request.json();
    
    if (!sessionId || !query) {
      return NextResponse.json({ error: 'Missing sessionId or query' }, { status: 400 });
    }

    // Simple oracle response generation
    const oracleResponse = await generateOracleWisdom(query);
    
    // Generate voice (simple OpenAI TTS)
    const audioResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova', // Maya-like voice
      input: oracleResponse,
    });

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    const audioBase64 = audioBuffer.toString('base64');

    // Store in Supabase (simple)
    // await storeConversation(sessionId, query, oracleResponse);

    return NextResponse.json({
      text: oracleResponse,
      audio: audioBase64
    });

  } catch (error) {
    console.error('Oracle chat error:', error);
    return NextResponse.json({ error: 'Oracle processing failed' }, { status: 500 });
  }
}

async function generateOracleWisdom(query: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are AĨÑ, a mystical oracle. Respond with wisdom in 1-2 sentences, mystical but grounded. Begin responses with "✨"'
        },
        {
          role: 'user', 
          content: query
        }
      ],
      max_tokens: 100
    });

    return completion.choices[0]?.message?.content || '✨ The oracle is silent. Ask again with deeper intention.';
  } catch (error) {
    return '✨ The cosmic winds are shifting. Your answer awaits in the next moment.';
  }
}