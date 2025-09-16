/**
 * Voice Selection UI Component
 * Allows users to choose their PersonalOracleAgent voice
 */

import React, { useState } from 'react';
import { voiceConfig, type VoiceProfile, type VoiceMenuItem } from '@/lib/config/voiceProfiles';
import { Play, Lock, Check, Sparkles } from 'lucide-react';

interface VoiceSelectionUIProps {
  currentVoiceId: string;
  userLevel: number;
  onVoiceSelect: (voiceId: string) => void;
  onPreviewVoice?: (voiceId: string) => void;
}

export const VoiceSelectionUI: React.FC<VoiceSelectionUIProps> = ({
  currentVoiceId,
  userLevel,
  onVoiceSelect,
  onPreviewVoice
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'canonical' | 'alternative' | 'experimental'>('canonical');
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  const menu = voiceConfig.buildMenu(currentVoiceId, userLevel);

  const handlePreview = async (voiceId: string) => {
    setPreviewingVoice(voiceId);
    await onPreviewVoice?.(voiceId);
    setPreviewingVoice(null);
  };

  const VoiceCard: React.FC<{ item: VoiceMenuItem }> = ({ item }) => {
    const { profile, isAvailable, isSelected, unlockHint } = item;

    return (
      <div
        className={`
          relative rounded-lg border-2 p-4 transition-all cursor-pointer
          ${isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' : 'border-gray-200 dark:border-gray-700'}
          ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-300'}
        `}
        onClick={() => isAvailable && onVoiceSelect(profile.id)}
      >
        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-purple-500 rounded-full p-1">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Lock Icon for Unavailable */}
        {!isAvailable && (
          <div className="absolute top-2 right-2">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        )}

        {/* Voice Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{profile.displayName}</h3>
            <span className="text-xs text-gray-500 uppercase">
              {profile.provider}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {profile.description}
          </p>

          {/* Personality Indicators */}
          <div className="flex gap-1 mt-2">
            {profile.masks.map(mask => (
              <span
                key={mask}
                className={`
                  text-xs px-2 py-1 rounded-full
                  ${mask === 'fire' ? 'bg-red-100 text-red-700' : ''}
                  ${mask === 'water' ? 'bg-blue-100 text-blue-700' : ''}
                  ${mask === 'earth' ? 'bg-green-100 text-green-700' : ''}
                  ${mask === 'air' ? 'bg-gray-100 text-gray-700' : ''}
                  ${mask === 'aether' ? 'bg-purple-100 text-purple-700' : ''}
                `}
              >
                {mask}
              </span>
            ))}
          </div>

          {/* Unlock Hint */}
          {unlockHint && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              <Sparkles className="w-3 h-3 inline mr-1" />
              {unlockHint}
            </p>
          )}

          {/* Preview Button */}
          {isAvailable && onPreviewVoice && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(profile.id);
              }}
              disabled={previewingVoice === profile.id}
              className="mt-3 flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
            >
              <Play className="w-4 h-4" />
              {previewingVoice === profile.id ? 'Playing...' : 'Preview'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setSelectedCategory('canonical')}
          className={`
            px-4 py-2 -mb-px border-b-2 transition-colors
            ${selectedCategory === 'canonical'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'}
          `}
        >
          Sacred Voices
        </button>
        <button
          onClick={() => setSelectedCategory('alternative')}
          className={`
            px-4 py-2 -mb-px border-b-2 transition-colors
            ${selectedCategory === 'alternative'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'}
          `}
        >
          Alternative
        </button>
        <button
          onClick={() => setSelectedCategory('experimental')}
          className={`
            px-4 py-2 -mb-px border-b-2 transition-colors
            ${selectedCategory === 'experimental'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'}
          `}
        >
          Experimental
        </button>
      </div>

      {/* Voice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menu[selectedCategory].map(item => (
          <VoiceCard key={item.profile.id} item={item} />
        ))}
      </div>

      {/* Trust Level Indicator */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Your Trust Level
          </span>
          <span className="text-lg font-semibold text-purple-600">
            Level {userLevel}
          </span>
        </div>
        <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(userLevel * 20, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Higher trust levels unlock special voices and masks
        </p>
      </div>
    </div>
  );
};

export default VoiceSelectionUI;