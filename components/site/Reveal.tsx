"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

/**
 * Fades content up as it scrolls into view (ported from wiedel.me). Elements are only hidden
 * once JS confirms the observer runs, so visitors without JS, and crawlers, see everything.
 * The transition itself lives in globals.css ([data-reveal]); reduced motion skips it.
 */
export function Reveal({
  children,
  className,
  as = "div",
  delay = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  /** Element to render. Defaults to a div. */
  as?: "div" | "li" | "figure";
  /** Stagger, in ms, so rows cascade instead of popping in at once. */
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.dataset.reveal = "hidden";
    if (delay) el.style.transitionDelay = `${delay}ms`;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "shown";
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  // The allowed tags take the same props here; typing the tag as one of them keeps JSX checkable.
  const Tag = as as "div";
  return (
    <Tag ref={ref as RefObject<HTMLDivElement>} className={className} id={id}>
      {children}
    </Tag>
  );
}
