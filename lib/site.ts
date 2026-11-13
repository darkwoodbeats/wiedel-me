/** Canonical origin, used for metadata URLs and structured data. */
export const siteUrl = "https://wiedel.me";

export const siteName = "Wiedel.me";

export const linkedinUrl = "https://www.linkedin.com/in/cbwiedel";

/**
 * Google Tag Manager container for wiedel.me. Tracking is configured inside it: version 1 (published
 * 2026-11-13) fires Google Analytics 4, measurement ID G-EF5ZCSPLR1. Add or change tags in Tag Manager,
 * not here, and don't also load GA4 directly or every page view counts twice. The ID is public (it
 * ships in every page). Empty leaves the tag off the site.
 */
export const gtmId = "GTM-57HQZP2N";

export interface NavLink {
  label: string;
  href: string;
}

/**
 * The primary navigation: the header links and the phone menu (MobileNav) both render it.
 * Root-relative, so the links also work from /music/.
 */
export const NAV_LINKS: readonly NavLink[] = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Contact", href: "/#contact" },
];

export const FOOTER_LINKS: readonly NavLink[] = [
  { label: "DJ & Music", href: "/music/" },
  { label: "LinkedIn", href: linkedinUrl },
];

/**
 * Calendly scheduling link from .env.local. Undefined until it's set, so booking links can
 * fall back to the contact form instead of linking nowhere.
 */
export const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || undefined;

/** Formspree endpoint from .env.local. The form stays disabled until it's a real form ID. */
export const formspreeEndpoint =
  process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ?? "https://formspree.io/f/YOUR_FORM_ID";

export const isFormspreeConfigured = !formspreeEndpoint.includes("YOUR_FORM_ID");
