/**
 * Personality Resonance System for Maia
 * Tracks and adapts to each user's unique communication style
 */

export interface UserResonanceProfile {
  explorerId: string;
  explorerName: string;

  // Communication style metrics (0-10 scale)
  styles: {
    intellectual: number;      // Abstract, analytical
    emotional: number;         // Feeling-oriented
    practical: number;         // Direct, solution-focused
    creative: number;          // Metaphorical, imaginative
    spiritual: number;         // Philosophical, meaning-seeking
  };

  // Pacing preferences
  pacing: {
    speakingSpeed: 'slow' | 'moderate' | 'fast';
    depthPreference: 'surface' | 'moderate' | 'deep';
    sessionLength: 'brief' | 'moderate' | 'extended';
  };

  // Language patterns
  languagePatterns: {
    formalityLevel: number;        // 1-10 (1=very casual, 10=very formal)
    metaphorUsage: number;          // 1-10
    emotionalExpression: number;    // 1-10
    favoriteWords: string[];        // Words they use often
    communicationStyle: string[];   // e.g., ['questions', 'stories', 'analysis']
  };

  // Emotional patterns
  emotionalBaseline: {
    defaultMood: 'anxious' | 'calm' | 'energetic' | 'contemplative' | 'varied';
    openness: number;               // 1-10
    vulnerabilityComfort: number;   // 1-10
  };

  // Topics of interest
  interests: {
    primary: string[];              // Main themes they explore
    emerging: string[];             // New areas showing up
    avoided: string[];              // Topics they steer away from
  };

  // Resonance evolution
  sessionCount: number;
  lastUpdated: Date;
  resonanceLevel: number;           // 0-100% how much Maia adapts
}

export class PersonalityResonance {
  private profile: UserResonanceProfile;

  constructor(explorerId: string, explorerName: string) {
    this.profile = this.initializeProfile(explorerId, explorerName);
  }

  /**
   * Initialize a new user profile with neutral settings
   */
  private initializeProfile(explorerId: string, explorerName: string): UserResonanceProfile {
    return {
      explorerId,
      explorerName,
      styles: {
        intellectual: 5,
        emotional: 5,
        practical: 5,
        creative: 5,
        spiritual: 5
      },
      pacing: {
        speakingSpeed: 'moderate',
        depthPreference: 'moderate',
        sessionLength: 'moderate'
      },
      languagePatterns: {
        formalityLevel: 5,
        metaphorUsage: 5,
        emotionalExpression: 5,
        favoriteWords: [],
        communicationStyle: []
      },
      emotionalBaseline: {
        defaultMood: 'calm',
        openness: 5,
        vulnerabilityComfort: 3
      },
      interests: {
        primary: [],
        emerging: [],
        avoided: []
      },
      sessionCount: 0,
      lastUpdated: new Date(),
      resonanceLevel: 30 // Start with 30% adaptation
    };
  }

  /**
   * Analyze a user message and update their profile
   */
  analyzeMessage(message: string): void {
    // Detect intellectual style
    if (this.containsIntellectualMarkers(message)) {
      this.profile.styles.intellectual = Math.min(10, this.profile.styles.intellectual + 0.2);
    }

    // Detect emotional expression
    if (this.containsEmotionalMarkers(message)) {
      this.profile.styles.emotional = Math.min(10, this.profile.styles.emotional + 0.2);
      this.profile.languagePatterns.emotionalExpression += 0.1;
    }

    // Detect practical orientation
    if (this.containsPracticalMarkers(message)) {
      this.profile.styles.practical = Math.min(10, this.profile.styles.practical + 0.2);
    }

    // Detect creative/metaphorical language
    if (this.containsCreativeMarkers(message)) {
      this.profile.styles.creative = Math.min(10, this.profile.styles.creative + 0.2);
      this.profile.languagePatterns.metaphorUsage += 0.1;
    }

    // Detect spiritual/philosophical orientation
    if (this.containsSpiritualMarkers(message)) {
      this.profile.styles.spiritual = Math.min(10, this.profile.styles.spiritual + 0.2);
    }

    // Update formality level
    this.updateFormalityLevel(message);

    // Track favorite words
    this.trackFavoriteWords(message);

    // Update pacing based on message length
    this.updatePacing(message);

    this.profile.lastUpdated = new Date();
  }

  /**
   * Get Maia's adapted response style based on user profile
   */
  getMaiaStyle(): MaiaResponseStyle {
    const dominantStyle = this.getDominantStyle();
    const resonanceMultiplier = this.profile.resonanceLevel / 100;

    return {
      primaryTone: dominantStyle,
      formalityLevel: this.profile.languagePatterns.formalityLevel,
      metaphorUsage: this.profile.languagePatterns.metaphorUsage * resonanceMultiplier,
      emotionalMirroring: this.profile.languagePatterns.emotionalExpression * resonanceMultiplier,
      pacingMatch: this.profile.pacing,
      suggestedPhrases: this.getSuggestedPhrases(),
      topicsToExplore: this.profile.interests.primary,
      topicsToAvoid: this.profile.interests.avoided,
      resonanceLevel: this.profile.resonanceLevel
    };
  }

  /**
   * Update resonance level based on session count
   */
  updateResonanceLevel(): void {
    const sessionCount = this.profile.sessionCount;

    if (sessionCount <= 3) {
      this.profile.resonanceLevel = 30; // Light mirroring
    } else if (sessionCount <= 7) {
      this.profile.resonanceLevel = 50 + (sessionCount - 3) * 5; // 50-70%
    } else {
      this.profile.resonanceLevel = Math.min(80, 70 + (sessionCount - 7) * 2); // Max 80%
    }
  }

  // Helper methods

  private containsIntellectualMarkers(message: string): boolean {
    const markers = /\b(think|analyze|understand|logic|reason|theory|concept|framework|system|evidence)\b/gi;
    return markers.test(message);
  }

  private containsEmotionalMarkers(message: string): boolean {
    const markers = /\b(feel|felt|feeling|emotion|heart|soul|love|fear|sad|happy|angry|hurt|scared)\b/gi;
    return markers.test(message);
  }

  private containsPracticalMarkers(message: string): boolean {
    const markers = /\b(need|want|how to|what should|advice|help|solution|fix|deal with|handle|manage)\b/gi;
    return markers.test(message);
  }

  private containsCreativeMarkers(message: string): boolean {
    const markers = /\b(like|as if|imagine|metaphor|story|dream|vision|color|music|art|create)\b/gi;
    return markers.test(message) || message.includes('...') || message.includes('~');
  }

  private containsSpiritualMarkers(message: string): boolean {
    const markers = /\b(spirit|soul|meaning|purpose|universe|consciousness|awakening|divine|sacred|wisdom|truth)\b/gi;
    return markers.test(message);
  }

  private updateFormalityLevel(message: string): void {
    const contractions = (message.match(/\b(don't|won't|can't|I'm|it's|that's)\b/gi) || []).length;
    const formalWords = (message.match(/\b(therefore|however|moreover|nevertheless|indeed)\b/gi) || []).length;

    if (contractions > formalWords) {
      this.profile.languagePatterns.formalityLevel = Math.max(1, this.profile.languagePatterns.formalityLevel - 0.1);
    } else if (formalWords > contractions) {
      this.profile.languagePatterns.formalityLevel = Math.min(10, this.profile.languagePatterns.formalityLevel + 0.1);
    }
  }

  private trackFavoriteWords(message: string): void {
    const words = message.toLowerCase().split(/\s+/);
    const meaningfulWords = words.filter(w =>
      w.length > 4 &&
      !['that', 'this', 'with', 'from', 'have', 'been', 'were', 'their'].includes(w)
    );

    // Add to favorite words if used multiple times
    meaningfulWords.forEach(word => {
      if (!this.profile.languagePatterns.favoriteWords.includes(word)) {
        const count = meaningfulWords.filter(w => w === word).length;
        if (count >= 2) {
          this.profile.languagePatterns.favoriteWords.push(word);
          // Keep only top 20 favorite words
          if (this.profile.languagePatterns.favoriteWords.length > 20) {
            this.profile.languagePatterns.favoriteWords.shift();
          }
        }
      }
    });
  }

  private updatePacing(message: string): void {
    const wordCount = message.split(/\s+/).length;

    if (wordCount < 20) {
      this.profile.pacing.sessionLength = 'brief';
    } else if (wordCount > 100) {
      this.profile.pacing.sessionLength = 'extended';
    }
  }

  private getDominantStyle(): string {
    const styles = this.profile.styles;
    const maxStyle = Math.max(
      styles.intellectual,
      styles.emotional,
      styles.practical,
      styles.creative,
      styles.spiritual
    );

    if (styles.intellectual === maxStyle) return 'intellectual';
    if (styles.emotional === maxStyle) return 'emotional';
    if (styles.practical === maxStyle) return 'practical';
    if (styles.creative === maxStyle) return 'creative';
    return 'spiritual';
  }

  private getSuggestedPhrases(): string[] {
    const style = this.getDominantStyle();
    const formality = this.profile.languagePatterns.formalityLevel;

    const phrases: Record<string, string[]> = {
      intellectual: formality > 6
        ? ["That's an interesting framework", "How does that connect to", "What's your analysis of"]
        : ["That's interesting", "How does that relate to", "What do you think about"],

      emotional: formality > 6
        ? ["How does that resonate with you", "What feelings arise when", "That sounds emotionally significant"]
        : ["How does that feel", "What comes up for you", "That sounds really important"],

      practical: formality > 6
        ? ["What specific steps", "How might you approach", "What would be most helpful"]
        : ["What would help", "How could you", "What's the next step"],

      creative: formality > 6
        ? ["What imagery comes to mind", "How would you describe", "That's a beautiful metaphor"]
        : ["What does that look like", "Tell me more about that image", "I love that description"],

      spiritual: formality > 6
        ? ["What deeper meaning", "How does this connect to your purpose", "What wisdom emerges"]
        : ["What does this mean to you", "How does this fit your journey", "What feels true here"]
    };

    return phrases[style] || phrases.emotional;
  }
}

export interface MaiaResponseStyle {
  primaryTone: string;
  formalityLevel: number;
  metaphorUsage: number;
  emotionalMirroring: number;
  pacingMatch: UserResonanceProfile['pacing'];
  suggestedPhrases: string[];
  topicsToExplore: string[];
  topicsToAvoid: string[];
  resonanceLevel: number;
}