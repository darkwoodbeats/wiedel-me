# wiedel.me

Caleb Wiedel's site: web, design, tech and sound for agencies and businesses in Lincoln, Omaha and
beyond. Next.js 16 (App Router, static export), React 19, TypeScript and CSS Modules.

The home page opens on The Cube Within, an interactive, 80s outrun-styled WebGL hero (React Three
Fiber). It is a visual interpretation of a UAP described by former U.S. Navy pilot Ryan Graves: a dark
cube inside a clear sphere, with the cube's corners touching the sphere's inner surface.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Where things live

```text
app/                      the pages: home (page.tsx), music/, the 404 (not-found.tsx), robots.ts, sitemap.ts
components/site/          the sections, header and footer around the hero
lib/                      copy and data: projects.ts (Recent projects + logo strip), services, contact, music, site.ts
scripts/                  project screenshot and logo capture (below)
components/hero/
  OutrunHero.tsx          Server Component: copy and CTAs; drop <OutrunHero /> into any page. Its HeroFrame (the scene around the copy) also frames the 404 page, app/not-found.tsx
  OutrunHero.module.css   layout and breakpoints; [data-hero-slot] marks where the object goes
  fonts.ts                Hubot Sans (title), Mr Dafoe (brush accent), Mona Sans (copy), IBM Plex Mono (metadata)
  font-files/             every face, self-hosted: Hubot Sans Expanded Black Italic (overlaps merged, renamed), plus the latin files of Mona Sans, Mr Dafoe and IBM Plex Mono + their OFL license
  HeroCanvasLoader.tsx    client island: WebGL check, lazy import (ssr: false), error fallback
  StaticFallback.tsx      SVG version of the object for browsers without WebGL
  HeroCanvas.tsx          <Canvas>, quality tiers, adaptive DPR, offscreen pause, reduced motion
  HeroScene.tsx           scene graph + master clock
  CameraRig.tsx           fits the sphere into the CSS slot; parallax, drift, scroll dolly
  CubeSphere.tsx          the cube, the glass sphere, the contact flares
  brandMark.ts            the wiedel.me mark, cut into the cube's three sky-facing faces (from public/brand/wiedel-mark.svg)
  Aircraft.tsx            the small jets circling the object
  cubeSphereShaders.ts    their GLSL
  RetroGrid.tsx           animated, anti-aliased floor grid
  Sky.tsx                 sky gradient, horizon glow, halo, stars
  Mountains.tsx           distant low-poly ridge
  Dust.tsx                sparse floating motes
  Effects.tsx             bloom, chromatic aberration, tone mapping, grain, vignette
  glsl.ts                 shared sky/environment functions used by every shader
  uniforms.ts             shared uniforms
  hooks.ts                media queries, pointer tracking, slot measuring, tier detection
  config.ts               every visual setting (geometry, colors, motion, camera, effects, quality)
```

## Tuning

Edit `components/hero/config.ts`. The cube side comes from the sphere radius (`s = 2R/√3`), so
changing `GEOMETRY.sphereRadius` keeps the vertices on the sphere. The object's size and position on
screen come from the `.slot` rules in `OutrunHero.module.css`.

## Project screenshots and logos

Projects live in `lib/projects.ts`, each with a unique `slug`; its card shows
`public/screenshots/<slug>.jpg`, and a project with a `logo` also appears in the logo strip.

```bash
npm run screenshots              # capture every project's homepage
npm run screenshots -- <slug>    # just one
npm run logos                    # white logos for the strip, from each site's header
npm run logos -- <slug>
```

Both drive a browser through Playwright. The logo script re-renders each site's header logo as a
white silhouette and skips any logo with a baked-in background; a mark whose detail is carried by
color flattens into a blob, so those need a real knockout asset in `public/img/project_logos/`.
`tsconfig.json` leaves `scripts/` out of the site's type-check, so editing a script can't break a deploy.

## Build and deploy

`next.config.ts` sets `output: "export"`, so `npm run build` writes a plain static site to `out/` and
no Node process runs on the server. Pushing to `main` deploys: the GitHub Action
(`.github/workflows/deploy.yml`) runs `npm ci` and `npm run build` on Node 22, then rsyncs `out/` to
`public_html` on A Small Orange.

- `public/.htaccess` ships in `out/`: gzip, cache headers, the HTTPS redirect and the 404 page.
- `.env.production` is committed because the Action has no `.env.local`; without it the contact form
  would ship disabled and the booking buttons would fall back to the form. Both values are public
  anyway (they're in the page's JavaScript). `next dev` still reads `.env.local`.
- Images skip the Next.js optimizer (`images.unoptimized`), since there is no server to run it. They
  are served exactly as they sit in `public/`.
- Every font is self-hosted, so the build needs no network beyond `npm ci`.
- The rsync doesn't delete, so a file removed from the site stays on the server until it's removed by
  hand.
