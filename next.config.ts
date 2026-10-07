import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The same build as wiedel-me: a plain static site in ./out, which its GitHub Action rsyncs to
  // public_html on A Small Orange. No Node process runs on the server.
  output: "export",
  // Keeps wiedel.me's existing URLs (/music/, not /music), which search engines already index.
  // Also emits /music/index.html instead of /music.html, which Apache serves cleanly.
  trailingSlash: true,
  images: {
    // The image optimizer needs a running server and a static export has none, so images are
    // served exactly as they sit in /public.
    unoptimized: true,
  },
};

export default nextConfig;
