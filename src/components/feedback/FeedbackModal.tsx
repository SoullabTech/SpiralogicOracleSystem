import React from 'react';
import { FeedbackForm } from './FeedbackForm';
import { ElementalType } from '../../types';

interface FeedbackModalProps {
  isOpen: boolean;
  element: ElementalType;
  tone: 'insight' | 'symbolic';
  sessionId?: string;
  onClose: () => void;
  onSubmit?: (success: boolean) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  element,
  tone,
  sessionId,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <FeedbackForm
            element={element}
            tone={tone}
            sessionId={sessionId}
            onSubmit={onSubmit}
            onClose={onClose}
          />
        </div>
      </div>

      <style jsx>{`
        .fixed {
          animation: fadeIn 0.2s ease-out;
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
    </>
  );
};