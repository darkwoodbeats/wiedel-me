import Reveal from "./Reveal";

const facts = [
  { label: "Web + software", body: "Build, improve, debug, and maintain digital experiences." },
  { label: "Design", body: "Turn rough ideas into clean, usable visual systems." },
  { label: "Technology", body: "Translate technical problems into practical solutions." },
  { label: "Music", body: "Bring technical precision and human energy to sound." },
];

export default function About() {
  return (
    <section id="about" className="mx-auto w-[min(100%-40px,var(--container-site))] py-[90px]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="min-h-[330px] rounded-(--radius-card) border border-line bg-linear-[145deg,rgb(199_255_74/0.08),rgb(92_225_230/0.05)] p-[38px]">
          <div className="text-[0.76rem] font-bold tracking-[0.16em] text-brand-lime uppercase">The short version</div>
          <h3 className="mt-0 mb-[18px] font-display text-[2rem] tracking-[-0.05em]">
            Technical brain.
            <br />
            Creative instincts.
          </h3>
          <p className="text-[1.05rem] text-muted">
            I like solving the problem behind the problem. That might mean writing the code, fixing the computer,
            designing the brand, cleaning up the user experience, or making sure the room sounds right.
          </p>
          <p className="text-[1.05rem] text-muted">
            The common thread: thoughtful work, clear communication, and a finished result you can actually use.
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
