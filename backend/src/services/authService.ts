/**
 * Authentication Service - Application Layer
 * Uses infrastructure adapters for authentication operations
 */

import { AuthAdapter } from "../infrastructure/adapters/AuthAdapter";
import { SupabaseAdapter } from "../infrastructure/adapters/SupabaseAdapter";
import type { AuthRequest, AuthResponse } from "../domain/types/auth";

// Initialize adapters
const supabaseAdapter = new SupabaseAdapter();
const authAdapter = new AuthAdapter(supabaseAdapter);

/**
 * Handles user authentication and returns access and refresh tokens.
 */
export async function login(authRequest: AuthRequest): Promise<AuthResponse> {
  return await authAdapter.signIn(authRequest);
}

/**
 * Refreshes the session using a refresh token.
 */
export async function refreshSession(refreshToken: string): Promise<AuthResponse> {
  return await authAdapter.refreshSession(refreshToken);
}

/**
 * Logs out the user and ends the session.
 */
export async function logout(): Promise<void> {
  await authAdapter.signOut();
}

/**
 * Verify if user session is valid
 */
export async function verifySession(accessToken: string): Promise<boolean> {
  return await authAdapter.verifySession(accessToken);
}
