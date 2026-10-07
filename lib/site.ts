/** Canonical origin, used for metadata URLs and structured data. */
export const siteUrl = "https://wiedel.me";

export const siteName = "Wiedel.me";

export const linkedinUrl = "https://www.linkedin.com/in/cbwiedel";

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
