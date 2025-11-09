/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '250mb', // Increased for large AAB files
    },
  },
};

export default nextConfig;

