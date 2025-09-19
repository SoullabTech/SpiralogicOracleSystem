import { useState, useCallback, useEffect, useRef } from 'react';
import { getMaiaVoice, MaiaVoiceSystem } from '@/lib/voice/maia-voice';
import { getAgentConfig } from '@/lib/agent-config';

interface VoiceState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentText: string;
  voiceType: 'elevenlabs' | 'webspeech' | 'sesame';
  error?: string;
}

export function useMaiaVoice() {
  const maiaVoiceRef = useRef<MaiaVoiceSystem | null>(null);
  const [agentConfig] = useState(() => getAgentConfig());
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentText: '',
    voiceType: 'webspeech'
  });
  
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize Maya Voice System
    try {
      maiaVoiceRef.current = getMaiaVoice({
        elevenLabsApiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
        sesameApiKey: process.env.NEXT_PUBLIC_SESAME_API_KEY,
        fallbackToWebSpeech: true,
        agentConfig // Pass agent configuration for voice selection
      });

      // Subscribe to voice state changes
      const unsubscribe = maiaVoiceRef.current.subscribe(setVoiceState);
      
      // Check capabilities
      const capabilities = maiaVoiceRef.current.getCapabilities();
      setIsSupported(capabilities.webSpeech || capabilities.elevenLabs || capabilities.sesame);
      setIsReady(true);

      return unsubscribe;
    } catch (error) {
      console.error('Failed to initialize Maya Voice:', error);
      setIsSupported(false);
      setIsReady(false);
    }
  }, []);

  const speak = useCallback(async (text: string, context?: any): Promise<void> => {
    if (!maiaVoiceRef.current || !isReady) return;

    try {
      await maiaVoiceRef.current.speak(text, context);
    } catch (error) {
      console.error('Maya speak failed:', error);
    }
  }, [isReady]);

  const playGreeting = useCallback(async (): Promise<void> => {
    if (!maiaVoiceRef.current || !isReady) return;

    try {
      await maiaVoiceRef.current.playGreeting();
    } catch (error) {
      console.error('Maya greeting failed:', error);
    }
  }, [isReady]);

  const pause = useCallback(() => {
    if (maiaVoiceRef.current) {
      maiaVoiceRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (maiaVoiceRef.current) {
      maiaVoiceRef.current.resume();
    }
  }, []);

  const stop = useCallback(() => {
    if (maiaVoiceRef.current) {
      maiaVoiceRef.current.stop();
    }
  }, []);

  return {
    speak,
    playGreeting,
    voiceState,
    isPlaying: voiceState.isPlaying,
    pause,
    resume,
    stop,
    autoSpeak,
    setAutoSpeak,
    isSupported,
    isReady
  };
}

export function useMayaGreeting() {
  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    const greetings = [
      "Hey there. Ready to explore what's on your mind?",
      "Hi. Let's see what we can discover together.",
      "Hello. What would be helpful to talk about?",
      "Hey. What's stirring for you today?"
    ];
    
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
  }, []);
  
  return greeting;
}