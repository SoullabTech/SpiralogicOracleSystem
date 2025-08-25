'use client';

import { useState, useRef, useCallback } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface MayaVoicePlayerProps {
  text?: string;
  autoPlay?: boolean;
  className?: string;
  onSynthesisStart?: () => void;
  onSynthesisComplete?: (audioUrl: string) => void;
  onSynthesisError?: (error: string) => void;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

interface SynthesisState {
  status: 'idle' | 'synthesizing' | 'ready' | 'playing' | 'paused' | 'error';
  audioUrl: string | null;
  error: string | null;
  duration: number;
  currentTime: number;
}

export default function MayaVoicePlayer({
  text = '',
  autoPlay = false,
  className = '',
  onSynthesisStart,
  onSynthesisComplete,
  onSynthesisError,
  onPlayStart,
  onPlayEnd
}: MayaVoicePlayerProps) {
  const [state, setState] = useState<SynthesisState>({
    status: 'idle',
    audioUrl: null,
    error: null,
    duration: 0,
    currentTime: 0
  });
  
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Synthesize text to speech via Sesame TTS
  const synthesizeVoice = useCallback(async (textToSpeak: string) => {
    if (!textToSpeak.trim()) {
      setState(prev => ({ ...prev, error: 'No text provided', status: 'error' }));
      return;
    }

    // Cancel any ongoing synthesis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({ 
      ...prev, 
      status: 'synthesizing', 
      error: null,
      audioUrl: null 
    }));
    
    onSynthesisStart?.();

    try {
      const response = await fetch('/api/voice/sesame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Create blob URL from audio response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setState(prev => ({ 
        ...prev, 
        status: 'ready', 
        audioUrl,
        error: null 
      }));
      
      onSynthesisComplete?.(audioUrl);

      // Auto-play if requested
      if (autoPlay) {
        setTimeout(() => playAudio(), 100);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setState(prev => ({ ...prev, status: 'idle' }));
        return;
      }
      
      const errorMessage = error.message || 'Synthesis failed';
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: errorMessage 
      }));
      
      onSynthesisError?.(errorMessage);
    }
  }, [autoPlay, onSynthesisStart, onSynthesisComplete, onSynthesisError]);

  // Play audio
  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !state.audioUrl) return;

    audio.volume = isMuted ? 0 : volume;
    audio.play().then(() => {
      setState(prev => ({ ...prev, status: 'playing' }));
      onPlayStart?.();
    }).catch(error => {
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: `Playback failed: ${error.message}` 
      }));
    });
  }, [state.audioUrl, volume, isMuted, onPlayStart]);

  // Pause audio
  const pauseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  // Stop audio
  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setState(prev => ({ ...prev, status: 'ready', currentTime: 0 }));
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    const newMuted = !isMuted;
    
    setIsMuted(newMuted);
    if (audio) {
      audio.volume = newMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    const audio = audioRef.current;
    if (audio && !isMuted) {
      audio.volume = newVolume;
    }
  }, [isMuted]);

  // Audio event handlers
  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setState(prev => ({ ...prev, duration: audio.duration }));
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    }
  }, []);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, status: 'ready', currentTime: 0 }));
    onPlayEnd?.();
  }, [onPlayEnd]);

  const handleError = useCallback(() => {
    const audio = audioRef.current;
    const errorMessage = audio?.error ? `Audio error: ${audio.error.message}` : 'Audio playback failed';
    setState(prev => ({ ...prev, status: 'error', error: errorMessage }));
  }, []);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPercent = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <div className={`maya-voice-player bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/30 ${className}`}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={state.audioUrl || ''}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <Volume2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-white font-medium">Maya's Voice</h3>
          <p className="text-purple-300 text-sm">Sesame TTS Synthesis</p>
        </div>
      </div>

      {/* Text Input/Display */}
      {!text && (
        <textarea
          placeholder="Enter text for Maya to speak..."
          className="w-full bg-black/30 border border-purple-500/50 rounded-md p-3 text-white placeholder-purple-300 mb-3 resize-none"
          rows={2}
          value={text}
          disabled={state.status === 'synthesizing'}
        />
      )}
      
      {text && (
        <div className="bg-black/30 border border-purple-500/50 rounded-md p-3 mb-3">
          <p className="text-purple-100 text-sm">{text}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 mb-3">
        {/* Synthesize Button */}
        {(!state.audioUrl && state.status !== 'synthesizing') && (
          <button
            onClick={() => synthesizeVoice(text)}
            disabled={!text.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Synthesize Voice
          </button>
        )}

        {/* Synthesizing Status */}
        {state.status === 'synthesizing' && (
          <div className="flex items-center gap-2 text-purple-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Synthesizing Maya's voice...</span>
          </div>
        )}

        {/* Playback Controls */}
        {state.audioUrl && (
          <>
            {state.status !== 'playing' ? (
              <button
                onClick={playAudio}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                title="Play"
              >
                <Play className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={pauseAudio}
                className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full transition-colors"
                title="Pause"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={stopAudio}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
              title="Stop"
            >
              <Square className="w-4 h-4" />
            </button>

            <button
              onClick={toggleMute}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </>
        )}

        {/* Re-synthesize */}
        {state.audioUrl && (
          <button
            onClick={() => synthesizeVoice(text)}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors"
            title="Re-synthesize"
          >
            🔄
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {state.audioUrl && state.duration > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-purple-300 mb-1">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Volume Control */}
      {state.audioUrl && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-purple-300">Volume:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 accent-purple-500"
          />
          <span className="text-xs text-purple-300 w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}

      {/* Error Display */}
      {state.status === 'error' && state.error && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded-md">
          <p className="text-red-300 text-sm">
            <strong>Error:</strong> {state.error}
          </p>
        </div>
      )}

      {/* Status Display */}
      <div className="mt-3 text-xs text-purple-400">
        Status: <span className="font-mono">{state.status}</span>
        {state.audioUrl && (
          <span className="ml-2">• Audio ready</span>
        )}
      </div>
    </div>
  );
}