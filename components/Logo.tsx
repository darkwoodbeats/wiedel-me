"use client";

import { useEffect, useRef } from "react";
import { createTimeline, spring, stagger, svg } from "animejs";
import { logoDotPath, logoPaths, markPolygons, markViewBox } from "@/lib/logo-paths";

type LogoProps = {
  /** Sets the lockup's height; both marks size themselves from it. */
  className?: string;
  /** Show the "W" mark to the left of the wordmark. */
  mark?: boolean;
  /** Play the intro animation once on mount. */
  animated?: boolean;
};

/**
 * Wiedel.me lockup, inlined from public/img/wiedel-me-logo.svg and
 * wiedel-me-favicon.svg. Those files are filled near-black for print and light
 * backgrounds; here everything takes currentColor so it reads on the dark theme
 * and follows hover colors.
 *
 * With `animated`, anime.js runs a two-part intro: the mark's halves spring
 * together from either side, then the wordmark draws itself letter by letter and
 * the fill fades in behind the line. The hidden starting frame is applied by the
 * effect below, so without JS — and with reduced motion — the lockup just renders
 * solid.
 */
export default function Logo({ className = "", mark = false, animated = false }: LogoProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!animated || !root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const halves = Array.from(root.querySelectorAll<SVGPolygonElement>("polygon"));
    const paths = Array.from(root.querySelectorAll<SVGPathElement>("path"));

    // The starting frame lives here rather than in the markup: if this effect
    // never runs, nothing is left hidden.
    halves.forEach((half) => {
      half.style.opacity = "0";
    });
    paths.forEach((path) => {
      path.style.fillOpacity = "0";
      path.style.stroke = "currentColor";
      path.style.strokeWidth = "0.6";
    });

    const drawables = svg.createDrawable(paths);
    const settle = spring({ stiffness: 120, damping: 13 });
    // When the mark is display:none, the wordmark shouldn't wait on it.
    const leadIn = halves.some((half) => half.getBoundingClientRect().width > 0) ? 520 : 0;

    const timeline = createTimeline({ defaults: { ease: "inOut(2)" } });
    // Mark first: the halves fly in from opposite sides and settle on a spring.
    halves.forEach((half, i) => {
      timeline.add(half, { opacity: [0, 1], x: [i === 0 ? -34 : 34, 0], ease: settle, duration: 700 }, i * 90);
    });

    timeline
      // Wordmark second, overlapping the tail of the spring.
      .add(drawables, { draw: ["0 0", "0 1"], duration: 900 }, stagger(70, { start: leadIn }))
      .add(paths, { fillOpacity: [0, 1], duration: 500 }, stagger(70, { start: leadIn + 420 }))
      .add(paths, { strokeOpacity: [1, 0], duration: 400 }, "-=300");

    return () => {
      timeline.revert();
      // revert() restores anime's own properties; the starting frame is ours.
      [...halves, ...paths].forEach((el) => el.removeAttribute("style"));
    };
  }, [animated]);

  return (
    <span
      ref={ref}
      role="img"
      aria-label="Wiedel.me"
      className={`inline-flex items-center gap-[0.5em] ${className}`}
    >
      {/* The mark only joins once the header has room for it beside the menu;
          below that the wordmark carries the brand on its own. */}
      {mark && (
        <svg viewBox={markViewBox} fill="currentColor" aria-hidden="true" className="hidden h-[125%] w-auto lg:block">
          {markPolygons.map((points) => (
            // fill-box keeps each half's transform origin on itself, not the viewBox.
            <polygon key={points} points={points} style={{ transformBox: "fill-box" }} />
          ))}
        </svg>
      )}
      <svg viewBox="0 0 328.11 31.87" fill="currentColor" aria-hidden="true" className="block h-full w-auto">
        {logoPaths.map((d) => (
          // The dot carries the brand color; setting `color` rather than `fill`
          // means the intro's currentColor stroke draws it in purple too. The
          // group-hover is a no-op at this color — left wired up for later.
          <path
            key={d}
            d={d}
            className={
              d === logoDotPath ? "text-brand-purple transition-colors group-hover:text-brand-purple" : undefined
            }
          />
        ))}
      </svg>
    </span>
  );
}
