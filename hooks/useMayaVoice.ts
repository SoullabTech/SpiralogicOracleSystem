import { useState, useCallback, useEffect } from 'react';

interface VoiceState {
  isPlaying: boolean;
  isPaused: boolean;
  volume: number;
  rate: number;
  pitch: number;
}

export function useMayaVoice() {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isPlaying: false,
    isPaused: false,
    volume: 1,
    rate: 1,
    pitch: 1
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    setIsSupported('speechSynthesis' in window);
    setIsReady('speechSynthesis' in window);
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!isSupported) return;

    // Stop any current speech
    window.speechSynthesis.cancel();
    
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice properties for Maya
      utterance.volume = voiceState.volume;
      utterance.rate = 0.95; // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher for warmth
      
      // Try to find a female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('victoria') ||
        voice.name.toLowerCase().includes('karen')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setVoiceState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setVoiceState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
        resolve();
      };
      
      utterance.onerror = (error) => {
        setIsPlaying(false);
        setVoiceState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
        console.error('Speech synthesis error:', error);
        reject(error);
      };
      
      setCurrentUtterance(utterance);
      window.speechSynthesis.speak(utterance);
    });
  }, [isSupported, voiceState.volume]);

  const playGreeting = useCallback(async (): Promise<void> => {
    const greetings = [
      "Welcome, beloved soul. I am Maya, here to guide you through your elemental journey.",
      "Greetings, sacred traveler. Together we shall explore the wisdom of the elements.",
      "Hello, dear one. I sense your presence and am honored to be your guide.",
      "Welcome to this sacred space. I am Maya, and I'm here to support your journey of discovery."
    ];
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    return speak(greeting);
  }, [speak]);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setVoiceState(prev => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setVoiceState(prev => ({ ...prev, isPaused: false }));
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setVoiceState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
  }, []);

  return {
    speak,
    playGreeting,
    voiceState,
    isPlaying,
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
      "Welcome to your elemental journey",
      "The elements await your exploration",
      "Begin your sacred journey",
      "Discover your elemental wisdom"
    ];
    
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
  }, []);
  
  return greeting;
}