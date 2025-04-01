import React, { useState, useEffect } from 'react';
import { Book, Flame, Droplet, Mountain, Wind, Star, Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SessionHistoryProps {
  clientId: string;
}

interface Session {
  id: string;
  start_time: string;
  end_time: string | null;
  element: string | null;
  summary: string | null;
  insights: any[];
  patterns: any[];
  growth_indicators: any[];
  session_summaries: { id: string }[];
}

interface SessionSummary {
  id: string;
  session_id: string;
  content: string;
  element: string | null;
  phase: string | null;
  created_at: string;
}

export default function SessionHistory({ clientId }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<(Session & { summary?: SessionSummary })[]>([]);
  const [selectedSession, setSelectedSession] = useState<(Session & { summary?: SessionSummary }) | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadSessionHistory();
  }, [clientId]);
  
  const loadSessionHistory = async () => {
    setLoading(true);
    
    try {
      // Get sessions with summaries
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          id,
          start_time,
          end_time,
          element,
          summary,
          insights,
          patterns,
          growth_indicators,
          session_summaries (
            id,
            content,
            element,
            phase,
            created_at
          )
        `)
        .eq('client_id', clientId)
        .order('start_time', { ascending: false });
        
      if (sessionError) throw new Error(`Error fetching sessions: ${sessionError.message}`);
      
      // Process sessions with their summaries
      const processedSessions = sessionData?.map(session => ({
        ...session,
        summary: session.session_summaries?.[0] || null
      })) || [];
      
      setSessions(processedSessions);
    } catch (error) {
      console.error('Error loading session history:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewSummary = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    setSelectedSession(session);
    
    // If session has no summary yet and is ended, try to generate one
    if (!session.summary && session.end_time) {
      try {
        const { data: summary, error } = await supabase
          .rpc('summarize_session', { p_session_id: sessionId });
          
        if (error) throw error;
        
        if (summary) {
          setSessions(prev => prev.map(s => 
            s.id === sessionId 
              ? { ...s, summary: { ...s.summary, content: summary } }
              : s
          ));
          setSelectedSession(prev => prev ? { ...prev, summary: { ...prev.summary, content: summary } } : null);
        }
      } catch (error) {
        console.error('Error generating summary:', error);
      }
    }
  };
  
  const getElementColor = (element: string | null): string => {
    const colors = {
      Fire: 'bg-orange-100 border-orange-500 text-orange-800',
      Water: 'bg-blue-100 border-blue-500 text-blue-800',
      Earth: 'bg-green-100 border-green-500 text-green-800',
      Air: 'bg-purple-100 border-purple-500 text-purple-800',
      Aether: 'bg-indigo-100 border-indigo-500 text-indigo-800'
    };
    return colors[element as keyof typeof colors] || 'bg-gray-100 border-gray-500 text-gray-800';
  };
  
  const getElementIcon = (element: string | null) => {
    switch (element) {
      case 'Fire': return <Flame size={16} className="text-orange-500" />;
      case 'Water': return <Droplet size={16} className="text-blue-500" />;
      case 'Earth': return <Mountain size={16} className="text-green-500" />;
      case 'Air': return <Wind size={16} className="text-purple-500" />;
      case 'Aether': return <Star size={16} className="text-indigo-500" />;
      default: return <Star size={16} className="text-gray-500" />;
    }
  };
  
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  const formatDuration = (start: string, end: string | null): string => {
    if (!end) return 'Ongoing';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / (1000 * 60));
    return `${minutes} minutes`;
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="text-purple-600" />
        Session History
      </h2>
      
      {loading && sessions.length === 0 ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading your session history...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <Book className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">You haven't had any Oracle sessions yet.</p>
        </div>
      ) : (
        <div className="flex space-x-6">
          {/* Sessions List */}
          <div className="w-1/3 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b">
              <h3 className="font-medium">Past Sessions</h3>
            </div>
            <div className="divide-y max-h-[70vh] overflow-y-auto">
              {sessions.map(session => (
                <div 
                  key={session.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedSession?.id === session.id ? 'bg-purple-50' : ''
                  }`}
                  onClick={() => handleViewSummary(session.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getElementIcon(session.element)}
                      <span className="font-medium">
                        {new Date(session.start_time).toLocaleDateString()}
                      </span>
                    </div>
                    {session.element && (
                      <span className={`px-2 py-1 text-xs rounded-full ${getElementColor(session.element)}`}>
                        {session.element}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(session.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowRight size={12} />
                      <span>{formatDuration(session.start_time, session.end_time)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-2">
                    {session.summary ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Summary Available
                      </span>
                    ) : session.end_time ? (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Processing Summary
                      </span>
                    ) : (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Session Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Summary View */}
          <div className="w-2/3 bg-white rounded-xl shadow-lg overflow-hidden">
            {selectedSession ? (
              <div>
                <div className={`p-4 border-b ${getElementColor(selectedSession.element)}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                      {getElementIcon(selectedSession.element)}
                      Session Summary
                    </h3>
                    <span className="text-sm">
                      {new Date(selectedSession.start_time).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  {selectedSession.summary ? (
                    <div className="space-y-6">
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap">
                          {selectedSession.summary.content}
                        </div>
                      </div>
                      
                      {selectedSession.insights?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Key Insights</h4>
                          <div className="space-y-2">
                            {selectedSession.insights.map((insight, index) => (
                              <div key={index} className="p-3 bg-purple-50 rounded-lg">
                                {insight}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedSession.patterns?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Patterns Observed</h4>
                          <div className="space-y-2">
                            {selectedSession.patterns.map((pattern, index) => (
                              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                                {pattern}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedSession.growth_indicators?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Growth Indicators</h4>
                          <div className="space-y-2">
                            {selectedSession.growth_indicators.map((indicator, index) => (
                              <div key={index} className="p-3 bg-green-50 rounded-lg">
                                {indicator}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : selectedSession.end_time ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
                      <p className="text-gray-600">Generating session summary...</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        Session is still active. Summary will be available once the session ends.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center text-gray-500">
                <div>
                  <Book className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>Select a session to view its summary</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}