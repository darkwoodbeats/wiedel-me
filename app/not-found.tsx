import type { Metadata } from "next";
import Link from "next/link";
import { ActionArrow, HeroFrame } from "@/components/hero/OutrunHero";
import hero from "@/components/hero/OutrunHero.module.css";
import { SiteHeader } from "@/components/site/SiteHeader";
import { StickyHeader } from "@/components/site/StickyHeader";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * Every unmatched URL lands here: the static export writes it to out/404.html, which
 * public/.htaccess serves for any missing path. It is the home hero's scene with its own lockup,
 * set the same way: hollow neon for the connecting words, chrome for the loud ones, and the brush
 * line painted across the foot.
 */
export default function NotFound() {
  return (
    <>
      <StickyHeader>
        <SiteHeader />
      </StickyHeader>
      <main>
        <HeroFrame titleId="not-found-title">
          <p className={hero.eyebrow}>
            Page not found {"//"} Signal lost
          </p>
          <h1 id="not-found-title" className={`${hero.title} ${styles.lockup}`}>
            <span className={hero.titleLead}>
              <span className={hero.titleQuiet} data-text="You’ve">
                You&rsquo;ve
              </span>{" "}
              <span className={hero.titleLoud}>Drifted</span>
            </span>{" "}
            <span className={hero.titleMain}>
              <span className={hero.titleQuiet} data-text="Off the">
                Off the
              </span>{" "}
              <span className={hero.titleLoud}>Grid</span>
            </span>{" "}
            <span className={hero.titleBrush}>Error 404</span>
          </h1>
          <p className={hero.subtitle}>
            Nothing is transmitting from this address. The page may have moved, or the link took a
            wrong&nbsp;turn.
          </p>
          <div className={hero.actions}>
            <Link className={hero.primary} href="/">
              Back to home
              <ActionArrow />
            </Link>
            <Link className={hero.secondary} href="/#contact">
              Send an inquiry
            </Link>
          </div>
        </HeroFrame>
      </main>
    </>
  );
}
