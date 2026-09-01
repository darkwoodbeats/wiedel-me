"use client";

import type { ReactNode } from "react";

/**
 * The wordmark doubles as a back-to-top control.
 *
 * A plain <Link href="#top"> only works once: after the first click the URL
 * already ends in #top, so the router sees no change and nothing scrolls. This
 * scrolls explicitly on every click, lands at true top rather than #top's
 * position under the sticky header, and leaves the URL clean — going home isn't
 * a destination worth putting in the address bar or the back stack.
 *
 * The href is kept so the link still works without JS and behaves like a real
 * link for middle-click and assistive tech.
 */
export default function BrandLink({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <a
      href="#top"
      className={className}
      onClick={(event) => {
        event.preventDefault();
        // "instant" jumps; "auto" would defer to the CSS scroll-behavior: smooth
        // on <html>, which is the opposite of what reduced motion asks for.
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }}
    >
      {children}
    </a>
  );
}
