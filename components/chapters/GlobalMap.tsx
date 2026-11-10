'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Chapter } from '@/components/layout/Chapter';
import { Note, ReadMore, Readout, SourceLine } from '@/components/ui/controls';
import { COUNTRIES, REGION_META, REGION_ORDER, WORLD_MEDIAN, countryRank, type Country, type Region } from '@/lib/data';
import { compareToReference, ordinal } from '@/lib/format';
import { arcPath, pol, radiusScale } from '@/lib/scales';
import { gsap, ScrollTrigger } from '@/lib/motion';
import { storyBySlug } from '@/lib/stories';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

const REGION_VAR: Record<Region, string> = {
  'South-East Asia': 'var(--reg-seasia)',
  'Western Pacific': 'var(--reg-wpac)',
  Africa: 'var(--reg-africa)',
  Americas: 'var(--reg-americas)',
  Europe: 'var(--reg-europe)',
  'Eastern Mediterranean': 'var(--reg-emed)',
};

const r = radiusScale([15, 70], [190, 420]);
const RINGS = [20, 30, 40, 50, 60];
const TOP_GAP = 16; // degrees left open at the top for ring labels
const REGION_GAP = 3.2;
const FRAME_R = 440;

interface Spoke {
  country: Country;
  angle: number;
}

interface RegionArc {
  region: Region;
  a0: number;
  a1: number;
  spokes: Spoke[];
  lowest: Country;
  highest: Country;
}

function layout(): RegionArc[] {
  const step = (360 - TOP_GAP - REGION_GAP * (REGION_ORDER.length - 1)) / COUNTRIES.length;
  let a = TOP_GAP / 2;
  return REGION_ORDER.map((region) => {
    const list = COUNTRIES.filter((c) => c.r === region).sort((x, y) => x.v - y.v);
    const a0 = a;
    const spokes = list.map((country, i) => ({
      country,
      angle: a0 + (i + 0.5) * step,
    }));
    a = a0 + list.length * step;
    const arc = {
      region,
      a0,
      a1: a,
      spokes,
      lowest: list[0]!,
      highest: list[list.length - 1]!,
    };
    a += REGION_GAP;
    return arc;
  });
}

const ARCS = layout();
const SPOKES = ARCS.flatMap((x) => x.spokes);

function sentenceFor(c: Country) {
  const cmp = compareToReference(c.v, WORLD_MEDIAN);
  const rank = countryRank(c.c);
  return (
    <>
      In <strong>{c.c}</strong>, about <strong className="tabular">{c.v}</strong> in 100 adults have high blood
      pressure, {cmp.direction === 'level' ? 'level with' : <span className="tabular">{cmp.label}</span>} the world
      middle of 38. That ranks <span className="tabular">{ordinal(rank)}</span> of 194, counting from the highest. The
      likely range is <span className="tabular">{c.lo}</span> to <span className="tabular">{c.hi}</span>.
    </>
  );
}

const STEP = SPOKES.length > 1 ? SPOKES[1]!.angle - SPOKES[0]!.angle : 1;

/** Signed shortest turn from angle a to angle b, in degrees (-180 to 180). */
function turn(a: number, b: number): number {
  return ((((b - a) % 360) + 540) % 360) - 180;
}

/** Index of the country sitting under the needle at rotation R, or null when the needle is in a gap. */
function indexAt(rot: number): number | null {
  let best = -1;
  let bestDist = Infinity;
  SPOKES.forEach((s, i) => {
    const d = Math.abs(turn(rot, s.angle));
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return bestDist <= STEP * 0.75 ? best : null;
}

/** Pointer angle around the dial's center, 0 = up, clockwise, in degrees. */
function pointerAngle(e: { clientX: number; clientY: number }, el: Element): number {
  const b = el.getBoundingClientRect();
  const dx = e.clientX - (b.left + b.width / 2);
  const dy = e.clientY - (b.top + b.height / 2);
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

export function GlobalMapExplorer({ standalone = false }: { standalone?: boolean }) {
  const story = storyBySlug('global-map')!;
  const reduced = useReducedMotion();
  const [dialIndex, setDialIndex] = useState<number | null>(null);
  const [settled, setSettled] = useState<number | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [query, setQuery] = useState('');
  const pinRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const rotorRef = useRef<SVGGElement>(null);
  const groupRefs = useRef<(SVGGElement | null)[]>([]);
  const captionRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const rot = useRef(0);
  const lastIndex = useRef<number | null>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const drag = useRef<{ last: number; moved: number; v: number; t: number; startIdx: string | null } | null>(null);
  const searchId = useId();

  const dialCountry = dialIndex !== null ? SPOKES[dialIndex]!.country : undefined;
  const settledCountry = settled !== null ? SPOKES[settled]!.country : undefined;
  const focusCountry = hovered ? COUNTRIES.find((c) => c.c === hovered) : dialCountry;

  /** Rotate the ring without a React render; only a change of country re-renders. */
  const applyRotation = useCallback((value: number) => {
    rot.current = value;
    rotorRef.current?.setAttribute('transform', `rotate(${(-value).toFixed(3)})`);
    const idx = indexAt(value);
    if (idx !== lastIndex.current) {
      lastIndex.current = idx;
      setDialIndex(idx);
    }
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const target = rot.current + turn(rot.current, SPOKES[index]!.angle);
      tween.current?.kill();
      if (reduced) {
        applyRotation(target);
        setSettled(index);
        return;
      }
      const proxy = { r: rot.current };
      tween.current = gsap.to(proxy, {
        r: target,
        duration: 0.7,
        ease: 'power3.out',
        onUpdate: () => applyRotation(proxy.r),
        onComplete: () => setSettled(index),
      });
    },
    [applyRotation, reduced],
  );

  const step = (dir: number, size = 1) => {
    const from = settled ?? dialIndex;
    const base = from ?? (dir > 0 ? -1 : SPOKES.length);
    goTo(Math.max(0, Math.min(SPOKES.length - 1, base + dir * size)));
  };

  // Desktop scroll scene: pin the map and build it one region at a time.
  useEffect(() => {
    const pin = pinRef.current;
    if (!pin || standalone) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)', () => {
      const groups = groupRefs.current.filter((g): g is SVGGElement => g !== null);
      const caps = captionRefs.current.filter((c): c is HTMLParagraphElement => c !== null);
      gsap.set(groups, { opacity: 0.08, scale: 0.86, svgOrigin: '0 0' });
      gsap.set(caps, { opacity: 0, y: 12 });
      gsap.set(caps[0] ?? [], { opacity: 1, y: 0 });
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: pin,
          start: 'top top+=88',
          end: '+=2200',
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });
      groups.forEach((g, i) => {
        tl.to(g, { opacity: 1, scale: 1, duration: 1 }, i);
        tl.to(caps[i] ?? [], { opacity: 0, y: -12, duration: 0.4 }, i);
        tl.to(caps[i + 1] ?? [], { opacity: 1, y: 0, duration: 0.5 }, i + 0.35);
      });
      tl.to({}, { duration: 0.6 });
      return () => {
        ScrollTrigger.refresh();
      };
    });
    return () => mm.revert();
  }, [standalone]);

  useEffect(() => () => void tween.current?.kill(), []);

  /* ---- dragging the ring ---- */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !dialRef.current) return;
    tween.current?.kill();
    const target = e.target as Element;
    drag.current = {
      last: pointerAngle(e, dialRef.current),
      moved: 0,
      v: 0,
      t: performance.now(),
      startIdx: target.getAttribute('data-idx'),
    };
    dialRef.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !dialRef.current) return;
    const a = pointerAngle(e, dialRef.current);
    const delta = turn(d.last, a);
    const now = performance.now();
    d.v = delta / Math.max(1, now - d.t);
    d.t = now;
    d.last = a;
    d.moved += Math.abs(delta);
    if (d.moved > 2) applyRotation(rot.current - delta);
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved <= 2) {
      // A tap, not a drag: go to the tapped country, if any.
      if (d.startIdx !== null) goTo(Number(d.startIdx));
      return;
    }
    // A flick carries on a little, then settles on the nearest country.
    const projected = rot.current - d.v * 220;
    let best = 0;
    let bestDist = Infinity;
    SPOKES.forEach((s, i) => {
      const dist = Math.abs(turn(projected, s.angle));
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    goTo(best);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => step(1),
      ArrowDown: () => step(1),
      ArrowLeft: () => step(-1),
      ArrowUp: () => step(-1),
      PageDown: () => step(1, 10),
      PageUp: () => step(-1, 10),
      Home: () => goTo(0),
      End: () => goTo(SPOKES.length - 1),
    };
    const run = keys[e.key];
    if (run) {
      e.preventDefault();
      run();
    }
  };

  const onSearch = (value: string) => {
    setQuery(value);
    const idx = SPOKES.findIndex((s) => s.country.c.toLowerCase() === value.trim().toLowerCase());
    if (idx >= 0) goTo(idx);
  };

  const chooseRegion = (reg: Region) => {
    const next = region === reg ? null : reg;
    setRegion(next);
    if (next) {
      const arc = ARCS.find((a) => a.region === next)!;
      goTo(SPOKES.indexOf(arc.spokes[Math.floor(arc.spokes.length / 2)]!));
    }
  };

  const dimSpoke = (c: Country) => region !== null && c.r !== region;

  const centerContent = focusCountry ? (
    <>
      <p className="font-semibold text-ink" style={{ fontSize: 'clamp(14px, 2.6cqw, 22px)' }}>
        {focusCountry.c}
      </p>
      <p className="font-bold text-ink tabular" style={{ fontSize: 'clamp(28px, 8cqw, 72px)', lineHeight: 1 }}>
        {focusCountry.v}
      </p>
      <p className="text-mute" style={{ fontSize: 'clamp(12px, 1.9cqw, 16px)' }}>
        in 100 adults, {ordinal(countryRank(focusCountry.c))} of 194
      </p>
    </>
  ) : (
    <>
      <p className="font-semibold text-mute" style={{ fontSize: 'clamp(14px, 2.4cqw, 20px)' }}>
        Adults aged 30 to 79
      </p>
      <p className="font-bold text-ink tabular" style={{ fontSize: 'clamp(28px, 8cqw, 72px)', lineHeight: 1 }}>
        2019
      </p>
      <p className="text-mute" style={{ fontSize: 'clamp(12px, 1.9cqw, 16px)' }}>
        194 countries, world middle 38
      </p>
    </>
  );

  const scenes = [
    'Scroll to build the map, one region at a time.',
    ...ARCS.map(
      (a) =>
        `${a.region}: ${REGION_META[a.region].count} countries, about ${REGION_META[a.region].avg.toFixed(1)} in 100 on average. Highest ${a.highest.c} (${a.highest.v}), lowest ${a.lowest.c} (${a.lowest.v}).`,
    ),
    'All 194 countries. The regions sit close together. Turn the dial to explore any one.',
  ];

  const valueText = dialCountry
    ? `${dialCountry.c}, ${dialCountry.v} in 100 adults, ${ordinal(countryRank(dialCountry.c))} of 194`
    : 'No country selected';

  return (
    <>
      {/* React owns this wrapper; GSAP may wrap the pinned grid inside it in a pin-spacer. */}
      <div>
        <div
          ref={pinRef}
          className="mt-14 grid items-center gap-10 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-12"
        >
          <div className="space-y-6">
            <div className="rounded-xl border border-line bg-panel/60 p-5">
              <Readout className="t-small md:text-[1.0625rem]">
                {settledCountry ? (
                  sentenceFor(settledCountry)
                ) : (
                  <>
                    Each dot is a country. The world middle is <strong className="tabular">38</strong> in 100 (the
                    dashed ring). Turning the dial reads out any country.
                  </>
                )}
              </Readout>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-mute hover:border-mute hover:text-ink"
                  aria-label="Previous country on the dial"
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                    <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-mute hover:border-mute hover:text-ink"
                  aria-label="Next country on the dial"
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                    <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </button>
                <div className="relative basis-full">
                  <label htmlFor={searchId} className="sr-only">
                    Search a country
                  </label>
                  <input
                    id={searchId}
                    list={`${searchId}-list`}
                    value={query}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search a country"
                    autoComplete="off"
                    className="min-h-11 w-full rounded-full border border-line bg-canvas-2 px-4 t-small text-ink placeholder:text-faint hover:border-mute"
                  />
                  <datalist id={`${searchId}-list`}>
                    {COUNTRIES.map((c) => (
                      <option key={c.c} value={c.c} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {!standalone && (
              <div className="relative hidden min-h-[72px] min-[900px]:block" aria-hidden="true">
                {scenes.map((s, i) => (
                  <p
                    key={i}
                    ref={(el) => {
                      captionRefs.current[i] = el;
                    }}
                    className="absolute inset-0 t-small text-mute opacity-0"
                  >
                    {s}
                  </p>
                ))}
              </div>
            )}

            <div>
              <p id="region-legend" className="mb-2 t-small font-semibold text-mute">
                WHO regions
              </p>
              <div role="group" aria-labelledby="region-legend" className="grid grid-cols-2 gap-1.5">
                {REGION_ORDER.map((reg) => {
                  const on = region === reg;
                  return (
                    <button
                      key={reg}
                      type="button"
                      aria-pressed={on}
                      onClick={() => chooseRegion(reg)}
                      className={`flex min-h-11 items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                        on ? 'bg-panel ring-1 ring-mute' : 'hover:bg-panel/60'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                        style={{ background: REGION_VAR[reg] }}
                      />
                      <span className="t-small">
                        <span className="font-semibold text-ink">{reg}</span>
                        <span className="block t-caption text-faint tabular">
                          average {REGION_META[reg].avg.toFixed(1)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <figure className="m-0">
            {/* The reading under the needle, always visible (the center readout is hidden on phones). */}
            <p className="mb-2 flex min-h-7 items-baseline justify-center gap-2 text-center" aria-hidden="true">
              {dialCountry ? (
                <>
                  <span className="t-small font-semibold text-ink">{dialCountry.c}</span>
                  <span className="t-small font-bold tabular" style={{ color: REGION_VAR[dialCountry.r] }}>
                    {dialCountry.v}
                  </span>
                  <span className="t-caption text-mute">in 100</span>
                </>
              ) : (
                <span className="t-caption text-faint">Drag the ring to turn the dial</span>
              )}
            </p>
            <div
              ref={dialRef}
              role="slider"
              tabIndex={0}
              aria-label="Country dial: turn to read each country"
              aria-valuemin={0}
              aria-valuemax={SPOKES.length}
              aria-valuenow={dialIndex === null ? 0 : dialIndex + 1}
              aria-valuetext={valueText}
              onKeyDown={onKeyDown}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onLostPointerCapture={onPointerUp}
              onPointerCancel={() => {
                drag.current = null;
              }}
              className="cq relative mx-auto aspect-square w-full cursor-grab touch-pan-y select-none rounded-full active:cursor-grabbing md:max-w-[min(100%,calc(100svh-180px))]"
            >
              <svg viewBox="-500 -500 1000 1000" className="h-full w-full" aria-hidden="true" focusable="false">
                <g ref={rotorRef}>
                  {RINGS.map((v) => (
                    <circle key={v} r={r(v)} fill="none" stroke="var(--line)" strokeWidth="1.4" />
                  ))}
                  <circle
                    r={r(WORLD_MEDIAN)}
                    fill="none"
                    stroke="var(--mute)"
                    strokeOpacity="0.75"
                    strokeWidth="1.8"
                    strokeDasharray="6 7"
                  />
                  {RINGS.map((v) => {
                    const [x, y] = pol(0, 0, r(v), 0);
                    return (
                      <text
                        key={v}
                        x={x}
                        y={y + 7}
                        fontSize="22"
                        textAnchor="middle"
                        fill="var(--faint)"
                        className="tabular"
                      >
                        {v}
                      </text>
                    );
                  })}

                  {ARCS.map((arc, gi) => (
                    <g
                      key={arc.region}
                      ref={(el) => {
                        groupRefs.current[gi] = el;
                      }}
                    >
                      <path
                        d={arcPath(0, 0, FRAME_R, arc.a0, arc.a1)}
                        fill="none"
                        stroke={REGION_VAR[arc.region]}
                        strokeWidth="9"
                        strokeLinecap="round"
                        opacity={region && region !== arc.region ? 0.25 : 1}
                      />
                      {arc.spokes.map(({ country: c, angle }) => {
                        const [x0, y0] = pol(0, 0, r(c.lo), angle);
                        const [x1, y1] = pol(0, 0, r(c.hi), angle);
                        const [dx, dy] = pol(0, 0, r(c.v), angle);
                        const isFocus = focusCountry?.c === c.c;
                        const color = REGION_VAR[c.r];
                        return (
                          <g key={c.c} style={{ opacity: dimSpoke(c) ? 0.18 : 1, transition: 'opacity 250ms ease' }}>
                            <line
                              x1={x0}
                              y1={y0}
                              x2={x1}
                              y2={y1}
                              stroke={color}
                              strokeOpacity={isFocus ? 1 : 0.5}
                              strokeWidth={isFocus ? 4.5 : 2.4}
                              strokeLinecap="round"
                            />
                            <circle
                              cx={dx}
                              cy={dy}
                              r={isFocus ? 9 : 4.2}
                              fill={isFocus ? 'var(--ink)' : color}
                              stroke={isFocus ? color : 'none'}
                              strokeWidth="4"
                            />
                          </g>
                        );
                      })}
                    </g>
                  ))}

                  {/* invisible hover and tap targets, one per country */}
                  {SPOKES.map(({ country: c, angle }, i) => {
                    const [x0, y0] = pol(0, 0, r(15), angle);
                    const [x1, y1] = pol(0, 0, FRAME_R + 20, angle);
                    return (
                      <line
                        key={c.c}
                        data-idx={i}
                        x1={x0}
                        y1={y0}
                        x2={x1}
                        y2={y1}
                        stroke="transparent"
                        strokeWidth="10"
                        onPointerEnter={() => !drag.current && setHovered(c.c)}
                        onPointerLeave={() => setHovered(null)}
                      />
                    );
                  })}
                </g>

                {/* The fixed needle at the top: whatever sits under it is the reading. */}
                <line
                  x1="0"
                  y1={-FRAME_R + 4}
                  x2="0"
                  y2={-r(15)}
                  stroke="var(--ink)"
                  strokeOpacity="0.35"
                  strokeWidth="1.5"
                  strokeDasharray="2 6"
                />
                <path d={`M-16,${-FRAME_R - 44} L16,${-FRAME_R - 44} L0,${-FRAME_R - 14} Z`} fill="var(--ink)" />
              </svg>

              <div
                className="pointer-events-none absolute left-1/2 top-1/2 hidden w-[34%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center md:flex"
                aria-hidden="true"
              >
                {centerContent}
              </div>
            </div>
            <figcaption className="mt-4 t-caption text-faint md:text-center">
              Drag the ring, use the arrow keys, or tap a dot. Dot: best estimate. Line through it: likely range. Dashed
              ring: world middle, 38 in 100.
            </figcaption>

            <div className="sr-only">
              <table>
                <caption>
                  Adults aged 30 to 79 with high blood pressure, out of 100, in 194 countries, 2019. World middle 38.
                  Grouped by WHO region.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Country</th>
                    <th scope="col">WHO region</th>
                    <th scope="col">Out of 100 adults</th>
                    <th scope="col">Likely range (95%)</th>
                  </tr>
                </thead>
                <tbody>
                  {SPOKES.map(({ country: c }) => (
                    <tr key={c.c}>
                      <th scope="row">{c.c}</th>
                      <td>{c.r}</td>
                      <td>{c.v}</td>
                      <td>
                        {c.lo} to {c.hi}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </figure>
        </div>
      </div>

      <div className="mt-10 space-y-4 md:grid md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-12 md:space-y-0">
        <div className="space-y-3">
          <Note>
            This map uses the 140/90 threshold. The U.S. chapters below use the stricter 130/80, so the two sets of
            numbers do not compare directly.
          </Note>
        </div>
        <div className="space-y-5">
          <SourceLine index={story.sourceIndex} basis={story.basis} />
          {!standalone && <ReadMore slug={story.slug} label="Read the full story" />}
        </div>
      </div>
    </>
  );
}

export function GlobalMapChapter() {
  return (
    <Chapter
      id="where"
      eyebrow="Where it is"
      accent="var(--reg-americas)"
      title="Everywhere, at about the same height"
      lede={
        <p>
          Across 194 countries, the middle is about 38 adults in 100. Every region lands between 34 and 39. The spread
          inside each region is far wider than the gaps between them.
        </p>
      }
    >
      <GlobalMapExplorer />
    </Chapter>
  );
}
