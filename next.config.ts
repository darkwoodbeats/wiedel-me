import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Screenshots are captured locally into /public, so no remote patterns needed.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
