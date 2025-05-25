/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // if you need environment vars in the browser:
  env: {
    CORS_ORIGIN: process.env.CORS_ORIGIN
  }
}
module.exports = nextConfig
