const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'avataaars.io'],
    // remotePatterns: [     
    //   {
    //     protocol: 'https',
    //     hostname: 'firebasestorage.googleapis.com',
    //   },
    // ],
  },
}

// module.exports = nextConfig
module.exports = withNextIntl(nextConfig);
