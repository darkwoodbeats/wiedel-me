// Build the signature logo into public/email/, where the site serves it at
// https://wiedel.me/email/wiedel-me-logo-black.png. The signature loads it from there, which works in every mail app
// (Gmail and Outlook strip logos embedded as base64). Keep that URL: sent emails point at it for good.
//
//   node docs/email-signature/build.mjs
//
// The logo is the print wordmark (docs/brand), on white so it stays visible in dark-mode mail, at 3x its 150px
// display width for sharp screens. 16 grays are enough for black lettering and keep it ~3.5 KB.
import sharp from 'sharp';

const here = (p) => new URL(p, import.meta.url).pathname;
const WIDTH = 150, SCALE = 3;
const out = here('../../public/email/wiedel-me-logo-black.png');

const info = await sharp(here('../brand/wiedel-me-wordmark-print-white-bg.png'))
  .resize({ width: WIDTH * SCALE }).greyscale()
  .png({ palette: true, colors: 16, effort: 10, compressionLevel: 9 })
  .toFile(out);
console.log(`public/email/wiedel-me-logo-black.png  ${info.width} x ${info.height}, ${info.size} bytes`);
