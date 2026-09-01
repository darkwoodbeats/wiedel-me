import BrandLink from "./BrandLink";

const links = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/6 bg-bg/76 backdrop-blur-[18px]">
      <div className="mx-auto flex h-[74px] w-[min(100%-40px,var(--container-site))] items-center justify-between">
        <BrandLink className="font-display text-xl font-bold tracking-[-0.04em]">Caleb Wiedel</BrandLink>

        <nav className="hidden gap-6 text-[0.92rem] text-muted md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="inline-flex items-center gap-[9px] rounded-full border border-line px-[15px] py-[10px] text-[0.86rem]"
        >
          <i className="size-2 rounded-full bg-brand-lime shadow-[0_0_18px_var(--color-brand-lime)]" />
          Available for projects
        </a>
      </div>
    </header>
  );
}
