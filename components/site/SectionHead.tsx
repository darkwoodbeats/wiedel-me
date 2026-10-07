import { ChromeHeading } from "./ChromeHeading";
import { Reveal } from "./Reveal";
import s from "./section.module.css";

/** A section's opening: numbered mono label, display heading, and a short lede. */
export function SectionHead({
  id,
  num,
  label,
  title,
  script,
  lede,
  split,
}: {
  /** The heading's id, for the section's aria-labelledby. */
  id: string;
  /** e.g. "01"; omitted on pages without numbered sections. */
  num?: string;
  label: string;
  /** Heading lines. */
  title: string[];
  /**
   * A brush-script line after the heading, like the hero's "Since 2016". With it, the heading takes
   * the hero title's whole treatment: chrome lines, then the script crossing the foot of the last.
   * On narrow screens the head also stacks like the hero's copy: a centered column that the
   * heading fills edge to edge.
   */
  script?: string;
  lede?: string;
  /** On wide screens, the lede sits to the right of the heading, at the end of its row. */
  split?: boolean;
}) {
  return (
    <Reveal className={`${s.head} ${split ? s.split : ""} ${script ? `${s.fit} ${s.stack}` : ""}`}>
      <p className={s.eyebrow}>
        {num && (
          <>
            {num} <b>{"//"}</b>{" "}
          </>
        )}
        {label}
      </p>
      {script ? (
        <ChromeHeading id={id} title={title} script={script} />
      ) : (
        <h2 id={id} className={s.heading}>
          {title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h2>
      )}
      {lede && <p className={s.lede}>{lede}</p>}
    </Reveal>
  );
}
