/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "font-src 'self' data: blob: https://fonts.gstatic.com https://fonts.googleapis.com *.vercel.com; default-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
