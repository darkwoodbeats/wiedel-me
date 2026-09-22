"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, spring, splitText, stagger } from "animejs";
import Logo from "@/components/Logo";
import { anniversaryYear, startYear, yearsInBusiness } from "@/lib/decade";

/**
 * The page's one load moment. The wordmark's dot leaves the lockup, drops into
 * the left gutter, and draws the rail that the rest of the page scrolls down —
 * see YearRail, which continues the line from exactly where this leaves it.
 *
 * The headline splits into words for the reveal. anime's splitter rebuilds the
 * markup, so the original text stays in the DOM for anything that isn't running
 * this effect, and `accessible` keeps the heading readable to screen readers
 * once it has.
 */
export default function DecadeHero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = el.querySelector<HTMLElement>("[data-hero-dot]");
    const line = el.querySelector<HTMLElement>("[data-hero-line]");
    const heading = el.querySelector<HTMLElement>("[data-hero-heading]");
    const trailing = el.querySelectorAll<HTMLElement>("[data-hero-fade]");
    if (!dot || !line || !heading) return;

    // Starting frame — set here so that without JS nothing is left hidden.
    dot.style.opacity = "0";
    line.style.transform = "scaleY(0)";
    trailing.forEach((node) => {
      node.style.opacity = "0";
    });

    const scope = createScope({ root: el }).add(() => {
      const split = splitText(heading, { words: true, chars: false, accessible: true });
      // The words only exist once the splitter has measured, and they are rebuilt
      // on reflow; addEffect runs after each split rather than racing it.
      split.addEffect((self) =>
        animate(self.words, {
          opacity: [0, 1],
          y: ["0.5em", 0],
          duration: 900,
          ease: "out(3)",
          delay: stagger(55),
        }),
      );

      animate(trailing, {
        opacity: [0, 1],
        y: [12, 0],
        duration: 700,
        ease: "out(3)",
        delay: stagger(90, { start: 420 }),
      });

      // The dot arrives on a spring, then the line runs out from under it.
      animate(dot, {
        opacity: [0, 1],
        y: ["-0.9rem", 0],
        scale: [0.4, 1],
        ease: spring({ stiffness: 140, damping: 12 }),
        duration: 700,
        delay: 700,
      });

      animate(line, {
        scaleY: [0, 1],
        duration: 900,
        ease: "inOut(3)",
        delay: 980,
      });
    });

    return () => {
      scope.revert();
      [dot, line, ...trailing].forEach((node) => node.removeAttribute("style"));
    };
  }, []);

  return (
    <header
      ref={root}
      className="relative mx-auto w-[min(100%-40px,var(--container-site))] pt-[70px] pb-[150px] lg:pt-[110px] lg:pb-[190px]"
    >
      <div className="pl-[62px] lg:pl-[190px]">
        <Logo className="h-[clamp(1.5rem,4.4vw,3rem)] text-ink" />

        <h1
          data-hero-heading
          className="mt-9 max-w-[16ch] font-display text-[clamp(2.6rem,8.5vw,6.2rem)] leading-[0.92] tracking-[-0.06em] text-balance"
        >
          Ten years of answering my own phone.
        </h1>

        <p data-hero-fade className="mt-8 max-w-[54ch] text-[1.15rem] text-muted">
          Wiedel.me turns {yearsInBusiness} this year. No account managers, no hand-offs, and no
          year where somebody else took the call. Here is the whole decade &mdash; it is a short scroll.
        </p>

        <p data-hero-fade className="mt-6 font-display text-[0.95rem] tracking-[-0.02em] text-muted tabular-nums">
          {startYear}&ndash;{anniversaryYear}
        </p>
      </div>

      {/* The rail's first 150px, drawn on load. It ends flush with this
          header's bottom edge, where YearRail's own line picks it up. */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-[150px] w-px lg:h-[190px]">
        <div data-hero-line className="absolute inset-0 origin-top bg-linear-to-b from-brand-purple to-brand-purple/35" />
        <div
          data-hero-dot
          className="absolute -top-[3px] -left-[3px] size-[7px] rounded-full bg-brand-purple shadow-[0_0_18px_var(--color-brand-purple)]"
        />
      </div>
    </header>
  );
}
