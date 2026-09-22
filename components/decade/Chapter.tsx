import type { ReactNode } from "react";
import type { Chapter as ChapterData } from "@/lib/decade";

/**
 * One chapter of the ten-year story.
 *
 * `data-chapter-year` is how this hands its year to YearRail — the rail scans
 * for it rather than taking props, so this can stay a server component and ship
 * its text in the HTML.
 *
 * Three type sizes do the work that an eyebrow label would otherwise: heading,
 * then a lede at reading-plus size, then body. Measures are capped in `ch` so
 * the lines stay short as the column gets wider.
 */
export default function Chapter({ chapter, children }: { chapter: ChapterData; children?: ReactNode }) {
  return (
    <section
      id={chapter.id}
      data-chapter-year={chapter.year}
      className="flex min-h-[72vh] scroll-mt-[90px] flex-col justify-center py-[12vh]"
    >
      <h2
        data-chapter-heading
        className="max-w-[17ch] font-display text-[clamp(2rem,5.4vw,4.1rem)] leading-[1.04] tracking-[-0.055em] text-balance"
      >
        {chapter.heading}
      </h2>

      <p className="mt-8 max-w-[44ch] text-[1.28rem] leading-snug text-ink text-pretty">{chapter.lede}</p>

      {chapter.body.map((paragraph) => (
        <p key={paragraph} className="mt-5 max-w-[62ch] text-[1.02rem] text-muted text-pretty">
          {paragraph}
        </p>
      ))}

      {children}
    </section>
  );
}
