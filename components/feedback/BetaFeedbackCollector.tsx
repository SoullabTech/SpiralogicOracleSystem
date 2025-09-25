/**
 * Beta Feedback Collection Component
 * Captures authentic user experience insights
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackData {
  experience: string;
  mostValuable: string;
  improvements: string;
  emotionalResonance: number;
  likelyToRecommend: number;
  additionalThoughts: string;
  userType: string;
  sessionContext: string;
}

interface BetaFeedbackCollectorProps {
  trigger?: string; // 'onboarding-complete', 'session-end', 'manual'
  onComplete?: (feedback: FeedbackData) => void;
}

export default function BetaFeedbackCollector({ 
  trigger = 'manual',
  onComplete 
}: BetaFeedbackCollectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<Partial<FeedbackData>>({
    emotionalResonance: 5,
    likelyToRecommend: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    {
      question: "How would you describe your experience with Soullab?",
      key: "experience" as keyof FeedbackData,
      type: "textarea",
      placeholder: "Share what this experience felt like for you..."
    },
    {
      question: "What was most valuable about your time here?",
      key: "mostValuable" as keyof FeedbackData,
      type: "textarea",
      placeholder: "What resonated most deeply?"
    },
    {
      question: "On a scale of 1-10, how much did this resonate emotionally?",
      key: "emotionalResonance" as keyof FeedbackData,
      type: "slider",
      min: 1,
      max: 10
    },
    {
      question: "What would you change or improve?",
      key: "improvements" as keyof FeedbackData,
      type: "textarea",
      placeholder: "Areas that could be refined or enhanced..."
    },
    {
      question: "How likely are you to recommend this to a close friend?",
      key: "likelyToRecommend" as keyof FeedbackData,
      type: "slider",
      min: 1,
      max: 10
    },
    {
      question: "Any other thoughts or insights?",
      key: "additionalThoughts" as keyof FeedbackData,
      type: "textarea",
      placeholder: "Anything else you'd like to share..."
    }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const finalFeedback: FeedbackData = {
      ...feedback,
      userType: "beta-tester",
      sessionContext: trigger,
    } as FeedbackData;

    try {
      // Send to your feedback API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalFeedback)
      });

      if (response.ok) {
        onComplete?.(finalFeedback);
        setIsOpen(false);
        setCurrentStep(0);
        setFeedback({ emotionalResonance: 5, likelyToRecommend: 5 });
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium"
      >
        ✨ Share Feedback
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Beta Experience
                </h2>
                <p className="text-gray-600">
                  Help us understand how Soullab felt for you
                </p>
                <div className="flex justify-center mt-4 space-x-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-8 rounded-full transition-colors ${
                        index <= currentStep ? 'bg-amber-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Current Question */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {currentStepData.question}
                </h3>

                {currentStepData.type === 'textarea' && (
                  <textarea
                    value={feedback[currentStepData.key] as string || ''}
                    onChange={(e) => setFeedback({
                      ...feedback,
                      [currentStepData.key]: e.target.value
                    })}
                    placeholder={currentStepData.placeholder}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  />
                )}

                {currentStepData.type === 'slider' && (
                  <div className="space-y-4">
                    <input
                      type="range"
                      min={currentStepData.min}
                      max={currentStepData.max}
                      value={feedback[currentStepData.key] as number || 5}
                      onChange={(e) => setFeedback({
                        ...feedback,
                        [currentStepData.key]: parseInt(e.target.value)
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{currentStepData.min}</span>
                      <span className="font-medium text-amber-600">
                        {feedback[currentStepData.key] as number || 5}
                      </span>
                      <span>{currentStepData.max}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    if (currentStep > 0) {
                      setCurrentStep(currentStep - 1);
                    } else {
                      setIsOpen(false);
                    }
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {currentStep === 0 ? 'Cancel' : 'Back'}
                </button>

                <button
                  onClick={() => {
                    if (isLastStep) {
                      handleSubmit();
                    } else {
                      setCurrentStep(currentStep + 1);
                    }
                  }}
                  disabled={isSubmitting}
                  className="px-8 py-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-lg hover:from-amber-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : isLastStep ? 'Share Feedback' : 'Next'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}