/** Canonical origin — used for metadata URLs and structured data. */
export const siteUrl = "https://wiedel.me";

export const linkedinUrl = "https://www.linkedin.com/in/cbwiedel";

/**
 * Calendly scheduling link from .env.local. Undefined until it's set, so booking
 * buttons can fall back to the contact form instead of linking nowhere.
 */
export const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || undefined;

/** Primary "talk to me" destination: book a call if Calendly is set, otherwise the form. */
export const bookingHref = calendlyUrl ?? "/#contact";
