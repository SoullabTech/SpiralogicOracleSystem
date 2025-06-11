/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://oracle-backend-1.onrender.com',
  },
  images: {
    domains: ['oracle-backend-1.onrender.com'],
  }
}

module.exports = nextConfig