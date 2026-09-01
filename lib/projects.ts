export type Project = {
  /** Display name shown on the card. */
  title: string;
  /** What the client does — one short line under the title. */
  sector: string;
  /** Live homepage. Also the card's link target. */
  url: string;
  /** Filename stem for the captured screenshot in /public/screenshots. */
  slug: string;
  /**
   * White, transparent logo in /public/img/logos, rendered in the client marquee.
   * Omit when there's no usable white version — the marquee just skips it.
   */
  logo?: string;
};

/**
 * Sites I've worked on. `slug` must match the captured screenshot filename —
 * run `npm run screenshots` to (re)capture all homepages into /public/screenshots.
 */
export const projects: Project[] = [
  { title: "Swanson Russell", sector: "Outdoor Marketing & Advertising Agency", url: "https://www.swansonrussell.com", slug: "swansonrussell", logo: "/img/logos/swansonrussell.png" },
  { title: "Unanimous", sector: "Branding & Marketing Agency", url: "https://beunanimous.com", slug: "beunanimous", logo: "/img/logos/beunanimous.png" },
  { title: "Hawkins Construction", sector: "Commercial Construction", url: "https://hawkinsconstruction.com", slug: "hawkinsconstruction", logo: "/img/logos/hawkinsconstruction.png" },
  { title: "Black Magik Presents", sector: "Midwest Bass Music", url: "https://blackmagikpresents.com", slug: "blackmagikpresents", logo: "/img/logos/blackmagikpresents.png" },
  { title: "Sagewell", sector: "Orthopaedics & Urgent Care", url: "https://sagewellmed.com", slug: "sagewellmed", logo: "/img/logos/sagewellmed.png" },
  { title: "Rembolt Ludtke", sector: "Nebraska Law Firm", url: "https://remboltlawfirm.com", slug: "remboltlawfirm", logo: "/img/logos/remboltlawfirm.png" },
  { title: "Avidist", sector: "Guns, Ammo & Outdoor News", url: "https://avidist.com", slug: "avidist" },
  { title: "Hughes Brothers", sector: "Electric Utility Products", url: "https://www.hughesbros.com", slug: "hughesbros", logo: "/img/logos/hughesbros.png" },
  { title: "Nebraska Civic Engagement Table", sector: "Community Nonprofit", url: "https://www.nebraskatable.org", slug: "nebraskatable", logo: "/img/logos/nebraskatable.png" },
  { title: "Electric Drive Transportation Association", sector: "Transportation Electrification", url: "https://electricdrive.org", slug: "electricdrive", logo: "/img/logos/electricdrive.png" },
  { title: "York General", sector: "Healthcare System", url: "https://www.yorkgeneral.org", slug: "yorkgeneral", logo: "/img/logos/yorkgeneral.png" },
  { title: "Bruning Bank", sector: "Community Banking", url: "https://www.bruningbank.com", slug: "bruningbank", logo: "/img/logos/bruningbank.png" },
  { title: "Holdrege Area Chamber of Commerce", sector: "Chamber of Commerce", url: "https://www.holdregechamber.com", slug: "holdregechamber", logo: "/img/logos/holdregechamber.png" },
  { title: "Rivers Metal Products", sector: "Custom Metal Fabrication", url: "https://www.riversmetal.com", slug: "riversmetal", logo: "/img/logos/riversmetal.png" },
  { title: "Willet + Cumro Innovations", sector: "Innovation Consultancy", url: "https://www.willet-cumro.biz", slug: "willet-cumro", logo: "/img/logos/willet-cumro.png" },
  { title: "Hyundai CE North America", sector: "Construction Equipment", url: "https://na.hd-hyundaice.com", slug: "hyundai-ce", logo: "/img/logos/hyundai.svg" },
  { title: "Runza", sector: "Restaurant Chain", url: "https://runza.com", slug: "runza" },
];
