// scripts/test-comprehensive-health.mjs
import http from "node:http";
import https from "node:https";

const environments = [
  { 
    name: "Local", 
    baseUrl: process.env.LOCAL_BASE ?? "http://localhost:3000",
    color: "\x1b[34m" // blue
  },
  { 
    name: "Preview", 
    baseUrl: process.env.PREVIEW_BASE ?? "https://<your-preview>.vercel.app",
    color: "\x1b[33m" // yellow
  },
  { 
    name: "Production", 
    baseUrl: process.env.PROD_BASE ?? "https://spiralogic-oracle-system.vercel.app",
    color: "\x1b[32m" // green
  },
];

const endpoints = [
  { path: "/api/health", name: "Main Health" },
  { path: "/api/health/events", name: "Events Health" },
  { path: "/api/health/providers", name: "Providers Health" },
  { path: "/metrics", name: "Metrics" },
];

function fetchUrl(url) {
  const lib = url.startsWith("https") ? https : http;
  const t0 = Date.now();
  return new Promise((resolve) => {
    const req = lib.get(url, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        let parsedBody;
        try {
          parsedBody = JSON.parse(body);
        } catch {
          // For metrics endpoint, show first few lines
          parsedBody = body.split('\n').slice(0, 3).join('\n');
          if (body.length > 200) parsedBody += '\n...';
        }
        
        resolve({
          status: res.statusCode,
          ms: Date.now() - t0,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          body: parsedBody,
          headers: res.headers
        });
      });
    });
    req.on("error", (err) => resolve({ 
      status: "ERR", 
      ms: Date.now() - t0, 
      ok: false, 
      body: err.message 
    }));
    req.setTimeout(10000, () => { 
      req.destroy(new Error("timeout")); 
    });
  });
}

console.log("🩺 Comprehensive Health Matrix\n");

for (const env of environments) {
  console.log(`${env.color}${env.name} Environment\x1b[0m`);
  console.log(`${env.color}${env.baseUrl}\x1b[0m`);
  console.log("─".repeat(60));
  
  for (const endpoint of endpoints) {
    const url = `${env.baseUrl}${endpoint.path}`;
    process.stdout.write(`  ${endpoint.name.padEnd(20)} `);
    
    // eslint-disable-next-line no-await-in-loop
    const result = await fetchUrl(url);
    
    if (result.ok) {
      console.log(`\x1b[32m✓ ${result.status}\x1b[0m (${result.ms}ms)`);
      
      // Show key info for health endpoints
      if (endpoint.path.includes('/health') && typeof result.body === 'object') {
        const status = result.body.status;
        if (status === 'healthy') {
          console.log(`    Status: \x1b[32m${status}\x1b[0m`);
        } else if (status === 'degraded') {
          console.log(`    Status: \x1b[33m${status}\x1b[0m`);
          if (result.body.errors) {
            console.log(`    Errors: ${result.body.errors.join(', ')}`);
          }
        }
      }
    } else if (result.status === 503) {
      console.log(`\x1b[33m⚠ ${result.status}\x1b[0m (${result.ms}ms)`);
      if (typeof result.body === 'object' && result.body.status) {
        console.log(`    Status: ${result.body.status}`);
      }
    } else {
      console.log(`\x1b[31m✗ ${result.status}\x1b[0m (${result.ms}ms)`);
      if (result.body && typeof result.body === 'string') {
        console.log(`    Error: ${result.body.slice(0, 100)}`);
      }
    }
  }
  console.log();
}

// Summary
console.log("📊 Quick Summary:");
console.log("✓ \x1b[32mHealthy\x1b[0m  ⚠ \x1b[33mDegraded\x1b[0m  ✗ \x1b[31mFailed\x1b[0m");