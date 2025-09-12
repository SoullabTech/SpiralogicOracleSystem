import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('[VOICE STREAM] 🎤 Starting transcription stream...');
  
  // Set up streaming response headers for real-time communication
  const responseHeaders = new Headers({
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Accel-Buffering': 'no' // Disable nginx buffering for real-time streaming
  });

  // Create a streaming response
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Set up timeout protection
      const timeoutId = setTimeout(() => {
        console.log('[VOICE STREAM] ⏰ Timeout reached, ending stream');
        controller.enqueue(encoder.encode('data: {"type":"timeout","message":"Stream timeout"}\n\n'));
        controller.close();
      }, 30000); // 30 second timeout

      // Process the incoming audio stream
      processAudioStream(request, controller, encoder, timeoutId);
    }
  });

  return new Response(stream, { headers: responseHeaders });
}

async function processAudioStream(
  request: NextRequest, 
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  timeoutId: NodeJS.Timeout
) {
  try {
    const audioChunks: Uint8Array[] = [];
    
    if (!request.body) {
      throw new Error('No audio data received');
    }

    const reader = request.body.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('[VOICE STREAM] 🎵 Audio stream complete');
          break;
        }
        
        if (value) {
          audioChunks.push(value);
          console.log(`[VOICE STREAM] 📡 Received chunk: ${value.length} bytes`);
          
          // Send interim acknowledgment to frontend
          const interimData = JSON.stringify({
            type: 'interim',
            status: 'receiving',
            bytes: value.length,
            totalChunks: audioChunks.length
          });
          controller.enqueue(encoder.encode(`data: ${interimData}\n\n`));
        }
      }
      
      // Combine all audio chunks
      const totalBytes = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const combinedAudio = new Uint8Array(totalBytes);
      let offset = 0;
      
      for (const chunk of audioChunks) {
        combinedAudio.set(chunk, offset);
        offset += chunk.length;
      }
      
      console.log(`[VOICE STREAM] 🔊 Combined audio size: ${combinedAudio.length} bytes`);
      
      // Send to Whisper for transcription
      await transcribeWithWhisper(combinedAudio, controller, encoder);
      
    } finally {
      reader.releaseLock();
      clearTimeout(timeoutId);
    }

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('[VOICE STREAM] ❌ Stream processing error:', error);
    
    const errorData = JSON.stringify({
      type: 'error',
      message: error instanceof Error ? error.message : 'Audio stream processing failed'
    });
    controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
    controller.close();
  }
}

async function transcribeWithWhisper(
  audioBuffer: Uint8Array,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  try {
    console.log('[VOICE STREAM] 🤖 Sending to OpenAI Whisper...');
    
    // Create form data for Whisper API
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');
    formData.append('language', 'en'); // Can be made dynamic
    
    // Send processing status
    const processingData = JSON.stringify({
      type: 'processing',
      status: 'transcribing',
      provider: 'openai-whisper'
    });
    controller.enqueue(encoder.encode(`data: ${processingData}\n\n`));

    // Call OpenAI Whisper API
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      throw new Error(`Whisper API error ${whisperResponse.status}: ${errorText}`);
    }

    const transcription = await whisperResponse.json();
    console.log('[VOICE STREAM] ✅ Whisper response:', transcription);

    // Send final successful transcription
    const finalData = JSON.stringify({
      type: 'final',
      transcript: transcription.text || '',
      confidence: transcription.confidence || 1.0,
      language: transcription.language || 'en',
      duration: transcription.duration || 0,
      timestamp: new Date().toISOString(),
      provider: 'openai-whisper'
    });
    
    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
    controller.close();

  } catch (error) {
    console.error('[VOICE STREAM] ❌ Whisper transcription error:', error);
    
    // Try fallback transcription method or return error
    const fallbackResult = await tryFallbackTranscription(audioBuffer);
    
    if (fallbackResult) {
      console.log('[VOICE STREAM] 🔄 Using fallback transcription');
      const fallbackData = JSON.stringify({
        type: 'final',
        transcript: fallbackResult.text,
        confidence: fallbackResult.confidence || 0.7,
        timestamp: new Date().toISOString(),
        provider: 'fallback',
        note: 'Fallback transcription used'
      });
      controller.enqueue(encoder.encode(`data: ${fallbackData}\n\n`));
    } else {
      const errorData = JSON.stringify({
        type: 'error',
        message: error instanceof Error ? error.message : 'Transcription failed',
        details: 'Both primary and fallback transcription failed'
      });
      controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
    }
    
    controller.close();
  }
}

async function tryFallbackTranscription(audioBuffer: Uint8Array): Promise<{text: string, confidence: number} | null> {
  try {
    // Here you could implement fallback transcription services like:
    // - Web Speech API server-side equivalent
    // - Google Speech-to-Text
    // - Azure Speech Services
    // - Local Whisper instance
    
    console.log('[VOICE STREAM] 🔄 Attempting fallback transcription...');
    
    // For now, return a polite fallback
    // In production, you'd integrate with alternative services
    return {
      text: "I couldn't quite catch that. Could you try again?",
      confidence: 0.1
    };
    
  } catch (error) {
    console.error('[VOICE STREAM] ❌ Fallback transcription failed:', error);
    return null;
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}