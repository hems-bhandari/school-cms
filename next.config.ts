import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Enable experimental features for better SEO and performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Enable static optimization
  output: 'standalone',
  // Compress responses
  compress: true,
  // Enable SWC minification
  swcMinify: true,
};

export default nextConfig;
