import type { ReactNode } from "react";
import Reveal from "./Reveal";

export type Service = {
  num: string;
  title: string;
  body: string;
  chips: string[];
};

type ServiceGridProps = {
  id?: string;
  title: ReactNode;
  intro: ReactNode;
  services: Service[];
};

export default function ServiceGrid({ id, title, intro, services }: ServiceGridProps) {
  return (
    <section id={id} className="mx-auto w-[min(100%-40px,var(--container-site))] py-[90px]">
      <Reveal className="mb-[30px] block sm:flex sm:items-end sm:justify-between sm:gap-[30px]">
        <h2 className="m-0 font-display text-[clamp(2rem,4vw,3.3rem)] leading-[0.95] tracking-[-0.055em]">{title}</h2>
        <p className="mt-3 max-w-[470px] text-muted sm:m-0">{intro}</p>
      </Reveal>
      {/* Four cards pair up 2×2; three sit in a row. */}
      <div
        className={`grid grid-cols-1 gap-3.5 sm:grid-cols-2 ${services.length % 3 === 0 ? "lg:grid-cols-3" : ""}`}
      >
        {services.map((service, i) => (
          <Reveal
            key={service.num}
            as="article"
            delay={i * 60}
            className="min-h-[220px] rounded-(--radius-card) border border-line bg-linear-[180deg,rgb(255_255_255/0.045),rgb(255_255_255/0.02)] p-7 transition duration-250 hover:-translate-y-[5px] hover:border-[#3b4150]"
          >
            <div className="font-display text-[0.8rem] text-brand-lime">{service.num}</div>
            <h3 className="mt-3 mb-1.5 font-display text-[1.45rem] leading-tight tracking-[-0.035em]">
              {service.title}
            </h3>
            <p className="m-0 text-muted">{service.body}</p>
            <div className="mt-5 flex flex-wrap gap-[7px]">
              {service.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-lg border border-line bg-[#0d0f14] px-[9px] py-1.5 text-[0.72rem] text-[#c9ced8]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
