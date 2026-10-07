import type { ReactNode } from "react";
import { calendlyUrl } from "@/lib/site";
import s from "./section.module.css";

/**
 * "Book a call" link (ported from wiedel.me). It opens Calendly in a new tab when
 * NEXT_PUBLIC_CALENDLY_URL is set; until then it falls back to the on-page contact form.
 */
export function BookCallLink({
  children,
  className,
  fallbackHref = "#contact",
}: {
  children: ReactNode;
  className?: string;
  fallbackHref?: string;
}) {
  if (!calendlyUrl) {
    return (
      <a href={fallbackHref} className={className}>
        {children}
      </a>
    );
  }
  return (
    <a href={calendlyUrl} className={className} target="_blank" rel="noopener noreferrer">
      {children}
      <span className={s.srOnly}> (opens Calendly in a new tab)</span>
    </a>
  );
}
