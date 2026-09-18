import type { Metadata } from "next";
import BookCallLink from "@/components/BookCallLink";
import Contact from "@/components/Contact";
import Reveal from "@/components/Reveal";
import ServiceGrid, { type Service } from "@/components/ServiceGrid";

export const metadata: Metadata = {
  title: "DJ, Lessons & Music Production in Lincoln and Omaha",
  description:
    "Wedding and event DJ, DJ lessons, and music production — recording, mixing, and mastering — in Lincoln and Omaha, Nebraska.",
  alternates: { canonical: "/music/" },
};

const services: Service[] = [
  {
    num: "01 / EVENTS",
    title: "Wedding & Event DJ",
    body: "Professional music, MC services, sound, and energy for weddings, parties, private events, and corporate gatherings.",
    chips: ["Weddings", "MC", "Sound", "Events"],
  },
  {
    num: "02 / LEARN",
    title: "DJ Lessons",
    body: "Learn the gear, software, beatmatching, mixing, song selection, and fundamentals you need to start DJing confidently.",
    chips: ["Beginner", "Mixing", "Equipment"],
  },
  {
    num: "03 / MUSIC",
    title: "Music Production",
    body: "Available to record, mix, and master — from tracking a single part to finishing a full release. Clean, balanced results that hold up on headphones, car speakers, and a club system alike.",
    chips: ["Recording", "Mixing", "Mastering", "Production"],
  },
];

export default function Music() {
  return (
    <main id="top">
      <section className="mx-auto w-[min(100%-40px,var(--container-site))] pt-[70px] pb-5 lg:pt-[100px]">
        <Reveal>
          <div className="text-[0.76rem] font-bold tracking-[0.16em] text-brand-purple uppercase">
            Lincoln &amp; Omaha, Nebraska · DJ &amp; Music
          </div>
          <h1 className="my-[18px] mb-7 max-w-[900px] font-display text-[3.2rem] leading-[0.94] tracking-[-0.07em] sm:text-[clamp(3.2rem,6vw,5.5rem)]">
            The same care, <span className="text-gradient">turned up loud.</span>
          </h1>
          <p className="max-w-[650px] text-[1.18rem] text-muted">
            Away from the keyboard, I DJ weddings and events, teach people to DJ, and record, mix, and master music.
          </p>
          <div className="mt-[34px] flex flex-wrap gap-3">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border border-brand-purple bg-brand-purple px-[21px] py-[14px] font-bold text-[#0a0b0d] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Check my availability →
            </a>
            <BookCallLink className="inline-flex items-center justify-center rounded-full border border-line bg-white/3 px-[21px] py-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5">
              Book a call
            </BookCallLink>
          </div>
        </Reveal>
      </section>
      <ServiceGrid
        id="services"
        title={
          <>
            Music, events
            <br />
            &amp; lessons.
          </>
        }
        intro="Planning a wedding or event, ready to learn to DJ, or finishing a track? Here's how I can help."
        services={services}
      />
      <Contact
        heading="Let's make some noise."
        body="Tell me the date, the venue, or the project, and I'll get back to you with availability and a quote."
        footnote="DJ · Lessons · Recording · Mixing · Mastering"
        serviceOptions={["Wedding / Event DJ", "DJ Lessons", "Music Production", "Something else"]}
        subject="New music inquiry from wiedel.me"
      />
    </main>
  );
}
