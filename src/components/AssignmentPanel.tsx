import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus, Check, X } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phase?: string;
  element?: string;
  archetype?: string;
}

interface Practitioner {
  id: string;
  name: string;
  email: string;
  specialties?: string[];
}

interface Assignment {
  id: string;
  client_id: string;
  practitioner_id: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export function AssignmentPanel() {
  const [clients, setClients] = useState<Client[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load clients
      const { data: clientData, error: clientError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          client_profiles (
            phase,
            element,
            archetype
          )
        `)
        .eq('role', 'client');

      if (clientError) throw clientError;

      // Load practitioners
      const { data: practitionerData, error: practitionerError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'practitioner');

      if (practitionerError) throw practitionerError;

      // Load assignments
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('practitioner_assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (assignmentError) throw assignmentError;

      setClients(clientData || []);
      setPractitioners(practitionerData || []);
      setAssignments(assignmentData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const assignPractitioner = async (clientId: string, practitionerId: string) => {
    try {
      const { error } = await supabase.rpc('assign_practitioner', {
        p_client_id: clientId,
        p_practitioner_id: practitionerId
      });

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error assigning practitioner:', error);
      setError('Failed to assign practitioner');
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, status: string) => {
    try {
      const { error } = await supabase.rpc('update_assignment_status', {
        p_assignment_id: assignmentId,
        p_status: status
      });

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error updating assignment:', error);
      setError('Failed to update assignment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Active Assignments */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Users className="text-green-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Active Assignments</h2>
            <p className="text-sm text-gray-500">Current practitioner-client relationships</p>
          </div>
        </div>

        <div className="divide-y">
          {assignments
            .filter(a => a.status === 'active')
            .map(assignment => {
              const client = clients.find(c => c.id === assignment.client_id);
              const practitioner = practitioners.find(p => p.id === assignment.practitioner_id);

              return (
                <div key={assignment.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{client?.name}</div>
                      <div className="text-sm text-gray-500">{client?.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{practitioner?.name}</div>
                      <div className="text-sm text-gray-500">
                        Since {new Date(assignment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      onClick={() => updateAssignmentStatus(assignment.id, 'completed')}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => updateAssignmentStatus(assignment.id, 'cancelled')}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* New Assignments */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <UserPlus className="text-purple-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">New Assignment</h2>
            <p className="text-sm text-gray-500">Assign practitioners to clients</p>
          </div>
        </div>

        <div className="grid gap-6">
          {clients
            .filter(client => !assignments.some(a => 
              a.client_id === client.id && a.status === 'active'
            ))
            .map(client => (
              <div key={client.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                  </div>
                  <div className="flex gap-2">
                    {client.phase && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        {client.phase}
                      </span>
                    )}
                    {client.element && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {client.element}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {practitioners.map(practitioner => (
                    <button
                      key={practitioner.id}
                      onClick={() => assignPractitioner(client.id, practitioner.id)}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                    >
                      Assign to {practitioner.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}