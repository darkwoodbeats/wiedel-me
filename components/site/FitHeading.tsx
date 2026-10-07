"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A section heading that can fill its column (section.module.css, .fit). Its lines never wrap, so
 * its width in em is fixed by the copy and the font; this measures that and hands it to CSS as
 * --heading-ems, which sizes the heading to the column. It re-measures whenever the heading's box
 * changes, which catches the display font arriving; a resize leaves the ratio as it was.
 * Until it runs (and without JS), the heading keeps its usual size.
 */
export function FitHeading({
  id,
  className,
  children,
}: {
  id: string;
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const heading = ref.current;
    if (!heading) return;

    let ems = 0;
    const measure = () => {
      const width = heading.getBoundingClientRect().width;
      if (!width) return;
      const next = width / parseFloat(getComputedStyle(heading).fontSize);
      // Layout rounding moves the ratio a hair each time the size changes; ignoring that keeps
      // the update it causes from triggering another.
      if (Math.abs(next - ems) < 0.005) return;
      ems = next;
      heading.style.setProperty("--heading-ems", next.toFixed(3));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  return (
    <h2 ref={ref} id={id} className={className}>
      {children}
    </h2>
  );
}
