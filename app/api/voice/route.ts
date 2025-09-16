import { NextRequest, NextResponse } from 'next/server';
import { SesameVoiceService } from '@/lib/services/SesameVoiceService';

// Initialize voice service
const voiceService = new SesameVoiceService();

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      personality = 'maya',
      element,
      testMode = false
    } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Map personality to voice profile
    const profileMap = {
      'maya': 'maya-default',
      'anthony': 'anthony-default',
      'miles': 'miles-default',
      'aria': 'aria-default',
      'sage': 'sage-default',
      'luna': 'luna-default'
    };

    const profileId = profileMap[personality.toLowerCase()] || 'maya-default';
    const voiceProfile = voiceService.getVoiceProfile(profileId);

    if (!voiceProfile) {
      return NextResponse.json({
        error: 'Voice profile not found',
        personality,
        profileId
      }, { status: 404 });
    }

    // Generate speech
    const result = await voiceService.generateSpeech({
      text,
      voiceProfile,
      element
    });

    if (!result.audioData) {
      return NextResponse.json({
        error: 'No audio generated',
        metadata: result.metadata
      }, { status: 500 });
    }

    // Return audio data as response
    return new NextResponse(result.audioData, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'X-Voice-Profile': profileId,
        'X-Voice-Provider': result.metadata?.provider || 'openai'
      }
    });

  } catch (error: any) {
    console.error('Voice generation error:', error);
    return NextResponse.json({
      error: 'Voice generation failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  // Health check endpoint
  try {
    const health = await voiceService.healthCheck();
    const profiles = voiceService.getAllVoiceProfiles();

    return NextResponse.json({
      status: health ? 'healthy' : 'unhealthy',
      voiceProfiles: profiles.map(p => ({
        id: p.id,
        name: p.name,
        baseVoice: p.baseVoice
      })),
      provider: 'openai',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
}