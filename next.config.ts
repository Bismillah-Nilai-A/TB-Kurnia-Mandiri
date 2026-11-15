import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "."),
      "@/lib": path.resolve(__dirname, "lib"),
      "@/types": path.resolve(__dirname, "types"),
      "@/components": path.resolve(__dirname, "components"),
      "@/components/ui": path.resolve(__dirname, "components/ui"),
    };
    return config;
  },
};

export default nextConfig;
