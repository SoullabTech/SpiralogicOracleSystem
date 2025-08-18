// Audio status endpoint for TTS polling
import { NextRequest, NextResponse } from 'next/server';
import { getTTSResult, deleteTTSResult } from '../../../../../../lib/tts-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { turnId: string } }
) {
  try {
    const { turnId } = params;

    if (!turnId) {
      return NextResponse.json(
        { error: 'Turn ID is required' },
        { status: 400 }
      );
    }

    // Check if we have a result for this turn ID
    const result = getTTSResult(turnId);

    if (!result) {
      return NextResponse.json(
        { error: 'Turn not found or expired' },
        { status: 404 }
      );
    }

    // Return the current status
    const response: any = {
      turnId,
      status: result.status,
      timestamp: Date.now(),
    };

    if (result.status === 'ready' && result.audioUrl) {
      response.audioUrl = result.audioUrl;
      response.ready = true;
      
      // Mark as pending cleanup since it's been retrieved
      setTimeout(() => {
        deleteTTSResult(turnId);
        if (result.audioUrl && result.audioUrl !== 'web-speech-synthesis') {
          try {
            URL.revokeObjectURL(result.audioUrl);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }, 5 * 60 * 1000); // Clean up in 5 minutes
    } else if (result.status === 'failed') {
      response.error = result.error || 'TTS generation failed';
      response.ready = false;
    } else {
      response.ready = false;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Audio status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}