// Visible data tables for the deep-dive pages, built straight from lib/data.ts.
import { ACTIVITY, ALL_ADULTS, ALL_WORKERS, CONSEQUENCES, DASH, OCCUPATION, SEX_RACE, SLEEP } from './data';
import type { StorySlug } from './stories';

export interface StoryTable {
  columns: string[];
  rows: string[][];
  note?: string;
}

const range = (lo?: number, hi?: number) => (lo !== undefined && hi !== undefined ? `${lo} to ${hi}` : 'not reported');

export const STORY_TABLES: Partial<Record<StorySlug, StoryTable>> = {
  'sex-race': {
    columns: ['Group', 'Men, in 100', 'Likely range', 'Women, in 100', 'Likely range', 'Gap (points)'],
    rows: [
      ...SEX_RACE.map((g) => [
        g.group,
        String(g.men.v),
        range(g.men.lo, g.men.hi),
        g.women.v.toFixed(1),
        range(g.women.lo, g.women.hi),
        g.gap.toFixed(1),
      ]),
      ['All adults', String(ALL_ADULTS.v), range(ALL_ADULTS.lo, ALL_ADULTS.hi), '', '', ''],
    ],
    note: 'Black, White and Asian groups are non-Hispanic.',
  },
  consequences: {
    columns: ['Condition listed with high blood pressure', 'Deaths per 100,000'],
    rows: CONSEQUENCES.map((c) => [`${c.name} (${c.sub})`, c.v.toFixed(1)]),
  },
  activity: {
    columns: ['Activity level', 'Out of 100 adults with high blood pressure'],
    rows: ACTIVITY.map((a) => [`${a.level} (${a.sub})`, String(a.v)]),
  },
  sleep: {
    columns: ['Sleep each night', 'Out of 100 adults with high blood pressure'],
    rows: SLEEP.map((s) => [`${s.band} (${s.sub})`, String(s.v)]),
  },
  occupation: {
    columns: ['Industry', 'Out of 100 workers (raw)', 'Likely range', 'Age-matched, times the average'],
    rows: [
      ...[...OCCUPATION]
        .sort((a, b) => b.v - a.v)
        .map((o) => [
          `${o.name} (${o.sub})`,
          o.v.toFixed(1),
          range(o.lo, o.hi),
          o.apr ? `${o.apr.v.toFixed(2)} (range ${o.apr.lo.toFixed(2)} to ${o.apr.hi.toFixed(2)})` : 'not reported',
        ]),
      ['All workers', String(ALL_WORKERS.v), range(ALL_WORKERS.lo, ALL_WORKERS.hi), '1.00'],
    ],
  },
  sodium: {
    columns: ['Food', 'Salt', 'Change in top number (points)', 'Likely range'],
    rows: DASH.map((d) => [
      d.diet === 'dash' ? 'DASH' : 'Typical',
      d.salt,
      d.drop === 0 ? '0 (starting point)' : d.drop.toFixed(1),
      d.ci ? `${d.ci.lo.toFixed(1)} to ${d.ci.hi.toFixed(1)}` : 'not reported',
    ]),
  },
};
