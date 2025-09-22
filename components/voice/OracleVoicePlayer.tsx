'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface OracleVoicePlayerProps {
  text: string;
  autoPlay?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export default function OracleVoicePlayer({
  text,
  autoPlay = false,
  onPlayStateChange
}: OracleVoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (autoPlay && text) {
      playAudio();
    }
  }, [text, autoPlay]);

  const playAudio = async () => {
    if (!text || isPlaying) return;

    try {
      setIsPlaying(true);
      onPlayStateChange?.(true);

      // Use browser's speech synthesis as fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = isMuted ? 0 : 0.8;

      utterance.onend = () => {
        setIsPlaying(false);
        onPlayStateChange?.(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
      onPlayStateChange?.(false);
    }
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    onPlayStateChange?.(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isPlaying ? stopAudio : playAudio}
        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        disabled={!text}
      >
        <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-amber-400' : 'text-white/60'}`} />
      </button>
      {isPlaying && (
        <button
          onClick={toggleMute}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-white/60" /> : <Volume2 className="w-4 h-4 text-white/60" />}
        </button>
      )}
    </div>
  );
}