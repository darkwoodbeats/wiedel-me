"use client";

import { useEffect, useState, type ReactNode } from "react";
import styles from "./StickyHeader.module.css";

/**
 * A fixed copy of the site header. On the home page it slides in once the hero's own header has
 * scrolled out of view, so the navigation is always a tap away; pages without the hero pass
 * `always`. While hidden it is inert, so only one header is ever reachable.
 */
export function StickyHeader({ children, always = false }: { children: ReactNode; always?: boolean }) {
  const [heroHeaderGone, setHeroHeaderGone] = useState(false);

  useEffect(() => {
    if (always) return;
    const heroHeader = document.querySelector("[data-hero] header");
    if (!heroHeader) return;
    const observer = new IntersectionObserver(([entry]) =>
      setHeroHeaderGone(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(heroHeader);
    return () => observer.disconnect();
  }, [always]);

  const shown = always || heroHeaderGone;
  return (
    <div className={styles.bar} data-shown={shown} inert={!shown}>
      {children}
    </div>
  );
}
