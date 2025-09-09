'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiStar, FiHeart, FiX, FiSend } from 'react-icons/fi';
import { useAuth } from '@/lib/hooks/useAuth';

interface FeedbackEntry {
  id: string;
  type: 'experience' | 'feature' | 'bug' | 'suggestion';
  rating: number;
  content: string;
  category: string;
  emotionalResonance: string;
  timestamp: Date;
}

interface BetaFeedbackSystemProps {
  trigger?: 'floating' | 'inline' | 'modal';
  sessionContext?: string; // Which part of the app triggered this
}

export function BetaFeedbackSystem({ 
  trigger = 'floating', 
  sessionContext = 'general' 
}: BetaFeedbackSystemProps) {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'trigger' | 'rating' | 'feedback' | 'thanks'>('trigger');
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState<FeedbackEntry['type']>('experience');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [emotionalResonance, setEmotionalResonance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auto-trigger feedback prompts based on session events
  useEffect(() => {
    if (trigger === 'floating' && isAuthenticated) {
      // Show feedback prompt after meaningful interactions
      const timer = setTimeout(() => {
        if (Math.random() < 0.15) { // 15% chance after 30 seconds
          setIsOpen(true);
        }
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, isAuthenticated]);

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim() || rating === 0) return;
    
    setIsSubmitting(true);
    
    try {
      const feedbackData: Omit<FeedbackEntry, 'id'> = {
        type: feedbackType,
        rating,
        content: feedbackContent.trim(),
        category: sessionContext,
        emotionalResonance,
        timestamp: new Date()
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedbackData,
          userId: user?.id,
          userSacredName: user?.sacredName
        }),
      });

      if (response.ok) {
        setCurrentStep('thanks');
        setTimeout(() => {
          setIsOpen(false);
          resetForm();
        }, 3000);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Still show thanks to not frustrate user
      setCurrentStep('thanks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('trigger');
    setRating(0);
    setFeedbackType('experience');
    setFeedbackContent('');
    setEmotionalResonance('');
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`p-1 rounded transition-colors ${
            star <= value 
              ? 'text-yellow-400 hover:text-yellow-300' 
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <FiStar className={`w-6 h-6 ${star <= value ? 'fill-current' : ''}`} />
        </button>
      ))}
    </div>
  );

  const EmotionalResonanceSelector = () => (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">How did this experience feel?</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { key: 'inspiring', label: '✨ Inspiring', color: 'violet' },
          { key: 'calming', label: '🌙 Calming', color: 'blue' },
          { key: 'energizing', label: '⚡ Energizing', color: 'yellow' },
          { key: 'grounding', label: '🌱 Grounding', color: 'green' },
          { key: 'challenging', label: '🔥 Challenging', color: 'orange' },
          { key: 'confusing', label: '❓ Confusing', color: 'slate' }
        ].map((emotion) => (
          <button
            key={emotion.key}
            onClick={() => setEmotionalResonance(emotion.key)}
            className={`p-3 rounded-lg text-sm transition-all ${
              emotionalResonance === emotion.key
                ? 'bg-violet-100 border-violet-300 text-violet-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            } border`}
          >
            {emotion.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (trigger === 'floating' && !isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      >
        <FiMessageCircle className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Feedback Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiHeart className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-medium">Sacred Feedback</h2>
                    <p className="text-violet-100 text-sm">Help us evolve this experience</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Rating */}
                {currentStep === 'trigger' && (
                  <motion.div
                    key="rating"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-4">
                      <h3 className="text-lg font-medium text-slate-800">
                        How was your sacred journey today?
                      </h3>
                      <StarRating value={rating} onChange={setRating} />
                    </div>

                    {rating > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-slate-700">What would you like to share?</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { key: 'experience', label: '✨ Overall Experience' },
                              { key: 'feature', label: '🛠️ Feature Feedback' },
                              { key: 'bug', label: '🐛 Bug Report' },
                              { key: 'suggestion', label: '💡 Suggestion' }
                            ].map((type) => (
                              <button
                                key={type.key}
                                onClick={() => setFeedbackType(type.key as FeedbackEntry['type'])}
                                className={`p-3 rounded-lg text-sm transition-all ${
                                  feedbackType === type.key
                                    ? 'bg-violet-100 border-violet-300 text-violet-800'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                } border`}
                              >
                                {type.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => setCurrentStep('feedback')}
                          className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium hover:from-violet-500 hover:to-indigo-500 transition-all duration-200"
                        >
                          Continue Sharing
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Detailed Feedback */}
                {currentStep === 'feedback' && (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Share your thoughts with Maya's development team:
                        </label>
                        <textarea
                          value={feedbackContent}
                          onChange={(e) => setFeedbackContent(e.target.value)}
                          placeholder="Your insights help us create more meaningful sacred experiences..."
                          className="w-full h-32 p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>

                      <EmotionalResonanceSelector />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setCurrentStep('trigger')}
                        className="flex-1 py-3 border border-slate-300 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmitFeedback}
                        disabled={!feedbackContent.trim() || isSubmitting}
                        className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <FiSend className="w-4 h-4" />
                            <span>Send Sacred Feedback</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Thank You */}
                {currentStep === 'thanks' && (
                  <motion.div
                    key="thanks"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4 py-8"
                  >
                    <div className="text-6xl">🙏</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-medium text-slate-800">Sacred Gratitude</h3>
                      <p className="text-slate-600">
                        Your wisdom helps Maya grow and serve the community more deeply. 
                        Thank you for contributing to this sacred technology!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Lightweight inline feedback component
export function InlineFeedbackPrompt({ onFeedback }: { onFeedback: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-violet-50 border border-violet-200 rounded-lg p-4 text-center"
    >
      <p className="text-sm text-violet-800 mb-3">
        ✨ How was your sacred dialogue with Maya?
      </p>
      <button
        onClick={onFeedback}
        className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-500 transition-colors"
      >
        Share Your Experience
      </button>
    </motion.div>
  );
}

// Context-aware feedback triggers
export function useFeedbackTriggers() {
  const [shouldShowFeedback, setShouldShowFeedback] = useState(false);

  const triggerFeedback = (context: string, delay: number = 1000) => {
    setTimeout(() => {
      if (Math.random() < 0.25) { // 25% chance
        setShouldShowFeedback(true);
      }
    }, delay);
  };

  const hideFeedback = () => setShouldShowFeedback(false);

  return {
    shouldShowFeedback,
    triggerFeedback,
    hideFeedback
  };
}