import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, Shield, Check, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SessionFeedbackProps {
  sessionId: string;
  isPractitioner?: boolean;
  onFeedbackSubmitted?: () => void;
}

interface Feedback {
  id: string;
  rating: number;
  feedback_type: string;
  comment: string | null;
  created_at: string;
}

interface Message {
  id: string;
  content: string;
  element: string | null;
  insight_type: string | null;
  created_at: string;
}

export default function SessionFeedback({ sessionId, isPractitioner = false, onFeedbackSubmitted }: SessionFeedbackProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [feedbackType, setFeedbackType] = useState<'helpful' | 'unhelpful'>('helpful');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
  }, [sessionId]);

  const loadFeedback = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load session messages
      const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .select('id, content, element, insight_type, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messageError) throw messageError;
      setMessages(messageData || []);

      // Load existing feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('oracle_feedback')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;
      setFeedback(feedbackData || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
      setError('Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMessage || !rating) {
      setError('Please select a message and provide a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const { error: feedbackError } = await supabase
        .rpc('add_oracle_feedback', {
          p_session_id: sessionId,
          p_message_id: selectedMessage,
          p_rating: rating,
          p_feedback_type: feedbackType,
          p_comment: comment || null
        });

      if (feedbackError) throw feedbackError;

      // Reset form
      setSelectedMessage(null);
      setRating(0);
      setComment('');
      setFeedbackType('helpful');

      // Reload feedback
      await loadFeedback();
      onFeedbackSubmitted?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getElementColor = (element: string | null): string => {
    const colors = {
      Fire: 'text-orange-500',
      Water: 'text-blue-500',
      Earth: 'text-green-500',
      Air: 'text-purple-500',
      Aether: 'text-indigo-500'
    };
    return colors[element as keyof typeof colors] || 'text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-2">
          <X size={18} className="flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Feedback Form */}
      {!isPractitioner && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="text-purple-600" />
            Provide Feedback
          </h3>

          <div className="space-y-4">
            {/* Message Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Message
              </label>
              <div className="space-y-2">
                {messages.map(message => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedMessage === message.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.element && (
                        <span className={`text-sm ${getElementColor(message.element)}`}>
                          {message.element}
                        </span>
                      )}
                      {message.insight_type && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {message.insight_type}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    onClick={() => setRating(value)}
                    className={`p-2 rounded-full transition-colors ${
                      rating >= value
                        ? 'text-yellow-500'
                        : 'text-gray-300 hover:text-yellow-500'
                    }`}
                  >
                    <Star size={24} fill={rating >= value ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Was this helpful?
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFeedbackType('helpful')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    feedbackType === 'helpful'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ThumbsUp size={18} />
                  <span>Helpful</span>
                </button>
                <button
                  onClick={() => setFeedbackType('unhelpful')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    feedbackType === 'unhelpful'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ThumbsDown size={18} />
                  <span>Not Helpful</span>
                </button>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border rounded-lg min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Share more about your experience..."
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedMessage || !rating}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Feedback Display */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="text-purple-600" />
          Session Feedback
        </h3>

        {feedback.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No feedback has been provided yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-lg ${
                  item.feedback_type === 'helpful'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {item.feedback_type === 'helpful' ? (
                      <ThumbsUp size={18} className="text-green-600" />
                    ) : (
                      <ThumbsDown size={18} className="text-red-600" />
                    )}
                    <span className="font-medium">
                      {item.feedback_type === 'helpful' ? 'Helpful' : 'Not Helpful'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(value => (
                      <Star
                        key={value}
                        size={16}
                        className={value <= item.rating ? 'text-yellow-500' : 'text-gray-300'}
                        fill={value <= item.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>

                {item.comment && (
                  <p className="text-gray-700 mt-2">{item.comment}</p>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}