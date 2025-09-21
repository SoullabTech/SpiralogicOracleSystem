/**
 * Safety Protocol for Beta Testing
 * Handles crisis detection and appropriate escalation
 */

interface SafetyTrigger {
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
}

interface SafetyResponse {
  acknowledge: string;
  boundary?: string;
  resource?: string;
  action: 'continue' | 'pause' | 'escalate';
}

export class BetaSafetyProtocol {
  private static triggers: SafetyTrigger[] = [
    {
      pattern: /\b(kill myself|end it all|suicide|not worth living)\b/i,
      severity: 'critical',
      category: 'self_harm_explicit'
    },
    {
      pattern: /\b(cutting|hurting myself|self harm)\b/i,
      severity: 'high',
      category: 'self_harm_behavior'
    },
    {
      pattern: /\b(can't feel anything|completely numb|not real|watching myself)\b/i,
      severity: 'medium',
      category: 'dissociation_markers'
    },
    {
      pattern: /\b(hurt someone|kill them|make them pay)\b/i,
      severity: 'critical',
      category: 'harm_to_others'
    },
    {
      pattern: /\b(panic attack|can't breathe|heart racing|dying)\b/i,
      severity: 'high',
      category: 'acute_panic'
    }
  ];

  static async assessMessage(content: string): Promise<SafetyResponse | null> {
    for (const trigger of this.triggers) {
      if (trigger.pattern.test(content)) {
        return this.generateResponse(trigger);
      }
    }
    return null;
  }

  private static generateResponse(trigger: SafetyTrigger): SafetyResponse {
    switch (trigger.severity) {
      case 'critical':
        return {
          acknowledge: "I hear how much pain you're in, and I'm deeply concerned about your safety.",
          boundary: "This level of crisis needs immediate human support - more than I can provide alone.",
          resource: this.getCrisisResources(),
          action: 'escalate'
        };

      case 'high':
        return {
          acknowledge: "I can feel the intensity of what you're experiencing right now.",
          boundary: "While I'm here to listen, this might need additional support beyond our conversation.",
          resource: this.getSupportResources(),
          action: 'pause'
        };

      case 'medium':
        return {
          acknowledge: "That sounds really difficult. Your experience matters.",
          resource: "If you'd like additional support, I can share some resources.",
          action: 'continue'
        };

      default:
        return {
          acknowledge: "I hear you.",
          action: 'continue'
        };
    }
  }

  private static getCrisisResources(): string {
    return `Please reach out for immediate support:

**US Crisis Resources:**
• 988 Suicide & Crisis Lifeline: Call or text 988
• Crisis Text Line: Text HOME to 741741
• Emergency: 911

**International:**
• International crisis lines: findahelpline.com
• Your local emergency number

Would you like me to stay with you while you reach out?`;
  }

  private static getSupportResources(): string {
    return `Here are some resources that might help:

• Crisis Text Line: Text HOME to 741741
• NAMI Helpline: 1-800-950-6264
• Psychology Today therapist finder: psychologytoday.com
• Headspace or Calm apps for immediate grounding

Remember, seeking support is a sign of wisdom, not weakness.`;
  }

  static async logSafetyEvent(
    userId: string,
    category: string,
    severity: string,
    handled: boolean
  ): Promise<void> {
    // Log anonymized safety event
    // Never log actual content, only patterns
    const event = {
      timestamp: new Date().toISOString(),
      user_id_hash: this.hashUserId(userId),
      category,
      severity,
      handled,
      maya_response: 'appropriate_resources_provided'
    };

    // This would connect to your analytics
    console.log('Safety event (anonymized):', event);
  }

  private static hashUserId(userId: string): string {
    // Simple hash for privacy - in production use proper crypto
    return Buffer.from(userId).toString('base64').substring(0, 8);
  }

  static getMayaGuidance(severity: string): string {
    // Guidance for Maya's response tone based on severity
    const guidance = {
      critical: 'maximum_warmth_zero_challenge',
      high: 'pure_presence_no_exploration',
      medium: 'gentle_holding_minimal_inquiry',
      low: 'supportive_witness_soft_reflection'
    };

    return guidance[severity as keyof typeof guidance] || 'standard_response';
  }
}

// In-conversation check
export async function checkConversationSafety(
  message: string,
  userId: string
): Promise<{safe: boolean; response?: SafetyResponse}> {
  const assessment = await BetaSafetyProtocol.assessMessage(message);

  if (assessment) {
    await BetaSafetyProtocol.logSafetyEvent(
      userId,
      'safety_trigger',
      assessment.action,
      true
    );

    if (assessment.action === 'escalate') {
      return { safe: false, response: assessment };
    }
  }

  return { safe: true, response: assessment || undefined };
}

// Session-level monitoring
export class SessionSafetyMonitor {
  private distressMarkers: number = 0;
  private lastCheck: Date = new Date();
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  trackMessage(content: string): void {
    // Track cumulative distress without storing content
    const distressWords = /\b(hurt|pain|scared|alone|empty|broken)\b/gi;
    const matches = content.match(distressWords);

    if (matches) {
      this.distressMarkers += matches.length;
    }

    // Reset counter every hour to avoid false positives
    const now = new Date();
    if (now.getTime() - this.lastCheck.getTime() > 3600000) {
      this.distressMarkers = Math.floor(this.distressMarkers / 2);
      this.lastCheck = now;
    }
  }

  needsCheck(): boolean {
    return this.distressMarkers > 10;
  }

  getSupportSuggestion(): string {
    if (this.distressMarkers > 20) {
      return "I notice this has been a particularly heavy conversation. Would it help to take a break or explore some grounding exercises?";
    } else if (this.distressMarkers > 10) {
      return "I'm here with you through this difficult exploration. Remember you can pause anytime you need.";
    }
    return "";
  }
}