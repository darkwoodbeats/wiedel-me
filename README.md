# wiedel.me

Personal services / portfolio site for Caleb Wiedel — built with **Next.js 16 (App Router)**,
**React 19**, **TypeScript**, and **Tailwind CSS v4**.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (fully static)
```

## Structure

```
app/
  layout.tsx     Fonts (DM Sans + Space Grotesk via next/font), metadata, Nav + Footer
  page.tsx       Home: sections for local businesses and agencies + JSON-LD
  music/page.tsx DJ, lessons, and music production
  icon.svg       Favicon (apple-icon.png is the iOS home-screen version)
  globals.css    Tailwind import + design tokens (@theme) + custom utilities
components/      Nav, Hero, ServiceGrid, About, Process, CarePlans, Clients, Projects, Testimonials, Contact, Footer, Logo
lib/projects.ts  The project list rendered by the Projects section
lib/testimonials.ts  Partner quotes; the section is hidden while empty
lib/site.ts      Site URL, LinkedIn, Calendly link
scripts/         Screenshot capture
public/
  img/           Portrait, Wiedel.me logo + favicon sources, client logos
  screenshots/   Captured homepage screenshots, one per project slug
```

## Design tokens

Colors, fonts, container width, and the marquee animation live in `@theme` in
`app/globals.css`, so they're available as Tailwind utilities (`text-brand-purple`,
`border-line`, `font-display`, `w-[min(100%-40px,var(--container-site))]`, `animate-marquee`).
Brand colors are namespaced `brand-*` so they don't shadow Tailwind's stock palettes.

## Projects section

Cards are driven by `lib/projects.ts`. To add a project:

1. Append an entry with `title`, `sector`, `url`, and a unique `slug`.
2. Capture its screenshot:

```bash
npm run screenshots -- <slug>     # one site
npm run screenshots               # re-capture all of them
```

Screenshots are taken with headless Chromium at 1280×800 @2x and written to
`public/screenshots/<slug>.jpg`. The script strips common cookie/consent overlays and
falls back from `networkidle` to `load` for sites that never go idle.

## Client logo marquee

The marquee above the projects renders every project that has a `logo` set, so adding a
logo to `lib/projects.ts` is all it takes to put a company in the strip.

```bash
npm run logos             # all projects
npm run logos -- runza    # just one
```

`scripts/capture-logos.mts` finds each site's header logo, re-renders it in isolation on a
transparent page, and recolors it to a white silhouette at the original alpha. It rejects
any logo whose source has a baked-in background — a silhouette of those is a white block —
and lists what it skipped.

Some logos can't be derived this way: any mark whose internal detail is carried by color
rather than transparency flattens into a blob. Those need a real white/knockout asset from
the client's brand kit, dropped into `public/img/project_logos/` and pointed at from
`lib/projects.ts`.

## Make the contact form live

Create a form at [Formspree](https://formspree.io), then set the endpoint in `.env.local`:

```
NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/your_form_id
```

Without it the form falls back to the placeholder endpoint and won't deliver.

## Book-a-call buttons

Set your Calendly link in `.env.local`:

```
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-name/intro-call
```

Unset, the "Book a call" buttons scroll to the contact form instead. Both values are
baked in at build time, so rebuild after changing them.

## Deploy (A Small Orange / any Apache host)

The site is configured for static export (`output: "export"` in `next.config.ts`), so it
builds to plain HTML/CSS/JS in `./out` and needs **no Node process on the server**.

```bash
npm run deploy      # builds, then zips ./out to wiedel-me-deploy.zip
```

Then in cPanel → File Manager → `public_html`: upload the zip, Extract, delete the zip.
Everything inside `out/` goes at the document root — not the `out` folder itself.

Or over the wire:

```bash
rsync -avz --delete out/ user@host:~/public_html/
```

`public/.htaccess` ships with the export and handles gzip, cache headers, the HTTPS
redirect, and the 404 page.

### Deploying somewhere with a Node runtime instead

Remove `output: "export"` and `images.unoptimized` from `next.config.ts` and deploy to
Vercel, Netlify, or Cloudflare Pages. That re-enables the built-in image optimizer, which
is turned off here because a static export has no server to run it.
