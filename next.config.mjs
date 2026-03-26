/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 output: 'export' 以支持 SSR 和 API routes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;