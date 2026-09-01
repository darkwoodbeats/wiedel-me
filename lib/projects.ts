export type Project = {
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
 * Sites I've worked on. `slug` must match the captured screenshot filename —
 * run `npm run screenshots` to (re)capture all homepages into /public/screenshots.
 */
export const projects: Project[] = [
  { title: "Unanimous", sector: "Branding & Marketing Agency", url: "https://beunanimous.com", slug: "beunanimous" },
  { title: "Hawkins Construction", sector: "Commercial Construction", url: "https://hawkinsconstruction.com", slug: "hawkinsconstruction" },
  { title: "Black Magik Presents", sector: "Midwest Bass Music", url: "https://blackmagikpresents.com", slug: "blackmagikpresents" },
  { title: "Sagewell", sector: "Orthopaedics & Urgent Care", url: "https://sagewellmed.com", slug: "sagewellmed" },
  { title: "Rembolt Ludtke", sector: "Nebraska Law Firm", url: "https://remboltlawfirm.com", slug: "remboltlawfirm" },
  { title: "Avidist", sector: "Guns, Ammo & Outdoor News", url: "https://avidist.com", slug: "avidist" },
  { title: "Hughes Brothers", sector: "Electric Utility Products", url: "https://www.hughesbros.com", slug: "hughesbros" },
  { title: "Nebraska Civic Engagement Table", sector: "Community Nonprofit", url: "https://www.nebraskatable.org", slug: "nebraskatable" },
  { title: "Electric Drive Transportation Association", sector: "Transportation Electrification", url: "https://electricdrive.org", slug: "electricdrive" },
  { title: "York General", sector: "Healthcare System", url: "https://www.yorkgeneral.org", slug: "yorkgeneral" },
  { title: "Bruning Bank", sector: "Community Banking", url: "https://www.bruningbank.com", slug: "bruningbank" },
  { title: "Holdrege Area Chamber of Commerce", sector: "Chamber of Commerce", url: "https://www.holdregechamber.com", slug: "holdregechamber" },
  { title: "Rivers Metal Products", sector: "Custom Metal Fabrication", url: "https://www.riversmetal.com", slug: "riversmetal" },
  { title: "Willet + Cumro Innovations", sector: "Innovation Consultancy", url: "https://www.willet-cumro.biz", slug: "willet-cumro" },
  { title: "Hyundai CE North America", sector: "Construction Equipment", url: "https://na.hd-hyundaice.com", slug: "hyundai-ce" },
  { title: "Runza", sector: "Restaurant Chain", url: "https://runza.com", slug: "runza" },
];
