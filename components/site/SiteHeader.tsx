import Link from "next/link";
import hero from "@/components/hero/OutrunHero.module.css";
import { MobileNav } from "@/components/hero/MobileNav";
import { NAV_LINKS, siteName } from "@/lib/site";
import { BrandLink } from "./BrandLink";

/**
 * The "WIEDEL.me" wordmark: the chrome display face with the cyan brush script laid over the
 * foot of the L. Its styles live with the hero's (OutrunHero.module.css), whose title it echoes.
 */
export function Wordmark() {
  return (
    <BrandLink className={hero.logoLink} label={siteName}>
      <span className={hero.logoWord}>Wiedel</span>
      <span className={hero.logoBrush}>.me</span>
    </BrandLink>
  );
}

/**
 * The site header: the wordmark, the primary links and, on phones, the menu button. The hero
 * opens with it, and StickyHeader shows a second copy once that one has scrolled away.
 */
export function SiteHeader({ className = "" }: { className?: string }) {
  return (
    <header className={`${hero.hud} ${hero.hudTop} ${hero.siteHeader} ${className}`}>
      <Wordmark />
      <nav className={hero.siteNav} aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} className={hero.navLink} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <MobileNav links={NAV_LINKS} />
    </header>
  );
}
