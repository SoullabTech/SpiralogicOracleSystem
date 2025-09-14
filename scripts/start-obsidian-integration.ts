#!/usr/bin/env node

/**
 * Start Obsidian Vault Real-Time Integration
 * Watches your vault for changes and syncs with MAIA consciousness system
 */

import { ObsidianKnowledgeIntegration } from '../lib/obsidian-knowledge-integration';
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
║     Starting Obsidian Vault Real-Time Integration            ║
║     Connecting to MAIA Consciousness System                  ║
╚══════════════════════════════════════════════════════════════╝
`));

async function startIntegration() {
  try {
    // Display vault info
    console.log(chalk.yellow('📁 Vault Path:'), vaultConfig.vaultPath);
    console.log(chalk.yellow('📝 Total Notes:'), vaultConfig.totalNotes);
    console.log(chalk.yellow('🕐 Last Connected:'), vaultConfig.lastConnected);
    console.log('');

    // Initialize the integration
    console.log(chalk.cyan('🔄 Initializing Obsidian integration...'));
    const integration = new ObsidianKnowledgeIntegration(vaultConfig.vaultPath);

    await integration.initialize();

    // Get status
    const status = integration.getStatus();

    console.log(chalk.green.bold('\n✅ Integration Active!'));
    console.log(chalk.green('📊 Current Status:'));
    console.log(`  • Notes indexed: ${chalk.bold(status.totalNotes)}`);
    console.log(`  • Frameworks detected: ${chalk.bold(status.frameworks)}`);
    console.log(`  • Concepts mapped: ${chalk.bold(status.concepts)}`);
    console.log(`  • Relationships found: ${chalk.bold(status.relationships)}`);

    console.log(chalk.cyan('\n👁️ Monitoring vault for changes...'));
    console.log(chalk.gray('(Press Ctrl+C to stop)\n'));

    // Update vault config with new stats
    const updatedConfig = {
      ...vaultConfig,
      totalNotes: status.totalNotes,
      frameworks: status.frameworks,
      concepts: status.concepts,
      relationships: status.relationships,
      lastConnected: new Date().toISOString()
    };

    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));

    // Keep the process running
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n🛑 Stopping integration...'));
      integration.destroy();

      console.log(chalk.green('✅ Integration stopped cleanly'));
      console.log(chalk.gray('Your vault remains unchanged and ready for next connection\n'));
      process.exit(0);
    });

    // Log file changes as they happen
    setInterval(() => {
      const currentStatus = integration.getStatus();
      if (currentStatus.lastUpdated.getTime() > Date.now() - 5000) {
        console.log(chalk.blue(`[${new Date().toLocaleTimeString()}] Knowledge graph updated`));
      }
    }, 5000);

  } catch (error) {
    console.error(chalk.red('❌ Error starting integration:'), error);
    process.exit(1);
  }
}

// Start the integration
startIntegration();