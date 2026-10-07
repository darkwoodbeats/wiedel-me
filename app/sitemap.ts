import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// The static export (output: "export") only builds route handlers marked static; it writes out/sitemap.xml.
export const dynamic = "force-static";

// Trailing slashes match next.config.ts (trailingSlash) and the URLs wiedel.me already has indexed.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/music/`, changeFrequency: "yearly", priority: 0.6 },
  ];
}
