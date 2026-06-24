import pwa from 'next-pwa'

const withPWA = pwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
  ],
  disable: process.env.NODE_ENV === 'development', // ⚠️ quan trọng
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: 'https', hostname: 'img.ophim.live' },
      { protocol: 'https', hostname: 'img.ophim.cc' },
      { protocol: 'https', hostname: 'img.ophim1.com' },
      { protocol: 'https', hostname: 'ophim1.com' },
      { protocol: 'https', hostname: 'ophim.cc' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'scontent.fhan15-2.fna.fbcdn.net' },
      { protocol: 'https', hostname: 'scontent.fhan15-1.fna.fbcdn.net' },
    ],
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
    scrollRestoration: true,
  },

  // Next.js headers config: CORS + Cache-Control for agent discovery endpoints
  async headers() {
    return [
      // Discovery endpoints: cache + CORS
      {
        source: '/.well-known/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
      // API status: no-store
      {
        source: '/api/status',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      // MCP endpoint: CORS for cross-origin agents
      {
        source: '/api/mcp',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, MCP-Session-Id' },
        ],
      },
    ]
  },
}

export default withPWA(nextConfig)
