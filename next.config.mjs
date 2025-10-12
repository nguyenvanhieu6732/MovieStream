/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.ophim.live',
      },
      {
        protocol: 'https',
        hostname: 'img.ophim1.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // ✅ Thêm ảnh Google
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // ✅ Nếu dùng Cloudinary sau này
      },
      {
        protocol: 'https',
        hostname: 'scontent.fhan15-2.fna.fbcdn.net', // ✅ Thêm ảnh Facebook
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
    scrollRestoration: true,
  },
}

export default nextConfig
