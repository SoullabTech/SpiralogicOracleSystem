// 🔍 Pattern Recognition Engine
// Identifies and tracks patterns across user interactions for collective intelligence

import { logger } from "../../../utils/logger";
import { supabase } from "../../../services/supabaseClient";
import { agentComms } from "./agentCommunicationProtocol";

export interface ElementalPattern {
  pattern_id?: string;
  elements_involved: string[];
  context_domain: string;
  cultural_context: string;
  age_demographic: string;
  success_metrics: {
    confidence: number;
    user_satisfaction: string;
    follow_up_success: string;
  };
  integration_wisdom: string;
  discovered_by_user: string;
  verified_by_others: number;
  pattern_strength: number;
  created_at?: string;
}

export interface PatternCandidate {
  elements: string[];
  occurrences: number;
  contexts: Set<string>;
  users: Set<string>;
  averageConfidence: number;
  wisdomExtracted: string[];
}

export interface PatternRecognitionContext {
  userId: string;
  query: string;
  response: string;
  element: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export class PatternRecognitionEngine {
  private static instance: PatternRecognitionEngine;
  private patternCandidates: Map<string, PatternCandidate> = new Map();
  private minOccurrencesForPattern = 3;
  private minUsersForPattern = 2;
  private minConfidenceForPattern = 0.7;
  private patternCache: Map<string, ElementalPattern[]> = new Map();
  private cacheExpiry = 60 * 60 * 1000; // 1 hour

  private constructor() {
    // Initialize pattern recognition system
    this.initializePatternDetection();
  }

  static getInstance(): PatternRecognitionEngine {
    if (!PatternRecognitionEngine.instance) {
      PatternRecognitionEngine.instance = new PatternRecognitionEngine();
    }
    return PatternRecognitionEngine.instance;
  }

  private async initializePatternDetection() {
    // Load existing patterns from database
    await this.loadExistingPatterns();

    // Set up periodic pattern analysis
    setInterval(() => this.analyzePatternCandidates(), 5 * 60 * 1000); // Every 5 minutes
  }

  // Process a new interaction for pattern detection
  async processInteraction(context: PatternRecognitionContext): Promise<void> {
    try {
      // Extract elements from the interaction
      const elements = this.extractElements(context);
      if (elements.length < 2) return; // Patterns require multiple elements

      // Create pattern key
      const patternKey = this.createPatternKey(elements);

      // Update pattern candidate
      this.updatePatternCandidate(patternKey, elements, context);

      // Check if this candidate is ready to become a pattern
      await this.checkPatternEmergence(patternKey);

      // Store observation for later analysis
      await this.storeObservation(context);
    } catch (error) {
      logger.error("Error processing interaction for patterns:", error);
    }
  }

  // Extract elements involved in an interaction
  private extractElements(context: PatternRecognitionContext): string[] {
    const elements: string[] = [];

    // Primary element from context
    if (context.element) {
      elements.push(context.element);
    }

    // Extract elements from response content
    const elementKeywords = {
      fire: ["ignite", "spark", "vision", "passion", "catalyze", "transform"],
      water: ["flow", "emotion", "depth", "healing", "intuition", "feel"],
      earth: [
        "ground",
        "foundation",
        "stable",
        "manifest",
        "practical",
        "material",
      ],
      air: [
        "clarity",
        "thought",
        "perspective",
        "insight",
        "communicate",
        "understand",
      ],
      aether: [
        "unity",
        "integrate",
        "wholeness",
        "spirit",
        "transcend",
        "weave",
      ],
      shadow: [
        "darkness",
        "unconscious",
        "pattern",
        "hidden",
        "integrate",
        "face",
      ],
    };

    const content = (context.response + " " + context.query).toLowerCase();

    for (const [element, keywords] of Object.entries(elementKeywords)) {
      const keywordCount = keywords.filter((keyword) =>
        content.includes(keyword),
      ).length;
      if (keywordCount >= 2 && !elements.includes(element)) {
        elements.push(element);
      }
    }

    return elements;
  }

  // Create a unique key for a pattern
  private createPatternKey(elements: string[]): string {
    return elements.sort().join(&quot;-&quot;);
  }

  // Update pattern candidate with new occurrence
  private updatePatternCandidate(
    key: string,
    elements: string[],
    context: PatternRecognitionContext,
  ): void {
    let candidate = this.patternCandidates.get(key);

    if (!candidate) {
      candidate = {
        elements,
        occurrences: 0,
        contexts: new Set(),
        users: new Set(),
        averageConfidence: 0,
        wisdomExtracted: [],
      };
    }

    candidate.occurrences++;
    candidate.users.add(context.userId);

    // Extract context domain
    const domain = this.extractDomain(context);
    if (domain) candidate.contexts.add(domain);

    // Update average confidence
    candidate.averageConfidence =
      (candidate.averageConfidence * (candidate.occurrences - 1) +
        context.confidence) /
      candidate.occurrences;

    // Extract wisdom from this interaction
    const wisdom = this.extractWisdom(context);
    if (wisdom) candidate.wisdomExtracted.push(wisdom);

    this.patternCandidates.set(key, candidate);
  }

  // Check if a candidate has emerged as a pattern
  private async checkPatternEmergence(key: string): Promise<void> {
    const candidate = this.patternCandidates.get(key);
    if (!candidate) return;

    // Check emergence criteria
    if (
      candidate.occurrences >= this.minOccurrencesForPattern &&
      candidate.users.size >= this.minUsersForPattern &&
      candidate.averageConfidence >= this.minConfidenceForPattern
    ) {
      // Create new pattern
      const pattern = await this.createPattern(key, candidate);

      // Share with agents
      await agentComms.sharePatternDiscovery({
        discoveredBy: &quot;PatternRecognitionEngine&quot;,
        pattern_id: pattern.pattern_id!,
        elements: pattern.elements_involved,
        wisdom: pattern.integration_wisdom,
        strength: pattern.pattern_strength,
      });

      // Remove from candidates
      this.patternCandidates.delete(key);
    }
  }

  // Create a new pattern from a candidate
  private async createPattern(
    key: string,
    candidate: PatternCandidate,
  ): Promise<ElementalPattern> {
    const pattern: ElementalPattern = {
      elements_involved: candidate.elements,
      context_domain: this.determinePrimaryDomain(candidate.contexts),
      cultural_context: await this.determineCulturalContext(candidate),
      age_demographic: &quot;mixed&quot;, // Would be calculated from user demographics
      success_metrics: {
        confidence: candidate.averageConfidence,
        user_satisfaction: "pending",
        follow_up_success: "pending",
      },
      integration_wisdom: this.synthesizeWisdom(candidate.wisdomExtracted),
      discovered_by_user: "collective", // System discovered
      verified_by_others: candidate.users.size,
      pattern_strength: this.calculatePatternStrength(candidate),
      created_at: new Date().toISOString(),
    };

    // Store in database
    const { data, error } = await supabase
      .from("elemental_patterns")
      .insert(pattern)
      .select()
      .single();

    if (error) {
      logger.error("Error storing pattern:", error);
      throw error;
    }

    logger.info("New pattern discovered", {
      pattern_id: data.pattern_id,
      elements: pattern.elements_involved,
      strength: pattern.pattern_strength,
    });

    return data;
  }

  // Find patterns relevant to a query
  async findRelevantPatterns(context: {
    elements?: string[];
    domain?: string;
    culture?: string;
    minStrength?: number;
  }): Promise<ElementalPattern[]> {
    try {
      // Check cache first
      const cacheKey = JSON.stringify(context);
      const cached = this.patternCache.get(cacheKey);
      if (
        cached &&
        Date.now() -
          (cached[0]?.created_at
            ? new Date(cached[0].created_at).getTime()
            : 0) <
          this.cacheExpiry
      ) {
        return cached;
      }

      let query = supabase.from("elemental_patterns").select("*");

      // Filter by elements
      if (context.elements && context.elements.length > 0) {
        query = query.contains(&quot;elements_involved&quot;, context.elements);
      }

      // Filter by domain
      if (context.domain) {
        query = query.eq("context_domain", context.domain);
      }

      // Filter by culture
      if (context.culture) {
        query = query.eq("cultural_context", context.culture);
      }

      // Filter by strength
      if (context.minStrength) {
        query = query.gte("pattern_strength", context.minStrength);
      }

      const { data, error } = await query
        .order("pattern_strength", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Cache results
      if (data) {
        this.patternCache.set(cacheKey, data);
      }

      return data || [];
    } catch (error) {
      logger.error("Error finding relevant patterns:", error);
      return [];
    }
  }

  // Verify and strengthen existing patterns
  async verifyPattern(
    patternId: string,
    userId: string,
    success: boolean,
  ): Promise<void> {
    try {
      // Get current pattern
      const { data: pattern, error: fetchError } = await supabase
        .from(&quot;elemental_patterns&quot;)
        .select("*")
        .eq("pattern_id", patternId)
        .single();

      if (fetchError) throw fetchError;

      // Update verification count and strength
      const newVerificationCount = pattern.verified_by_others + 1;
      const strengthAdjustment = success ? 0.01 : -0.005;
      const newStrength = Math.max(
        0,
        Math.min(1, pattern.pattern_strength + strengthAdjustment),
      );

      const { error: updateError } = await supabase
        .from("elemental_patterns")
        .update({
          verified_by_others: newVerificationCount,
          pattern_strength: newStrength,
        })
        .eq("pattern_id", patternId);

      if (updateError) throw updateError;

      // Log contribution
      await this.logPatternContribution(
        patternId,
        userId,
        success ? "validation" : "invalidation",
      );
    } catch (error) {
      logger.error("Error verifying pattern:", error);
    }
  }

  // Store observation for pattern analysis
  private async storeObservation(
    context: PatternRecognitionContext,
  ): Promise<void> {
    try {
      await supabase.from(&quot;collective_observations&quot;).insert({
        user_id: context.userId,
        query_text: context.query,
        query_type: this.categorizeQuery(context.query),
        preferred_element: context.element,
        metadata: {
          confidence: context.confidence,
          ...context.metadata,
        },
      });
    } catch (error) {
      logger.error("Error storing observation:", error);
    }
  }

  // Analyze pattern candidates periodically
  private async analyzePatternCandidates(): Promise<void> {
    logger.info(&quot;Analyzing pattern candidates&quot;, {
      candidateCount: this.patternCandidates.size,
    });

    for (const [key, candidate] of this.patternCandidates.entries()) {
      await this.checkPatternEmergence(key);
    }
  }

  // Load existing patterns from database
  private async loadExistingPatterns(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from(&quot;elemental_patterns&quot;)
        .select("*")
        .order("pattern_strength", { ascending: false })
        .limit(100);

      if (error) throw error;

      logger.info("Loaded existing patterns", {
        count: data?.length || 0,
      });
    } catch (error) {
      logger.error("Error loading existing patterns:", error);
    }
  }

  // Helper methods
  private extractDomain(context: PatternRecognitionContext): string {
    const query = context.query.toLowerCase();

    if (query.includes("relationship") || query.includes("love"))
      return "relationships";
    if (query.includes("work") || query.includes("career")) return "career";
    if (query.includes("purpose") || query.includes("meaning"))
      return "purpose";
    if (query.includes("heal") || query.includes("trauma")) return "healing";
    if (query.includes("spiritual") || query.includes("soul"))
      return "spirituality";
    if (query.includes("creative") || query.includes("art"))
      return "creativity";
    if (query.includes("money") || query.includes("abundance"))
      return "abundance";

    return "general";
  }

  private extractWisdom(context: PatternRecognitionContext): string {
    // Extract key insights from high-confidence interactions
    if (context.confidence < 0.8) return "";

    // This would use more sophisticated NLP in production
    const response = context.response;
    const wisdomPhrases = [
      /when (.+?) meets (.+?), (.+)/i,
      /the key is (.+)/i,
      /remember that (.+)/i,
      /(.+) creates (.+)/i,
    ];

    for (const phrase of wisdomPhrases) {
      const match = response.match(phrase);
      if (match) return match[0];
    }

    return "";
  }

  private determinePrimaryDomain(contexts: Set<string>): string {
    if (contexts.size === 0) return &quot;general&quot;;

    // Return most common context
    const contextArray = Array.from(contexts);
    const counts = contextArray.reduce(
      (acc, ctx) => {
        acc[ctx] = (acc[ctx] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  private async determineCulturalContext(
    candidate: PatternCandidate,
  ): Promise<string> {
    // This would analyze user profiles and content for cultural markers
    // Simplified for now
    return &quot;universal";
  }

  private synthesizeWisdom(wisdomPieces: string[]): string {
    if (wisdomPieces.length === 0)
      return "Pattern emerging from collective experience";

    // Take most common themes
    const uniqueWisdom = [...new Set(wisdomPieces)];
    if (uniqueWisdom.length === 1) return uniqueWisdom[0];

    // Combine multiple insights
    return `Integration insight: ${uniqueWisdom.slice(0, 3).join("; ")}`;
  }

  private calculatePatternStrength(candidate: PatternCandidate): number {
    // Factors: occurrences, unique users, confidence, context diversity
    const occurrenceScore = Math.min(candidate.occurrences / 10, 1) * 0.25;
    const userScore = Math.min(candidate.users.size / 5, 1) * 0.25;
    const confidenceScore = candidate.averageConfidence * 0.3;
    const diversityScore = Math.min(candidate.contexts.size / 3, 1) * 0.2;

    return occurrenceScore + userScore + confidenceScore + diversityScore;
  }

  private categorizeQuery(query: string): string {
    const categories = {
      question: /^(what|who|where|when|why|how|is|are|can|will|should)/i,
      request: /(help|guide|show|teach|explain)/i,
      reflection: /(feel|think|wonder|realize|understand)/i,
      intention: /(want|need|wish|hope|plan)/i,
      problem: /(stuck|confused|lost|struggling|difficult)/i,
    };

    for (const [category, pattern] of Object.entries(categories)) {
      if (pattern.test(query)) return category;
    }

    return "general";
  }

  private async logPatternContribution(
    patternId: string,
    userId: string,
    type: string,
  ): Promise<void> {
    try {
      await supabase.from(&quot;pattern_contributions&quot;).insert({
        user_id: userId,
        pattern_id: patternId,
        contribution_type: type,
        impact_score: type === "validation" ? 0.1 : 0.05,
      });
    } catch (error) {
      logger.error("Error logging pattern contribution:", error);
    }
  }

  // Get pattern statistics
  async getPatternStatistics(): Promise<{
    totalPatterns: number;
    averageStrength: number;
    topDomains: string[];
    emergingPatterns: number;
  }> {
    try {
      const { data: patterns, error } = await supabase
        .from(&quot;elemental_patterns&quot;)
        .select("pattern_strength, context_domain");

      if (error) throw error;

      const stats = {
        totalPatterns: patterns?.length || 0,
        averageStrength:
          patterns?.reduce((sum, p) => sum + p.pattern_strength, 0) /
            (patterns?.length || 1) || 0,
        topDomains: this.getTopDomains(patterns || []),
        emergingPatterns: this.patternCandidates.size,
      };

      return stats;
    } catch (error) {
      logger.error("Error getting pattern statistics:", error);
      return {
        totalPatterns: 0,
        averageStrength: 0,
        topDomains: [],
        emergingPatterns: 0,
      };
    }
  }

  private getTopDomains(patterns: any[]): string[] {
    const domainCounts = patterns.reduce(
      (acc, p) => {
        acc[p.context_domain] = (acc[p.context_domain] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain]) => domain);
  }
}

// Export singleton instance
export const patternEngine = PatternRecognitionEngine.getInstance();
