import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
});

function validateEnv() {
  const parsed = envSchema.safeParse({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables: ${parsed.error.errors
        .map((e) => e.message)
        .join(', ')}`
    );
  }

  return parsed.data;
}

const env = validateEnv();

export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Auth Functions
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Database Functions
export async function getAssignedClients(practitionerId: string) {
  const { data, error } = await supabase
    .from('practitioner_assignments')
    .select(`
      id,
      client:client_id (
        id,
        name,
        current_spiralogic_phase,
        active_archetypes,
        guidance_mode,
        preferred_tone,
        last_interaction
      ),
      status,
      created_at
    `)
    .eq('practitioner_id', practitionerId)
    .eq('status', 'active');

  if (error) throw error;
  return data;
}

export async function getAssignedPractitioners(clientId: string) {
  const { data, error } = await supabase
    .from('practitioner_assignments')
    .select(`
      id,
      practitioner:practitioner_id (
        id,
        name,
        guidance_mode,
        preferred_tone
      ),
      status,
      created_at
    `)
    .eq('client_id', clientId)
    .eq('status', 'active');

  if (error) throw error;
  return data;
}

export async function assignPractitioner(clientId: string, practitionerId: string) {
  const { data, error } = await supabase
    .rpc('assign_practitioner', {
      p_client_id: clientId,
      p_practitioner_id: practitionerId
    });

  if (error) throw error;
  return data;
}

export async function updateAssignmentStatus(assignmentId: string, status: string) {
  const { error } = await supabase
    .rpc('update_assignment_status', {
      p_assignment_id: assignmentId,
      p_status: status
    });

  if (error) throw error;
}

// Session Notes Functions
export async function createSessionNote(clientId: string, summary: string) {
  const { data, error } = await supabase
    .rpc('create_session_note', {
      p_client_id: clientId,
      p_summary: summary
    });

  if (error) throw error;
  return data;
}

export async function submitNoteForApproval(noteId: string) {
  const { error } = await supabase
    .rpc('submit_note_for_approval', {
      p_note_id: noteId
    });

  if (error) throw error;
}

export async function approveSessionNote(noteId: string, approved: boolean, feedback?: string) {
  const { error } = await supabase
    .rpc('approve_session_note', {
      p_note_id: noteId,
      p_approved: approved,
      p_feedback: feedback
    });

  if (error) throw error;
}

export async function getPendingNotes() {
  const { data, error } = await supabase
    .rpc('get_pending_notes');

  if (error) throw error;
  return data;
}

// Role Management Functions
export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .rpc('get_user_role', {
      user_id: userId
    });

  if (error) throw error;
  return data;
}

export async function assignRole(userId: string, roleName: string) {
  const { error } = await supabase
    .rpc('assign_role', {
      p_user_id: userId,
      p_role_name: roleName
    });

  if (error) throw error;
}

export async function hasCapability(userId: string, capability: string) {
  const { data, error } = await supabase
    .rpc('has_capability', {
      user_id: userId,
      required_capability: capability
    });

  if (error) throw error;
  return data;
}

// Memory Functions
export async function getMemoryBlocks(userId: string, options: {
  type?: string;
  minImportance?: number;
  limit?: number;
} = {}) {
  let query = supabase
    .from('memory_blocks')
    .select('*')
    .eq('user_id', userId);

  if (options.type) {
    query = query.eq('type', options.type);
  }

  if (options.minImportance) {
    query = query.gte('importance', options.minImportance);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function storeMemoryBlock(block: {
  user_id: string;
  label: string;
  value: string;
  importance?: number;
  type?: string;
}) {
  const { data, error } = await supabase
    .from('memory_blocks')
    .insert(block)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMemoryBlock(blockId: string, updates: {
  label?: string;
  value?: string;
  importance?: number;
  type?: string;
}) {
  const { data, error } = await supabase
    .from('memory_blocks')
    .update(updates)
    .eq('id', blockId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMemoryBlock(blockId: string) {
  const { error } = await supabase
    .from('memory_blocks')
    .delete()
    .eq('id', blockId);

  if (error) throw error;
}

// Export types
export type { User } from '@supabase/supabase-js';