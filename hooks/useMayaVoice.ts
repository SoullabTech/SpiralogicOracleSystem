import { useState, useCallback, useEffect, useRef } from 'react';
import { getMayaVoice, MayaVoiceSystem } from '@/lib/voice/maya-voice';

interface VoiceState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentText: string;
  voiceType: 'elevenlabs' | 'webspeech' | 'sesame';
  error?: string;
}

export function useMayaVoice() {
  const mayaVoiceRef = useRef<MayaVoiceSystem | null>(null);
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
      mayaVoiceRef.current = getMayaVoice({
        elevenLabsApiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
        sesameApiKey: process.env.NEXT_PUBLIC_SESAME_API_KEY,
        fallbackToWebSpeech: true
      });

      // Subscribe to voice state changes
      const unsubscribe = mayaVoiceRef.current.subscribe(setVoiceState);
      
      // Check capabilities
      const capabilities = mayaVoiceRef.current.getCapabilities();
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
    if (!mayaVoiceRef.current || !isReady) return;

    try {
      await mayaVoiceRef.current.speak(text, context);
    } catch (error) {
      console.error('Maya speak failed:', error);
    }
  }, [isReady]);

  const playGreeting = useCallback(async (): Promise<void> => {
    if (!mayaVoiceRef.current || !isReady) return;

    try {
      await mayaVoiceRef.current.playGreeting();
    } catch (error) {
      console.error('Maya greeting failed:', error);
    }
  }, [isReady]);

  const pause = useCallback(() => {
    if (mayaVoiceRef.current) {
      mayaVoiceRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (mayaVoiceRef.current) {
      mayaVoiceRef.current.resume();
    }
  }, []);

  const stop = useCallback(() => {
    if (mayaVoiceRef.current) {
      mayaVoiceRef.current.stop();
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