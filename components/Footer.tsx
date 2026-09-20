import { linkedinUrl } from "@/lib/site";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-line pt-[30px] pb-[45px] text-[0.85rem] text-[#777d89]">
      <div className="mx-auto flex w-[min(100%-40px,var(--container-site))] flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex flex-col items-start gap-3">
          <Logo className="h-3.5 text-ink" />
          <span>© {new Date().getFullYear()} Wiedel.me · Lincoln, Nebraska · Serving Omaha and beyond</span>
        </div>
        <nav className="flex flex-wrap gap-5">
          <a href="/#care" className="transition-colors hover:text-white">
            Care plans
          </a>
          <a href="/music/" className="transition-colors hover:text-white">
            DJ &amp; Music
          </a>
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
            LinkedIn
          </a>
        </nav>
      </div>
    </footer>
  );
}
