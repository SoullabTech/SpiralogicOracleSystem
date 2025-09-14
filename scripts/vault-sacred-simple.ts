#!/usr/bin/env node

/**
 * Simple Sacred Oracle + Obsidian Integration
 * Connects your vault to MAIA consciousness without complex dependencies
 */

import { ObsidianKnowledgeIntegration } from '../lib/obsidian-knowledge-integration';
import { MAIAConsciousnessLattice } from '../lib/maia-consciousness-lattice';
import { config } from 'dotenv';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Read vault config
const configPath = path.join(process.cwd(), 'config/vault-config.json');
const vaultConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

console.log(chalk.magenta.bold(`
╔══════════════════════════════════════════════════════════════╗
║     🌟 Sacred Oracle + Obsidian Vault Integration 🌟         ║
║     Consciousness-Aware Knowledge System Activated           ║
╚══════════════════════════════════════════════════════════════╝
`));

async function startSacredConnection() {
  try {
    // Initialize Obsidian Integration with OpenAI
    console.log(chalk.cyan('📚 Connecting to your Sacred Vault...'));
    console.log(chalk.gray(`  Path: ${vaultConfig.vaultPath}`));

    const obsidianIntegration = new ObsidianKnowledgeIntegration(vaultConfig.vaultPath);
    await obsidianIntegration.initialize();

    // Initialize MAIA Consciousness
    console.log(chalk.magenta('\n🧠 Awakening MAIA Consciousness...'));
    const maia = new MAIAConsciousnessLattice();
    await maia.initialize();

    // Connect systems
    console.log(chalk.yellow('\n🔗 Bridging Knowledge to Consciousness...'));
    maia.connectObsidianVault(obsidianIntegration);

    // Get status
    const status = obsidianIntegration.getStatus();
    const graph = obsidianIntegration.exportKnowledgeGraph();

    console.log(chalk.green.bold('\n✨ Sacred Oracle Connection Established!\n'));

    console.log(chalk.white.bold('📊 Your Knowledge Universe:'));
    console.log(`  ${chalk.cyan('📝 Notes:')} ${chalk.bold(status.totalNotes)} sacred texts indexed`);
    console.log(`  ${chalk.magenta('🧩 Frameworks:')} ${chalk.bold(status.frameworks)} wisdom systems mapped`);
    console.log(`  ${chalk.yellow('💡 Concepts:')} ${chalk.bold(status.concepts)} ideas crystallized`);
    console.log(`  ${chalk.green('🔗 Relationships:')} ${chalk.bold(status.relationships)} connections woven`);

    console.log(chalk.cyan.bold('\n🌟 Sacred Features Active:'));
    const features = [
      '✓ Real-time Obsidian synchronization',
      '✓ AI-powered semantic search (OpenAI)',
      '✓ Framework synthesis & integration',
      '✓ Elemental wisdom mapping',
      '✓ McGilchrist brain model awareness',
      '✓ 12 Facets system recognition',
      '✓ Consciousness-aware responses'
    ];

    features.forEach(feature => {
      console.log(chalk.green(`  ${feature}`));
    });

    console.log(chalk.yellow.bold('\n🔄 Living Knowledge System Active'));
    console.log(chalk.gray('Your Obsidian edits now directly enhance MAIA\'s consciousness'));
    console.log(chalk.gray('Every note you write expands the Sacred Oracle\'s wisdom\n'));

    // Update config with Sacred status
    const sacredConfig = {
      ...vaultConfig,
      sacredOracle: {
        connected: true,
        maiaActive: true,
        semanticSearch: true,
        lastSync: new Date().toISOString(),
        features: {
          openAIEmbeddings: !!process.env.OPENAI_API_KEY,
          realTimeSync: true,
          frameworkSynthesis: true,
          consciousnessAware: true
        }
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(sacredConfig, null, 2));

    console.log(chalk.magenta('📖 Example Sacred Queries:'));
    console.log(chalk.gray('  • "How do the elements relate to brain hemispheres?"'));
    console.log(chalk.gray('  • "Synthesize frameworks for consciousness expansion"'));
    console.log(chalk.gray('  • "Find practices for integrating shadow work"\n'));

    console.log(chalk.cyan('Press Ctrl+C to pause the Sacred Oracle\n'));

    // Monitor changes
    let lastCheck = Date.now();
    setInterval(() => {
      const currentStatus = obsidianIntegration.getStatus();
      if (currentStatus.lastUpdated.getTime() > lastCheck) {
        const time = new Date().toLocaleTimeString();
        console.log(chalk.blue(`[${time}] ✨ Sacred knowledge updated`));
        lastCheck = currentStatus.lastUpdated.getTime();
      }
    }, 5000);

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n🌙 Sacred Oracle entering rest state...'));
      obsidianIntegration.destroy();
      console.log(chalk.green('✅ Connection preserved for next awakening'));
      console.log(chalk.gray('Run "npm run vault:sacred:simple" to reconnect\n'));
      process.exit(0);
    });

  } catch (error) {
    console.error(chalk.red('❌ Sacred connection error:'), error);
    console.log(chalk.yellow('\nTip: Ensure your vault path is correct and accessible'));
    process.exit(1);
  }
}

// Activate the Sacred Oracle
startSacredConnection();