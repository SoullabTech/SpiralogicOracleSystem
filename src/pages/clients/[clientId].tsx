import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Brain, MessageCircle, User, Clock, Settings } from 'lucide-react';
import { ChatInterface } from '../../components/ChatInterface';
import { ArchetypeEvaluation } from '../../components/ArchetypeEvaluation';
import { JourneyTimeline } from '../../components/JourneyTimeline';
import { InsightPanel } from '../../components/InsightPanel';
import { MentorContext } from '../../components/MentorContext';
import type { Memory } from '../../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ClientPage() {
  const { clientId } = useParams();
  const [clientData, setClientData] = useState<{
    name: string;
    element?: string;
    phase?: string;
    archetype?: string;
  } | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [insights, setInsights] = useState<Memory[]>([]);
  const [patterns, setPatterns] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'journey' | 'insights'>('chat');

  useEffect(() => {
    if (!clientId) return;
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    try {
      setIsLoading(true);

      // Load client profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          guidance_mode,
          preferred_tone,
          current_spiralogic_phase,
          fire_element,
          water_element,
          earth_element,
          air_element,
          aether_element,
          active_archetypes
        `)
        .eq('id', clientId)
        .single();

      if (profile) {
        setClientData({
          name: profile.name,
          phase: profile.current_spiralogic_phase,
          archetype: profile.active_archetypes?.[0],
          element: determineElement(profile)
        });
      }

      // Load memories
      const { data: memoryData } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false });

      if (memoryData) {
        setMemories(memoryData);
      }

      // Load insights
      const { data: insightData } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', clientId)
        .eq('type', 'insight')
        .order('created_at', { ascending: false })
        .limit(5);

      if (insightData) {
        setInsights(insightData);
      }

      // Load patterns
      const { data: patternData } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', clientId)
        .eq('type', 'pattern')
        .order('strength', { ascending: false })
        .limit(3);

      if (patternData) {
        setPatterns(patternData);
      }
    } catch (error) {
      console.error('Failed to load client data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const determineElement = (profile: any): string => {
    const elements = [
      { name: 'fire', value: profile.fire_element },
      { name: 'water', value: profile.water_element },
      { name: 'earth', value: profile.earth_element },
      { name: 'air', value: profile.air_element },
      { name: 'aether', value: profile.aether_element }
    ];
    
    const dominant = elements.reduce((prev, curr) => 
      (curr.value > prev.value) ? curr : prev
    );
    
    return dominant.name;
  };

  if (isLoading || !clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading client data...</p>
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
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="text-purple-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{clientData.name}</h1>
                <div className="flex gap-2 mt-1">
                  {clientData.element && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {clientData.element}
                    </span>
                  )}
                  {clientData.phase && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      {clientData.phase}
                    </span>
                  )}
                  {clientData.archetype && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {clientData.archetype}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
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
                <Clock size={18} />
                Journey
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === 'insights'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Brain size={18} />
                Insights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
              <ChatInterface
                clientId={clientId!}
                clientName={clientData.name}
                context={{
                  element: clientData.element,
                  phase: clientData.phase,
                  archetype: clientData.archetype
                }}
              />
            </div>
            <div>
              <MentorContext
                stage="developing"
                insights={insights}
                patterns={patterns}
                onInsightClick={(insight) => console.log('Insight clicked:', insight)}
              />
            </div>
          </div>
        )}

        {activeTab === 'journey' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <JourneyTimeline
              memories={memories}
              onMemoryClick={(memory) => console.log('Memory clicked:', memory)}
            />
            <div className="space-y-8">
              <InsightPanel
                insights={insights}
                patterns={patterns}
                onInsightClick={(insight) => console.log('Insight clicked:', insight)}
              />
              <ArchetypeEvaluation />
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <InsightPanel
                insights={insights}
                patterns={patterns}
                onInsightClick={(insight) => console.log('Insight clicked:', insight)}
              />
            </div>
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="text-purple-600" size={20} />
                  <h2 className="text-xl font-bold">Insight Settings</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Strength
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="70"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Range
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option value="week">Past Week</option>
                      <option value="month">Past Month</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}