// src/types/session.ts

import { Session, SessionStats, Metadata } from './index'; // Importing from the main types file
import { supabase } from '../services/supabaseClient'; // Assuming you have Supabase client

/**
 * Starts a new session for a user and stores session details.
 */
export async function startSession(clientId: string, metadata: Metadata): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .insert([
      {
        clientId,
        startTime: new Date().toISOString(),
        meta: metadata,
        status: 'active',
      },
    ]);

  if (error || !data) {
    throw new Error(error?.message || 'Failed to start session');
  }

  return {
    id: data[0].id,
    clientId,
    startTime: data[0].startTime,
    meta: metadata,
    status: 'active',
  };
}

/**
 * Ends an active session for a user and updates session status.
 */
export async function endSession(sessionId: string): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .update({ status: 'completed', endTime: new Date().toISOString() })
    .eq('id', sessionId);

  if (error || !data) {
    throw new Error(error?.message || 'Failed to end session');
  }

  return {
    ...data[0],
    status: 'completed',
    endTime: data[0].endTime,
  };
}

/**
 * Retrieves session statistics, such as total active/completed sessions.
 */
export async function getSessionStats(clientId: string): Promise<SessionStats> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('clientId', clientId);

  if (error) {
    throw new Error(error?.message || 'Failed to retrieve session stats');
  }

  const totalSessions = data.length;
  const activeSessions = data.filter((session) => session.status === 'active').length;
  const completedSessions = totalSessions - activeSessions;
  const lastSessionTime = data[totalSessions - 1]?.startTime || '';

  return {
    totalSessions,
    activeSessions,
    completedSessions,
    lastSessionTime,
    clientId,
  };
}
