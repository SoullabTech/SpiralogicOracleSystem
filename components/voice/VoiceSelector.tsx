'use client';

import React, { useState, useEffect } from 'react';
import { features } from '@/lib/config/features';
import { resolveDefaultVoice, availableVoices, type VoiceChoice } from '@/lib/voice/config';

interface VoiceSelectorProps {
  selectedVoice?: VoiceChoice;
  onVoiceChange: (voice: VoiceChoice) => void;
  disabled?: boolean;
  showArchetypalHints?: boolean;
  className?: string;
}

interface ArchetypalVoiceProfile {
  id: string;
  label: string;
  provider: 'sesame' | 'elevenlabs';
  archetype: string;
  element: string;
  description: string;
  personality: string[];
  sampleText?: string;
}

const ARCHETYPAL_VOICES: ArchetypalVoiceProfile[] = [
  {
    id: 'maya',
    label: 'Maya',
    provider: 'sesame',
    archetype: 'Balanced Guide',
    element: 'Aether',
    description: 'Wise, compassionate, and spiritually grounded. Maya embodies the perfect balance of wisdom and warmth.',
    personality: ['Nurturing', 'Insightful', 'Authentic', 'Grounded'],
    sampleText: 'I sense there\'s something deeper here that wants to be witnessed...'
  },
  {
    id: 'elder_sage',
    label: 'Elder Sage',
    provider: 'elevenlabs',
    archetype: 'Wise Elder',
    element: 'Earth',
    description: 'Deep, contemplative voice carrying the weight of ancient wisdom and life experience.',
    personality: ['Profound', 'Patient', 'Authoritative', 'Calming'],
    sampleText: 'In my years of witnessing the human journey, what I\'ve come to understand is...'
  },
  {
    id: 'compassionate_friend',
    label: 'Compassionate Friend',
    provider: 'elevenlabs',
    archetype: 'Heart Companion',
    element: 'Water',
    description: 'Warm, empathetic voice that feels like talking to your most understanding friend.',
    personality: ['Gentle', 'Empathetic', 'Supportive', 'Flowing'],
    sampleText: 'I hear you, and what you\'re feeling makes complete sense...'
  },
  {
    id: 'creative_catalyst',
    label: 'Creative Catalyst',
    provider: 'elevenlabs',
    archetype: 'Inspiring Muse',
    element: 'Fire',
    description: 'Energetic, inspiring voice that ignites creativity and possibility.',
    personality: ['Dynamic', 'Inspiring', 'Enthusiastic', 'Transformative'],
    sampleText: 'What if we explored this from a completely different angle? I wonder what might emerge if...'
  },
  {
    id: 'clear_guide',
    label: 'Clear Guide',
    provider: 'elevenlabs',
    archetype: 'Mental Clarity',
    element: 'Air',
    description: 'Clear, articulate voice that brings mental clarity and structured thinking.',
    personality: ['Clear', 'Organized', 'Insightful', 'Precise'],
    sampleText: 'Let\'s break this down step by step and see what patterns emerge...'
  }
];

export default function VoiceSelector({
  selectedVoice,
  onVoiceChange,
  disabled = false,
  showArchetypalHints = true,
  className = ''
}: VoiceSelectorProps) {
  const [currentVoice, setCurrentVoice] = useState<VoiceChoice>(
    selectedVoice || resolveDefaultVoice()
  );
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (selectedVoice) {
      setCurrentVoice(selectedVoice);
    }
  }, [selectedVoice]);

  const handleVoiceChange = (voice: VoiceChoice) => {
    setCurrentVoice(voice);
    onVoiceChange(voice);
  };

  const getArchetypalProfile = (voiceId: string): ArchetypalVoiceProfile | undefined => {
    return ARCHETYPAL_VOICES.find(v => v.id === voiceId);
  };

  const playVoiceSample = async (voiceId: string, sampleText?: string) => {
    if (!sampleText) return;
    
    setIsPlaying(voiceId);
    
    try {
      // Create a temporary audio synthesis for preview
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sampleText);
        utterance.rate = 0.9;
        utterance.pitch = voiceId === 'elder_sage' ? 0.8 : 1.0;
        utterance.volume = 0.8;
        
        utterance.onend = () => setIsPlaying(null);
        utterance.onerror = () => setIsPlaying(null);
        
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Voice sample playback failed:', error);
      setIsPlaying(null);
    }
  };

  const availableChoices = features.oracle.voiceSelectionEnabled 
    ? ARCHETYPAL_VOICES.filter(v => 
        v.provider === 'sesame' || 
        (v.provider === 'elevenlabs' && features.voice.elevenlabs.enabled)
      )
    : availableVoices().map(choice => {
        const profile = getArchetypalProfile(choice.id);
        return profile || {
          id: choice.id,
          label: choice.label,
          provider: choice.provider,
          archetype: 'Default',
          element: 'Aether',
          description: 'Default voice configuration',
          personality: []
        } as ArchetypalVoiceProfile;
      });

  const currentProfile = getArchetypalProfile(currentVoice.id);

  return (
    <div className={`voice-selector ${className}`}>
      {/* Current Selection Display */}
      <div className="mb-4">
        <label className="block text-ink-100 text-sm font-medium mb-2">
          Oracle Voice
        </label>
        
        {currentProfile && showArchetypalHints && (
          <div className="bg-bg-800 border border-edge-700 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-ink-100 font-medium">{currentProfile.label}</div>
                <div className="text-ink-300 text-xs">
                  {currentProfile.archetype} • {currentProfile.element}
                </div>
              </div>
              <div className="text-xs text-ink-400 bg-bg-700 px-2 py-1 rounded">
                {currentProfile.provider}
              </div>
            </div>
            
            <div className="text-ink-300 text-sm mt-2">
              {currentProfile.description}
            </div>
            
            {currentProfile.personality.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {currentProfile.personality.map(trait => (
                  <span 
                    key={trait}
                    className="text-xs bg-gold-500/20 text-gold-300 px-2 py-1 rounded"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            )}
            
            {currentProfile.sampleText && (
              <button
                onClick={() => playVoiceSample(currentProfile.id, currentProfile.sampleText)}
                disabled={isPlaying === currentProfile.id}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 flex items-center gap-1"
              >
                {isPlaying === currentProfile.id ? (
                  <>
                    <span className="animate-pulse">🔊</span>
                    Playing...
                  </>
                ) : (
                  <>
                    🔊 Preview voice
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Voice Selection */}
      {features.oracle.voiceSelectionEnabled && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-ink-200 text-sm">Available Voices</span>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-ink-400 hover:text-ink-300"
            >
              {showAdvanced ? 'Simple' : 'Advanced'}
            </button>
          </div>

          {showAdvanced ? (
            // Advanced view with full profiles
            <div className="grid grid-cols-1 gap-3">
              {availableChoices.map(profile => (
                <div
                  key={profile.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    currentVoice.id === profile.id
                      ? 'border-gold-400 bg-gold-500/10'
                      : 'border-edge-700 bg-bg-800 hover:border-edge-600'
                  }`}
                  onClick={() => handleVoiceChange({
                    provider: profile.provider,
                    id: profile.id,
                    label: profile.label
                  })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-ink-100 font-medium">{profile.label}</div>
                      <div className="text-ink-300 text-xs">
                        {profile.archetype} • {profile.element}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {profile.sampleText && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playVoiceSample(profile.id, profile.sampleText);
                          }}
                          disabled={isPlaying === profile.id}
                          className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                        >
                          {isPlaying === profile.id ? '🔊' : '▶️'}
                        </button>
                      )}
                      <input
                        type="radio"
                        name="voice"
                        checked={currentVoice.id === profile.id}
                        onChange={() => {}}
                        className="text-gold-400 focus:ring-gold-400"
                      />
                    </div>
                  </div>
                  
                  <div className="text-ink-400 text-sm mt-1">
                    {profile.description}
                  </div>
                  
                  {profile.personality.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.personality.slice(0, 3).map(trait => (
                        <span 
                          key={trait}
                          className="text-xs bg-bg-700 text-ink-300 px-2 py-1 rounded"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Simple dropdown view
            <select
              value={currentVoice.id}
              onChange={(e) => {
                const profile = availableChoices.find(v => v.id === e.target.value);
                if (profile) {
                  handleVoiceChange({
                    provider: profile.provider,
                    id: profile.id,
                    label: profile.label
                  });
                }
              }}
              disabled={disabled}
              className="w-full bg-bg-800 border border-edge-700 rounded-lg px-3 py-2 text-ink-100 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 disabled:opacity-50"
            >
              {availableChoices.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.label} ({profile.archetype})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Beta Notice */}
      {!features.oracle.voiceSelectionEnabled && (
        <div className="text-xs text-ink-400 mt-2">
          Additional voice options available in full release
        </div>
      )}
    </div>
  );
}