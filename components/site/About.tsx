import Image from "next/image";
import { about, profile } from "@/lib/about";
import styles from "./About.module.css";
import { ChromeHeading } from "./ChromeHeading";
import { Reveal } from "./Reveal";
import s from "./section.module.css";

/** The personal section: who does the work, and why that matters. */
export function About() {
  return (
    <section id="about" className={`${s.section} ${s.ruled} ${styles.about}`} aria-labelledby="about-title">
      {/* Heading, portrait, then the text: on phones the section opens with its label, and on
          wide screens the portrait takes its own column beside the heading and text. */}
      <div className={`${s.container} ${styles.layout}`}>
        <Reveal className={`${styles.head} ${s.fit}`}>
          <p className={s.eyebrow}>
            02 <b>{"//"}</b> About
          </p>
          <ChromeHeading
            id="about-title"
            title={about.title}
            script={about.script}
            trailLast
            className={styles.heading}
          />
        </Reveal>

        <Reveal as="figure" className={styles.profile}>
          <div className={styles.portrait}>
            <PortraitGrade />
            <Image
              src={profile.photo.src}
              alt={profile.photo.alt}
              width={profile.photo.width}
              height={profile.photo.height}
              sizes="(min-width: 900px) 380px, 80vw"
              className={styles.photo}
            />
            <span className={styles.light} aria-hidden="true" />
          </div>
          <figcaption className={styles.caption}>
            <span className={styles.name}>{profile.name}</span>
            <span className={styles.role}>{profile.role}</span>
            <span className={styles.pitch}>{profile.pitch}</span>
            <ul className={s.tags} aria-label="Focus">
              {profile.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </figcaption>
        </Reveal>

        <div className={styles.text}>
          <Reveal>
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph} className={s.lede}>
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal className={styles.why} delay={80}>
            <h3 className={styles.whyLabel}>{about.label}</h3>
            <dl className={styles.facts}>
              {about.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.body}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * The portrait's color grade, applied from CSS (.photo). It maps the photo's brightness onto the
 * site's palette (night, violet, lavender, the text's near-white), then mixes back 40% of the
 * photo at reduced saturation, so skin still reads as skin but no stray greens or oranges clash
 * with the page.
 */
function PortraitGrade() {
  return (
    <svg className={styles.filters} aria-hidden="true" focusable="false">
      <filter id="portrait-grade" colorInterpolationFilters="sRGB">
        {/* Brightness (Rec. 709 luma) in all three channels. */}
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"
          result="luma"
        />
        {/* Gradient map: #030108 → violet → lavender → #f3eeff. The blacks stay deep and the
            midtones are lifted part of the way toward the photo's own brightness. */}
        <feComponentTransfer in="luma" result="mapped">
          <feFuncR type="table" tableValues="0.012 0.175 0.415 0.73 0.953" />
          <feFuncG type="table" tableValues="0.004 0.095 0.285 0.59 0.933" />
          <feFuncB type="table" tableValues="0.031 0.33 0.585 0.84 1" />
        </feComponentTransfer>
        <feColorMatrix in="SourceGraphic" type="saturate" values="0.4" result="muted" />
        <feComposite in="mapped" in2="muted" operator="arithmetic" k1={0} k2={0.6} k3={0.4} k4={0} />
      </filter>
    </svg>
  );
}
