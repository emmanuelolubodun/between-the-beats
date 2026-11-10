'use client';
import { useState } from 'react';
import { VesselChart, type VesselDatum } from '@/components/core/VesselChart';
import { Chapter, StoryGrid } from '@/components/layout/Chapter';
import { Note, ReadMore, Readout, Select, SourceLine, Toggle } from '@/components/ui/controls';
import { ALL_WORKERS, OCCUPATION } from '@/lib/data';
import { compareToReference } from '@/lib/format';
import { storyBySlug } from '@/lib/stories';

const lowest = Math.min(...OCCUPATION.map((o) => o.v));
const highest = Math.max(...OCCUPATION.map((o) => o.v));

/** Pale at the low end, deep pulse at the high end (lightness carries it, not hue alone). */
function intensity(v: number): string {
  const t = (v - lowest) / (highest - lowest);
  const pct = Math.round(40 + t * 60);
  return `color-mix(in oklab, var(--pulse) ${pct}%, var(--ink))`;
}

// Highest first, so the fan reads top to bottom like the poster.
const data: VesselDatum[] = [...OCCUPATION]
  .sort((a, b) => b.v - a.v)
  .map((o) => ({
    key: o.name,
    label: o.name,
    sub: o.sub,
    value: o.v,
    lo: o.lo,
    hi: o.hi,
    color: intensity(o.v),
  }));

const withRatio = OCCUPATION.filter((o) => o.apr);

/** Raw ratio: the industry's share divided by the all-worker share (e.g. 29.6 / 23.7). Derived, not sourced. */
const rawRatio = (v: number) => Math.round((v / ALL_WORKERS.v) * 100) / 100;

type View = 'raw' | 'matched';

/**
 * Raw versus age-matched, side by side in time: switching the view slides each dot from its raw
 * position (share / all-worker share) to the published age-matched ratio, so the age effect is visible.
 */
function AgeAdjusted({ focus, onPick }: { focus: string | null; onPick: (name: string) => void }) {
  const [view, setView] = useState<View>('raw');
  const lo = 0.6;
  const hi = 1.5;
  const x = (v: number) => ((v - lo) / (hi - lo)) * 100;
  const ticks = [0.8, 1, 1.2, 1.4];
  return (
    <div className="rounded-xl border border-line p-6">
      <p className="t-small font-semibold text-ink">Does age explain it?</p>
      <p className="mt-1 t-small text-mute">
        Each dot compares an industry with all workers. 1.0 means the same. Switch to see what happens once workers are
        matched by age.
      </p>
      <div className="mt-4">
        <Toggle
          label="Compare"
          hideLabel
          value={view}
          onChange={setView}
          options={[
            { value: 'raw', label: 'Raw' },
            { value: 'matched', label: 'Matched by age' },
          ]}
        />
      </div>
      <ul className="mt-5 space-y-2">
        {withRatio.map((o) => {
          const apr = o.apr!;
          const raw = rawRatio(o.v);
          const shown = view === 'raw' ? raw : apr.v;
          const on = focus === o.name;
          return (
            <li key={o.name}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onPick(o.name)}
                className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                  on ? 'bg-panel ring-1 ring-mute' : 'hover:bg-panel/60'
                } ${focus && !on ? 'opacity-60' : ''}`}
              >
                <span className="flex items-baseline justify-between gap-3 t-small">
                  <span className="font-semibold text-ink">{o.name}</span>
                  <span className="tabular text-ink">{shown.toFixed(2)} times</span>
                </span>
                <span className="relative mt-2 block h-4" aria-hidden="true">
                  <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
                  <span
                    className="absolute inset-y-0 border-l-2 border-dashed border-mute/70"
                    style={{ left: `${x(1)}%` }}
                  />
                  {/* ghost of the raw position, so the move stays visible after switching */}
                  {view === 'matched' && (
                    <span
                      className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-faint"
                      style={{ left: `${x(raw)}%` }}
                    />
                  )}
                  <span
                    className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded bg-pulse/35 transition-opacity duration-500"
                    style={{
                      left: `${x(apr.lo)}%`,
                      width: `${x(apr.hi) - x(apr.lo)}%`,
                      opacity: view === 'matched' ? 1 : 0,
                    }}
                  />
                  <span
                    className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-canvas-2 bg-pulse transition-[left] duration-700 ease-out"
                    style={{ left: `${x(shown)}%` }}
                  />
                </span>
                <span className="mt-1 block t-caption text-faint">
                  {view === 'raw' ? `${o.v} in 100 workers vs ${ALL_WORKERS.v} for all workers` : apr.note}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="relative mx-3 mt-1 h-5 t-caption text-faint tabular" aria-hidden="true">
        {ticks.map((t) => (
          <span key={t} className="absolute -translate-x-1/2" style={{ left: `${x(t)}%` }}>
            {t.toFixed(1)}
          </span>
        ))}
      </div>
      <Readout className="mt-4 t-small text-mute">
        {view === 'raw' ? (
          <>Raw: trucking looks highest, at 1.25 times all workers.</>
        ) : (
          <>Matched by age: trucking falls to 1.01. Nursing homes stay higher, at 1.24. Hospitals sit at 0.90.</>
        )}
      </Readout>
      <p className="mt-3 t-caption text-faint">
        Raw ratios are calculated here from the shares above (for example 29.6 divided by 23.7). Age-matched ratios come
        from the study.
      </p>
    </div>
  );
}

export function OccupationExplorer({ standalone = false }: { standalone?: boolean }) {
  const story = storyBySlug('occupation')!;
  const [job, setJob] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);
  const focus = job || hovered;
  const picked = OCCUPATION.find((o) => o.name === focus);

  let readout;
  if (picked) {
    const cmp = compareToReference(picked.v, ALL_WORKERS.v);
    readout = (
      <>
        About <strong className="tabular">{picked.v}</strong> in 100 <strong>{picked.name.toLowerCase()}</strong>{' '}
        workers have been told they have high blood pressure.{' '}
        {cmp.direction === 'level' ? 'Level with' : <span className="tabular">{cmp.label}</span>}
        {cmp.direction === 'level' ? '' : ' the'} all-worker average of <span className="tabular">{ALL_WORKERS.v}</span>
        .
        {picked.apr && (
          <>
            {' '}
            After matching by age: <span className="tabular">{picked.apr.v.toFixed(2)}</span> times the average,{' '}
            {picked.apr.note}.
          </>
        )}
      </>
    );
  } else {
    readout = (
      <>
        Trucking reaches furthest, at <strong className="tabular">29.6</strong> in 100. Hospitals sit lowest, at{' '}
        <strong className="tabular">20.2</strong>. Choose an industry to see where it lands.
      </>
    );
  }

  return (
    <StoryGrid
      rail={
        <>
          <Select label="Compare an industry" placeholder="Choose an industry" value={job} onChange={setJob}>
            {OCCUPATION.map((o) => (
              <option key={o.name} value={o.name}>
                {o.name} ({o.sub})
              </option>
            ))}
          </Select>
          <div className="rounded-xl border border-line bg-panel/60 p-6">
            <Readout>{readout}</Readout>
          </div>
          <AgeAdjusted focus={focus || null} onPick={(name) => setJob((j) => (j === name ? '' : name))} />
          <div className="space-y-3">
            <Note tone="caution">
              The vessels are raw shares, not adjusted for age. Some trades have older workers, which raises their
              numbers.
            </Note>
            <Note>
              A survey, so this is a link and not a cause. Choices made here stay on this page and are never saved.
            </Note>
          </div>
          <SourceLine index={story.sourceIndex} basis={story.basis} />
          {!standalone && <ReadMore slug={story.slug} label="Read the full story" />}
        </>
      }
      chart={
        <VesselChart
          data={data}
          max={40}
          ticks={[10, 20, 30]}
          unit="in 100"
          reference={{ value: ALL_WORKERS.v, label: 'all workers', sub: `${ALL_WORKERS.v} in 100` }}
          active={focus || null}
          onHover={setHovered}
          onSelect={(k) => setJob((j) => (j === k ? '' : k))}
          caption="Out of 100 workers ever told they have high blood pressure, by industry: trucking 29.6, nursing homes 27.7, food manufacturing 26.6, clinics 23.3, public transit 23.2, essential retail 22.7, hospitals 20.2. All workers 23.7. Not adjusted for age."
          columns={['Industry', 'Out of 100 workers']}
          spread={[198, 342]}
        />
      }
    />
  );
}

export function OccupationChapter() {
  return (
    <Chapter
      id="work"
      eyebrow="Work"
      accent="var(--pulse)"
      title="The jobs under pressure"
      lede={
        <p>
          High blood pressure is not spread evenly across the working day. Here are seven frontline industries, against
          the average worker.
        </p>
      }
    >
      <OccupationExplorer />
    </Chapter>
  );
}
