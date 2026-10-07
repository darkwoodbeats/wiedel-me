import { FitHeading } from "./FitHeading";
import s from "./section.module.css";

/**
 * The hero title's treatment for a section heading: chrome lines with the hero's extrusion, then a
 * brush-script line, like the hero's "Since 2016", crossing the foot of the last. In a .fit head it
 * fills its column on narrow screens (FitHeading).
 */
export function ChromeHeading({
  id,
  title,
  script,
  trailLast = false,
  className = "",
}: {
  /** The heading's id, for the section's aria-labelledby. */
  id: string;
  /** Heading lines. */
  title: string[];
  /** The brush-script line. */
  script: string;
  /**
   * The script starts where the last line ends, tucked under its last letter, instead of lining up
   * with the longest line's end. For a last line much shorter than the longest, where the script
   * would otherwise float in the gap beside it.
   */
  trailLast?: boolean;
  /** A section's own classes for the heading, e.g. its size. */
  className?: string;
}) {
  const last = title[title.length - 1];
  return (
    <FitHeading
      id={id}
      className={`${s.heading} ${s.chrome} ${title.length === 1 ? s.single : ""} ${trailLast ? s.trailLast : ""} ${className}`}
    >
      {title.slice(0, -1).map((line) => (
        <span key={line} className={s.line}>
          {line}
        </span>
      ))}
      {/* The last line and the script together; the script lines up with the longest line's end. */}
      <span className={s.lockup}>
        <span className={s.line}>{last}</span>
        <span className={s.script}>{script}</span>
      </span>
    </FitHeading>
  );
}
