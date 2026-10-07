import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// The static export (output: "export") only builds route handlers marked static; it writes out/robots.txt.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
