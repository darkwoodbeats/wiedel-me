import Image from "next/image";
import { projects, type ProjectWithLogo } from "@/lib/projects";

const logos = projects.filter((project): project is ProjectWithLogo => Boolean(project.logo));

/**
 * Every client logo at once, sitting still.
 *
 * The home page already scrolls these past in a marquee; here the point is the
 * opposite — the chapter says the work added up, so the whole pile has to be
 * visible in one frame to say it. Each one fades in on its own beat as the
 * field enters (wired up in YearRail), left to right, following the rail.
 */
export default function LogoField() {
  return (
    <ul data-logo-field className="mt-14 grid list-none grid-cols-2 gap-x-9 gap-y-10 p-0 sm:grid-cols-3 lg:grid-cols-4">
      {logos.map((project) => (
        <li key={project.slug} data-logo-item className="flex items-center">
          <Image
            src={project.logo}
            alt={project.title}
            width={project.logoWidth}
            height={96}
            className="h-[26px] w-auto max-w-full opacity-60 transition-opacity duration-300 hover:opacity-100 sm:h-7"
          />
        </li>
      ))}
    </ul>
  );
}
