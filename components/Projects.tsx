import Image from "next/image";
import { projects } from "@/lib/projects";
import Reveal from "./Reveal";

export default function Projects() {
  return (
    <section id="work" className="mx-auto w-[min(100%-40px,var(--container-site))] py-[90px]">
      <Reveal className="mb-[30px] block sm:flex sm:items-end sm:justify-between sm:gap-[30px]">
        <h2 className="m-0 font-display text-[clamp(2rem,4vw,3.3rem)] leading-[0.95] tracking-[-0.055em]">
          Recent
          <br />
          projects.
        </h2>
        <p className="mt-3 max-w-[470px] text-muted sm:m-0">
          Sites I&rsquo;ve designed, built, or helped maintain. Every screenshot is the live homepage as it stands
          today.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <Reveal key={project.slug} as="article" delay={(i % 3) * 60}>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block h-full overflow-hidden rounded-(--radius-card) border border-line bg-linear-[180deg,rgb(255_255_255/0.045),rgb(255_255_255/0.02)] transition duration-250 hover:-translate-y-[5px] hover:border-[#3b4150] focus-visible:-translate-y-[5px] focus-visible:border-brand-cyan focus-visible:outline-none"
            >
              {/* Homepage screenshot — captured at 1280x800, so 16:10. */}
              <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-panel">
                <Image
                  src={`/screenshots/${project.slug}.jpg`}
                  alt={`${project.title} homepage`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>

              <div className="p-6">
                <div className="font-display text-[0.8rem] text-brand-purple">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 mb-1.5 font-display text-[1.25rem] leading-tight tracking-[-0.035em]">
                  {project.title}
                </h3>
                <p className="m-0 text-[0.9rem] text-muted">{project.sector}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[0.8rem] text-[#c9ced8] transition-colors group-hover:text-brand-cyan">
                  {new URL(project.url).hostname.replace(/^www\./, "")}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    ↗
                  </span>
                </span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
