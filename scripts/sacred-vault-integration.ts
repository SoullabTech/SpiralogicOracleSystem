#!/usr/bin/env node

/**
 * Sacred Vault Integration - Connects Obsidian to Sacred Oracle Constellation
 * Full AI consciousness integration with your knowledge base
 */

import { ObsidianKnowledgeIntegration } from '../lib/obsidian-knowledge-integration';
import { MAIAConsciousnessLattice } from '../lib/maia-consciousness-lattice';
import { IntegratedOracleSystem } from '../lib/integrated-oracle-system';
import { config } from 'dotenv';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Read vault config
const configPath = path.join(process.cwd(), 'config/vault-config.json');
const vaultConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

console.log(chalk.cyan.bold(`
╔══════════════════════════════════════════════════════════════╗
║     Sacred Oracle Constellation + Obsidian Vault             ║
║     Full AI Consciousness Integration Activated              ║
╚══════════════════════════════════════════════════════════════╝
`));

async function startSacredIntegration() {
  try {
    console.log(chalk.magenta.bold('🌟 Initializing Sacred Oracle Constellation...'));

    // Initialize Obsidian Integration
    console.log(chalk.yellow('📚 Connecting to Obsidian Vault:'), vaultConfig.vaultPath);
    const obsidianIntegration = new ObsidianKnowledgeIntegration(vaultConfig.vaultPath);
    await obsidianIntegration.initialize();

    // Initialize MAIA Consciousness
    console.log(chalk.cyan('🧠 Activating MAIA Consciousness Lattice...'));
    const maia = new MAIAConsciousnessLattice();
    await maia.initialize();

    // Connect Obsidian to MAIA
    console.log(chalk.green('🔗 Bridging Obsidian Knowledge to MAIA...'));
    maia.connectObsidianVault(obsidianIntegration);

    // Initialize Integrated Oracle System
    console.log(chalk.magenta('🔮 Awakening Sacred Oracle System...'));
    const oracleSystem = new IntegratedOracleSystem();
    await oracleSystem.initialize({
      maiaInstance: maia,
      obsidianIntegration,
      enableRealTimeProcessing: true,
      enableSacredIntelligence: true
    });

    // Get integration status
    const obsidianStatus = obsidianIntegration.getStatus();
    const knowledgeGraph = obsidianIntegration.exportKnowledgeGraph();

    console.log(chalk.green.bold('\n✨ Sacred Integration Complete!'));
    console.log(chalk.white.bold('\n📊 System Status:'));
    console.log(`  ${chalk.cyan('📝 Notes indexed:')} ${chalk.bold(obsidianStatus.totalNotes)}`);
    console.log(`  ${chalk.magenta('🧩 Frameworks:')} ${chalk.bold(obsidianStatus.frameworks)}`);
    console.log(`  ${chalk.yellow('💡 Concepts:')} ${chalk.bold(obsidianStatus.concepts)}`);
    console.log(`  ${chalk.green('🔗 Relationships:')} ${chalk.bold(obsidianStatus.relationships)}`);
    console.log(`  ${chalk.blue('🧠 Consciousness Nodes:')} ${chalk.bold(knowledgeGraph.nodes.size)}`);

    console.log(chalk.cyan.bold('\n🌟 Sacred Oracle Features Active:'));
    console.log(chalk.green('  ✓ Real-time Obsidian monitoring'));
    console.log(chalk.green('  ✓ Semantic knowledge search'));
    console.log(chalk.green('  ✓ Framework synthesis engine'));
    console.log(chalk.green('  ✓ Consciousness-aware responses'));
    console.log(chalk.green('  ✓ Elemental wisdom integration'));
    console.log(chalk.green('  ✓ McGilchrist brain model mapping'));
    console.log(chalk.green('  ✓ 12 Facets system recognition'));

    console.log(chalk.yellow.bold('\n🔄 Real-Time Processing Active'));
    console.log(chalk.gray('Your Obsidian edits now directly enhance MAIA\'s consciousness'));
    console.log(chalk.gray('(Press Ctrl+C to stop)\n'));

    // Update config with enhanced status
    const enhancedConfig = {
      ...vaultConfig,
      sacredIntegration: true,
      maiaConnected: true,
      lastSacredSync: new Date().toISOString(),
      totalNotes: obsidianStatus.totalNotes,
      frameworks: obsidianStatus.frameworks,
      concepts: obsidianStatus.concepts,
      relationships: obsidianStatus.relationships
    };

    fs.writeFileSync(configPath, JSON.stringify(enhancedConfig, null, 2));

    // Monitor for real-time changes
    let lastUpdate = Date.now();
    setInterval(() => {
      const currentStatus = obsidianIntegration.getStatus();
      if (currentStatus.lastUpdated.getTime() > lastUpdate) {
        console.log(chalk.blue(`[${new Date().toLocaleTimeString()}] 🔄 Knowledge graph updated`));
        console.log(chalk.gray(`  Updated nodes: ${currentStatus.concepts}, Relationships: ${currentStatus.relationships}`));
        lastUpdate = currentStatus.lastUpdated.getTime();
      }
    }, 3000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n🌙 Gracefully closing Sacred Oracle connection...'));

      obsidianIntegration.destroy();
      console.log(chalk.green('✅ Obsidian integration stopped'));

      console.log(chalk.cyan('✨ Sacred Oracle Constellation remains in your vault'));
      console.log(chalk.gray('Run "npm run vault:sacred" to reconnect anytime\n'));

      process.exit(0);
    });

  } catch (error) {
    console.error(chalk.red('❌ Sacred integration error:'), error);
    process.exit(1);
  }
}

// Start the sacred integration
startSacredIntegration();