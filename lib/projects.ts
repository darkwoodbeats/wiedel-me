type ProjectBase = {
  /** Display name shown on the card. */
  title: string;
  /** What the client does — one short line under the title. */
  sector: string;
  /** Live homepage. Also the card's link target. */
  url: string;
  /** Filename stem for the captured screenshot in /public/screenshots. */
  slug: string;
};

/**
 * A client with a usable white logo — exactly these appear in the marquee.
 *
 * `logo` and `logoWidth` travel together so every marquee image can declare its
 * true aspect ratio. Getting that wrong is visible: the strip animates while its
 * logos lazy-load, so a placeholder box of the wrong width drags the whole track
 * sideways as each image resolves.
 */
export type ProjectWithLogo = ProjectBase & {
  /** White, transparent logo in /public/img/project_logos. */
  logo: string;
  /**
   * Intrinsic width of `logo` at its natural 96px height. Read it off the file
   * (`sips -g pixelWidth -g pixelHeight`) rather than eyeballing it.
   */
  logoWidth: number;
};

/** No usable white logo — the marquee just skips it. */
type ProjectWithoutLogo = ProjectBase & {
  logo?: undefined;
  logoWidth?: undefined;
};

export type Project = ProjectWithLogo | ProjectWithoutLogo;

/**
 * Sites I've worked on. `slug` must match the captured screenshot filename —
 * run `npm run screenshots` to (re)capture all homepages into /public/screenshots.
 */
export const projects: Project[] = [
  { title: "Swanson Russell", sector: "Outdoor Marketing & Advertising Agency", url: "https://www.swansonrussell.com", slug: "swansonrussell", logo: "/img/project_logos/swansonrussell.png", logoWidth: 318 },
  { title: "Unanimous", sector: "Branding & Marketing Agency", url: "https://beunanimous.com", slug: "beunanimous", logo: "/img/project_logos/beunanimous.png", logoWidth: 576 },
  { title: "Hawkins Construction", sector: "Commercial Construction", url: "https://hawkinsconstruction.com", slug: "hawkinsconstruction", logo: "/img/project_logos/hawkinsconstruction.png", logoWidth: 421 },
  { title: "Black Magik Presents", sector: "Midwest Bass Music", url: "https://blackmagikpresents.com", slug: "blackmagikpresents", logo: "/img/project_logos/blackmagikpresents.png", logoWidth: 216 },
  { title: "Sagewell", sector: "Orthopaedics & Urgent Care", url: "https://sagewellmed.com", slug: "sagewellmed", logo: "/img/project_logos/sagewellmed.png", logoWidth: 393 },
  { title: "Rembolt Ludtke", sector: "Nebraska Law Firm", url: "https://remboltlawfirm.com", slug: "remboltlawfirm", logo: "/img/project_logos/remboltlawfirm.png", logoWidth: 492 },
  { title: "Avidist", sector: "Guns, Ammo & Outdoor News", url: "https://avidist.com", slug: "avidist" },
  { title: "Hughes Brothers", sector: "Electric Utility Products", url: "https://www.hughesbros.com", slug: "hughesbros", logo: "/img/project_logos/hughesbros.png", logoWidth: 441 },
  { title: "Nebraska Civic Engagement Table", sector: "Community Nonprofit", url: "https://www.nebraskatable.org", slug: "nebraskatable", logo: "/img/project_logos/nebraskatable.png", logoWidth: 270 },
  { title: "Electric Drive Transportation Association", sector: "Transportation Electrification", url: "https://electricdrive.org", slug: "electricdrive", logo: "/img/project_logos/electricdrive.png", logoWidth: 247 },
  { title: "York General", sector: "Healthcare System", url: "https://www.yorkgeneral.org", slug: "yorkgeneral", logo: "/img/project_logos/yorkgeneral.png", logoWidth: 636 },
  { title: "Bruning Bank", sector: "Community Banking", url: "https://www.bruningbank.com", slug: "bruningbank", logo: "/img/project_logos/bruningbank.png", logoWidth: 444 },
  { title: "Holdrege Area Chamber of Commerce", sector: "Chamber of Commerce", url: "https://www.holdregechamber.com", slug: "holdregechamber", logo: "/img/project_logos/holdregechamber.png", logoWidth: 565 },
  { title: "Rivers Metal Products", sector: "Custom Metal Fabrication", url: "https://www.riversmetal.com", slug: "riversmetal", logo: "/img/project_logos/riversmetal.png", logoWidth: 367 },
  { title: "Willet + Cumro Innovations", sector: "Innovation Consultancy", url: "https://www.willet-cumro.biz", slug: "willet-cumro", logo: "/img/project_logos/willet-cumro.png", logoWidth: 465 },
  { title: "Hyundai CE North America", sector: "Construction Equipment", url: "https://na.hd-hyundaice.com", slug: "hyundai-ce", logo: "/img/project_logos/hyundai.svg", logoWidth: 582 },
  { title: "Runza", sector: "Restaurant Chain", url: "https://runza.com", slug: "runza" },
];
