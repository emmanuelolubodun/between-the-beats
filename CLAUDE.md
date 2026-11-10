# CLAUDE.md — Under Pressure

Persistent project context for Claude Code. Read this fully before writing any code. It is the single source of truth for what we are building, the data, the design system, and the quality bar. If anything in a prompt conflicts with this file, ask before proceeding.

---

## 1. What this is

**Under Pressure** is a standalone, public, interactive data experience about high blood pressure. It is the web counterpart to a printed information-design poster, **"The Pressure We Live In"**, and it is Project 2 of a graduate Information Design course (AD 609), by Emmanuel Olubodun, MFA Interaction Design, Purdue.

The poster maps seven data stories about hypertension around a central "pulse" core, connected by vessel-shaped lines. This site turns that same research into a guided, scroll-driven experience a single person can navigate, personalize, and act on.

It also connects to the author's MFA thesis, **Pressure Pilot**, a home blood-pressure self-monitoring system. The site ends by handing the visitor toward self-monitoring.

### The one-line thesis
> Turn the map into a mirror: walk anyone from a frightening number to an understanding they can act on.

### Who it is for
General public, mobile-first. Someone who has heard "you have high blood pressure" and does not know what it means for them. Assume no statistics background and no medical training.

---

## 2. Non-negotiable principles

These are product constraints, not suggestions. Every component must honor them.

1. **Plain over precise.** Every number is framed as "out of 100 people." No odds ratios, no p-values, no jargon in the UI. A ten-year-old should follow it.
2. **Trend over panic.** Where we show readings, we always favor the trend over a single alarming number. Never design anything that heightens health anxiety.
3. **Mirror, not just map.** Personalization (find your country, your job) is optional, never required, and never stored or sent anywhere. It exists to make the data personal, not to collect anything.
4. **Accessible by default.** WCAG 2.1 AA minimum. Accessibility is designed in from the first component, never bolted on. See section 7.
5. **Honest data.** Never invent, round misleadingly, or imply cause where there is only correlation. See section 6 for the honesty rules that must appear in the UI.

---

## 3. Tech stack

- **Framework:** Next.js (App Router, latest stable) + React + TypeScript (strict).
- **Styling:** Tailwind CSS with design tokens defined as CSS variables (section 5). Use tokens, never raw hex in components.
- **Data visualization:** D3 (d3-scale, d3-shape, d3-selection as needed) for the radial map and custom vessel geometry. Prefer rendering SVG through React (JSX) and using D3 only for math (scales, arc/line generators), so the DOM stays declarative and testable. Do not hand the whole SVG to D3 to mutate imperatively unless a chart genuinely needs it.
- **Motion / scroll:** Framer Motion for reveal and transitions. An IntersectionObserver-based hook for scroll triggers and the section progress nav. Respect `prefers-reduced-motion` everywhere.
- **Fonts:** Inter (primary, matches the poster). Self-host via `next/font/google` so there is no layout shift and it works offline. A display weight of Inter (700) covers headings; a secondary display face is optional and must be cleared with the author first.
- **Deploy:** Vercel. Zero-config for Next.js. The repo should deploy cleanly on push.
- **Package manager:** pnpm preferred; npm acceptable. Pick one and be consistent.
- **Linting/formatting:** ESLint (next/core-web-vitals) + Prettier. TypeScript strict mode on.

Keep dependencies lean. Do not add a chart library (Recharts, Chart.js, Victory). The charts here are bespoke SVG; a generic library cannot produce the vessel language and would fight the design.

---

## 4. Repository structure

```
under-pressure/
  app/
    layout.tsx              # root layout, font, metadata, skip-link
    page.tsx                # the single scrollytelling page, composes chapters
    globals.css             # token definitions + base styles
  components/
    core/
      PulseCore.tsx         # the signature pulsing hypertension core
      Vessel.tsx            # the signature vessel: length = value, into a node
      VesselFan.tsx         # a fan of vessels from a shared core (used by most chapters)
    layout/
      Chapter.tsx           # section shell: eyebrow, title, lede, reveal, id
      ProgressNav.tsx       # fixed top nav + section dots
      SkipLink.tsx
    chapters/
      Hero.tsx
      GlobalMap.tsx         # radial map, 194 countries, country finder
      SexRace.tsx           # paired vessels, men/women toggle
      Consequences.tsx
      Activity.tsx
      Sleep.tsx
      Occupation.tsx        # jobs; carries the "find your work" personalization
      Sodium.tsx            # DASH levers (the hero interaction)
      Trend.tsx             # single reading vs trend toggle
      Bridge.tsx            # the one action + hand-off to self-monitoring
      Sources.tsx           # footer with full source list
    ui/
      Toggle.tsx            # accessible segmented control (aria-pressed)
      Select.tsx            # accessible labeled select
      Slider.tsx            # accessible range input
      Readout.tsx           # aria-live number + context line
  lib/
    data.ts                 # typed datasets (see data/ and section 6)
    scales.ts               # shared D3 scale helpers, radial math (pol, rad)
    hooks/useReveal.ts      # IntersectionObserver reveal + active-section
    format.ts               # number formatting, "X in 100" helpers
  data/
    countries.json          # 194-country WHO dataset (shipped in this package)
  public/
  CLAUDE.md
```

Co-locate a chapter's sub-components inside its file or a folder next to it if it grows. Keep `page.tsx` a thin composition of `<Chapter>`-wrapped chapters in narrative order.

---

## 5. Design system

The canonical look comes from the poster's style guide. Define everything as tokens in `globals.css` under `:root` and reference through Tailwind. This is a **dark-canvas** design.

### Color tokens (exact, from the poster style guide)

```
--canvas:    #1B1A21;   /* page background */
--canvas-2:  #141319;   /* deeper panels, hero */
--panel:     #232030;   /* cards */
--line:      #34303E;   /* hairlines, borders */
--ink:       #F2EFEA;   /* primary text */
--mute:      #C9C3D0;   /* secondary text */
--faint:     #8A8390;   /* captions, footnotes */
--pulse:     #E86A5A;   /* the core, primary accent (arterial) */
--pulse-deep:#E0574B;   /* gradient partner for vessels */

/* WHO region colors (used in the global map) */
--reg-seasia:  #E58A3C;  /* South-East Asia */
--reg-wpac:    #E5695C;  /* Western Pacific */
--reg-africa:  #C64B9F;  /* Africa */
--reg-americas:#4E8FD0;  /* Americas */
--reg-europe:  #46A986;  /* Europe */
--reg-emed:    #8E7BD6;  /* Eastern Mediterranean */

/* semantic accents */
--women:   #C77DA8;   /* women, in the sex/race chapter */
--diabetes:#E8B14A;   /* diabetes, in consequences */
--dash:    #8AD4BD;   /* the DASH diet, in the sodium chapter */
--teal:    #5FB89C;   /* "better/lower" cue where a positive direction is shown */
```

Rules: tone whites and blacks toward the palette (never pure `#fff`/`#000`). Body text holds at least 4.5:1 contrast on its background; large text at least 3:1. Colors that must be told apart also differ in lightness, never hue alone (the region set already satisfies this). Color never carries meaning alone (section 7).

### Typography
- Inter throughout. Scale (reuse, do not invent sizes): hero 96 / h2 52 / h3 32 / body 20 / small 16 / caption 14 (px at desktop; fluid-clamp down for mobile).
- Weights: 700 headings, 600 labels and emphasis, 400 body. Emphasize with weight or color, not new sizes.
- Numbers use `font-variant-numeric: tabular-nums`.
- Use typographic apostrophes and quotes in copy.

### Signature elements (build these as reusable components first)
- **PulseCore:** a filled coral circle with a soft radial glow and one or two expanding rings, a slow "heartbeat" scale animation (~1.6s), and an optional small ECG polyline. This is the visual anchor of the whole site and the hero. Must fall back to a still core under reduced motion.
- **Vessel:** a line/ribbon whose **length encodes the value**, flowing from the core out to a labeled **node**. Supports a confidence band (a paler segment at the tip for the 95% interval), a gradient from `--pulse-deep` into the category color, and a glow at the node. On the poster these fan out radially; on the web, horizontal vessels (length = value) are the simplest honest form for most chapters, with the radial fan reserved for the global map and optionally the hero. Length must map to value against a labeled scale, never a truncated axis that exaggerates differences without labels.

### Motion
- Reveal on scroll (fade + small rise), staggered for grouped items.
- Vessels animate their length in on first reveal (grow from the core), ~900ms ease-out.
- Everything behind `prefers-reduced-motion: reduce` collapses to instant, no transforms, no looping animation.

### Layout
- Mobile-first. Single column. Max content width ~1040px, centered, 24px side gutters.
- Each chapter is a full section with generous vertical rhythm (~120px padding), separated by a hairline.
- A fixed, minimal top progress nav with section dots (hidden on narrow screens).

---

## 6. Data layer and honesty rules

All numbers below are real and sourced. They live in `lib/data.ts` as typed, immutable constants, plus `data/countries.json` for the 194-country set. **Never invent or alter a value.** Every chapter must render its source line in the UI.

### Comparability warnings that MUST appear in the UI
- The global map uses the **140/90 mmHg** threshold (WHO, adults 30 to 79). The U.S. modules use the stricter **130/80**. The percentages are **not interchangeable**. Say so near any place the two could be compared (a short "how to read" note at the top works).
- **Surveys show a link, not a cause.** NHANES, NHIS, BRFSS describe who has high blood pressure; label these associations, not causation.
- **The DASH-Sodium trial is the one exception:** it was randomized, so its drops were *caused* by the diet and salt. Say this explicitly in that chapter.
- Occupation shares are **crude, not age-adjusted**; some trades skew older. Show the age-adjusted prevalence ratios alongside so trucking's crude lead is not misread as cause.

### Dataset 1 — Global map (`data/countries.json`)
194 objects: `{ c: countryName, r: regionName, v: prevalence, lo: ciLow, hi: ciHigh }`. Age-standardized, both sexes, 2019, 140/90.
- World median: **38.0**. Regions land between 34 and 39.
- Region averages: Africa 37.0, Americas 38.9, Eastern Mediterranean 38.5, Europe 38.4, South-East Asia 33.8, Western Pacific 36.0.
- Region counts: Africa 47, Americas 36, Eastern Mediterranean 22, Europe 51, South-East Asia 10, Western Pacific 28.
- Source: WHO Global Health Observatory, indicator NCD_HYP_PREVALENCE_A, estimates by NCD-RisC. https://www.who.int/data/gho

### Dataset 2 — Sex and race (NHANES 2021–2023, 130/80, age-adjusted)
All adults: 44.5 (95% CI 42.1–46.9).

| Group | Men % (CI) | Women % (CI) | Sex gap (pts) |
|---|---|---|---|
| Black (non-Hispanic) | 59.8 (51.8–67.4) | 56.5 (47.7–64.9) | 3.3 |
| White (non-Hispanic) | 47.3 (44.1–50.5) | 39.0 (36.4–41.7) | 8.3 |
| Asian (non-Hispanic) | 47.3 (38.3–56.5) | 37.3 (30.4–44.6) | 10.0 |
| Hispanic | 48.0 (41.9–54.2) | 34.7 (27.9–42.1) | 13.3 |

Key reading: men higher in every group; the gap widens from Black to Hispanic; Black women (56.5) sit above the men of every other group. Social groupings shaped by access and environment, not biology.
Source: NHANES via MMWR QuickStats 73(48). https://www.cdc.gov/mmwr/volumes/73/wr/mm7348a5.htm · data table https://stacks.cdc.gov/view/cdc/170362

### Dataset 3 — Consequences (CDC WONDER, multiple-cause, adults 25+, 2023, per 100,000)
Diabetes 66.2 · Heart attack (acute MI) 16.3 · Obesity 13.2 · Hemorrhagic stroke 6.9.
Context: overall hypertension-related 40.2 per 100,000 (men 46.7, women 33.9), up from 27.0 in 1979.
A link, not proof of cause. Rates are comparable because all use the same method.
Source: CDC WONDER Multiple Cause of Death. https://wonder.cdc.gov/mcd.html (published analyses: diabetes PMC12217654, acute MI PMC12012249, obesity PMC12380657, hemorrhagic stroke PMC12277664; overall trend doi 10.1007/s40292-025-00775-0)

### Dataset 4 — Activity (NHANES, adults 40–80, 130/80; share with high BP)
Barely active 68 · Active 57 · Very active 57. The big drop is from getting started (68 to 57); extremes add little.
Source: Miezah et al., American Journal of Lifestyle Medicine, 2026. https://doi.org/10.1177/15598276261419397

### Dataset 5 — Sleep (NHIS, 71,455 adults, age-standardized; share with high BP)
Too little (under 6h) 32 · Just right (7–8h) 23 · Too much (10+h) 32. A U-shape; 7–8h is the sweet spot.
Source: Grandner et al. (NHIS). https://pmc.ncbi.nlm.nih.gov/articles/PMC4791534/

### Dataset 6 — Occupation (BRFSS 2017, 31 states; share ever told, crude per 100 workers)
Hospitals 20.2 (18.0–22.5) · Essential retail 22.7 (18.8–26.9) · Public transit 23.2 (18.0–29.1) · Clinics 23.3 (20.7–26.1) · Food manufacturing 26.6 (18.9–35.4) · Nursing homes 27.7 (23.2–32.5) · Trucking 29.6 (24.4–35.1). All workers 23.7 (23.1–24.4).
Age-adjusted prevalence ratios vs all workers: nursing homes 1.24 (still elevated), trucking 1.01 (mostly an older workforce), hospitals 0.90 (slightly below). Crude, not age-adjusted; show the ratios so the age confound is visible.
Source: MMWR 2020, BRFSS. https://pmc.ncbi.nlm.nih.gov/articles/PMC7499835/

### Dataset 7 — Sodium and diet (DASH-Sodium trial, 412 adults, NEJM 2001; systolic change vs typical diet at high salt)
Typical/high 0.0 (baseline) · Typical/medium −2.1 · DASH/high −5.9 · Typical/low −6.7 (CI −5.4 to −8.0) · DASH/medium −7.2 · DASH/low −8.9 (CI −6.7 to −11.1).
Best combination: DASH + low salt, −8.9 mmHg systolic. Randomized trial, so the diet caused the drop.
Source: Sacks et al., NEJM 2001;344:3-10. https://doi.org/10.1056/NEJM200101043440101

### Underlying surveys
NHANES https://www.cdc.gov/nchs/nhanes · NHIS https://www.cdc.gov/nchs/nhis · BRFSS https://www.cdc.gov/brfss

---

## 7. Accessibility requirements (hard constraints)

- **WCAG 2.1 AA.** Verify contrast for every text/background pair against the tokens.
- **Color never alone.** Every status, category, or direction is also carried by a text label, a shape, or a position. The men/women split, the above/below-average cue, the region of a country: all labeled, never color-only.
- **Keyboard.** The entire experience works with keyboard only. Visible focus rings (use the pulse color at 2–3px, offset). Logical tab order. Skip-link to main content.
- **Screen readers.** Charts are not left as bare SVG. Each vessel/chart has a text equivalent: either a visually-hidden data table or an `aria-label`/`figcaption` that states the numbers and the takeaway. Interactive readouts use `aria-live="polite"` so a change (new country, new lever value) is announced. Decorative SVG is `aria-hidden`.
- **Forms.** Every control (select, slider, toggle) has an associated `<label>`; segmented toggles use `role="group"` with `aria-pressed` buttons; sliders expose value text.
- **Motion.** Honor `prefers-reduced-motion: reduce`: no looping heartbeat, no scroll-triggered transforms, instant reveals. Provide the same information without the motion.
- **Targets and text.** Touch targets at least 44px. No text below 16px in the running UI (14px only for true captions/footnotes). Body copy is readable at a grade-5 to grade-8 level.
- **Responsive.** No horizontal scroll at 320px width. Charts reflow or scale; the radial map gets a legible mobile treatment (see Phase for the map).

Treat these as acceptance criteria. A component is not done if it fails any of them.

---

## 8. Voice and copy rules

- Plain, warm, human. Short sentences. Address the reader as "you" where it helps.
- **No em dashes or en dashes.** Use commas, periods, parentheses, or "to" for ranges in prose. (In data tables an en dash for a numeric range is fine.)
- Avoid phrasing that reads as AI-generated. No "it's not just X, it's Y," no hype, no filler.
- Always "out of 100 people" (or "in 100") rather than a bare percent where a lay reader benefits.
- Every chart states its source in the UI, in small type.
- The reading guide up top explains the two thresholds and the link-vs-cause distinction in one or two plain sentences.

---

## 9. Narrative order (the single page, top to bottom)

1. **Hero** — the pulse core, one calm sentence, scroll cue. No numbers yet.
2. **How to read** (compact) — two thresholds, surveys show links, the trial shows cause.
3. **Global map** — where it is. Radial map of 194 countries; find your country.
4. **Sex and race** — who carries it. Paired vessels, men/women toggle.
5. **Consequences** — what it travels with. Vessels for the co-listed conditions.
6. **Activity** — move more, no need to be an athlete.
7. **Sleep** — the sweet spot (U-shape).
8. **Occupation** — the jobs under pressure; find your work (personalization).
9. **Sodium and diet** — the levers (the one causal story). The hero interaction.
10. **Trend, not panic** — single reading vs the trend line.
11. **Bridge** — one thing you can do; hand off toward home self-monitoring.
12. **Sources** — full list, with links.

---

## 10. Quality bar (definition of done)

- Lighthouse: Performance, Accessibility, Best Practices, SEO all 95+ on mobile. Accessibility must be 100.
- No TypeScript `any` in committed code. Strict mode passes. ESLint clean.
- No console errors or warnings in the browser.
- Works and looks right at 320px, 768px, 1280px, and 1920px.
- Verified with keyboard only, and with a screen reader pass on at least the map, the levers, and one toggle.
- Reduced-motion verified (no looping or scroll transforms).
- Deploys to Vercel from a clean clone with `pnpm install && pnpm build` and no manual steps.
- Every number on screen matches section 6 exactly, and every chart shows its source.

---

## 11. What NOT to do

- Do not invent data, fill gaps from memory, or round in a way that changes the story.
- Do not imply cause for the survey chapters, or omit the 140/90 vs 130/80 warning.
- Do not add a generic charting library or a UI kit; the visual language is bespoke.
- Do not collect, store, or transmit any user input. Personalization is in-memory only.
- Do not use pure black or white, raw hex in components (use tokens), or color as the only signal.
- Do not ship anything that fails a section 7 requirement to "save time."
- Do not use em or en dashes in prose copy.

---

## 12. Decisions added by the author (October 2026)

These override the matching parts of sections 3, 4 and 9 above.

- **Deep-dive pages.** The main page stays the guided scroll story. Each data chapter ends with a "Read more" link to its own page at `/stories/<slug>` (global-map, sex-race, consequences, activity, sleep, occupation, sodium). A deep-dive page holds fuller context, the full data table, how-to-read and method notes, and links out to the original sources. Deep-dive pages follow every rule in this file.
- **Motion stack.** GSAP (with ScrollTrigger) and Lenis are approved, alongside or in place of Framer Motion. GSAP drives pinned, scroll-scrubbed scenes; Lenis gives smooth scrolling. Both must switch off completely under `prefers-reduced-motion: reduce` (native scroll, no pinning or scrubbing, instant reveals).
- **Package manager.** npm (pnpm is not installed on the author's machine).
- **Motion references.** flourish.studio (interactive charts), theinnerwebs.com, everydaygift.polimata.mx, thoughtbot.com/healthcare-software-delivery-report, and above all palmo.co.in for how information is revealed and animated.

## 13. Revisions after the first review (October 2026)

These override the matching parts of sections 1, 5, 8 and 9.

- **Name.** The site is **Between the Beats** (blood pressure is the push of each beat and the pressure that remains between beats). The poster title, "The Pressure We Live In", stays as the link to print. The repo folder keeps the old name.
- **Voice.** Neutral and informational. Do not address the reader ("you", "your", "find yours"), and never assume the reader has high blood pressure. Describe what the data shows. This replaces the "address the reader as you" line in section 8.
- **Themes.** Dark (the poster palette) and light. Tokens are defined for both in `globals.css`; the theme follows the device until the visitor picks one with the toggle (stored in localStorage only). Every light-mode text color holds 4.5:1 on `--canvas`. Use `--on-pulse` for anything drawn on the pulse color.
- **Signature motion.** The ECG is a moving trace that scrolls past at one period per heartbeat (1.6s), timed so each spike leaves the core as it swells; the trace inside the core moves the same way. Still under reduced motion.
- **Global map.** The country select became a dial: the ring rotates under a fixed needle (drag, arrow keys, tap a dot, previous/next buttons, or search). It is an ARIA slider; the readout announces once the dial settles.
- **Closing chapter.** "What you can do" became "How a reading works": facts about measurement, not instructions.
- **Occupation.** The age panel toggles between raw and age-matched. Raw ratios are derived in the UI as the industry share divided by the all-worker share (trucking 1.25, nursing homes 1.17, hospitals 0.85) and are labeled as calculated; the age-matched ratios are the study's.
- **Sodium.** The salt slider handle is a salt shaker that pours more at higher salt; the food toggle shows two plates.

## 14. Second review (November 2026)

- **Section menu.** The unlabeled dots are gone. The top bar has a "Sections" button that always names the current section and opens a numbered, grouped list of every section (arrow keys, Escape, focus moves to the section after a jump), plus previous/next steppers on wider screens.
- **Picture sliders everywhere a slider fits.** One `Slider` with a picture handle from `components/ui/thumbs.tsx`: the salt shaker (sodium), a moon that fills with drifting z's (sleep), a sneaker that leans in with speed lines (activity), and a balance that tips by the men/women gap (sex and race). Each handle animates only without reduced motion.
- **Self-check.** A chapter after "How a reading works". A three-part form (about you; daily habits with the picture sliders; an optional recent reading), then a "See where I stand" button that opens a personal report: a summary sentence, a 0 to 3 habit meter, the reading's AHA category (2017 ACC/AHA) with bands, one card per answer with a status (in the lower group / partway / room to move / not a choice), and numbered light suggestions drawn from the data and public guidelines (AHA, CDC activity guidelines). The numbers are never combined into a risk score. Labeled as not a diagnosis; nothing stored or sent.
- **Voice exception.** The self-check alone speaks to the reader ("you", "where you stand"), because the reader asks for it by filling in the form. The rest of the site stays neutral.
