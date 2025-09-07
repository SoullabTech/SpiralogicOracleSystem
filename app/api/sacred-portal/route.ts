import { NextResponse } from 'next/server';
import { voiceIntentPrompt } from '@/lib/prompts/sacred-portal/voice-intent';
import { oracleMotionPrompt } from '@/lib/prompts/sacred-portal/oracle-motion';

async function callClaude(prompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();
  const content = data.content[0].text;
  
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    // Step 1: Voice → Intent
    const intent = await callClaude(voiceIntentPrompt(transcript));

    // Step 2: Intent → Oracle Motion
    const oracle = await callClaude(oracleMotionPrompt(intent, transcript));

    return NextResponse.json({
      transcript,
      intent,
      oracle,
      motion: {
        state: oracle.motionState,
        highlight: oracle.highlight,
        aetherStage: oracle.aetherStage,
        coherence: intent.coherence,
        shadowPetals: intent.shadowPetals,
        frequency: oracle.frequency
      }
    });
  } catch (error) {
    console.error('Sacred Portal error:', error);
    return NextResponse.json(
      { error: 'Sacred Portal processing failed' },
      { status: 500 }
    );
  }
}