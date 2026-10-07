import { audiences } from "@/lib/about";
import styles from "./Audiences.module.css";
import panel from "./panel.module.css";
import { Reveal } from "./Reveal";
import s from "./section.module.css";

/** "Who I work with", right under the client logos: agencies and growing businesses, side by side. */
export function Audiences() {
  return (
    <section className={styles.audiences} aria-labelledby="audiences-title">
      <div className={s.container}>
        <h2 id="audiences-title" className={s.eyebrow}>
          {audiences.label}
        </h2>
        <div className={styles.groups}>
          {audiences.groups.map((group, i) => (
            <Reveal key={group.title} className={`${panel.panel} ${styles.group}`} delay={i * 80}>
              <h3 className={styles.title}>{group.title}</h3>
              <p className={styles.body}>{group.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
