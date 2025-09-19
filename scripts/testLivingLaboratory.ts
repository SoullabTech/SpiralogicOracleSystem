#!/usr/bin/env ts-node

/**
 * Living Laboratory Test Console
 * Real-time transformational conversation analysis and training
 */

import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator';
import { conversationAnalyzer } from '../lib/oracle/ConversationAnalyzer';
import * as readline from 'readline';

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  white: '\x1b[37m'
};

/**
 * Living Laboratory Session Manager
 */
class LivingLaboratorySession {
  private maya: MayaOrchestrator;
  private sessionStartTime: Date;
  private targetScenarios: string[] = [];

  constructor() {
    this.maya = new MayaOrchestrator();
    this.sessionStartTime = new Date();

    // Set development mode for live analysis
    process.env.NODE_ENV = 'development';
  }

  /**
   * Run a single conversation exchange with live analysis
   */
  async runExchange(input: string): Promise<void> {
    console.log(`\n${colors.bright}${colors.blue}You:${colors.reset} "${input}"`);

    // Get Maya's response
    const response = await this.maya.speak(input, 'laboratory-user');

    console.log(`${colors.bright}${colors.magenta}Maya:${colors.reset} "${response.message}"`);

    // Analysis happens automatically in MayaOrchestrator for dev mode
    // Additional insights
    this.displayAdditionalInsights();
  }

  /**
   * Display additional session insights
   */
  private displayAdditionalInsights(): void {
    const trends = conversationAnalyzer.getTrends(5);
    const latest = conversationAnalyzer.getLatestTurn();

    if (latest && conversationAnalyzer.getHistory().length >= 3) {
      console.log(`\n${colors.dim}🔬 Laboratory Insights:${colors.reset}`);

      // Session average
      console.log(`  Session Quality: ${(trends.averageScore * 100).toFixed(0)}%`);

      // Best/worst elements
      const elements = Object.entries(trends.elementalBalance);
      const best = elements.reduce((a, b) => a[1] > b[1] ? a : b);
      const weakest = elements.reduce((a, b) => a[1] < b[1] ? a : b);

      console.log(`  Strongest Element: ${colors.green}${best[0]} (${(best[1] * 100).toFixed(0)}%)${colors.reset}`);
      console.log(`  Growth Element: ${colors.yellow}${weakest[0]} (${(weakest[1] * 100).toFixed(0)}%)${colors.reset}`);
    }
  }

  /**
   * Run research scenario testing
   */
  async runResearchScenarios(): Promise<void> {
    console.log(`\n${colors.bright}${colors.magenta}🧪 RESEARCH SCENARIO TESTING${colors.reset}\n`);

    const scenarios = [
      {
        category: "🔥 Fire - Vision & Challenge",
        conversations: [
          "I want to start my own business but I'm terrified of failing",
          "I have this vision for my life but I keep procrastinating",
          "I feel like I'm playing it too safe in everything"
        ]
      },
      {
        category: "💧 Water - Shadow & Vulnerability",
        conversations: [
          "I feel like there's this darkness inside me that I can't face",
          "Part of me wants love but another part pushes people away",
          "I'm scared to let anyone see how broken I really am"
        ]
      },
      {
        category: "🌍 Earth - Overwhelm & Grounding",
        conversations: [
          "Everything feels like too much and I don't know where to start",
          "I have all these ideas but I can never make them real",
          "I keep starting things but never finishing them"
        ]
      },
      {
        category: "🌬️ Air - Patterns & Perspective",
        conversations: [
          "I keep ending up in the same toxic relationships",
          "I feel like I'm stuck in patterns I can't see clearly",
          "Why do I always sabotage myself when things go well?"
        ]
      },
      {
        category: "✨ Aether - Meaning & Integration",
        conversations: [
          "What's the point of any of this? I feel so lost",
          "I'm at a crossroads and don't know who I'm becoming",
          "How do I make sense of all these changes in my life?"
        ]
      }
    ];

    for (const scenario of scenarios) {
      console.log(`\n${colors.bright}${scenario.category}${colors.reset}`);
      console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);

      for (const conversation of scenario.conversations) {
        await this.runExchange(conversation);

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Scenario summary
      this.displayScenarioSummary(scenario.category);
    }

    // Overall research summary
    this.displayResearchSummary();
  }

  /**
   * Display summary for a scenario category
   */
  private displayScenarioSummary(category: string): void {
    const recent = conversationAnalyzer.getHistory().slice(-3);
    const avgScore = recent.reduce((sum, turn) => sum + turn.analysis.overall, 0) / recent.length;

    console.log(`\n${colors.dim}📊 ${category} Summary: ${(avgScore * 100).toFixed(0)}% average quality${colors.reset}`);
  }

  /**
   * Display comprehensive research summary
   */
  private displayResearchSummary(): void {
    const report = conversationAnalyzer.generateSessionReport();

    console.log(`\n${colors.bright}${colors.white}📋 RESEARCH SESSION COMPLETE${colors.reset}`);
    console.log(`${colors.dim}═══════════════════════════════════════════${colors.reset}`);

    // Convert markdown to console output
    const lines = report.split('\n');
    lines.forEach(line => {
      if (line.startsWith('# ')) {
        console.log(`${colors.bright}${colors.cyan}${line.substring(2)}${colors.reset}`);
      } else if (line.startsWith('## ')) {
        console.log(`\n${colors.bright}${line.substring(3)}${colors.reset}`);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        const content = line.substring(2, line.length - 2);
        console.log(`${colors.bright}${content}${colors.reset}`);
      } else if (line.trim()) {
        console.log(line);
      }
    });

    // Export data for research
    const exportData = conversationAnalyzer.exportForResearch();
    console.log(`\n${colors.yellow}📤 Research data exported: ${exportData.sessionId}${colors.reset}`);
  }

  /**
   * Interactive laboratory mode
   */
  async runInteractive(): Promise<void> {
    console.log(`\n${colors.bright}${colors.cyan}🔬 MAYA LIVING LABORATORY${colors.reset}`);
    console.log(`${colors.dim}Interactive transformational conversation research${colors.reset}`);
    console.log(`${colors.dim}Commands: 'research' (run scenarios), 'report' (session summary), 'export' (data), 'exit'${colors.reset}\n`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `${colors.cyan}Lab Input: ${colors.reset}`
    });

    rl.prompt();

    rl.on('line', async (input) => {
      const trimmed = input.trim().toLowerCase();

      if (trimmed === 'exit') {
        console.log(`\n${colors.dim}Laboratory session ended. Data preserved for analysis. 🧪${colors.reset}\n`);
        rl.close();
        process.exit(0);
      }

      if (trimmed === 'research') {
        await this.runResearchScenarios();
        rl.prompt();
        return;
      }

      if (trimmed === 'report') {
        this.displayResearchSummary();
        rl.prompt();
        return;
      }

      if (trimmed === 'export') {
        const data = conversationAnalyzer.exportForResearch();
        console.log(`\n${colors.green}📊 Research Data Exported:${colors.reset}`);
        console.log(JSON.stringify(data, null, 2));
        rl.prompt();
        return;
      }

      if (trimmed === 'clear') {
        conversationAnalyzer.clearHistory();
        console.log(`\n${colors.yellow}🧹 Laboratory data cleared${colors.reset}`);
        rl.prompt();
        return;
      }

      if (trimmed === 'trends') {
        const trends = conversationAnalyzer.getTrends();
        console.log(`\n${colors.magenta}📈 Current Trends:${colors.reset}`);
        console.log(`  Average Quality: ${(trends.averageScore * 100).toFixed(1)}%`);
        console.log(`  Consistency: ${(trends.consistencyScore * 100).toFixed(1)}%`);
        console.log(`  Transformational Markers: ${trends.transformationalMarkers}`);

        Object.entries(trends.elementalBalance).forEach(([element, score]) => {
          console.log(`  ${element}: ${(score * 100).toFixed(0)}%`);
        });

        rl.prompt();
        return;
      }

      // Regular conversation exchange
      await this.runExchange(input);
      rl.prompt();
    });

    rl.on('close', () => {
      this.displayResearchSummary();
    });
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const lab = new LivingLaboratorySession();

  if (args.length === 0) {
    // Interactive mode
    await lab.runInteractive();
  } else if (args[0] === '--research') {
    // Run research scenarios
    await lab.runResearchScenarios();
  } else if (args[0] === '--test') {
    // Test specific input
    const input = args.slice(1).join(' ');
    if (input) {
      await lab.runExchange(input);

      // Show final analysis
      const report = conversationAnalyzer.generateSessionReport();
      console.log(`\n${report}`);
    }
  } else {
    // Show help
    console.log(`\n${colors.bright}Maya Living Laboratory${colors.reset}`);
    console.log(`\nUsage:`);
    console.log(`  npx ts-node scripts/testLivingLaboratory.ts                    # Interactive mode`);
    console.log(`  npx ts-node scripts/testLivingLaboratory.ts --research         # Run research scenarios`);
    console.log(`  npx ts-node scripts/testLivingLaboratory.ts --test "message"   # Test specific input`);
    console.log(`\nInteractive Commands:`);
    console.log(`  research  - Run full research scenario suite`);
    console.log(`  report    - Display session summary`);
    console.log(`  export    - Export research data`);
    console.log(`  trends    - Show current trends`);
    console.log(`  clear     - Clear session data`);
    console.log(`  exit      - End session\n`);
  }
}

// Run the laboratory
main().catch(console.error);