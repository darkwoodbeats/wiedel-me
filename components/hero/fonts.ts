import localFont from "next/font/local";

/*
 * Every face is self-hosted from font-files/ (licenses in font-files/OFL.txt), so a build never
 * calls Google Fonts. Through next/font/google, builds failed now and then: Google sometimes answers
 * with fonts.gstatic.com/l/font?kit=...&skey=... URLs, and Turbopack can't parse the `&`
 * ("next/font/google queries have exactly one entry"). It has failed deploy builds on GitHub
 * Actions, which fetch fonts fresh on every run. Mona Sans, Mr Dafoe and IBM Plex Mono are byte for
 * byte the latin files Google Fonts serves.
 */

/**
 * Display: Hubot Sans Expanded Black Italic (GitHub, SIL OFL 1.1).
 * Wide, heavy, true-italic, geometric caps with angled terminals: 80s title lettering without novelty.
 * Self-hosted as one static cut (the file Google Fonts serves for ital 1, wdth 125, wght 900) because
 * next/font/google can only load the width axis as the full ~100 KB variable font. This cut is ~22 KB.
 * `block` keeps the title from flashing in a fallback face, which would look nothing like it.
 *
 * The cut is modified: its overlapping contours are merged (fontTools' removeOverlaps), so outlined
 * text ("From", "To", the process numerals) traces only the true edges instead of the seams where a
 * letter's parts overlap. A modified version may not carry the Reserved Font Name "Hubot", so it is
 * renamed "Wiedel Display" inside the file; the copyright notice and the license stay with it.
 */
export const displayFont = localFont({
  src: "./font-files/WiedelDisplay-BlackItalic.woff2",
  weight: "900",
  style: "italic",
  variable: "--hero-font-display",
  display: "block",
  fallback: ["Arial Black", "Arial", "sans-serif"],
});

/**
 * Accent: Mr Dafoe (SIL OFL 1.1), a fast, slanted sign-painter's brush script.
 * Used only for the hand-painted lines: "Since 2016" slashed across the title, the wordmark's
 * ".me", and the section headings' script lines. Anywhere else, it stops being an accent.
 */
export const brushFont = localFont({
  src: "./font-files/MrDafoe-Latin.woff2",
  weight: "400",
  style: "normal",
  variable: "--hero-font-brush",
  display: "block",
});

/**
 * Supporting copy: Mona Sans (GitHub, SIL OFL 1.1), Hubot Sans's companion grotesque. It is clean
 * and quiet beside the display face. One variable font covers weights 400, 500 and 600.
 */
export const sansFont = localFont({
  src: "./font-files/MonaSans-Latin.woff2",
  weight: "400 600",
  style: "normal",
  variable: "--hero-font-sans",
  display: "swap",
});

/** Metadata only: HUD labels, the eyebrow, the disclaimer. IBM Plex Mono (SIL OFL 1.1). */
export const monoFont = localFont({
  src: [
    { path: "./font-files/IBMPlexMono-Regular-Latin.woff2", weight: "400", style: "normal" },
    { path: "./font-files/IBMPlexMono-Medium-Latin.woff2", weight: "500", style: "normal" },
  ],
  variable: "--hero-font-mono",
  display: "swap",
});

export const heroFontVariables = `${displayFont.variable} ${brushFont.variable} ${sansFont.variable} ${monoFont.variable}`;
