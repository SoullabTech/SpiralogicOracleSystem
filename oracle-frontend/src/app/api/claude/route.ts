// 📡 Claude API Proxy Route
// SSR-safe Claude API integration with rate limiting

import { NextRequest, NextResponse } from 'next/server';

interface ClaudeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ClaudeRequest {
  messages: ClaudeMessage[];
  max_tokens?: number;
  temperature?: number;
  system?: string;
}

// Rate limiting storage (in production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_IP = 30;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || { count: 0, resetTime: now };

  // Reset if window has passed
  if (now - userRequests.resetTime > RATE_LIMIT_WINDOW) {
    userRequests.count = 0;
    userRequests.resetTime = now;
  }

  if (userRequests.count >= MAX_REQUESTS_PER_IP) {
    return false;
  }

  userRequests.count++;
  requestCounts.set(ip, userRequests);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: ClaudeRequest = await request.json();
    
    // Validate request structure
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Build Claude API request
    const claudeRequest = {
      model: 'claude-3-sonnet-20240229',
      max_tokens: Math.min(body.max_tokens || 1000, 4000),
      temperature: Math.max(0, Math.min(body.temperature || 0.7, 1)),
      messages: body.messages.filter(msg => msg.role !== 'system'),
      system: body.messages.find(msg => msg.role === 'system')?.content || undefined
    };

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(claudeRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', response.status, errorText);
      
      // Return appropriate error based on status
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Claude API rate limit exceeded' },
          { status: 429 }
        );
      } else if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { error: 'Claude API unavailable' },
          { status: 503 }
        );
      }
    }

    const claudeResponse = await response.json();
    
    // Extract content from Claude's response format
    const content = claudeResponse.content?.[0]?.text || '';
    
    // Parse for additional metadata (symbols, protocols, etc.)
    const symbols_detected = extractSymbols(content);
    const emotional_tone = detectEmotionalTone(content);
    const suggested_protocols = extractProtocols(content);

    return NextResponse.json({
      content,
      confidence: 0.9,
      symbols_detected,
      emotional_tone,
      suggested_protocols,
      usage: claudeResponse.usage
    });

  } catch (error) {
    console.error('Claude API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extract symbolic references from Claude's response
 */
function extractSymbols(content: string): string[] {
  const symbolKeywords = [
    'water', 'fire', 'earth', 'air', 'tree', 'mountain', 'ocean', 'sky',
    'snake', 'bird', 'wolf', 'bear', 'dragon', 'phoenix', 'moon', 'sun',
    'star', 'circle', 'spiral', 'bridge', 'door', 'key', 'mirror', 'seed'
  ];
  
  const lowerContent = content.toLowerCase();
  return symbolKeywords.filter(symbol => 
    lowerContent.includes(symbol)
  );
}

/**
 * Detect emotional tone from Claude's response
 */
function detectEmotionalTone(content: string): string {
  const toneIndicators = {
    supportive: ['support', 'encourage', 'gentle', 'care', 'nurture'],
    empowering: ['strength', 'power', 'capable', 'confident', 'strong'],
    reflective: ['consider', 'reflect', 'contemplate', 'explore', 'examine'],
    calming: ['peace', 'calm', 'serene', 'tranquil', 'still'],
    energizing: ['energy', 'vibrant', 'dynamic', 'active', 'movement']
  };

  const lowerContent = content.toLowerCase();
  
  for (const [tone, indicators] of Object.entries(toneIndicators)) {
    if (indicators.some(indicator => lowerContent.includes(indicator))) {
      return tone;
    }
  }
  
  return 'neutral';
}

/**
 * Extract protocol suggestions from Claude's response
 */
function extractProtocols(content: string): string[] {
  const protocolKeywords = [
    'journaling', 'meditation', 'breathwork', 'reflection', 'visualization',
    'movement', 'grounding', 'integration', 'dialogue', 'mapping'
  ];
  
  const lowerContent = content.toLowerCase();
  return protocolKeywords.filter(protocol => 
    lowerContent.includes(protocol)
  );
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}