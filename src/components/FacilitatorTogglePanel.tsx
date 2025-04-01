import React, { useState, useEffect } from 'react';
import { UserPlus, Star, Shield, Clock, Check, X, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FacilitatorTogglePanelProps {
  clientId: string;
  onAssignmentChange?: () => void;
}

interface Practitioner {
  id: string;
  name: string;
  guidance_mode?: string;
  preferred_tone?: string;
  active_archetypes?: string[];
  assignment?: {
    id: string;
    status: string;
    created_at: string;
  };
}

export default function FacilitatorTogglePanel({ clientId, onAssignmentChange }: FacilitatorTogglePanelProps) {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [selectedPractitioner, setSelectedPractitioner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadPractitioners();
  }, [clientId]);
  
  const loadPractitioners = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get practitioners with their current assignments to this client
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          guidance_mode,
          preferred_tone,
          active_archetypes,
          practitioner_assignments!inner (
            id,
            status,
            created_at
          )
        `)
        .eq('practitioner_assignments.client_id', clientId);
        
      if (error) throw error;
      
      setPractitioners(data || []);
      
      // Set initially selected practitioner if there's an active assignment
      const activeAssignment = data?.find(p => 
        p.practitioner_assignments?.[0]?.status === 'active'
      );
      if (activeAssignment) {
        setSelectedPractitioner(activeAssignment.id);
      }
    } catch (error) {
      console.error('Error loading practitioners:', error);
      setError('Failed to load practitioners');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAssignment = async (practitionerId: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // If this practitioner is already selected, cancel their assignment
      if (selectedPractitioner === practitionerId) {
        const { error } = await supabase
          .rpc('update_assignment_status', {
            p_assignment_id: practitioners.find(p => p.id === practitionerId)?.assignment?.id,
            p_status: 'cancelled'
          });
          
        if (error) throw error;
        
        setSelectedPractitioner(null);
      } else {
        // Create new assignment
        const { error } = await supabase
          .rpc('assign_practitioner', {
            p_client_id: clientId,
            p_practitioner_id: practitionerId
          });
          
        if (error) throw error;
        
        setSelectedPractitioner(practitionerId);
      }
      
      // Reload practitioners to get updated assignments
      await loadPractitioners();
      onAssignmentChange?.();
    } catch (error) {
      console.error('Error updating assignment:', error);
      setError('Failed to update practitioner assignment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <UserPlus className="text-purple-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Select Your Guide</h2>
            <p className="text-sm text-gray-500">Loading available practitioners...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <UserPlus className="text-purple-600" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Select Your Guide</h2>
          <p className="text-sm text-gray-500">Choose a practitioner to guide your journey</p>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-2">
          <X size={18} className="flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {practitioners.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No practitioners are currently available.</p>
          </div>
        ) : (
          practitioners.map(practitioner => {
            const isSelected = selectedPractitioner === practitioner.id;
            const assignment = practitioner.assignment;
            
            return (
              <div 
                key={practitioner.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-purple-200' : 'bg-gray-100'
                    }`}>
                      {isSelected ? (
                        <Check className="text-purple-600" size={20} />
                      ) : (
                        <UserPlus className="text-gray-600" size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{practitioner.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {practitioner.guidance_mode && (
                          <span className="flex items-center gap-1">
                            <Shield size={14} />
                            {practitioner.guidance_mode}
                          </span>
                        )}
                        {assignment && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            Since {new Date(assignment.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAssignment(practitioner.id)}
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      isSelected
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                    ) : isSelected ? (
                      <>
                        <X size={18} />
                        <span>Remove</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        <span>Select</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Practitioner Details */}
                <div className="space-y-2">
                  {practitioner.active_archetypes && practitioner.active_archetypes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Star size={14} className="text-amber-500" />
                      <div className="flex gap-1">
                        {practitioner.active_archetypes.map(archetype => (
                          <span 
                            key={archetype}
                            className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full"
                          >
                            {archetype}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {practitioner.preferred_tone && (
                    <div className="flex items-center gap-2">
                      <ArrowRight size={14} className="text-purple-500" />
                      <span className="text-sm text-gray-600">
                        Communication style: {practitioner.preferred_tone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}