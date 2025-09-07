/**
 * Cultural Module Initializer
 *
 * Centralized initialization and configuration system for all Universal Consciousness
 * Platform cultural modules. Ensures proper startup sequence, dependency management,
 * and configuration of cultural intelligence systems.
 */

import { logger } from "../../utils/logger";

// Import all cultural modules
import { indigenousSovereigntyProtocol } from "./IndigenousSovereigntyProtocol";
import { culturalContextAwareness } from "./CulturalContextAwareness";
import { culturalShadowIntegration } from "./CulturalShadowIntegration";
import { crossCulturalArchetypeMapping } from "./CrossCulturalArchetypeMapping";
import { universalConsciousnessIntegration } from "./UniversalConsciousnessIntegration";
import { universalConsciousnessOrchestrator } from "./UniversalConsciousnessOrchestrator";

export interface CulturalModuleConfiguration {
  indigenousSovereigntyEnabled: boolean;
  culturalContextDetectionEnabled: boolean;
  shadowIntegrationEnabled: boolean;
  archetypalMappingEnabled: boolean;
  universalConsciousnessEnabled: boolean;
  orchestratorEnabled: boolean;
  defaultCulturalPreferences: string[];
  safeguardLevel: "minimal" | "standard" | "strict";
  loggingLevel: "info" | "debug" | "warn";
}

export interface CulturalModuleStatus {
  module: string;
  status: "not_initialized" | "initializing" | "ready" | "error";
  version: string;
  capabilities: string[];
  dependencies: string[];
  lastUpdated: string;
}

export interface SystemHealthReport {
  overallStatus: "healthy" | "degraded" | "critical";
  moduleStatuses: CulturalModuleStatus[];
  systemCapabilities: string[];
  recommendedActions: string[];
  lastHealthCheck: string;
}

/**
 * Cultural Module Initializer
 * Manages the lifecycle and configuration of all cultural intelligence modules
 */
export class CulturalModuleInitializer {
  private configuration: CulturalModuleConfiguration;
  private moduleStatuses: Map<string, CulturalModuleStatus> = new Map();
  private initializationOrder: string[] = [
    "indigenousSovereigntyProtocol",
    "culturalContextAwareness",
    "crossCulturalArchetypeMapping",
    "culturalShadowIntegration",
    "universalConsciousnessIntegration",
    "universalConsciousnessOrchestrator",
  ];
  private isInitialized: boolean = false;

  constructor(config?: Partial<CulturalModuleConfiguration>) {
    this.configuration = this.createDefaultConfiguration(config);
    this.initializeModuleStatuses();
  }

  /**
   * Initialize all cultural modules in proper dependency order
   */
  async initializeAllModules(): Promise<SystemHealthReport> {
    try {
      logger.info("Starting Cultural Module initialization", {
        configuration: this.configuration,
        moduleCount: this.initializationOrder.length,
      });

      // Initialize modules in dependency order
      for (const moduleName of this.initializationOrder) {
        await this.initializeModule(moduleName);
      }

      // Perform system integration verification
      await this.verifySystemIntegration();

      this.isInitialized = true;

      const healthReport = await this.performHealthCheck();

      logger.info("Cultural Module initialization completed", {
        overallStatus: healthReport.overallStatus,
        readyModules: healthReport.moduleStatuses.filter(
          (m) => m.status === "ready",
        ).length,
        totalModules: healthReport.moduleStatuses.length,
      });

      return healthReport;
    } catch (error) {
      logger.error("Error during Cultural Module initialization:", error);

      return {
        overallStatus: "critical",
        moduleStatuses: Array.from(this.moduleStatuses.values()),
        systemCapabilities: [],
        recommendedActions: [
          "Check module dependencies",
          "Review configuration",
          "Restart initialization",
        ],
        lastHealthCheck: new Date().toISOString(),
      };
    }
  }

  /**
   * Initialize individual module
   */
  private async initializeModule(moduleName: string): Promise<void> {
    try {
      this.updateModuleStatus(moduleName, "initializing");

      logger.debug(`Initializing module: ${moduleName}`);

      switch (moduleName) {
        case "indigenousSovereigntyProtocol":
          await this.initializeIndigenousSovereignty();
          break;
        case "culturalContextAwareness":
          await this.initializeCulturalContext();
          break;
        case "crossCulturalArchetypeMapping":
          await this.initializeArchetypeMapping();
          break;
        case "culturalShadowIntegration":
          await this.initializeShadowIntegration();
          break;
        case "universalConsciousnessIntegration":
          await this.initializeUniversalConsciousness();
          break;
        case "universalConsciousnessOrchestrator":
          await this.initializeOrchestrator();
          break;
        default:
          throw new Error(`Unknown module: ${moduleName}`);
      }

      this.updateModuleStatus(moduleName, "ready");
      logger.debug(`Module ${moduleName} initialized successfully`);
    } catch (error) {
      this.updateModuleStatus(moduleName, "error");
      logger.error(`Error initializing module ${moduleName}:`, error);
      throw error;
    }
  }

  /**
   * Module-specific initialization methods
   */
  private async initializeIndigenousSovereignty(): Promise<void> {
    // Indigenous Sovereignty Protocol is initialized on import
    // Verify it's working correctly
    const testRequest = {
      tradition: "test_tradition",
      userCulturalBackground: "test_user",
      intentionForUse: "test_validation",
    };

    await indigenousSovereigntyProtocol.evaluateWisdomRequest(testRequest);

    this.updateModuleCapabilities("indigenousSovereigntyProtocol", [
      "traditional_knowledge_protection",
      "cultural_protocol_evaluation",
      "permission_verification",
      "attribution_requirements",
    ]);
  }

  private async initializeCulturalContext(): Promise<void> {
    // Cultural Context Awareness is initialized on import
    // Verify with test detection
    const testProfile = await culturalContextAwareness.detectCulturalContext(
      "test spiritual wisdom seeking",
      { culturalBackground: "test" },
      [],
    );

    this.updateModuleCapabilities("culturalContextAwareness", [
      "cultural_context_detection",
      "cultural_profile_creation",
      "cultural_adaptation",
      "communication_style_adaptation",
    ]);
  }

  private async initializeArchetypeMapping(): Promise<void> {
    // Cross-Cultural Archetype Mapping is initialized on import
    // Verify with test translation
    const testTranslation =
      await crossCulturalArchetypeMapping.translateArchetype({
        sourceElement: "fire",
        targetCulture: "universal",
        userCulturalBackground: "test",
        contextOfUse: "test",
        respectfulApproach: true,
      });

    this.updateModuleCapabilities("crossCulturalArchetypeMapping", [
      "archetype_translation",
      "cultural_expression_mapping",
      "respectful_framing",
      "cross_cultural_synthesis",
    ]);
  }

  private async initializeShadowIntegration(): Promise<void> {
    // Cultural Shadow Integration is initialized on import
    // Verify with test enhancement
    const testProfile = {
      primaryCulture: "universal",
      culturalIdentities: ["test"],
      languagePreferences: ["english"],
      traditionalPractices: [],
      spiritualFramework: "universal",
      ancestralLineages: [],
      culturalStrengths: ["test_strength"],
      preferredWisdomSources: ["test_source"],
    };

    await culturalShadowIntegration.enhanceShadowWorkWithCulture(
      "test response",
      "test input",
      testProfile,
      "test_shadow_type",
    );

    this.updateModuleCapabilities("culturalShadowIntegration", [
      "cultural_trauma_assessment",
      "shadow_pattern_identification",
      "ancestral_wisdom_integration",
      "cultural_healing_guidance",
    ]);
  }

  private async initializeUniversalConsciousness(): Promise<void> {
    // Universal Consciousness Integration is initialized on import
    // Verify with test query
    const testQuery = {
      userInput: "test spiritual guidance",
      userId: "test_user",
      element: "fire",
      originalResponse: "test response",
    };

    await universalConsciousnessIntegration.processUniversalConsciousnessQuery(
      testQuery,
    );

    this.updateModuleCapabilities("universalConsciousnessIntegration", [
      "universal_consciousness_processing",
      "cultural_wisdom_synthesis",
      "archetypal_cultural_integration",
      "indigenous_compliance_verification",
    ]);
  }

  private async initializeOrchestrator(): Promise<void> {
    // Universal Consciousness Orchestrator is initialized on import
    // Verify orchestrator status
    const status = universalConsciousnessOrchestrator.getOrchestratorStatus();

    if (!status.enhancementEnabled) {
      universalConsciousnessOrchestrator.setEnhancementEnabled(true);
    }

    this.updateModuleCapabilities("universalConsciousnessOrchestrator", [
      "oracle_response_enhancement",
      "cultural_integration_orchestration",
      "backward_compatibility_preservation",
      "enhancement_metrics_tracking",
    ]);
  }

  /**
   * Verify system integration works correctly
   */
  private async verifySystemIntegration(): Promise<void> {
    try {
      // Test full integration flow
      const testRequest = {
        originalQuery: "I feel disconnected from my spiritual path",
        originalResponse: "Trust your inner wisdom and keep exploring",
        userId: "integration_test",
        element: "water",
        userProfile: {
          culturalBackground: "universal",
          preferences: { culturalEnhancement: true },
        },
      };

      const enhancedResponse =
        await universalConsciousnessOrchestrator.enhanceOracleResponse(
          testRequest,
        );

      if (!enhancedResponse.universalConsciousnessActive) {
        throw new Error("Universal Consciousness integration not active");
      }

      logger.info("System integration verification successful");
    } catch (error) {
      logger.error("System integration verification failed:", error);
      throw error;
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<SystemHealthReport> {
    const moduleStatuses = Array.from(this.moduleStatuses.values());
    const readyModules = moduleStatuses.filter(
      (m) => m.status === "ready",
    ).length;
    const errorModules = moduleStatuses.filter(
      (m) => m.status === "error",
    ).length;

    let overallStatus: "healthy" | "degraded" | "critical";

    if (errorModules === 0 && readyModules === moduleStatuses.length) {
      overallStatus = "healthy";
    } else if (errorModules > 0 && readyModules > moduleStatuses.length / 2) {
      overallStatus = "degraded";
    } else {
      overallStatus = "critical";
    }

    // Collect all system capabilities
    const systemCapabilities = moduleStatuses
      .filter((m) => m.status === "ready")
      .flatMap((m) => m.capabilities);

    // Generate recommendations
    const recommendedActions = this.generateHealthRecommendations(
      moduleStatuses,
      overallStatus,
    );

    return {
      overallStatus,
      moduleStatuses,
      systemCapabilities: [...new Set(systemCapabilities)], // Remove duplicates
      recommendedActions,
      lastHealthCheck: new Date().toISOString(),
    };
  }

  /**
   * Helper methods
   */
  private createDefaultConfiguration(
    config?: Partial<CulturalModuleConfiguration>,
  ): CulturalModuleConfiguration {
    return {
      indigenousSovereigntyEnabled: true,
      culturalContextDetectionEnabled: true,
      shadowIntegrationEnabled: true,
      archetypalMappingEnabled: true,
      universalConsciousnessEnabled: true,
      orchestratorEnabled: true,
      defaultCulturalPreferences: ["universal"],
      safeguardLevel: "standard",
      loggingLevel: "info",
      ...config,
    };
  }

  private initializeModuleStatuses(): void {
    for (const moduleName of this.initializationOrder) {
      this.moduleStatuses.set(moduleName, {
        module: moduleName,
        status: "not_initialized",
        version: "1.0.0",
        capabilities: [],
        dependencies: this.getModuleDependencies(moduleName),
        lastUpdated: new Date().toISOString(),
      });
    }
  }

  private updateModuleStatus(
    moduleName: string,
    status: CulturalModuleStatus["status"],
  ): void {
    const currentStatus = this.moduleStatuses.get(moduleName);
    if (currentStatus) {
      currentStatus.status = status;
      currentStatus.lastUpdated = new Date().toISOString();
      this.moduleStatuses.set(moduleName, currentStatus);
    }
  }

  private updateModuleCapabilities(
    moduleName: string,
    capabilities: string[],
  ): void {
    const currentStatus = this.moduleStatuses.get(moduleName);
    if (currentStatus) {
      currentStatus.capabilities = capabilities;
      this.moduleStatuses.set(moduleName, currentStatus);
    }
  }

  private getModuleDependencies(moduleName: string): string[] {
    const dependencies = {
      indigenousSovereigntyProtocol: [],
      culturalContextAwareness: [],
      crossCulturalArchetypeMapping: ["indigenousSovereigntyProtocol"],
      culturalShadowIntegration: [
        "culturalContextAwareness",
        "indigenousSovereigntyProtocol",
      ],
      universalConsciousnessIntegration: [
        "culturalContextAwareness",
        "culturalShadowIntegration",
        "crossCulturalArchetypeMapping",
        "indigenousSovereigntyProtocol",
      ],
      universalConsciousnessOrchestrator: ["universalConsciousnessIntegration"],
    };

    return dependencies[moduleName as keyof typeof dependencies] || [];
  }

  private generateHealthRecommendations(
    moduleStatuses: CulturalModuleStatus[],
    overallStatus: string,
  ): string[] {
    const recommendations = [];

    const errorModules = moduleStatuses.filter((m) => m.status === "error");
    if (errorModules.length > 0) {
      recommendations.push(
        `Investigate errors in: ${errorModules.map((m) => m.module).join(", ")}`,
      );
    }

    const initializingModules = moduleStatuses.filter(
      (m) => m.status === "initializing",
    );
    if (initializingModules.length > 0) {
      recommendations.push(
        `Wait for initialization to complete: ${initializingModules.map((m) => m.module).join(", ")}`,
      );
    }

    if (overallStatus === "critical") {
      recommendations.push("Consider restarting the cultural module system");
      recommendations.push("Check system dependencies and configuration");
    }

    if (overallStatus === "degraded") {
      recommendations.push(
        "Monitor system performance and consider module restart",
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("System operating normally - no actions required");
    }

    return recommendations;
  }

  /**
   * Public interface methods
   */
  isSystemInitialized(): boolean {
    return this.isInitialized;
  }

  getConfiguration(): CulturalModuleConfiguration {
    return { ...this.configuration };
  }

  updateConfiguration(updates: Partial<CulturalModuleConfiguration>): void {
    this.configuration = { ...this.configuration, ...updates };
    logger.info("Cultural module configuration updated", { updates });
  }

  getModuleStatus(moduleName: string): CulturalModuleStatus | null {
    return this.moduleStatuses.get(moduleName) || null;
  }

  getAllModuleStatuses(): CulturalModuleStatus[] {
    return Array.from(this.moduleStatuses.values());
  }

  /**
   * Restart individual module
   */
  async restartModule(moduleName: string): Promise<void> {
    logger.info(`Restarting module: ${moduleName}`);
    await this.initializeModule(moduleName);
  }

  /**
   * Restart all modules
   */
  async restartAllModules(): Promise<SystemHealthReport> {
    logger.info("Restarting all cultural modules");
    this.isInitialized = false;
    return await this.initializeAllModules();
  }
}

// Create singleton instance
export const culturalModuleInitializer = new CulturalModuleInitializer();

// Auto-initialize on import (can be disabled if needed)
let autoInitialized = false;

export const initializeCulturalModules =
  async (): Promise<SystemHealthReport> => {
    if (autoInitialized) {
      return await culturalModuleInitializer.performHealthCheck();
    }

    autoInitialized = true;
    return await culturalModuleInitializer.initializeAllModules();
  };

// Export for manual initialization control
export { CulturalModuleInitializer };
