import { NextRequest, NextResponse } from 'next/server';
import { getClaudeService } from '@/lib/services/ClaudeService';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    // 1. Get intelligent response from Claude
    const claudeService = getClaudeService();
    const claudeResponse = await claudeService.generateChatResponse(message, {
      element: 'aether',
      userState: {
        mood: 'curious',
        trustLevel: 50,
        currentPhase: 'discovering'
      }
    });
    
    // 2. Generate voice with Sesame
    let voiceUrl = null;
    let voiceError = null;
    
    try {
      const sesameResponse = await fetch('http://localhost:8000/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: claudeResponse,
          voice: 'maya',
          element: 'aether'
        })
      });
      
      if (sesameResponse.ok) {
        const voiceData = await sesameResponse.json();
        // Sesame returns base64 audio in the 'audio' field
        if (voiceData.audio) {
          voiceUrl = `data:audio/mp3;base64,${voiceData.audio}`;
        } else {
          voiceUrl = voiceData.audio_url || voiceData.url;
        }
      } else {
        voiceError = `Sesame returned ${sesameResponse.status}`;
      }
    } catch (error: any) {
      voiceError = error.message;
    }
    
    return NextResponse.json({ 
      success: true,
      response: claudeResponse,
      voiceUrl,
      voiceError,
      services: {
        intelligence: 'Claude AI (Maia)',
        voice: voiceUrl ? 'Sesame CSM' : 'Failed'
      }
    });
  } catch (error: any) {
    console.error('Integration test error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message
    }, { status: 500 });
  }
}