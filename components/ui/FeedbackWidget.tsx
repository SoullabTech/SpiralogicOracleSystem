'use client';

import { useState } from 'react';
import { MessageCircle, Send, X, Star, AlertCircle, Heart, Zap } from 'lucide-react';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'praise' | 'other'>('other');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);

    try {
      // Store feedback in Supabase or your backend
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback,
          category,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setFeedback('');
          setCategory('other');
        }, 2000);
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      // Still close to avoid frustration
      alert('Thank you for your feedback! We\'ll review it soon.');
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'bug', label: 'Bug Report', icon: AlertCircle, color: 'text-red-400' },
    { value: 'feature', label: 'Feature Request', icon: Zap, color: 'text-gold-divine' },
    { value: 'praise', label: 'Love It', icon: Heart, color: 'text-pink-400' },
    { value: 'other', label: 'Other', icon: Star, color: 'text-neutral-silver' }
  ];

  return (
    <>
      {/* Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gold-divine text-black p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 group"
        aria-label="Send beta feedback"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="absolute -top-8 right-0 bg-black text-gold-divine text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Beta Feedback
        </span>
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-tesla-900 border border-gold-divine/30 rounded-lg shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gold-divine/20">
              <h3 className="text-lg font-semibold text-gold-divine">
                Sacred Beta Feedback
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-silver hover:text-gold-divine transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {submitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gold-divine/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gold-divine animate-pulse" />
                </div>
                <p className="text-gold-divine text-lg mb-2">Thank you, Pioneer!</p>
                <p className="text-neutral-silver text-sm">Your feedback shapes the future of Sacred Technology</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4">
                {/* Category Selection */}
                <div className="mb-4">
                  <label className="text-neutral-silver text-sm mb-2 block">
                    What\'s on your mind?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(({ value, label, icon: Icon, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCategory(value as any)}
                        className={`p-3 rounded-lg border transition-all ${
                          category === value
                            ? 'bg-gold-divine/20 border-gold-divine'
                            : 'bg-black/30 border-neutral-silver/20 hover:border-gold-divine/50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                        <span className="text-xs text-neutral-silver">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Text */}
                <div className="mb-4">
                  <label className="text-neutral-silver text-sm mb-2 block">
                    Your Sacred Insight
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-gold-divine/30 rounded-lg text-white placeholder-neutral-silver/50 focus:outline-none focus:border-gold-divine focus:ring-1 focus:ring-gold-divine/50 resize-none"
                    rows={4}
                    placeholder="Share your experience, report bugs, or suggest improvements..."
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !feedback.trim()}
                  className="w-full py-3 bg-gold-divine text-black font-semibold rounded-lg hover:bg-gold-divine/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Feedback
                    </>
                  )}
                </button>

                <p className="text-xs text-neutral-silver/60 text-center mt-3">
                  Your feedback is sacred and helps us evolve
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}