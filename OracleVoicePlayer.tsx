// OracleVoicePlayer.tsx - React component for playing Oracle voice responses

import React, { useState, useRef } from "react";
import { Analytics } from "./lib/analytics/supabaseAnalytics";

interface OracleVoicePlayerProps {
  audioUrl?: string;
  text: string;
  voiceProfile?: string;
  className?: string;
}

export const OracleVoicePlayer: React.FC<OracleVoicePlayerProps> = ({
  audioUrl,
  text,
  voiceProfile = "oracle_matrix",
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlay = async () => {
    if (!audioUrl) {
      console.warn("No audio URL available for Oracle response");
      Analytics.ttsError('unknown', {
        type: 'audio_file_missing',
        message: 'No audio URL provided'
      });
      return;
    }

    const playbackStartTime = Date.now();
    
    // Track TTS playback start
    Analytics.startPlayback(getTTSProvider(audioUrl), {
      voice_profile: voiceProfile,
      text_length: text.length
    });
    try {
      setIsLoading(true);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing Oracle voice:", error);
      
      // Track playback error
      Analytics.playbackError(getTTSProvider(audioUrl), {
        type: 'playback_error',
        message: error instanceof Error ? error.message : 'Unknown playback error',
        duration_ms: Date.now() - playbackStartTime
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    
    // Track successful playback completion
    if (audioRef.current && audioUrl) {
      Analytics.completePlayback(getTTSProvider(audioUrl), {
        voice_profile: voiceProfile,
        audio_duration_ms: audioRef.current.duration * 1000,
        success: true
      });
    }
  };

  // Helper function to determine TTS provider from audio URL
  const getTTSProvider = (url: string): 'Sesame' | 'ElevenLabs' | 'fallback_failed' => {
    if (url.includes('sesame') || url.includes('northflank')) return 'Sesame';
    if (url.includes('elevenlabs')) return 'ElevenLabs';
    return 'fallback_failed';
  };

  const getVoiceIcon = () => {
    switch (voiceProfile) {
      case "oracle_matrix":
        return "🔮";
      case "fire_agent":
        return "🔥";
      case "water_agent":
        return "💧";
      case "earth_agent":
        return "🌱";
      case "air_agent":
        return "🌬️";
      case "aether_agent":
        return "✨";
      case "shadow_agent":
        return "🌑";
      default:
        return "🎵";
    }
  };

  return (
    <div className={`oracle-voice-player ${className}`}>
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleEnded}
          preload="none"
        />
      )}

      {/* Voice control button */}
      <div className="flex items-center gap-2 mt-2">
        {audioUrl ? (
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-amber-100 hover:bg-amber-200
                       text-amber-800 rounded-full transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title={`${isPlaying ? "Pause" : "Play"} Oracle voice`}
          >
            <span className="text-lg">{getVoiceIcon()}</span>
            {isLoading && (
              <div className="animate-spin w-3 h-3 border border-amber-600 border-t-transparent rounded-full" />
            )}
            {!isLoading && (
              <span className="text-xs font-medium">
                {isPlaying ? "⏸️ Pause Oracle" : "▶️ Hear Oracle"}
              </span>
            )}
          </button>
        ) : (
          <span className="flex items-center gap-2 px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
            🔮 <span>Voice synthesis unavailable</span>
          </span>
        )}

        {/* Voice profile indicator */}
        {voiceProfile && (
          <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
            {voiceProfile.replace("_", " ").toUpperCase()}
          </span>
        )}
      </div>

      {/* Visual feedback for Matrix Oracle */}
      {isPlaying && voiceProfile === "oracle_matrix" && (
        <div className="mt-2 text-xs text-amber-700 italic">
          🌀 The Oracle speaks with Matrix wisdom...
        </div>
      )}
    </div>
  );
};

// Example usage component
export const OracleResponseWithVoice: React.FC<{
  response: {
    content: string;
    metadata?: {
      audioUrl?: string;
      voice_profile?: string;
      voice_synthesis?: boolean;
    };
  };
}> = ({ response }) => {
  return (
    <div className="oracle-response p-4 bg-gradient-to-r from-amber-50 to-blue-50 rounded-lg">
      {/* Oracle text response */}
      <div className="oracle-text mb-3 text-gray-800 leading-relaxed">
        {response.content}
      </div>

      {/* Voice player */}
      <OracleVoicePlayer
        audioUrl={response.metadata?.audioUrl}
        text={response.content}
        voiceProfile={response.metadata?.voice_profile}
      />

      {/* Voice synthesis indicator */}
      {response.metadata?.voice_synthesis && (
        <div className="mt-2 text-xs text-gray-500 border-t pt-2">
          ✨ Enhanced with Matrix Oracle voice synthesis
        </div>
      )}
    </div>
  );
};

export default OracleVoicePlayer;
