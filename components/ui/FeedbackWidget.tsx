'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, CheckCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const supabase = createClientComponentClient();

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      // Store feedback in Supabase
      const { error } = await supabase
        .from('beta_feedback')
        .insert({
          feedback: feedback,
          page_url: window.location.pathname,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });

      if (!error) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setFeedback('');
          setIsSubmitted(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Feedback Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gold-divine text-black p-4 rounded-full shadow-lg hover:bg-gold-amber transition-colors z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageSquare className="w-5 h-5" />
      </motion.button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-96 bg-tesla-900 border border-gold-divine/20 rounded-lg shadow-2xl z-50"
          >
            <div className="p-4 border-b border-gold-divine/10">
              <div className="flex items-center justify-between">
                <h3 className="text-gold-divine font-light">Beta Feedback</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-silver hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-12 h-12 text-gold-divine mx-auto mb-3" />
                  <p className="text-white">Thank you for your feedback!</p>
                  <p className="text-neutral-silver text-sm mt-1">
                    Your input shapes Sacred Technology
                  </p>
                </motion.div>
              ) : (
                <>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your experience, report bugs, or suggest improvements..."
                    className="w-full h-32 bg-black/50 border border-gold-divine/20 rounded-lg p-3 text-white placeholder-neutral-mystic focus:outline-none focus:border-gold-divine/40 resize-none"
                    autoFocus
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-neutral-silver text-xs">
                      Help us evolve consciousness technology
                    </p>
                    <button
                      onClick={handleSubmit}
                      disabled={!feedback.trim() || isSubmitting}
                      className="bg-gold-divine text-black px-4 py-2 rounded-lg font-medium hover:bg-gold-amber transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};