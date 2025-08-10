import { Request, Response } from "express";
import { z } from "zod";
import { divinationAgent } from "../../core/agents/divinationAgent";
import { DivinationQuery, DivinationMethod } from "../../types/divination";

// Validation schemas
const BirthDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
});

const DivinationQuerySchema = z.object({
  method: z.enum(["tarot", "iching", "yijing", "astro", "unified"]),
  query: z.string().min(1, "Query cannot be empty"),
  birthData: BirthDataSchema.optional(),
  focus: z.string().optional(),
  spread: z.string().optional(),
  depth: z
    .enum(["basic", "detailed", "comprehensive"])
    .optional()
    .default("detailed"),
});

const DailyDivinationSchema = z.object({
  method: z
    .enum(["tarot", "iching", "astro", "auto"])
    .optional()
    .default("auto"),
});

/**
 * POST /api/oracle/divination
 * Perform a divination reading using specified method
 */
export async function performDivinationReading(req: Request, res: Response) {
  try {
    const validation = DivinationQuerySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        details: validation.error.issues,
      });
    }

    const query: DivinationQuery = {
      ...validation.data,
      method: validation.data.method || "unified",
      query: validation.data.query || "General guidance needed",
    };

    // Validate birth data if provided
    if (
      query.birthData?.date &&
      isNaN(new Date(query.birthData.date).getTime())
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid birth date format",
      });
    }

    // Perform divination
    const insight = await divinationAgent.performDivination(query);

    res.json({
      success: true,
      insight,
      query: {
        method: query.method,
        query: query.query,
        focus: query.focus,
        depth: query.depth,
      },
      generated: new Date().toISOString(),
      sessionId: req.headers["x-session-id"] || "anonymous",
    });
  } catch (error) {
    console.error("Divination reading error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to perform divination reading",
      message: "The oracle is temporarily unavailable. Please try again.",
    });
  }
}

/**
 * GET /api/oracle/divination/daily
 * Get daily divination guidance
 */
export async function getDailyDivination(req: Request, res: Response) {
  try {
    const { method } = req.query;

    const validation = DailyDivinationSchema.safeParse({ method });
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid method parameter",
      });
    }

    const insight = await divinationAgent.getDailyDivination();

    res.json({
      success: true,
      insight,
      type: "daily",
      date: new Date().toISOString().split("T")[0],
      generated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Daily divination error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get daily divination",
    });
  }
}

/**
 * POST /api/oracle/divination/quick
 * Quick single-card or simple reading
 */
export async function getQuickDivination(req: Request, res: Response) {
  try {
    const { method = "tarot", question = "What do I need to know right now?" } =
      req.body;

    const quickQuery: DivinationQuery = {
      method: method as DivinationMethod,
      query: question,
      depth: "basic",
      spread: method === "tarot" ? "single-card" : undefined,
    };

    const insight = await divinationAgent.performDivination(quickQuery);

    res.json({
      success: true,
      insight,
      type: "quick",
      generated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Quick divination error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to perform quick divination",
    });
  }
}

/**
 * GET /api/oracle/divination/methods
 * Get available divination methods and their descriptions
 */
export async function getDivinationMethods(req: Request, res: Response) {
  try {
    const methods = {
      tarot: {
        name: "Tarot",
        description:
          "Ancient card wisdom revealing archetypal patterns and spiritual guidance",
        spreads: [
          "single-card",
          "three-card",
          "celtic-cross",
          "relationship",
          "chakra",
          "year-ahead",
        ],
        focus: "Archetypal wisdom and symbolic guidance",
        timeframe: "Present moment to 1 year ahead",
        bestFor: [
          "Life decisions",
          "Spiritual guidance",
          "Understanding patterns",
          "Relationship insights",
        ],
      },
      iching: {
        name: "I Ching",
        description: "Traditional Chinese oracle of change and natural wisdom",
        spreads: ["hexagram", "with-changing-lines"],
        focus: "Natural flow, timing, and transformation",
        timeframe: "Present cycle and immediate future",
        bestFor: [
          "Decision timing",
          "Understanding change",
          "Business decisions",
          "Natural cycles",
        ],
      },
      yijing: {
        name: "Yi Jing",
        description:
          "Spiritual I Ching focused on soul journey and inner guidance",
        spreads: ["soul-hexagram", "spiritual-journey"],
        focus: "Soul evolution and spiritual development",
        timeframe: "Soul timeline and spiritual cycles",
        bestFor: [
          "Spiritual growth",
          "Soul purpose",
          "Inner guidance",
          "Meditation focus",
        ],
      },
      astro: {
        name: "Astrology Oracle",
        description: "Cosmic timing and archetypal energy guidance",
        spreads: ["archetypal", "timing", "planetary"],
        focus: "Cosmic cycles and archetypal embodiment",
        timeframe: "Current transits and cosmic timing",
        bestFor: [
          "Understanding current energy",
          "Optimal timing",
          "Archetypal work",
          "Cosmic purpose",
        ],
      },
      unified: {
        name: "Unified Oracle",
        description:
          "Multi-method synthesis combining Tarot, I Ching, and Astrology",
        spreads: ["three-stream", "full-synthesis"],
        focus: "Holographic wisdom from multiple traditions",
        timeframe: "Multi-dimensional perspective",
        bestFor: [
          "Major life decisions",
          "Deep understanding",
          "Complex situations",
          "Spiritual integration",
        ],
      },
    };

    res.json({
      success: true,
      methods,
      totalMethods: Object.keys(methods).length,
      description:
        "Sacred divination methods available through the Spiralogic Oracle System",
    });
  } catch (error) {
    console.error("Get methods error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve divination methods",
    });
  }
}

/**
 * POST /api/oracle/divination/validate
 * Validate a divination query before processing
 */
export async function validateDivinationQuery(req: Request, res: Response) {
  try {
    const validation = DivinationQuerySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        valid: false,
        errors: validation.error.issues,
        suggestions: generateValidationSuggestions(validation.error.issues),
      });
    }

    const query: DivinationQuery = {
      ...validation.data,
      method: validation.data.method || "unified",
      query: validation.data.query || "Daily guidance needed",
    };

    // Additional business logic validation
    const businessValidation = validateBusinessRules(query);

    res.json({
      success: true,
      valid: businessValidation.valid,
      query: businessValidation.valid ? query : undefined,
      warnings: businessValidation.warnings,
      suggestions: businessValidation.suggestions,
    });
  } catch (error) {
    console.error("Query validation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate query",
    });
  }
}

function generateValidationSuggestions(issues: any[]): string[] {
  const suggestions: string[] = [];

  issues.forEach((issue) => {
    switch (issue.path[0]) {
      case "method":
        suggestions.push(
          "Choose from: tarot, iching, yijing, astro, or unified",
        );
        break;
      case "query":
        suggestions.push(
          "Provide a clear question or area of focus for the reading",
        );
        break;
      case "birthData":
        suggestions.push(
          "If providing birth data, use YYYY-MM-DD format for the date",
        );
        break;
      default:
        suggestions.push("Check the field format and try again");
    }
  });

  return [...new Set(suggestions)]; // Remove duplicates
}

function validateBusinessRules(query: DivinationQuery): {
  valid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Method-specific validations
  if (query.method === "astro" && !query.birthData) {
    warnings.push("Astrological readings are more accurate with birth data");
    suggestions.push(
      "Consider providing your birth date for personalized cosmic guidance",
    );
  }

  if (query.method === "unified" && query.depth === "basic") {
    warnings.push(
      "Unified readings work best with detailed or comprehensive depth",
    );
    suggestions.push(
      "Consider using detailed or comprehensive depth for richer unified insights",
    );
  }

  if (
    query.method === "tarot" &&
    query.spread === "celtic-cross" &&
    query.depth === "basic"
  ) {
    warnings.push("Celtic Cross spreads work better with detailed analysis");
    suggestions.push("Consider using detailed depth for this complex spread");
  }

  // Query quality checks
  if (query.query.length < 10) {
    warnings.push("Very short questions may result in general guidance");
    suggestions.push(
      "Consider providing more context for more specific insights",
    );
  }

  if (query.query.includes("yes or no")) {
    warnings.push(
      "Oracle readings provide nuanced guidance rather than yes/no answers",
    );
    suggestions.push(
      'Rephrase as "What should I know about..." or "How can I approach..."',
    );
  }

  return {
    valid: true,
    warnings,
    suggestions,
  };
}
