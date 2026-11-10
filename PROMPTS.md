# Under Pressure — Claude Code build prompts

Paste these into Claude Code one phase at a time, in order. `CLAUDE.md` is auto-loaded by Claude Code from the repo root, so it carries the full context (data, design system, accessibility rules) on every turn. These prompts assume it is present. After each phase, run the app and eyeball it before moving on.

How to use: put `CLAUDE.md`, `data/countries.json`, and `data/datasets.ts` from this package into an empty folder, open Claude Code there, then paste Phase 0.

A good standing instruction to give Claude Code once, up front:
> Follow CLAUDE.md as the source of truth. Work phase by phase from the prompts I paste. After each phase, stop and give me a short summary plus how to run it. Do not invent data. Do not skip accessibility. Ask before adding any dependency not already named in CLAUDE.md.

---

## Phase 0 — Scaffold and tokens

> Scaffold the Under Pressure project per CLAUDE.md. Create a Next.js app (App Router, TypeScript strict, ESLint, Tailwind, `src/` not required, import alias `@/*`) with pnpm. Self-host Inter with `next/font/google`. Set up `app/globals.css` with every color token from CLAUDE.md section 5 defined on `:root`, wire them into `tailwind.config.ts` as named colors, and set the dark canvas background and Inter as the base font on `body`. Add base styles: tuned selection color, visible focus-ring utility using the pulse color, and a `prefers-reduced-motion` reset that disables transitions and animations. Add a `SkipLink` component and render it first in `app/layout.tsx`, with proper `<html lang>`, metadata (title, description, Open Graph), and a `<main id="main">`. Confirm `pnpm dev` runs with a near-empty page showing the canvas color and a token test. Do not build any chapters yet.

Acceptance: app runs, tokens resolve through Tailwind, reduced-motion reset in place, skip-link works, TypeScript strict passes, ESLint clean.

---

## Phase 1 — Core primitives and layout shell

> Build the signature primitives and the page shell, no real data yet. 1) `components/core/PulseCore.tsx`: a coral core with a soft radial glow, one or two expanding rings, a slow heartbeat scale (~1.6s), optional ECG polyline, sized by a prop. Still core under reduced motion; mark decorative parts `aria-hidden`. 2) `components/core/Vessel.tsx`: a horizontal vessel whose length encodes a value against a given scale (props: value, max, color, label, optional 95% CI {lo,hi}, optional node glow). Gradient from `--pulse-deep` into the category color, a node at the tip, a paler band for the CI. Animate length-in on first reveal (~900ms), instant under reduced motion. Include a visually-hidden text equivalent of the value. 3) `components/layout/Chapter.tsx`: section shell with props for id, eyebrow, title, lede, children; applies scroll reveal and sets the section id for the nav. 4) `components/layout/ProgressNav.tsx`: fixed top bar with the wordmark and section dots that track the active section via IntersectionObserver; hidden under ~720px. 5) `lib/hooks/useReveal.ts`: IntersectionObserver hook returning a ref and an in-view boolean, plus an active-section tracker. Compose a placeholder `app/page.tsx` with three dummy `<Chapter>`s and the nav to prove reveal and active-dot tracking work.

Acceptance: PulseCore animates and stills under reduced motion; Vessel renders a labeled, accessible bar that grows on reveal; nav dots track sections; keyboard focus visible throughout.

---

## Phase 2 — Data layer

> Wire up the data layer per CLAUDE.md section 6. Put `data/countries.json` and the typed constants from `data/datasets.ts` into the app as `lib/data.ts` (import the JSON, type it as `Country[]`). Add `lib/format.ts` with helpers: `inHundred(v)` -> "X in 100", a tabular number formatter, and a `compareToReference(v, ref)` that returns a signed, labeled difference ("4.1 above", "6.1 below") with a direction flag for coloring. Add `lib/scales.ts` with shared radial math: `pol(cx, cy, r, deg)`, a value-to-radius scale factory, and a value-to-length scale for horizontal vessels. Export everything typed. No UI in this phase. Add one unit test (or a typecheck assertion) that the countries array has 194 rows and the world median constant is 38.0.

Acceptance: `lib/data.ts`, `lib/format.ts`, `lib/scales.ts` compile under strict TS; country data loads; helpers are pure and typed.

---

## Phase 3 — Hero and reading guide

> Build `components/chapters/Hero.tsx`: full-viewport, centered, the PulseCore above a calm one-line headline ("High blood pressure.") and a subhead ("Half the adults you know may have it. Most people meet it as one scary number. Let us look at it together, calmly."), with a scroll cue. No numbers. Then `components/chapters/ReadingGuide.tsx`: a compact, quiet band that states the three notes from `READING_NOTES` (two thresholds, surveys show a link, the trial shows cause) in plain language. Add both to `app/page.tsx` in order. Copy must follow the voice rules (no em or en dashes).

Acceptance: hero is calm and legible on mobile and desktop; reading guide present before any data chapter; reduced-motion respected.

---

## Phase 4 — Global map (the centerpiece)

> Build `components/chapters/GlobalMap.tsx`: the radial map of all 194 countries from `lib/data.ts`, in the poster's language. Each country is a spoke from a shared center: a thin radial whisker from its CI low to CI high, a dot at its value, colored by WHO region (region tokens). Group countries by region into arcs around the circle with small gaps; sort within a region by value so each arc flows smoothly. Draw concentric reference rings at 20, 30, 40, 50, 60 percent with labels tucked in a gap, and a dashed ring at the world median (38). Put a thin colored region frame arc just outside the data, and country labels in one clean outer ring reading outward (no labels crossing the frame). Use D3 scales/arc math from `lib/scales.ts`; render as React SVG. Add a region legend with count and average. INTERACTION: a labeled country search/select; on choose, that country's spoke highlights and the rest dim, and an aria-live readout states "In {country}, about {v} in 100 adults have high blood pressure, {diff} the world middle of 38," with its rank of 194 and the 95% range. MOBILE: below ~720px, the full radial is hard to read, so provide a legible fallback: keep the ring with region arcs but collapse labels to the searched country plus region extremes, or switch to a vertical region-grouped list of vessels driven by the same data and the same search. Accessibility: the whole chart has a visually-hidden data table of all 194 values; decorative SVG is aria-hidden; search is keyboard-usable. Show the source line.

Acceptance: renders all 194 countries without label collisions on desktop; the mobile fallback is legible at 320px; search highlights and announces; screen-reader table present; matches the poster's visual language.

---

## Phase 5 — Sex and race

> Build `components/chapters/SexRace.tsx` from `SEX_RACE` and `ALL_ADULTS`. Each of the four groups is a pair of vessels, men and women, with the sex gap labeled between them. A men/women segmented toggle (`components/ui/Toggle.tsx`, `role="group"`, `aria-pressed`) switches emphasis; show both at once on wide screens if it reads cleanly, or toggle on mobile. Men use the pulse color, women use the `--women` token; both carry text labels so color is not the only signal. Draw a reference marker for all adults (44.5). Include the key reading in the lede or a callout: men higher in every group, the gap widens from Black to Hispanic, and Black women sit above the men of every other group. Add the honesty note that these are social groupings shaped by access and environment, not biology, and the 130/80 age-adjusted basis. Source line. Keep CI tips as the paler vessel band.

Acceptance: toggle is keyboard-accessible and announced; gaps are correct (3.3, 8.3, 10.0, 13.3); color never alone; source shown.

---

## Phase 6 — Consequences

> Build `components/chapters/Consequences.tsx` from `CONSEQUENCES` and `CONSEQUENCES_CONTEXT`. A fan or stack of vessels, length = age-adjusted deaths per 100,000, each labeled with its value and plain sub-label (diabetes 66.2, heart attack 16.3, obesity 13.2, hemorrhagic stroke 6.9). Diabetes uses the `--diabetes` token. Add the context stat (overall 40.2 per 100,000, men 46.7, women 33.9, up from 27.0 in 1979) as a small callout. State clearly: these are a link, not proof of cause, and they are comparable because every rate uses the same method. Source line.

Acceptance: values exact; "link not cause" present; comparable-method note present.

---

## Phase 7 — Activity and Sleep

> Build two chapters. `components/chapters/Activity.tsx` from `ACTIVITY`: three vessels (barely active 68, active 57, very active 57) with the reading "the big drop comes from getting started, 68 down to 57; going to extremes adds little more." `components/chapters/Sleep.tsx` from `SLEEP`: three vessels in a U-shape (too little 32, just right 23, too much 32), with the sweet-spot (7 to 8 hrs) marked distinctly using the `--teal` token plus a text label, not color alone. Both: "out of 100" framing, 130/80 or age-standardized basis as noted, link-not-cause, and source lines.

Acceptance: both render; the sweet spot is marked with text and lightness, not hue alone; values exact.

---

## Phase 8 — Occupation (with personalization)

> Build `components/chapters/Occupation.tsx` from `OCCUPATION` and `ALL_WORKERS`. Vessels for the seven industries, length = crude share, colored by intensity (pale at ~20 to deep pulse at ~30) with a dashed reference for all workers (23.7). INTERACTION ("find your work"): a labeled select; choosing an industry highlights its vessel and an aria-live readout states "About {v} in 100 {industry} workers have high blood pressure, {diff} the all-worker average of 24." Crucial honesty: these are crude shares, not age-adjusted; show the age-adjusted prevalence ratios from the data (nursing homes 1.24 still elevated, trucking 1.01 mostly an older workforce, hospitals 0.90) as a small secondary panel so trucking's crude lead is not misread as cause. Source line. This chapter carries the "mirror" idea; keep selection in-memory only, never stored.

Acceptance: select announces changes; crude-vs-adjusted shown honestly; no data stored; values exact.

---

## Phase 9 — Sodium and diet (the hero interaction)

> Build `components/chapters/Sodium.tsx` from `DASH` / `dashDrop`, the one causal story. Controls: a salt slider (high, medium, low) via `components/ui/Slider.tsx` and a diet segmented toggle (typical plate, DASH) via the Toggle. On change, compute the cell with `dashDrop(diet, salt)` and animate a teal (`--dash`) vessel whose length encodes the drop (0 to about 9), with an aria-live readout: "Eating {dietName} at {saltLabel} drops the top number by about {X} points versus a typical salty plate," and the baseline case worded as "This is the starting point: a typical plate at high salt." Show the 95% range on the two low-salt cells. State plainly that because this was a randomized trial, the diet caused the drop (the one place we can say cause). Source line.

Acceptance: slider and toggle keyboard-accessible and announced; the six cells map to exact values (0, -2.1, -5.9, -6.7, -7.2, -8.9); the causal framing is explicit.

---

## Phase 10 — Trend, not panic

> Build `components/chapters/Trend.tsx`: a segmented toggle between "a single reading" and "the trend." The single-reading view shows one large alarming number (158/96) with a line explaining it is often just a bad moment. The trend view shows a steady SVG line (an aria-labeled sparkline) with a line explaining the trend is what matters. Switching is keyboard-accessible; the active view is announced. Tie it to the idea the self-monitoring thesis depends on: watch the line, not the moment. No new data needed.

Acceptance: toggle works by keyboard; both views are screen-reader described; copy follows voice rules.

---

## Phase 11 — Bridge and Sources

> Build `components/chapters/Bridge.tsx`: the close. One primary action card ("Start reading your own pressure") on the pulse color with dark text, then three concrete supporting steps (find the right cuff size, measure at the same time daily, watch the line not the day) each with a labeled check icon (SVG, aria-hidden, with text beside it). Frame it as agency, not alarm, and as the hand-off toward home self-monitoring (the Pressure Pilot thesis). Then `components/chapters/Sources.tsx`: a footer listing every module, survey or study, year, and a real link from `SOURCES`, plus a one-line note that this is information design, not medical advice, and the author credit (Emmanuel Olubodun, MFA Interaction Design, Purdue, Project 2). Add both to the page.

Acceptance: all links resolve to the real sources; "not medical advice" present; author credit present.

---

## Phase 12 — Accessibility and QA pass

> Do a full accessibility and quality pass against CLAUDE.md sections 7 and 10. Check and fix: contrast on every text/background pair; every interactive control has a label and visible focus; every chart has a text equivalent (hidden table or aria-label) and decorative SVG is aria-hidden; all aria-live readouts announce once per change, not on every frame; keyboard-only path through the whole page including every toggle, slider, and select; `prefers-reduced-motion` disables the heartbeat, vessel growth, and scroll transforms while keeping all information; no horizontal scroll at 320px; touch targets at least 44px; no text under 16px except true captions. Run `pnpm build`, fix any type or lint errors, and remove console warnings. Report a short checklist of what you verified and anything you could not.

Acceptance: keyboard and reduced-motion verified; build clean; a written checklist returned.

---

## Phase 13 — Deploy to Vercel

> Prepare for Vercel. Confirm `pnpm build` succeeds from a clean install. Add a short README with run and deploy steps. If I provide a GitHub repo, initialize git, commit, and push; otherwise give me the exact steps to deploy: push to GitHub and import on Vercel (framework preset Next.js, no special settings), or `vercel` then `vercel --prod` with the CLI. Confirm fonts are self-hosted so there is no runtime dependency on Google Fonts, and that there are no environment variables needed. Do not attempt to deploy without my credentials; hand me the final steps.

Acceptance: clean production build; README with deploy steps; no required env vars; fonts self-hosted.

---

## After the build

Things the author (Emmanuel) will likely want next, once the base is up. Mention these when Phase 13 is done:
- A short usability pass (5 to 7 people) and an accessibility audit, since this is a design-research project.
- Optional: wire the Bridge hand-off to the actual Pressure Pilot thesis flow.
- Optional: an OG image and a share card.
- Optional: light analytics that respect the no-tracking stance (privacy-friendly, aggregate only), only if the author wants it.
