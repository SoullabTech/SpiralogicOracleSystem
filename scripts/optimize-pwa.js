#!/usr/bin/env node

/**
 * PWA Optimization Script
 * Optimizes the build for Progressive Web App deployment
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', '.next');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_DIR = path.join(__dirname, '..', 'out');

console.log('🚀 Optimizing PWA build...');

// Create a _headers file for Vercel to serve proper headers
function createHeaders() {
  const headers = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin

/sw.js
  Cache-Control: max-age=0, no-cache, no-store, must-revalidate
  Service-Worker-Allowed: /

/manifest.json
  Cache-Control: max-age=86400, public
  Content-Type: application/manifest+json

/icons/*
  Cache-Control: max-age=31536000, immutable

/dashboard
  Cache-Control: max-age=3600, stale-while-revalidate=86400

/api/*
  Cache-Control: no-cache, no-store, must-revalidate
`;

  fs.writeFileSync(path.join(PUBLIC_DIR, '_headers'), headers);
  console.log('✅ Created _headers file');
}

// Create offline fallback page
function createOfflinePage() {
  const offlineHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maya - Offline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 400px;
    }
    .butterfly {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      opacity: 0.9;
    }
    p {
      opacity: 0.8;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .reconnect-btn {
      background: white;
      color: #667eea;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 2rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .reconnect-btn:hover {
      transform: scale(1.05);
    }
    .status {
      margin-top: 2rem;
      font-size: 0.875rem;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="butterfly">🦋</div>
    <h1>Maya is Resting</h1>
    <p>
      Your connection is temporarily offline.
      Maya's presence remains within you, even without a network connection.
    </p>
    <button class="reconnect-btn" onclick="window.location.reload()">
      Try Reconnecting
    </button>
    <div class="status">
      Last cached data will be shown when you reconnect
    </div>
  </div>
  <script>
    // Auto-retry connection every 30 seconds
    setInterval(() => {
      fetch('/api/health')
        .then(() => window.location.reload())
        .catch(() => console.log('Still offline'));
    }, 30000);

    // Listen for online event
    window.addEventListener('online', () => {
      window.location.reload();
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'offline.html'), offlineHTML);
  console.log('✅ Created offline.html');
}

// Optimize manifest.json
function optimizeManifest() {
  const manifestPath = path.join(PUBLIC_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Add additional PWA properties
  manifest['id'] = '/';
  manifest['lang'] = 'en';
  manifest['dir'] = 'ltr';
  manifest['iarc_rating_id'] = '';
  manifest['handle_links'] = 'preferred';
  manifest['launch_handler'] = {
    'client_mode': 'navigate-existing'
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Optimized manifest.json');
}

// Create meta tags component
function createMetaTags() {
  const metaTags = `// PWA Meta Tags Component
import Head from 'next/head';

export const PWAMetaTags = () => (
  <Head>
    <meta name="application-name" content="ARIA Maya Dashboard" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Maya" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#6366f1" />

    <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#6366f1" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="ARIA Maya Dashboard" />
    <meta name="twitter:description" content="Track Maya's unique emergence with you" />
    <meta name="twitter:image" content="/icons/icon-512x512.png" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="ARIA Maya Dashboard" />
    <meta property="og:description" content="Your evolving AI companion" />
    <meta property="og:site_name" content="ARIA Maya" />
    <meta property="og:image" content="/icons/icon-512x512.png" />
  </Head>
);`;

  const componentsDir = path.join(__dirname, '..', 'components');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  fs.writeFileSync(path.join(componentsDir, 'PWAMetaTags.tsx'), metaTags);
  console.log('✅ Created PWAMetaTags component');
}

// Create robots.txt
function createRobotsTxt() {
  const robots = `User-agent: *
Allow: /

# Dashboard pages
Allow: /dashboard
Allow: /dashboard/*

# API endpoints
Disallow: /api/*

# Sitemap
Sitemap: https://spiralogic-oracle.vercel.app/sitemap.xml
`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robots);
  console.log('✅ Created robots.txt');
}

// Main execution
async function main() {
  try {
    createHeaders();
    createOfflinePage();
    optimizeManifest();
    createMetaTags();
    createRobotsTxt();

    console.log('\n✨ PWA optimization complete!');
    console.log('📱 Your app is ready for installation as a PWA');
    console.log('🚀 Deploy with: npm run build && vercel --prod');
  } catch (error) {
    console.error('❌ Error during PWA optimization:', error);
    process.exit(1);
  }
}

main();