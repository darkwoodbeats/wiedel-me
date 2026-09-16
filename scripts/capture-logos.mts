/**
 * Builds white, transparent logo PNGs for the client marquee.
 *
 *   npm run logos            # all projects
 *   npm run logos -- runza   # just one
 *
 * How it works:
 *  1. Find the header logo on each client site (inline <svg> or <img>).
 *  2. Re-render it in isolation on a transparent page at 3x so nothing from the
 *     client's own header background bleeds into the capture.
 *  3. Recolor to a white silhouette, keeping the original alpha channel.
 *  4. Reject anything that comes back near-fully-opaque — that means the source
 *     logo had a baked-in background and the silhouette would be a white block.
 *
 * Rejected logos are listed at the end and need a real asset dropped in by hand.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { projects } from "../lib/projects.ts";

const OUT_DIR = path.join(process.cwd(), "public", "img", "project_logos");
const TARGET_H = 96; // 3x the 32px the marquee renders at
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

type Source = { kind: "svg"; markup: string } | { kind: "url"; url: string };

async function findLogo(page: import("playwright").Page): Promise<Source | null> {
  return page.evaluate(() => {
    const scope = document.querySelector("header, .header, #header, [role=banner], nav") || document.body;
    type C = { score: number; el: Element; w: number };
    const cands: C[] = [];

    scope.querySelectorAll("img").forEach((im) => {
      const r = im.getBoundingClientRect();
      const hay = `${im.getAttribute("src") || ""} ${im.className} ${im.alt}`;
      if (r.width > 40 && r.height > 12 && r.top < 300)
        cands.push({ score: (/logo|brand/i.test(hay) ? 10 : 0) + (r.top < 150 ? 3 : 0), el: im, w: r.width });
    });
    scope.querySelectorAll("svg").forEach((sv) => {
      const r = sv.getBoundingClientRect();
      const hay = `${sv.getAttribute("class") || ""} ${sv.id}`;
      if (r.width > 40 && r.height > 12 && r.top < 300)
        cands.push({ score: (/logo|brand/i.test(hay) ? 10 : 0) + (r.top < 150 ? 3 : 0), el: sv, w: r.width });
    });

    cands.sort((a, b) => b.score - a.score || b.w - a.w);
    const best = cands[0]?.el;
    if (!best) return null;

    if (best.tagName.toLowerCase() === "svg") {
      const clone = best.cloneNode(true) as SVGElement;
      if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      return { kind: "svg" as const, markup: clone.outerHTML };
    }
    const img = best as HTMLImageElement;
    return { kind: "url" as const, url: img.currentSrc || img.src };
  });
}

/** Renders a source in isolation on a transparent page and returns a PNG buffer. */
async function renderIsolated(ctx: import("playwright").BrowserContext, src: Source) {
  const page = await ctx.newPage();
  try {
    await page.setContent(
      `<html><body style="margin:0;background:transparent">
         <div id="stage" style="display:inline-block;line-height:0">
           ${src.kind === "svg" ? src.markup : `<img src="${src.url}">`}
         </div>
       </body></html>`,
      { waitUntil: "networkidle" },
    );
    await page.evaluate(async () => {
      // Scale to a generous height so the capture is crisp, then wait for decode.
      const node = document.querySelector("#stage")!.firstElementChild as HTMLElement;
      node.style.height = "300px";
      node.style.width = "auto";
      await Promise.all([...document.images].map((i) => (i.complete ? null : i.decode().catch(() => {}))));
    });
    await page.waitForTimeout(400);
    const box = await page.locator("#stage").boundingBox();
    if (!box || box.width < 2 || box.height < 2) return null;
    return await page.locator("#stage").screenshot({ omitBackground: true, type: "png" });
  } finally {
    await page.close();
  }
}

/** White silhouette at the original alpha. Returns null if the source had no real transparency. */
async function whiten(buf: Buffer) {
  const base = sharp(buf).ensureAlpha();
  const meta = await base.metadata();
  const { width = 0, height = 0 } = meta;
  if (!width || !height) return null;

  // Reject sources with a baked-in background: a silhouette of those is a solid block.
  const alpha = await base.clone().extractChannel(3).raw().toBuffer();
  const opaque = alpha.reduce((n, a) => n + (a > 250 ? 1 : 0), 0) / alpha.length;
  if (opaque > 0.9) return null;

  const white = await sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{ input: await base.png().toBuffer(), blend: "dest-in" }])
    .png()
    .toBuffer();

  return sharp(white).resize({ height: TARGET_H, fit: "inside" }).trim().png({ compressionLevel: 9 }).toBuffer();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const only = process.argv.slice(2);
  const queue = only.length ? projects.filter((p) => only.includes(p.slug)) : projects;

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 3, userAgent: UA });

  const ok: string[] = [];
  const needsManual: { slug: string; why: string }[] = [];

  for (const project of queue) {
    const page = await ctx.newPage();
    try {
      try { await page.goto(project.url, { waitUntil: "networkidle", timeout: 25_000 }); }
      catch { await page.goto(project.url, { waitUntil: "domcontentloaded", timeout: 35_000 }); }
      await page.waitForTimeout(1500);

      const src = await findLogo(page);
      await page.close();
      if (!src) { needsManual.push({ slug: project.slug, why: "no logo found in header" }); continue; }

      const shot = await renderIsolated(ctx, src);
      if (!shot) { needsManual.push({ slug: project.slug, why: "logo failed to render" }); continue; }

      const white = await whiten(shot);
      if (!white) { needsManual.push({ slug: project.slug, why: "logo has an opaque background" }); continue; }

      await writeFile(path.join(OUT_DIR, `${project.slug}.png`), white);
      const { width, height } = await sharp(white).metadata();
      console.log(`  ok   ${project.slug.padEnd(20)} ${width}x${height}  ${Math.round(white.length / 1024)}KB`);
      ok.push(project.slug);
    } catch (e) {
      if (!page.isClosed()) await page.close();
      needsManual.push({ slug: project.slug, why: (e as Error).message.split("\n")[0].slice(0, 60) });
    }
  }

  await browser.close();
  console.log(`\n${ok.length}/${queue.length} logos written to public/img/project_logos/`);
  if (needsManual.length) {
    console.log("\nNeed a hand-supplied white PNG:");
    needsManual.forEach((f) => console.log(`  - ${f.slug.padEnd(20)} ${f.why}`));
  }
}

main();
