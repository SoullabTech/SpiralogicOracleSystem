import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SimpleVoiceMicProps {
  onTranscript: (transcript: string) => void;
  pauseListening?: boolean;
  className?: string;
}

export const SimpleVoiceMic: React.FC<SimpleVoiceMicProps> = ({
  onTranscript,
  pauseListening = false,
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const hasSentRef = useRef(false);

  const startListening = useCallback(() => {
    if (pauseListening) return;

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Simple mode - stop after each utterance
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      setIsListening(true);
      hasSentRef.current = false;
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript && !hasSentRef.current) {
        console.log('🎯 Final transcript:', finalTranscript);
        hasSentRef.current = true;
        setTranscript(finalTranscript);
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript, pauseListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Auto-stop when paused
  useEffect(() => {
    if (pauseListening && isListening) {
      stopListening();
    }
  }, [pauseListening, isListening, stopListening]);

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 ${className}`}>
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 text-center">
        {transcript && (
          <div className="text-white/80 text-sm mb-2 max-w-xs">
            "{transcript}"
          </div>
        )}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={pauseListening}
          className={`px-6 py-3 rounded-full text-white font-medium transition-colors ${
            isListening
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } ${pauseListening ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {pauseListening ? '🔇 Paused' : isListening ? '🔴 Stop' : '🎤 Speak'}
        </button>
      </div>
    </div>
  );
};