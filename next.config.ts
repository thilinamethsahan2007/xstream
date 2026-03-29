import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/telegram/:path*',
        destination: 'http://79.72.89.197:8000/:path*',
      },
    ];
  },
};

export default nextConfig;
