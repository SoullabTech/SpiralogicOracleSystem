'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Volume2, Sparkles, Save, Check,
  Play, Settings, Flame, Droplet, Mountain, Wind, Star
} from 'lucide-react';
import { usePersonalization } from '@/lib/context/OraclePersonalizationContext';
import { AnthonyElementalVoice } from '@/lib/voice/AnthonyElementalVoice';
import { Element } from '@/lib/resonanceEngine';

interface VoiceOption {
  id: 'maya' | 'anthony';
  name: string;
  gender: 'feminine' | 'masculine';
  description: string;
  defaultElement: Element;
  archetypes: string[];
}

export default function EnhancedPersonalizationField() {
  const { settings, updateSettings, isSaving } = usePersonalization();
  const [selectedVoice, setSelectedVoice] = useState<'maya' | 'anthony'>('maya');
  const [guideName, setGuideName] = useState(settings.oracleName);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [selectedElement, setSelectedElement] = useState<Element>('earth');
  
  const anthonyVoice = AnthonyElementalVoice.getInstance();

  const voiceOptions: VoiceOption[] = [
    {
      id: 'maya',
      name: 'Maya',
      gender: 'feminine',
      description: 'Warm, nurturing presence with intuitive wisdom',
      defaultElement: 'water',
      archetypes: ['Guide', 'Healer', 'Oracle', 'Friend']
    },
    {
      id: 'anthony',
      name: 'Anthony',
      gender: 'masculine',
      description: 'Grounded alchemist with elemental mastery',
      defaultElement: 'fire',
      archetypes: ['Alchemist', 'Sage', 'Warrior', 'Guardian']
    }
  ];

  const elements = [
    { id: 'fire', name: 'Fire', icon: Flame, color: 'from-red-500 to-orange-500' },
    { id: 'water', name: 'Water', icon: Droplet, color: 'from-blue-500 to-cyan-500' },
    { id: 'earth', name: 'Earth', icon: Mountain, color: 'from-green-500 to-emerald-500' },
    { id: 'air', name: 'Air', icon: Wind, color: 'from-gray-400 to-blue-400' },
    { id: 'aether', name: 'Aether', icon: Star, color: 'from-amber-500 to-pink-500' }
  ];

  useEffect(() => {
    // Detect current voice from settings
    if (settings.voice.gender === 'masculine') {
      setSelectedVoice('anthony');
    } else {
      setSelectedVoice('maya');
    }
  }, [settings]);

  const handleVoiceSelect = async (voiceId: 'maya' | 'anthony') => {
    setSelectedVoice(voiceId);
    const voice = voiceOptions.find(v => v.id === voiceId);
    
    if (voice) {
      await updateSettings({
        oracleName: guideName || voice.name,
        voice: {
          ...settings.voice,
          gender: voice.gender,
          style: voiceId === 'anthony' ? 'anthony-alchemist' : 'warm-guide'
        },
        elementalAffinity: voice.defaultElement
      });
    }
  };

  const handleNameSave = async () => {
    await updateSettings({
      oracleName: guideName
    });
  };

  const handlePreviewVoice = async () => {
    setIsPreviewPlaying(true);
    
    if (selectedVoice === 'anthony') {
      // Preview Anthony's elemental voice
      await anthonyVoice.previewAnthonyVoice(selectedElement);
    } else {
      // Preview Maya's voice (existing implementation)
      const utterance = new SpeechSynthesisUtterance(
        `Hello, I'm ${guideName}. I'm here to guide you with ${selectedElement} wisdom.`
      );
      utterance.voice = speechSynthesis.getVoices().find(v => 
        v.name.toLowerCase().includes('female')
      ) || null;
      speechSynthesis.speak(utterance);
    }
    
    setTimeout(() => setIsPreviewPlaying(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Voice Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-white text-xl mb-6">Voice</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {voiceOptions.map((voice) => (
            <motion.button
              key={voice.id}
              onClick={() => handleVoiceSelect(voice.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedVoice === voice.id
                  ? 'bg-white/10 border-amber-500'
                  : 'bg-white/5 border-white/20 hover:border-white/40'
              }`}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h3 className="text-white text-lg font-semibold mb-1">{voice.name}</h3>
              <p className="text-white/60 text-xs mb-3">{voice.gender}</p>
              <p className="text-white/80 text-sm mb-4">{voice.description}</p>
              
              <div className="flex flex-wrap gap-1 justify-center">
                {voice.archetypes.map((archetype) => (
                  <span
                    key={archetype}
                    className="px-2 py-1 bg-white/10 rounded text-xs text-white/60"
                  >
                    {archetype}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Guide's Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-white text-xl mb-4">Guide's Name</h2>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={guideName}
            onChange={(e) => setGuideName(e.target.value)}
            placeholder={selectedVoice === 'anthony' ? 'Anthony' : 'Maya'}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500"
          />
          
          {guideName !== settings.oracleName && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={handleNameSave}
              disabled={isSaving}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50 rounded-xl text-white font-medium transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save
            </motion.button>
          )}
        </div>
        
        <p className="text-white/40 text-sm mt-3">
          Your guide will introduce themselves with this name
        </p>
      </motion.div>

      {/* Elemental Affinity (Enhanced for Anthony) */}
      {selectedVoice === 'anthony' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-white text-xl mb-4">Elemental Alchemy</h2>
          <p className="text-white/60 text-sm mb-6">
            Anthony's voice transforms with elemental resonance
          </p>
          
          <div className="grid grid-cols-5 gap-3">
            {elements.map((element) => {
              const Icon = element.icon;
              return (
                <motion.button
                  key={element.id}
                  onClick={() => setSelectedElement(element.id as Element)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedElement === element.id
                      ? 'border-amber-500'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className={`w-full h-20 rounded-lg bg-gradient-to-br ${element.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white text-sm">{element.name}</p>
                </motion.button>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-black/20 rounded-xl">
            <h3 className="text-white/80 text-sm mb-2">Alchemical Phase</h3>
            <div className="grid grid-cols-4 gap-2">
              {['Nigredo', 'Albedo', 'Citrinitas', 'Rubedo'].map((phase, idx) => (
                <div
                  key={phase}
                  className="text-center p-2 bg-white/5 rounded"
                >
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${
                    idx === 0 ? 'bg-gray-900' :
                    idx === 1 ? 'bg-white' :
                    idx === 2 ? 'bg-yellow-500' :
                    'bg-red-600'
                  }`} />
                  <p className="text-white/60 text-xs">{phase}</p>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs mt-3">
              Anthony's voice evolves through alchemical phases as your conversation deepens
            </p>
          </div>
        </motion.div>
      )}

      {/* Preview Voice Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={handlePreviewVoice}
          disabled={isPreviewPlaying}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 disabled:from-amber-600/50 disabled:to-yellow-600/50 rounded-xl text-white font-medium transition-all flex items-center gap-3"
        >
          {isPreviewPlaying ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Volume2 className="w-6 h-6" />
            </motion.div>
          ) : (
            <Play className="w-6 h-6" />
          )}
          Preview {guideName || (selectedVoice === 'anthony' ? 'Anthony' : 'Maya')}'s Voice
        </motion.button>
      </motion.div>

      {/* Save Confirmation */}
      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-green-600 text-white rounded-xl flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            <span>Settings saved across all devices!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}