"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * The wordmark doubles as a back-to-top control on the home page, and a plain link home from
 * every other page (ported from wiedel.me).
 *
 * A link to "/" from "/" doesn't scroll anywhere, so on the home page this scrolls explicitly,
 * lands at the true top and leaves the URL clean: going home isn't a destination worth putting
 * in the address bar or the back stack. Link skips its own navigation when the click is
 * prevented, and the href stays, so it works without JS and for middle-click and assistive tech.
 */
export function BrandLink({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  const onHome = usePathname() === "/";
  return (
    <Link
      href="/"
      className={className}
      aria-label={label}
      onClick={(event) => {
        if (!onHome || event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        // "instant" jumps; "auto" would defer to the smooth scrolling set on <html>, the
        // opposite of what reduced motion asks for.
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }}
    >
      {children}
    </Link>
  );
}
