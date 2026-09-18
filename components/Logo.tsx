"use client";

import { useEffect, useRef } from "react";
import { createTimeline, stagger, svg } from "animejs";
import { logoPaths } from "@/lib/logo-paths";

/**
 * Wiedel.me wordmark, inlined from public/img/wiedel-me-logo.svg. The source file
 * is filled near-black for print/light backgrounds; here it takes currentColor so
 * it reads on the dark theme and follows hover colors.
 *
 * With `animated`, anime.js draws each letter's outline in sequence and then fades
 * the fill in behind it. The paths start stroked-but-unfilled only once JS has
 * taken over (see the effect below), so without JS — and with reduced motion — the
 * wordmark just renders solid.
 */
export default function Logo({ className, animated = false }: { className?: string; animated?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!animated || !root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const paths = Array.from(root.querySelectorAll<SVGPathElement>("path"));
    // Hidden fill + hairline stroke is the animation's starting frame, so it's set
    // here rather than in the markup: if this effect never runs, nothing hides.
    paths.forEach((path) => {
      path.style.fillOpacity = "0";
      path.style.stroke = "currentColor";
      path.style.strokeWidth = "0.6";
    });

    const drawables = svg.createDrawable(paths);
    const timeline = createTimeline({ defaults: { ease: "inOut(2)" } })
      .add(drawables, { draw: ["0 0", "0 1"], duration: 900 }, stagger(70))
      .add(paths, { fillOpacity: [0, 1], duration: 500 }, stagger(70, { start: 420 }))
      .add(paths, { strokeOpacity: [1, 0], duration: 400 }, "-=300");

    return () => {
      timeline.revert();
      // revert() restores anime's own properties; the starting frame is ours.
      paths.forEach((path) => path.removeAttribute("style"));
    };
  }, [animated]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 328.11 31.87"
      fill="currentColor"
      role="img"
      aria-label="Wiedel.me"
      className={className}
    >
      {logoPaths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
