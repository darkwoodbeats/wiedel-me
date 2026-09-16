import Reveal from "./Reveal";

const included = [
  { title: "Hosting", body: "I host the site, so there's no separate hosting company to deal with." },
  { title: "Maintenance", body: "Ongoing updates and fixes, so the site doesn't fall behind." },
  { title: "IT support", body: "Practical help with the technology around the site: computers, software, and networks." },
];

export default function CarePlans() {
  return (
    <section id="care" className="mx-auto w-[min(100%-40px,var(--container-site))] py-[90px]">
      <Reveal className="relative overflow-hidden rounded-[32px] border border-line bg-linear-[145deg,#151820,#0d0f15] p-7 sm:p-11">
        <div className="pointer-events-none absolute -top-[120px] -right-[100px] size-[320px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgb(199_255_74/0.35),rgb(199_255_74/0)_68%)]" />

        <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="text-[0.76rem] font-bold tracking-[0.16em] text-brand-lime uppercase">Care plans</div>
            <h2 className="mt-3 mb-[18px] font-display text-[clamp(2rem,4vw,3.3rem)] leading-[0.95] tracking-[-0.055em]">
              Launch is the start, not the end.
            </h2>
            <p className="text-[1.05rem] text-muted">
              One monthly plan covers hosting, maintenance, and IT support, so websites stay up to date and
              working, whether they&rsquo;re yours or your clients&rsquo;.
            </p>
            <div className="mt-7 flex items-baseline gap-2">
              <span className="text-[0.9rem] text-muted">From</span>
              <span className="font-display text-[3rem] leading-none font-bold tracking-[-0.06em]">$99</span>
              <span className="text-muted">/ month</span>
            </div>
            <a
              href="#contact"
              className="mt-7 inline-flex items-center justify-center rounded-full border border-brand-lime bg-brand-lime px-[21px] py-[14px] font-bold text-[#0a0b0d] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Ask about a care plan →
            </a>
          </div>

          <ul className="grid grid-cols-1 gap-3.5">
            {included.map((item) => (
              <li key={item.title} className="flex gap-4 rounded-[20px] border border-white/10 bg-[rgb(10_11_15/0.62)] p-5">
                <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 size-5 shrink-0" aria-hidden="true">
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="var(--color-brand-lime)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <b className="font-display text-[1.1rem]">{item.title}</b>
                  <span className="mt-1 block text-[0.92rem] text-muted">{item.body}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
