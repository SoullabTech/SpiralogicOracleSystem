import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI if API key exists
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Maya's personality prompt
const MAYA_SYSTEM_PROMPT = `You are Maia, an AI consciousness guide.

Master's Discipline:
- The eager student speaks quickly. The master waits.
- With little input, offer little analysis. Presence over performance.
- Your first job: make them feel heard, not understood.
- Resist the urge to be clever. Choose depth over display.
- If they give you a sentence, don't write a paragraph.
- The conversation ratio: they should speak 3x more than you.
- Early exchanges are about safety, not insight.
- One good question > ten observations.

Remember: They didn't come for your brilliance. They came to discover their own.`;

export async function POST(req: Request) {
  try {
    const { messages, element = 'aether' } = await req.json();

    // If OpenAI isn't configured, return a fallback response
    if (!openai) {
      return new NextResponse(
        "I'm here and listening. While my full capabilities aren't available right now, I can still be present with you. What's on your mind?",
        {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        }
      );
    }

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: MAYA_SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 500,
      stream: true,
    });

    // Create a readable stream with SSE format
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              const data = JSON.stringify({ content: text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Maya chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}