'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSacredActions, useVoiceState } from '@/lib/state/sacred-store';

interface UseVoiceRecordingOptions {
  onTranscript?: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
}

export function useVoiceRecording(options: UseVoiceRecordingOptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const { setListening, setTranscript: setGlobalTranscript } = useSacredActions();
  const { isListening } = useVoiceState();

  useEffect(() => {
    // Check for Web Speech API support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || 
                                (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = options.continuous ?? true;
        recognition.interimResults = options.interimResults ?? true;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsRecording(true);
          setListening(true);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
          setListening(false);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          setListening(false);
          
          if (event.error === 'no-speech') {
            options.onError?.('No speech detected. Please try again.');
          } else if (event.error === 'not-allowed') {
            options.onError?.('Microphone access denied. Please enable microphone permissions.');
          } else {
            options.onError?.(`Speech recognition error: ${event.error}`);
          }
        };
        
        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              final += result[0].transcript + ' ';
            } else {
              interim += result[0].transcript;
            }
          }
          
          if (final) {
            const newTranscript = transcript + final;
            setTranscript(newTranscript);
            setGlobalTranscript(newTranscript);
            options.onTranscript?.(newTranscript);
          }
          
          setInterimTranscript(interim);
        };
        
        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [options.continuous, options.interimResults]);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      // Fallback to MediaRecorder API for audio recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          // Here you would send the audio to your transcription service
          console.log('Audio recorded, size:', audioBlob.size);
          
          // Clean up
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        setListening(true);
        
        return;
      } catch (error) {
        console.error('MediaRecorder error:', error);
        options.onError?.('Failed to access microphone');
        return;
      }
    }
    
    // Use Web Speech API if supported
    if (recognitionRef.current && !isRecording) {
      try {
        setTranscript('');
        setInterimTranscript('');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recording:', error);
        options.onError?.('Failed to start recording');
      }
    }
  }, [isSupported, isRecording, options.onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setListening(false);
      return;
    }
    
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setGlobalTranscript('');
  }, [setGlobalTranscript]);

  return {
    isSupported,
    isRecording,
    transcript,
    interimTranscript,
    startRecording,
    stopRecording,
    toggleRecording,
    clearTranscript
  };
}

// Simplified hook for basic voice input
export function useSimpleVoiceInput() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isRecording, startRecording, stopRecording, transcript: recordedTranscript } = useVoiceRecording({
    onTranscript: (text) => setTranscript(text),
    onError: (err) => setError(err)
  });
  
  useEffect(() => {
    setIsListening(isRecording);
  }, [isRecording]);
  
  const listen = () => {
    setError(null);
    startRecording();
  };
  
  const stop = () => {
    stopRecording();
  };
  
  return {
    transcript: recordedTranscript || transcript,
    isListening,
    error,
    listen,
    stop
  };
}