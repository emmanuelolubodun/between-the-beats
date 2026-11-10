// The seven data stories: their place on the main page, their deep-dive page, and the
// longer reading for that page. Copy follows CLAUDE.md section 8 (no em or en dashes).
// Every number here repeats CLAUDE.md section 6; nothing new is introduced.

export type StorySlug = 'global-map' | 'sex-race' | 'consequences' | 'activity' | 'sleep' | 'occupation' | 'sodium';

export interface StoryNote {
  heading: string;
  body: string[];
}

export interface Story {
  slug: StorySlug;
  anchor: string; // section id on the main page
  short: string; // nav and story-map label
  question: string; // the plain question this story answers
  title: string;
  color: string; // css var for this story's accent
  basis: string; // threshold and population, one line
  sourceIndex: number; // index into SOURCES
  extraLinks?: { label: string; href: string }[];
  notes: StoryNote[];
}

export const STORIES: readonly Story[] = [
  {
    slug: 'global-map',
    anchor: 'where',
    short: 'Where it is',
    question: 'Where in the world is it?',
    title: 'Everywhere, at about the same height',
    color: 'var(--reg-americas)',
    basis: 'WHO estimates, 2019. Adults 30 to 79, both sexes, age-standardized, 140/90 mmHg.',
    sourceIndex: 0,
    notes: [
      {
        heading: 'What the map shows',
        body: [
          'Each spoke is one of 194 countries. The dot is the best estimate of how many adults in 100 have high blood pressure. The thin line through it is the range the true value most likely falls in (the 95% range).',
          'Countries are grouped by WHO region and sorted from lowest to highest inside each region, so every arc climbs as it goes clockwise.',
          'The dashed ring is the world middle: 38 in 100. Half of all countries sit above it and half below.',
        ],
      },
      {
        heading: 'What stands out',
        body: [
          'The regions are closer than might be expected. Their averages all land between about 34 and 39 in 100. South-East Asia is lowest at 33.8. The Americas are highest at 38.9.',
          'The spread inside a region is much wider than the gap between regions. That means the country says more than the region it belongs to.',
        ],
      },
      {
        heading: 'What it cannot show',
        body: [
          'These are modeled estimates built from many national surveys (by the NCD Risk Factor Collaboration). Some countries have few surveys, which is why their range lines are long.',
          'The map uses the 140/90 threshold. The U.S. chapters use the stricter 130/80, so their numbers run higher and cannot be compared directly with this map.',
        ],
      },
    ],
  },
  {
    slug: 'sex-race',
    anchor: 'who',
    short: 'Who carries it',
    question: 'Who carries it?',
    title: 'Men more often, and Black adults most of all',
    color: 'var(--women)',
    basis: 'NHANES 2021 to 2023, U.S. adults, age-adjusted, 130/80 mmHg.',
    sourceIndex: 1,
    extraLinks: [{ label: 'CDC data table for this chart', href: 'https://stacks.cdc.gov/view/cdc/170362' }],
    notes: [
      {
        heading: 'What the chart shows',
        body: [
          'Each group has two vessels: men and women. The further a node sits from the core, the more people in that group have high blood pressure.',
          'Across all U.S. adults it is 44.5 in 100. That is the dashed ring.',
        ],
      },
      {
        heading: 'Three things to notice',
        body: [
          'Men are higher than women in every group.',
          'The gap between men and women grows from Black adults (3.3 points) to White (8.3), Asian (10.0) and Hispanic adults (13.3).',
          'Black women, at 56.5 in 100, are higher than the men of every other group.',
        ],
      },
      {
        heading: 'How to read race here',
        body: [
          'Race in these surveys is a social grouping. Differences between groups are shaped by access to care, stress, income, neighborhoods and environment. They are not explained by biology.',
          'This is a survey, so it shows a link and not a cause.',
        ],
      },
    ],
  },
  {
    slug: 'consequences',
    anchor: 'consequences',
    short: 'What it travels with',
    question: 'What does it travel with?',
    title: 'It rarely acts alone',
    color: 'var(--diabetes)',
    basis: 'CDC WONDER, multiple causes of death, U.S. adults 25 and older, 2023. Deaths per 100,000.',
    sourceIndex: 2,
    extraLinks: [
      { label: 'Diabetes analysis (PMC12217654)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12217654/' },
      { label: 'Heart attack analysis (PMC12012249)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12012249/' },
      { label: 'Obesity analysis (PMC12380657)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12380657/' },
      {
        label: 'Hemorrhagic stroke analysis (PMC12277664)',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12277664/',
      },
      { label: 'Overall trend since 1979', href: 'https://doi.org/10.1007/s40292-025-00775-0' },
    ],
    notes: [
      {
        heading: 'What the chart shows',
        body: [
          'When a death certificate lists high blood pressure, it usually lists something else too. Each vessel is one of those other conditions. Its length is how many deaths per 100,000 adults list both.',
          'Diabetes reaches furthest by far, at 66.2. That is about four times heart attack (16.3), five times obesity (13.2) and nearly ten times bleeding strokes (6.9).',
        ],
      },
      {
        heading: 'The bigger picture',
        body: [
          'Deaths related to high blood pressure have risen over time: 27.0 per 100,000 in 1979 and 40.2 in 2023. Men (46.7) are higher than women (33.9).',
        ],
      },
      {
        heading: 'What it cannot show',
        body: [
          'These pairings overlap and do not add up to a total. They show a link, not proof that one condition caused the other.',
          'The rates can be compared with each other because every one was measured the same way, from the same death records.',
        ],
      },
    ],
  },
  {
    slug: 'activity',
    anchor: 'activity',
    short: 'Moving',
    question: 'Does moving more help?',
    title: 'Getting started matters most',
    color: 'var(--teal)',
    basis: 'NHANES, U.S. adults aged 40 to 80, 130/80 mmHg.',
    sourceIndex: 3,
    notes: [
      {
        heading: 'What the chart shows',
        body: [
          'Out of every 100 adults in each activity group, how many have high blood pressure.',
          'Barely active: 68 in 100, about 2 in 3. Active (meets the guideline): 57 in 100. Very active: also 57 in 100.',
        ],
      },
      {
        heading: 'What stands out',
        body: [
          'The big drop happens between barely active and active, 68 down to 57. Going far beyond the guideline adds nothing more in this data.',
          'The pattern is gentle: athletic levels of activity are not where the difference lies. Meeting the guideline is linked with the whole drop.',
        ],
      },
      {
        heading: 'What it cannot show',
        body: [
          'This is a survey, so it shows a link and not a cause. People who are already unwell may move less, which can make the link look stronger than the effect.',
        ],
      },
    ],
  },
  {
    slug: 'sleep',
    anchor: 'sleep',
    short: 'Sleeping',
    question: 'How much sleep is linked with lower pressure?',
    title: 'The sleep sweet spot',
    color: 'var(--teal)',
    basis: 'NHIS, 71,455 U.S. adults, age-standardized.',
    sourceIndex: 4,
    notes: [
      {
        heading: 'What the chart shows',
        body: [
          'Out of every 100 adults in each sleep group, how many have high blood pressure.',
          'Under 6 hours a night: 32 in 100. Seven to 8 hours: 23 in 100. Ten hours or more: 32 in 100.',
        ],
      },
      {
        heading: 'What stands out',
        body: [
          'It is a U shape. Both ends sit at the same height, and the calm middle of the night is lowest. Seven to 8 hours is the sweet spot, about 1 in 4 instead of about 1 in 3.',
        ],
      },
      {
        heading: 'What it cannot show',
        body: [
          'This is a survey, so it shows a link and not a cause. Very long sleep can be a sign of other illness rather than a cause of high blood pressure.',
        ],
      },
    ],
  },
  {
    slug: 'occupation',
    anchor: 'work',
    short: 'Work',
    question: 'Which jobs carry the most?',
    title: 'The jobs under pressure',
    color: 'var(--pulse)',
    basis:
      'BRFSS 2017, 31 U.S. states. Share of workers ever told they have high blood pressure. Crude, not age-adjusted.',
    sourceIndex: 5,
    notes: [
      {
        heading: 'What the chart shows',
        body: [
          'Each vessel is one frontline industry. Its length is how many workers in 100 have ever been told they have high blood pressure. The dashed ring is all workers: 23.7 in 100.',
          'Trucking reaches furthest (29.6), then nursing homes (27.7) and food manufacturing (26.6). Hospitals sit lowest (20.2).',
        ],
      },
      {
        heading: 'One important caution: age',
        body: [
          'These are raw shares, not adjusted for age. Blood pressure rises with age, and some trades have older workforces.',
          'After the researchers matched workers by age, the picture changes. Trucking falls to 1.01 times the average (so its lead mostly reflects an older workforce). Nursing homes stay higher at 1.24 times the average. Hospitals sit slightly below at 0.90 times.',
        ],
      },
      {
        heading: 'What it cannot show',
        body: ['This is a survey, so it shows a link between a job and a burden, not proof that the job is the cause.'],
      },
    ],
  },
  {
    slug: 'sodium',
    anchor: 'salt',
    short: 'Salt and food',
    question: 'What can actually move it?',
    title: 'The plate and the pressure',
    color: 'var(--dash)',
    basis: 'DASH-Sodium randomized trial, 412 adults, NEJM 2001. Change in the top number (systolic, mmHg).',
    sourceIndex: 6,
    notes: [
      {
        heading: 'What the chart shows',
        body: [
          'Adults in this trial ate a set diet for a month at a time to test two levers: the food (a typical American diet or the DASH diet) and the salt (high, medium or low).',
          'Each vessel is one combination. Its length is how far the top blood pressure number fell compared with a typical salty plate.',
        ],
      },
      {
        heading: 'What stands out',
        body: [
          'Cutting salt helps on both diets, and DASH helps at every salt level. The two levers stack.',
          'DASH with low salt dropped the top number most, by about 8.9 points (the likely range is 6.7 to 11.1).',
        ],
      },
      {
        heading: 'Why this one is different',
        body: [
          'Every other chapter is a survey, which can only show a link. This was a randomized trial: people were assigned their diet by chance. So here we can say the food and salt caused the drop.',
        ],
      },
    ],
  },
];

export function storyBySlug(slug: string): Story | undefined {
  return STORIES.find((s) => s.slug === slug);
}

/** Every section on the main page, in order, for the progress nav. */
export type SectionGroup = 'Begin' | 'The seven stories' | 'After the stories';

export const SECTIONS: readonly { id: string; label: string; group: SectionGroup; color?: string }[] = [
  { id: 'top', label: 'Start', group: 'Begin' },
  { id: 'how-to-read', label: 'How to read the numbers', group: 'Begin' },
  ...STORIES.map((s) => ({ id: s.anchor, label: s.short, group: 'The seven stories' as const, color: s.color })),
  { id: 'trend', label: 'Trend, not panic', group: 'After the stories' },
  { id: 'act', label: 'How a reading works', group: 'After the stories' },
  { id: 'self-check', label: 'Self-check', group: 'After the stories' },
  { id: 'sources', label: 'Sources', group: 'After the stories' },
];
