import { NextRequest, NextResponse } from 'next/server';
import { buildRecap } from '@/lib/shared/reflectionSpeech';
import { withTraceNext } from '../_middleware/traceNext';
import { bucketize } from '@/lib/recap/map';

// Privacy helper: redact potentially sensitive content
function redactSensitiveContent(text: string): string {
  // Remove potential PII patterns
  const sensitivePatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
    /\b\d{3}-\d{3}-\d{4}\b/g, // Phone
    /\b[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}\b/g, // Credit card
  ];
  
  let redacted = text;
  sensitivePatterns.forEach(pattern => {
    redacted = redacted.replace(pattern, '[REDACTED]');
  });
  
  return redacted;
}

async function postHandler(request: NextRequest) {
  try {
    const { conversationId, userId, turnCount } = await request.json();
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Import Soul Memory client for API-based access
    const { SoulMemoryClient } = await import('@/lib/shared/memory/soulMemoryClient');
    
    // Get recent memories for this conversation via API
    await SoulMemoryClient.initializeUserMemory(userId || 'anonymous');
    const recentMemories = await SoulMemoryClient.retrieveConversationMemories(
      userId || 'anonymous', 
      conversationId || '', 
      { limit: 5, filterSensitive: true }
    );
    
    // Create redacted snippets from filtered memories
    const conversationMemories = recentMemories
      .map(memory => ({
        content: redactSensitiveContent(memory.content), // Redact but keep full content for quote extraction
        element: memory.element || 'aether',
        timestamp: memory.createdAt,
      }))
      .slice(-3); // Last 3

    if (conversationMemories.length === 0) {
      return NextResponse.json(
        { error: 'No memories found for weaving' },
        { status: 404 }
      );
    }

    // Extract a meaningful user quote (first significant phrase)
    const userQuote = extractMeaningfulQuote(conversationMemories[0]?.content || '');
    
    // Generate thread weaving using the buildRecap utility
    const weavedText = buildRecap(userQuote, turnCount || 3);
    
    if (!weavedText) {
      return NextResponse.json(
        { error: 'Unable to weave thread at this time' },
        { status: 400 }
      );
    }

    // Generate elemental buckets from the weaved text
    const buckets = bucketize(String(weavedText ?? ''));

    // Store the synthesis as a Soul Memory "thread_weave" entry
    const weavedMemory = await SoulMemoryClient.storeBookmark({
      userId: userId || 'anonymous',
      content: weavedText,
      context: {
        sessionId: conversationId,
        conversationId: conversationId,
        memoryType: 'thread_weave',
        weavedFromCount: conversationMemories.length,
        timestamp: new Date().toISOString(),
        userQuote: userQuote,
      }
    });

    // Prepare Maya's post-recap voice cue
    const mayaPostRecapCue = {
      shouldSpeak: true,
      text: "I've prepared a short synthesis of your recent journey. Would you like me to read the highlights or save them to your journal?",
      context: 'post_recap'
    };

    return NextResponse.json({
      text: weavedText,
      userQuote: userQuote,
      buckets, // { themes, emotions, steps, ideas, energy }
      saved: true,
      soulMemoryId: weavedMemory.id,
      weavedFromCount: conversationMemories.length,
      maya_voice_cue: mayaPostRecapCue
    });

  } catch (error) {
    console.error('Thread weaving error:', error);
    return NextResponse.json(
      { error: 'Failed to weave thread' },
      { status: 500 }
    );
  }
}

export const POST = withTraceNext('oracle/weave', postHandler);

// Extract a meaningful quote from user content (5-15 words)
function extractMeaningfulQuote(text: string): string {
  if (!text || text.length < 10) return '';
  
  // Remove common sentence starters
  const cleanText = text
    .replace(/^(I\s+)/, '')
    .replace(/^(Today\s+)/, '')
    .replace(/^(Yesterday\s+)/, '')
    .trim();
  
  // Find meaningful phrases (avoid too short or too long)
  const sentences = cleanText.split(/[.!?]+/);
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    if (words.length >= 3 && words.length <= 15) {
      // Look for descriptive content
      const meaningfulWords = words.filter(word => 
        word.length > 3 && 
        !['this', 'that', 'they', 'them', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word.toLowerCase())
      );
      
      if (meaningfulWords.length >= 2) {
        return sentence.trim();
      }
    }
  }
  
  // Fallback: take first 8 words
  const words = cleanText.split(/\s+/).slice(0, 8);
  return words.join(' ');
}