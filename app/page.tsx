import type { Metadata } from "next";
import OutrunHero from "@/components/hero/OutrunHero";
import { About } from "@/components/site/About";
import { Audiences } from "@/components/site/Audiences";
import { ClientLogos } from "@/components/site/ClientLogos";
import { Contact } from "@/components/site/Contact";
import { Process, Services } from "@/components/site/Services";
import { SiteHeader } from "@/components/site/SiteHeader";
import { StickyHeader } from "@/components/site/StickyHeader";
import { Work } from "@/components/site/Work";
import { homeContact } from "@/lib/contact";
import { homeServices } from "@/lib/services";
import { linkedinUrl, siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Structured data so search engines can tie the business to Lincoln and Omaha (from wiedel.me).
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/img/wiedel-me-logo.svg`,
  image: `${siteUrl}/img/CalebWiedel_square.jpg`,
  description: "Web design and development, graphic design, tech support, and DJ and music services for businesses and agencies.",
  founder: { "@type": "Person", name: "Caleb Wiedel", sameAs: [linkedinUrl] },
  address: { "@type": "PostalAddress", addressLocality: "Lincoln", addressRegion: "NE", addressCountry: "US" },
  areaServed: [
    { "@type": "City", name: "Lincoln, Nebraska" },
    { "@type": "City", name: "Omaha, Nebraska" },
  ],
  sameAs: [linkedinUrl],
};

/**
 * The home page, one continuous sequence: the 3D hero as the opening shot, the client logos and
 * who the work is for, then the work, the person, the services and the call to action.
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <StickyHeader>
        <SiteHeader />
      </StickyHeader>
      <main>
        <OutrunHero />
        <ClientLogos />
        <Audiences />
        <Work />
        <About />
        <Services num="03" copy={homeServices} split>
          <Process />
        </Services>
        <Contact num="04" copy={homeContact} />
      </main>
    </>
  );
}
