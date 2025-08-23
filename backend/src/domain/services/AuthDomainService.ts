// 🔐 AUTH DOMAIN SERVICE
// Pure domain logic for authentication and authorization business rules

export interface AuthValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface SessionValidationResult {
  isValid: boolean;
  remainingTime?: number;
  needsRefresh: boolean;
  warnings: string[];
}

export interface AccessControlResult {
  hasAccess: boolean;
  reason?: string;
  requiredLevel?: string;
  userLevel?: string;
}

export class AuthDomainService {
  /**
   * Validate user credentials format and basic rules
   */
  static validateCredentials(email: string, password: string): AuthValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Email validation
    if (!email || email.trim().length === 0) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Invalid email format");
      }
    }

    // Password validation
    if (!password) {
      errors.push("Password is required");
    } else {
      if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
      }
      if (!/(?=.*[a-z])/.test(password)) {
        warnings.push("Password should contain lowercase letters");
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        warnings.push("Password should contain uppercase letters");
      }
      if (!/(?=.*\d)/.test(password)) {
        warnings.push("Password should contain numbers");
      }
      if (!/(?=.*[!@#$%^&*])/.test(password)) {
        warnings.push("Password should contain special characters");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate session based on business rules
   */
  static validateSession(
    sessionCreatedAt: Date,
    lastActivityAt: Date,
    maxSessionDuration: number = 24 * 60 * 60 * 1000, // 24 hours
    maxInactivity: number = 2 * 60 * 60 * 1000 // 2 hours
  ): SessionValidationResult {
    const now = new Date();
    const sessionAge = now.getTime() - sessionCreatedAt.getTime();
    const inactivityTime = now.getTime() - lastActivityAt.getTime();
    const warnings: string[] = [];

    // Check if session is too old
    if (sessionAge > maxSessionDuration) {
      return {
        isValid: false,
        remainingTime: 0,
        needsRefresh: true,
        warnings: ["Session has expired due to age"]
      };
    }

    // Check if user has been inactive too long
    if (inactivityTime > maxInactivity) {
      return {
        isValid: false,
        remainingTime: 0,
        needsRefresh: true,
        warnings: ["Session has expired due to inactivity"]
      };
    }

    // Calculate remaining time
    const remainingTime = Math.min(
      maxSessionDuration - sessionAge,
      maxInactivity - inactivityTime
    );

    // Warn if session is close to expiring
    if (remainingTime < 30 * 60 * 1000) { // 30 minutes
      warnings.push("Session will expire soon");
    }

    // Check if refresh is needed
    const needsRefresh = remainingTime < 15 * 60 * 1000; // 15 minutes

    return {
      isValid: true,
      remainingTime,
      needsRefresh,
      warnings
    };
  }

  /**
   * Determine access level based on user role and resource
   */
  static checkAccessLevel(
    userRole: string,
    requiredLevel: string,
    resource?: string
  ): AccessControlResult {
    const roleLevels = {
      'admin': 100,
      'oracle_master': 80,
      'premium': 60,
      'standard': 40,
      'trial': 20,
      'guest': 10
    };

    const requiredLevels = {
      'admin_only': 100,
      'oracle_management': 80,
      'premium_features': 60,
      'standard_features': 40,
      'basic_features': 20,
      'public': 10
    };

    const userLevel = roleLevels[userRole] || 0;
    const requiredLevelValue = requiredLevels[requiredLevel] || 100;

    const hasAccess = userLevel >= requiredLevelValue;

    let reason: string | undefined;
    if (!hasAccess) {
      if (userLevel === 0) {
        reason = "Invalid user role";
      } else {
        reason = `Insufficient access level. Required: ${requiredLevel}, User has: ${userRole}`;
      }
    }

    return {
      hasAccess,
      reason,
      requiredLevel,
      userLevel: userRole
    };
  }

  /**
   * Validate user registration data
   */
  static validateRegistration(
    email: string,
    password: string,
    confirmPassword: string,
    acceptedTerms: boolean
  ): AuthValidationResult {
    const errors: string[] = [];
    
    // Basic credential validation
    const credentialValidation = this.validateCredentials(email, password);
    errors.push(...credentialValidation.errors);

    // Password confirmation
    if (password !== confirmPassword) {
      errors.push("Passwords do not match");
    }

    // Terms acceptance
    if (!acceptedTerms) {
      errors.push("You must accept the terms of service");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: credentialValidation.warnings
    };
  }

  /**
   * Calculate password strength score
   */
  static calculatePasswordStrength(password: string): {
    score: number;
    strength: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong';
    suggestions: string[];
  } {
    let score = 0;
    const suggestions: string[] = [];

    // Length scoring
    if (password.length >= 8) score += 25;
    else suggestions.push("Use at least 8 characters");

    if (password.length >= 12) score += 25;
    else if (password.length >= 8) suggestions.push("Consider using 12+ characters for better security");

    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    else suggestions.push("Add lowercase letters");

    if (/[A-Z]/.test(password)) score += 10;
    else suggestions.push("Add uppercase letters");

    if (/\d/.test(password)) score += 10;
    else suggestions.push("Add numbers");

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;
    else suggestions.push("Add special characters");

    // Determine strength level
    let strength: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong';
    if (score < 30) strength = 'very_weak';
    else if (score < 50) strength = 'weak';
    else if (score < 70) strength = 'fair';
    else if (score < 90) strength = 'good';
    else strength = 'strong';

    return { score, strength, suggestions };
  }

  /**
   * Determine if account lockout is needed based on failed attempts
   */
  static shouldLockAccount(
    failedAttempts: number,
    lastFailedAttempt: Date,
    lockoutThreshold: number = 5,
    lockoutDuration: number = 15 * 60 * 1000 // 15 minutes
  ): {
    shouldLock: boolean;
    lockUntil?: Date;
    remainingAttempts: number;
    nextAttemptAllowedAt?: Date;
  } {
    const now = new Date();
    const timeSinceLastAttempt = now.getTime() - lastFailedAttempt.getTime();

    // Reset attempts if enough time has passed
    if (timeSinceLastAttempt > lockoutDuration) {
      return {
        shouldLock: false,
        remainingAttempts: lockoutThreshold
      };
    }

    const remainingAttempts = Math.max(0, lockoutThreshold - failedAttempts);
    const shouldLock = failedAttempts >= lockoutThreshold;

    let lockUntil: Date | undefined;
    let nextAttemptAllowedAt: Date | undefined;

    if (shouldLock) {
      lockUntil = new Date(lastFailedAttempt.getTime() + lockoutDuration);
      nextAttemptAllowedAt = lockUntil;
    }

    return {
      shouldLock,
      lockUntil,
      remainingAttempts,
      nextAttemptAllowedAt
    };
  }

  /**
   * Validate token format and basic structure
   */
  static validateTokenFormat(token: string, expectedType: 'access' | 'refresh' | 'reset'): {
    isValid: boolean;
    reason?: string;
  } {
    if (!token || typeof token !== 'string') {
      return { isValid: false, reason: "Token is required and must be a string" };
    }

    // Basic JWT format check (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, reason: "Invalid token format" };
    }

    // Check if parts are base64 encoded
    try {
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      // Check for expected token type in payload
      if (expectedType && payload.type !== expectedType) {
        return { isValid: false, reason: `Expected ${expectedType} token` };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, reason: "Invalid token encoding" };
    }
  }

  /**
   * Generate secure session requirements based on user context
   */
  static generateSessionRequirements(
    userRole: string,
    isPublicNetwork: boolean,
    previousSessions: number
  ): {
    maxSessionDuration: number;
    maxInactivity: number;
    requireMFA: boolean;
    allowConcurrentSessions: boolean;
    ipRestriction: boolean;
  } {
    const baseRequirements = {
      maxSessionDuration: 24 * 60 * 60 * 1000, // 24 hours
      maxInactivity: 2 * 60 * 60 * 1000, // 2 hours
      requireMFA: false,
      allowConcurrentSessions: true,
      ipRestriction: false
    };

    // Adjust for user role
    if (userRole === 'admin') {
      baseRequirements.maxSessionDuration = 8 * 60 * 60 * 1000; // 8 hours
      baseRequirements.maxInactivity = 30 * 60 * 1000; // 30 minutes
      baseRequirements.requireMFA = true;
      baseRequirements.allowConcurrentSessions = false;
    } else if (userRole === 'oracle_master') {
      baseRequirements.maxInactivity = 60 * 60 * 1000; // 1 hour
      baseRequirements.requireMFA = isPublicNetwork;
    }

    // Adjust for network security
    if (isPublicNetwork) {
      baseRequirements.maxSessionDuration = Math.min(
        baseRequirements.maxSessionDuration,
        4 * 60 * 60 * 1000 // 4 hours max on public networks
      );
      baseRequirements.maxInactivity = Math.min(
        baseRequirements.maxInactivity,
        30 * 60 * 1000 // 30 minutes max inactivity on public networks
      );
    }

    // Adjust for session history
    if (previousSessions > 10) {
      baseRequirements.requireMFA = true;
    }

    return baseRequirements;
  }
}