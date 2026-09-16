import Reveal from "./Reveal";

const facts = [
  { label: "No hand-offs", body: "No account managers or juniors. You talk directly to the person building it." },
  { label: "Fits how you work", body: "Agencies can hand me their designs, and I'll stay behind the scenes." },
  { label: "Local when it helps", body: "Based in Lincoln and an hour from Omaha, so I'm happy to meet in person." },
  { label: "I stick around", body: "Care plans keep launched sites hosted, updated, and supported after go-live." },
];

export default function About() {
  return (
    <section id="about" className="mx-auto w-[min(100%-40px,var(--container-site))] py-[90px]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="min-h-[330px] rounded-(--radius-card) border border-line bg-linear-[145deg,rgb(199_255_74/0.08),rgb(92_225_230/0.05)] p-[38px]">
          <div className="text-[0.76rem] font-bold tracking-[0.16em] text-brand-lime uppercase">Why work with me</div>
          <h2 className="mt-3 mb-[18px] font-display text-[2rem] leading-[0.95] tracking-[-0.05em]">
            Technical brain.
            <br />
            Creative instincts.
          </h2>
          <p className="text-[1.05rem] text-muted">
            Whether you run a business that needs its website done right or an agency that needs another developer, I
            bring both the technical and the design side. I communicate clearly and flag problems early instead of at
            launch.
          </p>
          <p className="mt-4 text-[1.05rem] text-muted">
            And because I also handle IT, I can take care of hosting and support after launch, so the site keeps working
            long after the project ends.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {facts.map((fact, i) => (
            <Reveal
              key={fact.label}
              delay={i * 60}
              className="rounded-[20px] border border-line bg-white/2.5 p-[25px]"
            >
              <b className="font-display text-[1.1rem]">{fact.label}</b>
              <span className="mt-2 block text-[0.9rem] text-muted">{fact.body}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
