import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitFeedback } from '../services/feedbackService';
import { useAuth } from '../hooks/useAuth';

interface FeedbackWidgetProps {
  responseId: string;
  response: string;
  element: string;
  facet?: string;
}

export function FeedbackWidget({
  responseId,
  response,
  element,
  facet,
}: FeedbackWidgetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const feedbackMutation = useMutation({
    mutationFn: async () => {
      if (!rating || !user) return;
      
      await submitFeedback(user.id, {
        query: '',
        response,
        rating,
        comments: comment,
        metadata: {
          responseId,
          element,
          facet,
          timestamp: new Date().toISOString(),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalityWeights'] });
      queryClient.invalidateQueries({ queryKey: ['aggregatedWisdom'] });
      setIsExpanded(false);
      setRating(null);
      setComment('');
    },
  });

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => {
                setRating(value);
                setIsExpanded(true);
              }}
              className={`w-8 h-8 rounded-full transition-colors ${
                rating === value
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500">
          How helpful was this response?
        </span>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Additional comments (optional)"
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={() => feedbackMutation.mutate()}
              disabled={!rating || feedbackMutation.isPending}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {feedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}

      {feedbackMutation.isError && (
        <div className="mt-2 text-red-600 text-sm">
          Failed to submit feedback. Please try again.
        </div>
      )}
    </div>
  );
}