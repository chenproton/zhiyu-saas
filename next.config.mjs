/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  async rewrites() {
    const apiProxy = process.env.API_PROXY_URL || 'http://127.0.0.1:8080'
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxy}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
