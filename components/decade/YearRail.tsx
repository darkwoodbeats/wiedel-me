"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, createScope, onScroll, splitText, stagger } from "animejs";
import { startYear } from "@/lib/decade";

/**
 * The spine of the anniversary page: one continuous line down the left gutter
 * that fills purple-to-cyan as you scroll, with the current chapter's year
 * riding it.
 *
 * The line is the wordmark's dot, pulled into ten years of length — see
 * DecadeHero, which drops the dot into the top of this rail.
 *
 * Two separate mechanisms share it:
 *  - The fill is scroll-*synced*: its scaleY is the scroll position, scrubbing
 *    both ways, so the rail reads as a progress bar through the decade.
 *  - The year is scroll-*triggered*: each chapter announces its year through a
 *    `data-chapter-year` attribute, and crossing into one rolls the readout
 *    from the old year to the new. Interpolating it against scroll instead
 *    would put years on screen that nothing on the page is talking about.
 *
 * Everything here is additive: the markup renders complete and filled, and the
 * effect below is what hides it first. No JS, or reduced motion, and the page
 * is simply a finished page.
 *
 * On anime's scroll thresholds: the string is "<container> <target>", not the
 * other way round — "center top" means the container's midline meeting the
 * target's top edge. Reversing the two silently yields a zero-length range and
 * an observer that never fires.
 */
export default function YearRail({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const fill = el.querySelector<HTMLElement>("[data-rail-fill]");
    const readout = el.querySelector<HTMLElement>("[data-year-readout]");
    const label = el.querySelector<HTMLElement>("[data-year-value]");
    if (!fill || !readout || !label) return;

    // Reduced motion doesn't mean less information. The year still follows the
    // chapter you're reading — it just snaps instead of rolling, and the rail
    // stays as the markup renders it: full, and already the whole decade.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduced) {
      // The starting frame, applied only now that we know it will be animated.
      fill.style.clipPath = "inset(0 0 100% 0)";
      readout.style.opacity = "0";
      label.textContent = String(startYear);
    }

    const scope = createScope({ root: el }).add(() => {
      const counter = { value: startYear };
      let shown = startYear;

      const rollTo = (year: number) => {
        if (year === shown) return;
        shown = year;
        if (reduced) {
          label.textContent = String(year);
          return;
        }
        animate(counter, {
          value: year,
          duration: 650,
          ease: "out(3)",
          onUpdate: () => {
            label.textContent = String(Math.round(counter.value));
          },
        });
      };

      el.querySelectorAll<HTMLElement>("[data-chapter-year]").forEach((chapter) => {
        const year = Number(chapter.dataset.chapterYear);
        onScroll({
          target: chapter,
          enter: "center top",
          leave: "center bottom",
          // Scrolling down, a chapter takes the readout when its top passes the
          // midline; scrolling back up, when its bottom does. Both directions
          // land on the chapter you are actually looking at.
          onEnterForward: () => rollTo(year),
          onEnterBackward: () => rollTo(year),
        });

        if (reduced) return;

        // Each chapter gets exactly one entrance, on its heading: the words rise
        // out from behind a clip, which reads as the page turning rather than as
        // another block fading up. Body copy is left alone.
        const heading = chapter.querySelector<HTMLElement>("[data-chapter-heading]");
        if (heading) {
          // Words, not lines: a line wrapper is a block whose height collapses
          // here, taking the heading down with it, while word wrappers are
          // inline-block and so honour both the clip and the transform.
          // Registered on the scope by the splitter itself, so scope.revert()
          // below puts the original heading markup back.
          const split = splitText(heading, { words: { wrap: "clip" }, accessible: true });
          // The words don't exist until the splitter has measured, and they are
          // rebuilt whenever the column reflows — addEffect re-runs on both, so
          // the animation always targets the current word boxes.
          split.addEffect((self) =>
            animate(self.words, {
              y: ["110%", "0%"],
              duration: 1000,
              ease: "out(4)",
              delay: stagger(60),
              autoplay: onScroll({ target: chapter, enter: "end-=100 top", leave: "start bottom" }),
            }),
          );
        }

        const field = chapter.querySelector<HTMLElement>("[data-logo-field]");
        if (field) {
          animate(field.querySelectorAll("[data-logo-item]"), {
            opacity: [0, 1],
            y: [14, 0],
            duration: 700,
            ease: "out(3)",
            // Left to right, row by row, so the field assembles away from the rail.
            delay: stagger(45),
            autoplay: onScroll({ target: field, enter: "end-=60 top", leave: "start bottom" }),
          });
        }
      });

      if (reduced) return;

      // Clipped from the bottom rather than scaled: the rail keeps its full
      // height, so the gradient stays put and the decade is *revealed* through
      // it. Scaling the element instead would squash the whole purple-to-cyan
      // ramp into however much has filled so far, and the rail would read as
      // cyan on the very first scroll.
      const progress = { value: 0 };
      animate(progress, {
        value: 1,
        ease: "linear",
        onUpdate: () => {
          fill.style.clipPath = `inset(0 0 ${(1 - progress.value) * 100}% 0)`;
        },
        autoplay: onScroll({
          target: el,
          // Measured against the viewport's midline, which is where the year
          // readout sits — so the fill passes a chapter exactly when its year
          // takes over.
          enter: "center top",
          leave: "center bottom",
          // A little smoothing: the rail trails the scroll rather than locking
          // to it frame for frame, which reads as weight rather than lag.
          sync: 0.35,
        }),
      });

      // The readout has nothing to say until the rail is on screen.
      onScroll({
        target: el,
        enter: "center top",
        leave: "center bottom",
        onEnter: () => animate(readout, { opacity: [0, 1], duration: 400 }),
        onLeave: () => animate(readout, { opacity: 0, duration: 300 }),
      });
    });

    return () => {
      scope.revert();
      fill.style.clipPath = "";
      readout.style.opacity = "";
    };
  }, []);

  return (
    <div ref={root} className="relative mx-auto w-[min(100%-40px,var(--container-site))]">
      {/* The rail itself. Hairline, full height of the narrative. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-px">
        <div className="absolute inset-0 bg-line" />
        <div
          data-rail-fill
          className="absolute inset-0 bg-linear-to-b from-brand-purple to-brand-cyan"
        />
        {/* The far end of the decade, bookending the purple dot the hero drops
            into the top of this line. Static: it marks where the rail stops,
            which is true whether or not anything is animating. */}
        <div className="absolute -bottom-[3px] -left-[3px] size-[7px] rounded-full bg-brand-cyan shadow-[0_0_18px_var(--color-brand-cyan)]" />
      </div>

      {/* Zero-height so it can stick beside the chapters without taking part in
          the layout. The year is the one number on the page that changes, so it
          gets tabular figures — proportional ones jitter as the digits roll. */}
      <div
        data-year-readout
        aria-hidden="true"
        className="pointer-events-none sticky top-[45vh] z-10 h-0"
      >
        <span
          data-year-value
          className="absolute top-1/2 -left-px -translate-y-1/2 border-l-2 border-brand-cyan pl-2.5 font-display text-[1.05rem] leading-none font-bold tracking-[-0.04em] text-ink tabular-nums lg:pl-4 lg:text-[3.2rem]"
        >
          {startYear}
        </span>
      </div>

      <div className="pl-[62px] lg:pl-[190px]">{children}</div>
    </div>
  );
}
