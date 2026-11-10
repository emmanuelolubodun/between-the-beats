'use client';
import { useState } from 'react';
import { VesselChart, type VesselDatum } from '@/components/core/VesselChart';
import { Chapter, StoryGrid } from '@/components/layout/Chapter';
import { Note, ReadMore, Readout, Slider, SourceLine, Toggle } from '@/components/ui/controls';
import { GapScale } from '@/components/ui/thumbs';
import { ALL_ADULTS, SEX_RACE } from '@/lib/data';
import { storyBySlug } from '@/lib/stories';

type Emphasis = 'both' | 'men' | 'women';

const data: VesselDatum[] = SEX_RACE.flatMap((g) => [
  {
    key: `${g.group}-men`,
    label: `${g.group} men`,
    value: g.men.v,
    display: g.men.v.toFixed(1),
    lo: g.men.lo,
    hi: g.men.hi,
    color: 'var(--pulse)',
  },
  {
    key: `${g.group}-women`,
    label: `${g.group} women`,
    value: g.women.v,
    display: g.women.v.toFixed(1),
    lo: g.women.lo,
    hi: g.women.hi,
    color: 'var(--women)',
  },
]);

export function SexRaceExplorer({ standalone = false }: { standalone?: boolean }) {
  const story = storyBySlug('sex-race')!;
  const [emphasis, setEmphasis] = useState<Emphasis>('both');
  const [groupIndex, setGroupIndex] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const picked = SEX_RACE[groupIndex] ?? SEX_RACE[0]!;
  const group = picked.group;
  const hoveredDatum = data.find((d) => d.key === hovered);

  let readout;
  if (hoveredDatum) {
    readout = (
      <>
        <strong>{hoveredDatum.label}</strong>: about{' '}
        <strong className="tabular">{hoveredDatum.display ?? hoveredDatum.value}</strong> in 100.
      </>
    );
  } else {
    readout = (
      <>
        Among <strong>{picked.group}</strong> adults, about{' '}
        <strong className="tabular">{picked.men.v.toFixed(1)}</strong> in 100 men and{' '}
        <strong className="tabular">{picked.women.v.toFixed(1)}</strong> in 100 women have high blood pressure. A gap of{' '}
        <strong className="tabular">{picked.gap.toFixed(1)}</strong> points.
      </>
    );
  }

  let summary;
  if (emphasis === 'women') {
    summary = <>Black women, at 56.5 in 100, sit above the men of every other group.</>;
  } else if (emphasis === 'men') {
    summary = <>Men are higher than women in every group. Black men are highest, at 59.8 in 100.</>;
  } else {
    summary = (
      <>
        Men are higher in every group. The gap grows from 3.3 points for Black adults to 13.3 for Hispanic adults, and
        the balance tips further with it.
      </>
    );
  }

  return (
    <StoryGrid
      rail={
        <>
          <Toggle
            label="Show"
            value={emphasis}
            onChange={setEmphasis}
            options={[
              { value: 'both', label: 'Both' },
              { value: 'men', label: 'Men' },
              { value: 'women', label: 'Women' },
            ]}
          />
          <Slider
            label="The gap, group by group"
            stops={SEX_RACE.map((g) => g.group)}
            index={groupIndex}
            onChange={setGroupIndex}
            thumb={(i) => <GapScale gap={SEX_RACE[i]?.gap ?? 0} />}
            accent="var(--women)"
            valueText={(i) => {
              const g = SEX_RACE[i];
              return g ? `${g.group} adults: men ${g.men.v}, women ${g.women.v} in 100, a gap of ${g.gap} points` : '';
            }}
          />
          <div className="rounded-xl border border-line bg-panel/60 p-6">
            <Readout>{readout}</Readout>
            <p className="mt-4 border-t border-line pt-4 t-small text-mute">{summary}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 t-small text-mute" aria-hidden="true">
            <p className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-pulse" /> Men
            </p>
            <p className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-women" /> Women
            </p>
          </div>
          <div className="space-y-3">
            <Note>
              Race here is a social grouping shaped by access to care and environment, not biology. A survey, so this is
              a link and not a cause.
            </Note>
          </div>
          <SourceLine index={story.sourceIndex} basis={story.basis} />
          {!standalone && <ReadMore slug={story.slug} label="Read the full story" />}
        </>
      }
      chart={
        <VesselChart
          data={data}
          max={70}
          ticks={[20, 40, 60]}
          unit="in 100"
          reference={{ value: ALL_ADULTS.v, label: 'all adults', sub: `${ALL_ADULTS.v} in 100` }}
          isDimmed={(d) =>
            (emphasis === 'men' && d.key.endsWith('-women')) ||
            (emphasis === 'women' && d.key.endsWith('-men')) ||
            !d.key.startsWith(`${group}-`)
          }
          active={hovered}
          onHover={setHovered}
          onSelect={(k) =>
            setGroupIndex(
              Math.max(
                0,
                SEX_RACE.findIndex((g) => k.startsWith(`${g.group}-`)),
              ),
            )
          }
          caption="Out of 100 U.S. adults with high blood pressure, by group. Black: men 59.8, women 56.5. White: men 47.3, women 39.0. Asian: men 47.3, women 37.3. Hispanic: men 48.0, women 34.7. All adults 44.5. Men are higher in every group."
          columns={['Group', 'Out of 100 adults']}
          spread={[196, 344]}
        />
      }
    />
  );
}

export function SexRaceChapter() {
  return (
    <Chapter
      id="who"
      eyebrow="Who carries it"
      accent="var(--women)"
      title="Men more often, and Black adults most of all"
      lede={
        <p>
          Across all U.S. adults, about 44.5 in 100 have high blood pressure. That number hides very different burdens.
        </p>
      }
    >
      <SexRaceExplorer />
    </Chapter>
  );
}
