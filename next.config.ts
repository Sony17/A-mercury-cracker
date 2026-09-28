import path from "node:path";
import type { NextConfig } from "next";
import { OPTIMIZED_IMAGE_HOSTS } from "./lib/productImages";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Every image is served straight from its src, bypassing /_next/image.
    //
    // The Vercel image optimizer on this project is out of quota: /_next/image
    // answers `402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED` for every request,
    // so each image routed through it rendered as a broken tile in production.
    // That hit exactly the images next/image was willing to optimize — the
    // self-hosted /api/product-image/<id> uploads and the Unsplash placeholders
    // — while the pasted supplier URLs, already served unoptimized, were fine.
    //
    // Nothing is lost by turning it off here: the stored uploads are already
    // WebP at 60–180 KB, and the Unsplash URLs carry their own ?w= and ?q=.
    // Remove this if the project moves to a plan with optimization included.
    unoptimized: true,
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
};

export default nextConfig;
