/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://oracle-backend-1.onrender.com',
  },
  images: {
    domains: ['oracle-backend-1.onrender.com'],
  },
  // Optimize for Vercel deployment
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Ensure CSS is processed correctly
  experimental: {
    optimizeCss: true,
  },
  // Handle trailing slashes consistently
  trailingSlash: false,
  // Optimize production builds
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig