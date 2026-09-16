import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Clients from "@/components/Clients";
import ServiceGrid, { type Service } from "@/components/ServiceGrid";
import About from "@/components/About";
import Process from "@/components/Process";
import CarePlans from "@/components/CarePlans";
import Projects from "@/components/Projects";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
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
  founder: { "@type": "Person", name: "Caleb Wiedel", sameAs: [linkedinUrl] },
  address: { "@type": "PostalAddress", addressLocality: "Lincoln", addressRegion: "NE", addressCountry: "US" },
  areaServed: [
    { "@type": "City", name: "Lincoln, Nebraska" },
    { "@type": "City", name: "Omaha, Nebraska" },
  ],
  sameAs: [linkedinUrl],
};

export default function Home() {
  return (
    <main id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <Clients />
      <ServiceGrid
        id="services"
        title={
          <>
            What I can do
            <br />
            for you.
          </>
        }
        intro="Need a new website for your business, an extra developer for your agency, or someone to look after a site after launch? Start here."
        services={services}
      />
      <About />
      <Process />
      <CarePlans />
      <Projects />
      <Testimonials />
      <Contact
        heading="Got a project on your plate?"
        body="Tell me about the project, the deadline, and what you need from me. I'll get back to you with next steps and a quote."
        footnote="Lincoln · Omaha · Remote"
        serviceOptions={serviceOptions}
        subject="New lead from wiedel.me"
      />
    </main>
  );
}
