'use client';
import { useState } from 'react';
import { VesselChart, type VesselDatum } from '@/components/core/VesselChart';
import { Chapter, StoryGrid } from '@/components/layout/Chapter';
import { Note, ReadMore, Readout, Slider, SourceLine, Toggle } from '@/components/ui/controls';
import { DASH, dashDrop, type Diet, type Salt } from '@/lib/data';
import { useTweenedValues } from '@/lib/hooks/useReveal';
import { storyBySlug } from '@/lib/stories';
import { PlateIcon, SaltShaker } from '@/components/ui/thumbs';

const SALTS: readonly Salt[] = ['high', 'medium', 'low'];
const SALT_LABEL: Record<Salt, string> = { high: 'High salt', medium: 'Medium salt', low: 'Low salt' };
const DIET_LABEL: Record<Diet, string> = { typical: 'Typical plate', dash: 'DASH plate' };
const DIET_SUB: Record<Diet, string> = { typical: 'same food', dash: 'better food' };

const MINUS = '−';
const fmtDrop = (v: number) => (v === 0 ? '0' : `${MINUS}${Math.abs(v).toFixed(1)}`);

// Biggest drop on top, the salty starting plate at the bottom (as on the poster).
const ORDER: [Diet, Salt][] = [
  ['dash', 'low'],
  ['dash', 'medium'],
  ['dash', 'high'],
  ['typical', 'low'],
  ['typical', 'medium'],
  ['typical', 'high'],
];

const data: VesselDatum[] = ORDER.map(([diet, salt]) => {
  const cell = dashDrop(diet, salt);
  return {
    key: `${diet}-${salt}`,
    label: `${diet === 'dash' ? 'DASH' : 'Typical'}, ${salt} salt`,
    sub: `${DIET_SUB[diet]}, ${salt} salt`,
    value: Math.abs(cell.drop),
    display: fmtDrop(cell.drop),
    lo: cell.ci ? Math.abs(cell.ci.lo) : undefined,
    hi: cell.ci ? Math.abs(cell.ci.hi) : undefined,
    color: diet === 'dash' ? 'var(--dash)' : 'var(--pulse)',
    tag: cell.drop === 0 ? 'start' : undefined,
  };
});

export function SodiumExplorer({ standalone = false }: { standalone?: boolean }) {
  const story = storyBySlug('sodium')!;
  const [diet, setDiet] = useState<Diet>('dash');
  const [saltIndex, setSaltIndex] = useState(2);
  const salt = SALTS[saltIndex] ?? 'high';
  const cell = dashDrop(diet, salt);
  const [shown] = useTweenedValues([Math.abs(cell.drop)], 0.7);
  const best = DASH.reduce((a, b) => (b.drop < a.drop ? b : a));

  const sentence =
    cell.drop === 0 ? (
      <>This is the starting point: a typical plate at high salt.</>
    ) : (
      <>
        A <strong>{DIET_LABEL[diet].toLowerCase()}</strong> at <strong>{SALT_LABEL[salt].toLowerCase()}</strong> drops
        the top number by about <strong className="tabular">{Math.abs(cell.drop).toFixed(1)}</strong> points versus a
        typical salty plate.
        {cell.ci && (
          <>
            {' '}
            The likely range is <span className="tabular">{Math.abs(cell.ci.lo).toFixed(1)}</span> to{' '}
            <span className="tabular">{Math.abs(cell.ci.hi).toFixed(1)}</span>.
          </>
        )}
      </>
    );

  return (
    <StoryGrid
      rail={
        <>
          <Toggle
            label="The food"
            value={diet}
            onChange={setDiet}
            options={[
              { value: 'typical', label: DIET_LABEL.typical, icon: <PlateIcon diet="typical" /> },
              { value: 'dash', label: DIET_LABEL.dash, icon: <PlateIcon diet="dash" /> },
            ]}
          />
          <Slider
            label="The salt"
            stops={SALTS.map((s) => SALT_LABEL[s])}
            index={saltIndex}
            onChange={setSaltIndex}
            thumb={(i) => <SaltShaker salt={SALTS[i] ?? 'high'} />}
          />
          <div className="rounded-xl border border-line bg-panel/60 p-6">
            <p aria-hidden="true" className="flex items-baseline gap-3">
              <span className="t-hero text-dash tabular">
                {shown && shown > 0.05 ? `${MINUS}${shown.toFixed(1)}` : '0.0'}
              </span>
              <span className="t-small text-mute">points on the top number</span>
            </p>
            <Readout className="mt-3">{sentence}</Readout>
          </div>
          <div className="space-y-3">
            <Note tone="cause">
              This is the one place the data shows cause. People were given their diet at random, so the food and salt
              caused these drops.
            </Note>
            <Note>
              DASH means more fruit, vegetables, whole grains and low-fat dairy, and less red meat and sugar. Best of
              all: DASH with low salt, about {Math.abs(best.drop).toFixed(1)} points lower.
            </Note>
          </div>
          <SourceLine index={story.sourceIndex} basis={story.basis} />
          {!standalone && <ReadMore slug={story.slug} label="Read the full story" />}
        </>
      }
      chart={
        <VesselChart
          data={data}
          max={10}
          ticks={[3, 6, 9]}
          tickLabel={(v) => `${MINUS}${v}`}
          unit="points"
          active={`${diet}-${salt}`}
          onSelect={(k) => {
            const [d, s] = k.split('-') as [Diet, Salt];
            setDiet(d);
            setSaltIndex(SALTS.indexOf(s));
          }}
          caption="Drop in the top blood pressure number versus a typical diet at high salt: typical medium salt 2.1, DASH high salt 5.9, typical low salt 6.7, DASH medium salt 7.2, DASH low salt 8.9 points. Both levers stack."
          columns={['Food and salt', 'Change in top number']}
          spread={[200, 340]}
        />
      }
    />
  );
}

export function SodiumChapter() {
  return (
    <Chapter
      id="salt"
      eyebrow="Salt and food"
      accent="var(--dash)"
      title="The plate and the pressure"
      lede={
        <p>
          Two levers on the plate: the food and the salt. Moving either one changes the top blood pressure number. This
          comes from a real experiment, so the effect is real too.
        </p>
      }
    >
      <SodiumExplorer />
    </Chapter>
  );
}
