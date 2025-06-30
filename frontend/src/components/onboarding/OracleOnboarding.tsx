// frontend/src/components/onboarding/OracleOnboarding.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

interface OraclePreferences {
  oracle_name: string;
  oracle_voice: string;
  insight?: string;
}

interface OracleOnboardingProps {
  onComplete: (preferences: OraclePreferences) => void;
}

const OracleOnboarding: React.FC<OracleOnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    oracle_name: '',
    oracle_voice: '',
    insight: ''
  });
  
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load available voices and check existing preferences
  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    try {
      // Load available voices
      const voicesResponse = await fetch('/api/voice/list');
      if (voicesResponse.ok) {
        const voicesData = await voicesResponse.json();
        setVoices(voicesData.voices || []);
        
        // Set default voice if available
        if (voicesData.voices?.length > 0 && !formData.oracle_voice) {
          setFormData(prev => ({ ...prev, oracle_voice: voicesData.voices[0].id }));
        }
      }

      // Check if user already has Oracle preferences
      if (user) {
        const prefsResponse = await fetch('/api/oracle/preferences', {
          headers: {
            'Authorization': `Bearer ${user.access_token}`
          }
        });
        
        if (prefsResponse.ok) {
          const prefsData = await prefsResponse.json();
          if (prefsData.preferences) {
            // User already configured, complete onboarding
            onComplete(prefsData.preferences);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.oracle_name.trim()) {
      newErrors.oracle_name = 'Please name your Oracle';
    } else if (formData.oracle_name.length > 40) {
      newErrors.oracle_name = 'Name must be 40 characters or less';
    }

    if (!formData.oracle_voice) {
      newErrors.oracle_voice = 'Please select a voice';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVoicePreview = async (voiceId: string) => {
    try {
      if (playingVoice === voiceId) {
        // Stop current audio
        setPlayingVoice(null);
        return;
      }

      setPlayingVoice(voiceId);
      
      // Create and play audio
      const audio = new Audio(`/api/voice/preview?voiceId=${voiceId}`);
      
      audio.onended = () => setPlayingVoice(null);
      audio.onerror = () => {
        setPlayingVoice(null);
        console.error('Failed to play voice preview');
      };
      
      await audio.play();
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        audio.pause();
        setPlayingVoice(null);
      }, 5000);
      
    } catch (error) {
      setPlayingVoice(null);
      console.error('Voice preview failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    setSaving(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/oracle/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify({
          oracle_name: formData.oracle_name.trim(),
          oracle_voice: formData.oracle_voice,
          insight: formData.insight.trim() || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save preferences');
      }

      const result = await response.json();
      onComplete(result.preferences);

    } catch (error) {
      console.error('Failed to save Oracle preferences:', error);
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to save preferences' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0F1B] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-2 border-[#F6E27F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Preparing Oracle configuration...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0F1B] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <circle cx="32" cy="32" r="24" fill="none" stroke="#F6E27F" strokeWidth="2" opacity="0.8" />
              <circle cx="32" cy="32" r="16" fill="none" stroke="#F6E27F" strokeWidth="1" opacity="0.6" />
              <circle cx="32" cy="32" r="8" fill="none" stroke="#F6E27F" strokeWidth="1" opacity="0.4" />
            </svg>
          </motion.div>
          
          <h1 className="text-3xl font-light text-[#F6E27F] mb-3">
            Configure Your Oracle
          </h1>
          <p className="text-gray-300 leading-relaxed">
            Personalize your guide with a name and voice that resonates with your practice.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Oracle Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-[#F6E27F] font-medium mb-2">
              Name Your Oracle
            </label>
            <input
              type="text"
              value={formData.oracle_name}
              onChange={(e) => setFormData(prev => ({ ...prev, oracle_name: e.target.value }))}
              placeholder="Enter a name for your Oracle..."
              className="w-full px-4 py-3 bg-[#1A1C2C] border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-[#F6E27F] focus:outline-none transition-colors"
              maxLength={40}
              disabled={saving}
            />
            <div className="flex justify-between mt-1">
              {errors.oracle_name && (
                <span className="text-red-400 text-sm">{errors.oracle_name}</span>
              )}
              <span className="text-gray-500 text-xs ml-auto">
                {formData.oracle_name.length}/40
              </span>
            </div>
          </motion.div>

          {/* Voice Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <label className="block text-[#F6E27F] font-medium mb-2">
              Choose Voice
            </label>
            <div className="flex gap-3">
              <select
                value={formData.oracle_voice}
                onChange={(e) => setFormData(prev => ({ ...prev, oracle_voice: e.target.value }))}
                className="flex-1 px-4 py-3 bg-[#1A1C2C] border border-gray-600 text-white rounded-lg focus:border-[#F6E27F] focus:outline-none transition-colors"
                disabled={saving}
              >
                <option value="">Select a voice...</option>
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} - {voice.description}
                  </option>
                ))}
              </select>
              
              <button
                type="button"
                onClick={() => formData.oracle_voice && handleVoicePreview(formData.oracle_voice)}
                disabled={!formData.oracle_voice || saving}
                className={`px-4 py-3 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  playingVoice === formData.oracle_voice
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-gray-600 text-gray-300 hover:border-[#F6E27F] hover:text-[#F6E27F]'
                }`}
              >
                {playingVoice === formData.oracle_voice ? '⏸️' : '▶️'}
              </button>
            </div>
            {errors.oracle_voice && (
              <span className="text-red-400 text-sm mt-1 block">{errors.oracle_voice}</span>
            )}
          </motion.div>

          {/* Optional Insight */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <label className="block text-[#F6E27F] font-medium mb-2">
              Why This Choice? <span className="text-gray-400 text-sm font-normal">(Optional)</span>
            </label>
            <textarea
              value={formData.insight}
              onChange={(e) => setFormData(prev => ({ ...prev, insight: e.target.value }))}
              placeholder="What drew you to this name and voice? This insight will be preserved..."
              className="w-full px-4 py-3 bg-[#1A1C2C] border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-[#F6E27F] focus:outline-none transition-colors resize-none"
              rows={3}
              maxLength={300}
              disabled={saving}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.insight.length}/300
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={saving || !formData.oracle_name.trim() || !formData.oracle_voice}
              className="w-full bg-[#F6E27F] text-[#0E0F1B] py-3 px-6 rounded-lg font-medium hover:bg-[#F6E27F]/90 disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#0E0F1B] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving Oracle...
                </span>
              ) : (
                'Save & Begin'
              )}
            </button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          Powered by Spiralogic™ • Ensouled by Soullab®
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OracleOnboarding;