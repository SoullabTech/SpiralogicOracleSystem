// ARIA Monitoring Server - Real-time Dashboard Backend
// Connects cascade metrics to dashboard via WebSocket

const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { ARIAIntegrationCascade, IntegrationCache } = require('./aria_integration_cascade');
const FieldProtectionSystem = require('./field_protection_system');
const RateLimiter = require('./rate_limiter');

class MonitoringServer {
  constructor(port = 8080) {
    this.port = port;
    this.clients = new Set();

    // Initialize cascade components
    this.initializeCascade();

    // Create HTTP server for dashboard
    this.httpServer = this.createHTTPServer();

    // Create WebSocket server for real-time updates
    this.wsServer = new WebSocket.Server({ server: this.httpServer });

    // Setup WebSocket handlers
    this.setupWebSocket();

    // Start metric broadcasting
    this.startMetricBroadcast();
  }

  initializeCascade() {
    // Create cascade components
    const fieldProtection = new FieldProtectionSystem();
    const rateLimiter = new RateLimiter();

    // Wrap protection with rate limiter
    const protectionWithRateLimit = {
      analyze: async (claim, context) => {
        const rateCheck = rateLimiter.checkRapidFire(
          context.userId || 'anonymous',
          claim
        );

        if (rateCheck.blocked) {
          return {
            threatDetected: true,
            threatType: 'rate_limit',
            confidence: 0,
            maxAllowedConfidence: 0,
            reason: rateCheck.reason
          };
        }

        const protection = fieldProtection.validateClaim(claim, context);

        return {
          threatDetected: protection.confidence < 0.2,
          threatType: protection.flags?.[0]?.type || null,
          confidence: protection.confidence,
          maxAllowedConfidence: protection.confidence * 1.2,
          sourceDiversity: protection.factors?.diversity || 0,
          dampening: protection.factors?.frequency || 0,
          category: context.category || 'general'
        };
      }
    };

    // Mock verifier for testing
    const mockVerifier = {
      verify: async (claim, context) => {
        // Simulate verification delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200));

        // Simple mock logic
        if (claim.toLowerCase().includes('verified')) {
          return {
            confidence: 0.95,
            sources: ['source1', 'source2', 'source3'],
            evidence: ['strong evidence']
          };
        }

        return {
          confidence: 0.3 + Math.random() * 0.5,
          sources: ['general_source'],
          evidence: []
        };
      }
    };

    // Create cache
    const cache = new IntegrationCache();

    // Create cascade
    this.cascade = new ARIAIntegrationCascade(
      protectionWithRateLimit,
      mockVerifier,
      cache,
      null // No audit logger for demo
    );

    // Listen to cascade events
    this.setupCascadeListeners();

    // Store component references
    this.fieldProtection = fieldProtection;
    this.rateLimiter = rateLimiter;
    this.cache = cache;
  }

  setupCascadeListeners() {
    // Listen for all cascade events
    this.cascade.on('claim_received', (data) => {
      this.broadcast({
        type: 'claim_received',
        data: {
          claim: data.claim.substring(0, 50) + '...',
          requestId: data.requestId,
          timestamp: Date.now()
        }
      });
    });

    this.cascade.on('cache_hit', (data) => {
      this.broadcast({
        type: 'cache_hit',
        data: {
          requestId: data.requestId,
          mode: data.cached.mode,
          timestamp: Date.now()
        }
      });
    });

    this.cascade.on('threat_detected', (data) => {
      this.broadcast({
        type: 'threat_detected',
        data: {
          threatType: data.protection.threatType,
          claim: data.claim.substring(0, 30) + '...',
          requestId: data.requestId,
          timestamp: Date.now()
        }
      });
    });

    this.cascade.on('claim_processed', (data) => {
      this.broadcast({
        type: 'claim_processed',
        data: {
          mode: data.result.mode,
          confidence: data.result.confidence,
          latency: data.result.latency,
          requestId: data.requestId,
          timestamp: Date.now()
        }
      });
    });

    this.cascade.on('processing_error', (data) => {
      this.broadcast({
        type: 'error',
        data: {
          error: data.error.message,
          claim: data.claim.substring(0, 30) + '...',
          timestamp: Date.now()
        }
      });
    });
  }

  createHTTPServer() {
    return http.createServer((req, res) => {
      if (req.url === '/' || req.url === '/dashboard') {
        // Serve dashboard HTML
        const dashboardPath = path.join(__dirname, 'monitoring_dashboard.html');
        fs.readFile(dashboardPath, 'utf8', (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading dashboard');
            return;
          }

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        });
      } else if (req.url === '/metrics') {
        // Serve current metrics as JSON
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.getFullMetrics()));
      } else if (req.url === '/test' && req.method === 'POST') {
        // Test endpoint to process claims
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { claim, context } = JSON.parse(body);
            const result = await this.cascade.processClaim(claim, context || {});

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
  }

  setupWebSocket() {
    this.wsServer.on('connection', (ws) => {
      console.log('Dashboard client connected');
      this.clients.add(ws);

      // Send initial metrics
      ws.send(JSON.stringify({
        type: 'initial_metrics',
        data: this.getFullMetrics()
      }));

      // Handle client disconnect
      ws.on('close', () => {
        console.log('Dashboard client disconnected');
        this.clients.delete(ws);
      });

      // Handle client messages (for testing)
      ws.on('message', async (message) => {
        try {
          const { action, payload } = JSON.parse(message);

          if (action === 'process_claim') {
            const result = await this.cascade.processClaim(
              payload.claim,
              payload.context || {}
            );

            ws.send(JSON.stringify({
              type: 'claim_result',
              data: result
            }));
          }
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            data: { error: error.message }
          }));
        }
      });
    });
  }

  startMetricBroadcast() {
    // Broadcast metrics every 2 seconds
    setInterval(() => {
      const metrics = this.getFullMetrics();
      const alerts = this.cascade.checkAlertThresholds();

      this.broadcast({
        type: 'metrics_update',
        data: {
          metrics,
          alerts,
          timestamp: Date.now()
        }
      });
    }, 2000);
  }

  getFullMetrics() {
    const cascadeMetrics = this.cascade.getMetrics();
    const cacheStats = this.cache.getStats();
    const fieldHealth = this.fieldProtection.getFieldHealth();
    const rateLimiterStatus = this.rateLimiter.getStatus();

    return {
      cascade: cascadeMetrics,
      cache: cacheStats,
      field: fieldHealth,
      rateLimiter: rateLimiterStatus,
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        connectedClients: this.clients.size
      }
    };
  }

  broadcast(message) {
    const data = JSON.stringify(message);

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  start() {
    this.httpServer.listen(this.port, () => {
      console.log(`
╔════════════════════════════════════════════╗
║     ARIA Monitoring Server Started         ║
╠════════════════════════════════════════════╣
║                                            ║
║  Dashboard:  http://localhost:${this.port}/       ║
║  Metrics:    http://localhost:${this.port}/metrics║
║  WebSocket:  ws://localhost:${this.port}         ║
║                                            ║
║  Status:     🟢 All systems operational    ║
║                                            ║
╚════════════════════════════════════════════╝

Press Ctrl+C to stop the server.
      `);

      // Run some test traffic
      this.runTestTraffic();
    });
  }

  async runTestTraffic() {
    // Simulate various claim patterns for dashboard testing
    const testClaims = [
      { claim: 'This is a verified fact', context: { category: 'general' }},
      { claim: 'Medical treatment advice', context: { category: 'medical' }},
      { claim: 'Creative story idea', context: { category: 'creative' }},
      { claim: 'The sky is green', context: { category: 'general' }},
      { claim: 'Sacred wisdom question', context: { category: 'sacred', sacredMode: true }}
    ];

    // Simulate normal traffic
    setInterval(async () => {
      const randomClaim = testClaims[Math.floor(Math.random() * testClaims.length)];
      await this.cascade.processClaim(randomClaim.claim, {
        ...randomClaim.context,
        userId: `user_${Math.floor(Math.random() * 10)}`
      });
    }, 3000);

    // Simulate occasional rapid fire attack
    setInterval(async () => {
      const attackerId = `attacker_${Math.floor(Math.random() * 3)}`;

      for (let i = 0; i < 10; i++) {
        await this.cascade.processClaim('Spam claim repeated', {
          userId: attackerId,
          category: 'general'
        });

        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }, 30000);

    // Simulate cache-friendly patterns
    setInterval(async () => {
      await this.cascade.processClaim('Common question about weather', {
        userId: 'regular_user',
        category: 'general'
      });
    }, 5000);
  }

  stop() {
    this.wsServer.close();
    this.httpServer.close();
    console.log('Server stopped');
  }
}

// Export and run
module.exports = MonitoringServer;

if (require.main === module) {
  const server = new MonitoringServer(8080);
  server.start();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    server.stop();
    process.exit(0);
  });
}