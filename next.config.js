/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' removed to enable API routes (webhooks, CSV import, etc.)
  // basePath removed - deploy on custom domain or Vercel instead of GitHub Pages
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'dimemtl.com',
      },
    ],
  },
}

module.exports = nextConfig
