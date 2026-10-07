import type { ReactNode } from "react";
import { BookCallLink } from "@/components/site/BookCallLink";
import { SiteHeader } from "@/components/site/SiteHeader";
import { DreamsWord } from "./DreamsWord";
import { heroFontVariables } from "./fonts";
import { HeroCanvasLoader } from "./HeroCanvasLoader";
import styles from "./OutrunHero.module.css";

/**
 * The hero's world: a full-viewport scene with the site header on top. This is a Server
 * Component, so the copy is in the initial HTML (fast LCP, indexable). The WebGL scene streams in
 * behind it as a client-only island and fades up once its first frame is ready.
 *
 * `[data-hero-slot]` marks the space the layout keeps for the object. The 3D camera frames the
 * sphere into that box, so the CSS breakpoints below control the composition.
 *
 * OutrunHero fills it with the home page's copy, and the 404 page (app/not-found.tsx) with its
 * own, so a wrong URL still lands in the same scene.
 */
export function HeroFrame({ titleId, children }: { titleId: string; children: ReactNode }) {
  return (
    <section
      className={`${styles.hero} ${heroFontVariables}`}
      data-hero
      aria-labelledby={titleId}
    >
      <div className={styles.backdrop} aria-hidden="true" />
      <HeroCanvasLoader />
      <div className={styles.scanlines} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />

      <SiteHeader />

      <div className={styles.stage}>
        <div className={styles.copy}>{children}</div>

        <div className={styles.slot} data-hero-slot aria-hidden="true" />
      </div>
    </section>
  );
}

/** The arrow on a primary action; it slides right on hover. */
export function ActionArrow() {
  return (
    <svg className={styles.arrow} viewBox="0 0 22 10" aria-hidden="true">
      <path d="M0 5h20M16 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** The home page's hero; drop <OutrunHero /> into any page. */
export default function OutrunHero() {
  return (
    <HeroFrame titleId="hero-title">
      <p className={styles.eyebrow}>
        Web {"//"} Design {"//"} Tech {"//"} Sound
      </p>
      <h1 id="hero-title" className={styles.title}>
        {/* "Making" and "Become" recede into outlines, so the loud words also read as "Dreams Seen Since 2016". */}
        <span className={styles.titleLead}>
          <span className={styles.titleQuiet} data-text="Making">
            Making
          </span>{" "}
          <DreamsWord />
        </span>{" "}
        <span className={styles.titleMain}>
          <span className={styles.titleQuiet} data-text="Become">
            Become
          </span>{" "}
          <span className={styles.titleLoud}>Seen</span>
        </span>{" "}
        <span className={styles.titleBrush}>Since 2016</span>
      </h1>
      <p className={styles.subtitle}>
        Celebrating 10+&nbsp;years of making dreams come true for agencies, growing businesses,
        and everyone in between.<br />
        {/*Let&rsquo;s make yours happen&nbsp;next.*/}
      </p>
      {/* The two ways in, the same pair the contact section closes on: book a call, or send an inquiry. */}
      <div className={styles.actions}>
        <BookCallLink className={styles.primary}>
          Book an intro call
          <ActionArrow />
        </BookCallLink>
        <a className={styles.secondary} href="#contact">
          Send an inquiry
        </a>
      </div>
    </HeroFrame>
  );
}
