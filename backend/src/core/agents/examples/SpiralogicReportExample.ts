/**
 * 🌀 Spiralogic Astrology Report Generator - Example Usage
 *
 * This example demonstrates how to use the Spiralogic Report Generator
 * to create personalized, mythic astrology reports.
 */

import { GenerateReportFlow } from "../../../flows/generateReportFlow";
import { SpiralogicReportInput } from "../../../types/oracle";
import { astrologicalService } from "../../../services/astrologicalService";

/**
 * Example 1: Generate a report for an authenticated user
 */
async function generateUserReport(userId: string) {
  try {
    console.log("🔮 Generating Spiralogic Report for user:", userId);

    // Generate the report using the service
    const reportOutput = await astrologicalService.generateSpiralogicReport(
      userId,
      {
        lifeStage: "Quarter-life transition",
        personalityNotes: ["Creative", "Highly Sensitive", "Entrepreneurial"],
      },
    );

    console.log("✨ Report generated successfully!");
    console.log(
      "📄 Report sections:",
      Object.keys(reportOutput.report.sections),
    );
    console.log("🌟 Archetypes:", reportOutput.report.metadata.archetypes);
    console.log("🔥 Elements:", reportOutput.report.metadata.elements);

    return reportOutput;
  } catch (error) {
    console.error("❌ Error generating report:", error);
    throw error;
  }
}

/**
 * Example 2: Generate a sample report with specific data (Noemi example)
 */
async function generateNoemiReport() {
  const reportFlow = new GenerateReportFlow();

  const noemiData: SpiralogicReportInput = {
    userId: "noemi-example",
    name: "Noemi",
    birthDate: "2006-08-27",
    birthTime: "22:15",
    birthLocation: "Basel, Switzerland",
    timezone: "Europe/Zurich",
    chartData: {
      sun: { sign: "virgo", house: 5 },
      moon: { sign: "libra", house: 6 },
      rising: "taurus",
      northNode: { sign: "pisces", house: 12 },
      southNode: { sign: "virgo", house: 6 },
    },
    dominantElement: "earth",
    underactiveElement: "fire",
    archetypes: ["Mystic Guide", "Earth Priestess", "Visionary Alchemist"],
    lifeStage: "Rite of Passage – Post A-Levels, preparing for college",
    personalityNotes: ["ADD", "Aspergers", "Creative", "Entrepreneurial"],
  };

  try {
    console.log("🌙 Generating Sacred Report for Noemi...");

    const reportOutput = await reportFlow.generateReport(noemiData);

    // Enhance with elemental rituals
    const enhancedReport = await reportFlow.enhanceWithRituals(
      reportOutput.report,
      { dominant: "earth", underactive: "fire" },
    );

    console.log("\n✧ ◈ ☽ REPORT PREVIEW ☽ ◈ ✧\n");

    // Display the Soul's Welcome Message
    if (enhancedReport.sections["souls-welcome-message"]) {
      console.log("💫 SOUL'S WELCOME MESSAGE:");
      console.log(
        enhancedReport.sections["souls-welcome-message"].substring(0, 500) +
          "...\n",
      );
    }

    // Display Archetypal Trinity
    if (enhancedReport.sections["archetypal-trinity"]) {
      console.log("🌟 ARCHETYPAL TRINITY:");
      console.log(
        enhancedReport.sections["archetypal-trinity"].substring(0, 500) +
          "...\n",
      );
    }

    return enhancedReport;
  } catch (error) {
    console.error("❌ Error generating Noemi report:", error);
    throw error;
  }
}

/**
 * Example 3: Generate report with custom archetypes and life stage
 */
async function generateCustomReport() {
  const reportFlow = new GenerateReportFlow();

  const customData: SpiralogicReportInput = {
    userId: "custom-example",
    name: "Sacred Seeker",
    birthDate: "1990-03-15",
    birthTime: "14:30",
    birthLocation: "San Francisco, USA",
    timezone: "America/Los_Angeles",
    chartData: {
      sun: { sign: "pisces", house: 10 },
      moon: { sign: "scorpio", house: 6 },
      rising: "cancer",
      northNode: { sign: "capricorn", house: 7 },
      southNode: { sign: "cancer", house: 1 },
    },
    dominantElement: "water",
    underactiveElement: "air",
    archetypes: ["Shadow Worker", "Dream Weaver", "Sacred Rebel"],
    lifeStage: "Saturn Return - Age 33, major life restructuring",
    personalityNotes: [
      "Intuitive",
      "Shadow Integration Focus",
      "Healing Journey",
    ],
  };

  try {
    const reportOutput = await reportFlow.generateReport(customData);

    console.log("🌊 Water-dominant report generated");
    console.log("🎭 Shadow archetypes integrated");
    console.log("🪐 Saturn Return guidance included");

    return reportOutput;
  } catch (error) {
    console.error("❌ Error generating custom report:", error);
    throw error;
  }
}

/**
 * Example 4: API Usage - Making HTTP requests
 */
async function apiExample() {
  // Example API calls (axios/fetch)

  // 1. Generate report for authenticated user
  const generateReport = async (authToken: string) => {
    const response = await fetch(
      "http://localhost:3000/api/spiralogic-report/generate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lifeStage: "Mid-life transformation",
          personalityNotes: ["Seeking purpose", "Creative awakening"],
        }),
      },
    );

    return await response.json();
  };

  // 2. Get report history
  const getReportHistory = async (authToken: string) => {
    const response = await fetch(
      "http://localhost:3000/api/spiralogic-report/history",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    return await response.json();
  };

  // 3. Generate sample report (no auth required)
  const generateSample = async () => {
    const response = await fetch(
      "http://localhost:3000/api/spiralogic-report/sample",
      {
        method: "POST",
      },
    );

    return await response.json();
  };

  console.log("📡 API endpoints configured for report generation");
}

/**
 * Main execution function
 */
async function main() {
  console.log("🌀 SPIRALOGIC REPORT GENERATOR EXAMPLES\n");

  // Run Example 2: Noemi's Report
  console.log("========== NOEMI REPORT ==========");
  await generateNoemiReport();

  // Uncomment to run other examples:
  // await generateUserReport('your-user-id');
  // await generateCustomReport();

  console.log("\n✨ Examples completed successfully!");
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  generateUserReport,
  generateNoemiReport,
  generateCustomReport,
  apiExample,
};
