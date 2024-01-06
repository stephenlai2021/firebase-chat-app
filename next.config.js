/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'avataaars.io'],
    // remotePatterns: [     
    //   {
    //     protocol: 'https',
    //     hostname: 'firebasestorage.googleapis.com',
    //     port: '',
    //     // pathname: '/icon/free/**',
    //   },
    // ],
  },
}

module.exports = nextConfig
