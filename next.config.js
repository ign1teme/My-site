/** @type {import('next').NextConfig} */
const nextConfig = {
  // Public pages remain prerendered; GitHub login needs server-side OAuth routes.
  outputFileTracingIncludes: { '/api/admin/config': ['./content/**/*'] },
  async redirects() {
    return [{ source: '/admin', destination: '/admin/index.html', permanent: false }];
  },
  async headers() {
    return [{ source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
