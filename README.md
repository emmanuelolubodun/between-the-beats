# Between the Beats

An interactive, scroll-driven story about high blood pressure. It is the web version of the poster "The Pressure We Live In" (AD 609, Project 2, Emmanuel Olubodun, MFA Interaction Design, Purdue). The project began as "Under Pressure", which is still the folder name.

- `/` is the guided story: hero, seven data stories, trend, how a reading works, sources. Light and dark themes follow the device, with a toggle in the top bar.
- `/stories/<slug>` is a deep-dive page for each story, with the full data table and links to the original sources.

`CLAUDE.md` holds the brief, the design system, every data point, and the accessibility rules. Section 12 records the later decisions (deep-dive pages, GSAP and Lenis, npm).

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Build and deploy

```bash
npm run build
```

Deploy on Vercel: push the repo to GitHub, then import it at vercel.com/new (framework preset: Next.js, no settings or environment variables needed). Fonts are self-hosted through `next/font`, so there is no runtime call to Google Fonts.

## Where things live

- `data/` the source data (`countries.json`, `datasets.ts`). Do not edit numbers.
- `lib/stories.ts` story metadata and the text of the deep-dive pages.
- `components/core/` the pulse core and the vessel chart (fan on wide screens, bars on phones).
- `components/chapters/` one file per chapter; each exports an Explorer reused by its deep-dive page.
- `lib/motion.ts`, `components/layout/SmoothScroll.tsx` GSAP and Lenis. All scroll motion is off under reduced motion.
