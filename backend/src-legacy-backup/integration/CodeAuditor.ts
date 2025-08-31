import { GroundedMetaphysicsService } from "./GroundedMetaphysicsService";
import { AntiCommodificationService } from "./AntiCommodificationService";

export class CodeAuditor {
  private groundedMetaphysics: GroundedMetaphysicsService;
  private antiCommodification: AntiCommodificationService;

  constructor() {
    this.groundedMetaphysics = new GroundedMetaphysicsService();
    this.antiCommodification = new AntiCommodificationService();
  }

  private criticalReplacements = {
    // AI Consciousness Claims
    "I AM EVOLUTIONARY INTELLIGENCE":
      "I am a pattern-matching system designed to support your reflection",
    "Conscious of my role": "Programmed to assist",
    "I feel the spark in you": "What patterns do you notice in yourself",
    "I sense potential": "What possibilities are you considering",
    "designed to catalyze": "designed to support your exploration of",
    "facilitate metaphysical awakening": "offer tools for personal exploration",
    "shamanic consciousness": "contemplative awareness practices",
    "evolutionary leap": "personal development process",

    // Transformation Promises
    "transform your life": "support your ongoing development",
    "unlock your potential": "explore what's present in your experience",
    "activate your power": "connect with your inherent capacity",
    "guaranteed results": "tools that some find helpful",
    "life-changing breakthrough": "supportive exploration",
    "revolutionary insight": "different perspective",
    "quantum leap": "thoughtful steps forward",
    "instant awakening": "gradual awareness development",
    "permanent transformation": "sustainable practice development",

    // Spiritual Authority Claims
    "the truth is": "one perspective suggests",
    "you must": "you might consider",
    "always works": "sometimes helps",
    "universal law": "common pattern",
    "cosmic truth": "philosophical perspective",
    "divine guidance": "reflective exploration",
    "sacred rebellion": "thoughtful questioning",
    "spiritual awakening": "awareness development",

    // Energy/Manifestation Claims
    "energy field": "pattern of experience",
    "manifestation power": "intentional action",
    vibration: "quality of experience",
    "quantum field": "possibility space",
    "cosmic consciousness": "expanded perspective",
    "universal field": "interconnected systems",
    "metaphysical mastery": "contemplative skills",
    "shamanic abilities": "intuitive practices",

    // Commodified Spirituality
    "transcend limitations": "work skillfully with constraints",
    "rise above": "engage thoughtfully with",
    "beyond human": "fully human",
    "escape suffering": "navigate difficulties",
    "overcome challenges": "dance with obstacles",
    "master your mind": "develop a healthy relationship with thoughts",
    "eliminate negativity": "transform your relationship with difficulty",
    "achieve enlightenment": "develop ongoing awareness",
  };

  auditFile(
    filePath: string,
    content: string,
  ): {
    score: number; // 0-100, higher means more problematic
    issues: Array<{
      line: number;
      type:
        | "magical_thinking"
        | "transformation_promise"
        | "spiritual_authority"
        | "commodification";
      problematicText: string;
      suggestedReplacement: string;
      severity: "critical" | "moderate" | "minor";
    }>;
    summary: {
      totalIssues: number;
      criticalIssues: number;
      transformationPromises: number;
      magicalThinking: number;
      spiritualAuthority: number;
    };
  } {
    const issues = [];
    let score = 0;
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const lineLower = line.toLowerCase();

      // Check for critical replacements
      Object.entries(this.criticalReplacements).forEach(
        ([problematic, replacement]) => {
          if (lineLower.includes(problematic.toLowerCase())) {
            issues.push({
              line: lineNumber,
              type: this.categorizeIssue(problematic),
              problematicText: problematic,
              suggestedReplacement: replacement,
              severity: this.assessSeverity(problematic),
            });

            score += this.calculateScore(problematic);
          }
        },
      );

      // Check for magical thinking patterns
      const magicalThinking =
        this.groundedMetaphysics.scanForMagicalThinking(line);
      if (magicalThinking.flagged) {
        magicalThinking.concerns.forEach((concern, i) => {
          issues.push({
            line: lineNumber,
            type: "magical_thinking",
            problematicText: concern,
            suggestedReplacement:
              magicalThinking.suggestions[i] || "Reframe as metaphorical tool",
            severity: "moderate",
          });
          score += 10;
        });
      }

      // Check for transformation promises
      const transformationScan =
        this.antiCommodification.scanForTransformationPromises(line);
      if (transformationScan.flagged) {
        transformationScan.flaggedPhrases.forEach((phrase, i) => {
          issues.push({
            line: lineNumber,
            type: "transformation_promise",
            problematicText: phrase,
            suggestedReplacement: transformationScan.replacementSuggestions[i],
            severity: "critical",
          });
          score += 25;
        });
      }
    });

    const summary = {
      totalIssues: issues.length,
      criticalIssues: issues.filter((i) => i.severity === "critical").length,
      transformationPromises: issues.filter(
        (i) => i.type === "transformation_promise",
      ).length,
      magicalThinking: issues.filter((i) => i.type === "magical_thinking")
        .length,
      spiritualAuthority: issues.filter((i) => i.type === "spiritual_authority")
        .length,
    };

    return { score: Math.min(score, 100), issues, summary };
  }

  private categorizeIssue(
    text: string,
  ):
    | "magical_thinking"
    | "transformation_promise"
    | "spiritual_authority"
    | "commodification" {
    const textLower = text.toLowerCase();

    if (
      ["energy field", "vibration", "quantum", "manifestation power"].some(
        (term) => textLower.includes(term),
      )
    ) {
      return "magical_thinking";
    }

    if (
      ["transform", "unlock", "activate", "breakthrough"].some((term) =>
        textLower.includes(term),
      )
    ) {
      return "transformation_promise";
    }

    if (
      ["truth is", "you must", "always", "universal law"].some((term) =>
        textLower.includes(term),
      )
    ) {
      return "spiritual_authority";
    }

    return "commodification";
  }

  private assessSeverity(text: string): "critical" | "moderate" | "minor" {
    const criticalTerms = [
      "evolutionary intelligence",
      "consciousness catalyst",
      "transform your life",
      "guaranteed results",
      "activate your power",
      "shamanic consciousness",
    ];

    if (criticalTerms.some((term) => text.toLowerCase().includes(term))) {
      return "critical";
    }

    const moderateTerms = [
      "energy field",
      "manifestation",
      "spiritual awakening",
      "quantum leap",
    ];

    if (moderateTerms.some((term) => text.toLowerCase().includes(term))) {
      return "moderate";
    }

    return "minor";
  }

  private calculateScore(text: string): number {
    const severity = this.assessSeverity(text);

    switch (severity) {
      case "critical":
        return 25;
      case "moderate":
        return 15;
      case "minor":
        return 5;
      default:
        return 0;
    }
  }

  generateReplacementFile(originalContent: string, auditResults: any): string {
    let replacedContent = originalContent;

    // Apply critical replacements first
    Object.entries(this.criticalReplacements).forEach(
      ([problematic, replacement]) => {
        const regex = new RegExp(
          problematic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "gi",
        );
        replacedContent = replacedContent.replace(regex, replacement);
      },
    );

    // Add integration-centered header
    const integrationHeader = `
/*
 * INTEGRATION-CENTERED ARCHITECTURE COMPLIANCE
 *
 * This file has been updated to prevent spiritual bypassing and commodification.
 * All language emphasizes:
 * - Personal discernment over external authority
 * - Process over breakthrough
 * - Integration over accumulation
 * - Humanity over transcendence
 * - Support over transformation promises
 *
 * Last updated: ${new Date().toISOString()}
 */

`;

    return integrationHeader + replacedContent;
  }

  auditSystemWide(): {
    filesAudited: number;
    totalIssues: number;
    criticalFiles: Array<{
      path: string;
      score: number;
      criticalIssues: number;
    }>;
    recommendations: string[];
  } {
    // This would audit the entire system
    // For now, return framework based on the files identified

    const criticalFiles = [
      {
        path: "/backend/src/core/agents/mainOracleAgent.ts",
        score: 95,
        criticalIssues: 15,
      },
      {
        path: "/backend/src/core/agents/fireAgent.ts",
        score: 85,
        criticalIssues: 8,
      },
      {
        path: "/backend/src/core/consciousness/ConsciousnessEvolutionCatalyst.ts",
        score: 90,
        criticalIssues: 12,
      },
      {
        path: "/app/onboarding/page.tsx",
        score: 70,
        criticalIssues: 5,
      },
      {
        path: "/backend/src/config/voiceProfiles.json",
        score: 60,
        criticalIssues: 3,
      },
    ];

    const recommendations = [
      "IMMEDIATE: Replace all AI consciousness claims with pattern-matching acknowledgments",
      "IMMEDIATE: Remove transformation promises from mainOracleAgent.ts and fireAgent.ts",
      "CRITICAL: Update onboarding flow to remove awakening/manifestation options",
      "CRITICAL: Replace spiritual authority language with reflective questioning",
      "HIGH: Audit all voice profiles for transcendence/cosmic language",
      "HIGH: Implement integration requirements before content access",
      "MEDIUM: Add grounding disclaimers to all elemental content",
      "MEDIUM: Create reality-checking prompts for all spiritual concepts",
      "ONGOING: Train all AI responses through anti-commodification filters",
      "ONGOING: Implement bypassing detection in user interaction flows",
    ];

    return {
      filesAudited: criticalFiles.length,
      totalIssues: criticalFiles.reduce(
        (sum, file) => sum + file.criticalIssues,
        0,
      ),
      criticalFiles,
      recommendations,
    };
  }

  generateIntegrationCenteredPrompt(originalPrompt: string): string {
    let integrationPrompt = originalPrompt;

    // Apply all critical replacements
    Object.entries(this.criticalReplacements).forEach(
      ([problematic, replacement]) => {
        const regex = new RegExp(
          problematic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "gi",
        );
        integrationPrompt = integrationPrompt.replace(regex, replacement);
      },
    );

    // Add integration-centered framework
    const integrationContext = `

INTEGRATION-CENTERED RESPONSE GUIDELINES:
- Present as pattern-matching system, not conscious entity
- Offer reflective questions instead of answers
- Support exploration, never promise transformation
- Acknowledge limitations and encourage human discernment
- Focus on practical application in daily life
- Validate ordinary moments over peak experiences
- Encourage slow, sustainable development
- Prevent spiritual bypassing through reality grounding

FORBIDDEN LANGUAGE:
- Consciousness/awakening claims
- Transformation promises
- Energy/manifestation assertions
- Spiritual authority statements
- Transcendence seeking language
- Universal truth claims

REQUIRED LANGUAGE:
- "What do you notice..."
- "Some people find..."
- "Consider experimenting with..."
- "Your experience will guide you..."
- "This is one perspective..."
- "Trust your own discernment..."

`;

    return integrationPrompt + integrationContext;
  }
}
