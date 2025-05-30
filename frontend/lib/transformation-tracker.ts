// ===============================================
// transformationTracker.ts
// Measuring growth, not satisfaction
// ===============================================

export interface TransformationMetrics {
  userId: string;
  metrics: {
    meaningfulPauses: number;
    depthReached: string[];
    shadowWork: number;
    patternsInterrupted: number;
    authenticExpressions: number;
    resistanceOffered: number;
    resistanceReceived: 'rejected' | 'explored' | 'integrated';
    transformationMilestones: Milestone[];
    breakthoughMoments: number;
    vulnerabilityShared: number;
    truthTelling: number;
    comfortSeeking: number;
    growthChoices: number;
    integrationActions: number;
  };
  sessionData: SessionMetrics[];
  overallProgress: ProgressAssessment;
}

export interface Milestone {
  id: string;
  date: Date;
  type: 'breakthrough' | 'integration' | 'shadow_work' | 'pattern_break' | 'depth_reached' | 'vulnerability' | 'truth_telling' | 'resistance_integration';
  description: string;
  elementalState: string;
  significance: 'minor' | 'moderate' | 'major' | 'life_changing';
  userReflection?: string;
  evidenceOfChange: string[];
}

export interface SessionMetrics {
  sessionId: string;
  date: Date;
  duration: number; // minutes
  depthLevel: 1 | 2 | 3 | 4 | 5; // 1=surface, 5=core truth
  vulnerabilityLevel: 1 | 2 | 3 | 4 | 5;
  resistanceOffered: number;
  resistanceIntegrated: boolean;
  breakthroughMoments: number;
  patterns: string[];
  themes: string[];
  transformationQuality: 'maintenance' | 'exploration' | 'growth' | 'breakthrough' | 'integration';
}

export interface ProgressAssessment {
  currentDepthCapacity: number; // 1-5 scale
  transformationVelocity: 'slow' | 'steady' | 'accelerating' | 'breakthrough';
  readinessForDeeper: boolean;
  strengths: string[];
  growthEdges: string[];
  nextDevelopmentPhase: string;
  integrationScore: number; // How well they're embodying insights
}

export interface DepthCategory {
  name: string;
  level: number;
  indicators: string[];
  challenges: string[];
  supportNeeded: string[];
}

export class TransformationTracker {
  private metrics: Map<string, TransformationMetrics> = new Map();
  private currentSession: Map<string, Partial<SessionMetrics>> = new Map();
  
  // Define depth categories for tracking progression
  private depthCategories: DepthCategory[] = [
    {
      name: 'Surface Sharing',
      level: 1,
      indicators: ['daily life updates', 'external events', 'safe topics'],
      challenges: ['opening up', 'trust building'],
      supportNeeded: ['safety establishment', 'rapport building']
    },
    {
      name: 'Personal Challenges',
      level: 2,
      indicators: ['relationship issues', 'work stress', 'life decisions'],
      challenges: ['admitting struggles', 'asking for help'],
      supportNeeded: ['validation', 'practical guidance']
    },
    {
      name: 'Emotional Depths',
      level: 3,
      indicators: ['feeling expression', 'childhood patterns', 'fears and desires'],
      challenges: ['emotional vulnerability', 'shame surfacing'],
      supportNeeded: ['emotional witnessing', 'safety holding']
    },
    {
      name: 'Core Patterns',
      level: 4,
      indicators: ['unconscious behaviors', 'family dynamics', 'limiting beliefs'],
      challenges: ['pattern recognition', 'responsibility taking'],
      supportNeeded: ['pattern interruption', 'new perspective']
    },
    {
      name: 'Soul Truth',
      level: 5,
      indicators: ['life purpose', 'spiritual questioning', 'identity transformation'],
      challenges: ['ego dissolution', 'existential anxiety'],
      supportNeeded: ['spiritual witnessing', 'integration support']
    }
  ];

  initializeUser(userId: string): void {
    this.metrics.set(userId, {
      userId,
      metrics: {
        meaningfulPauses: 0,
        depthReached: [],
        shadowWork: 0,
        patternsInterrupted: 0,
        authenticExpressions: 0,
        resistanceOffered: 0,
        resistanceReceived: 'rejected',
        transformationMilestones: [],
        breakthoughMoments: 0,
        vulnerabilityShared: 0,
        truthTelling: 0,
        comfortSeeking: 0,
        growthChoices: 0,
        integrationActions: 0
      },
      sessionData: [],
      overallProgress: {
        currentDepthCapacity: 1,
        transformationVelocity: 'slow',
        readinessForDeeper: false,
        strengths: [],
        growthEdges: ['Opening to deeper conversation'],
        nextDevelopmentPhase: 'Building trust and safety',
        integrationScore: 0
      }
    });
  }

  startSession(userId: string): string {
    const sessionId = Date.now().toString();
    this.currentSession.set(userId, {
      sessionId,
      date: new Date(),
      duration: 0,
      depthLevel: 1,
      vulnerabilityLevel: 1,
      resistanceOffered: 0,
      resistanceIntegrated: false,
      breakthroughMoments: 0,
      patterns: [],
      themes: [],
      transformationQuality: 'maintenance'
    });
    return sessionId;
  }

  recordInteraction(userId: string, interactionData: {
    type: string;
    content: string;
    context: any;
    depthLevel?: number;
    vulnerabilityLevel?: number;
  }): void {
    const userMetrics = this.metrics.get(userId);
    if (!userMetrics) {
      this.initializeUser(userId);
      return this.recordInteraction(userId, interactionData);
    }

    const session = this.currentSession.get(userId);
    
    // Update session metrics
    if (session) {
      session.depthLevel = Math.max(session.depthLevel || 1, interactionData.depthLevel || 1);
      session.vulnerabilityLevel = Math.max(session.vulnerabilityLevel || 1, interactionData.vulnerabilityLevel || 1);
    }

    // Record specific interaction types
    switch (interactionData.type) {
      case 'meaningful_pause':
        userMetrics.metrics.meaningfulPauses++;
        this.updateSessionQuality(userId, 'exploration');
        break;
        
      case 'depth_reached':
        const depthType = interactionData.context.depthType;
        if (!userMetrics.metrics.depthReached.includes(depthType)) {
          userMetrics.metrics.depthReached.push(depthType);
          this.addMilestone(userId, 'depth_reached', `Reached ${depthType} depth`, 'moderate', [
            'Willingness to go deeper',
            'Trust in the process'
          ]);
        }
        break;
        
      case 'shadow_work':
        userMetrics.metrics.shadowWork++;
        this.updateSessionQuality(userId, 'growth');
        if (userMetrics.metrics.shadowWork % 3 === 0) {
          this.addMilestone(userId, 'shadow_work', 'Significant shadow work engagement', 'major', [
            'Courage to face shadows',
            'Integration of disowned parts'
          ]);
        }
        break;
        
      case 'pattern_interrupted':
        userMetrics.metrics.patternsInterrupted++;
        this.updateSessionQuality(userId, 'breakthrough');
        this.addMilestone(userId, 'pattern_break', 
          `Interrupted ${interactionData.context.patternType} pattern`, 
          'major',
          ['Pattern awareness', 'Choice in response']
        );
        break;
        
      case 'authentic_expression':
        userMetrics.metrics.authenticExpressions++;
        if (session) session.vulnerabilityLevel = Math.max(session.vulnerabilityLevel || 1, 3);
        break;
        
      case 'vulnerability_shared':
        userMetrics.metrics.vulnerabilityShared++;
        this.addMilestone(userId, 'vulnerability', 
          'Shared authentic vulnerability', 
          'moderate',
          ['Emotional courage', 'Trust building']
        );
        break;
        
      case 'truth_telling':
        userMetrics.metrics.truthTelling++;
        this.updateSessionQuality(userId, 'growth');
        if (userMetrics.metrics.truthTelling % 5 === 0) {
          this.addMilestone(userId, 'truth_telling', 
            'Consistent truth-telling practice', 
            'major',
            ['Authenticity embodiment', 'Self-honesty']
          );
        }
        break;
        
      case 'resistance_offered':
        userMetrics.metrics.resistanceOffered++;
        if (session) session.resistanceOffered++;
        break;
        
      case 'resistance_response':
        userMetrics.metrics.resistanceReceived = interactionData.context.response;
        if (interactionData.context.response === 'integrated') {
          if (session) session.resistanceIntegrated = true;
          this.addMilestone(userId, 'resistance_integration', 
            'Integrated sacred resistance', 
            'major',
            ['Growth over comfort', 'Sacred courage']
          );
          this.updateSessionQuality(userId, 'breakthrough');
        }
        break;
        
      case 'breakthrough_moment':
        userMetrics.metrics.breakthoughMoments++;
        if (session) session.breakthroughMoments++;
        this.updateSessionQuality(userId, 'breakthrough');
        this.addMilestone(userId, 'breakthrough', 
          interactionData.context.description || 'Breakthrough moment', 
          'life_changing',
          ['Consciousness expansion', 'Reality shift']
        );
        break;
        
      case 'comfort_seeking':
        userMetrics.metrics.comfortSeeking++;
        // Note: This is tracked but not celebrated - it's data for growth
        break;
        
      case 'growth_choice':
        userMetrics.metrics.growthChoices++;
        this.updateSessionQuality(userId, 'growth');
        break;
        
      case 'integration_action':
        userMetrics.metrics.integrationActions++;
        this.updateSessionQuality(userId, 'integration');
        break;
    }

    // Update overall progress assessment
    this.updateProgressAssessment(userId);
  }

  private updateSessionQuality(userId: string, quality: SessionMetrics['transformationQuality']): void {
    const session = this.currentSession.get(userId);
    if (!session) return;
    
    // Upgrade session quality (higher is better)
    const qualityLevels = ['maintenance', 'exploration', 'growth', 'breakthrough', 'integration'];
    const currentIndex = qualityLevels.indexOf(session.transformationQuality || 'maintenance');
    const newIndex = qualityLevels.indexOf(quality);
    
    if (newIndex > currentIndex) {
      session.transformationQuality = quality;
    }
  }

  private addMilestone(
    userId: string, 
    type: Milestone['type'], 
    description: string,
    significance: Milestone['significance'],
    evidenceOfChange: string[]
  ): void {
    const userMetrics = this.metrics.get(userId);
    if (!userMetrics) return;
    
    const milestone: Milestone = {
      id: Date.now().toString(),
      date: new Date(),
      type,
      description,
      elementalState: 'current', // Would connect to actual elemental state
      significance,
      evidenceOfChange
    };
    
    userMetrics.metrics.transformationMilestones.push(milestone);
  }

  private updateProgressAssessment(userId: string): void {
    const userMetrics = this.metrics.get(userId);
    if (!userMetrics) return;
    
    const m = userMetrics.metrics;
    
    // Calculate current depth capacity
    const depthCapacity = Math.min(5, Math.floor(
      (m.depthReached.length * 2 + 
       m.shadowWork * 0.5 + 
       m.vulnerabilityShared * 0.3 + 
       m.truthTelling * 0.2) / 5
    ) + 1);
    
    // Calculate transformation velocity
    const recentBreakthroughs = m.transformationMilestones
      .filter(milestone => {
        const daysSince = (Date.now() - milestone.date.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30; // Last 30 days
      }).length;
    
    let velocity: ProgressAssessment['transformationVelocity'] = 'slow';
    if (recentBreakthroughs >= 5) velocity = 'breakthrough';
    else if (recentBreakthroughs >= 3) velocity = 'accelerating';
    else if (recentBreakthroughs >= 1) velocity = 'steady';
    
    // Calculate integration score
    const integrationScore = Math.min(100, Math.floor(
      (m.integrationActions * 10 + 
       m.growthChoices * 5 + 
       (m.resistanceReceived === 'integrated' ? 20 : 0)) / 2
    ));
    
    // Determine readiness for deeper work
    const readinessForDeeper = (
      m.meaningfulPauses >= 5 &&
      m.depthReached.length >= 2 &&
      m.resistanceReceived !== 'rejected' &&
      m.vulnerabilityShared >= 3
    );
    
    // Identify strengths and growth edges
    const strengths: string[] = [];
    const growthEdges: string[] = [];
    
    if (m.vulnerabilityShared >= 5) strengths.push('Emotional courage');
    else growthEdges.push('Sharing vulnerability');
    
    if (m.shadowWork >= 3) strengths.push('Shadow work willingness');
    else growthEdges.push('Exploring shadow aspects');
    
    if (m.patternsInterrupted >= 2) strengths.push('Pattern awareness');
    else growthEdges.push('Recognizing patterns');
    
    if (m.resistanceReceived === 'integrated') strengths.push('Growth orientation');
    else growthEdges.push('Choosing growth over comfort');
    
    if (integrationScore >= 50) strengths.push('Integration practice');
    else growthEdges.push('Embodying insights');
    
    // Determine next development phase
    let nextPhase = 'Building foundation';
    if (depthCapacity >= 4) nextPhase = 'Soul truth exploration';
    else if (depthCapacity >= 3) nextPhase = 'Core pattern work';
    else if (depthCapacity >= 2) nextPhase = 'Emotional depth work';
    else if (m.vulnerabilityShared >= 3) nextPhase = 'Personal challenges';
    
    userMetrics.overallProgress = {
      currentDepthCapacity: depthCapacity,
      transformationVelocity: velocity,
      readinessForDeeper,
      strengths,
      growthEdges,
      nextDevelopmentPhase: nextPhase,
      integrationScore
    };
  }

  endSession(userId: string): SessionMetrics | null {
    const session = this.currentSession.get(userId);
    const userMetrics = this.metrics.get(userId);
    
    if (!session || !userMetrics) return null;
    
    // Calculate final session duration (would be tracked in real implementation)
    session.duration = 30; // Default session length
    
    const completedSession: SessionMetrics = {
      sessionId: session.sessionId!,
      date: session.date!,
      duration: session.duration,
      depthLevel: session.depthLevel!,
      vulnerabilityLevel: session.vulnerabilityLevel!,
      resistanceOffered: session.resistanceOffered!,
      resistanceIntegrated: session.resistanceIntegrated!,
      breakthroughMoments: session.breakthroughMoments!,
      patterns: session.patterns!,
      themes: session.themes!,
      transformationQuality: session.transformationQuality!
    };
    
    userMetrics.sessionData.push(completedSession);
    this.currentSession.delete(userId);
    
    return completedSession;
  }

  getTransformationReport(userId: string): {
    summary: string;
    metrics: TransformationMetrics['metrics'];
    progress: ProgressAssessment;
    recommendations: string[];
    milestones: Milestone[];
    recentSessions: SessionMetrics[];
  } {
    const userMetrics = this.metrics.get(userId);
    if (!userMetrics) {
      return {
        summary: 'No transformation data available yet. Your journey begins now.',
        metrics: null as any,
        progress: null as any,
        recommendations: ['Begin your sacred journey of growth'],
        milestones: [],
        recentSessions: []
      };
    }

    const m = userMetrics.metrics;
    const progress = userMetrics.overallProgress;
    
    const summary = `Your transformation journey shows profound growth:
    
    🌟 ${m.meaningfulPauses} moments of deep reflection
    🔍 ${m.depthReached.length} layers of depth explored
    🌑 ${m.shadowWork} shadow work engagements
    ⚡ ${m.patternsInterrupted} old patterns interrupted
    💎 ${m.authenticExpressions} authentic expressions
    🚀 ${m.transformationMilestones.length} major breakthroughs
    
    Current depth capacity: Level ${progress.currentDepthCapacity}/5
    Transformation velocity: ${progress.transformationVelocity}
    Integration score: ${progress.integrationScore}%`;

    const recommendations = this.generateRecommendations(m, progress);
    const recentSessions = userMetrics.sessionData.slice(-5); // Last 5 sessions

    return { 
      summary, 
      metrics: m, 
      progress,
      recommendations, 
      milestones: m.transformationMilestones,
      recentSessions
    };
  }

  private generateRecommendations(
    metrics: TransformationMetrics['metrics'], 
    progress: ProgressAssessment
  ): string[] {
    const recommendations: string[] = [];

    // Based on growth edges
    progress.growthEdges.forEach(edge => {
      switch (edge) {
        case 'Sharing vulnerability':
          recommendations.push('Practice sharing one vulnerable truth each session');
          break;
        case 'Exploring shadow aspects':
          recommendations.push('Notice what you judge in others - it might be your shadow');
          break;
        case 'Recognizing patterns':
          recommendations.push('Ask: "How is this familiar?" when challenges arise');
          break;
        case 'Choosing growth over comfort':
          recommendations.push('When resistance arises, get curious about what growth wants');
          break;
        case 'Embodying insights':
          recommendations.push('Take one small action daily to embody your insights');
          break;
      }
    });

    // Based on transformation velocity
    if (progress.transformationVelocity === 'slow') {
      recommendations.push('Consider increasing session frequency for momentum');
    } else if (progress.transformationVelocity === 'breakthrough') {
      recommendations.push('Focus on integration - let your breakthroughs land');
    }

    // Based on depth capacity
    if (progress.currentDepthCapacity >= 4) {
      recommendations.push('You\'re ready for soul-level work and spiritual questioning');
    } else if (progress.currentDepthCapacity >= 3) {
      recommendations.push('Explore your core life patterns and family dynamics');
    }

    // Based on specific metrics
    if (metrics.comfortSeeking > metrics.growthChoices) {
      recommendations.push('Notice when you seek comfort vs growth - choose courage');
    }

    if (metrics.integrationActions < 5) {
      recommendations.push('Focus on taking real-world action with your insights');
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  // Method to check if user is ready for deeper work
  isReadyForDeeper(userId: string): boolean {
    const userMetrics = this.metrics.get(userId);
    if (!userMetrics) return false;
    
    return userMetrics.overallProgress.readinessForDeeper;
  }

  // Get current session progress
  getCurrentSessionProgress(userId: string): Partial<SessionMetrics> | null {
    return this.currentSession.get(userId) || null;
  }

  // Get specific milestone by type
  getMilestonesByType(userId: string, type: Milestone['type']): Milestone[] {
    const userMetrics = this.metrics.get(userId);
    if (!userMetrics) return [];
    
    return userMetrics.metrics.transformationMilestones.filter(m => m.type === type);
  }

  // Export user data for analysis
  exportUserData(userId: string): TransformationMetrics | null {
    return this.metrics.get(userId) || null;
  }

  // Calculate growth trajectory
  getGrowthTrajectory(userId: string): {
    trend: 'ascending' | 'stable' | 'plateau' | 'descending';
    momentum: number;
    prediction: string;
  } {
    const userMetrics = this.metrics.get(userId);
    if (!userMetrics) {
      return {
        trend: 'stable',
        momentum: 0,
        prediction: 'Beginning of journey'
      };
    }

    const recentMilestones = userMetrics.metrics.transformationMilestones
      .filter(m => {
        const daysSince = (Date.now() - m.date.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      });

    const momentum = recentMilestones.length;
    
    let trend: 'ascending' | 'stable' | 'plateau' | 'descending' = 'stable';
    if (momentum >= 4) trend = 'ascending';
    else if (momentum >= 2) trend = 'stable';
    else if (momentum === 1) trend = 'plateau';
    else trend = 'descending';

    const predictions = {
      ascending: 'Accelerating transformation - breakthrough phase',
      stable: 'Steady growth with consistent progress',
      plateau: 'Ready for next level invitation',
      descending: 'May need renewed motivation or support'
    };

    return {
      trend,
      momentum,
      prediction: predictions[trend]
    };
  }
}

export default TransformationTracker;