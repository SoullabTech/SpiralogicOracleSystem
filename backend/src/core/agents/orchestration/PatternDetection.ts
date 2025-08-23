// 🔍 PATTERN DETECTION MODULE
// User pattern analysis and elemental need detection

import { logger } from "../../../utils/logger";
import { getUserProfile } from "../../../services/profileService";
import { getRelevantMemories } from "../../../services/memoryService";
import { QueryInput, UserPattern } from "./OracleTypes";

export class PatternDetection {
  
  async analyzeUserPattern(query: QueryInput): Promise<UserPattern> {
    try {
      const memories = await getRelevantMemories(query.userId, query.input, 20);
      const profile = await getUserProfile(query.userId);

      return {
        repetitivePatterns: this.extractRepetitivePatterns(memories),
        approvalSeeking: this.calculateApprovalSeeking(memories),
        comfortZonePatterns: this.identifyComfortZonePatterns(memories),
        shadowAvoidance: this.identifyShadowAvoidance(memories, profile),
        currentPhase: this.detectCurrentSpiralogicPhase(query, memories),
        projectionLevel: this.assessUserProjectionLevel(query, memories),
        dependencyRisk: this.assessDependencyRisk(query, memories),
        shadowWorkNeeded: this.detectShadowWorkNeed(query, memories)
      };
    } catch (error) {
      logger.error('Pattern analysis error:', error);
      return this.getDefaultPattern();
    }
  }

  async detectElementalNeed(query: QueryInput, userPattern: UserPattern): Promise<string> {
    const input = query.input.toLowerCase();
    const context = query.context || {};

    // Explicit element request
    if (query.preferredElement) {
      return query.preferredElement;
    }

    // Shadow work detection
    if (userPattern.shadowWorkNeeded || query.requestShadowWork) {
      return "shadow";
    }

    // Fire indicators - action, energy, transformation
    if (this.detectFireNeed(input)) {
      return "fire";
    }

    // Water indicators - emotions, relationships, flow
    if (this.detectWaterNeed(input)) {
      return "water";
    }

    // Earth indicators - practical, grounding, stability
    if (this.detectEarthNeed(input)) {
      return "earth";
    }

    // Air indicators - thoughts, communication, clarity
    if (this.detectAirNeed(input)) {
      return "air";
    }

    // Default to aether for spiritual/abstract queries
    return "aether";
  }

  private detectFireNeed(input: string): boolean {
    const fireKeywords = [
      'action', 'energy', 'motivation', 'passion', 'drive', 'courage',
      'transform', 'change', 'breakthrough', 'power', 'strength',
      'anger', 'frustration', 'stuck', 'momentum', 'push'
    ];
    return fireKeywords.some(keyword => input.includes(keyword));
  }

  private detectWaterNeed(input: string): boolean {
    const waterKeywords = [
      'emotion', 'feeling', 'heart', 'love', 'relationship', 'connection',
      'flow', 'intuition', 'feminine', 'receive', 'allow', 'trust',
      'healing', 'grief', 'sadness', 'joy', 'compassion'
    ];
    return waterKeywords.some(keyword => input.includes(keyword));
  }

  private detectEarthNeed(input: string): boolean {
    const earthKeywords = [
      'practical', 'ground', 'stability', 'structure', 'foundation',
      'money', 'work', 'career', 'health', 'body', 'physical',
      'routine', 'discipline', 'organization', 'security'
    ];
    return earthKeywords.some(keyword => input.includes(keyword));
  }

  private detectAirNeed(input: string): boolean {
    const airKeywords = [
      'think', 'thought', 'mind', 'clarity', 'understanding', 'communication',
      'speak', 'express', 'idea', 'concept', 'analyze', 'perspective',
      'breath', 'space', 'freedom', 'detachment'
    ];
    return airKeywords.some(keyword => input.includes(keyword));
  }

  private extractRepetitivePatterns(memories: any[]): string[] {
    const patterns: string[] = [];
    const contentWords = memories.flatMap(m => 
      m.content?.toLowerCase().split(/\s+/).filter(w => w.length > 4) || []
    );
    
    const wordCounts = contentWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(wordCounts)
      .filter(([_, count]) => count >= 3)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .forEach(([word, count]) => {
        patterns.push(`Recurring theme: "${word}" (${count} times)`);
      });

    return patterns;
  }

  private calculateApprovalSeeking(memories: any[]): number {
    if (!memories.length) return 0;

    const approvalPhrases = [
      'what should i', 'tell me what', 'is this right', 'am i doing',
      'should i be', 'is it okay', 'do you think', 'validate',
      'reassurance', 'approval', 'permission'
    ];

    const approvalCount = memories.reduce((count, memory) => {
      const content = memory.content?.toLowerCase() || '';
      return count + approvalPhrases.filter(phrase => content.includes(phrase)).length;
    }, 0);

    return Math.min(approvalCount / memories.length, 1);
  }

  private identifyComfortZonePatterns(memories: any[]): string[] {
    const comfortPatterns = [
      'afraid of', 'scared to', 'worried about', 'anxious',
      'safe zone', 'comfortable', 'familiar', 'routine',
      'avoid', 'procrastinate', 'hesitate'
    ];

    const patterns: string[] = [];
    memories.forEach(memory => {
      const content = memory.content?.toLowerCase() || '';
      comfortPatterns.forEach(pattern => {
        if (content.includes(pattern)) {
          patterns.push(`Comfort zone: ${pattern}`);
        }
      });
    });

    return [...new Set(patterns)].slice(0, 3);
  }

  private identifyShadowAvoidance(memories: any[], archetype: any): string[] {
    const shadowIndicators = [
      'not my fault', 'they made me', 'always happens to me',
      'victim', 'unfair', 'deserve better', 'everyone else',
      'should have', 'if only', 'blame'
    ];

    const avoidancePatterns: string[] = [];
    memories.forEach(memory => {
      const content = memory.content?.toLowerCase() || '';
      shadowIndicators.forEach(indicator => {
        if (content.includes(indicator)) {
          avoidancePatterns.push(`Shadow avoidance: ${indicator}`);
        }
      });
    });

    return [...new Set(avoidancePatterns)].slice(0, 3);
  }

  private detectCurrentSpiralogicPhase(query: QueryInput, memories: any[]): string {
    const input = query.input.toLowerCase();
    
    // Phase indicators
    if (input.includes('beginning') || input.includes('start')) return 'initiation';
    if (input.includes('learning') || input.includes('understand')) return 'learning';
    if (input.includes('thinking') || input.includes('reflect')) return 'reflection';
    if (input.includes('doing') || input.includes('action')) return 'action';
    if (input.includes('together') || input.includes('integrate')) return 'integration';
    if (input.includes('mastery') || input.includes('expert')) return 'mastery';
    if (input.includes('help') || input.includes('serve')) return 'service';
    if (input.includes('beyond') || input.includes('transcend')) return 'transcendence';
    if (input.includes('ending') || input.includes('death')) return 'death_rebirth';

    return 'reflection'; // Default phase
  }

  private assessUserProjectionLevel(query: QueryInput, memories: any[]): number {
    const projectionIndicators = [
      'you are', 'you should', 'you must', 'you always',
      'tell me', 'give me', 'show me', 'fix me'
    ];

    const input = query.input.toLowerCase();
    const projectionCount = projectionIndicators.filter(indicator => 
      input.includes(indicator)
    ).length;

    return Math.min(projectionCount / 4, 1); // 0-1 scale
  }

  private assessDependencyRisk(query: QueryInput, memories: any[]): boolean {
    const dependencyPhrases = [
      'can you solve', 'fix my life', 'tell me exactly',
      'make me feel', 'give me all', 'do this for me'
    ];

    const input = query.input.toLowerCase();
    return dependencyPhrases.some(phrase => input.includes(phrase));
  }

  private detectShadowWorkNeed(query: QueryInput, memories: any[]): boolean {
    const shadowIndicators = [
      'everyone else', 'not my fault', 'always happens',
      'victim', 'unfair', 'angry at', 'hate when',
      'projection', 'shadow', 'dark side'
    ];

    const input = query.input.toLowerCase();
    return shadowIndicators.some(indicator => input.includes(indicator));
  }

  async buildLifePatternContext(userId: string): Promise<any> {
    try {
      const memories = await getRelevantMemories(userId, "", 50);
      const profile = await getUserProfile(userId);
      
      return {
        totalMemories: memories.length,
        patterns: this.extractRepetitivePatterns(memories),
        phases: this.identifyLifePhases(memories),
        growth: this.assessGrowthTrajectory(memories),
        challenges: this.identifyRecurrentChallenges(memories),
        strengths: this.identifyEmergentStrengths(memories),
        profile
      };
    } catch (error) {
      logger.error('Life pattern context error:', error);
      return { error: 'Unable to build life pattern context' };
    }
  }

  private identifyLifePhases(memories: any[]): string[] {
    // Analyze temporal patterns in memories
    return ['Current phase: Integration', 'Emerging: Service'];
  }

  private assessGrowthTrajectory(memories: any[]): any {
    return {
      direction: 'upward',
      velocity: 'steady',
      areas: ['self-awareness', 'relationship skills']
    };
  }

  private identifyRecurrentChallenges(memories: any[]): string[] {
    return ['Perfectionism', 'Overthinking'];
  }

  private identifyEmergentStrengths(memories: any[]): string[] {
    return ['Discernment', 'Compassion'];
  }

  private getDefaultPattern(): UserPattern {
    return {
      repetitivePatterns: [],
      approvalSeeking: 0,
      comfortZonePatterns: [],
      shadowAvoidance: [],
      currentPhase: 'reflection',
      projectionLevel: 0,
      dependencyRisk: false,
      shadowWorkNeeded: false
    };
  }
}