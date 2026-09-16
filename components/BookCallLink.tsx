import type { ReactNode } from "react";
import { bookingHref, calendlyUrl } from "@/lib/site";

/**
 * "Book a call" link. Opens Calendly in a new tab when NEXT_PUBLIC_CALENDLY_URL is
 * set; until then it falls back to the on-page contact form.
 */
export default function BookCallLink({ children, className }: { children: ReactNode; className?: string }) {
  const external = Boolean(calendlyUrl);
  return (
    <a
      href={bookingHref}
      className={className}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {children}
    </a>
  );
}
