export interface TTSPreferences {
  voice_id?: string;
  tts_enabled?: boolean;
  speech_rate?: number;
  speech_pitch?: number;
  voice_provider?: string;
}

export async function setupTTSForUser(
  userId: string,
  response: string,
  conversationId: string
): Promise<{ audioPending: boolean; turnId: string | null }> {
  try {
    const { getUserPreferences } = await import('./user-manager');
    const preferences = await getUserPreferences(userId);
    
    if (!preferences?.tts_enabled) {
      return { audioPending: false, turnId: null };
    }

    const turnId = `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Start TTS generation in background
    generateTTSInBackground(turnId, response, preferences).catch(error => {
      console.error('Background TTS generation failed:', error);
    });

    return { audioPending: true, turnId };
  } catch (error) {
    console.warn('TTS setup failed:', error);
    return { audioPending: false, turnId: null };
  }
}

export async function generateTTSInBackground(
  turnId: string,
  text: string,
  preferences: TTSPreferences
): Promise<void> {
  try {
    const { generateSpeech } = await import('@/lib/voice');
    const { storeTTSResult } = await import('@/lib/tts-storage');
    
    const audioBuffer = await generateSpeech(text, {
      voice: preferences.voice_id || 'default',
      rate: preferences.speech_rate || 1.0,
      pitch: preferences.speech_pitch || 1.0,
      provider: preferences.voice_provider || 'elevenlabs',
    });

    await storeTTSResult(turnId, audioBuffer);
  } catch (error) {
    console.error('TTS generation failed:', error);
    throw error;
  }
}