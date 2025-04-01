import React, { useState, useEffect } from 'react';
import { Plus, Users, Settings, Search, Brain, Calendar, ArrowUpRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ClientOnboarding from './ClientOnboarding';
import { ClientLink } from './ClientLink';

// Define options for the dropdowns
const phases = ["Initiation", "Exploration", "Integration", "Mastery"];
const elements = ["Fire", "Earth", "Air", "Water", "Aether"];
const archetypes = ["Sage", "Mystic", "Visionary", "Healer", "Warrior", "Creator"];

interface Client {
  id: string;
  name: string;
  element?: string;
  phase?: string;
  archetype?: string;
  last_interaction?: string;
  guidance_mode?: string;
  preferred_tone?: string;
  active_archetypes?: string[];
  fire_element?: number;
  water_element?: number;
  earth_element?: number;
  air_element?: number;
  aether_element?: number;
}

interface ProfileInput {
  phase?: string;
  element?: string;
  archetype?: string;
  guidance_mode?: string;
  preferred_tone?: string;
}

interface ValidationErrors {
  phase?: string;
  element?: string;
  archetype?: string;
}

export function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [profileInputs, setProfileInputs] = useState<Record<string, ProfileInput>>({});
  const [errors, setErrors] = useState<Record<string, ValidationErrors>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [elementFilter, setElementFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          current_spiralogic_phase,
          active_archetypes,
          guidance_mode,
          preferred_tone,
          last_interaction,
          fire_element,
          water_element,
          earth_element,
          air_element,
          aether_element
        `);

      if (error) throw error;

      setClients(data?.map(client => ({
        id: client.id,
        name: client.name,
        phase: client.current_spiralogic_phase,
        archetype: client.active_archetypes?.[0],
        guidance_mode: client.guidance_mode,
        preferred_tone: client.preferred_tone,
        last_interaction: client.last_interaction,
        element: determineElement(client),
        ...client
      })) || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const determineElement = (client: any): string => {
    const elements = [
      { name: 'fire', value: client.fire_element },
      { name: 'water', value: client.water_element },
      { name: 'earth', value: client.earth_element },
      { name: 'air', value: client.air_element },
      { name: 'aether', value: client.aether_element }
    ];
    
    const dominant = elements.reduce((prev, curr) => 
      (curr.value > prev.value) ? curr : prev
    );
    
    return dominant.name;
  };

  const handleChange = (id: string, field: keyof ProfileInput, value: string) => {
    setProfileInputs(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
    setErrors(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: '' }
    }));
  };

  const validateInputs = (input: ProfileInput): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!input.phase) errors.phase = "Phase is required";
    if (!input.element) errors.element = "Element is required";
    if (!input.archetype) errors.archetype = "Archetype is required";
    return errors;
  };

  const handleAssign = async (clientId: string) => {
    try {
      const input = profileInputs[clientId] || {};
      const validationErrors = validateInputs(input);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(prev => ({ ...prev, [clientId]: validationErrors }));
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          current_spiralogic_phase: input.phase,
          active_archetypes: [input.archetype],
          guidance_mode: input.guidance_mode || 'Mentor',
          preferred_tone: input.preferred_tone || 'Direct',
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) throw error;

      await loadClients();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleClientCreated = async () => {
    await loadClients();
    setShowOnboarding(false);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesElement = elementFilter === 'all' || client.element === elementFilter;
    const matchesPhase = phaseFilter === 'all' || client.phase === phaseFilter;
    return matchesSearch && matchesElement && matchesPhase;
  });

  const getActiveClients = () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return clients.filter(c => new Date(c.last_interaction || 0) > twentyFourHoursAgo);
  };

  const getAverageSessionsPerWeek = () => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentClients = clients.filter(c => new Date(c.last_interaction || 0) > oneWeekAgo);
    return Math.round(recentClients.length / 7 * 10) / 10;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Oracle Admin</h1>
            <p className="text-gray-600">Manage clients and monitor transformations</p>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            New Client
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Brain className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold">{getActiveClients().length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Sessions/Week</p>
                <p className="text-2xl font-bold">{getAverageSessionsPerWeek()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Settings className="text-amber-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Transformation Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(clients.filter(c => c.phase === 'Integration').length / clients.length * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>

              <select
                value={elementFilter}
                onChange={(e) => setElementFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Elements</option>
                {elements.map(element => (
                  <option key={element} value={element.toLowerCase()}>{element}</option>
                ))}
              </select>

              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Phases</option>
                {phases.map(phase => (
                  <option key={phase} value={phase.toLowerCase()}>{phase}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-600">Loading clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No clients found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredClients.map(client => {
                const clientErrors = errors[client.id] || {};
                return (
                  <div key={client.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                        <div className="flex gap-2 mt-1">
                          {client.element && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {client.element}
                            </span>
                          )}
                          {client.phase && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              {client.phase}
                            </span>
                          )}
                          {client.archetype && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              {client.archetype}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          Last active: {new Date(client.last_interaction || '').toLocaleDateString()}
                        </span>
                        <ClientLink clientId={client.id} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Spiralogic Phase
                        </label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={profileInputs[client.id]?.phase || client.phase || ''}
                          onChange={(e) => handleChange(client.id, 'phase', e.target.value)}
                        >
                          <option value="">Select Phase</option>
                          {phases.map(phase => (
                            <option key={phase} value={phase}>{phase}</option>
                          ))}
                        </select>
                        {clientErrors.phase && (
                          <p className="text-red-500 text-sm mt-1">{clientErrors.phase}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Element
                        </label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={profileInputs[client.id]?.element || client.element || ''}
                          onChange={(e) => handleChange(client.id, 'element', e.target.value)}
                        >
                          <option value="">Select Element</option>
                          {elements.map(element => (
                            <option key={element} value={element}>{element}</option>
                          ))}
                        </select>
                        {clientErrors.element && (
                          <p className="text-red-500 text-sm mt-1">{clientErrors.element}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Archetype
                        </label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={profileInputs[client.id]?.archetype || client.archetype || ''}
                          onChange={(e) => handleChange(client.id, 'archetype', e.target.value)}
                        >
                          <option value="">Select Archetype</option>
                          {archetypes.map(archetype => (
                            <option key={archetype} value={archetype}>{archetype}</option>
                          ))}
                        </select>
                        {clientErrors.archetype && (
                          <p className="text-red-500 text-sm mt-1">{clientErrors.archetype}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Guidance Mode
                        </label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={profileInputs[client.id]?.guidance_mode || client.guidance_mode || ''}
                          onChange={(e) => handleChange(client.id, 'guidance_mode', e.target.value)}
                        >
                          <option value="Mentor">Mentor</option>
                          <option value="Guide">Guide</option>
                          <option value="Teacher">Teacher</option>
                          <option value="Coach">Coach</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => handleAssign(client.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <ArrowUpRight size={18} />
                        Update Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">New Client Onboarding</h2>
                <button
                  onClick={() => setShowOnboarding(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <ClientOnboarding onComplete={handleClientCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}