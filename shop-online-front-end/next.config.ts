import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["shop-online-images.s3.ap-southeast-2.amazonaws.com"],
    // Hoặc sử dụng remotePatterns để cấu hình chi tiết hơn
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'shop-online-images.s3.ap-southeast-2.amazonaws.com',
    //     pathname: '/**',
    //   },
    // ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
