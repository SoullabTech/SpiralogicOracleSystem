'use client';

import { useState, useEffect } from 'react';

interface RecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  userId?: string;
}

interface ThreadWeave {
  id: string;
  text: string;
  userQuote: string;
  weavedFromCount: number;
  timestamp: string;
}

export function RecapModal({ isOpen, onClose, conversationId, userId }: RecapModalProps) {
  const [threadWeaves, setThreadWeaves] = useState<ThreadWeave[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && conversationId) {
      fetchThreadWeaves();
    }
  }, [isOpen, conversationId]);

  const fetchThreadWeaves = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch thread weaves from Soul Memory
      const response = await fetch(`/api/soul-memory/memories?type=thread_weave&conversationId=${conversationId}&limit=3`);
      
      if (response.ok) {
        const memories = await response.json();
        
        const weaves = memories.map((memory: any) => ({
          id: memory.id,
          text: memory.oracleResponse || memory.content,
          userQuote: memory.metadata?.userQuote || 'your sharing',
          weavedFromCount: memory.metadata?.weavedFromCount || 0,
          timestamp: memory.createdAt || memory.timestamp,
        }));
        
        setThreadWeaves(weaves);
      } else {
        setError('Failed to fetch thread weaves');
      }
    } catch (err) {
      setError('Network error');
      console.error('Failed to fetch thread weaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNextStepSuggestion = (weave: ThreadWeave): string => {
    // Generate contextual next step based on the weave content
    const suggestions = [
      "Consider journaling about what emerged in this space",
      "Set a gentle reminder to revisit this thread in a few days", 
      "Practice sitting with the question that arose",
      "Notice how this theme appears in your daily life",
      "Share this insight with someone you trust",
    ];
    
    // Simple hash to pick consistent suggestion based on content
    const hash = weave.text.length + weave.userQuote.length;
    return suggestions[hash % suggestions.length];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              🧵 Thread Weaving
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Here's what we're holding from your journey
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Gathering threads...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && threadWeaves.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No thread weaves found for this conversation yet.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Continue the conversation to see woven insights emerge.
              </p>
            </div>
          )}

          {threadWeaves.length > 0 && (
            <div className="space-y-6">
              {threadWeaves.map((weave, index) => (
                <div key={weave.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  
                  {/* Thread Weave Content */}
                  <div className="mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white leading-relaxed">
                          {weave.text}
                        </p>
                        
                        {/* Metadata */}
                        <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                          <span>Woven from {weave.weavedFromCount} exchanges</span>
                          <span>•</span>
                          <span>{new Date(weave.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Step Suggestion */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Next tiny step:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {getNextStepSuggestion(weave)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Threads are saved to Soul Memory
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}