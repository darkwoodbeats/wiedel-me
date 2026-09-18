import Reveal from "./Reveal";

const steps = [
  {
    title: "Intro call",
    body: "Tell me about the project, your goals, and your timeline. I'll tell you honestly whether I'm the right fit.",
  },
  {
    title: "Scope & quote",
    body: "I review the designs or brief and send a clear quote with what's included, so there are no surprises later.",
  },
  {
    title: "Build",
    body: "I design and build it, or build from your designs, and share progress as I go so you can review it before launch.",
  },
  {
    title: "Launch & care",
    body: "I launch it with you, then keep it hosted, updated, and supported on a monthly care plan.",
  },
];

export default function Process() {
  return (
    <section id="process" className="mx-auto w-[min(100%-40px,var(--container-site))] py-[90px]">
      <Reveal className="mb-[30px] block sm:flex sm:items-end sm:justify-between sm:gap-[30px]">
        <h2 className="m-0 font-display text-[clamp(2rem,4vw,3.3rem)] leading-[0.95] tracking-[-0.055em]">
          How working
          <br />
          with me works.
        </h2>
        <p className="mt-3 max-w-[470px] text-muted sm:m-0">
          Every project is quoted after I understand the scope. Here&rsquo;s the path from first call to launch.
        </p>
      </Reveal>
      <ol className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <Reveal
            key={step.title}
            as="li"
            delay={i * 60}
            className="rounded-(--radius-card) border border-line bg-white/2.5 p-7"
          >
            <div className="font-display text-[2.4rem] leading-none tracking-[-0.06em] text-brand-purple">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="mt-5 mb-2 font-display text-[1.25rem] leading-tight tracking-[-0.035em]">{step.title}</h3>
            <p className="m-0 text-[0.95rem] text-muted">{step.body}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
