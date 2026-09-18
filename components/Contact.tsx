import type { ReactNode } from "react";
import BookCallLink from "./BookCallLink";
import ContactForm from "./ContactForm";
import Reveal from "./Reveal";

type ContactProps = {
  heading: ReactNode;
  body: ReactNode;
  footnote: string;
  serviceOptions: string[];
  subject: string;
};

export default function Contact({ heading, body, footnote, serviceOptions, subject }: ContactProps) {
  return (
    <section
      id="contact"
      className="mx-auto grid w-[min(100%-40px,var(--container-site))] grid-cols-1 gap-[18px] py-[90px] md:grid-cols-[0.8fr_1.2fr]"
    >
      <Reveal className="rounded-(--radius-card) border border-line bg-white/2.5 p-8">
        <div className="text-[0.76rem] font-bold tracking-[0.16em] text-brand-purple uppercase">Let&rsquo;s talk</div>
        <h2 className="mt-3 mb-[18px] font-display text-[2.5rem] leading-none tracking-[-0.06em] sm:text-[3rem]">
          {heading}
        </h2>
        <p className="text-muted">{body}</p>
        <BookCallLink className="mt-7 inline-flex items-center justify-center rounded-full border border-line bg-white/3 px-[21px] py-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5">
          Book a call instead →
        </BookCallLink>
        <p className="mt-6 text-[0.8rem] text-[#7f8592]">{footnote}</p>
      </Reveal>
      <Reveal className="rounded-(--radius-card) border border-line bg-white/2.5 p-8">
        <ContactForm serviceOptions={serviceOptions} subject={subject} />
      </Reveal>
    </section>
  );
}
