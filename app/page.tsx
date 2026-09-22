import type { Metadata } from "next";
import Chapter from "@/components/decade/Chapter";
import DecadeHero from "@/components/decade/DecadeHero";
import LogoField from "@/components/decade/LogoField";
import YearRail from "@/components/decade/YearRail";
import ServiceGrid, { type Service } from "@/components/ServiceGrid";
import About from "@/components/About";
import Process from "@/components/Process";
import CarePlans from "@/components/CarePlans";
import Projects from "@/components/Projects";
// Testimonials are parked for now — uncomment this and the tag below to bring them back.
// import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import { anniversaryYear, chapters, startYear, yearsInBusiness } from "@/lib/decade";
import { linkedinUrl, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const services: Service[] = [
  {
    num: "01 / BUILD",
    title: "Web Design & Development",
    body: "Responsive, accessible websites, designed and built from scratch or built from your agency's designs.",
    chips: ["New sites", "Front-end", "Responsive", "Accessibility"],
  },
  {
    num: "02 / DESIGN",
    title: "Graphic & Logo Design",
    body: "Logos, brand assets, social graphics, and print pieces, whether you're building a brand or your design team needs extra hands.",
    chips: ["Logos", "Branding", "Print", "Social"],
  },
  {
    num: "03 / MAINTAIN",
    title: "Updates & Fixes",
    body: "Updates, bug fixes, and troubleshooting on websites that are already live, no matter who built them.",
    chips: ["Updates", "Bug fixes", "Troubleshooting"],
  },
  {
    num: "04 / TECH",
    title: "IT Help & Tech Support",
    body: "Practical IT for small businesses and offices: computers, software, networks, setup, and migrations.",
    chips: ["Small business", "Networks", "Setup", "Migrations"],
  },
];

const serviceOptions = [
  "Web design / development",
  "Graphic / logo design",
  "Updates & fixes",
  "Care plan (from $99/mo)",
  "IT help",
  "Agency / subcontract project",
  "Something else",
];

// Structured data so search engines can tie the business to Lincoln and Omaha.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Wiedel.me",
  url: siteUrl,
  logo: `${siteUrl}/img/wiedel-me-logo.svg`,
  image: `${siteUrl}/img/CalebWiedel_square.jpg`,
  description: "Web development, design, IT help, and care plans for businesses and agencies.",
  // Drawn from lib/decade.ts, so the page's story and its structured data can't
  // drift apart. Correct it there, not here.
  foundingDate: String(startYear),
  founder: { "@type": "Person", name: "Caleb Wiedel", sameAs: [linkedinUrl] },
  address: { "@type": "PostalAddress", addressLocality: "Lincoln", addressRegion: "NE", addressCountry: "US" },
  areaServed: [
    { "@type": "City", name: "Lincoln, Nebraska" },
    { "@type": "City", name: "Omaha, Nebraska" },
  ],
  sameAs: [linkedinUrl],
};

/**
 * The anniversary home page, in two acts.
 *
 * Act one is the story: a single rail down the left gutter that fills as you
 * scroll from {startYear} to {anniversaryYear}, with the year riding along
 * beside it. Act two is the pitch — the same services, process, care plans, and
 * work as before, unchanged, picking up where the story lands.
 *
 * The client marquee is gone from this page on purpose: chapter two shows every
 * one of those logos at once, standing still, which is the point it is making.
 */
export default function Home() {
  return (
    <main id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <DecadeHero />

      <YearRail>
        {chapters.map((chapter) => (
          <Chapter key={chapter.id} chapter={chapter}>
            {chapter.id === "work" && <LogoField />}
          </Chapter>
        ))}
      </YearRail>

      <ServiceGrid
        id="services"
        title={
          <>
            What I can do
            <br />
            for you.
          </>
        }
        intro={`After ${yearsInBusiness} years the list is short and it has not changed much. A new website for your business, an extra developer for your agency, or someone to look after a site once it is live.`}
        services={services}
      />
      <About />
      <Process />
      <CarePlans />
      <Projects />
      {/* <Testimonials /> */}
      <Contact
        heading="Here's to the next ten."
        body="Tell me about the project, the deadline, and what you need from me. I'll get back to you with next steps and a quote."
        footnote="Lincoln · Omaha · Remote"
        serviceOptions={serviceOptions}
        subject="New lead from wiedel.me"
      />
    </main>
  );
}
