import type { Metadata, Viewport } from "next";
import { heroFontVariables } from "@/components/hero/fonts";
import { Footer } from "@/components/site/Footer";
import { siteName, siteUrl } from "@/lib/site";
import "./globals.css";

const description =
  "Caleb Wiedel: web design and development, graphic design, tech support, and DJ and music services for businesses and agencies in Lincoln, Omaha, and beyond.";

// wiedel.me's metadata, carried over. The icons come from app/icon.svg, app/apple-icon.png and
// app/favicon.ico; robots.txt and sitemap.xml from app/robots.ts and app/sitemap.ts.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wiedel.me — Web Development & Design | Lincoln & Omaha, NE",
    template: "%s | Wiedel.me",
  },
  description,
  authors: [{ name: "Caleb Wiedel" }],
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
  },
  // The large card, so X shows app/opengraph-image.jpg full width (it falls back to og:image).
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#030108",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={heroFontVariables}>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
