// components/voice/PetalVoicePreview.tsx - Voice Preview with Context-Aware Synthesis
'use client';

import { useEffect, useState } from 'react';
import { Loader2, Mic, MicOff } from 'lucide-react';
import PetalAudioPlayer from './PetalAudioPlayer';
import { speakPetalMessage, getVoiceForContext, type VoicePersonality, type ElementalStyle } from '@/lib/voice/sesameTTS';

interface PetalVoicePreviewProps {
  message: string;
  context?: 'petalReading' | 'journalReflection' | 'dreamGuidance' | 'ritualInstruction' | 'soulMessage';
  customVoice?: VoicePersonality;
  customElement?: ElementalStyle;
  autoSpeak?: boolean;
  showControls?: boolean;
  className?: string;
}

export function PetalVoicePreview({
  message,
  context = 'journalReflection',
  customVoice,
  customElement,
  autoSpeak = false,
  showControls = true,
  className = ''
}: PetalVoicePreviewProps) {
  const [audio, setAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(autoSpeak);

  // Get voice configuration based on context
  const voiceConfig = getVoiceForContext(context);
  const voice = customVoice || voiceConfig.voice;
  const element = customElement || voiceConfig.element;

  useEffect(() => {
    if (!voiceEnabled || !message) return;

    const synthesize = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Add context prefix if available
        const fullMessage = voiceConfig.prefix 
          ? `${voiceConfig.prefix} ${message}`
          : message;
        
        const audioData = await speakPetalMessage(fullMessage, voice, element);
        
        if (audioData) {
          setAudio(audioData);
        } else {
          throw new Error('Failed to generate audio');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Voice synthesis failed');
        console.error('Voice synthesis error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    synthesize();
  }, [message, voice, element, voiceEnabled, voiceConfig.prefix]);

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled && !audio) {
      // Trigger synthesis when enabling
      setVoiceEnabled(true);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {showControls && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleVoice}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                         transition-all ${
                           voiceEnabled
                             ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                             : 'bg-gray-700/50 text-gray-400 border border-gray-600/30'
                         }`}
            >
              {voiceEnabled ? <Mic size={16} /> : <MicOff size={16} />}
              <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
            </button>
            
            {isLoading && (
              <div className="flex items-center gap-2 text-amber-300 text-sm">
                <Loader2 size={16} className="animate-spin" />
                <span>Synthesizing voice...</span>
              </div>
            )}
          </div>

          {/* Context Indicator */}
          <div className="text-xs text-gray-400">
            Context: <span className="text-amber-300">{context}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-300">
          Voice synthesis unavailable: {error}
        </div>
      )}

      {/* Audio Player */}
      {audio && !error && (
        <PetalAudioPlayer
          base64={audio}
          voicePersonality={voice}
          elementalStyle={element}
          autoPlay={autoSpeak}
          showVisualizer={true}
        />
      )}

      {/* Message Display (optional) */}
      {showControls && message && (
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
          <p className="text-sm text-gray-300 italic">"{message}"</p>
        </div>
      )}
    </div>
  );
}

export default PetalVoicePreview;