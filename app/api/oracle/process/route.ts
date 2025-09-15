// API endpoint for Master Oracle Orchestrator - Sophisticated archetypal routing
// Integrates AIN/MAYA/Anamnesis frameworks with voice system

import { NextRequest, NextResponse } from 'next/server';
import { masterOracleOrchestrator } from '../../../../apps/api/backend/src/services/MasterOracleOrchestrator';

interface OracleRequest {
  message: string;
  userId: string;
  sessionId?: string;
  options?: {
    voiceInput?: boolean;
    contextHints?: string[];
    attachments?: any[];
  };
}

interface OracleApiResponse {
  success: boolean;
  response?: {
    content: string;
    agentUsed: string;
    supportingAgents: string[];
    responseStyle: {
      approach: string;
      tone: string;
      depth: string;
      pacing: string;
    };
    archetypalEnergies: {
      primary: string;
      secondary?: string;
      essence: string;
    };
    followUpSuggestions: string[];
    confidence: number;
    analysis: any;
  };
  error?: string;
  insights?: {
    sessionAlignment: any;
    archetypalAlignment: any;
    therapeuticPhase: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, sessionId, options }: OracleRequest = body;

    // Validate required fields
    if (!message || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: message and userId are required'
      }, { status: 400 });
    }

    // Validate message length
    if (message.length > 4000) {
      return NextResponse.json({
        success: false,
        error: 'Message too long. Maximum 4000 characters.'
      }, { status: 400 });
    }

    // Process message through Master Oracle Orchestrator
    const oracleResponse = await masterOracleOrchestrator.processUserMessage(
      message,
      userId,
      sessionId || 'default',
      options || {}
    );

    // Get session insights for additional context
    const sessionInsights = masterOracleOrchestrator.getSessionInsights(userId, sessionId);

    // Return successful response
    res.status(200).json({
      success: true,
      response: {
        content: oracleResponse.content,
        agentUsed: oracleResponse.agentUsed,
        supportingAgents: oracleResponse.supportingAgents,
        responseStyle: oracleResponse.responseStyle,
        archetypalEnergies: oracleResponse.archetypalEnergies,
        followUpSuggestions: oracleResponse.followUpSuggestions,
        confidence: oracleResponse.confidence,
        analysis: {
          emotionalTone: oracleResponse.analysis.emotionalTone.primary,
          requestType: oracleResponse.analysis.requestType.category,
          urgencyLevel: oracleResponse.analysis.urgencyLevel,
          topicDomain: oracleResponse.analysis.topicCategory.domain,
          archetypeAlignment: oracleResponse.analysis.archetypeAlignment
        }
      },
      insights: sessionInsights ? {
        sessionAlignment: sessionInsights.archetypalAlignment,
        archetypalAlignment: sessionInsights.archetypalAlignment,
        therapeuticPhase: sessionInsights.therapeuticPhase
      } : undefined
    });

  } catch (error) {
    console.error('Oracle processing error:', error);

    // Determine if it's a client error or server error
    const isClientError = error.message.includes('validation') || error.message.includes('required');

    return NextResponse.json({
      success: false,
      error: isClientError
        ? error.message
        : 'Internal server error processing your request. Please try again.'
    }, { status: isClientError ? 400 : 500 });
  }
}