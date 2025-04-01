import React, { useState, useEffect } from 'react';
import { Book, Star, Calendar, ArrowRight, Activity, Target, Brain, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ChatInterface } from './ChatInterface';
import { JourneyTimeline } from './JourneyTimeline';
import { InsightPanel } from './InsightPanel';
import { SessionFeedback } from './SessionFeedback';
import { JournalReview } from './JournalReview';

// Test data for development
const TEST_SESSION = {
  id: 'test-session-001',
  element: 'fire',
  phase: 'exploration',
  started_at: new Date().toISOString(),
  ended_at: null,
  summary: null,
  insights: [],
  patterns: [],
  growth_indicators: []
};

const TEST_CLIENT = {
  id: 'test-client-001',
  name: 'Test Client',
  element: 'fire',
  phase: 'exploration',
  archetype: 'Seeker',
  guidance_mode: 'Mentor',
  preferred_tone: 'Direct'
};

interface OracleSessionHubProps {
  clientId: string;
  isPractitioner?: boolean;
}

interface Session {
  id: string;
  element: string;
  phase: string;
  started_at: string;
  ended_at: string | null;
  summary: string | null;
  insights: any[];
  patterns: any[];
  growth_indicators: any[];
}

interface ClientProfile {
  id: string;
  name: string;
  element: string | null;
  phase: string | null;
  archetype: string | null;
  guidance_mode: string | null;
  preferred_tone: string | null;
}

export default function OracleSessionHub({ clientId, isPractitioner = false }: OracleSessionHubProps) {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'journey' | 'feedback'>('chat');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load client profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          current_spiralogic_phase,
          active_archetypes,
          guidance_mode,
          preferred_tone,
          fire_element,
          water_element,
          earth_element,
          air_element,
          aether_element
        `)
        .eq('id', clientId)
        .single();

      if (profileError) {
        console.warn('Using test client data due to error:', profileError);
        setClientProfile(TEST_CLIENT);
      } else if (profile) {
        // Determine dominant element
        const elementValues = {
          fire: profile.fire_element,
          water: profile.water_element,
          earth: profile.earth_element,
          air: profile.air_element,
          aether: profile.aether_element
        };

        const dominant = Object.entries(elementValues)
          .reduce((a, b) => a[1] > b[1] ? a : b)[0];

        setClientProfile({
          id: profile.id,
          name: profile.name,
          element: dominant,
          phase: profile.current_spiralogic_phase,
          archetype: profile.active_archetypes?.[0] || null,
          guidance_mode: profile.guidance_mode,
          preferred_tone: profile.preferred_tone
        });
      }

      // Load active session or most recent session
      const { data: sessionData, error: sessionError } = await supabase
        .from('oracle_sessions')
        .select('*')
        .eq('client_id', clientId)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (sessionError) {
        console.warn('Using test session data due to error:', sessionError);
        setActiveSession(TEST_SESSION);
      } else if (sessionData) {
        setActiveSession(sessionData);
      }

    } catch (error) {
      console.error('Failed to load session data:', error);
      setError('Failed to load session data');
      // Fall back to test data in case of error
      setClientProfile(TEST_CLIENT);
      setActiveSession(TEST_SESSION);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = async () => {
    if (!clientProfile) return;

    try {
      const { data: session, error } = await supabase
        .rpc('start_oracle_session', {
          p_client_id: clientId,
          p_element: clientProfile.element,
          p_phase: clientProfile.phase,
          p_archetype: clientProfile.archetype
        });

      if (error) throw error;
      setActiveSession(session);
    } catch (error) {
      console.error('Error starting new session:', error);
      setError('Failed to start new session');
      // Fall back to test session in case of error
      setActiveSession({
        ...TEST_SESSION,
        started_at: new Date().toISOString()
      });
    }
  };

  const endSession = async () => {
    if (!activeSession) return;

    try {
      const { error } = await supabase
        .rpc('end_oracle_session', {
          p_session_id: activeSession.id
        });

      if (error) throw error;
      await loadData(); // Reload to get updated session data
    } catch (error) {
      console.error('Error ending session:', error);
      setError('Failed to end session');
    }
  };

  if (isLoading || !clientProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading session data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Oracle Session</h1>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Client:</span>
                  <span className="text-sm text-gray-600">{clientProfile.name}</span>
                </div>
                {clientProfile.element && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {clientProfile.element}
                  </span>
                )}
                {clientProfile.phase && (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                    {clientProfile.phase}
                  </span>
                )}
                {clientProfile.archetype && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    {clientProfile.archetype}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {activeSession?.ended_at ? (
                <button
                  onClick={startNewSession}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Star size={18} />
                  Start New Session
                </button>
              ) : activeSession ? (
                <button
                  onClick={endSession}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <ArrowRight size={18} />
                  End Session
                </button>
              ) : (
                <button
                  onClick={startNewSession}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Star size={18} />
                  Start First Session
                </button>
              )}
            </div>
          </div>

          {/* Session Status */}
          {activeSession && (
            <div className="mt-4 p-4 rounded-lg bg-gray-50 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Started: {new Date(activeSession.started_at).toLocaleString()}
                    </span>
                  </div>
                  {activeSession.ended_at && (
                    <div className="flex items-center gap-2">
                      <ArrowRight size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Ended: {new Date(activeSession.ended_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-purple-600" />
                  <span className="text-sm font-medium">
                    Status: {activeSession.ended_at ? 'Completed' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageCircle size={18} />
              Oracle Chat
            </button>
            <button
              onClick={() => setActiveTab('journey')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'journey'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Brain size={18} />
              Journey & Insights
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'feedback'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Star size={18} />
              Feedback & Review
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
              <ChatInterface
                clientId={clientId}
                clientName={clientProfile.name}
                context={{
                  element: clientProfile.element,
                  phase: clientProfile.phase,
                  archetype: clientProfile.archetype,
                  guidance_mode: clientProfile.guidance_mode,
                  preferred_tone: clientProfile.preferred_tone
                }}
              />
            </div>
            <div>
              <InsightPanel
                insights={activeSession?.insights || []}
                patterns={activeSession?.patterns || []}
                onInsightClick={(insight) => console.log('Insight clicked:', insight)}
              />
            </div>
          </div>
        )}

        {activeTab === 'journey' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <JourneyTimeline
              memories={activeSession?.insights || []}
              onMemoryClick={(memory) => console.log('Memory clicked:', memory)}
            />
            <div className="space-y-8">
              <InsightPanel
                insights={activeSession?.insights || []}
                patterns={activeSession?.patterns || []}
                onInsightClick={(insight) => console.log('Insight clicked:', insight)}
              />
              {activeSession?.growth_indicators && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="text-purple-600" />
                    Growth Indicators
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(activeSession.growth_indicators).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">
                            {key.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-600">{value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {activeSession && (
              <>
                <SessionFeedback
                  sessionId={activeSession.id}
                  isPractitioner={isPractitioner}
                  onFeedbackSubmitted={loadData}
                />
                {isPractitioner && (
                  <JournalReview
                    entryId={activeSession.id}
                    isPractitioner={true}
                    onReviewSubmitted={loadData}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { OracleSessionHub }