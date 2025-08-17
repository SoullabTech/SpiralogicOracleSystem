// next.config.js
const DEPLOY_TARGET = process.env.DEPLOY_TARGET || "local"; // local | vercel | render | ipfs
const IS_DEV = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const base = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Keep dev simple; enable prod-only opts below
    optimizeCss: true,
  },
  // Never rely on process.env in Client unless prefixed NEXT_PUBLIC_
  env: {
    NEXT_PUBLIC_DEPLOY_TARGET: DEPLOY_TARGET,
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://oracle-backend-1.onrender.com",
    FIRE_AGENT_ENDPOINT:
      process.env.FIRE_AGENT_ENDPOINT || "http://localhost:3001",
    WATER_AGENT_ENDPOINT:
      process.env.WATER_AGENT_ENDPOINT || "http://localhost:3002",
    EARTH_AGENT_ENDPOINT:
      process.env.EARTH_AGENT_ENDPOINT || "http://localhost:3003",
    AIR_AGENT_ENDPOINT:
      process.env.AIR_AGENT_ENDPOINT || "http://localhost:3004",
    AETHER_AGENT_ENDPOINT:
      process.env.AETHER_AGENT_ENDPOINT || "http://localhost:3005",
  },
  images: {
    domains: ["oracle-backend-1.onrender.com"],
  },
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
};

const targets = {
  local: {
    ...base,
    output: undefined,         // no standalone in dev; avoids fs/URL edge cases
    basePath: undefined,       // no base path in dev
    assetPrefix: undefined,    // no CDN assumptions in dev
  },
  vercel: {
    ...base,
    output: "standalone",
  },
  render: {
    ...base,
    output: "standalone",
  },
  ipfs: {
    ...base,
    // Static export only when explicitly asked for IPFS
    output: "export",
    trailingSlash: true,
    basePath: "",              // ensure your links are relative-safe
    images: { unoptimized: true },
    assetPrefix: "./",
    distDir: "dist",
  },
};

const config = targets[DEPLOY_TARGET] || targets.local;

// Small guard so dev always stays dev-like even if someone sets weird envs
if (IS_DEV) {
  config.output = undefined;
  config.basePath = undefined;
  config.assetPrefix = undefined;
}

module.exports = config;