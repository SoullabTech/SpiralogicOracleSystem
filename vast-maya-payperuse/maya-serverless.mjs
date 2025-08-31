#!/usr/bin/env node
/**
 * Maya Voice Serverless Handler
 * Auto-starts Vast.ai instances on demand, stops when idle
 * Deploy on Vercel/Netlify/Cloudflare Workers for true serverless GPU
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration from environment
const {
  VAST_API_KEY,
  OFFER_ID = "25474740",    // RTX 5070 by default ($0.098/hr)
  IMAGE = "soullab1/voice-agent:latest",
  MAX_PRICE = "0.50",       // Safety ceiling
  PORT = "3000",
  HF_TOKEN
} = process.env;

const API_BASE = "https://vast.ai/api/v0";
const INSTANCE_FILE = path.join(__dirname, '.vast_instance_id');
const ENDPOINT_FILE = path.join(__dirname, '.maya_endpoint');

class MayaServerless {
  constructor() {
    this.validateConfig();
  }

  validateConfig() {
    if (!VAST_API_KEY) {
      throw new Error('VAST_API_KEY required');
    }
    if (!HF_TOKEN) {
      throw new Error('HF_TOKEN required for Hugging Face model access');
    }
  }

  async getInstanceStatus(instanceId) {
    try {
      const response = await fetch(`${API_BASE}/instances/${instanceId}`, {
        headers: { 'Authorization': `Bearer ${VAST_API_KEY}` }
      });
      
      if (!response.ok) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error checking instance ${instanceId}:`, error.message);
      return null;
    }
  }

  async getCurrentInstance() {
    if (!fs.existsSync(INSTANCE_FILE)) {
      return null;
    }

    const instanceId = fs.readFileSync(INSTANCE_FILE, 'utf8').trim();
    if (!instanceId) {
      return null;
    }

    const status = await this.getInstanceStatus(instanceId);
    
    if (status && status.state_str === 'running') {
      return {
        instanceId,
        publicIp: status.public_ipaddr,
        endpoint: `http://${status.public_ipaddr}:${PORT}`,
        cost: status.dph_base,
        uptime: status.create_time ? (Date.now() / 1000 - status.create_time) / 3600 : 0
      };
    }

    // Clean up stale instance file
    this.cleanupStateFiles();
    return null;
  }

  async testMayaEndpoint(endpoint) {
    try {
      const response = await fetch(`${endpoint}/health`, { 
        timeout: 5000 
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async startNewInstance() {
    console.log('🚀 Starting new Maya instance...');
    
    return new Promise((resolve, reject) => {
      const startScript = path.join(__dirname, 'start_instance.sh');
      
      // Set environment for the script
      const env = {
        ...process.env,
        VAST_API_KEY,
        OFFER_ID,
        IMAGE,
        MAX_PRICE,
        PORT,
        HF_TOKEN
      };

      const child = spawn('bash', [startScript], {
        stdio: 'pipe',
        cwd: __dirname,
        env
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
        console.log(data.toString().trim());
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(data.toString().trim());
      });

      child.on('close', (code) => {
        if (code === 0) {
          // Read the endpoint from file
          try {
            const endpoint = fs.readFileSync(ENDPOINT_FILE, 'utf8').trim();
            const instanceId = fs.readFileSync(INSTANCE_FILE, 'utf8').trim();
            const publicIp = fs.readFileSync(path.join(__dirname, '.vast_public_ip'), 'utf8').trim();
            
            resolve({
              instanceId,
              publicIp,
              endpoint,
              status: 'starting',
              output
            });
          } catch (error) {
            reject(new Error(`Instance started but couldn't read state files: ${error.message}`));
          }
        } else {
          reject(new Error(`Start script failed with code ${code}: ${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to spawn start script: ${error.message}`));
      });
    });
  }

  async stopInstance() {
    console.log('🛑 Stopping Maya instance...');
    
    return new Promise((resolve, reject) => {
      const stopScript = path.join(__dirname, 'stop_instance.sh');
      
      const child = spawn('bash', [stopScript], {
        stdio: 'pipe',
        cwd: __dirname,
        env: { ...process.env, VAST_API_KEY }
      });

      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
        console.log(data.toString().trim());
      });

      child.stderr.on('data', (data) => {
        console.error(data.toString().trim());
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.cleanupStateFiles();
          resolve({ stopped: true, output });
        } else {
          reject(new Error(`Stop script failed with code ${code}`));
        }
      });
    });
  }

  cleanupStateFiles() {
    const files = [INSTANCE_FILE, ENDPOINT_FILE, path.join(__dirname, '.vast_public_ip')];
    files.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (error) {
        console.warn(`Failed to remove ${file}:`, error.message);
      }
    });
  }

  async ensureMayaAvailable() {
    // Check if we have a running instance
    let instance = await this.getCurrentInstance();
    
    if (instance) {
      // Test if Maya is actually responding
      const isHealthy = await this.testMayaEndpoint(instance.endpoint);
      
      if (isHealthy) {
        console.log(`✅ Maya already running: ${instance.endpoint}`);
        return instance;
      } else {
        console.log('⚠️  Instance running but Maya not responding, restarting...');
        await this.stopInstance();
        instance = null;
      }
    }

    // Start new instance
    if (!instance) {
      instance = await this.startNewInstance();
      
      // Wait for Maya to be ready (with timeout)
      console.log('⏳ Waiting for Maya to be ready...');
      const maxWait = 180; // 3 minutes
      const interval = 5;
      let elapsed = 0;
      
      while (elapsed < maxWait) {
        const isReady = await this.testMayaEndpoint(instance.endpoint);
        if (isReady) {
          console.log(`✅ Maya is ready: ${instance.endpoint}`);
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
        elapsed += interval;
        
        if (elapsed >= maxWait) {
          throw new Error('Maya failed to become ready within timeout');
        }
      }
    }

    return instance;
  }

  // Express/Vercel handler
  async handler(req, res) {
    const { method, url } = req;
    const urlPath = new URL(url, `http://${req.headers.host || 'localhost'}`).pathname;

    try {
      switch (urlPath) {
        case '/start-maya':
          if (method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
          }
          
          const instance = await this.ensureMayaAvailable();
          return res.json({
            success: true,
            endpoint: instance.endpoint,
            instanceId: instance.instanceId,
            status: 'ready',
            message: 'Maya is ready for voice synthesis'
          });

        case '/stop-maya':
          if (method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
          }
          
          await this.stopInstance();
          return res.json({
            success: true,
            message: 'Maya instance stopped, billing halted'
          });

        case '/maya-status':
          const current = await this.getCurrentInstance();
          if (current) {
            const isHealthy = await this.testMayaEndpoint(current.endpoint);
            return res.json({
              active: true,
              healthy: isHealthy,
              endpoint: current.endpoint,
              instanceId: current.instanceId,
              cost: `$${current.cost}/hr`,
              uptime: `${current.uptime.toFixed(2)}h`
            });
          } else {
            return res.json({
              active: false,
              message: 'No active Maya instance'
            });
          }

        case '/health':
          return res.json({
            service: 'Maya Serverless Controller',
            status: 'healthy',
            timestamp: new Date().toISOString()
          });

        default:
          return res.status(404).json({ 
            error: 'Not found',
            endpoints: ['/start-maya', '/stop-maya', '/maya-status', '/health']
          });
      }
    } catch (error) {
      console.error('Handler error:', error);
      return res.status(500).json({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const maya = new MayaServerless();
  const command = process.argv[2];

  switch (command) {
    case 'start':
      maya.ensureMayaAvailable()
        .then(instance => {
          console.log(`\n✅ Maya ready: ${instance.endpoint}`);
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Failed:', error.message);
          process.exit(1);
        });
      break;

    case 'stop':
      maya.stopInstance()
        .then(() => {
          console.log('\n✅ Maya stopped');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Failed:', error.message);
          process.exit(1);
        });
      break;

    case 'status':
      maya.getCurrentInstance()
        .then(async instance => {
          if (instance) {
            const healthy = await maya.testMayaEndpoint(instance.endpoint);
            console.log(`Status: ${healthy ? 'Healthy' : 'Unhealthy'}`);
            console.log(`Endpoint: ${instance.endpoint}`);
            console.log(`Cost: $${instance.cost}/hr`);
            console.log(`Uptime: ${instance.uptime.toFixed(2)}h`);
          } else {
            console.log('Status: No active instance');
          }
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Failed:', error.message);
          process.exit(1);
        });
      break;

    default:
      console.log(`
🔮 Maya Voice Serverless Controller

Usage:
  node maya-serverless.mjs start    # Start Maya on-demand
  node maya-serverless.mjs stop     # Stop Maya and halt billing  
  node maya-serverless.mjs status   # Check current status

Environment variables:
  VAST_API_KEY     # Your Vast.ai API key (required)
  HF_TOKEN         # Hugging Face token (required)
  OFFER_ID         # Vast.ai offer ID (default: RTX 5070)
  MAX_PRICE        # Price ceiling per hour (default: $0.50)

Cost estimates:
  RTX 5070: $0.098/hr (~$2.35/day)
  RTX 4090: $0.40/hr (~$9.60/day)
  H100:     $1.87/hr (~$45/day)
      `);
      process.exit(1);
  }
}

export default MayaServerless;