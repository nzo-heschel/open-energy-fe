/** @type {import('next').NextConfig} */
const nextConfig = {
  // `output: 'export'` removes API routes — use a Node host (e.g. Vercel) so `/api/*` exists in production.
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  webpack: (config) => {
    config.cache = false;
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com']
  },
};

module.exports = nextConfig;
