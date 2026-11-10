'use client';
// Self-check: answer a few questions, then get a plain report of where those answers sit in the data
// and a few light, general suggestions. It never diagnoses, and nothing entered is stored or sent.
import { useId, useRef, useState, type ReactNode } from 'react';
import { Chapter } from '@/components/layout/Chapter';
import { Select, Slider, Toggle } from '@/components/ui/controls';
import { ActivityShoe, PlateIcon, SaltShaker, SleepMoon } from '@/components/ui/thumbs';
import {
  ACTIVITY,
  ALL_ADULTS,
  ALL_WORKERS,
  OCCUPATION,
  SEX_RACE,
  SLEEP,
  dashDrop,
  type Diet,
  type Salt,
} from '@/lib/data';

const SALTS: readonly Salt[] = ['high', 'medium', 'low'];
const SALT_LABEL: Record<Salt, string> = { high: 'High salt', medium: 'Medium salt', low: 'Low salt' };
const MINUS = '−';

/* ---------------- reading categories, bands and number fields ---------------- */

type Category = { key: string; label: string; color: string; note: string };

// American Heart Association categories for adults (2017 ACC/AHA guideline).
const CATEGORIES: Record<string, Category> = {
  normal: {
    key: 'normal',
    label: 'Normal',
    color: 'var(--teal)',
    note: 'Below 120 on top and below 80 on the bottom.',
  },
  elevated: {
    key: 'elevated',
    label: 'Elevated',
    color: 'var(--diabetes)',
    note: '120 to 129 on top, with the bottom number below 80.',
  },
  stage1: {
    key: 'stage1',
    label: 'High blood pressure, stage 1',
    color: 'var(--reg-seasia)',
    note: '130 to 139 on top, or 80 to 89 on the bottom.',
  },
  stage2: {
    key: 'stage2',
    label: 'High blood pressure, stage 2',
    color: 'var(--pulse)',
    note: '140 or higher on top, or 90 or higher on the bottom.',
  },
  crisis: {
    key: 'crisis',
    label: 'Severe range',
    color: 'var(--pulse-deep)',
    note: 'Higher than 180 on top, or higher than 120 on the bottom.',
  },
};

function categorize(top: number, bottom: number): { cat: Category; by: 'top' | 'bottom' | 'both' } {
  const level = (t: number, b: number) => {
    const fromTop = t > 180 ? 4 : t >= 140 ? 3 : t >= 130 ? 2 : t >= 120 ? 1 : 0;
    // the bottom number has no "elevated" step: below 80 counts as normal for it
    const fromBottom = b > 120 ? 4 : b >= 90 ? 3 : b >= 80 ? 2 : 0;
    return { fromTop, fromBottom };
  };
  const { fromTop, fromBottom } = level(top, bottom);
  const keys = ['normal', 'elevated', 'stage1', 'stage2', 'crisis'] as const;
  const n = Math.max(fromTop, fromBottom);
  const by = fromTop === fromBottom ? 'both' : fromTop > fromBottom ? 'top' : 'bottom';
  return { cat: CATEGORIES[keys[n]]!, by };
}

/** A band of the categories along one number's scale, with a marker at the entered value. */
function Band({
  label,
  value,
  min,
  max,
  stops,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  stops: readonly { at: number; color: string }[];
}) {
  const x = (v: number) => ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100;
  return (
    <div aria-hidden="true">
      <p className="t-caption text-faint">{label}</p>
      <div className="relative mt-2 h-3 overflow-hidden rounded-full">
        {stops.map((s, i) => {
          const end = stops[i + 1]?.at ?? max;
          return (
            <span
              key={s.at}
              className="absolute inset-y-0"
              style={{ left: `${x(s.at)}%`, width: `${x(end) - x(s.at)}%`, background: s.color, opacity: 0.75 }}
            />
          );
        })}
      </div>
      <div className="relative h-6">
        <span
          className="absolute top-0 -translate-x-1/2 transition-[left] duration-500 ease-out"
          style={{ left: `${x(value)}%` }}
        >
          <svg viewBox="0 0 12 8" className="mx-auto h-2 w-3">
            <path d="M6 0l6 8H0Z" fill="var(--ink)" />
          </svg>
          <span className="block t-caption font-semibold text-ink tabular">{value}</span>
        </span>
      </div>
    </div>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  min: number;
  max: number;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const step = (d: number) => {
    const n = Number(value) || (d > 0 ? min - 1 : min + 1);
    onChange(String(Math.min(max, Math.max(min, n + d))));
  };
  return (
    <div>
      <label htmlFor={id} className="block t-small font-semibold text-mute">
        {label}
      </label>
      <p id={hintId} className="t-caption text-faint">
        {hint}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={`Lower ${label.toLowerCase()} by one`}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-ink hover:border-mute"
        >
          <span aria-hidden="true">{MINUS}</span>
        </button>
        <input
          id={id}
          aria-describedby={hintId}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-24 rounded-lg border border-line bg-canvas-2 px-3 text-center t-body font-semibold text-ink tabular hover:border-mute"
        />
        <button
          type="button"
          onClick={() => step(1)}
          aria-label={`Raise ${label.toLowerCase()} by one`}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-ink hover:border-mute"
        >
          <span aria-hidden="true">+</span>
        </button>
        <span className="t-caption text-faint">mmHg</span>
      </div>
    </div>
  );
}

const TOP_STOPS = [
  { at: 80, color: 'var(--teal)' },
  { at: 120, color: 'var(--diabetes)' },
  { at: 130, color: 'var(--reg-seasia)' },
  { at: 140, color: 'var(--pulse)' },
  { at: 180, color: 'var(--pulse-deep)' },
] as const;
const BOTTOM_STOPS = [
  { at: 40, color: 'var(--teal)' },
  { at: 80, color: 'var(--reg-seasia)' },
  { at: 90, color: 'var(--pulse)' },
  { at: 120, color: 'var(--pulse-deep)' },
] as const;

/* ---------------- the answers, and what they add up to ---------------- */

type Sex = 'men' | 'women';
type Status = 'lower' | 'higher' | 'partway' | 'background';

interface Answers {
  sex: Sex;
  group: string;
  activity: number;
  sleep: number;
  diet: Diet;
  saltIndex: number;
  job: string;
  top: string;
  bottom: string;
}

const START: Answers = {
  sex: 'women',
  group: SEX_RACE[0]!.group,
  activity: 0,
  sleep: 0,
  diet: 'typical',
  saltIndex: 0,
  job: '',
  top: '',
  bottom: '',
};

const STATUS_STYLE: Record<Status, { label: string; color: string }> = {
  lower: { label: 'In the lower group', color: 'var(--teal)' },
  partway: { label: 'Partway there', color: 'var(--diabetes)' },
  higher: { label: 'Room to move', color: 'var(--pulse)' },
  background: { label: 'Not a choice', color: 'var(--mute)' },
};

interface Suggestion {
  title: string;
  body: ReactNode;
  link?: { href: string; label: string };
}

/** Reads the reading fields: null when left empty, an error string when they do not make sense. */
function readReading(a: Answers): { t: number; b: number } | string | null {
  if (a.top === '' && a.bottom === '') return null;
  const t = Number(a.top);
  const b = Number(a.bottom);
  if (a.top === '' || a.bottom === '' || !Number.isFinite(t) || !Number.isFinite(b))
    return 'Both numbers are needed to place a reading.';
  if (t < 60 || t > 260 || b < 30 || b > 160) return 'Those numbers look outside what a monitor shows. Check them.';
  if (b >= t) return 'The top number is normally the larger one. Check the order.';
  return { t, b };
}

function buildReport(a: Answers) {
  const g = SEX_RACE.find((x) => x.group === a.group) ?? SEX_RACE[0]!;
  const groupV = g[a.sex].v;
  const act = ACTIVITY[a.activity] ?? ACTIVITY[0]!;
  const activeV = ACTIVITY[1]!.v;
  const slp = SLEEP[a.sleep] ?? SLEEP[0]!;
  const sweet = SLEEP.find((x) => x.sweet)!;
  const salt = SALTS[a.saltIndex] ?? 'high';
  const plate = dashDrop(a.diet, salt);
  const best = dashDrop('dash', 'low');
  const industry = OCCUPATION.find((o) => o.name === a.job);
  const reading = readReading(a);
  const placed = reading && typeof reading === 'object' ? { ...reading, ...categorize(reading.t, reading.b) } : null;

  const activityStatus: Status = a.activity === 0 ? 'higher' : 'lower';
  const sleepStatus: Status = slp.sweet ? 'lower' : 'higher';
  const plateStatus: Status = plate.drop === best.drop ? 'lower' : plate.drop < 0 ? 'partway' : 'higher';
  const habitsLower = [activityStatus, sleepStatus, plateStatus].filter((s) => s === 'lower').length;
  const who = `${g.group} ${a.sex}`;

  /* --- light suggestions, the most relevant first --- */
  const suggestions: Suggestion[] = [];
  const key = placed?.cat.key;
  if (key === 'stage2') {
    suggestions.push({
      title: 'Share this reading with a health professional soon',
      body: (
        <>
          A reading in stage 2 is worth booking an appointment for, rather than waiting for a routine visit. Bringing a
          few days of home readings helps them see the pattern.
        </>
      ),
    });
  } else if (key === 'stage1') {
    suggestions.push({
      title: 'Take a week of readings, then talk it over',
      body: (
        <>
          Measure at the same times each day, after five quiet minutes seated. If the average stays at this level, a
          health professional can confirm it and talk through options.
        </>
      ),
      link: {
        href: 'https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/monitoring-your-blood-pressure-at-home',
        label: 'How to measure at home (American Heart Association)',
      },
    });
  } else if (key === 'elevated') {
    suggestions.push({
      title: 'Keep an eye on it',
      body: (
        <>
          Elevated is a common early signal. Checking again on a few different days shows whether it holds, and the
          habits below are the usual first step at this stage.
        </>
      ),
    });
  } else if (key === 'normal') {
    suggestions.push({
      title: 'Keep checking now and then',
      body: <>A normal reading is good news. A check at routine health visits keeps it that way on the record.</>,
    });
  } else if (!placed) {
    suggestions.push({
      title: 'Get a reading',
      body: (
        <>
          Habits and group numbers only describe the odds. A reading, at a pharmacy, a clinic or with a validated home
          monitor, is the only way to know where your own numbers sit.
        </>
      ),
      link: { href: 'https://www.validatebp.org/', label: 'Validated home monitors (U.S.)' },
    });
  }

  if (a.activity === 0) {
    suggestions.push({
      title: 'Start moving, even a little',
      body: (
        <>
          The biggest gap in the activity data is between barely active and active ({act.v} versus {activeV} in 100).
          Guidelines suggest building up to about 150 minutes of moderate activity a week, such as brisk walking. Small
          amounts count on the way there.
        </>
      ),
      link: {
        href: 'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html',
        label: 'Activity guidelines for adults (CDC)',
      },
    });
  }
  if (plateStatus !== 'lower') {
    const withLowSalt = dashDrop(a.diet, 'low');
    const steps: string[] = [];
    if (salt !== 'low')
      steps.push(
        `cutting salt to low on the same food lowered the top number by ${Math.abs(withLowSalt.drop - plate.drop).toFixed(1)} more points`,
      );
    if (a.diet === 'typical') steps.push('switching to DASH food helped at every salt level');
    suggestions.push({
      title: a.diet === 'typical' ? 'Shift the plate, one meal at a time' : 'Ease the salt down',
      body: (
        <>
          In the trial, {steps.join(', and ')}. DASH means more vegetables, fruit, whole grains, beans and low-fat
          dairy. Most salt comes from packaged and restaurant food, so labels are a good place to start.
        </>
      ),
    });
  }
  if (!slp.sweet) {
    suggestions.push({
      title: a.sleep === 0 ? 'Protect 7 to 8 hours of sleep' : 'Mention very long sleep at a checkup',
      body:
        a.sleep === 0 ? (
          <>
            Adults sleeping under 6 hours sit at {slp.v} in 100, against {sweet.v} for 7 to 8 hours. A steady bedtime
            and wake time is the simplest lever.
          </>
        ) : (
          <>
            Regularly sleeping 10 hours or more sits as high as short sleep in the data ({slp.v} in 100). It can have
            many causes, so it is worth raising with a doctor.
          </>
        ),
    });
  }
  if (groupV > ALL_ADULTS.v) {
    suggestions.push({
      title: 'Check regularly, even with good habits',
      body: (
        <>
          {who.charAt(0).toUpperCase() + who.slice(1)} carry more high blood pressure than U.S. adults overall ({groupV}{' '}
          versus {ALL_ADULTS.v} in 100). That reflects care, environment and history, not anything done wrong, and it
          makes regular checks more worthwhile.
        </>
      ),
    });
  }
  if (industry && industry.v > ALL_WORKERS.v) {
    suggestions.push({
      title: 'Use checks offered at work',
      body: (
        <>
          {industry.name} workers report it more often than workers overall ({industry.v} versus {ALL_WORKERS.v} in
          100). Workplace or pharmacy checks are an easy way to keep track.
        </>
      ),
    });
  }
  if (habitsLower === 3 && suggestions.length <= 2) {
    suggestions.push({
      title: 'Keep the routine',
      body: (
        <>All three habits already sit in the lower groups in the data. Steady habits matter more than big efforts.</>
      ),
    });
  }

  return {
    g,
    groupV,
    act,
    activeV,
    slp,
    sweet,
    salt,
    plate,
    best,
    industry,
    reading,
    placed,
    activityStatus,
    sleepStatus,
    plateStatus,
    habitsLower,
    who,
    suggestions,
  };
}

/* ---------------- the report's pieces ---------------- */

function StatusPill({ status }: { status: Status }) {
  const s = STATUS_STYLE[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 t-caption font-semibold text-ink">
      <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

/** One answer in the report: what was entered, its status, the number, and a comparison bar. */
function FactorCard({
  heading,
  answer,
  status,
  value,
  unit = 'in 100',
  compare,
  meaning,
  source,
  color,
  icon,
}: {
  heading: string;
  answer: ReactNode;
  status: Status;
  value: string;
  unit?: string;
  compare?: { value: number; label: string; own: number };
  meaning: ReactNode;
  source: string;
  color: string;
  icon?: ReactNode;
}) {
  return (
    <li className="flex flex-col rounded-xl border border-line bg-canvas-2/60 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="t-caption font-semibold uppercase tracking-wide text-faint">{heading}</p>
          <p className="mt-1 flex items-center gap-2 t-small font-semibold text-ink">
            {icon}
            {answer}
          </p>
        </div>
        <StatusPill status={status} />
      </div>
      <p className="mt-4 t-small text-mute">
        <strong className="t-h3 font-bold text-ink tabular">{value}</strong> {unit}
      </p>
      {compare && (
        <div className="relative mt-2 h-4" aria-hidden="true">
          <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" />
          <span
            className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${compare.own}%`, background: color }}
          />
          <span
            className="absolute inset-y-[-2px] border-l-2 border-dashed border-mute"
            style={{ left: `${compare.value}%` }}
          />
        </div>
      )}
      <p className="mt-3 flex-1 t-small text-mute">{meaning}</p>
      {compare && (
        <p className="mt-2 t-caption text-faint">
          Dashed line: {compare.label}, {compare.value} in 100. {source}
        </p>
      )}
      {!compare && <p className="mt-2 t-caption text-faint">{source}</p>}
    </li>
  );
}

function HabitMeter({ lower }: { lower: number }) {
  return (
    <div>
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 flex-1 rounded-full transition-colors duration-500"
            style={{ background: i < lower ? 'var(--teal)' : 'var(--line)' }}
          />
        ))}
      </div>
      <p className="mt-2 t-small text-mute">
        <strong className="text-ink tabular">{lower} of 3</strong> daily habits in the lower groups
      </p>
    </div>
  );
}

/* ---------------- the form and the report ---------------- */

function FormGroup({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="min-w-0 space-y-8 rounded-2xl border border-line p-4 sm:p-6 md:p-8">
      <legend className="flex items-center gap-3 px-2 t-small font-semibold text-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink t-caption text-canvas-2 tabular">
          {step}
        </span>
        {title}
      </legend>
      {hint && <p className="-mt-4 t-caption text-faint">{hint}</p>}
      {children}
    </fieldset>
  );
}

function CheckForm({ a, set }: { a: Answers; set: <K extends keyof Answers>(k: K, v: Answers[K]) => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <FormGroup step={1} title="About you" hint="Used to find the closest group in the U.S. survey.">
          <Toggle
            label="Sex"
            value={a.sex}
            onChange={(v) => set('sex', v)}
            options={[
              { value: 'women', label: 'Woman' },
              { value: 'men', label: 'Man' },
            ]}
          />
          <Toggle
            label="Group"
            value={a.group}
            onChange={(v) => set('group', v)}
            options={SEX_RACE.map((x) => ({ value: x.group, label: x.group }))}
          />
          <Select
            label="Industry (optional)"
            placeholder="Not one of these"
            value={a.job}
            onChange={(v) => set('job', v)}
          >
            {OCCUPATION.map((o) => (
              <option key={o.name} value={o.name}>
                {o.name} ({o.sub})
              </option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup
          step={3}
          title="A recent reading (optional)"
          hint="From a home monitor, pharmacy or clinic. Leave blank to skip."
        >
          <div className="flex flex-wrap gap-x-8 gap-y-6">
            <NumberField
              label="Top number"
              hint="The push of each beat (systolic)"
              value={a.top}
              onChange={(v) => set('top', v)}
              min={60}
              max={260}
            />
            <NumberField
              label="Bottom number"
              hint="The pressure between beats (diastolic)"
              value={a.bottom}
              onChange={(v) => set('bottom', v)}
              min={30}
              max={160}
            />
          </div>
        </FormGroup>
      </div>
      <FormGroup step={2} title="Daily habits">
        <Slider
          label="How active, most weeks"
          stops={ACTIVITY.map((x) => x.level)}
          index={a.activity}
          onChange={(v) => set('activity', v)}
          thumb={(i) => <ActivityShoe level={i} />}
          accent="var(--teal)"
          valueText={(i) => `${ACTIVITY[i]?.level}, ${ACTIVITY[i]?.sub}`}
        />
        <Slider
          label="Sleep, most nights"
          stops={SLEEP.map((x) => x.sub.charAt(0).toUpperCase() + x.sub.slice(1))}
          index={a.sleep}
          onChange={(v) => set('sleep', v)}
          thumb={(i) => <SleepMoon level={i} />}
          accent="var(--teal)"
          valueText={(i) => `${SLEEP[i]?.sub} a night`}
        />
        <Toggle
          label="Usual food"
          value={a.diet}
          onChange={(v) => set('diet', v)}
          options={[
            { value: 'typical', label: 'Typical plate', icon: <PlateIcon diet="typical" /> },
            { value: 'dash', label: 'DASH-style plate', icon: <PlateIcon diet="dash" /> },
          ]}
        />
        <p className="-mt-4 t-caption text-faint">
          DASH-style: plenty of vegetables, fruit, whole grains and low-fat dairy; little red meat and sugar.
        </p>
        <Slider
          label="Usual salt"
          stops={SALTS.map((s) => SALT_LABEL[s])}
          index={a.saltIndex}
          onChange={(v) => set('saltIndex', v)}
          thumb={(i) => <SaltShaker salt={SALTS[i] ?? 'high'} />}
        />
      </FormGroup>
    </div>
  );
}

function Report({ a, onEdit }: { a: Answers; onEdit: () => void }) {
  const r = buildReport(a);

  let readingLine: ReactNode;
  if (r.placed) {
    readingLine = (
      <>
        Your reading of{' '}
        <strong className="tabular">
          {r.placed.t}/{r.placed.b}
        </strong>{' '}
        falls in <strong>{r.placed.cat.label.toLowerCase()}</strong>.
      </>
    );
  } else if (typeof r.reading === 'string') {
    readingLine = <>{r.reading}</>;
  } else {
    readingLine = <>No reading entered, so this is about habits and groups only.</>;
  }

  return (
    <div className="mt-10 rounded-3xl border border-line bg-panel/60 p-5 sm:p-6 md:p-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-[560px]">
          <p className="t-small font-semibold text-teal">Your result</p>
          <h3 id="self-check-result" tabIndex={-1} className="mt-1 t-h3 text-ink">
            Where you stand
          </h3>
          <p aria-live="polite" className="mt-3 t-body text-mute">
            {readingLine}{' '}
            {r.habitsLower === 3
              ? 'All three of your daily habits already match the lower groups in the data.'
              : r.habitsLower === 0
                ? 'None of your daily habits match the lower groups yet, so each one is a place to start.'
                : `${r.habitsLower} of your 3 daily habits already match the lower groups in the data.`}
          </p>
        </div>
        <div className="w-full max-w-[260px]">
          <HabitMeter lower={r.habitsLower} />
        </div>
      </div>

      {r.placed && (
        <div className="mt-8 rounded-2xl border border-line bg-canvas-2/60 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-3 t-small font-semibold text-ink">
              <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full" style={{ background: r.placed.cat.color }} />
              {r.placed.cat.label}
            </p>
            <p className="t-caption text-faint">{r.placed.cat.note}</p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Band label="Top number" value={r.placed.t} min={80} max={200} stops={TOP_STOPS} />
            <Band label="Bottom number" value={r.placed.b} min={40} max={130} stops={BOTTOM_STOPS} />
          </div>
          <p className="mt-2 t-caption text-faint">
            One reading places a moment. A diagnosis uses the average of several readings on different days. Categories:
            American Heart Association (2017 ACC/AHA guideline), for adults, not during pregnancy.
          </p>
          {r.placed.cat.key === 'crisis' && (
            <div className="mt-5 rounded-xl border-2 border-pulse p-5" role="alert">
              <p className="t-small font-semibold text-ink">This reading is in the severe range</p>
              <p className="mt-2 t-small text-mute">
                The American Heart Association advises waiting five minutes and measuring again. If it stays this high,
                contact a health professional straight away. With chest pain, shortness of breath, back pain, numbness
                or weakness, a change in vision, or trouble speaking, call emergency services (911 in the U.S.).
              </p>
            </div>
          )}
          {(r.placed.t < 90 || r.placed.b < 60) && (
            <p className="mt-4 t-small text-mute">
              This reading is on the low side. Low readings with dizziness or fainting are worth raising with a health
              professional.
            </p>
          )}
        </div>
      )}

      <h4 className="mt-10 t-small font-semibold text-ink">How each answer compares</h4>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        <FactorCard
          heading="Activity"
          answer={r.act.level}
          status={r.activityStatus}
          value={String(r.act.v)}
          compare={{ value: r.activeV, label: 'active adults', own: r.act.v }}
          color={r.activityStatus === 'lower' ? 'var(--teal)' : 'var(--pulse)'}
          meaning={
            r.activityStatus === 'lower' ? (
              <>Of every 100 adults this active, about {r.act.v} have high blood pressure, the lower end of the data.</>
            ) : (
              <>
                Of every 100 barely active adults, about {r.act.v} have high blood pressure: {r.act.v - r.activeV} more
                than active adults.
              </>
            )
          }
          source="NHANES, U.S. adults aged 40 to 80."
        />
        <FactorCard
          heading="Sleep"
          answer={`${r.slp.sub.charAt(0).toUpperCase() + r.slp.sub.slice(1)} a night`}
          status={r.sleepStatus}
          value={String(r.slp.v)}
          compare={{ value: r.sweet.v, label: `sleeping ${r.sweet.sub}`, own: r.slp.v }}
          color={r.sleepStatus === 'lower' ? 'var(--teal)' : 'var(--pulse)'}
          meaning={
            r.slp.sweet ? (
              <>The sweet spot. It is the lowest group in the sleep data, at {r.slp.v} in 100.</>
            ) : (
              <>
                About {r.slp.v} in 100 adults who sleep {r.slp.sub} have high blood pressure, {r.slp.v - r.sweet.v} more
                than at 7 to 8 hours.
              </>
            )
          }
          source="NHIS, 71,455 U.S. adults."
        />
        <FactorCard
          heading="Food and salt"
          answer={`${a.diet === 'dash' ? 'DASH-style' : 'Typical'} plate, ${SALT_LABEL[r.salt].toLowerCase()}`}
          icon={<PlateIcon diet={a.diet} />}
          status={r.plateStatus}
          value={r.plate.drop === 0 ? '0.0' : `${MINUS}${Math.abs(r.plate.drop).toFixed(1)}`}
          unit="points on the top number"
          color="var(--dash)"
          meaning={
            r.plateStatus === 'lower' ? (
              <>The strongest combination in the trial: about {Math.abs(r.best.drop).toFixed(1)} points lower.</>
            ) : r.plate.drop === 0 ? (
              <>
                This is the trial’s starting plate. The best combination there lowered the top number by{' '}
                {Math.abs(r.best.drop).toFixed(1)} points.
              </>
            ) : (
              <>
                Already {Math.abs(r.plate.drop).toFixed(1)} points below the starting plate, with up to{' '}
                {Math.abs(r.best.drop - r.plate.drop).toFixed(1)} more within reach.
              </>
            )
          }
          source="DASH-Sodium trial, NEJM 2001. A randomized trial, so this one shows cause."
        />
        <FactorCard
          heading="Your group"
          answer={r.who.charAt(0).toUpperCase() + r.who.slice(1)}
          status="background"
          value={String(r.groupV)}
          compare={{ value: ALL_ADULTS.v, label: 'all U.S. adults', own: r.groupV }}
          color={a.sex === 'men' ? 'var(--pulse)' : 'var(--women)'}
          meaning={
            r.groupV > ALL_ADULTS.v ? (
              <>Above the U.S. average. Shaped by care, environment and history, not by biology or choices.</>
            ) : (
              <>Below the U.S. average, though still about {Math.round(r.groupV)} in 100.</>
            )
          }
          source="NHANES 2021 to 2023."
        />
        {r.industry && (
          <FactorCard
            heading="Work"
            answer={r.industry.name}
            status="background"
            value={String(r.industry.v)}
            compare={{ value: ALL_WORKERS.v, label: 'all workers', own: r.industry.v }}
            color="var(--pulse)"
            meaning={
              r.industry.apr ? (
                <>
                  After matching by age, {r.industry.apr.v.toFixed(2)} times all workers: {r.industry.apr.note}.
                </>
              ) : (
                <>Share of workers ever told they have high blood pressure, not adjusted for age.</>
              )
            }
            source="BRFSS 2017, 31 states."
          />
        )}
      </ul>

      <h4 className="mt-10 t-small font-semibold text-ink">Light suggestions</h4>
      <p className="mt-1 t-caption text-faint">
        General ideas drawn from the data and public guidelines, not a care plan.
      </p>
      <ol className="mt-4 space-y-4">
        {r.suggestions.map((s, i) => (
          <li key={s.title} className="flex gap-3 rounded-xl border border-line bg-canvas-2/60 p-4 sm:gap-4 sm:p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/15 t-small font-semibold text-teal tabular">
              {i + 1}
            </span>
            <div>
              <p className="t-small font-semibold text-ink">{s.title}</p>
              <p className="mt-1 t-small text-mute">{s.body}</p>
              {s.link && (
                <a
                  href={s.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center t-small font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-pulse"
                >
                  {s.link.label}
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-col gap-6 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
        <p className="max-w-[620px] t-caption text-faint">
          This compares answers with groups of people in surveys and one trial. It cannot tell anyone’s own risk and is
          not medical advice. A doctor, nurse or pharmacist can measure properly and look at the whole picture.
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full border border-line px-6 t-small font-semibold text-ink hover:border-mute"
        >
          Change answers
        </button>
      </div>
    </div>
  );
}

export function SelfCheck() {
  const [a, setA] = useState<Answers>(START);
  const [shown, setShown] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((prev) => ({ ...prev, [k]: v }));

  const show = () => {
    setShown(true);
    // After the report renders, move focus (and the view) to its heading.
    requestAnimationFrame(() => {
      const h = document.getElementById('self-check-result');
      h?.focus({ preventScroll: true });
      h?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <Chapter
      id="self-check"
      eyebrow="Self-check"
      accent="var(--teal)"
      title="Where do your numbers sit?"
      lede={
        <p>
          Answer a few questions about daily habits, and add a recent reading if there is one. The result shows where
          those answers sit in the data from this site, with a few light suggestions.
        </p>
      }
    >
      <div
        data-reveal
        role="note"
        className="mt-10 flex max-w-[760px] gap-4 rounded-xl border border-diabetes/60 bg-diabetes/10 p-5"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-diabetes">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7v6M12 16.5v.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <p className="t-small text-ink">
          <strong>A learning tool, not a diagnosis.</strong> It cannot replace a doctor, nurse or pharmacist. Nothing
          entered here is saved or sent anywhere.
        </p>
      </div>

      <div ref={formRef} data-reveal className="mt-10 scroll-mt-24">
        <CheckForm a={a} set={set} />
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={show}
            className="inline-flex min-h-12 items-center gap-3 rounded-full bg-pulse px-7 t-small font-semibold text-on-pulse hover:bg-pulse-deep"
          >
            {shown ? 'Update my result' : 'See where I stand'}
            <svg aria-hidden="true" viewBox="0 0 24 12" className="h-3 w-6">
              <path d="M0 6h20M15 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          {shown && <p className="t-caption text-faint">The result below updates as answers change.</p>}
        </div>
      </div>

      {shown && (
        <Report
          a={a}
          onEdit={() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            formRef.current?.querySelector<HTMLElement>('button, input, select')?.focus({ preventScroll: true });
          }}
        />
      )}
    </Chapter>
  );
}
