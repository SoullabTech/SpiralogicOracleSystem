import { useState } from 'react';

interface ResponseFeedbackProps {
  responseId: string;
  onFeedback: (feedback: { rating: number; comment?: string }) => void;
}

export function ResponseFeedback({ responseId, onFeedback }: ResponseFeedbackProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === null) return; // Ensure rating is selected

    // Send feedback data
    onFeedback({
      rating,
      comment: comment.trim() || undefined, // Only include comment if it's not empty
    });
    setIsSubmitted(true); // Mark feedback as submitted
  };

  // Render submitted message after feedback is sent
  if (isSubmitted) {
    return (
      <div className="text-center text-green-600 py-2">
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {/* Rating selection */}
      <div>
        <p className="text-sm text-gray-600 mb-2">How helpful was this response?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)} // Set rating on click
              className={`w-10 h-10 rounded-full ${
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

      {/* Comment section */}
      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)} // Track comment input
          placeholder="Additional comments (optional)"
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={rating === null} // Disable if no rating is selected
        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Submit Feedback
      </button>
    </form>
  );
}
