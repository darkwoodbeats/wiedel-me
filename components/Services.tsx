import Reveal from "./Reveal";

const services = [
  {
    num: "01 / WEB",
    title: "Web Design & Development",
    body: "Modern, responsive websites, landing pages, updates, accessibility, troubleshooting, and custom front-end work.",
    chips: ["UI / UX", "Front-end", "Responsive", "Accessibility"],
  },
  {
    num: "02 / BRAND",
    title: "Graphic & Logo Design",
    body: "Logos, branding, flyers, posters, social graphics, event artwork, and visual systems that feel intentional.",
    chips: ["Logos", "Branding", "Print", "Social"],
  },
  {
    num: "03 / TECH",
    title: "IT Help & Tech Support",
    body: "Practical help for home users and small businesses — computers, software, networks, setup, migrations, and troubleshooting.",
    chips: ["Home IT", "Small Business", "Networks", "Troubleshooting"],
  },
  {
    num: "04 / EVENTS",
    title: "Wedding & Event DJ",
    body: "Professional music, MC services, sound, and energy for weddings, parties, private events, and corporate gatherings.",
    chips: ["Weddings", "MC", "Sound", "Events"],
  },
  {
    num: "05 / LEARN",
    title: "DJ Lessons",
    body: "Learn the gear, software, beatmatching, mixing, song selection, and fundamentals you need to start DJing confidently.",
    chips: ["Beginner", "Mixing", "Equipment"],
  },
  {
    num: "06 / MUSIC",
    title: "Music Production",
    body: "Available to record, mix, and master — from tracking a single part to finishing a full release. Clean, balanced results that hold up on headphones, car speakers, and a club system alike.",
    chips: ["Recording", "Mixing", "Mastering", "Production"],
  },
];

export default function Services() {
  return (
    <section id="services" className="mx-auto w-[min(100%-40px,var(--container-site))] py-[90px]">
      <Reveal className="mb-[30px] block sm:flex sm:items-end sm:justify-between sm:gap-[30px]">
        <h2 className="m-0 font-display text-[clamp(2rem,4vw,3.3rem)] tracking-[-0.055em]">
          What I can do
          <br />
          for you.
        </h2>
        <p className="mt-3 max-w-[470px] text-muted sm:m-0">
          Need one thing fixed, a whole digital presence built, or someone who can bridge the technical and creative
          sides? Start here.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <Reveal
            key={service.num}
            as="article"
            delay={i * 60}
            className="min-h-[220px] rounded-(--radius-card) border border-line bg-linear-[180deg,rgb(255_255_255/0.045),rgb(255_255_255/0.02)] p-7 transition duration-250 hover:-translate-y-[5px] hover:border-[#3b4150]"
          >
            <div className="font-display text-[0.8rem] text-brand-lime">{service.num}</div>
            <h3 className="mt-[30px] mb-[9px] font-display text-[1.45rem] tracking-[-0.035em]">{service.title}</h3>
            <p className="m-0 text-muted">{service.body}</p>
            <div className="mt-5 flex flex-wrap gap-[7px]">
              {service.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-lg border border-line bg-[#0d0f14] px-[9px] py-1.5 text-[0.72rem] text-[#c9ced8]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
