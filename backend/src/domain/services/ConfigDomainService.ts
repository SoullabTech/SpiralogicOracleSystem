// ⚙️ CONFIG DOMAIN SERVICE
// Pure domain logic for configuration validation and business rules

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EnvironmentConfig {
  environment: 'development' | 'staging' | 'production';
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  allowRegistration: boolean;
  maintenanceMode: boolean;
}

export interface OracleConfig {
  maxAgentsPerUser: number;
  sessionTimeoutMinutes: number;
  maxQueryLength: number;
  allowedArchetypes: string[];
  defaultArchetype: string;
  voiceEnabled: boolean;
  ceremonyMode: boolean;
}

export interface SecurityConfig {
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  sessionPolicy: {
    maxDurationHours: number;
    maxInactivityMinutes: number;
    allowConcurrent: boolean;
  };
  mfaRequired: boolean;
}

export interface IntegrationConfig {
  openai: {
    enabled: boolean;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  elevenlabs: {
    enabled: boolean;
    maxCharacters: number;
    defaultVoice: string;
  };
  supabase: {
    maxConnections: number;
    connectionTimeout: number;
  };
}

export class ConfigDomainService {
  /**
   * Validate environment configuration
   */
  static validateEnvironmentConfig(config: Partial<EnvironmentConfig>): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Environment validation
    if (!config.environment) {
      errors.push("Environment is required");
    } else if (!['development', 'staging', 'production'].includes(config.environment)) {
      errors.push("Environment must be 'development', 'staging', or 'production'");
    }

    // Log level validation
    if (config.logLevel && !['debug', 'info', 'warn', 'error'].includes(config.logLevel)) {
      errors.push("Log level must be 'debug', 'info', 'warn', or 'error'");
    }

    // Production-specific validations
    if (config.environment === 'production') {
      if (config.debugMode === true) {
        warnings.push("Debug mode should be disabled in production");
      }
      if (config.logLevel === 'debug') {
        warnings.push("Debug logging should be disabled in production");
      }
      if (config.allowRegistration === true && config.maintenanceMode === false) {
        warnings.push("Consider disabling registration or enabling maintenance mode for production rollouts");
      }
    }

    // Development-specific warnings
    if (config.environment === 'development') {
      if (config.debugMode === false) {
        warnings.push("Debug mode is typically enabled in development");
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate Oracle-specific configuration
   */
  static validateOracleConfig(config: Partial<OracleConfig>): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Max agents validation
    if (config.maxAgentsPerUser !== undefined) {
      if (config.maxAgentsPerUser < 1) {
        errors.push("Max agents per user must be at least 1");
      } else if (config.maxAgentsPerUser > 10) {
        warnings.push("Having more than 10 agents per user may impact performance");
      }
    }

    // Session timeout validation
    if (config.sessionTimeoutMinutes !== undefined) {
      if (config.sessionTimeoutMinutes < 5) {
        errors.push("Session timeout must be at least 5 minutes");
      } else if (config.sessionTimeoutMinutes > 1440) { // 24 hours
        warnings.push("Session timeout longer than 24 hours may pose security risks");
      }
    }

    // Query length validation
    if (config.maxQueryLength !== undefined) {
      if (config.maxQueryLength < 10) {
        errors.push("Max query length must be at least 10 characters");
      } else if (config.maxQueryLength > 10000) {
        warnings.push("Very long queries may impact processing performance");
      }
    }

    // Archetype validation
    const validArchetypes = ['fire', 'water', 'earth', 'air', 'aether'];
    if (config.allowedArchetypes) {
      const invalidArchetypes = config.allowedArchetypes.filter(
        archetype => !validArchetypes.includes(archetype)
      );
      if (invalidArchetypes.length > 0) {
        errors.push(`Invalid archetypes: ${invalidArchetypes.join(', ')}`);
      }
      if (config.allowedArchetypes.length === 0) {
        errors.push("At least one archetype must be allowed");
      }
    }

    if (config.defaultArchetype && !validArchetypes.includes(config.defaultArchetype)) {
      errors.push(`Default archetype must be one of: ${validArchetypes.join(', ')}`);
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate security configuration
   */
  static validateSecurityConfig(config: Partial<SecurityConfig>): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Rate limiting validation
    if (config.rateLimiting) {
      if (config.rateLimiting.windowMs < 1000) {
        errors.push("Rate limiting window must be at least 1 second");
      }
      if (config.rateLimiting.maxRequests < 1) {
        errors.push("Rate limiting must allow at least 1 request");
      }
      if (config.rateLimiting.maxRequests > 1000) {
        warnings.push("High rate limits may not provide adequate protection");
      }
    }

    // Password policy validation
    if (config.passwordPolicy) {
      const policy = config.passwordPolicy;
      if (policy.minLength < 8) {
        errors.push("Minimum password length should be at least 8 characters");
      }
      if (policy.minLength > 128) {
        warnings.push("Very long password requirements may impact usability");
      }

      // Check if policy is too restrictive
      const requirementCount = [
        policy.requireUppercase,
        policy.requireLowercase,
        policy.requireNumbers,
        policy.requireSpecialChars
      ].filter(Boolean).length;

      if (requirementCount === 0) {
        warnings.push("Password policy has no character requirements");
      }
    }

    // Session policy validation
    if (config.sessionPolicy) {
      const session = config.sessionPolicy;
      if (session.maxDurationHours < 1) {
        errors.push("Session duration must be at least 1 hour");
      }
      if (session.maxDurationHours > 168) { // 1 week
        warnings.push("Very long session durations may pose security risks");
      }
      if (session.maxInactivityMinutes < 5) {
        errors.push("Session inactivity timeout must be at least 5 minutes");
      }
      if (session.maxInactivityMinutes > session.maxDurationHours * 60) {
        errors.push("Session inactivity timeout cannot exceed max duration");
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate integration configuration
   */
  static validateIntegrationConfig(config: Partial<IntegrationConfig>): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // OpenAI validation
    if (config.openai) {
      const openai = config.openai;
      if (openai.enabled) {
        if (!openai.model) {
          errors.push("OpenAI model is required when OpenAI is enabled");
        }
        if (openai.maxTokens !== undefined) {
          if (openai.maxTokens < 100) {
            errors.push("OpenAI max tokens should be at least 100");
          }
          if (openai.maxTokens > 32000) {
            warnings.push("High token limits may increase costs significantly");
          }
        }
        if (openai.temperature !== undefined) {
          if (openai.temperature < 0 || openai.temperature > 2) {
            errors.push("OpenAI temperature must be between 0 and 2");
          }
        }
      }
    }

    // ElevenLabs validation
    if (config.elevenlabs) {
      const elevenlabs = config.elevenlabs;
      if (elevenlabs.enabled) {
        if (elevenlabs.maxCharacters !== undefined) {
          if (elevenlabs.maxCharacters < 100) {
            errors.push("ElevenLabs max characters should be at least 100");
          }
          if (elevenlabs.maxCharacters > 10000) {
            warnings.push("High character limits may increase voice synthesis costs");
          }
        }
        if (!elevenlabs.defaultVoice) {
          errors.push("Default voice is required when ElevenLabs is enabled");
        }
      }
    }

    // Supabase validation
    if (config.supabase) {
      const supabase = config.supabase;
      if (supabase.maxConnections !== undefined) {
        if (supabase.maxConnections < 5) {
          errors.push("Supabase max connections should be at least 5");
        }
        if (supabase.maxConnections > 100) {
          warnings.push("Very high connection limits may overwhelm the database");
        }
      }
      if (supabase.connectionTimeout !== undefined) {
        if (supabase.connectionTimeout < 1000) {
          errors.push("Connection timeout should be at least 1 second");
        }
        if (supabase.connectionTimeout > 60000) {
          warnings.push("Long connection timeouts may cause poor user experience");
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Generate default configuration based on environment
   */
  static generateDefaultConfig(environment: 'development' | 'staging' | 'production'): {
    environment: EnvironmentConfig;
    oracle: OracleConfig;
    security: SecurityConfig;
    integrations: IntegrationConfig;
  } {
    const baseConfig = {
      environment: {
        environment,
        debugMode: environment === 'development',
        logLevel: environment === 'production' ? 'info' as const : 'debug' as const,
        allowRegistration: true,
        maintenanceMode: false
      },
      oracle: {
        maxAgentsPerUser: 3,
        sessionTimeoutMinutes: environment === 'production' ? 60 : 120,
        maxQueryLength: 5000,
        allowedArchetypes: ['fire', 'water', 'earth', 'air', 'aether'],
        defaultArchetype: 'aether',
        voiceEnabled: true,
        ceremonyMode: false
      },
      security: {
        rateLimiting: {
          windowMs: environment === 'production' ? 60000 : 30000, // 1 minute in prod, 30s in dev
          maxRequests: environment === 'production' ? 100 : 1000
        },
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: environment === 'production'
        },
        sessionPolicy: {
          maxDurationHours: environment === 'production' ? 8 : 24,
          maxInactivityMinutes: environment === 'production' ? 30 : 120,
          allowConcurrent: environment !== 'production'
        },
        mfaRequired: environment === 'production'
      },
      integrations: {
        openai: {
          enabled: true,
          model: 'gpt-4',
          maxTokens: environment === 'production' ? 2000 : 4000,
          temperature: 0.7
        },
        elevenlabs: {
          enabled: true,
          maxCharacters: environment === 'production' ? 2500 : 5000,
          defaultVoice: 'default_neutral_voice'
        },
        supabase: {
          maxConnections: environment === 'production' ? 20 : 10,
          connectionTimeout: 10000
        }
      }
    };

    return baseConfig;
  }

  /**
   * Check configuration compatibility between sections
   */
  static validateConfigCompatibility(config: {
    environment: Partial<EnvironmentConfig>;
    oracle: Partial<OracleConfig>;
    security: Partial<SecurityConfig>;
    integrations: Partial<IntegrationConfig>;
  }): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Environment vs Security compatibility
    if (config.environment?.environment === 'production') {
      if (config.security?.mfaRequired === false) {
        warnings.push("Consider enabling MFA in production");
      }
      if (config.security?.sessionPolicy?.allowConcurrent === true) {
        warnings.push("Concurrent sessions may pose security risks in production");
      }
    }

    // Oracle vs Integration compatibility
    if (config.oracle?.voiceEnabled === true && config.integrations?.elevenlabs?.enabled === false) {
      errors.push("Voice cannot be enabled if ElevenLabs integration is disabled");
    }

    // Rate limiting vs Oracle usage compatibility
    if (config.security?.rateLimiting && config.oracle?.maxAgentsPerUser) {
      const estimatedRequests = config.oracle.maxAgentsPerUser * 10; // Rough estimate
      if (config.security.rateLimiting.maxRequests < estimatedRequests) {
        warnings.push("Rate limiting may be too restrictive for Oracle usage patterns");
      }
    }

    // Session timeout compatibility
    if (config.oracle?.sessionTimeoutMinutes && config.security?.sessionPolicy?.maxDurationHours) {
      const oracleTimeoutMs = config.oracle.sessionTimeoutMinutes * 60 * 1000;
      const securityTimeoutMs = config.security.sessionPolicy.maxDurationHours * 60 * 60 * 1000;
      
      if (oracleTimeoutMs > securityTimeoutMs) {
        errors.push("Oracle session timeout cannot exceed security session max duration");
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Calculate configuration health score
   */
  static calculateConfigHealth(config: {
    environment: Partial<EnvironmentConfig>;
    oracle: Partial<OracleConfig>;
    security: Partial<SecurityConfig>;
    integrations: Partial<IntegrationConfig>;
  }): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    issues: string[];
    recommendations: string[];
  } {
    let score = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Validate each section
    const envValidation = this.validateEnvironmentConfig(config.environment);
    const oracleValidation = this.validateOracleConfig(config.oracle);
    const securityValidation = this.validateSecurityConfig(config.security);
    const integrationValidation = this.validateIntegrationConfig(config.integrations);
    const compatibilityValidation = this.validateConfigCompatibility(config);

    // Deduct points for errors (more severe)
    const allErrors = [
      ...envValidation.errors,
      ...oracleValidation.errors,
      ...securityValidation.errors,
      ...integrationValidation.errors,
      ...compatibilityValidation.errors
    ];
    
    score -= allErrors.length * 15;
    issues.push(...allErrors);

    // Deduct points for warnings (less severe)
    const allWarnings = [
      ...envValidation.warnings,
      ...oracleValidation.warnings,
      ...securityValidation.warnings,
      ...integrationValidation.warnings,
      ...compatibilityValidation.warnings
    ];
    
    score -= allWarnings.length * 5;
    recommendations.push(...allWarnings);

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return { score, grade, issues, recommendations };
  }
}