// src/tasks/scheduledTasks.ts

import {
  analyzeFeedbackTrends,
  updatePersonalityWeights,
} from "../services/monitoringService";

const ANALYSIS_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export async function runScheduledAnalysis() {
  const end = new Date();
  const start = new Date(end.getTime() - ANALYSIS_INTERVAL);

  try {
    const metrics = await analyzeFeedbackTrends({ start, end });

    const adjustments = Object.entries(metrics.confidenceScores).map(
      ([element, confidence]) => ({
        element,
        weight: metrics.elementalDistribution[element] / 100,
        confidence,
      }),
    );

    if (adjustments.length > 0) {
      await updatePersonalityWeights(adjustments);
    } else {
      console.warn("⚠️ No adjustments calculated — skipping update.");
    }

    console.log("✅ Scheduled analysis completed:", {
      timestamp: new Date().toISOString(),
      metrics,
    });
  } catch (error) {
    console.error("❌ Error in scheduled analysis:", error);
  }
}

export function initializeScheduledTasks() {
  console.log("📆 Initializing scheduled feedback analysis task...");

  // Run once on startup
  runScheduledAnalysis().catch(console.error);

  // Set recurring analysis
  setInterval(runScheduledAnalysis, ANALYSIS_INTERVAL);
}
