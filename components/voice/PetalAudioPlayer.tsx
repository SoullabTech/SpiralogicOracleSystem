// components/voice/PetalAudioPlayer.tsx - Enhanced Audio Player with Visual Feedback
'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Download } from 'lucide-react';

interface PetalAudioPlayerProps {
  base64?: string | null;
  audioUrl?: string;
  voicePersonality?: string;
  elementalStyle?: string;
  autoPlay?: boolean;
  showVisualizer?: boolean;
  className?: string;
}

export default function PetalAudioPlayer({
  base64,
  audioUrl,
  voicePersonality = 'maya',
  elementalStyle = 'neutral',
  autoPlay = false,
  showVisualizer = true,
  className = ''
}: PetalAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (base64) {
      // Handle base64 audio
      audio.src = `data:audio/mp3;base64,${base64}`;
    } else if (audioUrl) {
      // Handle URL audio
      audio.src = audioUrl;
    }

    // Set up event listeners
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    if (autoPlay) {
      audio.play().catch(console.error);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [base64, audioUrl, autoPlay]);

  if (!base64 && !audioUrl) return null;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  };

  const downloadAudio = () => {
    const link = document.createElement('a');
    if (base64) {
      link.href = `data:audio/mp3;base64,${base64}`;
    } else if (audioUrl) {
      link.href = audioUrl;
    }
    link.download = `${voicePersonality}-${Date.now()}.mp3`;
    link.click();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Get elemental colors
  const getElementalColor = () => {
    switch (elementalStyle) {
      case 'fire': return 'from-orange-500 to-red-500';
      case 'water': return 'from-blue-500 to-cyan-500';
      case 'earth': return 'from-green-600 to-amber-600';
      case 'air': return 'from-sky-400 to-purple-400';
      case 'aether': return 'from-purple-500 to-pink-500';
      default: return 'from-indigo-500 to-purple-500';
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 ${className}`}>
      {/* Voice Personality Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getElementalColor()} text-white`}>
          {voicePersonality} • {elementalStyle}
        </span>
        <button
          onClick={downloadAudio}
          className="text-gray-400 hover:text-white transition-colors"
          title="Download audio"
        >
          <Download size={16} />
        </button>
      </div>

      {/* Player Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full bg-gradient-to-r ${getElementalColor()} 
                     text-white flex items-center justify-center hover:scale-105 transition-transform`}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        {/* Progress Bar */}
        <div className="flex-1">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getElementalColor()} transition-all duration-100`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {showVisualizer && isPlaying && (
            <div className="flex items-center gap-0.5 mt-1 h-4">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 bg-gradient-to-t ${getElementalColor()} rounded-t opacity-60`}
                  style={{
                    height: `${Math.random() * 100}%`,
                    animation: isPlaying ? 'pulse 0.5s ease-in-out infinite' : 'none',
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="auto" />
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}