#!/usr/bin/env node

/**
 * Sprint 1 Technical Debt Automation
 * Handles: Security patches, Jest config, ES modules, testing
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class Sprint1Automation {
  constructor() {
    this.results = {
      security: { status: 'pending', details: [] },
      jest: { status: 'pending', details: [] },
      modules: { status: 'pending', details: [] },
      testing: { status: 'pending', details: [] }
    };
    this.startTime = Date.now();
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCommand(command, description, options = {}) {
    await this.log(`Starting: ${description}`);
    
    return new Promise((resolve) => {
      exec(command, { cwd: process.cwd(), ...options }, (error, stdout, stderr) => {
        if (error) {
          this.log(`Failed: ${description} - ${error.message}`, 'error');
          resolve({ success: false, error: error.message, stdout, stderr });
        } else {
          this.log(`Complete: ${description}`, 'success');
          resolve({ success: true, stdout, stderr });
        }
      });
    });
  }

  async securityPatching() {
    await this.log('🔐 Starting Security Vulnerability Resolution...', 'info');
    
    try {
      // Run audit to get current state
      const auditResult = await this.runCommand('npm audit --json', 'Security audit scan');
      
      if (auditResult.success) {
        try {
          const auditData = JSON.parse(auditResult.stdout);
          const vulnCount = auditData.metadata?.vulnerabilities?.total || 0;
          this.results.security.details.push(`Found ${vulnCount} total vulnerabilities`);
          
          if (vulnCount > 0) {
            // Attempt automatic fixes
            const fixResult = await this.runCommand('npm audit fix', 'Automatic security fixes');
            this.results.security.details.push(`Auto-fix result: ${fixResult.success ? 'Success' : 'Failed'}`);
            
            // Force fixes for remaining issues
            const forceFixResult = await this.runCommand('npm audit fix --force', 'Force security fixes');
            this.results.security.details.push(`Force-fix result: ${forceFixResult.success ? 'Success' : 'Failed'}`);
            
            // Reinstall to ensure clean state
            await this.runCommand('npm install', 'Clean dependency reinstall');
          }
        } catch (parseError) {
          this.results.security.details.push('Could not parse audit results');
        }
      }
      
      // Final audit check
      const finalAudit = await this.runCommand('npm audit --json', 'Final security audit');
      if (finalAudit.success) {
        try {
          const finalData = JSON.parse(finalAudit.stdout);
          const remainingVulns = finalData.metadata?.vulnerabilities?.total || 0;
          this.results.security.details.push(`Remaining vulnerabilities: ${remainingVulns}`);
          this.results.security.status = remainingVulns === 0 ? 'complete' : 'partial';
        } catch {
          this.results.security.status = 'error';
        }
      } else {
        this.results.security.status = 'error';
      }
      
    } catch (error) {
      this.results.security.status = 'error';
      this.results.security.details.push(`Security patching failed: ${error.message}`);
    }
  }

  async fixJestConfiguration() {
    await this.log('🧪 Fixing Jest Configuration...', 'info');
    
    try {
      const backendPath = path.join(process.cwd(), 'backend');
      const jestConfigPath = path.join(backendPath, 'jest.config.js');
      
      // Modern Jest configuration for TypeScript
      const newJestConfig = `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true,
      useESM: false
    }]
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  verbose: true
};`;

      // Write new Jest config
      await fs.writeFile(jestConfigPath, newJestConfig);
      this.results.jest.details.push('Updated jest.config.js with modern TypeScript preset');
      
      // Update test setup file to fix TypeScript globals
      const setupPath = path.join(backendPath, 'tests', 'setup.ts');
      try {
        const setupContent = await fs.readFile(setupPath, 'utf8');
        
        // Add proper Jest imports at the top
        const updatedSetup = `import { jest } from '@jest/globals';

${setupContent}`;
        
        await fs.writeFile(setupPath, updatedSetup);
        this.results.jest.details.push('Updated test setup with proper Jest imports');
      } catch (setupError) {
        this.results.jest.details.push('Could not update test setup file - may not exist');
      }
      
      this.results.jest.status = 'complete';
      
    } catch (error) {
      this.results.jest.status = 'error';
      this.results.jest.details.push(`Jest configuration failed: ${error.message}`);
    }
  }

  async fixESModules() {
    await this.log('📦 Fixing ES Module Configuration...', 'info');
    
    try {
      const backendPath = path.join(process.cwd(), 'backend');
      const packageJsonPath = path.join(backendPath, 'package.json');
      
      // Read current package.json
      const packageContent = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      // Remove "type": "module" to use CommonJS for better compatibility
      if (packageJson.type === 'module') {
        delete packageJson.type;
        this.results.modules.details.push('Removed "type": "module" - switching to CommonJS');
      }
      
      // Update start script to use correct entry point
      if (packageJson.scripts.start === 'node dist/index.js') {
        packageJson.scripts.start = 'node dist/server.js';
        this.results.modules.details.push('Updated start script to use server.js entry point');
      }
      
      // Write updated package.json
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      // Update TypeScript config for CommonJS output
      const tsconfigPath = path.join(backendPath, 'tsconfig.json');
      try {
        const tsconfigContent = await fs.readFile(tsconfigPath, 'utf8');
        const tsconfig = JSON.parse(tsconfigContent);
        
        if (tsconfig.compilerOptions) {
          tsconfig.compilerOptions.module = 'CommonJS';
          tsconfig.compilerOptions.target = 'ES2020';
          tsconfig.compilerOptions.moduleResolution = 'node';
          
          await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
          this.results.modules.details.push('Updated TypeScript config for CommonJS');
        }
      } catch (tsconfigError) {
        this.results.modules.details.push('Could not update tsconfig.json');
      }
      
      this.results.modules.status = 'complete';
      
    } catch (error) {
      this.results.modules.status = 'error';
      this.results.modules.details.push(`ES Module fix failed: ${error.message}`);
    }
  }

  async runTests() {
    await this.log('🧪 Running Test Suite...', 'info');
    
    try {
      // Rebuild first
      const buildResult = await this.runCommand('npm run build', 'TypeScript compilation');
      
      if (buildResult.success) {
        this.results.testing.details.push('TypeScript build successful');
        
        // Try running tests
        const testResult = await this.runCommand('npm test', 'Jest test execution', { timeout: 120000 });
        
        if (testResult.success) {
          this.results.testing.details.push('All tests passed');
          this.results.testing.status = 'complete';
        } else {
          this.results.testing.details.push('Some tests failed - check configuration');
          this.results.testing.status = 'partial';
        }
      } else {
        this.results.testing.details.push('Build failed - tests cannot run');
        this.results.testing.status = 'error';
      }
      
    } catch (error) {
      this.results.testing.status = 'error';
      this.results.testing.details.push(`Testing failed: ${error.message}`);
    }
  }

  async updateTechnicalDebtTracker() {
    await this.log('📋 Updating Technical Debt Tracker...', 'info');
    
    try {
      const trackerPath = path.join(process.cwd(), 'docs', 'root', 'TECHNICAL_DEBT_TRACKER.md');
      const content = await fs.readFile(trackerPath, 'utf8');
      
      // Create sprint results section
      const sprintResults = `
## **Sprint 1 Results - ${new Date().toISOString().split('T')[0]}**

### Execution Summary
- **Duration:** ${Math.round((Date.now() - this.startTime) / 1000 / 60)} minutes
- **Security Patching:** ${this.results.security.status.toUpperCase()}
- **Jest Configuration:** ${this.results.jest.status.toUpperCase()}
- **ES Module Fix:** ${this.results.modules.status.toUpperCase()}
- **Testing:** ${this.results.testing.status.toUpperCase()}

### Detailed Results

#### Security Vulnerability Resolution ${this.results.security.status === 'complete' ? '✅' : this.results.security.status === 'partial' ? '⚠️' : '❌'}
${this.results.security.details.map(d => `- ${d}`).join('\\n')}

#### Jest Test Configuration ${this.results.jest.status === 'complete' ? '✅' : '❌'}
${this.results.jest.details.map(d => `- ${d}`).join('\\n')}

#### ES Module Server Fix ${this.results.modules.status === 'complete' ? '✅' : '❌'}
${this.results.modules.details.map(d => `- ${d}`).join('\\n')}

#### Testing Verification ${this.results.testing.status === 'complete' ? '✅' : this.results.testing.status === 'partial' ? '⚠️' : '❌'}
${this.results.testing.details.map(d => `- ${d}`).join('\\n')}

---
`;
      
      // Insert results after the overview section
      const updatedContent = content.replace(
        '## **🔴 High Priority (Sprint 1)**',
        sprintResults + '## **🔴 High Priority (Sprint 1)**'
      );
      
      await fs.writeFile(trackerPath, updatedContent);
      
    } catch (error) {
      await this.log(`Failed to update technical debt tracker: ${error.message}`, 'error');
    }
  }

  async run() {
    await this.log('🚀 Starting Sprint 1 Technical Debt Automation', 'info');
    
    // Execute all sprint tasks
    await this.securityPatching();
    await this.fixJestConfiguration();
    await this.fixESModules();
    await this.runTests();
    
    // Update documentation
    await this.updateTechnicalDebtTracker();
    
    // Final summary
    const totalTasks = Object.keys(this.results).length;
    const completedTasks = Object.values(this.results).filter(r => r.status === 'complete').length;
    const partialTasks = Object.values(this.results).filter(r => r.status === 'partial').length;
    
    await this.log(`\\n🎯 Sprint 1 Complete!`, 'info');
    await this.log(`✅ Completed: ${completedTasks}/${totalTasks}`, 'success');
    await this.log(`⚠️  Partial: ${partialTasks}/${totalTasks}`, partialTasks > 0 ? 'warning' : 'info');
    await this.log(`⏱️  Duration: ${Math.round((Date.now() - this.startTime) / 1000 / 60)} minutes`, 'info');
    
    if (completedTasks === totalTasks) {
      await this.log('🎉 All Sprint 1 objectives achieved!', 'success');
    } else {
      await this.log('📋 Some tasks need manual attention - check TECHNICAL_DEBT_TRACKER.md', 'warning');
    }
    
    return this.results;
  }
}

// Run if called directly
if (require.main === module) {
  const automation = new Sprint1Automation();
  automation.run().catch(console.error);
}

module.exports = Sprint1Automation;