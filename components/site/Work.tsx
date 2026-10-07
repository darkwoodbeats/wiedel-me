import Image from "next/image";
import { projects, screenshotSrc, SCREENSHOT, type Project } from "@/lib/projects";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import s from "./section.module.css";
import styles from "./Work.module.css";

// The projects on show here; those marked `inWork: false` only appear in the logo strip.
const shown = projects.filter((project) => project.inWork !== false);

/** Selected work: the wiedel.me projects, each live homepage large, its details beneath. */
export function Work() {
  return (
    <section id="work" className={`${s.section} ${s.ruled}`} aria-labelledby="work-title">
      <div className={s.container}>
        <SectionHead
          id="work-title"
          num="01"
          label="Work"
          title={["Recent"]}
          script="projects."
          split
          lede="Sites I’ve designed, built, or helped maintain. Every screenshot is the live homepage as it stands today."
        />
        <ol className={styles.grid}>
          {shown.map((project, i) => (
            <li key={project.slug} className={styles.item}>
              <Reveal delay={(i % 2) * 90}>
                <ProjectCard project={project} number={String(i + 1).padStart(2, "0")} />
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ProjectCard({ project, number }: { project: Project; number: string }) {
  const host = new URL(project.url).hostname.replace(/^www\./, "");
  return (
    <a className={styles.card} href={project.url} target="_blank" rel="noopener noreferrer">
      <div className={styles.frame}>
        <Image
          src={screenshotSrc(project)}
          alt={`${project.title} homepage`}
          width={SCREENSHOT.width}
          height={SCREENSHOT.height}
          sizes="(min-width: 1320px) 600px, (min-width: 800px) 46vw, 100vw"
          className={styles.shot}
        />
      </div>
      {/* Name first in reading order; the grid puts the number and domain on the row above. */}
      <div className={styles.meta}>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.sector}>{project.sector}</p>
        {project.description && <p className={styles.description}>{project.description}</p>}
        <span className={styles.host}>
          {host}
          <span aria-hidden="true"> ↗</span>
          <span className={s.srOnly}> (opens in a new tab)</span>
        </span>
        <span className={styles.number} aria-hidden="true">
          {number}
        </span>
      </div>
    </a>
  );
}
