import Image from "next/image";
import { clients } from "@/lib/about";
import { projects, type ProjectWithLogo } from "@/lib/projects";
import styles from "./ClientLogos.module.css";
import s from "./section.module.css";

// Only projects with a usable white logo appear in the strip, unless marked `inStrip: false`.
const logos = projects.filter(
  (project): project is ProjectWithLogo => Boolean(project.logo) && project.inStrip !== false,
);

/** The strip of client logos, directly under the hero: who the work has been for, before the pitch. */
export function ClientLogos() {
  return (
    <section className={styles.clients} aria-labelledby="clients-title">
      <div className={`${s.container} ${styles.head}`}>
        <h2 id="clients-title" className={s.eyebrow}>
          {clients.label}
        </h2>
        <p className={styles.note}>{clients.body}</p>
      </div>
      {/* Two identical tracks scrolling as one strip: the animation moves half the total
          width, so the second track seamlessly takes over. */}
      <div className={styles.strip}>
        <div className={styles.marquee}>
          <LogoTrack />
          <LogoTrack hidden />
        </div>
      </div>
    </section>
  );
}

function LogoTrack({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className={styles.track} aria-hidden={hidden || undefined}>
      {logos.map((project) => (
        <li key={project.slug}>
          <Image
            src={project.logo}
            alt={hidden ? "" : project.title}
            // Each logo's true size at its natural 96px height, so the moving strip reserves
            // the right box while the images lazy-load.
            width={project.logoWidth}
            height={96}
            sizes={`${Math.round((project.logoWidth / 3) * (project.logoScale ?? 1))}px`}
            className={styles.logo}
            style={project.logoScale ? { transform: `scale(${project.logoScale})` } : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
