import ContactForm from "./ContactForm";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <section
      id="contact"
      className="mx-auto grid w-[min(100%-40px,var(--container-site))] grid-cols-1 gap-[18px] py-[90px] md:grid-cols-[0.8fr_1.2fr]"
    >
      <Reveal className="rounded-(--radius-card) border border-line bg-white/2.5 p-8">
        <div className="text-[0.76rem] font-bold tracking-[0.16em] text-brand-lime uppercase">Let&rsquo;s talk</div>
        <h2 className="mt-0 mb-[18px] font-display text-[2.5rem] leading-none tracking-[-0.06em] sm:text-[3rem]">
          Have a problem worth solving?
        </h2>
        <p className="text-muted">
          Tell me what you&rsquo;re working on, what isn&rsquo;t working, or what you need help with. I&rsquo;ll get
          back to you and we&rsquo;ll figure out the next step.
        </p>
        <p className="mt-6 text-[0.8rem] text-[#7f8592]">Web · Design · IT · DJ · Lessons</p>
      </Reveal>

      <Reveal className="rounded-(--radius-card) border border-line bg-white/2.5 p-8">
        <ContactForm />
      </Reveal>
    </section>
  );
}
