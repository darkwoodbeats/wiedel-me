import BrandLink from "./BrandLink";
import Logo from "./Logo";

// Root-relative so the section links still work from /music/.
const links = [
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "Process" },
  { href: "/#care", label: "Care plans" },
  { href: "/#work", label: "Work" },
  { href: "/music/", label: "DJ & Music" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/6 bg-bg/76 backdrop-blur-[18px]">
      <div className="mx-auto flex h-[74px] w-[min(100%-40px,var(--container-site))] items-center justify-between">
        <BrandLink className="text-ink transition-colors hover:text-brand-lime">
          <Logo className="block h-4 w-auto sm:h-[18px]" />
        </BrandLink>

        <nav className="hidden gap-6 text-[0.92rem] text-muted md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="/#contact"
          className="inline-flex items-center gap-[9px] rounded-full border border-line px-[15px] py-[10px] text-[0.86rem]"
        >
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inset-0 animate-blip rounded-full border border-brand-lime motion-reduce:hidden" />
            <span className="absolute inset-0 animate-blip rounded-full border border-brand-lime [animation-delay:1.6s] motion-reduce:hidden" />
            <i className="relative size-2 rounded-full bg-brand-lime shadow-[0_0_18px_var(--color-brand-lime)]" />
          </span>
          Available for projects
        </a>
      </div>
    </header>
  );
}
