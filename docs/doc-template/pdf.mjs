// Print a filled template (from md2html.py) to a Letter PDF with the wiedel.me letterhead.
//
//   node pdf.mjs <input.html> <output.pdf> ["Header title"]
//
// The header title defaults to the page's <title> (the document's first heading).
// Needs the repo's node_modules (npm ci) and Google Chrome installed.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [,, htmlArg, pdfArg, titleArg] = process.argv;
if (!htmlArg || !pdfArg) {
  console.error('usage: node pdf.mjs <input.html> <output.pdf> ["Header title"]');
  process.exit(1);
}

// Letterhead: the wiedel.me wordmark in print black (docs/brand), sized to 1.5in wide and inlined.
const LOGO_IN = 1.5;
const svg = readFileSync(new URL('../brand/wiedel-me-wordmark-print.svg', import.meta.url), 'utf8')
  .replace(/width="([\d.]+)pt" height="([\d.]+)pt"/, (m, w, h) => `width="${LOGO_IN}in" height="${(LOGO_IN * h / w).toFixed(4)}in"`);
const logo = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
const cssString = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';

// Header and footer live in CSS page margin boxes, not Chrome's headerTemplate: margin boxes belong to
// the document, so they use its web fonts (Mona Sans). headerTemplate can only use installed fonts.
// The rule under the letterhead row spans the text column: top-left + top-right together are its width.
const RULE = '2px solid #1c1c1c';
const pageCss = (title) => `
@page {
  size: Letter;
  margin: 1.05in 0.9in 0.85in 0.9in;
  @top-left {
    content: url("${logo}"); width: 2in;
    vertical-align: bottom; padding-bottom: 0.1in; margin-bottom: 0.32in; border-bottom: ${RULE};
  }
  @top-right {
    content: ${cssString(title)};
    vertical-align: bottom; text-align: right; padding-bottom: 0.182in; margin-bottom: 0.32in; border-bottom: ${RULE};
    font-family: "Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 8.75pt; font-weight: 500;
    font-style: italic; /* slanted by Chrome: the site's Mona Sans has no italic cut */
    line-height: 1.2; color: #1c1c1c;
  }
  @bottom-right {
    content: "Page " counter(page) " of " counter(pages);
    vertical-align: top; padding-top: 0.28in;
    font-family: "Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 9pt; color: #555;
  }
}`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(htmlArg)).href, { waitUntil: 'load' });
const title = titleArg || await page.title();
await page.addStyleTag({ content: pageCss(title) });
await page.evaluate(() => document.fonts.ready); // the site fonts, before printing
await page.emulateMedia({ media: 'print' });
await page.pdf({ path: resolve(pdfArg), printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false });
await browser.close();
console.log('wrote', resolve(pdfArg));
