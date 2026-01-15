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
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'img.ophim.live' },
      { protocol: 'https', hostname: 'img.ophim1.com' },
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
}

export default withPWA(nextConfig)
