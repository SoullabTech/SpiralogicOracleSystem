// API endpoint for Master Oracle Orchestrator - Sophisticated archetypal routing
// Integrates AIN/MAYA/Anamnesis frameworks with voice system

import { NextApiRequest, NextApiResponse } from 'next';
import { masterOracleOrchestrator } from '../../../apps/api/backend/src/services/MasterOracleOrchestrator';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OracleApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    const { message, userId, sessionId, options }: OracleRequest = req.body;

    // Validate required fields
    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: message and userId are required'
      });
    }

    // Validate message length
    if (message.length > 4000) {
      return res.status(400).json({
        success: false,
        error: 'Message too long. Maximum 4000 characters.'
      });
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

    res.status(isClientError ? 400 : 500).json({
      success: false,
      error: isClientError
        ? error.message
        : 'Internal server error processing your request. Please try again.'
    });
  }
}

// Export the handler for use in other contexts
export { handler };