/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 静态导出，可部署到 GitHub Pages / Vercel
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
