// lib/runpodSesame.ts
export interface RunPodSesameConfig {
  endpointId: string;
  apiKey: string;
  timeout?: number;
}

export interface SynthesisRequest {
  text: string;
  voice?: string;
  speed?: number;
  temperature?: number;
}

export interface RunPodResponse {
  id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  output?: {
    audio_url?: string;
    audio_base64?: string;
  };
  error?: string;
}

export async function synthesizeToWav(
  text: string, 
  config: RunPodSesameConfig
): Promise<ArrayBuffer> {
  const { endpointId, apiKey, timeout = 60000 } = config;
  
  if (!text?.trim()) {
    throw new Error('Text is required for synthesis');
  }
  
  if (!endpointId || !apiKey) {
    throw new Error('RunPod endpoint ID and API key are required');
  }

  const runUrl = `https://api.runpod.ai/v2/${endpointId}/runsync`;
  
  try {
    // RunPod sync request
    const response = await fetch(runUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          text: text.trim(),
          voice: 'maya', // or configurable
          format: 'wav',
          sample_rate: 16000,
        }
      }),
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`RunPod API error ${response.status}: ${errorText}`);
    }

    const result: RunPodResponse = await response.json();
    
    if (result.status === 'FAILED') {
      throw new Error(`RunPod synthesis failed: ${result.error || 'Unknown error'}`);
    }
    
    if (result.status !== 'COMPLETED' || !result.output) {
      throw new Error(`RunPod synthesis incomplete. Status: ${result.status}`);
    }

    // Handle audio response (URL or base64)
    if (result.output.audio_url) {
      const audioResponse = await fetch(result.output.audio_url);
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio from URL: ${audioResponse.status}`);
      }
      return await audioResponse.arrayBuffer();
    }
    
    if (result.output.audio_base64) {
      const binaryString = atob(result.output.audio_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
    
    throw new Error('No audio data in RunPod response');
    
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      throw new Error(`RunPod request timed out after ${timeout}ms`);
    }
    if (error.name === 'AbortError') {
      throw new Error('RunPod request was aborted');
    }
    throw error;
  }
}

// Alternative async method for longer synthesis
export async function synthesizeToWavAsync(
  text: string, 
  config: RunPodSesameConfig
): Promise<ArrayBuffer> {
  const { endpointId, apiKey, timeout = 120000 } = config;
  
  const runUrl = `https://api.runpod.ai/v2/${endpointId}/run`;
  const statusUrl = `https://api.runpod.ai/v2/${endpointId}/status`;

  try {
    // Start async job
    const runResponse = await fetch(runUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          text: text.trim(),
          voice: 'maya',
          format: 'wav',
          sample_rate: 16000,
        }
      }),
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      throw new Error(`RunPod run API error ${runResponse.status}: ${errorText}`);
    }

    const runResult = await runResponse.json();
    const jobId = runResult.id;

    // Poll for completion
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const statusResponse = await fetch(`${statusUrl}/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!statusResponse.ok) {
        throw new Error(`RunPod status API error: ${statusResponse.status}`);
      }

      const statusResult: RunPodResponse = await statusResponse.json();

      if (statusResult.status === 'COMPLETED' && statusResult.output) {
        // Process completed result same as sync
        if (statusResult.output.audio_url) {
          const audioResponse = await fetch(statusResult.output.audio_url);
          if (!audioResponse.ok) {
            throw new Error(`Failed to fetch audio: ${audioResponse.status}`);
          }
          return await audioResponse.arrayBuffer();
        }
        
        if (statusResult.output.audio_base64) {
          const binaryString = atob(statusResult.output.audio_base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes.buffer;
        }
        
        throw new Error('No audio data in completed RunPod job');
      }
      
      if (statusResult.status === 'FAILED') {
        throw new Error(`RunPod job failed: ${statusResult.error || 'Unknown error'}`);
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`RunPod job timed out after ${timeout}ms`);
    
  } catch (error: any) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error(`RunPod async request failed: ${error.message}`);
    }
    throw error;
  }
}