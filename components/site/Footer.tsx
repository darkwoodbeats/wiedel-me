import { FOOTER_LINKS, siteName } from "@/lib/site";
import styles from "./Footer.module.css";
import s from "./section.module.css";
import { Wordmark } from "./SiteHeader";

/** The wiedel.me footer: wordmark, where the work happens, and the secondary links. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Wordmark />
          <p className={styles.note}>
            © {new Date().getFullYear()} {siteName} · Lincoln, Nebraska · Serving Omaha and beyond
          </p>
        </div>
        <nav aria-label="Footer" className={styles.links}>
          {FOOTER_LINKS.map((link) => {
            const external = link.href.startsWith("http");
            return (
              <a
                key={link.href}
                href={link.href}
                {...(external && { target: "_blank", rel: "noopener noreferrer" })}
              >
                {link.label}
                {external && <span className={s.srOnly}> (opens in a new tab)</span>}
              </a>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
