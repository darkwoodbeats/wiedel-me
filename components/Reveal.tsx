"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  /** Stagger the transition so grids cascade instead of popping in at once. */
  delay?: number;
};

/**
 * Fades content up as it scrolls into view — the vanilla IntersectionObserver
 * from the old index.html, scoped to a component.
 *
 * Elements start hidden only after JS confirms observer support, so users
 * without JS (and crawlers) still see fully rendered content.
 */
export default function Reveal({ children, className = "", as: Tag = "div", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    el.classList.add("reveal-init");
    if (delay) el.style.transitionDelay = `${delay}ms`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          target.style.opacity = "1";
          target.style.transform = "none";
          observer.unobserve(target);
        });
      },
      { threshold: 0.12 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
