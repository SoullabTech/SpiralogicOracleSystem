"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface MaiaVoiceCaptureProps {
  onTranscript: (text: string) => void;
  onCancel: () => void;
  context: string;
}

export function MaiaVoiceCapture({ 
  onTranscript, 
  onCancel, 
  context 
}: MaiaVoiceCaptureProps) {
  const [isListening, setIsListening] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        
        // Auto-submit on pause (final result)
        if (event.results[current].isFinal) {
          setTimeout(() => {
            if (transcriptText.trim()) {
              onTranscript(transcriptText);
            }
          }, 500);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }

    // Initialize audio visualization
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const updateAmplitude = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAmplitude(average / 128); // Normalize to 0-1
        }
        animationRef.current = requestAnimationFrame(updateAmplitude);
      };
      updateAmplitude();
    });

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice visualization */}
      <div className="relative h-32 flex items-center justify-center">
        {/* Outer rings */}
        <motion.div
          className="absolute w-32 h-32 rounded-full border-2 border-neutral-silver/30"
          animate={{
            scale: isListening ? [1, 1.2, 1] : 1,
            opacity: isListening ? [0.3, 0.6, 0.3] : 0.2
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-24 h-24 rounded-full border-2 border-gold-divine/40"
          animate={{
            scale: isListening ? [1, 1.3, 1] : 1,
            opacity: isListening ? [0.4, 0.7, 0.4] : 0.3
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        {/* Center mic button */}
        <motion.button
          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center ${
            isListening
              ? "bg-gradient-to-r from-neutral-silver to-neutral-pure"
              : "bg-gradient-to-r from-neutral-mystic to-neutral-silver"
          } shadow-lg`}
          animate={{
            scale: 1 + amplitude * 0.5
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleListening}
        >
          <svg 
            className="w-8 h-8 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            {isListening ? (
              <path d="M12 14a3 3 0 003-3V6a3 3 0 00-6 0v5a3 3 0 003 3z M12 16a5 5 0 005-5V6A5 5 0 007 6v5a5 5 0 005 5z M12 20a9 9 0 009-9h-2a7 7 0 01-14 0H3a9 9 0 009 9z" />
            ) : (
              <path d="M12 14a3 3 0 003-3V6a3 3 0 00-6 0v5a3 3 0 003 3z M17 11a5 5 0 01-10 0h-2a7 7 0 0014 0h-2z M12 20v-2a5 5 0 005-5h2a7 7 0 01-7 7z" />
            )}
          </svg>
        </motion.button>

        {/* Amplitude waves */}
        {isListening && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-full h-full rounded-full border border-gold-divine/50"
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{
                  scale: [0.5, 2, 2],
                  opacity: [1, 0, 0]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.5,
                  repeat: Infinity
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Status text */}
      <div className="text-center space-y-2">
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.p
              key="listening"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-gold-divine font-medium"
            >
              I'm listening...
            </motion.p>
          ) : (
            <motion.p
              key="ready"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-gray-600 dark:text-gray-400"
            >
              Tap to speak your truth
            </motion.p>
          )}
        </AnimatePresence>

        {/* Live transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded-lg bg-white/50 dark:bg-black/30 backdrop-blur"
          >
            <p className="text-sm italic">"{transcript}"</p>
          </motion.div>
        )}
      </div>

      {/* Cancel button */}
      <button
        className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
}