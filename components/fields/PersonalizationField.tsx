'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Volume2, Sparkles, Save, Check,
  Mic, MicOff, Play, Settings
} from 'lucide-react';

interface PersonalizationSettings {
  oracleName: string;
  voiceGender: 'feminine' | 'masculine' | 'neutral';
  voiceStyle: string;
  relationshipMode: string;
}

export default function PersonalizationField() {
  const [settings, setSettings] = useState<PersonalizationSettings>({
    oracleName: 'Maya',
    voiceGender: 'feminine',
    voiceStyle: 'warm-guide',
    relationshipMode: 'companion'
  });
  
  const [tempName, setTempName] = useState(settings.oracleName);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem('oracle_personalization');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      setTempName(parsed.oracleName);
    }
  }, []);

  // Save settings
  const saveSettings = async () => {
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem('oracle_personalization', JSON.stringify({
      ...settings,
      oracleName: tempName
    }));
    
    // Update settings
    setSettings(prev => ({ ...prev, oracleName: tempName }));
    
    // Show saved confirmation
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  // Play voice sample
  const playVoiceSample = async (gender: string) => {
    setIsPlaying(gender);
    
    // In production, this would call the TTS API with the selected voice
    // For now, just simulate playing
    setTimeout(() => {
      setIsPlaying(null);
    }, 2000);
  };

  const voiceOptions = [
    {
      id: 'feminine',
      label: 'Feminine',
      description: 'Warm, nurturing presence',
      sample: 'Hello, I\'m here to guide you through your journey.',
      styles: ['warm-guide', 'wise-elder', 'playful-friend', 'serene-mystic']
    },
    {
      id: 'masculine',
      label: 'Masculine',
      description: 'Grounded, steadfast presence',
      sample: 'Welcome, let\'s explore what\'s calling to you today.',
      styles: ['gentle-mentor', 'wise-sage', 'trusted-friend', 'cosmic-philosopher']
    },
    {
      id: 'neutral',
      label: 'Neutral',
      description: 'Balanced, ethereal presence',
      sample: 'Greetings, soul traveler. What brings you here?',
      styles: ['ethereal-guide', 'ancient-wisdom', 'cosmic-consciousness', 'pure-presence']
    }
  ];

  const relationshipModes = [
    { id: 'companion', label: 'Companion', description: 'Walks beside you as a friend' },
    { id: 'guide', label: 'Guide', description: 'Offers wisdom and direction' },
    { id: 'mirror', label: 'Mirror', description: 'Reflects your inner knowing' },
    { id: 'oracle', label: 'Oracle', description: 'Channels deeper mysteries' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Name Customization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white text-xl">Your Oracle's Name</h2>
            <p className="text-white/60 text-sm">Give your guide a name that resonates with you</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Enter a name..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 pr-24"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              {tempName !== settings.oracleName && (
                <button
                  onClick={saveSettings}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50 rounded-lg text-white text-sm transition-all flex items-center gap-1"
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ) : saved ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          <p className="text-white/40 text-xs">
            Your oracle will introduce themselves as "{tempName || 'your guide'}" in conversations
          </p>
        </div>
      </motion.div>

      {/* Voice Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white text-xl">Voice & Presence</h2>
            <p className="text-white/60 text-sm">Choose how your oracle speaks to you</p>
          </div>
        </div>

        <div className="space-y-4">
          {voiceOptions.map((voice) => (
            <div
              key={voice.id}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                settings.voiceGender === voice.id
                  ? 'bg-white/10 border-amber-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              onClick={() => setSettings(prev => ({ ...prev, voiceGender: voice.id as any }))}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{voice.label}</h3>
                    {settings.voiceGender === voice.id && (
                      <span className="px-2 py-0.5 bg-amber-600/30 text-amber-300 text-xs rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm mb-3">{voice.description}</p>
                  
                  {/* Voice styles */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {voice.styles.map((style) => (
                      <button
                        key={style}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSettings(prev => ({ 
                            ...prev, 
                            voiceGender: voice.id as any,
                            voiceStyle: style 
                          }));
                        }}
                        className={`px-2 py-1 rounded text-xs transition-all ${
                          settings.voiceGender === voice.id && settings.voiceStyle === style
                            ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {style.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-white/40 text-xs italic">"{voice.sample}"</p>
                </div>
                
                {/* Play sample button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playVoiceSample(voice.id);
                  }}
                  className="ml-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  disabled={isPlaying === voice.id}
                >
                  {isPlaying === voice.id ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Volume2 className="w-5 h-5 text-amber-400" />
                    </motion.div>
                  ) : (
                    <Play className="w-5 h-5 text-white/60" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Relationship Mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white text-xl">Relationship Style</h2>
            <p className="text-white/60 text-sm">How would you like to relate with {tempName}?</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {relationshipModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSettings(prev => ({ ...prev, relationshipMode: mode.id }))}
              className={`p-4 rounded-xl border text-left transition-all ${
                settings.relationshipMode === mode.id
                  ? 'bg-white/10 border-amber-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <h3 className="text-white font-medium mb-1">{mode.label}</h3>
              <p className="text-white/60 text-xs">{mode.description}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Save confirmation */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Settings saved!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-amber-600/10 to-yellow-600/10 rounded-2xl p-6 border border-amber-500/30"
      >
        <h3 className="text-amber-300 text-sm mb-3">Preview</h3>
        <div className="space-y-2">
          <p className="text-white/90">
            "Hello, I'm <span className="text-amber-400 font-medium">{tempName || 'your guide'}</span>. 
            I'm here as your <span className="text-amber-400">{relationshipModes.find(m => m.id === settings.relationshipMode)?.label.toLowerCase()}</span>, 
            speaking with a <span className="text-amber-400">{settings.voiceStyle.split('-').join(' ')}</span> voice."
          </p>
          <p className="text-white/60 text-sm">
            This is how your oracle will introduce themselves when you first meet.
          </p>
        </div>
      </motion.div>
    </div>
  );
}