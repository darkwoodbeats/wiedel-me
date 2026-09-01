import Image from "next/image";
import Reveal from "./Reveal";

const wordmarks = [
  { label: "CLIENT NAME", outlined: false },
  { label: "COMPANY NAME", outlined: true },
  { label: "ENTITY NAME", outlined: false },
  { label: "PROJECT NAME", outlined: true },
  { label: "STUDIO NAME", outlined: false },
  { label: "ORG NAME", outlined: true },
];

function Track({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      aria-hidden={ariaHidden || undefined}
      className="flex min-w-max items-center gap-11 px-6 py-[21px] sm:gap-[72px] sm:px-9 sm:py-[25px]"
    >
      {!ariaHidden && (
        <span className="shrink-0">
          <Image src="/img/logos/hyundai.svg" alt="Hyundai" width={120} height={32} className="h-8 w-auto" />
        </span>
      )}
      {wordmarks.map((mark) => (
        <span
          key={mark.label}
          className={`font-display text-[1.08rem] font-bold tracking-[0.08em] whitespace-nowrap ${
            mark.outlined ? "text-outlined" : "text-[#dce0e8]"
          }`}
        >
          {mark.label}
        </span>
      ))}
    </div>
  );
}

export default function Clients() {
  return (
    <section aria-labelledby="clients-title" className="overflow-hidden pt-[30px] pb-5">
      <div className="mx-auto w-[min(100%-40px,var(--container-site))]">
        <Reveal className="mb-[22px] block sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div id="clients-title" className="text-[0.76rem] font-bold tracking-[0.16em] text-brand-lime uppercase">
            Selected work
          </div>
          <span className="mt-2 block text-[0.9rem] text-muted sm:mt-0 sm:inline">
            Companies, teams, and people I&rsquo;ve helped.
          </span>
        </Reveal>
      </div>

      <div
        aria-label="Selected clients and collaborators"
        className="flex w-max animate-marquee border-y border-line motion-reduce:animate-none"
      >
        <Track />
        <Track ariaHidden />
      </div>
    </section>
  );
}
