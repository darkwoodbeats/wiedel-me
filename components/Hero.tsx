import Image from "next/image";
import BookCallLink from "./BookCallLink";
import Reveal from "./Reveal";

const tags = ["Web", "Design", "IT", "Care plans"];

export default function Hero() {
  // Two columns only from lg up — at md the right column gets too narrow for the
  // profile card's text to sit beside the portrait.
  return (
    <section className="mx-auto grid w-[min(100%-40px,var(--container-site))] grid-cols-1 items-center gap-[70px] pt-[70px] pb-[90px] lg:grid-cols-[1.15fr_0.85fr] lg:pt-[100px]">
      <Reveal>
        <div className="text-[0.76rem] font-bold tracking-[0.16em] text-brand-lime uppercase">
          Lincoln, Nebraska · Web, design &amp; IT
        </div>
        <h1 className="my-[18px] mb-7 font-display text-[3.45rem] leading-[0.94] tracking-[-0.07em] sm:text-[clamp(3.2rem,7vw,6.5rem)]">
          Websites built right. <span className="text-gradient">And looked after.</span>
        </h1>
        <p className="max-w-[650px] text-[1.18rem] text-muted">
          I&rsquo;m Caleb, a web developer and designer in Lincoln. Local businesses hire me to build and care for their
          websites, and agencies in Lincoln, Nashville, and Kansas City bring me in when they need another developer. Either way, you work directly with me from start to finish.
        </p>
        <div className="mt-[34px] flex flex-wrap gap-3">
          <BookCallLink className="inline-flex items-center justify-center rounded-full border border-brand-lime bg-brand-lime px-[21px] py-[14px] font-bold text-[#0a0b0d] transition-transform duration-200 hover:-translate-y-0.5">
            Book an intro call →
          </BookCallLink>
          <a
            href="#process"
            className="inline-flex items-center justify-center rounded-full border border-line bg-white/3 px-[21px] py-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
          >
            See how it works
          </a>
        </div>
      </Reveal>

      {/* The inner card sits in normal flow (not absolutely positioned) so it grows
          with its content instead of overflowing. min-height keeps the original
          proportions when the text is short. */}
      <Reveal className="relative flex min-h-[340px] items-center overflow-hidden rounded-[32px] border border-line bg-linear-[145deg,#151820,#0d0f15] p-[18px] sm:p-[34px] lg:min-h-[310px]">
        {/* Blurred accent orbs — previously .orb:before / .orb:after */}
        <div className="pointer-events-none absolute -top-[50px] -right-[50px] size-[260px] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgb(199_255_74/0.95),rgb(199_255_74/0)_68%)] blur-[1px]" />
        <div className="pointer-events-none absolute -bottom-[140px] -left-[120px] size-[330px] rounded-full bg-[radial-gradient(circle_at_60%_40%,rgb(92_225_230/0.8),rgb(92_225_230/0)_67%)] blur-[1px]" />

        <div className="relative z-1 flex w-full flex-col-reverse items-start gap-4 rounded-3xl border border-white/12 bg-[rgb(10_11_15/0.62)] p-5 backdrop-blur-[18px] min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between sm:gap-[18px] sm:p-6">
          <div className="min-w-0 flex-1">
            <div className="font-display text-[1.35rem] leading-[1.05] font-bold tracking-[-0.045em] text-balance text-ink sm:text-[1.65rem]">
              Caleb Wiedel
            </div>
            <div className="mt-1 text-[0.8rem] text-brand-lime">Founder, Wiedel.me</div>
            <p className="mt-[9px] text-[0.84rem] text-pretty text-muted sm:mt-3 sm:text-[0.92rem]">
              One person, start to finish. The person you talk to is the person doing the work.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/6 px-[9px] py-1.5 text-[0.75rem] text-[#dce0e8]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <Image
            src="/img/CalebWiedel_square.jpg"
            alt="Caleb Wiedel"
            width={124}
            height={124}
            priority
            className="block size-[92px] shrink-0 rounded-full border-2 border-white/18 object-cover sm:size-[124px]"
          />
        </div>
      </Reveal>
    </section>
  );
}
