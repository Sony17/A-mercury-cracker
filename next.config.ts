import path from "node:path";
import type { NextConfig } from "next";
import { OPTIMIZED_IMAGE_HOSTS } from "./lib/productImages";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Images from anywhere else are served unoptimized by components/ui/SmartImage.
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
};

export default nextConfig;
