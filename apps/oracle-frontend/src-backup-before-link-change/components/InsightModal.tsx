// src/components/InsightModal.tsx
import React from 'react';

interface InsightModalProps {
  insight: string;
  onClose: () => void;
}
const voice = getVoiceProfile(user?.orgId) ;

const InsightModal: React.FC<InsightModalProps> = ({ insight, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-xl">
        <h2 className="text-xl font-semibold text-center">Your Oracle Insight</h2>
        <p className="mt-4 text-lg">{insight}</p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightModal;
