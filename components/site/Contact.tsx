import hero from "@/components/hero/OutrunHero.module.css";
import type { ContactCopy } from "@/lib/contact";
import { BookCallLink } from "./BookCallLink";
import styles from "./Contact.module.css";
import { ContactForm } from "./ContactForm";
import { Jets } from "./Jets";
import { Landscape } from "./Landscape";
import panel from "./panel.module.css";
import { Reveal } from "./Reveal";
import s from "./section.module.css";

/**
 * The closing call to action, set in the framed panel: the question and the booking path on the
 * left, the inquiry form in its own card on the right. Two clear paths, a call booked through
 * Calendly or an inquiry through Formspree. The panel stands in the hero's world (Landscape): its
 * glowing foot is the horizon, with the sky and mountains behind it, the grid floor beneath, and
 * the hero's jets lapping it, closing the sequence the hero opened.
 */
export function Contact({ copy, num }: { copy: ContactCopy; num?: string }) {
  return (
    <section id="contact" className={`${s.section} ${s.ruled} ${styles.contact}`} aria-labelledby="contact-title">
      <Landscape />
      <div className={s.container}>
        {/* The panel clips its own overflow, so the jets fly in this wrapper, which is exactly its size. */}
        <div className={styles.stage}>
          <Reveal className={`${panel.panel} ${styles.panel}`}>
            <div>
              <p className={s.eyebrow}>
                {num && (
                  <>
                    {num} <b>{"//"}</b>{" "}
                  </>
                )}
                {copy.label}
              </p>
              <h2 id="contact-title" className={s.subheading}>
                {copy.heading}
              </h2>
              <p className={styles.body}>{copy.body}</p>

              <div className={styles.book}>
                <BookCallLink className={`${hero.primary} ${styles.bookButton}`} fallbackHref="#inquiry">
                  Book an intro call →
                </BookCallLink>
                <p className={styles.footnote}>{copy.footnote}</p>
              </div>
            </div>

            <div id="inquiry" className={styles.inquiry}>
              <ContactForm serviceOptions={copy.serviceOptions} subject={copy.subject} />
            </div>
          </Reveal>
          <Jets />
        </div>
      </div>
    </section>
  );
}
