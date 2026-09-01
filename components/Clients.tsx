import Image from "next/image";
import { projects } from "@/lib/projects";
import Reveal from "./Reveal";

// Only projects with a usable white logo appear in the marquee.
const logos = projects.filter((project) => project.logo);

function Track({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      aria-hidden={ariaHidden || undefined}
      className="flex min-w-max items-center gap-11 px-6 py-[21px] sm:gap-[72px] sm:px-9 sm:py-[25px]"
    >
      {logos.map((project) => (
        <Image
          key={project.slug}
          src={project.logo!}
          alt={ariaHidden ? "" : project.title}
          width={240}
          height={32}
          className="h-7 w-auto shrink-0 opacity-70 transition-opacity duration-300 hover:opacity-100 sm:h-8"
        />
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

      {/* Two identical tracks scrolling as one strip — the animation translates
          half the total width, so the second track seamlessly takes over. */}
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
