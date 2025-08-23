// VoicePlayer - Audio playback component with play/pause and progress
// Handles both audio URLs and Web Speech API fallback
"use client";

import { useState, useRef, useEffect } from 'react';

interface VoicePlayerProps {
  src?: string;
  text?: string;
  voiceId?: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}

export function VoicePlayer({ 
  src, 
  text, 
  voiceId, 
  className = '',
  onPlay,
  onPause,
  onEnd
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isWebSpeech, setIsWebSpeech] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const webSpeechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Handle audio URL playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    // Check if this is a Web Speech marker
    if (src === 'web-speech-synthesis') {
      setIsWebSpeech(true);
      return;
    }

    setIsWebSpeech(false);

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      onEnd?.();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [src, onEnd, onPlay, onPause]);

  const togglePlay = async () => {
    if (isWebSpeech && text) {
      toggleWebSpeech();
      return;
    }

    const audio = audioRef.current;
    if (!audio || !src || src === 'web-speech-synthesis') return;

    try {
      if (isPlaying) {
        await audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const toggleWebSpeech = () => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlaying) {
      // Stop current speech
      speechSynthesis.cancel();
      setIsPlaying(false);
      setProgress(0);
      onPause?.();
    } else {
      // Start new speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Try to find a good voice
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.localService
        ) || voices[0];
        
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        onPlay?.();
      };
      
      // Adjust rate for natural greeting flow (don't clip first 500ms)
      if (text.match(/^(Hi|Hey|Hello|Welcome)/i)) {
        utterance.rate = 0.95; // Slightly slower for greetings
      }

      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(0);
        onEnd?.();
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      webSpeechRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render if no source
  if (!src && !text) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="
          w-8 h-8 rounded-full bg-app-surface border border-app-border
          flex items-center justify-center
          hover:bg-app-surface/80 transition-all duration-apple
          focus:outline-none focus:ring-2 focus:ring-white/20
        "
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg className="w-4 h-4 text-app-text" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4 text-app-text ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>

      {/* Progress Bar (only for real audio files) */}
      {!isWebSpeech && src !== 'web-speech-synthesis' && (
        <>
          <div className="flex-1 h-1 bg-app-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-app-text transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time Display */}
          <span className="text-xs text-app-muted tabular-nums min-w-[40px]">
            {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}
          </span>
        </>
      )}

      {/* Web Speech Indicator */}
      {isWebSpeech && (
        <span className="text-xs text-app-muted">
          using system voice
        </span>
      )}

      {/* Hidden Audio Element */}
      {src && src !== 'web-speech-synthesis' && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          className="hidden"
        />
      )}
    </div>
  );
}