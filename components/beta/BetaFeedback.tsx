'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Star, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface FeedbackData {
  category: 'petal' | 'ritual' | 'journal' | 'voice' | 'analytics' | 'general';
  rating: number;
  resonance: string;
  insight: string;
  suggestions: string;
  emotionalShift: {
    before: string;
    after: string;
  };
  wouldRecommend: boolean;
}

export function BetaFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<Partial<FeedbackData>>({
    category: 'general',
    rating: 0,
    resonance: '',
    insight: '',
    suggestions: '',
    emotionalShift: { before: '', after: '' },
    wouldRecommend: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const categories = [
    { id: 'petal', label: 'Petal Experience', icon: '🌸' },
    { id: 'ritual', label: 'Ritual Practice', icon: '🕯️' },
    { id: 'journal', label: 'Journal Flow', icon: '📖' },
    { id: 'voice', label: 'Voice Guidance', icon: '🎤' },
    { id: 'analytics', label: 'Soul Map', icon: '📊' },
    { id: 'general', label: 'Overall Oracle', icon: '✨' }
  ];

  const emotionalStates = [
    { id: 'dense', label: 'Dense', emoji: '🌫️' },
    { id: 'heavy', label: 'Heavy', emoji: '⛈️' },
    { id: 'neutral', label: 'Neutral', emoji: '☁️' },
    { id: 'emerging', label: 'Emerging', emoji: '🌤️' },
    { id: 'light', label: 'Light', emoji: '☀️' },
    { id: 'radiant', label: 'Radiant', emoji: '✨' }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase.from('beta_feedback').insert({
          user_id: user?.id || 'anonymous',
          ...feedback,
          created_at: new Date().toISOString()
        });
      }
      
      // Also save locally for offline scenarios
      const existingFeedback = JSON.parse(localStorage.getItem('beta_feedback') || '[]');
      existingFeedback.push({ ...feedback, timestamp: Date.now() });
      localStorage.setItem('beta_feedback', JSON.stringify(existingFeedback));
      
      setShowThankYou(true);
      setTimeout(() => {
        setIsOpen(false);
        setShowThankYou(false);
        setCurrentStep(0);
        setFeedback({
          category: 'general',
          rating: 0,
          resonance: '',
          insight: '',
          suggestions: '',
          emotionalShift: { before: '', after: '' },
          wouldRecommend: false
        });
      }, 3000);
    } catch (error) {
      console.error('Error saving feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    // Step 0: Category Selection
    {
      title: 'What aspect would you like to reflect on?',
      content: (
        <div className="grid grid-cols-2 gap-3">
          {categories.map(cat => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFeedback(prev => ({ ...prev, category: cat.id as any }));
                setCurrentStep(1);
              }}
              className={`p-4 rounded-xl border transition-all ${
                feedback.category === cat.id
                  ? 'bg-amber-600/20 border-amber-500'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <p className="text-white/80 text-sm">{cat.label}</p>
            </motion.button>
          ))}
        </div>
      )
    },
    
    // Step 1: Rating
    {
      title: 'How resonant was this experience?',
      content: (
        <div>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                className="text-3xl"
              >
                <Star
                  className={`w-8 h-8 ${
                    (feedback.rating || 0) >= star
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-white/30'
                  }`}
                />
              </motion.button>
            ))}
          </div>
          <p className="text-center text-white/60 text-sm">
            {feedback.rating === 1 && 'Not resonant'}
            {feedback.rating === 2 && 'Slightly resonant'}
            {feedback.rating === 3 && 'Moderately resonant'}
            {feedback.rating === 4 && 'Very resonant'}
            {feedback.rating === 5 && 'Deeply resonant'}
          </p>
          {feedback.rating && (
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      )
    },
    
    // Step 2: Emotional Shift
    {
      title: 'How did your energy shift?',
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-white/60 text-sm mb-2">Before the experience:</p>
            <div className="grid grid-cols-3 gap-2">
              {emotionalStates.map(state => (
                <button
                  key={state.id}
                  onClick={() => setFeedback(prev => ({
                    ...prev,
                    emotionalShift: { ...prev.emotionalShift!, before: state.id }
                  }))}
                  className={`p-2 rounded-lg text-sm ${
                    feedback.emotionalShift?.before === state.id
                      ? 'bg-amber-600/30 border border-amber-500'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xl">{state.emoji}</div>
                  <p className="text-white/70 text-xs">{state.label}</p>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-white/60 text-sm mb-2">After the experience:</p>
            <div className="grid grid-cols-3 gap-2">
              {emotionalStates.map(state => (
                <button
                  key={state.id}
                  onClick={() => setFeedback(prev => ({
                    ...prev,
                    emotionalShift: { ...prev.emotionalShift!, after: state.id }
                  }))}
                  className={`p-2 rounded-lg text-sm ${
                    feedback.emotionalShift?.after === state.id
                      ? 'bg-amber-600/30 border border-amber-500'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xl">{state.emoji}</div>
                  <p className="text-white/70 text-xs">{state.label}</p>
                </button>
              ))}
            </div>
          </div>
          
          {feedback.emotionalShift?.before && feedback.emotionalShift?.after && (
            <button
              onClick={() => setCurrentStep(3)}
              className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      )
    },
    
    // Step 3: Resonance & Insights
    {
      title: 'What resonated most deeply?',
      content: (
        <div className="space-y-4">
          <textarea
            value={feedback.resonance || ''}
            onChange={(e) => setFeedback(prev => ({ ...prev, resonance: e.target.value }))}
            placeholder="What aspect touched your soul?"
            className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 resize-none"
          />
          
          <textarea
            value={feedback.insight || ''}
            onChange={(e) => setFeedback(prev => ({ ...prev, insight: e.target.value }))}
            placeholder="What insight emerged for you?"
            className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 resize-none"
          />
          
          <button
            onClick={() => setCurrentStep(4)}
            className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      )
    },
    
    // Step 4: Suggestions & Recommendation
    {
      title: 'Help us evolve the Oracle',
      content: (
        <div className="space-y-4">
          <textarea
            value={feedback.suggestions || ''}
            onChange={(e) => setFeedback(prev => ({ ...prev, suggestions: e.target.value }))}
            placeholder="What would make this experience even more sacred?"
            className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 resize-none"
          />
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <p className="text-white/80">Would you recommend the Oracle to others?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setFeedback(prev => ({ ...prev, wouldRecommend: true }))}
                className={`px-4 py-2 rounded-lg ${
                  feedback.wouldRecommend === true
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setFeedback(prev => ({ ...prev, wouldRecommend: false }))}
                className={`px-4 py-2 rounded-lg ${
                  feedback.wouldRecommend === false
                    ? 'bg-red-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                No
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Complete Reflection
              </>
            )}
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      {/* Floating feedback button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        
        {/* Beta badge */}
        <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
          BETA
        </div>
      </motion.button>

      {/* Feedback modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-black to-indigo-950 rounded-3xl p-6 max-w-md w-full border border-amber-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              {showThankYou ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2 }}
                    className="inline-block text-6xl mb-4"
                  >
                    🙏
                  </motion.div>
                  <h2 className="text-2xl font-light text-white mb-2">
                    Thank You
                  </h2>
                  <p className="text-white/70">
                    Your reflection helps the Oracle evolve
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-light text-white">Beta Reflection</h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Progress dots */}
                  <div className="flex justify-center gap-2 mb-6">
                    {steps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentStep
                            ? 'w-8 bg-amber-500'
                            : idx < currentStep
                            ? 'bg-amber-400'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Current step content */}
                  <div>
                    <h3 className="text-white/90 mb-4">{steps[currentStep].title}</h3>
                    {steps[currentStep].content}
                  </div>

                  {/* Navigation */}
                  {currentStep > 0 && currentStep < steps.length - 1 && (
                    <button
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="mt-4 text-white/60 hover:text-white text-sm"
                    >
                      ← Back
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}