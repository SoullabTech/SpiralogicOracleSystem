/**
 * MAIA Functionality Monitoring
 * Tracks MAIA's core capabilities: memory, personalization, archetypal awareness, and evolution
 *
 * Monitors:
 * 1. User Identity & Continuity (name retention, session linking, context memory)
 * 2. Elemental & Spiralogic Phase Tracking
 * 3. Memory Depth and Evolution
 * 4. Archetypal & Emotional Awareness
 * 5. Technical Flow (API health, context passing)
 */

export interface MaiaSessionContext {
  sessionId: string;
  userId: string;
  userName?: string;
  timestamp: Date;

  // Identity & Continuity
  userNameUsed: boolean;
  userNameAskedFor: boolean; // CRITICAL: Should be false for returning users
  sessionLinked: boolean; // Did MAIA recognize returning user?
  priorContextRecalled: boolean;

  // Elemental & Spiralogic
  elementalMode?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  spiralogicPhase?: string;
  elementalAdaptation: boolean; // Did MAIA adapt tone/practices to element?

  // Memory & Evolution
  memoryDepth: {
    recalledThemes: string[]; // e.g., ['self-worth', 'grief', 'transformation']
    recalledSymbols: string[]; // e.g., ['White Stag', 'Labyrinth']
    recalledGoals: string[];
    priorSessionSummary?: string;
  };
  evolutionTracking: {
    toneAdaptation: boolean;
    recommendationEvolution: boolean;
    patternRecognition: string[];
  };

  // Archetypal & Emotional
  archetypeDetected?: string;
  shadowMaterialDetected: boolean;
  resistancePatternDetected: boolean;
  breakthroughMoment: boolean;
  emotionalTone?: 'joy' | 'grief' | 'anger' | 'fear' | 'peace' | 'mixed';

  // Technical Flow
  apiHealth: {
    responseTimeMs: number;
    contextPayloadComplete: boolean;
    memoryInjectionSuccess: boolean;
    claudePromptQuality: 'excellent' | 'good' | 'poor';
  };

  // Field Intelligence Metadata
  fieldMetadata?: {
    interventionType: string;
    fieldResonance: number;
    emergenceSource: string;
    sacredThreshold?: number;
  };
}

export interface MaiaUserProfile {
  userId: string;
  userName?: string;
  firstSeen: Date;
  lastSeen: Date;
  totalSessions: number;

  // Identity Tracking
  nameRetentionScore: number; // 0-1: How often MAIA uses their name correctly
  nameAskedForCount: number; // Should be 1 for first session, 0 after

  // Elemental Journey
  elementalHistory: Array<{
    date: Date;
    element: string;
    duration: number;
  }>;
  currentSpiralogicPhase?: string;

  // Memory Persistence
  narrativeThreads: string[]; // Ongoing themes across sessions
  archivedInsights: Array<{
    date: Date;
    insight: string;
    archetype?: string;
  }>;
  goalEvolution: Array<{
    date: Date;
    goal: string;
    status: 'active' | 'completed' | 'evolved';
  }>;

  // Archetypal Journey
  archetypeHistory: Array<{
    date: Date;
    archetype: string;
    shadowWork?: boolean;
  }>;
  breakthroughMoments: Array<{
    date: Date;
    description: string;
    context: string;
  }>;

  // Quality Metrics
  averageResponseQuality: number; // 0-1 based on context quality
  memoryDepthScore: number; // 0-1 based on recall accuracy
  adaptationScore: number; // 0-1 based on tone/element adaptation
}

export interface MaiaSystemMetrics {
  // Identity & Continuity Health
  nameRetentionRate: number; // % of sessions where name is used correctly
  nameReaskRate: number; // % of sessions where name is asked again (should be ~0%)
  sessionLinkingRate: number; // % of returning users recognized

  // Memory Performance
  averageMemoryDepth: number; // Average themes/symbols recalled per session
  contextRecallRate: number; // % of sessions with prior context recalled
  narrativeConsistency: number; // How consistent are narrative threads?

  // Adaptation Quality
  elementalAdaptationRate: number; // % of sessions with proper elemental adaptation
  archetypeDetectionRate: number; // % of sessions with archetype detected
  toneEvolutionScore: number; // How well MAIA evolves tone over time

  // Technical Health
  averageResponseTime: number;
  contextPayloadCompleteness: number; // % of complete context payloads
  memoryInjectionSuccessRate: number;
  apiHealthScore: number;

  // Field Intelligence Quality
  fieldResonanceAverage: number;
  sacredThresholdTriggered: number;
  emergenceSourceDistribution: Record<string, number>;
}

export class MaiaMonitoring {
  private sessions = new Map<string, MaiaSessionContext[]>();
  private profiles = new Map<string, MaiaUserProfile>();
  private systemMetrics: MaiaSystemMetrics | null = null;

  // === SESSION TRACKING ===

  startSession(userId: string, userName?: string): string {
    const sessionId = `maia_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: MaiaSessionContext = {
      sessionId,
      userId,
      userName,
      timestamp: new Date(),
      userNameUsed: false,
      userNameAskedFor: false,
      sessionLinked: false,
      priorContextRecalled: false,
      elementalAdaptation: false,
      memoryDepth: {
        recalledThemes: [],
        recalledSymbols: [],
        recalledGoals: []
      },
      evolutionTracking: {
        toneAdaptation: false,
        recommendationEvolution: false,
        patternRecognition: []
      },
      shadowMaterialDetected: false,
      resistancePatternDetected: false,
      breakthroughMoment: false,
      apiHealth: {
        responseTimeMs: 0,
        contextPayloadComplete: false,
        memoryInjectionSuccess: false,
        claudePromptQuality: 'good'
      }
    };

    const userSessions = this.sessions.get(userId) || [];
    userSessions.push(session);
    this.sessions.set(userId, userSessions);

    // Update or create user profile
    this.updateUserProfile(userId, userName);

    console.log(`🤖 MAIA session started: ${sessionId} for user ${userId}${userName ? ` (${userName})` : ''}`);
    return sessionId;
  }

  updateSession(userId: string, updates: Partial<MaiaSessionContext>): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];
    Object.assign(currentSession, updates);

    // CRITICAL CHECK: Flag if name was asked for returning user
    if (updates.userNameAskedFor && userSessions.length > 1) {
      console.error(`🚨 CRITICAL: MAIA asked for name from returning user ${userId}`);
      this.flagCriticalIssue(userId, 'name-re-ask', currentSession);
    }

    this.sessions.set(userId, userSessions);
  }

  private updateUserProfile(userId: string, userName?: string): void {
    let profile = this.profiles.get(userId);

    if (!profile) {
      profile = {
        userId,
        userName,
        firstSeen: new Date(),
        lastSeen: new Date(),
        totalSessions: 1,
        nameRetentionScore: 0,
        nameAskedForCount: userName ? 1 : 0,
        elementalHistory: [],
        narrativeThreads: [],
        archivedInsights: [],
        goalEvolution: [],
        archetypeHistory: [],
        breakthroughMoments: [],
        averageResponseQuality: 0,
        memoryDepthScore: 0,
        adaptationScore: 0
      };
    } else {
      profile.lastSeen = new Date();
      profile.totalSessions += 1;
      if (userName && !profile.userName) {
        profile.userName = userName;
      }
    }

    this.profiles.set(userId, profile);
  }

  // === MEMORY TRACKING ===

  trackMemoryRecall(userId: string, recall: {
    themes?: string[];
    symbols?: string[];
    goals?: string[];
    sessionSummary?: string;
  }): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];

    if (recall.themes) currentSession.memoryDepth.recalledThemes.push(...recall.themes);
    if (recall.symbols) currentSession.memoryDepth.recalledSymbols.push(...recall.symbols);
    if (recall.goals) currentSession.memoryDepth.recalledGoals.push(...recall.goals);
    if (recall.sessionSummary) currentSession.memoryDepth.priorSessionSummary = recall.sessionSummary;

    currentSession.priorContextRecalled =
      currentSession.memoryDepth.recalledThemes.length > 0 ||
      currentSession.memoryDepth.recalledSymbols.length > 0 ||
      currentSession.memoryDepth.recalledGoals.length > 0;

    this.sessions.set(userId, userSessions);

    console.log(`🧠 Memory recall tracked for ${userId}:`, recall);
  }

  // === ARCHETYPAL TRACKING ===

  trackArchetypeDetection(userId: string, archetype: string, shadowWork: boolean = false): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];
    currentSession.archetypeDetected = archetype;
    currentSession.shadowMaterialDetected = shadowWork;

    this.sessions.set(userId, userSessions);

    // Update user profile
    const profile = this.profiles.get(userId);
    if (profile) {
      profile.archetypeHistory.push({
        date: new Date(),
        archetype,
        shadowWork
      });
      this.profiles.set(userId, profile);
    }

    console.log(`🎭 Archetype detected for ${userId}: ${archetype}${shadowWork ? ' (shadow work)' : ''}`);
  }

  trackBreakthrough(userId: string, description: string, context: string): void {
    const profile = this.profiles.get(userId);
    if (!profile) return;

    profile.breakthroughMoments.push({
      date: new Date(),
      description,
      context
    });

    const userSessions = this.sessions.get(userId);
    if (userSessions && userSessions.length > 0) {
      const currentSession = userSessions[userSessions.length - 1];
      currentSession.breakthroughMoment = true;
    }

    this.profiles.set(userId, profile);
    console.log(`✨ Breakthrough moment for ${userId}: ${description}`);
  }

  // === ELEMENTAL TRACKING ===

  trackElementalAdaptation(userId: string, element: string, adapted: boolean): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];
    currentSession.elementalMode = element as any;
    currentSession.elementalAdaptation = adapted;

    this.sessions.set(userId, userSessions);

    // Update user profile
    const profile = this.profiles.get(userId);
    if (profile) {
      profile.elementalHistory.push({
        date: new Date(),
        element,
        duration: 0 // Will be updated when session ends
      });
      this.profiles.set(userId, profile);
    }

    console.log(`🔥 Elemental adaptation for ${userId}: ${element} (${adapted ? 'adapted' : 'not adapted'})`);
  }

  // === TECHNICAL HEALTH ===

  trackApiHealth(userId: string, health: {
    responseTimeMs: number;
    contextPayloadComplete: boolean;
    memoryInjectionSuccess: boolean;
    claudePromptQuality?: 'excellent' | 'good' | 'poor';
  }): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];
    Object.assign(currentSession.apiHealth, health);

    this.sessions.set(userId, userSessions);

    if (health.responseTimeMs > 3000) {
      console.warn(`⚠️ Slow response for ${userId}: ${health.responseTimeMs}ms`);
    }

    if (!health.contextPayloadComplete) {
      console.error(`🚨 Incomplete context payload for ${userId}`);
      this.flagCriticalIssue(userId, 'incomplete-context', currentSession);
    }
  }

  // === FIELD INTELLIGENCE ===

  trackFieldIntelligence(userId: string, fieldMetadata: {
    interventionType: string;
    fieldResonance: number;
    emergenceSource: string;
    sacredThreshold?: number;
  }): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];
    currentSession.fieldMetadata = fieldMetadata;

    this.sessions.set(userId, userSessions);

    console.log(`🌀 Field intelligence for ${userId}:`, fieldMetadata);
  }

  // === CRITICAL ISSUE FLAGGING ===

  private flagCriticalIssue(userId: string, issueType: string, session: MaiaSessionContext): void {
    console.error(`🚨 CRITICAL MAIA ISSUE [${issueType}] for user ${userId} in session ${session.sessionId}`);
    // TODO: Send to monitoring dashboard, Slack, etc.
  }

  // === ANALYTICS & REPORTING ===

  generateSystemMetrics(): MaiaSystemMetrics {
    const allSessions = Array.from(this.sessions.values()).flat();
    const allProfiles = Array.from(this.profiles.values());

    // Identity & Continuity
    const totalSessions = allSessions.length;
    const nameUsedCount = allSessions.filter(s => s.userNameUsed).length;
    const nameReaskCount = allSessions.filter(s => s.userNameAskedFor && s.timestamp > s.timestamp).length; // Rough heuristic
    const sessionLinkedCount = allSessions.filter(s => s.sessionLinked).length;

    // Memory Performance
    const contextRecallCount = allSessions.filter(s => s.priorContextRecalled).length;
    const totalThemesRecalled = allSessions.reduce((sum, s) =>
      sum + s.memoryDepth.recalledThemes.length, 0
    );
    const totalSymbolsRecalled = allSessions.reduce((sum, s) =>
      sum + s.memoryDepth.recalledSymbols.length, 0
    );

    // Adaptation Quality
    const elementalAdaptationCount = allSessions.filter(s => s.elementalAdaptation).length;
    const archetypeDetectedCount = allSessions.filter(s => s.archetypeDetected).length;

    // Technical Health
    const avgResponseTime = allSessions.reduce((sum, s) =>
      sum + s.apiHealth.responseTimeMs, 0
    ) / totalSessions;
    const contextCompleteCount = allSessions.filter(s => s.apiHealth.contextPayloadComplete).length;
    const memoryInjectionCount = allSessions.filter(s => s.apiHealth.memoryInjectionSuccess).length;

    // Field Intelligence
    const fieldSessions = allSessions.filter(s => s.fieldMetadata);
    const avgFieldResonance = fieldSessions.length > 0
      ? fieldSessions.reduce((sum, s) => sum + (s.fieldMetadata?.fieldResonance || 0), 0) / fieldSessions.length
      : 0;

    const emergenceSources: Record<string, number> = {};
    fieldSessions.forEach(s => {
      if (s.fieldMetadata) {
        emergenceSources[s.fieldMetadata.emergenceSource] =
          (emergenceSources[s.fieldMetadata.emergenceSource] || 0) + 1;
      }
    });

    this.systemMetrics = {
      nameRetentionRate: totalSessions > 0 ? nameUsedCount / totalSessions : 0,
      nameReaskRate: totalSessions > 0 ? nameReaskCount / totalSessions : 0,
      sessionLinkingRate: totalSessions > 0 ? sessionLinkedCount / totalSessions : 0,
      averageMemoryDepth: totalSessions > 0
        ? (totalThemesRecalled + totalSymbolsRecalled) / totalSessions
        : 0,
      contextRecallRate: totalSessions > 0 ? contextRecallCount / totalSessions : 0,
      narrativeConsistency: this.calculateNarrativeConsistency(allProfiles),
      elementalAdaptationRate: totalSessions > 0 ? elementalAdaptationCount / totalSessions : 0,
      archetypeDetectionRate: totalSessions > 0 ? archetypeDetectedCount / totalSessions : 0,
      toneEvolutionScore: this.calculateToneEvolution(allSessions),
      averageResponseTime: avgResponseTime,
      contextPayloadCompleteness: totalSessions > 0 ? contextCompleteCount / totalSessions : 0,
      memoryInjectionSuccessRate: totalSessions > 0 ? memoryInjectionCount / totalSessions : 0,
      apiHealthScore: this.calculateApiHealthScore(allSessions),
      fieldResonanceAverage: avgFieldResonance,
      sacredThresholdTriggered: fieldSessions.filter(s =>
        s.fieldMetadata?.sacredThreshold && s.fieldMetadata.sacredThreshold > 0.8
      ).length,
      emergenceSourceDistribution: emergenceSources
    };

    return this.systemMetrics;
  }

  private calculateNarrativeConsistency(profiles: MaiaUserProfile[]): number {
    // Measure how consistent narrative threads are across sessions
    let consistencySum = 0;
    let profileCount = 0;

    profiles.forEach(profile => {
      if (profile.narrativeThreads.length > 0) {
        // Simple heuristic: more threads = more consistent narrative
        consistencySum += Math.min(profile.narrativeThreads.length / 5, 1);
        profileCount++;
      }
    });

    return profileCount > 0 ? consistencySum / profileCount : 0;
  }

  private calculateToneEvolution(sessions: MaiaSessionContext[]): number {
    // Measure how well MAIA evolves tone over time
    let evolutionSum = 0;
    let sessionCount = 0;

    sessions.forEach(session => {
      if (session.evolutionTracking.toneAdaptation) {
        evolutionSum += 1;
      }
      sessionCount++;
    });

    return sessionCount > 0 ? evolutionSum / sessionCount : 0;
  }

  private calculateApiHealthScore(sessions: MaiaSessionContext[]): number {
    // Composite score based on response time, context quality, memory injection
    let healthSum = 0;

    sessions.forEach(session => {
      let score = 1;

      // Response time penalty
      if (session.apiHealth.responseTimeMs > 3000) score -= 0.3;
      else if (session.apiHealth.responseTimeMs > 2000) score -= 0.1;

      // Context payload penalty
      if (!session.apiHealth.contextPayloadComplete) score -= 0.3;

      // Memory injection penalty
      if (!session.apiHealth.memoryInjectionSuccess) score -= 0.2;

      // Prompt quality bonus/penalty
      if (session.apiHealth.claudePromptQuality === 'excellent') score += 0.1;
      else if (session.apiHealth.claudePromptQuality === 'poor') score -= 0.2;

      healthSum += Math.max(0, score);
    });

    return sessions.length > 0 ? healthSum / sessions.length : 0;
  }

  // === USER INSIGHTS ===

  getUserInsights(userId: string): any {
    const profile = this.profiles.get(userId);
    const sessions = this.sessions.get(userId) || [];

    if (!profile) return null;

    const recentSessions = sessions.slice(-5);
    const latestSession = sessions[sessions.length - 1];

    return {
      userId: profile.userId,
      userName: profile.userName,
      totalSessions: profile.totalSessions,
      firstSeen: profile.firstSeen,
      lastSeen: profile.lastSeen,

      // Identity Health
      nameRetention: {
        score: profile.nameRetentionScore,
        timesAskedFor: profile.nameAskedForCount,
        currentlyUsing: latestSession?.userNameUsed || false
      },

      // Memory Performance
      narrativeThreads: profile.narrativeThreads,
      recentInsights: profile.archivedInsights.slice(-3),
      memoryDepthScore: profile.memoryDepthScore,

      // Archetypal Journey
      currentArchetype: latestSession?.archetypeDetected,
      archetypeEvolution: profile.archetypeHistory.slice(-5),
      breakthroughs: profile.breakthroughMoments.length,

      // Elemental Journey
      currentElement: latestSession?.elementalMode,
      elementalHistory: profile.elementalHistory.slice(-7),
      currentPhase: profile.currentSpiralogicPhase,

      // Recent Session Quality
      recentSessions: recentSessions.map(s => ({
        date: s.timestamp,
        contextRecalled: s.priorContextRecalled,
        archetypeDetected: s.archetypeDetected,
        responseTime: s.apiHealth.responseTimeMs,
        breakthrough: s.breakthroughMoment
      })),

      // Quality Scores
      responseQuality: profile.averageResponseQuality,
      adaptationScore: profile.adaptationScore,

      // Recommendations
      suggestions: this.generateSuggestions(profile, recentSessions)
    };
  }

  private generateSuggestions(profile: MaiaUserProfile, recentSessions: MaiaSessionContext[]): string[] {
    const suggestions: string[] = [];

    // Name retention check
    if (profile.nameAskedForCount > 1) {
      suggestions.push('🚨 CRITICAL: MAIA is re-asking for name - fix userName passing');
    }

    // Memory depth check
    const avgMemoryRecall = recentSessions.reduce((sum, s) =>
      sum + s.memoryDepth.recalledThemes.length + s.memoryDepth.recalledSymbols.length, 0
    ) / recentSessions.length;

    if (avgMemoryRecall < 1) {
      suggestions.push('⚠️ Low memory recall - enhance context injection');
    }

    // Archetype detection
    const archetypeDetectionRate = recentSessions.filter(s => s.archetypeDetected).length / recentSessions.length;
    if (archetypeDetectionRate < 0.3) {
      suggestions.push('💡 Low archetype detection - consider enhancing archetypal awareness');
    }

    // Response time
    const avgResponseTime = recentSessions.reduce((sum, s) =>
      sum + s.apiHealth.responseTimeMs, 0
    ) / recentSessions.length;

    if (avgResponseTime > 2500) {
      suggestions.push('⏱️ Slow response times - optimize API calls');
    }

    // Breakthrough moments
    if (profile.breakthroughMoments.length === 0 && profile.totalSessions > 5) {
      suggestions.push('✨ No breakthroughs detected - may need deeper exploration prompts');
    }

    return suggestions;
  }

  // === EXPORT ===

  exportMaiaReport(): string {
    const metrics = this.generateSystemMetrics();
    const date = new Date().toISOString().split('T')[0];

    return `# MAIA Functionality Report - ${date}

## 🎯 Identity & Continuity
- **Name Retention Rate**: ${(metrics.nameRetentionRate * 100).toFixed(1)}%
- **Name Re-ask Rate**: ${(metrics.nameReaskRate * 100).toFixed(1)}% ${metrics.nameReaskRate > 0.01 ? '🚨 CRITICAL' : '✅'}
- **Session Linking Rate**: ${(metrics.sessionLinkingRate * 100).toFixed(1)}%

## 🧠 Memory Performance
- **Average Memory Depth**: ${metrics.averageMemoryDepth.toFixed(2)} items per session
- **Context Recall Rate**: ${(metrics.contextRecallRate * 100).toFixed(1)}%
- **Narrative Consistency**: ${(metrics.narrativeConsistency * 100).toFixed(1)}%

## 🎭 Adaptation & Awareness
- **Elemental Adaptation Rate**: ${(metrics.elementalAdaptationRate * 100).toFixed(1)}%
- **Archetype Detection Rate**: ${(metrics.archetypeDetectionRate * 100).toFixed(1)}%
- **Tone Evolution Score**: ${(metrics.toneEvolutionScore * 100).toFixed(1)}%

## ⚙️ Technical Health
- **Average Response Time**: ${metrics.averageResponseTime.toFixed(0)}ms
- **Context Payload Completeness**: ${(metrics.contextPayloadCompleteness * 100).toFixed(1)}%
- **Memory Injection Success**: ${(metrics.memoryInjectionSuccessRate * 100).toFixed(1)}%
- **Overall API Health**: ${(metrics.apiHealthScore * 100).toFixed(1)}%

## 🌀 Field Intelligence
- **Field Resonance Average**: ${metrics.fieldResonanceAverage.toFixed(2)}
- **Sacred Threshold Triggered**: ${metrics.sacredThresholdTriggered} times
- **Emergence Sources**:
${Object.entries(metrics.emergenceSourceDistribution)
  .map(([source, count]) => `  - ${source}: ${count}`)
  .join('\n')}

---
Generated: ${new Date().toISOString()}

## 🎯 Action Items
${this.generateActionItems(metrics)}
`;
  }

  private generateActionItems(metrics: MaiaSystemMetrics): string {
    const items: string[] = [];

    if (metrics.nameReaskRate > 0.01) {
      items.push('🚨 CRITICAL: Fix userName passing in API - users being asked for name repeatedly');
    }

    if (metrics.contextRecallRate < 0.5) {
      items.push('⚠️ Enhance memory injection - context recall below 50%');
    }

    if (metrics.elementalAdaptationRate < 0.6) {
      items.push('💡 Improve elemental adaptation logic');
    }

    if (metrics.averageResponseTime > 2500) {
      items.push('⏱️ Optimize API response time');
    }

    if (metrics.apiHealthScore < 0.8) {
      items.push('🔧 Investigate API health issues - score below 80%');
    }

    return items.length > 0 ? items.join('\n') : '✅ All systems operating within acceptable parameters';
  }
}

// Singleton instance
export const maiaMonitoring = new MaiaMonitoring();