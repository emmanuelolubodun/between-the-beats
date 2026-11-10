// datasets.ts
// All numbers are real and sourced. Do not alter them. See CLAUDE.md section 6.
// Countries load from data/countries.json (194 rows): { c, r, v, lo, hi }.
// Move this file to lib/data.ts (or import from here) in the Next.js app.

export type Region =
  | 'Africa'
  | 'Americas'
  | 'Eastern Mediterranean'
  | 'Europe'
  | 'South-East Asia'
  | 'Western Pacific';

export interface Country {
  c: string; // country name (display)
  r: Region; // WHO region
  v: number; // age-standardized prevalence %, 2019, 140/90
  lo: number; // 95% CI low
  hi: number; // 95% CI high
}

export const WORLD_MEDIAN = 38.0;

export const REGION_META: Record<
  Region,
  { color: string; token: string; avg: number; count: number }
> = {
  'South-East Asia': { color: '#E58A3C', token: '--reg-seasia', avg: 33.8, count: 10 },
  'Western Pacific': { color: '#E5695C', token: '--reg-wpac', avg: 36.0, count: 28 },
  Africa: { color: '#C64B9F', token: '--reg-africa', avg: 37.0, count: 47 },
  Americas: { color: '#4E8FD0', token: '--reg-americas', avg: 38.9, count: 36 },
  Europe: { color: '#46A986', token: '--reg-europe', avg: 38.4, count: 51 },
  'Eastern Mediterranean': { color: '#8E7BD6', token: '--reg-emed', avg: 38.5, count: 22 },
};

// ---- Sex and race: NHANES 2021-2023, 130/80, age-adjusted ----
export const ALL_ADULTS = { v: 44.5, lo: 42.1, hi: 46.9 };

export interface SexRaceGroup {
  group: string;
  men: { v: number; lo: number; hi: number };
  women: { v: number; lo: number; hi: number };
  gap: number; // percentage points
}

export const SEX_RACE: SexRaceGroup[] = [
  { group: 'Black', men: { v: 59.8, lo: 51.8, hi: 67.4 }, women: { v: 56.5, lo: 47.7, hi: 64.9 }, gap: 3.3 },
  { group: 'White', men: { v: 47.3, lo: 44.1, hi: 50.5 }, women: { v: 39.0, lo: 36.4, hi: 41.7 }, gap: 8.3 },
  { group: 'Asian', men: { v: 47.3, lo: 38.3, hi: 56.5 }, women: { v: 37.3, lo: 30.4, hi: 44.6 }, gap: 10.0 },
  { group: 'Hispanic', men: { v: 48.0, lo: 41.9, hi: 54.2 }, women: { v: 34.7, lo: 27.9, hi: 42.1 }, gap: 13.3 },
];

// ---- Consequences: CDC WONDER, multiple-cause, adults 25+, 2023, per 100,000 ----
export const CONSEQUENCES = [
  { name: 'Diabetes', sub: 'diabetes on the certificate', v: 66.2, color: '#E8B14A' },
  { name: 'Heart attack', sub: 'acute myocardial infarction', v: 16.3, color: '#E86A5A' },
  { name: 'Obesity', sub: 'obesity on the certificate', v: 13.2, color: '#E86A5A' },
  { name: 'Hemorrhagic stroke', sub: 'bleeding in the brain', v: 6.9, color: '#8E7BD6' },
];

export const CONSEQUENCES_CONTEXT = {
  overall: 40.2, // per 100,000, hypertension-related, 2023
  men: 46.7,
  women: 33.9,
  in1979: 27.0,
};

// ---- Activity: NHANES adults 40-80, 130/80, share with high BP ----
export const ACTIVITY = [
  { level: 'Barely active', sub: 'little activity', v: 68 },
  { level: 'Active', sub: 'meets the guideline', v: 57 },
  { level: 'Very active', sub: 'well beyond it', v: 57 },
];

// ---- Sleep: NHIS 71,455 adults, age-standardized, share with high BP ----
export const SLEEP = [
  { band: 'Too little', sub: 'under 6 hrs', v: 32, sweet: false },
  { band: 'Just right', sub: '7 to 8 hrs', v: 23, sweet: true },
  { band: 'Too much', sub: '10+ hrs', v: 32, sweet: false },
];

// ---- Occupation: BRFSS 2017, 31 states, crude share per 100 workers ----
export const ALL_WORKERS = { v: 23.7, lo: 23.1, hi: 24.4 };

export interface Industry {
  name: string;
  sub: string;
  v: number;
  lo: number;
  hi: number;
  apr?: { v: number; lo: number; hi: number; note: string }; // age-adjusted prevalence ratio vs all workers
}

export const OCCUPATION: Industry[] = [
  { name: 'Hospitals', sub: 'nurses, aides, staff', v: 20.2, lo: 18.0, hi: 22.5, apr: { v: 0.9, lo: 0.81, hi: 1.0, note: 'slightly below average' } },
  { name: 'Essential retail', sub: 'grocery and store', v: 22.7, lo: 18.8, hi: 26.9 },
  { name: 'Public transit', sub: 'bus and subway crews', v: 23.2, lo: 18.0, hi: 29.1 },
  { name: 'Clinics', sub: 'outpatient and ambulatory care', v: 23.3, lo: 20.7, hi: 26.1 },
  { name: 'Food manufacturing', sub: 'processing and packing', v: 26.6, lo: 18.9, hi: 35.4 },
  { name: 'Nursing homes', sub: 'long-term and rehab care', v: 27.7, lo: 23.2, hi: 32.5, apr: { v: 1.24, lo: 1.08, hi: 1.43, note: 'still elevated after age adjustment' } },
  { name: 'Trucking', sub: 'long-haul and delivery', v: 29.6, lo: 24.4, hi: 35.1, apr: { v: 1.01, lo: 0.85, hi: 1.2, note: 'mostly reflects an older workforce' } },
];

// ---- Sodium and diet: DASH-Sodium trial, 412 adults, NEJM 2001 ----
// drop = systolic change (mmHg) vs the typical diet at high salt
export type Diet = 'typical' | 'dash';
export type Salt = 'high' | 'medium' | 'low';

export interface DashCell {
  diet: Diet;
  salt: Salt;
  drop: number; // negative = lower; 0 = baseline
  ci?: { lo: number; hi: number };
}

export const DASH: DashCell[] = [
  { diet: 'typical', salt: 'high', drop: 0.0 },
  { diet: 'typical', salt: 'medium', drop: -2.1 },
  { diet: 'typical', salt: 'low', drop: -6.7, ci: { lo: -5.4, hi: -8.0 } },
  { diet: 'dash', salt: 'high', drop: -5.9 },
  { diet: 'dash', salt: 'medium', drop: -7.2 },
  { diet: 'dash', salt: 'low', drop: -8.9, ci: { lo: -6.7, hi: -11.1 } },
];

export function dashDrop(diet: Diet, salt: Salt): DashCell {
  return DASH.find((d) => d.diet === diet && d.salt === salt)!;
}

// ---- Sources (render in the Sources chapter and per-chapter source lines) ----
export const SOURCES = [
  { module: 'Global map', org: 'WHO GHO, NCD-RisC', year: '2019', link: 'https://www.who.int/data/gho' },
  { module: 'Sex and race', org: 'NHANES, MMWR 73(48)', year: '2021 to 2023', link: 'https://www.cdc.gov/mmwr/volumes/73/wr/mm7348a5.htm' },
  { module: 'Consequences', org: 'CDC WONDER, Multiple Cause of Death', year: '2023', link: 'https://wonder.cdc.gov/mcd.html' },
  { module: 'Activity', org: 'NHANES, Miezah et al.', year: '2026', link: 'https://doi.org/10.1177/15598276261419397' },
  { module: 'Sleep', org: 'NHIS, Grandner et al.', year: 'n/a', link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4791534/' },
  { module: 'Occupation', org: 'BRFSS, MMWR 2020', year: '2017', link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7499835/' },
  { module: 'Sodium and diet', org: 'DASH-Sodium trial, NEJM', year: '2001', link: 'https://doi.org/10.1056/NEJM200101043440101' },
];

// Comparability notes that MUST surface in the UI (see CLAUDE.md section 6).
export const READING_NOTES = {
  thresholds:
    'The global map uses 140/90 mmHg for adults 30 to 79. The U.S. data uses the stricter 130/80, so the percentages are not interchangeable.',
  surveys: 'Surveys (NHANES, NHIS, BRFSS) show who has high blood pressure. That is a link, not a cause.',
  trial: 'The DASH-Sodium trial assigned diets at random, so the drops it found were caused by the food and salt.',
};
