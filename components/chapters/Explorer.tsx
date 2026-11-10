'use client';
import { useState, type ReactNode } from 'react';
import { VesselChart, type VesselDatum } from '@/components/core/VesselChart';
import { ChipGroup, Readout, ReadMore, Slider, SourceLine } from '@/components/ui/controls';
import { StoryGrid } from '@/components/layout/Chapter';
import { storyBySlug, type StorySlug } from '@/lib/stories';

export interface ExplorerProps {
  slug: StorySlug;
  data: readonly VesselDatum[];
  max: number;
  ticks: readonly number[];
  unit: string;
  tickLabel?: (v: number) => string;
  reference?: { value: number; label: string; sub?: string };
  /** What the readout says before anything is picked. */
  summary: ReactNode;
  /** What the readout says for one picked item. */
  sentence: (d: VesselDatum) => ReactNode;
  chipLabel: string;
  caption: string;
  columns?: [string, string];
  notes?: ReactNode;
  /** Extra panel under the readout (e.g. a context stat). */
  extra?: ReactNode;
  /**
   * Swap the chips for a picture slider that walks the data in order. The slider always has a
   * value, so the readout shows that item's sentence with the summary under it.
   */
  slider?: {
    label: string;
    stops: readonly string[];
    thumb: (index: number) => ReactNode;
    accent?: string;
    valueText?: (index: number) => string;
    initial?: number;
  };
  /** True on the deep-dive page, where the read-more link is not needed. */
  standalone?: boolean;
}

/** The common story layout: pick an item, read it in plain words, see it highlighted. */
export function Explorer({
  slug,
  data,
  max,
  ticks,
  unit,
  tickLabel,
  reference,
  summary,
  sentence,
  chipLabel,
  caption,
  columns,
  notes,
  extra,
  slider,
  standalone = false,
}: ExplorerProps) {
  const story = storyBySlug(slug);
  const [picked, setPicked] = useState<string | null>(slider ? (data[slider.initial ?? 0]?.key ?? null) : null);
  const [hovered, setHovered] = useState<string | null>(null);
  const focus = slider ? picked : (picked ?? hovered);
  const focusDatum = data.find((d) => d.key === focus);
  const index = Math.max(
    0,
    data.findIndex((d) => d.key === picked),
  );

  return (
    <StoryGrid
      rail={
        <>
          {slider ? (
            <Slider
              label={slider.label}
              stops={slider.stops}
              index={index}
              onChange={(i) => setPicked(data[i]?.key ?? null)}
              thumb={slider.thumb}
              accent={slider.accent}
              valueText={slider.valueText}
            />
          ) : (
            <ChipGroup
              label={chipLabel}
              items={data.map((d) => ({ key: d.key, label: d.label, color: d.color }))}
              value={picked}
              onChange={setPicked}
            />
          )}
          <div className="rounded-xl border border-line bg-panel/60 p-6">
            <Readout>{focusDatum ? sentence(focusDatum) : summary}</Readout>
            {slider && <p className="mt-4 border-t border-line pt-4 t-small text-mute">{summary}</p>}
          </div>
          {extra}
          {notes && <div className="space-y-3">{notes}</div>}
          {story && <SourceLine index={story.sourceIndex} basis={story.basis} />}
          {!standalone && story && <ReadMore slug={story.slug} label="Read the full story" />}
        </>
      }
      chart={
        <VesselChart
          data={data}
          max={max}
          ticks={ticks}
          unit={unit}
          tickLabel={tickLabel}
          reference={reference}
          active={focus}
          onHover={setHovered}
          onSelect={(k) => setPicked((p) => (slider ? k : p === k ? null : k))}
          caption={caption}
          columns={columns}
        />
      }
    />
  );
}
