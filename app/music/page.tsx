import type { Metadata } from "next";
import hero from "@/components/hero/OutrunHero.module.css";
import { BookCallLink } from "@/components/site/BookCallLink";
import { Contact } from "@/components/site/Contact";
import { Reveal } from "@/components/site/Reveal";
import { Services } from "@/components/site/Services";
import { SiteHeader } from "@/components/site/SiteHeader";
import { StickyHeader } from "@/components/site/StickyHeader";
import s from "@/components/site/section.module.css";
import { musicContact } from "@/lib/contact";
import { musicIntro, musicServices } from "@/lib/music";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "DJ, Lessons & Music Production in Lincoln and Omaha",
  description:
    "Wedding and event DJ, DJ lessons, and music production — recording, mixing, and mastering — in Lincoln and Omaha, Nebraska.",
  alternates: { canonical: "/music/" },
};

/** DJ, lessons and music production (migrated from wiedel.me/music/). */
export default function Music() {
  return (
    <>
      <StickyHeader always>
        <SiteHeader />
      </StickyHeader>
      <main>
        <section className={styles.intro} aria-labelledby="music-title">
          <Reveal className={s.container}>
            <p className={s.eyebrow}>{musicIntro.eyebrow}</p>
            <h1 id="music-title" className={styles.heading}>
              {musicIntro.heading.lead} <span className={styles.accent}>{musicIntro.heading.accent}</span>
            </h1>
            <p className={s.lede}>{musicIntro.body}</p>
            <div className={styles.actions}>
              <a className={hero.primary} href="#contact">
                {musicIntro.primaryCta}
              </a>
              <BookCallLink className={hero.secondary}>{musicIntro.secondaryCta}</BookCallLink>
            </div>
          </Reveal>
        </section>
        <Services copy={musicServices} />
        <Contact copy={musicContact} />
      </main>
    </>
  );
}
