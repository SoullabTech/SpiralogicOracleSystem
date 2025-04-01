import React, { useState, useEffect } from 'react';
import { Book, Flame, Droplet, Mountain, Wind, Star, Check, Plus, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface JournalingSpaceProps {
  clientId: string;
}

interface Journal {
  id: string;
  client_id: string;
  content: string;
  element: string | null;
  created_at: string;
}

interface Ritual {
  id: string;
  client_id: string;
  name: string;
  element: string;
  description: string;
  completed: boolean;
  created_at: string;
}

interface ClientProfile {
  id: string;
  element: string | null;
  phase: string | null;
}

export default function JournalingSpace({ clientId }: JournalingSpaceProps) {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [journalEntry, setJournalEntry] = useState('');
  const [ritualEntry, setRitualEntry] = useState<Omit<Ritual, 'id' | 'client_id' | 'created_at'>>({ 
    name: '', 
    element: '', 
    description: '',
    completed: false
  });
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'journal' | 'rituals'>('journal');
  const [isLoading, setIsLoading] = useState(true);
  
  const elements = [
    { value: 'Fire', icon: Flame, color: 'text-orange-500' },
    { value: 'Water', icon: Droplet, color: 'text-blue-500' },
    { value: 'Earth', icon: Mountain, color: 'text-green-500' },
    { value: 'Air', icon: Wind, color: 'text-purple-500' },
    { value: 'Aether', icon: Star, color: 'text-indigo-500' }
  ];
  
  useEffect(() => {
    async function loadClientData() {
      setIsLoading(true);
      
      try {
        // Get client profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, current_spiralogic_phase, fire_element, water_element, earth_element, air_element, aether_element')
          .eq('id', clientId)
          .single();
          
        if (profileError) throw profileError;

        // Determine dominant element
        const elementValues = {
          Fire: profile.fire_element,
          Water: profile.water_element,
          Earth: profile.earth_element,
          Air: profile.air_element,
          Aether: profile.aether_element
        };

        const dominantElement = Object.entries(elementValues)
          .reduce((a, b) => a[1] > b[1] ? a : b)[0];
        
        setClientProfile({
          id: profile.id,
          element: dominantElement,
          phase: profile.current_spiralogic_phase
        });
        
        // Get journal entries
        const { data: journalData, error: journalError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', clientId)
          .order('created_at', { ascending: false });
          
        if (journalError) throw journalError;
        setJournals(journalData || []);
        
        // Get rituals
        const { data: ritualData, error: ritualError } = await supabase
          .from('rituals')
          .select('*')
          .eq('user_id', clientId)
          .order('created_at', { ascending: false });
          
        if (ritualError) throw ritualError;
        setRituals(ritualData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (clientId) {
      loadClientData();
    }
  }, [clientId]);
  
  const saveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalEntry.trim()) return;
    
    try {
      const newEntry = {
        user_id: clientId,
        content: journalEntry,
        mood: null,
        elemental_tags: clientProfile?.element ? [clientProfile.element] : [],
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('journal_entries')
        .insert(newEntry)
        .select()
        .single();
        
      if (error) throw error;
      
      setJournals([data, ...journals]);
      setJournalEntry('');
    } catch (error) {
      console.error('Error saving journal:', error);
      alert('Failed to save your journal entry');
    }
  };
  
  const saveRitual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ritualEntry.name.trim() || !ritualEntry.element) return;
    
    try {
      const newRitual = {
        user_id: clientId,
        name: ritualEntry.name,
        element: ritualEntry.element,
        description: ritualEntry.description,
        completed: false,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('rituals')
        .insert(newRitual)
        .select()
        .single();
        
      if (error) throw error;
      
      setRituals([data, ...rituals]);
      setRitualEntry({ 
        name: '', 
        element: '', 
        description: '',
        completed: false
      });
    } catch (error) {
      console.error('Error saving ritual:', error);
      alert('Failed to save your ritual');
    }
  };
  
  const toggleRitualCompletion = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('rituals')
        .update({ completed: !currentState })
        .eq('id', id);
        
      if (error) throw error;
      
      setRituals(rituals.map(ritual => 
        ritual.id === id ? {...ritual, completed: !currentState} : ritual
      ));
    } catch (error) {
      console.error('Error updating ritual:', error);
    }
  };
  
  const getElementColor = (element: string | null) => {
    const colors = {
      Fire: 'bg-orange-100 border-orange-500 text-orange-800',
      Water: 'bg-blue-100 border-blue-500 text-blue-800',
      Earth: 'bg-green-100 border-green-500 text-green-800',
      Air: 'bg-purple-100 border-purple-500 text-purple-800',
      Aether: 'bg-indigo-100 border-indigo-500 text-indigo-800'
    };
    return colors[element as keyof typeof colors] || 'bg-gray-100 border-gray-500 text-gray-800';
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
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex border-b">
          <button 
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === 'journal' 
                ? 'border-b-2 border-purple-500 text-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('journal')}
          >
            <Book size={18} />
            Reflections Journal
          </button>
          <button 
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === 'rituals' 
                ? 'border-b-2 border-purple-500 text-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('rituals')}
          >
            <Star size={18} />
            Elemental Rituals
          </button>
        </div>
      </div>
      
      {activeTab === 'journal' ? (
        <div>
          <form onSubmit={saveJournal} className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Book className="text-purple-600" />
                New Reflection
              </h2>
              
              <div className="mb-4">
                <textarea
                  className="w-full p-4 border rounded-lg min-h-[150px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="What reflections or insights would you like to record today?"
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Element:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getElementColor(clientProfile?.element)}`}>
                    {clientProfile?.element || 'Not assigned'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">Phase:</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {clientProfile?.phase || 'Not assigned'}
                  </span>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                disabled={!journalEntry.trim()}
              >
                <Plus size={18} />
                Save Reflection
              </button>
            </div>
          </form>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="text-purple-600" />
              Past Reflections
            </h2>
            
            {journals.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Book className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  You haven't recorded any reflections yet. Start your journey by adding one above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {journals.map(entry => (
                  <div 
                    key={entry.id} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className={`p-4 border-l-4 ${getElementColor(entry.element)}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(entry.created_at).toLocaleDateString()} at{' '}
                          {new Date(entry.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {entry.element && (
                          <span className={`px-3 py-1 rounded-full text-xs ${getElementColor(entry.element)}`}>
                            {entry.element}
                          </span>
                        )}
                      </div>
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap text-gray-700">{entry.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <form onSubmit={saveRitual} className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="text-purple-600" />
                Create New Ritual
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ritual Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Name your ritual or practice"
                    value={ritualEntry.name}
                    onChange={(e) => setRitualEntry({...ritualEntry, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Associated Element
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {elements.map(({ value, icon: Icon, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRitualEntry({...ritualEntry, element: value})}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                          ritualEntry.element === value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-200'
                        }`}
                      >
                        <Icon className={color} />
                        <span className="text-sm">{value}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full p-2 border rounded-lg min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe the ritual, its purpose, and how to perform it"
                    value={ritualEntry.description}
                    onChange={(e) => setRitualEntry({...ritualEntry, description: e.target.value})}
                  ></textarea>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                disabled={!ritualEntry.name.trim() || !ritualEntry.element}
              >
                <Plus size={18} />
                Create Ritual
              </button>
            </div>
          </form>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="text-purple-600" />
              Your Rituals
            </h2>
            
            {rituals.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  You haven't created any rituals yet. Use rituals to support your spiritual practice.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {rituals.map(ritual => (
                  <div 
                    key={ritual.id} 
                    className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                      ritual.completed ? 'border-green-500' : ''
                    }`}
                  >
                    <div className={`p-4 border-l-4 ${getElementColor(ritual.element)}`}>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">{ritual.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getElementColor(ritual.element)}`}>
                            {ritual.element}
                          </span>
                          <button
                            onClick={() => toggleRitualCompletion(ritual.id, ritual.completed)}
                            className={`p-1 rounded-full transition-colors ${
                              ritual.completed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      </div>
                      {ritual.description && (
                        <p className="text-gray-700 mt-2">{ritual.description}</p>
                      )}
                      <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(ritual.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}