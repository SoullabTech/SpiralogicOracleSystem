import React, { useState } from 'react';
import { Book, Flame, Droplet, Mountain, Wind, Star, Calendar, ArrowRight, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PsychedelicSessionFormProps {
  clientId: string;
  onComplete?: (sessionId: string) => void;
}

interface SessionForm {
  phase: 'preparation' | 'journey' | 'integration';
  session_type: string;
  dosage: string;
  set_and_setting: string;
  intention: string;
  element: string;
}

export default function PsychedelicSessionForm({ clientId, onComplete }: PsychedelicSessionFormProps) {
  const [form, setForm] = useState<SessionForm>({
    phase: 'preparation',
    session_type: '',
    dosage: '',
    set_and_setting: '',
    intention: '',
    element: 'Fire'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const elements = [
    { value: 'Fire', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    { value: 'Water', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: 'Earth', icon: Mountain, color: 'text-green-500', bg: 'bg-green-50' },
    { value: 'Air', icon: Wind, color: 'text-purple-500', bg: 'bg-purple-50' },
    { value: 'Aether', icon: Star, color: 'text-indigo-500', bg: 'bg-indigo-50' }
  ];
  
  const sessionTypes = [
    'Psilocybin',
    'Ketamine',
    'MDMA',
    'LSD',
    'DMT',
    'Cannabis',
    'Breathwork',
    'Meditation',
    'Sound Journey',
    'Other'
  ];
  
  const getPhasePrompt = (phase: string): string => {
    switch (phase) {
      case 'preparation':
        return 'What intentions, fears, or hopes are present as you prepare for this journey?';
      case 'journey':
        return 'What support or container would help you feel safe and held during this experience?';
      case 'integration':
        return 'What insights or experiences would you like to integrate from your journey?';
      default:
        return 'Share your intentions for this session...';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!form.session_type || !form.intention) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the session
      const { data: session, error: sessionError } = await supabase
        .rpc('create_psychedelic_session', {
          p_client_id: clientId,
          p_phase: form.phase,
          p_session_type: form.session_type,
          p_intention: form.intention,
          p_set_and_setting: form.set_and_setting
        });
        
      if (sessionError) throw sessionError;
      
      // Add initial intention
      await supabase
        .from('session_intentions')
        .insert({
          session_id: session,
          intention: form.intention,
          category: form.element,
          priority: 1
        });
      
      // Add support tools if set and setting is specified
      if (form.set_and_setting) {
        await supabase
          .from('session_support_tools')
          .insert({
            session_id: session,
            tool_name: 'Setting',
            tool_type: 'environment',
            description: form.set_and_setting
          });
      }
      
      onComplete?.(session);
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Failed to create session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 border-b pb-4 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Star className="text-purple-600" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold">New Journey Session</h2>
          <p className="text-sm text-gray-500">Design your ceremonial container</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Phase Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Journey Phase
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['preparation', 'journey', 'integration'].map(phase => (
              <button
                key={phase}
                type="button"
                onClick={() => setForm({ ...form, phase: phase as SessionForm['phase'] })}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  form.phase === phase
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="font-medium capitalize">{phase}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {phase === 'preparation' && 'Set intentions & prepare'}
                  {phase === 'journey' && 'During the experience'}
                  {phase === 'integration' && 'Process & integrate'}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Session Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Type
          </label>
          <select
            value={form.session_type}
            onChange={(e) => setForm({ ...form, session_type: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select Type</option>
            {sessionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        {/* Element Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Element
          </label>
          <div className="grid grid-cols-5 gap-2">
            {elements.map(({ value, icon: Icon, color, bg }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, element: value })}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                  form.element === value
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
        
        {/* Dosage (only for certain session types) */}
        {['Psilocybin', 'Ketamine', 'MDMA', 'LSD', 'DMT', 'Cannabis'].includes(form.session_type) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dosage (optional)
            </label>
            <input
              type="text"
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              placeholder="Enter dosage..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )}
        
        {/* Set and Setting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Set & Setting
          </label>
          <textarea
            value={form.set_and_setting}
            onChange={(e) => setForm({ ...form, set_and_setting: e.target.value })}
            placeholder="Describe the environment and support system..."
            className="w-full p-2 border rounded-lg min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        {/* Intention */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Intention
          </label>
          <textarea
            value={form.intention}
            onChange={(e) => setForm({ ...form, intention: e.target.value })}
            placeholder={getPhasePrompt(form.phase)}
            className="w-full p-2 border rounded-lg min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              <span>Creating Session...</span>
            </>
          ) : (
            <>
              <Plus size={20} />
              <span>Create Session</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}