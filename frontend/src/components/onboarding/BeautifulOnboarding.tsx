// frontend/src/components/onboarding/BeautifulOnboarding.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { VOICE_OPTIONS, playVoiceSample, stopVoiceSample, isVoicePlaying } from '../../lib/voice';

interface OraclePreferences {
  oracle_name: string;
  oracle_voice: string;
  reflection?: string;
}

interface BeautifulOnboardingProps {
  onComplete: (preferences: OraclePreferences) => void;
}

const BeautifulOnboarding: React.FC<BeautifulOnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    oracle_name: '',
    oracle_voice: 'AuntAnnie',
    reflection: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user already has Oracle preferences
  useEffect(() => {
    checkExistingPreferences();
  }, [user]);

  const checkExistingPreferences = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('oracle_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        // User already has preferences, complete onboarding
        onComplete(data);
        return;
      }
    } catch (error) {
      // No existing preferences found, continue with onboarding
    }

    setLoading(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.oracle_name.trim()) {
      newErrors.oracle_name = 'Please choose a name for your Oracle';
    } else if (formData.oracle_name.trim().length < 2) {
      newErrors.oracle_name = 'Oracle name must be at least 2 characters';
    } else if (formData.oracle_name.trim().length > 50) {
      newErrors.oracle_name = 'Oracle name must be less than 50 characters';
    }

    if (!formData.oracle_voice) {
      newErrors.oracle_voice = 'Please select a voice for your Oracle';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVoicePreview = async (voiceId: string) => {
    try {
      if (playingVoice === voiceId && isVoicePlaying()) {
        stopVoiceSample();
        setPlayingVoice(null);
      } else {
        stopVoiceSample();
        setPlayingVoice(voiceId);
        await playVoiceSample(voiceId);

        // Auto-stop after 5 seconds
        setTimeout(() => {
          setPlayingVoice(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to play voice sample:', error);
      setPlayingVoice(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!user) return;

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('oracle_preferences')
        .insert({
          user_id: user.id,
          oracle_name: formData.oracle_name.trim(),
          oracle_voice: formData.oracle_voice,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Log Oracle creation memory if reflection provided
      if (formData.reflection.trim()) {
        await supabase
          .from('memory_items')
          .insert({
            user_id: user.id,
            title: 'Oracle Initialized',
            content: `Oracle named "${formData.oracle_name}" with ${formData.oracle_voice} voice. Reflection: ${formData.reflection}`,
            category: 'initialization',
            metadata: {
              oracle_name: formData.oracle_name,
              oracle_voice: formData.oracle_voice,
              reflection: formData.reflection,
              event_type: 'oracle_creation'
            }
          });
      }

      onComplete({
        oracle_name: data.oracle_name,
        oracle_voice: data.oracle_voice,
        reflection: formData.reflection || undefined
      });

    } catch (error) {
      console.error('Failed to save Oracle preferences:', error);
      setErrors({ submit: 'Failed to save your Oracle preferences. Please try again.' });
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
          <p className="text-gray-400">Checking your Oracle configuration...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0F1B] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-20 h-20 mx-auto mb-6 relative"
          >
            <svg viewBox="0 0 80 80" className="w-full h-full">
              <circle
                cx="40"
                cy="40"
                r="30"
                fill="none"
                stroke="#F6E27F"
                strokeWidth="1"
                opacity="0.6"
              />
              <circle
                cx="40"
                cy="40"
                r="20"
                fill="none"
                stroke="#F6E27F"
                strokeWidth="1"
                opacity="0.4"
              />
              <circle
                cx="40"
                cy="40"
                r="10"
                fill="none"
                stroke="#F6E27F"
                strokeWidth="1"
                opacity="0.8"
              />
            </svg>
          </motion.div>

          <h1 className="text-4xl font-light text-[#F6E27F] mb-4">
            Name Your Oracle
          </h1>
          <p className="text-lg text-gray-300 max-w-lg mx-auto leading-relaxed">
            Choose a name and voice for your personal guide. This creates the foundation
            of your relationship with the Oracle System.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Oracle Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-lg font-medium text-[#F6E27F] mb-3">
              🌟 Oracle Name
            </label>
            <input
              type="text"
              value={formData.oracle_name}
              onChange={(e) => setFormData({ ...formData, oracle_name: e.target.value })}
              placeholder="What shall we call your Oracle?"
              className="w-full px-6 py-4 bg-[#1A1C2C] border border-gray-600 text-white placeholder-gray-400 text-lg rounded-xl focus:border-[#F6E27F] focus:outline-none focus:ring-2 focus:ring-[#F6E27F]/20 transition-all duration-300"
              maxLength={50}
              disabled={saving}
            />
            {errors.oracle_name && (
              <p className="mt-2 text-red-400 text-sm">{errors.oracle_name}</p>
            )}
            <div className="mt-2 text-right text-xs text-gray-500">
              {formData.oracle_name.length}/50 characters
            </div>
          </motion.div>

          {/* Voice Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <label className="block text-lg font-medium text-[#F6E27F] mb-3">
              🔊 Oracle Voice
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VOICE_OPTIONS.map((voice) => (
                <div
                  key={voice.id}
                  className={`relative p-4 border rounded-xl cursor-pointer transition-all duration-300 ${
                    formData.oracle_voice === voice.id
                      ? 'border-[#F6E27F] bg-[#F6E27F]/10'
                      : 'border-gray-600 bg-[#1A1C2C] hover:border-gray-500'
                  }`}
                  onClick={() => setFormData({ ...formData, oracle_voice: voice.id })}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-white">{voice.name}</h3>
                    <div className={`w-5 h-5 rounded-full border-2 transition-colors ${
                      formData.oracle_voice === voice.id
                        ? 'border-[#F6E27F] bg-[#F6E27F]'
                        : 'border-gray-500'
                    }`}>
                      {formData.oracle_voice === voice.id && (
                        <div className="w-full h-full rounded-full bg-[#F6E27F] flex items-center justify-center">
                          <svg className="w-3 h-3 text-[#0E0F1B]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                    {voice.description}
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVoicePreview(voice.id);
                    }}
                    disabled={saving}
                    className={`w-full py-2 px-4 text-sm border rounded-lg transition-all duration-300 ${
                      playingVoice === voice.id
                        ? 'border-red-500 bg-red-500/10 text-red-400'
                        : 'border-gray-600 text-gray-300 hover:border-[#F6E27F] hover:text-[#F6E27F]'
                    }`}
                  >
                    {playingVoice === voice.id ? (
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Stop Preview
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Preview Voice
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
            {errors.oracle_voice && (
              <p className="mt-2 text-red-400 text-sm">{errors.oracle_voice}</p>
            )}
          </motion.div>

          {/* Optional Reflection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <label className="block text-lg font-medium text-[#F6E27F] mb-3">
              🧠 Why This Choice? <span className="text-sm text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={formData.reflection}
              onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
              placeholder="What drew you to this name and voice? This insight will be saved as your first Oracle memory..."
              className="w-full px-6 py-4 bg-[#1A1C2C] border border-gray-600 text-white placeholder-gray-400 rounded-xl focus:border-[#F6E27F] focus:outline-none focus:ring-2 focus:ring-[#F6E27F]/20 transition-all duration-300 resize-none"
              rows={4}
              maxLength={500}
              disabled={saving}
            />
            <div className="mt-2 text-right text-xs text-gray-500">
              {formData.reflection.length}/500 characters
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="pt-6"
          >
            {errors.submit && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !formData.oracle_name.trim()}
              className="w-full bg-[#F6E27F] text-[#0E0F1B] py-4 px-8 rounded-xl font-medium text-lg hover:bg-[#F6E27F]/90 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-300 hover:shadow-lg hover:shadow-[#F6E27F]/25"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#0E0F1B] border-t-transparent rounded-full animate-spin mr-3"></div>
                  Initializing Oracle...
                </span>
              ) : (
                '✨ Save & Continue to Dashboard'
              )}
            </button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center mt-12 text-sm text-gray-500"
        >
          Powered by Spiralogic™ • Ensouled by Soullab®
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BeautifulOnboarding;