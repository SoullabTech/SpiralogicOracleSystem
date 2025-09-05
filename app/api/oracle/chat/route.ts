import { NextRequest, NextResponse } from 'next/server';
import { getDemoFileContext, formatDemoFileContext, hasUserFiles } from '@/lib/services/demoFiles';

// Enhanced Oracle Chat API with Sesame-Primary Voice
export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      oracle, 
      sessionId, 
      element, 
      enableVoice, 
      voiceEngine = 'auto',
      useCSM = true, 
      emotionalState,
      fallbackEnabled = false
    } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    // Get user session (in production, get from auth)
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const currentSessionId = sessionId || `session-${Date.now()}`;
    const threadId = request.headers.get('x-thread-id') || currentSessionId;

    // Proxy to backend Maya endpoint via internal proxy  
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';
    
    const response = await fetch(`${backendUrl}/api/v1/converse/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-session-id': currentSessionId,
        'x-thread-id': threadId
      },
      body: JSON.stringify({
        userText: message,
        element: element || 'aether',
        userId: userId,
        enableVoice: enableVoice || false,
        useCSM: useCSM,
        emotionalState: emotionalState,
        metadata: {
          oracle: oracle || 'Maya',
          sessionId: currentSessionId,
          threadId: threadId,
          personality: 'adaptive mystical guide',
          voiceProfile: 'maya_oracle_v1',
          voiceEngine: voiceEngine
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    const result = await response.json();

    // Handle voice generation with new Sesame-primary system
    let audioResponse = null;
    let voiceMetadata = null;
    
    if (enableVoice && result.response?.text) {
      try {
        console.log(`🎤 Generating voice with engine: ${voiceEngine}, fallback: ${fallbackEnabled}`);
        
        // Use new unified voice API
        const voiceUrl = process.env.NEXT_PUBLIC_APP_URL 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/unified`
          : `http://localhost:3000/api/voice/unified`;
        const voiceResponse = await fetch(voiceUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: result.response.text,
            element: result.response.element || element || 'aether',
            voiceEngine: voiceEngine,
            useCSM: useCSM,
            fallbackEnabled: fallbackEnabled,
            contextSegments: result.contextSegments,
            userId: userId,
            sessionId: currentSessionId
          })
        });
        
        if (voiceResponse.ok) {
          const voiceData = await voiceResponse.json();
          
          if (voiceData.success) {
            // Handle different response formats
            if (voiceData.audioData) {
              audioResponse = `data:audio/wav;base64,${voiceData.audioData}`;
            } else if (voiceData.audioUrl) {
              audioResponse = voiceData.audioUrl;
            }
            
            voiceMetadata = {
              engine: voiceData.engine,
              model: voiceData.model,
              processingTimeMs: voiceData.processingTimeMs,
              fallbackUsed: voiceData.fallbackUsed,
              metadata: voiceData.metadata
            };
            
            console.log(`🎤 Voice generated successfully via ${voiceData.engine}${voiceData.fallbackUsed ? ' (fallback)' : ''}`);
          } else {
            console.error(`🎤 Voice generation failed: ${voiceData.error}`);
            voiceMetadata = { 
              error: voiceData.error, 
              engine: voiceData.engine,
              fallbackUsed: voiceData.fallbackUsed 
            };
          }
        } else {
          const errorData = await voiceResponse.json();
          console.error('🎤 Voice API request failed:', errorData);
          voiceMetadata = { error: errorData.error };
        }
      } catch (voiceError) {
        console.error('🎤 Voice generation error:', voiceError);
        voiceMetadata = { error: voiceError instanceof Error ? voiceError.message : 'Voice generation failed' };
      }
    }

    // Extract citations from backend response and add demo file citations
    const backendCitations = result.fileResults || result.citations || [];
    let formattedCitations = backendCitations.map((citation: any) => ({
      fileName: citation.fileName || citation.file_name || 'Unknown File',
      pageNumber: citation.pageNumber || citation.page_number,
      sectionTitle: citation.sectionTitle || citation.section_title,
      snippet: citation.snippet || citation.content || '',
      totalPages: citation.totalPages || citation.total_pages,
      confidence: citation.confidence || citation.score || 0.8,
      uploadDate: citation.uploadDate || citation.upload_date
    }));

    // Add demo file citations if no user files available
    if (!hasUserFiles(userId)) {
      const demoFiles = getDemoFileContext(message, 2);
      const demoCitations = demoFiles.map(file => ({
        fileName: file.filename,
        pageNumber: file.pageNumber,
        sectionTitle: file.sectionTitle,
        snippet: file.preview,
        confidence: file.relevance || 0.8,
        uploadDate: 'Demo Content',
        category: file.category,
        isDemo: true
      }));
      formattedCitations = [...formattedCitations, ...demoCitations];
    }

    return NextResponse.json({
      message: result.response?.text || result.message,
      element: result.response?.element || result.element || 'aether',
      confidence: result.response?.confidence || 0.8,
      sessionId: currentSessionId,
      threadId: threadId,
      audioUrl: audioResponse,
      voiceMetadata: voiceMetadata,
      contextUsed: result.contextSegments?.length || 0,
      breakthroughDetected: result.breakthroughDetected,
      breakthroughMarkers: result.breakthroughMarkers,
      citations: formattedCitations, // ✨ Add citations array
      metadata: {
        source: result.response?.source || 'maya',
        processingTime: result.response?.processingTime || 0,
        model: result.response?.metadata?.model || 'maya-oracle',
        voiceEngine: voiceEngine,
        voiceGenerated: !!audioResponse,
        voiceMetadata: voiceMetadata,
        citationsCount: formattedCitations.length,
        ...result.response?.metadata
      }
    });

  } catch (error) {
    console.error('Oracle chat error:', error);
    
    // Maya's warm fallback response
    return NextResponse.json({
      message: "I'm having some technical difficulties connecting to my full system. I'm still here with you though - what's on your mind?",
      element: 'aether',
      confidence: 0.5,
      metadata: {
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        maya_mode: 'warmth_fallback'
      }
    });
  }
}

// Keep existing GET endpoint
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const sessionId = request.nextUrl.searchParams.get('sessionId') || `session-${Date.now()}`;

    // Proxy to backend health/status endpoint
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';
    
    const response = await fetch(`${backendUrl}/api/v1/converse/health`, {
      method: 'GET',
      headers: {
        'x-user-id': userId,
        'x-session-id': sessionId
      }
    });

    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }

    const healthData = await response.json();

    return NextResponse.json({
      summary: 'Oracle systems are online and ready to provide guidance.',
      sessionId,
      status: 'active',
      backend: healthData,
      oracle: 'Maya',
      capabilities: [
        'Streaming conversations',
        'Elemental guidance (Air, Fire, Water, Earth, Aether)',
        'Sesame-primary voice synthesis',
        'Memory integration',
        'Explicit fallback control'
      ]
    });

  } catch (error) {
    console.error('Oracle status error:', error);
    return NextResponse.json({ 
      error: 'Oracle systems temporarily offline',
      status: 'maintenance',
      message: 'Please try again in a few moments while we realign the cosmic frequencies.',
      sessionId: request.nextUrl.searchParams.get('sessionId') || `session-${Date.now()}`
    }, { status: 503 });
  }
}
