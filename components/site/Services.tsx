import Link from "next/link";
import type { ReactNode } from "react";
import hero from "@/components/hero/OutrunHero.module.css";
import { carePlan, process, type ServicesCopy } from "@/lib/services";
import panel from "./panel.module.css";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import s from "./section.module.css";
import styles from "./Services.module.css";

/** The offerings as a numbered list, followed by any related subsections (children). */
export function Services({
  num,
  label = "Services",
  copy,
  split,
  children,
}: {
  num?: string;
  label?: string;
  copy: ServicesCopy;
  /** The intro beside the heading on wide screens (see SectionHead). */
  split?: boolean;
  children?: ReactNode;
}) {
  return (
    <section id="services" className={`${s.section} ${s.ruled}`} aria-labelledby="services-title">
      <div className={s.container}>
        <SectionHead
          id="services-title"
          num={num}
          label={label}
          title={copy.title}
          script={copy.script}
          lede={copy.intro}
          split={split}
        />
        <ol className={styles.list}>
          {copy.services.map((service, i) => (
            <Reveal as="li" key={service.title} className={styles.row} delay={i * 60}>
              <span className={styles.num}>{service.num}</span>
              <div>
                <h3 className={styles.title}>{service.title}</h3>
                <p className={styles.body}>{service.body}</p>
                {service.link && (
                  <Link className={styles.more} href={service.link.href}>
                    {service.link.label}
                  </Link>
                )}
              </div>
              <ul className={`${s.tags} ${styles.chips}`} aria-label={`${service.title}: what’s included`}>
                {service.chips.map((chip) => (
                  <li key={chip}>{chip}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>
        {children}
      </div>
    </section>
  );
}

/** How a project runs, first call to launch. Keeps wiedel.me's #process anchor. */
export function Process() {
  return (
    <div id="process" className={styles.process}>
      <Reveal className={styles.subhead}>
        <h3 className={s.subheading}>
          {process.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h3>
        <p className={styles.subintro}>{process.intro}</p>
      </Reveal>
      <ol className={styles.steps}>
        {process.steps.map((step, i) => (
          <Reveal as="li" key={step.title} className={styles.step} delay={i * 70}>
            <span className={styles.stepNum} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h4 className={styles.stepTitle}>{step.title}</h4>
            <p className={styles.stepBody}>{step.body}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

/**
 * The monthly care plan: hosting, maintenance and IT support. Keeps wiedel.me's #care anchor.
 * Off the home page for now (its panel holds the contact section instead); kept to bring back.
 */
export function CarePlan() {
  return (
    <Reveal id="care" className={`${panel.panel} ${styles.care}`}>
      <div className={styles.careMain}>
        <p className={s.eyebrow}>{carePlan.label}</p>
        <h3 className={s.subheading}>{carePlan.title}</h3>
        <p className={styles.careBody}>{carePlan.body}</p>
        <p className={styles.price}>
          <span className={styles.priceFrom}>{carePlan.price.from}</span>
          <span className={styles.priceAmount}>{carePlan.price.amount}</span>
          <span className={styles.pricePer}>{carePlan.price.per}</span>
        </p>
        <a className={hero.primary} href="#contact">
          {carePlan.cta}
        </a>
      </div>
      <ul className={styles.included} aria-label="Included in every care plan">
        {carePlan.included.map((item) => (
          <li key={item.title}>
            <svg viewBox="0 0 24 24" className={styles.check} aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            <div>
              <b>{item.title}</b>
              <span>{item.body}</span>
            </div>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
