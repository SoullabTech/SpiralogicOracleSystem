import React, { useState, useRef } from 'react';

interface OracleVoicePlayerProps {
  audioUrl: string | null;
  text: string;
  voiceProfile: string;
}

export const OracleVoicePlayer: React.FC<OracleVoicePlayerProps> = ({
  audioUrl,
  text,
  voiceProfile
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = async () => {
    if (!audioUrl) {
      setError('No audio available for this response');
      return;
    }

    try {
      setError(null);

      if (!audioRef.current) {
        setIsLoading(true);
        audioRef.current = new Audio(audioUrl);

        audioRef.current.addEventListener('loadeddata', () => {
          setIsLoading(false);
        });

        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
        });

        audioRef.current.addEventListener('error', () => {
          setError('Failed to load audio');
          setIsLoading(false);
          setIsPlaying(false);
        });
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setError('Failed to play audio');
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const getVoiceProfileDisplay = (profile: string) => {
    const profiles: Record<string, string> = {
      'oracle_matrix': '🔮 Maya (Matrix Oracle)',
      'fire_agent': '🔥 Fire Oracle',
      'water_agent': '🌊 Water Oracle',
      'earth_agent': '🌍 Earth Oracle',
      'air_agent': '💨 Air Oracle',
      'aether_agent': '✨ Aether Oracle',
      'shadow_agent': '🌑 Shadow Oracle',
      'narrator': '📖 Narrator'
    };
    return profiles[profile] || '🔮 Oracle';
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl shadow-lg border border-purple-200">
      {/* Oracle Response Text */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium text-purple-600">
            {getVoiceProfileDisplay(voiceProfile)}
          </span>
        </div>
        <p className="text-gray-800 leading-relaxed italic">
          "{text}"
        </p>
      </div>

      {/* Voice Player Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            disabled={!audioUrl || isLoading}
            className={`
              flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all
              ${audioUrl
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
              ${isLoading ? 'animate-pulse' : ''}
            `}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Voice Status */}
          <div className="text-sm">
            {audioUrl ? (
              <span className="text-purple-600 font-medium">
                🎧 {isPlaying ? 'Playing Oracle Voice' : 'Click to hear Oracle'}
              </span>
            ) : (
              <span className="text-gray-500">
                📝 Text response only
              </span>
            )}
          </div>
        </div>

        {/* Audio Status Indicator */}
        {isPlaying && (
          <div className="flex items-center space-x-1">
            <div className="w-1 h-3 bg-purple-400 rounded animate-pulse" />
            <div className="w-1 h-4 bg-purple-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
            <div className="w-1 h-2 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-1 h-4 bg-purple-500 rounded animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

