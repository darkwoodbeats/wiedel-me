/** What I did on a project, shown as a badge on its card. */
export type Role = "Designed & Built" | "Developed" | "Maintained";

type ProjectBase = {
  /** Display name shown on the card. */
  title: string;
  /** What the client does: one short line under the title. */
  sector: string;
  /** Live homepage. Also the card's link target. */
  url: string;
  /** Filename stem for the homepage screenshot in /public/screenshots. */
  slug: string;
  /**
   * My part in the project: "Designed & Built" (designed it, built it and look after it),
   * "Developed" (built it) or "Maintained" (looked after it). Set for every project in Recent
   * projects; the card shows no badge without one, so set it before un-hiding a project that has
   * none.
   */
  role?: Role;
  /** Longer project write-up. None are written yet; the card shows it once one is. */
  description?: string;
  /** false leaves the project out of the Recent projects grid; its logo still shows in the strip. */
  inWork?: false;
  /** false leaves the logo out of the logo strip; the project still shows in Recent projects. */
  inStrip?: false;
};

/**
 * A client with a usable white logo: exactly these appear in the logo strip.
 *
 * `logo` and `logoWidth` travel together so every strip image can declare its true aspect
 * ratio. Getting that wrong is visible: the strip animates while its logos lazy-load, so a
 * placeholder box of the wrong width drags the whole track sideways as each image resolves.
 */
export type ProjectWithLogo = ProjectBase & {
  /** White, transparent logo in /public/img/project_logos. */
  logo: string;
  /** Intrinsic width of `logo` at its natural 96px height (`sips -g pixelWidth`). */
  logoWidth: number;
  /**
   * Optical size in the strip, for a mark that reads small at the standard height (Runza's ring
   * leaves its letters short). Drawn with a transform, so the strip's spacing doesn't change.
   */
  logoScale?: number;
};

/** No usable white logo: the strip just skips it. */
type ProjectWithoutLogo = ProjectBase & {
  logo?: undefined;
  logoWidth?: undefined;
};

export type Project = ProjectWithLogo | ProjectWithoutLogo;

/** Screenshots are captured at 1280×800 @2x, so 16:10. */
export const SCREENSHOT = { width: 2560, height: 1600 } as const;

export const screenshotSrc = (project: Project) => `/screenshots/${project.slug}.jpg`;

/**
 * Sites I've worked on, migrated from wiedel.me. `slug` must match the screenshot filename.
 * The number on each card comes from this order.
 */
export const projects: Project[] = [
  { title: "Black Magik Presents", sector: "Midwest Bass Music", url: "https://blackmagikpresents.com", slug: "blackmagikpresents", role: "Designed & Built", logo: "/img/project_logos/blackmagikpresents.png", logoWidth: 216 },
  { title: "ClearLine Chiropractic", sector: "Chiropractic Clinic", url: "https://clearlinechiro.com", slug: "clearlinechiro", role: "Designed & Built" },
  { title: "Hawkins Construction", sector: "Commercial Construction", url: "https://hawkinsconstruction.com", slug: "hawkinsconstruction", role: "Developed", logo: "/img/project_logos/hawkinsconstruction.png", logoWidth: 421 },
  { title: "Hyundai CE North America", sector: "Construction Equipment", url: "https://na.hd-hyundaice.com", slug: "hyundai-ce", role: "Maintained", logo: "/img/project_logos/hyundai.svg", logoWidth: 582 },
  { title: "Runza", sector: "Restaurant Chain", url: "https://runza.com", slug: "runza", role: "Maintained", logo: "/img/project_logos/runza.svg", logoWidth: 179, logoScale: 1.4 },
  { title: "Swanson Russell", sector: "Outdoor Marketing & Advertising Agency", url: "https://www.swansonrussell.com", slug: "swansonrussell", role: "Maintained", logo: "/img/project_logos/swansonrussell.png", logoWidth: 318 },
  { title: "Sagewell", sector: "Orthopaedics & Urgent Care", url: "https://sagewellmed.com", slug: "sagewellmed", logo: "/img/project_logos/sagewellmed.png", logoWidth: 393, inWork: false },
  { title: "Rembolt Ludtke", sector: "Nebraska Law Firm", url: "https://remboltlawfirm.com", slug: "remboltlawfirm", logo: "/img/project_logos/remboltlawfirm.png", logoWidth: 492, inWork: false },
  { title: "Avidist", sector: "Guns, Ammo & Outdoor News", url: "https://avidist.com", slug: "avidist", inWork: false },
  { title: "Hughes Brothers", sector: "Electric Utility Products", url: "https://www.hughesbros.com", slug: "hughesbros", logo: "/img/project_logos/hughesbros.png", logoWidth: 441, inWork: false, inStrip: false },
  { title: "Nebraska Civic Engagement Table", sector: "Community Nonprofit", url: "https://www.nebraskatable.org", slug: "nebraskatable", logo: "/img/project_logos/nebraskatable.svg", logoWidth: 270, inWork: false },
  { title: "Electric Drive Transportation Association", sector: "Transportation Electrification", url: "https://electricdrive.org", slug: "electricdrive", logo: "/img/project_logos/electricdrive.png", logoWidth: 247, inWork: false, inStrip: false },
  { title: "York General", sector: "Healthcare System", url: "https://www.yorkgeneral.org", slug: "yorkgeneral", logo: "/img/project_logos/yorkgeneral.png", logoWidth: 636, inWork: false },
  { title: "Bruning Bank", sector: "Community Banking", url: "https://www.bruningbank.com", slug: "bruningbank", logo: "/img/project_logos/bruningbank.png", logoWidth: 444, inWork: false },
  { title: "Holdrege Area Chamber of Commerce", sector: "Chamber of Commerce", url: "https://www.holdregechamber.com", slug: "holdregechamber", logo: "/img/project_logos/holdregechamber.png", logoWidth: 565, inWork: false },
  { title: "Rivers Metal Products", sector: "Custom Metal Fabrication", url: "https://www.riversmetal.com", slug: "riversmetal", logo: "/img/project_logos/riversmetal.png", logoWidth: 367, inWork: false, inStrip: false },
  { title: "Willet + Cumro Innovations", sector: "Innovation Consultancy", url: "https://www.willet-cumro.biz", slug: "willet-cumro", logo: "/img/project_logos/willet-cumro.png", logoWidth: 465, inWork: false },
  { title: "Unanimous", sector: "Branding & Marketing Agency", url: "https://beunanimous.com", slug: "beunanimous", role: "Developed", logo: "/img/project_logos/beunanimous.png", logoWidth: 576 },
  { title: "Union Bank & Trust", sector: "Banking & Wealth Management", url: "https://www.ubt.com", slug: "ubt", role: "Maintained", logo: "/img/project_logos/ubt.png", logoWidth: 305 },
];
