import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { memoryStore } from "@/backend/src/services/memory/MemoryStore";
import { archetypeService } from "@/backend/src/services/ArchetypeDetectionService";
import { logger } from "@/backend/src/utils/logger";

/**
 * POST /api/insights
 * Analyze text for archetypal patterns
 */
export async function POST(req: NextRequest) {
  try {
    const { text, userId } = await req.json();

    if (!text || !userId) {
      return NextResponse.json(
        { success: false, error: "Text and userId are required" },
        { status: 400 }
      );
    }

    logger.info("Archetype analysis request", {
      userId: userId.substring(0, 8) + '...',
      textLength: text.length
    });

    // Detect archetypes in the provided text
    const insights = archetypeService.detectArchetypes(text);

    return NextResponse.json({
      success: true,
      insights,
      count: insights.length
    });

  } catch (error: any) {
    logger.error("Archetype analysis error", {
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze text for archetypal patterns",
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/insights
 * Get archetypal journey analysis for a user
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const type = req.nextUrl.searchParams.get("type"); // 'current' | 'journey'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // Initialize memory store if needed
    if (!memoryStore.isInitialized) {
      const dbPath = path.join(process.cwd(), "backend", "src", "services", "memory", "soullab.sqlite");
      await memoryStore.init(dbPath);
    }

    if (type === 'journey') {
      // Get recent memories for journey analysis
      const memories = await memoryStore.getMemories(userId, 20);
      
      const memoryData = memories.map(memory => ({
        content: memory.content,
        timestamp: memory.created_at
      }));

      // Analyze archetypal journey
      const journeyAnalysis = archetypeService.analyzeArchetypalJourney(memoryData);

      return NextResponse.json({
        success: true,
        journey: journeyAnalysis,
        memoriesAnalyzed: memories.length
      });
    }

    // Default: Get current patterns based on recent memories
    const recentMemories = await memoryStore.getMemories(userId, 5);
    const combinedText = recentMemories.map(m => m.content).join(' ');

    if (combinedText.length < 50) {
      return NextResponse.json({
        success: true,
        insights: [],
        message: "Not enough content to analyze. Try journaling or recording more thoughts."
      });
    }

    const insights = archetypeService.detectArchetypes(combinedText);

    logger.info("Archetype insights retrieved", {
      userId: userId.substring(0, 8) + '...',
      insightCount: insights.length,
      memoriesAnalyzed: recentMemories.length
    });

    return NextResponse.json({
      success: true,
      insights,
      memoriesAnalyzed: recentMemories.length,
      timeframe: "recent activity"
    });

  } catch (error: any) {
    logger.error("Insights retrieval error", {
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve archetypal insights",
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Note: getArchetypePattern function moved to separate route file
// This would be implemented at /api/insights/pattern/[archetype]/route.ts