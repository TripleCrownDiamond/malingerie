import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "build.lewisnote.com",
      },
      {
        protocol: "https",
        hostname: "cdn.openai.com",
      },
      {
        protocol: "https",
        hostname: "www.espaceplaisir.fr",
      },
      {
        protocol: "https",
        hostname: "espaceplaisir.fr",
      },
      {
        protocol: "https",
        hostname: "www.maisonlejaby.com",
      },
      {
        protocol: "https",
        hostname: "maisonlejaby.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
};

export default nextConfig;