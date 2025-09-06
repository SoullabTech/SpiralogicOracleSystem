import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { apiClient, API_ENDPOINTS } from "../frontend/lib/config";
import { getSupabaseConfig } from "../lib/config/supabase";

interface BypassingPreventionConfig {
  enableRealTimeDetection: boolean;
  enableContentGating: boolean;
  enablePacingAlgorithms: boolean;
  enableReflectionGaps: boolean;
  enableCommunityAlerts: boolean;
}

export class BypassingPreventionMiddleware {
  private config: BypassingPreventionConfig;

  constructor(config: BypassingPreventionConfig) {
    this.config = config;
  }

  async processRequest(request: NextRequest): Promise<NextResponse> {
    try {
      const supabaseConfig = getSupabaseConfig();

      // Skip bypassing prevention if Supabase is not configured (demo mode)
      if (!supabaseConfig.isConfigured) {
        return NextResponse.next();
      }

      // For now, return a simplified version that doesn&apos;t rely on backend services
      // TODO: Implement full bypassing prevention via backend API calls
      return NextResponse.next();
    } catch (error) {
      console.error("Bypassing prevention middleware error:", error);
      return NextResponse.next(); // Fail open to prevent blocking
    }
  }

  private async analyzeRequest(
    request: NextRequest,
    userId: string,
  ): Promise<{
    bypassingDetected: boolean;
    patterns: string[];
    severity: string;
    interventions: string[];
  }> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Get request frequency data
    const requestFrequency = await this.getRecentRequestFrequency(userId);

    // Analyze URL patterns for bypassing behavior
    const urlPatterns = this.analyzeUrlPatterns(path, requestFrequency);

    // Check for rapid content consumption
    const contentConsumption = this.analyzeContentConsumption(requestFrequency);

    // Check for integration avoidance
    const integrationAvoidance = await this.checkIntegrationAvoidance(userId);

    const patterns: string[] = [];
    const interventions: string[] = [];
    let severity = "awareness";

    if (urlPatterns.insightSeeking > 5) {
      patterns.push("insight_addiction");
      interventions.push("Mandatory reflection period required");
      severity = "concern";
    }

    if (contentConsumption.rapidAccess) {
      patterns.push("consumption_behavior");
      interventions.push("Pacing algorithm applied");
      severity = "intervention";
    }

    if (integrationAvoidance.detected) {
      patterns.push("integration_avoidance");
      interventions.push("Integration requirements enforced");
      severity = "intervention";
    }

    return {
      bypassingDetected: patterns.length > 0,
      patterns,
      severity,
      interventions,
    };
  }

  private async getRecentRequestFrequency(userId: string): Promise<{
    totalRequests: number;
    contentRequests: number;
    insightRequests: number;
    integrationSubmissions: number;
    timespan: number; // hours
  }> {
    // In real implementation, this would query request logs
    // For now, return mock data structure
    return {
      totalRequests: 10,
      contentRequests: 5,
      insightRequests: 3,
      integrationSubmissions: 1,
      timespan: 24,
    };
  }

  private analyzeUrlPatterns(
    path: string,
    frequency: any,
  ): {
    insightSeeking: number;
    integrationAvoidance: number;
    communityAvoidance: number;
  } {
    const insightPaths = [&quot;/oracle&quot;, "/insights", "/content", "/elemental"];
    const integrationPaths = [
      "/integration",
      "/embodied-wisdom",
      "/spiral-progress",
    ];
    const communityPaths = ["/community", "/reality-check", "/support"];

    const insightSeeking = insightPaths.some((p) => path.includes(p))
      ? frequency.insightRequests
      : 0;
    const integrationAvoidance = integrationPaths.some((p) => path.includes(p))
      ? 0
      : frequency.contentRequests;
    const communityAvoidance = communityPaths.some((p) => path.includes(p))
      ? 0
      : frequency.totalRequests;

    return {
      insightSeeking,
      integrationAvoidance,
      communityAvoidance,
    };
  }

  private analyzeContentConsumption(frequency: any): {
    rapidAccess: boolean;
    consumptionRate: number;
    integrationRatio: number;
  } {
    const consumptionRate = frequency.contentRequests / frequency.timespan;
    const integrationRatio =
      frequency.integrationSubmissions / Math.max(frequency.contentRequests, 1);

    return {
      rapidAccess: consumptionRate > 0.3, // More than one content request every 3 hours
      consumptionRate,
      integrationRatio,
    };
  }

  private async checkIntegrationAvoidance(userId: string): Promise<{
    detected: boolean;
    daysSinceLastIntegration: number;
    pendingRequirements: number;
  }> {
    // Query for recent integration submissions
    // For now, return mock implementation
    return {
      detected: false,
      daysSinceLastIntegration: 2,
      pendingRequirements: 0,
    };
  }

  private isContentRequest(request: NextRequest): boolean {
    const url = new URL(request.url);
    const contentPaths = [
      &quot;/api/oracle&quot;,
      "/api/content",
      "/api/insights",
      "/api/elemental",
    ];
    return contentPaths.some((path) => url.pathname.startsWith(path));
  }

  private async checkContentGates(
    request: NextRequest,
    userId: string,
  ): Promise<{
    allowed: boolean;
    reason?: string;
    gateId?: string;
    requirements?: any[];
  }> {
    const url = new URL(request.url);
    const contentType = this.extractContentType(url);

    // Check if user has active integration gates for this content
    // In real implementation, query from database
    return {
      allowed: true, // For now, allow all content
    };
  }

  private extractContentType(url: URL): string {
    if (url.pathname.includes(&quot;/oracle&quot;)) return "oracle_insight";
    if (url.pathname.includes("/elemental")) return "elemental_practice";
    if (url.pathname.includes("/insights")) return "insight_content";
    return "general_content";
  }

  private async checkPacing(
    request: NextRequest,
    userId: string,
  ): Promise<{
    allowed: boolean;
    waitTimeMinutes?: number;
    reason?: string;
    alternatives?: string[];
  }> {
    const userBehavior = await this.getUserBehaviorData(userId);

    // Apply anti-commodification pacing algorithms via backend API
    let pacingResult;
    try {
      pacingResult = await apiClient.post(
        API_ENDPOINTS.integration.commodificationCheck,
        {
          userId,
          userBehavior: userBehavior.architecture,
          requestType: &quot;content_request&quot;,
        },
      );
    } catch (error) {
      console.error("Failed to check pacing via backend:", error);
      // Return allowing request if backend is unavailable
      pacingResult = { allowed: true };
    }

    return {
      allowed: pacingResult.allowed,
      waitTimeMinutes: pacingResult.waitTime
        ? Math.round(pacingResult.waitTime / 60)
        : undefined,
      reason: pacingResult.message,
      alternatives: pacingResult.alternativeActivities,
    };
  }

  private async getUserBehaviorData(userId: string): Promise<{
    architecture: any;
    recentActivity: any;
  }> {
    // In real implementation, load from database
    return {
      architecture: {
        lastIntegrationCheck: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        bypassingHistory: [],
      },
      recentActivity: {},
    };
  }

  private handleBypassingDetection(
    analysis: any,
    userId: string,
  ): NextResponse {
    const response = NextResponse.json(
      {
        error: &quot;Integration Support Needed&quot;,
        message:
          "We&apos;ve detected patterns that suggest focusing on integration would be beneficial.",
        patterns: analysis.patterns,
        interventions: analysis.interventions,
        supportResources: this.getBypassingSupportResources(analysis.patterns),
        nextSteps: [
          "Take time to reflect on recent insights",
          "Focus on real-world application",
          "Consider community reality-checking",
          "Explore professional support if patterns persist",
        ],
      },
      { status: 429 },
    ); // Too Many Requests

    // Add headers for client-side handling
    response.headers.set("X-Integration-Support", "required");
    response.headers.set(
      "X-Bypassing-Patterns",
      JSON.stringify(analysis.patterns),
    );

    return response;
  }

  private getBypassingSupportResources(patterns: string[]): any[] {
    const resources = [];

    if (patterns.includes("insight_addiction")) {
      resources.push({
        type: "reflection_tool",
        title: "Integration Reflection Guide",
        description: "Slow down and focus on applying recent insights",
        action: "/integration/reflection",
      });
    }

    if (patterns.includes("consumption_behavior")) {
      resources.push({
        type: "community_support",
        title: "Community Reality Check",
        description: "Connect with others for grounding perspective",
        action: "/community/reality-check",
      });
    }

    if (patterns.includes("integration_avoidance")) {
      resources.push({
        type: "professional_support",
        title: "Professional Support Options",
        description: "Consider therapeutic support for deeper work",
        action: "/professional/referrals",
      });
    }

    return resources;
  }

  private handleGateBlocked(gateCheck: any, userId: string): NextResponse {
    return NextResponse.json(
      {
        error: "Integration Gate Locked",
        message:
          "This content requires completion of integration requirements.",
        gateId: gateCheck.gateId,
        requirements: gateCheck.requirements,
        estimatedTimeToUnlock: this.calculateUnlockTime(gateCheck.requirements),
        integrationActivities: [
          "Complete reflection on previous insights",
          "Demonstrate real-world application",
          "Engage with community for validation",
        ],
      },
      { status: 423 },
    ); // Locked
  }

  private calculateUnlockTime(requirements: any[]): string {
    // Calculate based on requirement completion estimates
    const totalDays = requirements.reduce(
      (sum, req) => sum + (req.minimumDays || 1),
      0,
    );
    return `${totalDays} days with consistent practice`;
  }

  private handlePacingLimit(pacingCheck: any, userId: string): NextResponse {
    return NextResponse.json(
      {
        error: "Pacing Limit Reached",
        message: pacingCheck.reason,
        waitTimeMinutes: pacingCheck.waitTimeMinutes,
        alternatives: pacingCheck.alternatives,
        integrationFocus: [
          "Reflect on recent insights",
          "Practice current tools consistently",
          "Journal about real-world applications",
          "Engage with community support",
        ],
        reminder:
          "Sustainable growth happens through integration, not accumulation.",
      },
      { status: 429 },
    ); // Too Many Requests
  }

  // Real-time monitoring methods
  async monitorUserSession(userId: string, sessionData: any): Promise<void> {
    if (!this.config.enableRealTimeDetection) return;

    const patterns = await this.detectSessionPatterns(sessionData);

    if (patterns.length > 0) {
      await this.triggerRealTimeIntervention(userId, patterns);
    }
  }

  private async detectSessionPatterns(sessionData: any): Promise<string[]> {
    const patterns: string[] = [];

    // Rapid page switching between content
    if (sessionData.pageViews > 10 && sessionData.avgTimePerPage < 30) {
      patterns.push("content_skimming");
    }

    // Avoiding integration sections
    if (sessionData.contentViews > 3 && sessionData.integrationViews === 0) {
      patterns.push(&quot;integration_avoidance");
    }

    // Seeking only "advanced" or "breakthrough" content
    if (
      sessionData.advancedContentRequests >
      sessionData.basicContentRequests * 2
    ) {
      patterns.push("bypassing_foundations");
    }

    return patterns;
  }

  private async triggerRealTimeIntervention(
    userId: string,
    patterns: string[],
  ): Promise<void> {
    // Send gentle intervention prompts
    const interventions = patterns.map((pattern) =>
      this.getPatternIntervention(pattern),
    );

    // In real implementation, this would use WebSocket or Server-Sent Events
    console.log(`Real-time intervention for user ${userId}:`, interventions);
  }

  private getPatternIntervention(pattern: string): any {
    const interventions = {
      content_skimming: {
        message:
          &quot;Notice the pace of your exploration. What would it be like to slow down and sit with one insight?&quot;,
        suggestion:
          "Try spending 5 minutes reflecting on the last piece of content before continuing.",
        type: "gentle_pause",
      },
      integration_avoidance: {
        message:
          "You&apos;ve explored several insights. How might you apply one of them in your daily life?",
        suggestion:
          "Consider journaling about how recent insights show up in ordinary moments.",
        type: "integration_prompt",
      },
      bypassing_foundations: {
        message:
          "Advanced content builds on solid foundations. How are you practicing the basics?",
        suggestion:
          "Revisit foundational practices to deepen your integration.",
        type: "foundation_reminder",
      },
    };

    return (
      interventions[pattern as keyof typeof interventions] || {
        message:
          "Take a moment to check in with yourself. What do you most need right now?",
        suggestion: "Consider pausing to reflect on your current experience.",
        type: "general_check_in",
      }
    );
  }

  // Community alert system
  async checkCommunityAlerts(
    userId: string,
    interaction: any,
  ): Promise<boolean> {
    if (!this.config.enableCommunityAlerts) return false;

    const alertTriggers = this.analyzeInteractionForAlerts(interaction);

    if (alertTriggers.length > 0) {
      await this.createCommunityAlert(userId, alertTriggers, interaction);
      return true;
    }

    return false;
  }

  private analyzeInteractionForAlerts(interaction: any): string[] {
    const triggers: string[] = [];
    const content = interaction.content.toLowerCase();

    // Spiritual superiority language
    const superiorityWords = [
      &quot;less awakened&quot;,
      "lower vibration",
      "not ready",
      "more evolved",
    ];
    if (superiorityWords.some((word) => content.includes(word))) {
      triggers.push("spiritual_superiority");
    }

    // Bypassing difficult emotions
    const bypassingPhrases = [
      "transcend suffering",
      "love and light only",
      "raise your vibration above",
    ];
    if (bypassingPhrases.some((phrase) => content.includes(phrase))) {
      triggers.push("emotional_bypassing");
    }

    // Magical thinking claims
    const magicalClaims = [
      "manifest instantly",
      "quantum healing",
      "DNA activation",
    ];
    if (magicalClaims.some((claim) => content.includes(claim))) {
      triggers.push("magical_thinking");
    }

    return triggers;
  }

  private async createCommunityAlert(
    userId: string,
    triggers: string[],
    interaction: any,
  ): Promise<void> {
    const alertData = {
      user_id: userId,
      alert_type: "bypassing_concern",
      triggers,
      interaction_id: interaction.id,
      severity: triggers.length > 1 ? "moderate" : "low",
      created_at: new Date().toISOString(),
    };

    // In real implementation, store in database and notify community moderators
    console.log("Community alert created:", alertData);
  }
}

// Export middleware factory
export function createBypassingPreventionMiddleware(
  config: BypassingPreventionConfig,
) {
  const middleware = new BypassingPreventionMiddleware(config);

  return async function bypassingPreventionMiddleware(request: NextRequest) {
    return await middleware.processRequest(request);
  };
}

// Default configuration
export const defaultBypassingPreventionConfig: BypassingPreventionConfig = {
  enableRealTimeDetection: true,
  enableContentGating: true,
  enablePacingAlgorithms: true,
  enableReflectionGaps: true,
  enableCommunityAlerts: true,
};
