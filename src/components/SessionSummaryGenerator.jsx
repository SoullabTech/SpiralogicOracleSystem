import React, { useState, useEffect } from 'react';
import { Book, Star, Target, Brain, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sessionSummaryManager } from '../lib/sessionSummary';

interface SessionSummaryGeneratorProps {
  sessionId: string;
  onSummaryGenerated?: (summary: any) => void;
}

export default function SessionSummaryGenerator({ sessionId, onSummaryGenerated }: SessionSummaryGeneratorProps) {
  const [session, setSession] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get session data with messages
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          *,
          chat_messages (
            id,
            content,
            sender,
            element,
            insight_type,
            created_at
          )
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      // Check for existing summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('session_summaries')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (summaryError && summaryError.code !== 'PGRST116') throw summaryError;
      if (summaryData) setSummary(summaryData);

    } catch (error) {
      console.error('Error loading session data:', error);
      setError('Failed to load session data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const newSummary = await sessionSummaryManager.generateSessionSummary(
        session.client_id,
        sessionId
      );

      if (newSummary) {
        setSummary(newSummary);
        onSummaryGenerated?.(newSummary);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Failed to generate session summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const getElementColor = (element: string | null): string => {
    const colors = {
      Fire: 'text-orange-500 bg-orange-50 border-orange-200',
      Water: 'text-blue-500 bg-blue-50 border-blue-200',
      Earth: 'text-green-500 bg-green-50 border-green-200',
      Air: 'text-purple-500 bg-purple-50 border-purple-200',
      Aether: 'text-indigo-500 bg-indigo-50 border-indigo-200'
    };
    return colors[element as keyof typeof colors] || 'text-gray-500 bg-gray-50 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center p-8">
        <Book className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600">Session not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Book className="text-purple-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Session Summary</h2>
              <p className="text-sm text-gray-500">
                {new Date(session.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {!summary && (
            <button
              onClick={generateSummary}
              disabled={isGenerating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Summary</span>
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Summary Content */}
      <div className="p-6">
        {summary ? (
          <div className="space-y-6">
            {/* Key Themes */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="text-purple-600" />
                Key Themes
              </h3>
              <div className="grid gap-4">
                {session.insights?.map((insight: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getElementColor(insight.element)}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={16} />
                      <span className="font-medium">{insight.type}</span>
                    </div>
                    <p className="text-gray-700">{insight.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Spiralogic Phase Mapping */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="text-purple-600" />
                Phase Mapping
              </h3>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight size={16} className="text-purple-600" />
                  <span className="font-medium">Current Phase: {session.phase}</span>
                </div>
                <p className="text-gray-700">{summary.content}</p>
              </div>
            </div>

            {/* Integration Tasks */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="text-purple-600" />
                Integration Tasks
              </h3>
              <div className="space-y-3">
                {session.patterns?.map((pattern: any, index: number) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-700">{pattern}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Indicators */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="text-purple-600" />
                Growth Indicators
              </h3>
              <div className="grid gap-4">
                {session.growth_indicators?.map((indicator: any, index: number) => (
                  <div key={index} className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{indicator.name}</span>
                      <span className="text-green-600">{indicator.value}%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${indicator.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Analysis */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="text-purple-600" />
                Message Analysis
              </h3>
              <div className="space-y-4">
                {session.chat_messages?.map((message: any) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border ${
                      message.element ? getElementColor(message.element) : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium capitalize">{message.sender}</span>
                      {message.element && (
                        <span className={`px-2 py-1 text-xs rounded-full ${getElementColor(message.element)}`}>
                          {message.element}
                        </span>
                      )}
                      {message.insight_type && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          {message.insight_type}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">
              Generate a summary to see key themes, patterns, and recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}