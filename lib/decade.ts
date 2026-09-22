/**
 * The ten-year story, as chapters on the anniversary home page.
 *
 * TODO (Caleb): the years below are placeholders derived from "10 years as of
 * 2026" — they are not from your records. Set `year` on each chapter to when it
 * actually happened, and rewrite `lede`/`body` in your own words. Nothing else
 * in the page needs to change; the rail and the year readout both read from
 * this file. Deliberately no client names are tied to specific years here,
 * since which project ran when isn't written down anywhere yet.
 */

/** The year the practice started. */
export const startYear = 2016;

/** The year being celebrated — keep in step with `startYear` + 10. */
export const anniversaryYear = 2026;

export const yearsInBusiness = anniversaryYear - startYear;

export type Chapter = {
  /** Anchor id, so the chapter can be linked to directly. */
  id: string;
  /** Drives the sticky year readout while this chapter is in view. */
  year: number;
  /** The chapter's heading. Kept short — it is set very large. */
  heading: string;
  /** One sentence under the heading, at reading size. */
  lede: string;
  /** Supporting paragraphs. */
  body: string[];
};

export const chapters: Chapter[] = [
  {
    id: "start",
    year: startYear,
    heading: "One laptop, one site, no plan past it.",
    lede: "Wiedel.me started the way most one-person shops do: somebody needed a website and I said yes.",
    body: [
      "There was no studio, no team, and no pitch deck. There was a person with a business, a deadline they were nervous about, and a developer who answered the phone. That has turned out to be the whole model.",
      "The first few years were spent learning what actually breaks after launch — which is rarely the part anyone worries about during the build.",
    ],
  },
  {
    id: "work",
    year: startYear + 4,
    heading: "The work started to add up.",
    lede: "Banks, hospitals, law firms, construction, a chamber of commerce, a bass music label.",
    body: [
      "No two of these industries have anything in common except that each one needed a site that worked and somebody to call when it didn't. Some came direct. Some came through agencies in Lincoln, Nashville, and Kansas City who needed a developer they could hand designs to.",
    ],
  },
  {
    id: "constant",
    year: startYear + 7,
    heading: "What never changed.",
    lede: "You have always been talking to the person doing the work.",
    body: [
      "In ten years there has never been an account manager between a client and me, and nothing has ever been quietly handed to a junior. When you email, I read it. When something is going to be a problem, you hear it from me early rather than at launch.",
      "It is the least scalable way to run this and the only reason any of it lasted.",
    ],
  },
  {
    id: "now",
    year: anniversaryYear,
    heading: "Ten years in, still here.",
    lede: "Design, development, IT, and care plans — the same four things, for whoever needs them.",
    body: [
      "The sites I built in the first years are still running, because looking after them is part of the job rather than an upsell. That is the part I would want you to take from a ten-year mark: not that I have been around a long time, but that the things I build stay around too.",
    ],
  },
];
