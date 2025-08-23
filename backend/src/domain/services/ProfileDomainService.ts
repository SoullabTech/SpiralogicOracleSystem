// 🧠 PROFILE DOMAIN SERVICE
// Pure domain logic for user profile operations, no infrastructure dependencies

export interface UserProfile {
  personal_guide_name: string;
  guide_gender: string;
  voice_id: string;
  guide_language: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ProfileUpdateResult {
  success: boolean;
  updatedProfile?: UserProfile;
  errors: string[];
}

export class ProfileDomainService {
  /**
   * Validate user profile data
   */
  static validateProfile(profile: Partial<UserProfile>): ProfileValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (profile.personal_guide_name !== undefined) {
      if (!profile.personal_guide_name || profile.personal_guide_name.trim().length === 0) {
        errors.push("Personal guide name is required");
      } else if (profile.personal_guide_name.length > 50) {
        errors.push("Personal guide name must be 50 characters or less");
      } else if (!/^[a-zA-Z\s'-]+$/.test(profile.personal_guide_name)) {
        errors.push("Personal guide name can only contain letters, spaces, hyphens, and apostrophes");
      }
    }

    // Validate guide gender
    if (profile.guide_gender !== undefined) {
      const validGenders = ['masculine', 'feminine', 'neutral', 'fluid'];
      if (!validGenders.includes(profile.guide_gender)) {
        errors.push(`Guide gender must be one of: ${validGenders.join(', ')}`);
      }
    }

    // Validate voice ID
    if (profile.voice_id !== undefined) {
      if (!profile.voice_id || profile.voice_id.trim().length === 0) {
        errors.push("Voice ID is required");
      } else if (profile.voice_id.length > 100) {
        errors.push("Voice ID must be 100 characters or less");
      }
    }

    // Validate language
    if (profile.guide_language !== undefined) {
      const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'];
      if (!validLanguages.includes(profile.guide_language)) {
        errors.push(`Guide language must be one of: ${validLanguages.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create default profile for new user
   */
  static createDefaultProfile(): UserProfile {
    return {
      personal_guide_name: "Oracle",
      guide_gender: "neutral",
      voice_id: "default_neutral_voice",
      guide_language: "en",
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  /**
   * Merge profile updates with existing profile
   */
  static mergeProfileUpdates(
    currentProfile: UserProfile,
    updates: Partial<UserProfile>
  ): ProfileUpdateResult {
    // Validate updates first
    const validation = this.validateProfile(updates);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    // Create updated profile
    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...updates,
      updated_at: new Date()
    };

    return {
      success: true,
      updatedProfile,
      errors: []
    };
  }

  /**
   * Calculate profile completion percentage
   */
  static calculateProfileCompleteness(profile: UserProfile): number {
    const requiredFields = ['personal_guide_name', 'guide_gender', 'voice_id', 'guide_language'];
    const optionalFields: string[] = []; // Add optional fields here as they're added
    
    const allFields = [...requiredFields, ...optionalFields];
    const completedFields = allFields.filter(field => {
      const value = profile[field as keyof UserProfile];
      return value !== undefined && value !== null && value !== '';
    });

    return Math.round((completedFields.length / allFields.length) * 100);
  }

  /**
   * Determine if profile needs attention
   */
  static assessProfileHealth(profile: UserProfile): {
    status: 'healthy' | 'needs_attention' | 'incomplete';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check for missing or default values
    if (profile.personal_guide_name === "Oracle") {
      issues.push("Using default guide name");
      recommendations.push("Personalize your guide name for a more intimate experience");
    }

    if (profile.voice_id === "default_neutral_voice") {
      issues.push("Using default voice");
      recommendations.push("Choose a voice that resonates with your guide's energy");
    }

    if (profile.guide_gender === "neutral") {
      recommendations.push("Consider selecting a guide gender that feels most supportive");
    }

    // Check last updated
    const daysSinceUpdate = profile.updated_at 
      ? Math.floor((Date.now() - profile.updated_at.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysSinceUpdate > 90) {
      issues.push("Profile not updated recently");
      recommendations.push("Review and refresh your guide preferences");
    }

    // Determine status
    let status: 'healthy' | 'needs_attention' | 'incomplete';
    if (issues.length === 0) {
      status = 'healthy';
    } else if (issues.some(issue => issue.includes('default') || issue.includes('missing'))) {
      status = 'incomplete';
    } else {
      status = 'needs_attention';
    }

    return { status, issues, recommendations };
  }

  /**
   * Generate profile insights for personalization
   */
  static generateProfileInsights(profile: UserProfile): {
    personalizationLevel: 'low' | 'medium' | 'high';
    dominantPreferences: string[];
    suggestedEnhancements: string[];
  } {
    const insights = {
      personalizationLevel: 'low' as const,
      dominantPreferences: [] as string[],
      suggestedEnhancements: [] as string[]
    };

    // Analyze personalization level
    let personalizedCount = 0;
    
    if (profile.personal_guide_name !== "Oracle") personalizedCount++;
    if (profile.voice_id !== "default_neutral_voice") personalizedCount++;
    if (profile.guide_gender !== "neutral") personalizedCount++;
    if (profile.guide_language !== "en") personalizedCount++;

    if (personalizedCount >= 3) insights.personalizationLevel = 'high';
    else if (personalizedCount >= 2) insights.personalizationLevel = 'medium';

    // Identify dominant preferences
    if (profile.guide_gender === 'feminine') {
      insights.dominantPreferences.push('Feminine energy preference');
    } else if (profile.guide_gender === 'masculine') {
      insights.dominantPreferences.push('Masculine energy preference');
    }

    if (profile.guide_language !== 'en') {
      insights.dominantPreferences.push(`Multi-lingual (${profile.guide_language})`);
    }

    // Suggest enhancements based on current state
    if (insights.personalizationLevel === 'low') {
      insights.suggestedEnhancements.push('Personalize guide name');
      insights.suggestedEnhancements.push('Select preferred voice');
      insights.suggestedEnhancements.push('Choose guide energy type');
    }

    if (profile.voice_id.includes('default')) {
      insights.suggestedEnhancements.push('Explore voice options for deeper connection');
    }

    return insights;
  }
}