import { testimonials } from "@/lib/testimonials";
import Reveal from "./Reveal";

export default function Testimonials() {
  // Hidden until there are real quotes; an empty section looks unfinished.
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="mx-auto w-[min(100%-40px,var(--container-site))] py-[90px]">
      <Reveal className="mb-[30px]">
        <h2 className="m-0 font-display text-[clamp(2rem,4vw,3.3rem)] leading-[0.95] tracking-[-0.055em]">
          In their words.
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <Reveal
            key={t.name}
            as="figure"
            delay={i * 60}
            className="flex flex-col justify-between gap-6 rounded-(--radius-card) border border-line bg-white/2.5 p-7"
          >
            <blockquote className="m-0 text-[1.05rem] leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption className="text-[0.88rem]">
              {t.url ? (
                <a href={t.url} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-brand-cyan">
                  {t.name}
                </a>
              ) : (
                <b>{t.name}</b>
              )}
              {t.role && <span className="block text-muted">{t.role}</span>}
            </figcaption>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
