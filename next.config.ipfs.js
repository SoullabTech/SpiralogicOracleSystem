/** @type {import('next').NextConfig} */

const nextConfig = {
  // IPFS static export configuration
  output: "export",

  // Remove trailing slashes for IPFS compatibility
  trailingSlash: false,

  // Asset prefix for IPFS gateway
  assetPrefix: process.env.NEXT_PUBLIC_IPFS_BUILD ? "./" : "",

  // Image optimization for static export
  images: {
    unoptimized: true,
    loader: "custom",
    loaderFile: "./lib/ipfs-image-loader.js",
  },

  // Environment variables for IPFS build
  env: {
    NEXT_PUBLIC_IPFS_GATEWAY:
      process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud",
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "https://api.spiralogic.ai",
    NEXT_PUBLIC_SOVEREIGN_MODE: "true",
  },

  // Webpack configuration for IPFS
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace node modules with browser-compatible versions
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
      };

      // Add plugins for browser compatibility
      config.plugins.push(
        new (require("webpack").ProvidePlugin)({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        }),
      );
    }

    // Support for WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },

  // Headers for IPFS gateway
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-IPFS-Path",
            value: "/:path*",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },

  // Redirects for IPFS
  async redirects() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
