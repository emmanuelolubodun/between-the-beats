// Typed data layer. Values come straight from data/ (see CLAUDE.md section 6).
// Never edit numbers here; edit nothing at all unless the source changes.
import countriesJson from '@/data/countries.json';
import type { Country, Region } from '@/data/datasets';

export * from '@/data/datasets';

export const COUNTRIES: readonly Country[] = countriesJson as Country[];

/** Regions in the order the radial map walks them (matches the poster). */
export const REGION_ORDER: readonly Region[] = [
  'South-East Asia',
  'Western Pacific',
  'Africa',
  'Americas',
  'Europe',
  'Eastern Mediterranean',
];

/** Countries sorted high to low, used for rank ("12th of 194"). */
export const COUNTRIES_BY_VALUE: readonly Country[] = [...COUNTRIES].sort((a, b) => b.v - a.v);

export function countryRank(name: string): number {
  return COUNTRIES_BY_VALUE.findIndex((c) => c.c === name) + 1;
}

export function findCountry(name: string): Country | undefined {
  return COUNTRIES.find((c) => c.c === name);
}
