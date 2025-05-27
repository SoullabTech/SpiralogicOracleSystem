import { NextRequest, NextResponse } from 'next/server';
import { analyzeSentiment } from '@/lib/emotionEngine';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const emotion = await analyzeSentiment(prompt);
    return NextResponse.json({ emotion });
  } catch (err) {
    console.error('[Emotion API Error]', err);
    return new NextResponse('Emotion analysis failed', { status: 500 });
  }
}
