import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitFeedback } from '../services/feedbackService';
import { useAuth } from '../hooks/useAuth';
import type { FeedbackInput } from '../types/feedback';

interface FeedbackFormProps {
  responseId: string;
  response: string;
  metadata?: Record<string, unknown>;
  onComplete?: () => void;
}

export function FeedbackForm({ responseId, response, metadata, onComplete }: FeedbackFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const feedbackMutation = useMutation({
    mutationFn: (feedback: FeedbackInput) => submitFeedback(user?.id || '', feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbackStats'] });
      setIsSubmitted(true);
      onComplete?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !user) return;

    feedbackMutation.mutate({
      responseId,
      response,
      rating,
      comment: comment.trim() || undefined,
      metadata,
    });
  };

  if (isSubmitted) {
    return (
      <div className="text-center text-green-600 py-2">
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">How helpful was this response?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`w-10 h-10 rounded-full transition-colors ${
                rating === value
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Additional comments (optional)"
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={!rating || feedbackMutation.isPending}
        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {feedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
      </button>

      {feedbackMutation.isError && (
        <div className="text-red-600 text-sm">
          Failed to submit feedback. Please try again.
        </div>
      )}
    </form>
  );
}