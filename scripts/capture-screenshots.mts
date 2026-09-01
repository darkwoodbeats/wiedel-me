/**
 * Captures a homepage screenshot for every entry in lib/projects.ts.
 *
 *   npm run screenshots
 *
 * Images land in public/screenshots/<slug>.jpg at 1280x800 (above the fold),
 * which is what <ProjectCard> renders. Re-run whenever a client redesigns.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { projects } from "../lib/projects.ts";

const OUT_DIR = path.join(process.cwd(), "public", "screenshots");
const VIEWPORT = { width: 1280, height: 800 };

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
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
      console.log(`  ok   ${project.slug.padEnd(22)} ${project.url}`);
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
