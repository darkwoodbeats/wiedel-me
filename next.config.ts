import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a plain static site to ./out — no Node process needed on the server.
  output: "export",
  images: {
    // The Next.js image optimizer needs a running server; a static export has
    // none, so images are served exactly as they sit in /public.
    unoptimized: true,
  },
  // Emits /path/index.html instead of /path.html, which Apache serves cleanly.
  trailingSlash: true,
};

export default nextConfig;
