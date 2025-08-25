import { useState, useCallback } from 'react';
import { ElementalType } from '../types';

export interface FeedbackState {
  isVisible: boolean;
  element?: ElementalType;
  tone?: 'insight' | 'symbolic';
  sessionId?: string;
}

export const useFeedback = () => {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    isVisible: false,
  });

  const showFeedback = useCallback(
    (element: ElementalType, tone: 'insight' | 'symbolic', sessionId?: string) => {
      setFeedbackState({
        isVisible: true,
        element,
        tone,
        sessionId: sessionId || `session_${Date.now()}`,
      });
    },
    []
  );

  const hideFeedback = useCallback(() => {
    setFeedbackState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const handleFeedbackSubmit = useCallback((success: boolean) => {
    if (success) {
      console.log('Feedback submitted successfully');
      // Could trigger analytics or other side effects here
    } else {
      console.error('Feedback submission failed');
    }
  }, []);

  return {
    feedbackState,
    showFeedback,
    hideFeedback,
    handleFeedbackSubmit,
  };
};