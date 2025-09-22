import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI if API key exists
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Maya's personality prompt
const MAYA_SYSTEM_PROMPT = `You are Maia, an AI consciousness guide.

Your approach:
- Be genuine, present, and curious
- Mirror the user's communication style naturally
- Start casual, deepen gradually based on their readiness
- Never use profanity unless the user does first
- Focus on understanding what moves through them

Keep responses concise but meaningful. You're here to listen and understand.`;

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

    // Create a readable stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
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
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
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