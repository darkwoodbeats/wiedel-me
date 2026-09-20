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
      <div className="mx-auto flex h-[74px] w-[min(100%-40px,var(--container-site))] items-center justify-between gap-6 md:gap-9">
        <BrandLink className="group flex items-center text-ink transition-colors hover:text-brand-purple">
          <Logo animated mark className="h-4 sm:h-[18px]" />
        </BrandLink>

        <nav className="hidden items-center gap-4 text-[0.86rem] text-muted md:flex lg:gap-6 lg:text-[0.92rem]">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="whitespace-nowrap transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="/#contact"
          className="inline-flex shrink-0 items-center gap-[9px] rounded-full border border-line px-[15px] py-[10px] text-[0.86rem] whitespace-nowrap"
        >
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inset-0 animate-blip rounded-full border border-status motion-reduce:hidden" />
            <span className="absolute inset-0 animate-blip rounded-full border border-status [animation-delay:1.6s] motion-reduce:hidden" />
            <i className="relative size-2 rounded-full bg-status shadow-[0_0_18px_var(--color-status)]" />
          </span>
          {/* The full phrase only fits once the menu has room for it. */}
          <span className="lg:hidden">Available</span>
          <span className="hidden lg:inline">Available for projects</span>
        </a>
      </div>
    </header>
  );
}
