/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  swcMinify: true,

  async redirects() {
    return [
      // Redirect old /vehicles/make/:make to canonical /vehicles/brands/:make
      {
        source: '/vehicles/make/:make',
        destination: '/vehicles/brands/:make',
        permanent: true, // 301 redirect
      },
    ];
  },
}

module.exports = nextConfig
