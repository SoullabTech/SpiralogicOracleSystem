import React, { useState } from 'react';
import { UserPlus, Flame, Target, Sparkles, Brain } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ClientOnboardingProps {
  onComplete?: (clientData: {
    clientId: string;
    element: string;
    archetype: string;
  }) => void;
}

export default function ClientOnboarding({ onComplete }: ClientOnboardingProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [element, setElement] = useState('fire');
  const [archetype, setArchetype] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const elements = [
    { value: 'fire', label: 'Fire', description: 'Transformation and passion', icon: Flame },
    { value: 'water', label: 'Water', description: 'Emotion and intuition', icon: Sparkles },
    { value: 'earth', label: 'Earth', description: 'Stability and growth', icon: Target },
    { value: 'air', label: 'Air', description: 'Intellect and communication', icon: Brain }
  ];

  const archetypes = [
    'Visionary',
    'Healer',
    'Warrior',
    'Sage',
    'Explorer',
    'Creator',
    'Teacher',
    'Guardian'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name || !element || !archetype) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-8), // Generate random password
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: name,
          role: 'client'
        });

      if (profileError) throw profileError;

      // Create client profile
      const { error: clientProfileError } = await supabase
        .from('client_profiles')
        .insert({
          id: authData.user.id,
          phase: 'exploration',
          element,
          archetype
        });

      if (clientProfileError) throw clientProfileError;

      onComplete?.({
        clientId: authData.user.id,
        element,
        archetype
      });
    } catch (error) {
      console.error('Error creating client:', error);
      setError('Failed to create client profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Element
        </label>
        <div className="grid grid-cols-2 gap-3">
          {elements.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setElement(value)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                element === value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={20}
                  className={element === value ? 'text-purple-600' : 'text-gray-400'}
                />
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-gray-500">{description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Core Archetype
        </label>
        <select
          value={archetype}
          onChange={(e) => setArchetype(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        >
          <option value="">Select an archetype</option>
          {archetypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            <span>Creating Profile...</span>
          </>
        ) : (
          <>
            <UserPlus size={20} />
            <span>Create Client Profile</span>
          </>
        )}
      </button>
    </form>
  );
}