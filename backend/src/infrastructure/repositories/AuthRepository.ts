// 🔐 AUTH REPOSITORY
// Infrastructure layer for authentication data access, handles all auth database operations

export interface AuthUser {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  failed_attempts: number;
  last_failed_attempt?: Date;
  locked_until?: Date;
  email_verified: boolean;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
}

export interface AuthSession {
  id: string;
  user_id: string;
  token_hash: string;
  created_at: Date;
  last_activity: Date;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
}

export interface IAuthRepository {
  // User management
  createUser(userData: {
    email: string;
    password_hash: string;
    role?: string;
    email_verification_token?: string;
  }): Promise<AuthUser>;
  
  getUserById(userId: string): Promise<AuthUser | null>;
  getUserByEmail(email: string): Promise<AuthUser | null>;
  updateUser(userId: string, updates: Partial<AuthUser>): Promise<AuthUser>;
  deleteUser(userId: string): Promise<void>;
  
  // Authentication attempts
  recordFailedAttempt(email: string): Promise<void>;
  resetFailedAttempts(userId: string): Promise<void>;
  lockAccount(userId: string, lockUntil: Date): Promise<void>;
  unlockAccount(userId: string): Promise<void>;
  
  // Email verification
  verifyEmail(token: string): Promise<AuthUser | null>;
  updateEmailVerificationToken(userId: string, token: string): Promise<void>;
  
  // Password reset
  createPasswordResetToken(userId: string, token: string, expires: Date): Promise<void>;
  getUserByPasswordResetToken(token: string): Promise<AuthUser | null>;
  clearPasswordResetToken(userId: string): Promise<void>;
  
  // Session management
  createSession(sessionData: {
    user_id: string;
    token_hash: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<AuthSession>;
  
  getSessionByToken(tokenHash: string): Promise<AuthSession | null>;
  updateSessionActivity(sessionId: string): Promise<void>;
  deactivateSession(sessionId: string): Promise<void>;
  deactivateAllUserSessions(userId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<number>;
  
  // Analytics and monitoring
  getUserLoginHistory(userId: string, limit?: number): Promise<AuthSession[]>;
  getActiveSessionCount(userId: string): Promise<number>;
}

export class SupabaseAuthRepository implements IAuthRepository {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async createUser(userData: {
    email: string;
    password_hash: string;
    role?: string;
    email_verification_token?: string;
  }): Promise<AuthUser> {
    const { data, error } = await this.supabase
      .from("auth_users")
      .insert([{
        email: userData.email,
        password_hash: userData.password_hash,
        role: userData.role || 'standard',
        email_verification_token: userData.email_verification_token,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        failed_attempts: 0,
        email_verified: false
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return this.mapToAuthUser(data);
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    const { data, error } = await this.supabase
      .from("auth_users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to get user by ID: ${error.message}`);
    }

    return data ? this.mapToAuthUser(data) : null;
  }

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    const { data, error } = await this.supabase
      .from("auth_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to get user by email: ${error.message}`);
    }

    return data ? this.mapToAuthUser(data) : null;
  }

  async updateUser(userId: string, updates: Partial<AuthUser>): Promise<AuthUser> {
    const dbUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
      // Convert dates to ISO strings for database
      last_login: updates.last_login?.toISOString(),
      last_failed_attempt: updates.last_failed_attempt?.toISOString(),
      locked_until: updates.locked_until?.toISOString(),
      password_reset_expires: updates.password_reset_expires?.toISOString()
    };

    const { data, error } = await this.supabase
      .from("auth_users")
      .update(dbUpdates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return this.mapToAuthUser(data);
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("auth_users")
      .delete()
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async recordFailedAttempt(email: string): Promise<void> {
    const { error } = await this.supabase
      .from("auth_users")
      .update({
        failed_attempts: this.supabase.rpc('increment_failed_attempts', { user_email: email }),
        last_failed_attempt: new Date().toISOString()
      })
      .eq("email", email.toLowerCase());

    if (error) {
      throw new Error(`Failed to record failed attempt: ${error.message}`);
    }
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("auth_users")
      .update({
        failed_attempts: 0,
        last_failed_attempt: null,
        locked_until: null
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to reset failed attempts: ${error.message}`);
    }
  }

  async lockAccount(userId: string, lockUntil: Date): Promise<void> {
    const { error } = await this.supabase
      .from("auth_users")
      .update({ locked_until: lockUntil.toISOString() })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to lock account: ${error.message}`);
    }
  }

  async unlockAccount(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("auth_users")
      .update({ 
        locked_until: null,
        failed_attempts: 0
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to unlock account: ${error.message}`);
    }
  }

  async verifyEmail(token: string): Promise<AuthUser | null> {
    const { data, error } = await this.supabase
      .from("auth_users")
      .update({
        email_verified: true,
        email_verification_token: null
      })
      .eq("email_verification_token", token)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to verify email: ${error.message}`);
    }

    return data ? this.mapToAuthUser(data) : null;
  }

  async updateEmailVerificationToken(userId: string, token: string): Promise<void> {
    const { error } = await this.supabase
      .from("auth_users")
      .update({ email_verification_token: token })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to update email verification token: ${error.message}`);
    }
  }

  async createPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    const { error } = await this.supabase
      .from("auth_users")
      .update({
        password_reset_token: token,
        password_reset_expires: expires.toISOString()
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to create password reset token: ${error.message}`);
    }
  }

  async getUserByPasswordResetToken(token: string): Promise<AuthUser | null> {
    const { data, error } = await this.supabase
      .from("auth_users")
      .select("*")
      .eq("password_reset_token", token)
      .gt("password_reset_expires", new Date().toISOString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to get user by password reset token: ${error.message}`);
    }

    return data ? this.mapToAuthUser(data) : null;
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("auth_users")
      .update({
        password_reset_token: null,
        password_reset_expires: null
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to clear password reset token: ${error.message}`);
    }
  }

  async createSession(sessionData: {
    user_id: string;
    token_hash: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<AuthSession> {
    const { data, error } = await this.supabase
      .from("auth_sessions")
      .insert([{
        user_id: sessionData.user_id,
        token_hash: sessionData.token_hash,
        ip_address: sessionData.ip_address,
        user_agent: sessionData.user_agent,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return this.mapToAuthSession(data);
  }

  async getSessionByToken(tokenHash: string): Promise<AuthSession | null> {
    const { data, error } = await this.supabase
      .from("auth_sessions")
      .select("*")
      .eq("token_hash", tokenHash)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to get session by token: ${error.message}`);
    }

    return data ? this.mapToAuthSession(data) : null;
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from("auth_sessions")
      .update({ last_activity: new Date().toISOString() })
      .eq("id", sessionId);

    if (error) {
      throw new Error(`Failed to update session activity: ${error.message}`);
    }
  }

  async deactivateSession(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from("auth_sessions")
      .update({ is_active: false })
      .eq("id", sessionId);

    if (error) {
      throw new Error(`Failed to deactivate session: ${error.message}`);
    }
  }

  async deactivateAllUserSessions(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("auth_sessions")
      .update({ is_active: false })
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to deactivate all user sessions: ${error.message}`);
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    // Deactivate sessions older than 24 hours with no activity
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await this.supabase
      .from("auth_sessions")
      .update({ is_active: false })
      .lt("last_activity", twentyFourHoursAgo)
      .eq("is_active", true)
      .select("id");

    if (error) {
      throw new Error(`Failed to cleanup expired sessions: ${error.message}`);
    }

    return data ? data.length : 0;
  }

  async getUserLoginHistory(userId: string, limit: number = 10): Promise<AuthSession[]> {
    const { data, error } = await this.supabase
      .from("auth_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get user login history: ${error.message}`);
    }

    return data ? data.map(this.mapToAuthSession) : [];
  }

  async getActiveSessionCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("auth_sessions")
      .select("id", { count: 'exact' })
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) {
      throw new Error(`Failed to get active session count: ${error.message}`);
    }

    return count || 0;
  }

  private mapToAuthUser(data: any): AuthUser {
    return {
      id: data.id,
      email: data.email,
      password_hash: data.password_hash,
      role: data.role,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      last_login: data.last_login ? new Date(data.last_login) : undefined,
      failed_attempts: data.failed_attempts,
      last_failed_attempt: data.last_failed_attempt ? new Date(data.last_failed_attempt) : undefined,
      locked_until: data.locked_until ? new Date(data.locked_until) : undefined,
      email_verified: data.email_verified,
      email_verification_token: data.email_verification_token,
      password_reset_token: data.password_reset_token,
      password_reset_expires: data.password_reset_expires ? new Date(data.password_reset_expires) : undefined
    };
  }

  private mapToAuthSession(data: any): AuthSession {
    return {
      id: data.id,
      user_id: data.user_id,
      token_hash: data.token_hash,
      created_at: new Date(data.created_at),
      last_activity: new Date(data.last_activity),
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      is_active: data.is_active
    };
  }
}

// Mock repository for testing
export class MockAuthRepository implements IAuthRepository {
  private users: Map<string, AuthUser> = new Map();
  private sessions: Map<string, AuthSession> = new Map();
  private userIdCounter = 1;
  private sessionIdCounter = 1;

  async createUser(userData: {
    email: string;
    password_hash: string;
    role?: string;
    email_verification_token?: string;
  }): Promise<AuthUser> {
    const user: AuthUser = {
      id: (this.userIdCounter++).toString(),
      email: userData.email.toLowerCase(),
      password_hash: userData.password_hash,
      role: userData.role || 'standard',
      created_at: new Date(),
      updated_at: new Date(),
      failed_attempts: 0,
      email_verified: false,
      email_verification_token: userData.email_verification_token
    };

    this.users.set(user.id, user);
    return user;
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    return this.users.get(userId) || null;
  }

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    return Array.from(this.users.values()).find(u => u.email === email.toLowerCase()) || null;
  }

  async updateUser(userId: string, updates: Partial<AuthUser>): Promise<AuthUser> {
    const current = this.users.get(userId);
    if (!current) {
      throw new Error('User not found');
    }

    const updated = { ...current, ...updates, updated_at: new Date() };
    this.users.set(userId, updated);
    return updated;
  }

  async deleteUser(userId: string): Promise<void> {
    this.users.delete(userId);
    // Also remove all sessions for this user
    Array.from(this.sessions.entries())
      .filter(([, session]) => session.user_id === userId)
      .forEach(([sessionId]) => this.sessions.delete(sessionId));
  }

  async recordFailedAttempt(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (user) {
      await this.updateUser(user.id, {
        failed_attempts: user.failed_attempts + 1,
        last_failed_attempt: new Date()
      });
    }
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.updateUser(userId, {
      failed_attempts: 0,
      last_failed_attempt: undefined,
      locked_until: undefined
    });
  }

  async lockAccount(userId: string, lockUntil: Date): Promise<void> {
    await this.updateUser(userId, { locked_until: lockUntil });
  }

  async unlockAccount(userId: string): Promise<void> {
    await this.updateUser(userId, {
      locked_until: undefined,
      failed_attempts: 0
    });
  }

  async verifyEmail(token: string): Promise<AuthUser | null> {
    const user = Array.from(this.users.values()).find(u => u.email_verification_token === token);
    if (user) {
      return await this.updateUser(user.id, {
        email_verified: true,
        email_verification_token: undefined
      });
    }
    return null;
  }

  async updateEmailVerificationToken(userId: string, token: string): Promise<void> {
    await this.updateUser(userId, { email_verification_token: token });
  }

  async createPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await this.updateUser(userId, {
      password_reset_token: token,
      password_reset_expires: expires
    });
  }

  async getUserByPasswordResetToken(token: string): Promise<AuthUser | null> {
    const now = new Date();
    return Array.from(this.users.values()).find(u => 
      u.password_reset_token === token && 
      u.password_reset_expires && 
      u.password_reset_expires > now
    ) || null;
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await this.updateUser(userId, {
      password_reset_token: undefined,
      password_reset_expires: undefined
    });
  }

  async createSession(sessionData: {
    user_id: string;
    token_hash: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<AuthSession> {
    const session: AuthSession = {
      id: (this.sessionIdCounter++).toString(),
      user_id: sessionData.user_id,
      token_hash: sessionData.token_hash,
      created_at: new Date(),
      last_activity: new Date(),
      ip_address: sessionData.ip_address,
      user_agent: sessionData.user_agent,
      is_active: true
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async getSessionByToken(tokenHash: string): Promise<AuthSession | null> {
    return Array.from(this.sessions.values()).find(s => 
      s.token_hash === tokenHash && s.is_active
    ) || null;
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.last_activity = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  async deactivateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.is_active = false;
      this.sessions.set(sessionId, session);
    }
  }

  async deactivateAllUserSessions(userId: string): Promise<void> {
    Array.from(this.sessions.entries())
      .filter(([, session]) => session.user_id === userId)
      .forEach(([sessionId, session]) => {
        session.is_active = false;
        this.sessions.set(sessionId, session);
      });
  }

  async cleanupExpiredSessions(): Promise<number> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let cleaned = 0;

    Array.from(this.sessions.entries())
      .filter(([, session]) => session.is_active && session.last_activity < twentyFourHoursAgo)
      .forEach(([sessionId, session]) => {
        session.is_active = false;
        this.sessions.set(sessionId, session);
        cleaned++;
      });

    return cleaned;
  }

  async getUserLoginHistory(userId: string, limit: number = 10): Promise<AuthSession[]> {
    return Array.from(this.sessions.values())
      .filter(s => s.user_id === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }

  async getActiveSessionCount(userId: string): Promise<number> {
    return Array.from(this.sessions.values())
      .filter(s => s.user_id === userId && s.is_active).length;
  }

  // Testing utilities
  clear(): void {
    this.users.clear();
    this.sessions.clear();
    this.userIdCounter = 1;
    this.sessionIdCounter = 1;
  }

  getUser(userId: string): AuthUser | undefined {
    return this.users.get(userId);
  }

  getSession(sessionId: string): AuthSession | undefined {
    return this.sessions.get(sessionId);
  }
}