export type Testimonial = {
  /**
   * Their words, verbatim, with their permission to publish. Trimming is fine;
   * mark cuts with "…" and any substituted words with [brackets].
   */
  quote: string;
  name: string;
  /** e.g. "Creative Director, Swanson Russell". Omitted until confirmed. */
  role?: string;
  /** Optional link to the source, such as their LinkedIn post or profile. */
  url?: string;
};

/**
 * The Testimonials section stays hidden while this list is empty. These come from
 * reshares of Caleb's LinkedIn post, trimmed to the parts about him.
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "One of the easiest professional recommendations I can make. I hired Caleb 13 years ago, and I’d do it again in a heartbeat. If you’re looking for an exceptional full stack software engineer, I highly recommend [him].",
    name: "Matt Honke",
  },
  {
    quote:
      "The only full stacks I know about are pancakes, but my friend Caleb knows all about full stack web developing.",
    name: "Seth Ellenwood",
  },
  {
    quote: "So glad to have crossed paths, Caleb … any company would be lucky to have you!",
    name: "Olivia Boldt",
  },
  {
    quote: "Don’t pass over [Caleb’s] potential.",
    name: "William Kunze",
  },
];
