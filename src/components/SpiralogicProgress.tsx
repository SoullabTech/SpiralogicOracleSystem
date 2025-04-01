import React, { useState, useEffect } from 'react';
import { Book, Star, Calendar, ArrowRight, Activity, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SpiralogicProgressProps {
  clientId: string;
}

interface JournalEntry {
  id: string;
  created_at: string;
  element: string | null;
}

interface ClientProfile {
  id: string;
  phase: string | null;
  fire_element: number;
  water_element: number;
  earth_element: number;
  air_element: number;
  aether_element: number;
}

interface TimelineData {
  [key: string]: {
    count: number;
    elements: {
      [key: string]: number;
    };
  };
}

export default function SpiralogicProgress({ clientId }: SpiralogicProgressProps) {
  const [journalData, setJournalData] = useState<JournalEntry[]>([]);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Define growth phases in order
  const growthPhases = ['Initiation', 'Exploration', 'Integration', 'Mastery'];
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      try {
        // Get client profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select(`
            id,
            current_spiralogic_phase,
            fire_element,
            water_element,
            earth_element,
            air_element,
            aether_element
          `)
          .eq('id', clientId)
          .single();
          
        if (profileError) throw profileError;
        setProfile(profileData);
        
        // Get journal entries with timestamps
        const { data: journals, error: journalError } = await supabase
          .from('journal_entries')
          .select('id, created_at, elemental_tags')
          .eq('user_id', clientId)
          .order('created_at', { ascending: true });
          
        if (journalError) throw journalError;
        setJournalData(journals || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (clientId) {
      fetchData();
    }
  }, [clientId]);
  
  // Helpers for visualization
  const getPhaseIndex = (phase: string | null): number => {
    return growthPhases.findIndex(p => p.toLowerCase() === phase?.toLowerCase()) || 0;
  };
  
  const getElementColor = (element: string): string => {
    const colors = {
      Fire: '#f97316',
      Water: '#0ea5e9',
      Earth: '#22c55e',
      Air: '#a855f7',
      Aether: '#6366f1'
    };
    return colors[element as keyof typeof colors] || '#94a3b8';
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4" />
          <p className="text-gray-600">Loading your journey...</p>
        </div>
      </div>
    );
  }
  
  // Calculate current phase progress (for the progress bar)
  const currentPhaseIndex = profile?.phase ? getPhaseIndex(profile.phase) : 0;
  const progressPercent = ((currentPhaseIndex) / (growthPhases.length - 1)) * 100;
  
  // Prepare timeline data - group entries by month
  const timelineData = journalData.reduce<TimelineData>((acc, entry) => {
    const date = new Date(entry.created_at);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = { count: 0, elements: {} };
    }
    
    acc[monthYear].count += 1;
    
    if (entry.element) {
      acc[monthYear].elements[entry.element] = (acc[monthYear].elements[entry.element] || 0) + 1;
    }
    
    return acc;
  }, {});
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Target className="text-purple-600" />
          Your Spiralogic Journey
        </h2>
        
        {/* Current Phase Display */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <h3 className="font-medium">Current Growth Phase</h3>
            <span className="font-medium text-purple-600">{profile?.phase || 'Not assigned'}</span>
          </div>
          
          {/* Phase Progress Bar */}
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-xs font-semibold text-purple-600 uppercase">
                <span>Progress</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-purple-600">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-100">
              <div 
                style={{ width: `${progressPercent}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 transition-all duration-500"
              ></div>
            </div>
            
            {/* Phase Markers */}
            <div className="flex justify-between text-xs">
              {growthPhases.map((phase, index) => (
                <div key={phase} className="text-center">
                  <div 
                    className={`w-3 h-3 rounded-full mx-auto mb-1 transition-colors ${
                      index <= currentPhaseIndex ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  ></div>
                  <span 
                    className={`${
                      profile?.phase === phase ? 'font-bold text-purple-600' : 'text-gray-500'
                    }`}
                  >
                    {phase}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Element Balance */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="text-purple-600" />
            Elemental Balance
          </h3>
          
          <div className="grid grid-cols-5 gap-4">
            {[
              { name: 'Fire', value: profile?.fire_element || 0 },
              { name: 'Water', value: profile?.water_element || 0 },
              { name: 'Earth', value: profile?.earth_element || 0 },
              { name: 'Air', value: profile?.air_element || 0 },
              { name: 'Aether', value: profile?.aether_element || 0 }
            ].map(element => (
              <div key={element.name} className="text-center">
                <div className="relative pt-1">
                  <div 
                    className="overflow-hidden h-24 w-4 bg-gray-100 rounded mx-auto"
                    style={{ transform: 'rotate(180deg)' }}
                  >
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        height: `${element.value}%`,
                        backgroundColor: getElementColor(element.name)
                      }}
                    ></div>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm font-medium">{element.name}</span>
                    <div className="text-xs text-gray-500">{element.value}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Timeline Visualization */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Calendar className="text-purple-600" />
          Journey Timeline
        </h3>
        
        {Object.keys(timelineData).length === 0 ? (
          <div className="text-center p-6">
            <Book className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Start your journey by adding journal entries.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Timeline Entries */}
            <div className="space-y-6">
              {Object.entries(timelineData).map(([month, data], index) => (
                <div key={month} className="flex">
                  {/* Timeline Node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-xs text-center font-medium text-purple-600">{month}</span>
                    </div>
                  </div>
                  
                  {/* Timeline Content */}
                  <div className="flex-grow ml-6">
                    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Book size={16} className="text-purple-600" />
                          {data.count} Reflections
                        </h4>
                        <ArrowRight size={16} className="text-gray-400" />
                      </div>
                      
                      {/* Element Breakdown */}
                      <div className="space-y-2">
                        {Object.entries(data.elements).map(([element, count]) => (
                          <div key={element} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: getElementColor(element) }}
                              ></div>
                              <span className="text-sm">{element}</span>
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}