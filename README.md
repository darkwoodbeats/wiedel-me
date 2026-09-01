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
  layout.tsx     Fonts (DM Sans + Space Grotesk via next/font), metadata
  page.tsx       Section composition
  globals.css    Tailwind import + design tokens (@theme) + custom utilities
components/      Nav, Hero, Services, About, Clients, Projects, Contact, Footer, Reveal
lib/projects.ts  The project list rendered by the Projects section
scripts/         Screenshot capture
public/
  img/           Portrait + client logos
  screenshots/   Captured homepage screenshots, one per project slug
legacy/          The original static index.html + styles.css this replaced
```

## Design tokens

Colors, fonts, container width, and the marquee animation live in `@theme` in
`app/globals.css`, so they're available as Tailwind utilities (`text-brand-lime`,
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

## Make the contact form live

Create a form at [Formspree](https://formspree.io), then set the endpoint in `.env.local`:

```
NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/your_form_id
```

Without it the form falls back to the placeholder endpoint and won't deliver.

## Deploy

`npm run build` produces a fully static prerender — deploy to Vercel, Cloudflare Pages,
Netlify, or any static host.
