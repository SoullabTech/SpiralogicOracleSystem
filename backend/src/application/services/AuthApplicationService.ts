// 🔐 AUTH APPLICATION SERVICE
// Orchestration layer that coordinates between authentication domain logic and infrastructure

import { AuthDomainService } from '../../domain/services/AuthDomainService';
import { IAuthRepository, AuthUser, AuthSession } from '../../infrastructure/repositories/AuthRepository';
import { logger } from '../../utils/logger';
import { eventBus } from '../../core/events/EventBus';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

export interface AuthApplicationService {
  // User registration and authentication
  register(email: string, password: string, confirmPassword: string, acceptedTerms: boolean): Promise<{
    user: AuthUser;
    requiresEmailVerification: boolean;
    verificationToken?: string;
  }>;
  
  login(email: string, password: string, context: {
    ipAddress?: string;
    userAgent?: string;
    isPublicNetwork?: boolean;
  }): Promise<{
    user: AuthUser;
    session: AuthSession;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }>;
  
  logout(sessionToken: string): Promise<void>;
  logoutAllSessions(userId: string): Promise<void>;
  
  // Session management
  validateSession(token: string): Promise<{
    isValid: boolean;
    user?: AuthUser;
    session?: AuthSession;
    needsRefresh: boolean;
  }>;
  
  refreshSession(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }>;
  
  // Email verification
  sendEmailVerification(userId: string): Promise<void>;
  verifyEmail(token: string): Promise<AuthUser>;
  
  // Password management
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
  
  // Account management
  getUserProfile(userId: string): Promise<AuthUser>;
  updateUserRole(userId: string, newRole: string, adminUserId: string): Promise<AuthUser>;
  lockUserAccount(userId: string, reason: string, adminUserId: string): Promise<void>;
  unlockUserAccount(userId: string, adminUserId: string): Promise<void>;
  
  // Analytics and monitoring
  getUserSessions(userId: string): Promise<AuthSession[]>;
  getLoginHistory(userId: string, limit?: number): Promise<AuthSession[]>;
  cleanupExpiredSessions(): Promise<number>;
}

export class AuthApplicationServiceImpl implements AuthApplicationService {
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private refreshTokenExpiresIn: string;

  constructor(
    private authRepository: IAuthRepository,
    config: {
      jwtSecret: string;
      jwtExpiresIn?: string;
      refreshTokenExpiresIn?: string;
    }
  ) {
    this.jwtSecret = config.jwtSecret;
    this.jwtExpiresIn = config.jwtExpiresIn || '1h';
    this.refreshTokenExpiresIn = config.refreshTokenExpiresIn || '7d';
  }

  async register(
    email: string,
    password: string,
    confirmPassword: string,
    acceptedTerms: boolean
  ): Promise<{
    user: AuthUser;
    requiresEmailVerification: boolean;
    verificationToken?: string;
  }> {
    try {
      // Validate registration data using domain service
      const validation = AuthDomainService.validateRegistration(
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      if (!validation.isValid) {
        throw new Error(`Registration validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if user already exists
      const existingUser = await this.authRepository.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists with this email address');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create user
      const user = await this.authRepository.createUser({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: 'standard',
        email_verification_token: verificationToken
      });

      // Publish user registration event
      await eventBus.publish({
        type: 'auth.user_registered',
        source: 'AuthApplicationService',
        payload: {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        userId: user.id
      });

      logger.info('User registered successfully', {
        userId: user.id,
        email: user.email
      });

      return {
        user,
        requiresEmailVerification: true,
        verificationToken
      };
    } catch (error) {
      logger.error('Failed to register user', { email, error });
      throw error;
    }
  }

  async login(
    email: string,
    password: string,
    context: {
      ipAddress?: string;
      userAgent?: string;
      isPublicNetwork?: boolean;
    }
  ): Promise<{
    user: AuthUser;
    session: AuthSession;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      // Validate credentials format
      const validation = AuthDomainService.validateCredentials(email, password);
      if (!validation.isValid) {
        throw new Error(`Invalid credentials format: ${validation.errors.join(', ')}`);
      }

      // Get user by email
      const user = await this.authRepository.getUserByEmail(email);
      if (!user) {
        await this.authRepository.recordFailedAttempt(email);
        throw new Error('Invalid credentials');
      }

      // Check account lockout
      if (user.locked_until && user.locked_until > new Date()) {
        throw new Error(`Account is locked until ${user.locked_until.toISOString()}`);
      }

      // Check password
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid) {
        await this.authRepository.recordFailedAttempt(email);
        
        // Check if account should be locked
        const lockoutCheck = AuthDomainService.shouldLockAccount(
          user.failed_attempts + 1,
          new Date()
        );

        if (lockoutCheck.shouldLock && lockoutCheck.lockUntil) {
          await this.authRepository.lockAccount(user.id, lockoutCheck.lockUntil);
        }

        throw new Error('Invalid credentials');
      }

      // Reset failed attempts on successful login
      await this.authRepository.resetFailedAttempts(user.id);

      // Update last login
      await this.authRepository.updateUser(user.id, {
        last_login: new Date()
      });

      // Generate session requirements
      const sessionRequirements = AuthDomainService.generateSessionRequirements(
        user.role,
        context.isPublicNetwork || false,
        0 // TODO: Get previous session count
      );

      // Create JWT tokens
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          type: 'access'
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id,
          type: 'refresh'
        },
        this.jwtSecret,
        { expiresIn: this.refreshTokenExpiresIn }
      );

      // Create session
      const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');
      const session = await this.authRepository.createSession({
        user_id: user.id,
        token_hash: tokenHash,
        ip_address: context.ipAddress,
        user_agent: context.userAgent
      });

      // Publish login event
      await eventBus.publish({
        type: 'auth.user_logged_in',
        source: 'AuthApplicationService',
        payload: {
          userId: user.id,
          sessionId: session.id,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent
        },
        userId: user.id
      });

      logger.info('User logged in successfully', {
        userId: user.id,
        sessionId: session.id,
        ipAddress: context.ipAddress
      });

      const expiresIn = this.parseExpirationTime(this.jwtExpiresIn);

      return {
        user,
        session,
        accessToken,
        refreshToken,
        expiresIn
      };
    } catch (error) {
      logger.error('Login failed', { email, error });
      throw error;
    }
  }

  async logout(sessionToken: string): Promise<void> {
    try {
      const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
      const session = await this.authRepository.getSessionByToken(tokenHash);
      
      if (session) {
        await this.authRepository.deactivateSession(session.id);
        
        // Publish logout event
        await eventBus.publish({
          type: 'auth.user_logged_out',
          source: 'AuthApplicationService',
          payload: {
            userId: session.user_id,
            sessionId: session.id
          },
          userId: session.user_id
        });

        logger.info('User logged out successfully', {
          userId: session.user_id,
          sessionId: session.id
        });
      }
    } catch (error) {
      logger.error('Logout failed', { error });
      throw error;
    }
  }

  async logoutAllSessions(userId: string): Promise<void> {
    try {
      await this.authRepository.deactivateAllUserSessions(userId);
      
      // Publish logout all event
      await eventBus.publish({
        type: 'auth.all_sessions_logged_out',
        source: 'AuthApplicationService',
        payload: { userId },
        userId
      });

      logger.info('All user sessions logged out', { userId });
    } catch (error) {
      logger.error('Failed to logout all sessions', { userId, error });
      throw error;
    }
  }

  async validateSession(token: string): Promise<{
    isValid: boolean;
    user?: AuthUser;
    session?: AuthSession;
    needsRefresh: boolean;
  }> {
    try {
      // Validate token format
      const tokenValidation = AuthDomainService.validateTokenFormat(token, 'access');
      if (!tokenValidation.isValid) {
        return { isValid: false, needsRefresh: true };
      }

      // Verify JWT
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      if (decoded.type !== 'access') {
        return { isValid: false, needsRefresh: true };
      }

      // Get session from database
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const session = await this.authRepository.getSessionByToken(tokenHash);
      
      if (!session) {
        return { isValid: false, needsRefresh: true };
      }

      // Get user
      const user = await this.authRepository.getUserById(session.user_id);
      if (!user) {
        return { isValid: false, needsRefresh: true };
      }

      // Validate session using domain service
      const sessionValidation = AuthDomainService.validateSession(
        session.created_at,
        session.last_activity
      );

      if (!sessionValidation.isValid) {
        await this.authRepository.deactivateSession(session.id);
        return {
          isValid: false,
          needsRefresh: sessionValidation.needsRefresh
        };
      }

      // Update session activity
      await this.authRepository.updateSessionActivity(session.id);

      return {
        isValid: true,
        user,
        session,
        needsRefresh: sessionValidation.needsRefresh
      };
    } catch (error) {
      logger.error('Session validation failed', { error });
      return { isValid: false, needsRefresh: true };
    }
  }

  async refreshSession(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      // Validate and decode refresh token
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as any;
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token type');
      }

      // Get user
      const user = await this.authRepository.getUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const newAccessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          type: 'access'
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn }
      );

      const newRefreshToken = jwt.sign(
        {
          userId: user.id,
          type: 'refresh'
        },
        this.jwtSecret,
        { expiresIn: this.refreshTokenExpiresIn }
      );

      // Update session token hash
      const tokenHash = crypto.createHash('sha256').update(newAccessToken).digest('hex');
      // Note: In a full implementation, you'd also update the session with the new token hash

      const expiresIn = this.parseExpirationTime(this.jwtExpiresIn);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn
      };
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw new Error('Failed to refresh token');
    }
  }

  async sendEmailVerification(userId: string): Promise<void> {
    try {
      const user = await this.authRepository.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.email_verified) {
        throw new Error('Email already verified');
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');
      await this.authRepository.updateEmailVerificationToken(userId, verificationToken);

      // Publish email verification event
      await eventBus.publish({
        type: 'auth.email_verification_requested',
        source: 'AuthApplicationService',
        payload: {
          userId,
          email: user.email,
          verificationToken
        },
        userId
      });

      logger.info('Email verification sent', { userId, email: user.email });
    } catch (error) {
      logger.error('Failed to send email verification', { userId, error });
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<AuthUser> {
    try {
      const user = await this.authRepository.verifyEmail(token);
      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      // Publish email verified event
      await eventBus.publish({
        type: 'auth.email_verified',
        source: 'AuthApplicationService',
        payload: {
          userId: user.id,
          email: user.email
        },
        userId: user.id
      });

      logger.info('Email verified successfully', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Email verification failed', { token, error });
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await this.authRepository.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        logger.info('Password reset requested for non-existent email', { email });
        return;
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 1); // 1 hour expiration

      await this.authRepository.createPasswordResetToken(user.id, resetToken, expires);

      // Publish password reset event
      await eventBus.publish({
        type: 'auth.password_reset_requested',
        source: 'AuthApplicationService',
        payload: {
          userId: user.id,
          email: user.email,
          resetToken
        },
        userId: user.id
      });

      logger.info('Password reset requested', { userId: user.id });
    } catch (error) {
      logger.error('Failed to request password reset', { email, error });
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const user = await this.authRepository.getUserByPasswordResetToken(token);
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Validate new password
      const validation = AuthDomainService.validateCredentials(user.email, newPassword);
      if (!validation.isValid) {
        throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
      }

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      await this.authRepository.updateUser(user.id, {
        password_hash: passwordHash
      });
      await this.authRepository.clearPasswordResetToken(user.id);

      // Deactivate all sessions for security
      await this.authRepository.deactivateAllUserSessions(user.id);

      // Publish password reset event
      await eventBus.publish({
        type: 'auth.password_reset_completed',
        source: 'AuthApplicationService',
        payload: { userId: user.id },
        userId: user.id
      });

      logger.info('Password reset successfully', { userId: user.id });
    } catch (error) {
      logger.error('Password reset failed', { error });
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await this.authRepository.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const currentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!currentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      const validation = AuthDomainService.validateCredentials(user.email, newPassword);
      if (!validation.isValid) {
        throw new Error(`New password validation failed: ${validation.errors.join(', ')}`);
      }

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await this.authRepository.updateUser(userId, {
        password_hash: passwordHash
      });

      // Publish password change event
      await eventBus.publish({
        type: 'auth.password_changed',
        source: 'AuthApplicationService',
        payload: { userId },
        userId
      });

      logger.info('Password changed successfully', { userId });
    } catch (error) {
      logger.error('Password change failed', { userId, error });
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<AuthUser> {
    try {
      const user = await this.authRepository.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error('Failed to get user profile', { userId, error });
      throw error;
    }
  }

  async updateUserRole(userId: string, newRole: string, adminUserId: string): Promise<AuthUser> {
    try {
      // Check admin permissions (this would typically involve more complex authorization logic)
      const admin = await this.authRepository.getUserById(adminUserId);
      if (!admin || admin.role !== 'admin') {
        throw new Error('Insufficient permissions');
      }

      const user = await this.authRepository.updateUser(userId, { role: newRole });

      // Publish role update event
      await eventBus.publish({
        type: 'auth.user_role_updated',
        source: 'AuthApplicationService',
        payload: {
          userId,
          newRole,
          updatedBy: adminUserId
        },
        userId
      });

      logger.info('User role updated', { userId, newRole, adminUserId });
      return user;
    } catch (error) {
      logger.error('Failed to update user role', { userId, newRole, adminUserId, error });
      throw error;
    }
  }

  async lockUserAccount(userId: string, reason: string, adminUserId: string): Promise<void> {
    try {
      const lockUntil = new Date();
      lockUntil.setDate(lockUntil.getDate() + 30); // Lock for 30 days

      await this.authRepository.lockAccount(userId, lockUntil);
      await this.authRepository.deactivateAllUserSessions(userId);

      // Publish account lock event
      await eventBus.publish({
        type: 'auth.account_locked',
        source: 'AuthApplicationService',
        payload: {
          userId,
          reason,
          lockedBy: adminUserId,
          lockUntil
        },
        userId
      });

      logger.warn('User account locked', { userId, reason, adminUserId });
    } catch (error) {
      logger.error('Failed to lock user account', { userId, reason, adminUserId, error });
      throw error;
    }
  }

  async unlockUserAccount(userId: string, adminUserId: string): Promise<void> {
    try {
      await this.authRepository.unlockAccount(userId);

      // Publish account unlock event
      await eventBus.publish({
        type: 'auth.account_unlocked',
        source: 'AuthApplicationService',
        payload: {
          userId,
          unlockedBy: adminUserId
        },
        userId
      });

      logger.info('User account unlocked', { userId, adminUserId });
    } catch (error) {
      logger.error('Failed to unlock user account', { userId, adminUserId, error });
      throw error;
    }
  }

  async getUserSessions(userId: string): Promise<AuthSession[]> {
    try {
      return await this.authRepository.getUserLoginHistory(userId, 50);
    } catch (error) {
      logger.error('Failed to get user sessions', { userId, error });
      throw error;
    }
  }

  async getLoginHistory(userId: string, limit: number = 10): Promise<AuthSession[]> {
    try {
      return await this.authRepository.getUserLoginHistory(userId, limit);
    } catch (error) {
      logger.error('Failed to get login history', { userId, error });
      throw error;
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    try {
      const cleanedCount = await this.authRepository.cleanupExpiredSessions();
      logger.info('Expired sessions cleaned up', { count: cleanedCount });
      return cleanedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', { error });
      throw error;
    }
  }

  private parseExpirationTime(expiresIn: string): number {
    // Parse JWT expiration string to seconds
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default 1 hour

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
      case 's': return num;
      case 'm': return num * 60;
      case 'h': return num * 3600;
      case 'd': return num * 86400;
      default: return 3600;
    }
  }
}