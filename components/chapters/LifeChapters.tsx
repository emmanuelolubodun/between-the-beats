'use client';
// Consequences, Activity and Sleep: three stories that share the Explorer layout.
import { Explorer } from './Explorer';
import { Chapter } from '@/components/layout/Chapter';
import { Note } from '@/components/ui/controls';
import type { VesselDatum } from '@/components/core/VesselChart';
import { ACTIVITY, CONSEQUENCES, CONSEQUENCES_CONTEXT, SLEEP } from '@/lib/data';
import { ActivityShoe, SleepMoon } from '@/components/ui/thumbs';

/* ---------------- Consequences ---------------- */

const CONSEQ_COLORS: Record<string, string> = {
  Diabetes: 'var(--diabetes)',
  'Heart attack': 'var(--pulse)',
  Obesity: 'var(--pulse)',
  'Hemorrhagic stroke': 'var(--reg-emed)',
};

const consequenceData: VesselDatum[] = CONSEQUENCES.map((c) => ({
  key: c.name,
  label: c.name,
  sub: c.sub,
  value: c.v,
  color: CONSEQ_COLORS[c.name] ?? 'var(--pulse)',
}));

function TrendSince1979() {
  const { in1979, overall, men, women } = CONSEQUENCES_CONTEXT;
  return (
    <div className="rounded-xl border border-line p-6">
      <p className="t-small font-semibold text-mute">Deaths linked to high blood pressure, per 100,000</p>
      <div className="mt-4 flex items-end gap-6">
        <div>
          <p className="t-caption text-faint">1979</p>
          <p className="t-h3 text-mute tabular">{in1979.toFixed(1)}</p>
        </div>
        <svg aria-hidden="true" viewBox="0 0 100 40" className="mb-3 h-8 flex-1">
          <line x1="2" y1="34" x2="96" y2="8" stroke="var(--pulse)" strokeWidth="2" />
          <circle cx="2" cy="34" r="3" fill="var(--mute)" />
          <circle cx="96" cy="8" r="3.5" fill="var(--pulse)" />
        </svg>
        <div>
          <p className="t-caption text-faint">2023</p>
          <p className="t-h3 text-pulse tabular">{overall.toFixed(1)}</p>
        </div>
      </div>
      <p className="mt-3 t-small text-mute">
        Men {men.toFixed(1)}, women {women.toFixed(1)}. Two points in time, joined by a straight line for reading only.
      </p>
    </div>
  );
}

export function ConsequencesExplorer({ standalone }: { standalone?: boolean }) {
  return (
    <Explorer
      slug="consequences"
      data={consequenceData}
      max={70}
      ticks={[20, 40, 60]}
      unit="per 100,000"
      summary={
        <>
          Diabetes reaches furthest by far: <strong className="tabular">66.2</strong> deaths per 100,000 list it
          alongside high blood pressure. That is about four times heart attack.
        </>
      }
      sentence={(d) => (
        <>
          <strong>{d.label}</strong> ({d.sub}) appears with high blood pressure on about{' '}
          <strong className="tabular">{d.value}</strong> death certificates per 100,000 adults.
        </>
      )}
      chipLabel="Pick a condition"
      caption="Deaths per 100,000 U.S. adults where high blood pressure is listed with another condition, 2023: diabetes 66.2, heart attack 16.3, obesity 13.2, hemorrhagic stroke 6.9. Diabetes is far ahead."
      columns={['Condition', 'Deaths per 100,000']}
      extra={<TrendSince1979 />}
      notes={
        <>
          <Note>This shows a link, not proof that one condition caused the other.</Note>
          <Note>The rates can be compared because each was counted the same way.</Note>
        </>
      }
      standalone={standalone}
    />
  );
}

export function ConsequencesChapter() {
  return (
    <Chapter
      id="consequences"
      eyebrow="What it travels with"
      accent="var(--diabetes)"
      title="It rarely acts alone"
      lede={
        <p>
          High blood pressure seldom ends a life by itself. When it shows up on a death certificate, something else
          usually does too.
        </p>
      }
    >
      <ConsequencesExplorer />
    </Chapter>
  );
}

/* ---------------- Activity ---------------- */

const activityData: VesselDatum[] = ACTIVITY.map((a, i) => ({
  key: a.level,
  label: a.level,
  sub: a.sub,
  value: a.v,
  color: i === 0 ? 'var(--pulse)' : 'var(--teal)',
}));

export function ActivityExplorer({ standalone }: { standalone?: boolean }) {
  return (
    <Explorer
      slug="activity"
      data={activityData}
      max={70}
      ticks={[20, 40, 60]}
      unit="in 100"
      summary={
        <>
          The big drop comes from getting started: <strong className="tabular">68</strong> in 100 down to{' '}
          <strong className="tabular">57</strong>. Going far beyond that adds little more.
        </>
      }
      sentence={(d) => (
        <>
          Of every 100 adults who are <strong>{d.label.toLowerCase()}</strong> ({d.sub}), about{' '}
          <strong className="tabular">{d.value}</strong> have high blood pressure.
        </>
      )}
      chipLabel="Pick an activity level"
      slider={{
        label: 'How active',
        stops: ACTIVITY.map((a) => a.level),
        thumb: (i) => <ActivityShoe level={i} />,
        accent: 'var(--teal)',
        valueText: (i) => `${ACTIVITY[i]?.level}, ${ACTIVITY[i]?.sub}`,
      }}
      caption="Out of 100 U.S. adults aged 40 to 80: barely active 68, active 57, very active 57 have high blood pressure. The drop comes from getting started."
      columns={['Activity level', 'Out of 100 adults']}
      notes={<Note>A survey, so this is a link and not a cause.</Note>}
      standalone={standalone}
    />
  );
}

export function ActivityChapter() {
  return (
    <Chapter
      id="activity"
      eyebrow="Moving"
      accent="var(--teal)"
      title="Most of the difference comes from getting started"
      lede={<p>Out of every 100 adults in each group, how many have high blood pressure?</p>}
    >
      <ActivityExplorer />
    </Chapter>
  );
}

/* ---------------- Sleep ---------------- */

const sleepData: VesselDatum[] = SLEEP.map((s) => ({
  key: s.band,
  label: s.band,
  sub: s.sub,
  value: s.v,
  color: s.sweet ? 'var(--teal)' : 'var(--pulse)',
  tag: s.sweet ? 'sweet spot' : undefined,
}));

export function SleepExplorer({ standalone }: { standalone?: boolean }) {
  return (
    <Explorer
      slug="sleep"
      data={sleepData}
      max={40}
      ticks={[10, 20, 30]}
      unit="in 100"
      summary={
        <>
          A U shape. Both ends sit at <strong className="tabular">32</strong> in 100. Seven to 8 hours is the sweet
          spot, at <strong className="tabular">23</strong> in 100.
        </>
      }
      sentence={(d) => (
        <>
          Of every 100 adults who sleep <strong>{d.sub}</strong> a night, about{' '}
          <strong className="tabular">{d.value}</strong> have high blood pressure
          {d.tag ? '. This is the sweet spot.' : '.'}
        </>
      )}
      chipLabel="Pick a sleep length"
      slider={{
        label: 'Sleep each night',
        stops: SLEEP.map((x) => x.sub.charAt(0).toUpperCase() + x.sub.slice(1)),
        thumb: (i) => <SleepMoon level={i} />,
        accent: 'var(--teal)',
        valueText: (i) => `${SLEEP[i]?.sub} a night, ${SLEEP[i]?.band.toLowerCase()}`,
      }}
      caption="Out of 100 U.S. adults: under 6 hours of sleep 32, 7 to 8 hours 23, 10 hours or more 32 have high blood pressure. 7 to 8 hours is the sweet spot."
      columns={['Sleep each night', 'Out of 100 adults']}
      notes={<Note>A survey, so this is a link and not a cause.</Note>}
      standalone={standalone}
    />
  );
}

export function SleepChapter() {
  return (
    <Chapter
      id="sleep"
      eyebrow="Sleeping"
      accent="var(--teal)"
      title="The sleep sweet spot"
      lede={<p>Too little and too much sleep land in the same place. The calm middle of the night is lowest.</p>}
    >
      <SleepExplorer />
    </Chapter>
  );
}
