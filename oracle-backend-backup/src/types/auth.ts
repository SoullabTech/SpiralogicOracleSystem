// src/types/auth.ts

import { AuthRequest, AuthResponse } from './index'; // Importing from the main types file
import { supabase } from '../services/supabaseClient'; // Assuming you've set up Supabase client

/**
 * Handles user authentication and returns access and refresh tokens.
 */
export async function login(authRequest: AuthRequest): Promise<AuthResponse> {
  const { email, password } = authRequest;

  // Sign in using Supabase authentication
  const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !user || !session) {
    throw new Error(error?.message || 'Authentication failed');
  }

  // Return user details along with session tokens
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

/**
 * Refreshes the session using a refresh token.
 */
export async function refreshSession(refreshToken: string): Promise<AuthResponse> {
  const { data: { session }, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !session) {
    throw new Error(error?.message || 'Invalid refresh token');
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: {
      id: session.user?.id || '',
      email: session.user?.email || '',
    },
  };
}

/**
 * Logs out the user and ends the session.
 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
