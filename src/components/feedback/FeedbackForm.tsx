import React, { useState } from 'react';
import { ElementalType } from '../../types';

interface FeedbackFormProps {
  element: ElementalType;
  tone: 'insight' | 'symbolic';
  sessionId?: string;
  onSubmit?: (success: boolean) => void;
  onClose?: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  element,
  tone,
  sessionId,
  onSubmit,
  onClose
}) => {
  const [rating, setRating] = useState<number>(0);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const elementEmojis: Record<ElementalType, string> = {
    fire: '🔥',
    water: '🌊',
    earth: '🌍',
    air: '🌬️',
    aether: '🌌'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          element,
          tone,
          feedback: rating,
          user_note: note.trim() || undefined,
          session_id: sessionId
        }),
      });

      const success = response.ok;
      setSubmitted(success);
      
      if (onSubmit) {
        onSubmit(success);
      }

      // Auto-close after 2 seconds if successful
      if (success) {
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      if (onSubmit) onSubmit(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="feedback-success">
        <div className="text-center p-6">
          <div className="text-4xl mb-2">✨</div>
          <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
          <p className="text-gray-600">Your feedback helps us improve the Oracle experience.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-form bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>{elementEmojis[element]}</span>
          How was your {element} oracle session?
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Rate your experience with the {tone} guidance:
          </p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition-colors ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400`}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Any reflections to share? (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Your insights, feelings, or suggestions..."
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {note.length}/500 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            rating === 0 || isSubmitting
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      <style jsx>{`
        .feedback-form {
          animation: slideUp 0.3s ease-out;
        }

        .feedback-success {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};