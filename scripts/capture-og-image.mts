/**
 * Captures the share image (app/opengraph-image.jpg) from the live hero.
 *
 *   npm run dev            (in another terminal)
 *   npm run og-image
 *
 * The image is the home hero at 1200x630 with only the logo, the eyebrow, the title and the
 * "Book an intro call" button, enlarged 1.4x so its label still reads at feed size. The nav, the
 * subtitle and the second action are hidden. Re-run whenever the hero's copy changes, then update
 * app/opengraph-image.alt.txt to match. The cube turns, so each capture catches it at a new angle.
 *
 * Options (environment):
 *   BASE_URL=http://localhost:3000    where the site is running
 *   CHROME_PATH=/path/to/browser      use a specific Chrome/Brave/Edge binary
 *   OG_IMAGE=some/file.jpg            write somewhere else, e.g. to review before replacing
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve(process.env.OG_IMAGE ?? path.join("app", "opengraph-image.jpg"));
const SIZE = { width: 1200, height: 630 };

/** A Chrome-family browser if one is installed, else Playwright's own (npx playwright install chromium). */
const executablePath = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
].find((candidate) => candidate && existsSync(candidate));

/** Strips the hero down to the share card: the dev-tools badge and the nav go, the call to action grows. */
const SHARE_CARD_CSS = `
  nextjs-portal { display: none !important; }
  [data-hero] [class*="siteNav"],
  [data-hero] [class*="subtitle"],
  [data-hero] [class*="secondary"] { display: none !important; }
  [data-hero] [class*="actions"] { zoom: 1.4; }
`;

async function main() {
  const browser = await chromium.launch({ executablePath });
  // At 1x, as on a standard screen, so the scanlines keep their texture.
  const page = await browser.newPage({ viewport: SIZE, deviceScaleFactor: 1 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: SHARE_CARD_CSS });

  // The scene fades up over 1.8s once its first frame is ready; by then the title's arrival
  // sparkle (DreamsWord) has passed too.
  await page.waitForSelector('[data-ready="true"]', { state: "attached", timeout: 30_000 });
  await page.waitForTimeout(3000);

  const png = await page.screenshot({ type: "png" });
  await sharp(png).jpeg({ quality: 92, mozjpeg: true }).toFile(OUT);
  await browser.close();
  console.log(`Wrote ${path.relative(process.cwd(), OUT)}. Check app/opengraph-image.alt.txt still describes it.`);
}

main();
