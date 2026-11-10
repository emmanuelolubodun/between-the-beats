'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { CoreGlyph } from './PulseCore';
import { pol } from '@/lib/scales';
import { gsap, MOTION_OK, ScrollTrigger, EASE_OUT } from '@/lib/motion';
import { useTweenedValues } from '@/lib/hooks/useReveal';

export interface VesselDatum {
  key: string;
  label: string;
  sub?: string;
  /** The encoded value: distance from the core. Always zero or more. */
  value: number;
  /** Text shown for the value when it differs from `value` (e.g. "-8.9"). */
  display?: string;
  lo?: number;
  hi?: number;
  /** CSS color, normally a token such as var(--pulse). */
  color: string;
  /** Short extra label beside the node, e.g. "sweet spot". */
  tag?: string;
}

interface VesselChartProps {
  data: readonly VesselDatum[];
  max: number;
  ticks: readonly number[];
  /** Small unit after each value ("in 100", "per 100,000", "points"). */
  unit: string;
  tickLabel?: (v: number) => string;
  reference?: { value: number; label: string; sub?: string };
  /** Key of the emphasized vessel. Others dim while one is active. */
  active?: string | null;
  /** Extra dimming rule, e.g. the men/women emphasis toggle. */
  isDimmed?: (d: VesselDatum) => boolean;
  onHover?: (key: string | null) => void;
  onSelect?: (key: string) => void;
  /** Screen-reader caption: the numbers and the takeaway in one or two sentences. */
  caption: string;
  /** Column headings for the hidden data table. */
  columns?: [string, string];
  /** Angle range of the fan in degrees (0 = up, 270 = left). */
  spread?: [number, number];
}

const W = 680;
const CX = 590;
const CORE_R = 44;
const R_MAX = 340;
const HALO = { paintOrder: 'stroke', stroke: 'var(--canvas)', strokeWidth: 5, strokeLinejoin: 'round' } as const;

function radiusFor(v: number, max: number): number {
  return CORE_R + 16 + (Math.max(0, v) / max) * (R_MAX - CORE_R - 16);
}

/** Sample a cubic bezier into points. */
function bezier(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  n = 28,
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return pts;
}

/** A ribbon polygon around a centerline that tapers from w0 at the core to w1 at the node. */
function ribbon(pts: [number, number][], w0: number, w1: number): string {
  const left: string[] = [];
  const right: string[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)]!;
    const b = pts[Math.min(pts.length - 1, i + 1)]!;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2;
    const nx = (-dy / len) * w;
    const ny = (dx / len) * w;
    left.push(`${(p[0] + nx).toFixed(1)},${(p[1] + ny).toFixed(1)}`);
    right.unshift(`${(p[0] - nx).toFixed(1)},${(p[1] - ny).toFixed(1)}`);
  });
  return `M${left.join(' L')} L${right.join(' L')} Z`;
}

function linePath(pts: [number, number][]): string {
  return `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L')}`;
}

export function VesselChart({
  data,
  max,
  ticks,
  unit,
  tickLabel = (v) => String(v),
  reference,
  active = null,
  isDimmed,
  onHover,
  onSelect,
  caption,
  columns = ['Group', 'Value'],
  spread,
}: VesselChartProps) {
  const uid = useId().replace(/:/g, '');
  const rootRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const values = useTweenedValues(data.map((d) => d.value));
  const n = data.length;
  const [aLow, aHigh] = spread ?? (n > 5 ? [200, 340] : [214, 326]);

  // Grow every vessel out of the core the first time the chart scrolls into view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const grow = el.querySelectorAll('.v-grow');
      const nodes = el.querySelectorAll('.v-node');
      const fills = el.querySelectorAll('.v-fill');
      const labels = el.querySelectorAll('.v-label');
      gsap.set(grow, { strokeDashoffset: 1 });
      gsap.set(nodes, { opacity: 0, scale: 0.2, transformOrigin: '50% 50%' });
      gsap.set(labels, { opacity: 0 });
      gsap.set(fills, { scaleX: 0, transformOrigin: '0% 50%' });
      const tl = gsap.timeline({ paused: true });
      tl.to(grow, {
        strokeDashoffset: 0,
        duration: 0.9,
        ease: EASE_OUT,
        stagger: 0.09,
      })
        .to(
          nodes,
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'back.out(2)',
            stagger: 0.09,
          },
          0.55,
        )
        .to(labels, { opacity: 1, duration: 0.5, stagger: 0.09 }, 0.6)
        .to(fills, { scaleX: 1, duration: 0.9, ease: EASE_OUT, stagger: 0.09 }, 0);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 75%',
        once: true,
        onEnter: () => tl.play(),
      });
    });
    return () => mm.revert();
  }, []);

  const focus = active ?? hover;
  const dimOf = (d: VesselDatum) => (focus !== null && d.key !== focus) || (isDimmed?.(d) ?? false);
  const enter = (key: string | null) => {
    setHover(key);
    onHover?.(key);
  };

  const angleOf = (i: number) => (n === 1 ? 270 : aHigh - ((aHigh - aLow) * i) / (n - 1));
  const exitOf = (a: number) => 270 + (a - 270) * 0.5;
  const arcFrom = aLow - 12;
  const arcTo = aHigh + 12;

  const geo = data.map((d, i) => {
    const a = angleOf(i);
    const r = radiusFor(values[i] ?? d.value, max);
    const e = exitOf(a);
    const start = pol(CX, 0, CORE_R + 2, e);
    const c1 = pol(CX, 0, CORE_R + 0.45 * (r - CORE_R), e);
    const c2 = pol(CX, 0, CORE_R + 0.72 * (r - CORE_R), a);
    const end = pol(CX, 0, r, a);
    const pts = bezier(start, c1, c2, end);
    return { d, a, r, end, pts, start, ly: end[1] };
  });

  // Keep label blocks from overlapping: relax their heights apart, then draw leaders.
  const blockH = (d: VesselDatum) => (d.sub ? 70 : 54);
  const order = geo.map((_, i) => i).sort((x, y) => geo[x]!.end[1] - geo[y]!.end[1]);
  for (let iter = 0; iter < 40; iter++) {
    for (let k = 1; k < order.length; k++) {
      const a = geo[order[k - 1]!]!;
      const b = geo[order[k]!]!;
      const need = (blockH(a.d) + blockH(b.d)) / 2 + 4;
      const gap = b.ly - a.ly;
      if (gap < need) {
        const push = (need - gap) / 2;
        a.ly -= push;
        b.ly += push;
      }
    }
  }

  const hovered = hover ? geo.find((g) => g.d.key === hover) : undefined;
  const top = Math.min(-R_MAX * 0.94, ...geo.map((g) => g.ly - 44)) - 16;
  const bottom = Math.max(R_MAX * 0.94, ...geo.map((g) => g.ly + 44)) + 16;
  const height = bottom - top;

  return (
    <div ref={rootRef} className="relative">
      {/* Desktop: the poster's fan of vessels */}
      <div className="relative hidden md:block" aria-hidden="true">
        <svg viewBox={`0 ${top} ${W} ${height}`} className="h-auto w-full overflow-visible" focusable="false">
          <defs>
            {geo.map(({ d, start, end }, i) => (
              <linearGradient
                key={d.key}
                id={`g-${uid}-${i}`}
                gradientUnits="userSpaceOnUse"
                x1={start[0]}
                y1={start[1]}
                x2={end[0]}
                y2={end[1]}
              >
                <stop offset="0" style={{ stopColor: 'var(--pulse-deep)' }} />
                <stop offset="1" style={{ stopColor: d.color }} />
              </linearGradient>
            ))}
            {geo.map(({ d, pts }, i) => (
              <mask key={d.key} id={`m-${uid}-${i}`} maskUnits="userSpaceOnUse" x="0" y={top} width={W} height={height}>
                <path
                  className="v-grow"
                  d={linePath(pts)}
                  pathLength={1}
                  strokeDasharray="1 1"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="24"
                />
              </mask>
            ))}
            {data.map((d, i) => (
              <radialGradient key={d.key} id={`n-${uid}-${i}`}>
                <stop offset="0" style={{ stopColor: d.color, stopOpacity: 0.45 }} />
                <stop offset="1" style={{ stopColor: d.color, stopOpacity: 0 }} />
              </radialGradient>
            ))}
          </defs>

          {/* scale rings, labeled */}
          {ticks.map((t) => {
            const r = radiusFor(t, max);
            const [x0, y0] = pol(CX, 0, r, arcFrom);
            const [x1, y1] = pol(CX, 0, r, arcTo);
            const [lx, ly] = pol(CX, 0, r, arcTo + 3);
            return (
              <g key={t}>
                <path
                  d={`M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`}
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth="1.2"
                />
                <text x={lx} y={ly} fontSize="16" fill="var(--faint)" textAnchor="middle" className="tabular">
                  {tickLabel(t)}
                </text>
              </g>
            );
          })}

          {reference &&
            (() => {
              const r = radiusFor(reference.value, max);
              const [x0, y0] = pol(CX, 0, r, arcFrom - 6);
              const [x1, y1] = pol(CX, 0, r, arcTo + 6);
              const [lx, ly] = pol(CX, 0, r, arcFrom - 10);
              return (
                <g>
                  <path
                    d={`M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`}
                    fill="none"
                    stroke="var(--mute)"
                    strokeOpacity="0.7"
                    strokeWidth="1.5"
                    strokeDasharray="5 6"
                  />
                  <text
                    x={lx}
                    y={ly + 14}
                    fontSize="16"
                    fontWeight="600"
                    fill="var(--mute)"
                    textAnchor="middle"
                    className="tabular"
                  >
                    {reference.value}
                  </text>
                </g>
              );
            })()}

          {/* vessels */}
          {geo.map(({ d, pts, r, a, end, ly: labelY }, i) => {
            const dim = dimOf(d);
            const isOn = focus === d.key;
            const hasLen = r > CORE_R + 18;
            const lx = end[0] - 22;
            const ly = labelY;
            const moved = Math.abs(ly - end[1]) > 6;
            return (
              <g
                key={d.key}
                style={{
                  opacity: dim ? 0.32 : 1,
                  transition: 'opacity 300ms ease',
                }}
                onPointerEnter={() => enter(d.key)}
                onPointerLeave={() => enter(null)}
                onClick={() => onSelect?.(d.key)}
                className={onSelect ? 'cursor-pointer' : undefined}
              >
                {d.lo !== undefined &&
                  d.hi !== undefined &&
                  (() => {
                    const [x0, y0] = pol(CX, 0, radiusFor(d.lo, max), a);
                    const [x1, y1] = pol(CX, 0, radiusFor(d.hi, max), a);
                    return (
                      <line
                        className="v-label"
                        x1={x0}
                        y1={y0}
                        x2={x1}
                        y2={y1}
                        stroke={d.color}
                        strokeOpacity="0.3"
                        strokeWidth="9"
                        strokeLinecap="round"
                      />
                    );
                  })()}
                {hasLen && (
                  <g mask={`url(#m-${uid}-${i})`}>
                    <path d={ribbon(pts, 11, 4)} fill={`url(#g-${uid}-${i})`} />
                    <path d={linePath(pts)} fill="none" stroke="var(--ink)" strokeOpacity="0.28" strokeWidth="1.2" />
                  </g>
                )}
                {/* wide invisible hit area for hover */}
                <path d={linePath(pts)} fill="none" stroke="transparent" strokeWidth="26" />
                <g className="v-node">
                  <circle cx={end[0]} cy={end[1]} r={isOn ? 30 : 22} fill={`url(#n-${uid}-${i})`} />
                  <circle
                    cx={end[0]}
                    cy={end[1]}
                    r={isOn ? 11 : 9}
                    fill={d.color}
                    stroke="var(--canvas-2)"
                    strokeWidth="2.5"
                  />
                </g>
                <g className="v-label" textAnchor="end">
                  {moved && (
                    <path
                      d={`M${end[0] - 11},${end[1]} L${lx + 6},${ly + 2}`}
                      fill="none"
                      stroke="var(--faint)"
                      strokeWidth="1"
                    />
                  )}
                  <text
                    x={lx}
                    y={ly - 12}
                    fontSize="22"
                    fontWeight="700"
                    fill={d.color}
                    className="tabular"
                    style={HALO}
                  >
                    {d.tag && (
                      <tspan fontSize="16" fontWeight="600" dx="0">
                        {d.tag}
                        {'  '}
                      </tspan>
                    )}
                    {d.display ?? d.value}
                    <tspan fontSize="16" fontWeight="400" fill="var(--mute)" dx="6">
                      {unit}
                    </tspan>
                  </text>
                  <text x={lx} y={ly + 12} fontSize="21" fontWeight="700" fill="var(--ink)" style={HALO}>
                    {d.label}
                  </text>
                  {d.sub && (
                    <text x={lx} y={ly + 33} fontSize="16.5" fill="var(--mute)" style={HALO}>
                      {d.sub}
                    </text>
                  )}
                </g>
              </g>
            );
          })}

          <CoreGlyph x={CX} y={0} r={CORE_R} />
        </svg>
        {reference && (
          <p className="mt-2 flex items-center justify-end gap-2 t-caption text-mute">
            <span aria-hidden="true" className="inline-block w-6 border-t-2 border-dashed border-mute/70" />
            Dashed ring: {reference.label}
            {reference.sub ? `, ${reference.sub}` : ''}
          </p>
        )}

        {hovered && hovered.d.lo !== undefined && hovered.d.hi !== undefined && (
          <div
            className="pointer-events-none absolute z-10 -translate-y-full rounded-md border border-line bg-canvas-2/95 px-3 py-2 t-caption text-mute shadow-lg"
            style={{
              left: `${((hovered.end[0] + 18) / W) * 100}%`,
              top: `${((hovered.end[1] - top - 22) / height) * 100}%`,
            }}
          >
            <span className="tabular">
              Likely range {hovered.d.lo} to {hovered.d.hi}
            </span>
          </div>
        )}
      </div>

      {/* Phones: horizontal vessels, same data, same scale from zero */}
      <div className="md:hidden" aria-hidden="true">
        <div className="relative">
          <ul className="space-y-6">
            {data.map((d, i) => {
              const v = values[i] ?? d.value;
              const pct = (Math.max(0, v) / max) * 100;
              const dim = dimOf(d);
              return (
                <li
                  key={d.key}
                  style={{
                    opacity: dim ? 0.35 : 1,
                    transition: 'opacity 300ms ease',
                  }}
                  onClick={() => onSelect?.(d.key)}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <span className="t-small font-semibold text-ink">{d.label}</span>
                      {d.tag && (
                        <span className="ml-2 t-caption font-semibold" style={{ color: d.color }}>
                          {d.tag}
                        </span>
                      )}
                      {d.sub && <span className="block t-caption text-faint">{d.sub}</span>}
                    </div>
                    <span className="shrink-0 text-xl font-bold tabular" style={{ color: d.color }}>
                      {d.display ?? d.value}
                      <span className="ml-1 t-caption font-normal text-mute">{unit}</span>
                    </span>
                  </div>
                  <div className="relative mt-2 h-3">
                    <div className="absolute inset-y-[5px] left-0 right-0 rounded bg-line" />
                    {d.lo !== undefined && d.hi !== undefined && (
                      <div
                        className="absolute inset-y-0 rounded"
                        style={{
                          left: `${(Math.min(d.lo, max) / max) * 100}%`,
                          width: `${((Math.min(d.hi, max) - Math.min(d.lo, max)) / max) * 100}%`,
                          background: d.color,
                          opacity: 0.28,
                        }}
                      />
                    )}
                    <div
                      className="v-fill absolute inset-y-[2px] left-0 rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, var(--pulse-deep), ${d.color})`,
                      }}
                    />
                    <div
                      className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-canvas-2"
                      style={{ left: `${pct}%`, background: d.color }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          {reference && (
            <div
              className="pointer-events-none absolute -bottom-2 top-0 border-l-2 border-dashed border-mute/60"
              style={{ left: `${(reference.value / max) * 100}%` }}
            />
          )}
        </div>
        <div className="relative mt-3 h-5 t-caption text-faint tabular">
          {[0, ...ticks].map((t) => (
            <span key={t} className="absolute -translate-x-1/2" style={{ left: `${(t / max) * 100}%` }}>
              {tickLabel(t)}
            </span>
          ))}
        </div>
        {reference && (
          <p className="mt-3 t-caption text-mute">
            Dashed line: {reference.label}
            {reference.sub ? `, ${reference.sub}` : ''}
          </p>
        )}
      </div>

      <div className="sr-only">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">{columns[0]}</th>
              <th scope="col">{columns[1]}</th>
              <th scope="col">Likely range (95%)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.key}>
                <th scope="row">
                  {d.label}
                  {d.sub ? `, ${d.sub}` : ''}
                </th>
                <td>
                  {d.display ?? d.value} {unit}
                </td>
                <td>{d.lo !== undefined && d.hi !== undefined ? `${d.lo} to ${d.hi}` : 'not reported'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
