/**
 * Authentication Infrastructure Adapter
 * Pure infrastructure layer for authentication operations using Supabase
 */

import { SupabaseAdapter } from "./SupabaseAdapter";
import type { AuthRequest, AuthResponse } from "../../domain/types/auth";

/**
 * Pure infrastructure adapter for authentication
 * Wraps Supabase authentication with domain-appropriate interface
 */
export class AuthAdapter {
  constructor(private supabaseAdapter: SupabaseAdapter) {}

  /**
   * Authenticate user with email and password
   */
  async signIn(authRequest: AuthRequest): Promise<AuthResponse> {
    const { email, password } = authRequest;
    
    const authResult = await this.supabaseAdapter.signInWithPassword(email, password);
    
    if (!authResult.user || !authResult.session) {
      throw new Error("Authentication failed - no user or session returned");
    }

    return {
      accessToken: authResult.session.access_token,
      refreshToken: authResult.session.refresh_token,
      user: {
        id: authResult.user.id,
        email: authResult.user.email ?? "",
      },
    };
  }

  /**
   * Refresh authentication session
   */
  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    const authResult = await this.supabaseAdapter.refreshSession(refreshToken);
    
    if (!authResult.session || !authResult.session.user) {
      throw new Error("Session refresh failed - invalid refresh token");
    }

    return {
      accessToken: authResult.session.access_token,
      refreshToken: authResult.session.refresh_token,
      user: {
        id: authResult.session.user.id,
        email: authResult.session.user.email ?? "",
      },
    };
  }

  /**
   * Sign out user and end session
   */
  async signOut(): Promise<void> {
    await this.supabaseAdapter.signOut();
  }

  /**
   * Verify if user session is valid
   */
  async verifySession(accessToken: string): Promise<boolean> {
    try {
      // This would require additional Supabase adapter method
      // For now, return true if token exists
      return !!accessToken;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user information from session
   */
  async getCurrentUser(accessToken: string): Promise<{ id: string; email: string } | null> {
    try {
      // This would require additional Supabase adapter method
      // For now, return null as placeholder
      return null;
    } catch (error) {
      return null;
    }
  }
}