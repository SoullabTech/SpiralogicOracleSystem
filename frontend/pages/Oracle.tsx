import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ElementalProfile } from '../components/ElementalProfile';
import { OracleDashboard } from '../components/OracleDashboard';
import { FeedbackWidget } from '../components/FeedbackWidget';
import type { AIResponse } from '../types/ai';

export function Oracle() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<AIResponse[]>([]);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate('/login');
    return null;
  }

  const oracleMutation = useMutation({
    mutationFn: async (input: string) => {
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get Oracle response');
      }

      return response.json() as Promise<AIResponse>;
    },
    onSuccess: (data) => {
      setResponses(prev => [...prev, data]);
      setQuery('');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await oracleMutation.mutateAsync(query);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-[600px] overflow-y-auto p-6 space-y-6">
              {responses.map((response, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-blue-100 rounded-lg px-4 py-2 max-w-[80%]">
                      <p className="text-blue-900">{query}</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[80%]">
                      <p className="text-gray-900">{response.content}</p>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1 ml-2">
                      {response.metadata.elementalAdjustments && (
                        <div className="space-y-1">
                          <p>Tone: {response.metadata.elementalAdjustments.tone}</p>
                          <p>Style: {response.metadata.elementalAdjustments.style}</p>
                          <p>
                            Emphasis:{' '}
                            {response.metadata.elementalAdjustments.emphasis?.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>

                    <FeedbackWidget
                      responseId={response.metadata.responseId || ''}
                      response={response.content}
                      element={response.metadata.elementalAdjustments?.emphasis?.[0] || 'aether'}
                    />
                  </div>
                </div>
              ))}

              {oracleMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t p-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask the Oracle..."
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={oracleMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={oracleMutation.isPending || !query.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Profile and Dashboard Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <ElementalProfile />
          <OracleDashboard />
        </div>
      </div>
    </div>
  );
}
