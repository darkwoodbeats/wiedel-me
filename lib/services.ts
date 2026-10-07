/** Site copy for the Services section, migrated from wiedel.me. */

export interface Service {
  /** Number and one-word tag, matching the hero eyebrow, e.g. "01 / WEB". */
  num: string;
  title: string;
  body: string;
  /** Short capability tags. */
  chips: string[];
  /** Optional link onward to the page with the full details. */
  link?: { label: string; href: string };
}

export interface ServicesCopy {
  /** Heading lines (each renders on its own line on wide screens). */
  title: string[];
  /** A brush-script line after the heading, set like the hero's "Since 2016" (see SectionHead). */
  script?: string;
  intro: string;
  services: Service[];
}

export const homeServices: ServicesCopy = {
  title: ["Here’s what", "I can do"],
  script: "for you.",
  intro:
    "Need a new website, a fresh logo, help with your tech, or a DJ for your next event? Whatever it is, you work directly with me from start to finish.",
  services: [
    {
      num: "01 / WEB",
      title: "Web Design & Development",
      body: "Responsive, accessible websites, designed and built from scratch or from your agency’s designs. Already live? I also handle updates, fixes, and troubleshooting, no matter who built it.",
      chips: ["New sites", "Updates & fixes", "Accessibility", "SEO"],
    },
    {
      num: "02 / DESIGN",
      title: "Graphic & Logo Design",
      body: "Logos, brand assets, social graphics, and print pieces, whether you’re building a brand or your design team needs extra hands.",
      chips: ["Logos", "Branding", "Print", "Social"],
    },
    {
      num: "03 / TECH",
      title: "IT Help & Tech Support",
      body: "Practical IT for small businesses and offices: computers, software, networks, setup, and migrations.",
      chips: ["Small business", "Networks", "Setup", "Migrations"],
    },
    {
      num: "04 / SOUND",
      title: "DJ & Music Production",
      body: "DJ and MC services for weddings and events, DJ lessons, and recording, mixing, and mastering for your music.",
      chips: ["Weddings & events", "DJ lessons", "Recording", "Mixing & mastering"],
      link: { label: "See DJ & music →", href: "/music/" },
    },
  ],
};

export const process = {
  title: ["How working", "with me works."],
  intro:
    "Every project is quoted after I understand the scope. Here’s the path from first call to launch.",
  steps: [
    {
      title: "Intro call",
      body: "Tell me about the project, your goals, and your timeline. I’ll tell you honestly whether I’m the right fit.",
    },
    {
      title: "Scope & quote",
      body: "I review the designs or brief and send a clear quote with what’s included, so there are no surprises later.",
    },
    {
      title: "Build",
      body: "I design and build it, or build from your designs, and share progress as I go so you can review it before launch.",
    },
    {
      title: "Launch & care",
      body: "I launch it with you, then stick around for updates, fixes, and support.",
    },
  ],
};

export const carePlan = {
  label: "Care plans",
  title: "Launch is the start, not the end.",
  body: "One monthly plan covers hosting, maintenance, and IT support, so websites stay up to date and working, whether they’re yours or your clients’.",
  price: { from: "From", amount: "$99", per: "/ month" },
  cta: "Ask about a care plan →",
  included: [
    { title: "Hosting", body: "I host the site, so there’s no separate hosting company to deal with." },
    { title: "Maintenance", body: "Ongoing updates and fixes, so the site doesn’t fall behind." },
    {
      title: "IT support",
      body: "Practical help with the technology around the site: computers, software, and networks.",
    },
  ],
};
