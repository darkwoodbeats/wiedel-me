/**
 * Captures a homepage screenshot for every entry in lib/projects.ts.
 *
 *   npm run screenshots
 *
 * Images land in public/screenshots/<slug>.jpg at 1280x800 (above the fold),
 * which is what <ProjectCard> renders. Re-run whenever a client redesigns.
 *
 * Video heroes: Playwright's bundled Chromium can't play H.264, so those sites
 * never get past their loading state there. This runs a real Chrome-family
 * browser instead (CHROME_PATH, else Google Chrome, else Brave) and waits until
 * every video on the page, including ones inside Vimeo/YouTube embeds, is
 * actually playing before it shoots.
 *
 * Options (environment):
 *   CHROME_PATH=/path/to/browser   use a specific Chrome/Brave/Edge binary
 *   SCREENSHOTS_DIR=some/dir       write somewhere else, e.g. to review before replacing
 */
import { chromium, type Page } from "playwright";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { projects } from "../lib/projects.ts";

const OUT_DIR = process.env.SCREENSHOTS_DIR
  ? path.resolve(process.env.SCREENSHOTS_DIR)
  : path.join(process.cwd(), "public", "screenshots");
const VIEWPORT = { width: 1280, height: 800 };
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/** A browser with the proprietary codecs, in order of preference. */
const executablePath = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
].find((candidate) => candidate && existsSync(candidate));

/**
 * Starts any muted video that autoplay left paused, then waits until every visible one (in the
 * page and in its embed iframes) has decoded frames and moved past its first half-second.
 * Returns false if one never did within the timeout.
 */
async function waitForVideos(page: Page, timeout = 20_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const states = await Promise.all(
      page.frames().map((frame) =>
        frame
          .evaluate(() =>
            [...document.querySelectorAll("video")]
              .filter((video) => {
                const box = video.getBoundingClientRect();
                return box.width > 50 && box.height > 50;
              })
              .map((video) => {
                if (video.paused) {
                  video.muted = true;
                  video.play().catch(() => {});
                }
                return video.readyState >= 3 && video.currentTime > 0.5;
              }),
          )
          .catch(() => [] as boolean[]),
      ),
    );
    if (states.flat().every(Boolean)) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  if (!executablePath) {
    console.warn("No Chrome or Brave found (set CHROME_PATH): video heroes will stay on their loading state.");
  }
  const browser = await chromium.launch({
    executablePath,
    args: [
      "--autoplay-policy=no-user-gesture-required",
      "--mute-audio",
      "--disable-blink-features=AutomationControlled",
      // Headless has no hardware video decoding, and on a Mac, Vimeo and YouTube hand out HEVC and
      // AV1 streams that need it: they load their metadata and then stall on a black frame.
      // Without those decoders the players fall back to H.264 or VP9, which decode in software.
      "--disable-features=PlatformHEVCDecoderSupport,VideoToolboxAv1Decoding,Dav1dVideoDecoder",
      // Embed iframes run as separate processes; give them the desktop user agent too, so
      // players don't treat the capture as a headless bot.
      `--user-agent=${USER_AGENT}`,
    ],
  });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    userAgent: USER_AGENT,
  });

  // Optional slug filter: `npm run screenshots -- runza blackmagikpresents`
  const only = process.argv.slice(2);
  const queue = only.length ? projects.filter((p) => only.includes(p.slug)) : projects;

  const failures: string[] = [];

  for (const project of queue) {
    const page = await context.newPage();
    try {
      // networkidle gives the cleanest shot, but sites with video backgrounds,
      // chat widgets, or analytics polling never go idle — fall back to load.
      try {
        await page.goto(project.url, { waitUntil: "networkidle", timeout: 30_000 });
      } catch {
        await page.goto(project.url, { waitUntil: "domcontentloaded", timeout: 45_000 });
        await page.waitForLoadState("load", { timeout: 20_000 }).catch(() => {});
      }
      // Let hero animations, lazy images, and cookie banners settle.
      await page.waitForTimeout(3_000);
      const playing = await waitForVideos(page);
      // Video heroes often fade in once playback starts.
      await page.waitForTimeout(1_500);
      // Dismiss the most common consent/overlay patterns so they stay out of the shot.
      await page.evaluate(() => {
        const junk = document.querySelectorAll<HTMLElement>(
          '[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],[class*="gdpr" i]',
        );
        junk.forEach((el) => el.remove());
      });
      await page.screenshot({
        path: path.join(OUT_DIR, `${project.slug}.jpg`),
        type: "jpeg",
        quality: 82,
      });
      console.log(`  ok   ${project.slug.padEnd(22)} ${project.url}${playing ? "" : "  (a video never started)"}`);
    } catch (error) {
      failures.push(project.slug);
      console.log(`  FAIL ${project.slug.padEnd(22)} ${(error as Error).message.split("\n")[0]}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log(`\n${queue.length - failures.length}/${queue.length} captured`);
  if (failures.length) {
    console.log(`failed: ${failures.join(", ")}`);
    process.exitCode = 1;
  }
}

main();
