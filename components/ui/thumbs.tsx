'use client';
// Picture handles for the Slider. Each one sits on the track at (0, 0) and draws upward,
// and each one says its value with a small moving detail: grains, z's, speed lines, a tipping beam.
import { useId } from 'react';
import type { Diet, Salt } from '@/lib/data';

/* ---------------- Salt: a shaker that pours more as salt rises ---------------- */

// Tilt (degrees, clockwise) and grains per salt level: high salt pours hard, low salt barely tips.
const POUR: Record<Salt, { tilt: number; grains: number }> = {
  high: { tilt: 140, grains: 8 },
  medium: { tilt: 108, grains: 4 },
  low: { tilt: 28, grains: 1 },
};

export function SaltShaker({ salt }: { salt: Salt }) {
  const { tilt, grains } = POUR[salt];
  const rad = (tilt * Math.PI) / 180;
  // Where the cap ends up after tilting (the shaker rotates about its middle, 30px above the track).
  const capX = 21 * Math.sin(rad);
  const capY = -21 * Math.cos(rad);
  return (
    <div className="relative" style={{ width: 0, height: 0 }}>
      <svg
        viewBox="-16 -24 32 48"
        width="30"
        height="45"
        className="absolute overflow-visible transition-transform duration-500 ease-out"
        style={{ left: -15, top: -52, transform: `rotate(${tilt}deg)` }}
      >
        <rect x="-11" y="-21" width="22" height="12" rx="5" fill="var(--mute)" />
        <circle cx="-5" cy="-17" r="1.3" fill="var(--canvas-2)" />
        <circle cx="0" cy="-18" r="1.3" fill="var(--canvas-2)" />
        <circle cx="5" cy="-17" r="1.3" fill="var(--canvas-2)" />
        <rect x="-13" y="-10" width="26" height="31" rx="7" fill="var(--panel)" stroke="var(--ink)" strokeWidth="2" />
        <path d="M-7 2h14M-7 9h10" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {Array.from({ length: grains }, (_, i) => (
        <span
          key={`${salt}-${i}`}
          className="salt-grain absolute h-1.5 w-1.5 rounded-full bg-ink"
          style={{
            left: capX - 3 + ((i * 5) % 9) - 4,
            top: -30 + capY,
            animationDelay: `${(i * 0.13).toFixed(2)}s`,
            ['--drift' as string]: `${((i % 3) - 1) * 3}px`,
            ['--fall' as string]: `${Math.max(8, 26 - capY)}px`,
          }}
        />
      ))}
    </div>
  );
}

export function PlateIcon({ diet }: { diet: Diet }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8 shrink-0">
      <circle cx="16" cy="16" r="14.5" fill="var(--panel)" stroke="var(--line)" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="var(--line)" strokeWidth="1" />
      {diet === 'typical' ? (
        <>
          <ellipse cx="13" cy="17" rx="6" ry="4.2" fill="var(--pulse-deep)" />
          <path
            d="M18 10l2 8M20.5 9.5l1.4 8.5M23 11l.6 7"
            stroke="var(--diabetes)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path d="M9 18c2-6 7-8 9-7-1 4-5 8-9 7Z" fill="var(--teal)" />
          <path d="M14 20c3-4 7-5 9-4-2 3-6 5-9 4Z" fill="var(--dash)" />
          <path d="M18 9.5l5 3.2" stroke="var(--reg-seasia)" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="12" cy="11.5" r="1.4" fill="var(--diabetes)" />
          <circle cx="15" cy="10" r="1.4" fill="var(--diabetes)" />
        </>
      )}
    </svg>
  );
}

/* ---------------- Sleep: a moon that fills, with more z's drifting up for longer nights ---------------- */

// 0 = under 6 hours, 1 = 7 to 8 hours (the sweet spot), 2 = 10 hours or more.
const NIGHT = [
  { cut: 9, zs: 1 },
  { cut: 4, zs: 3 },
  { cut: -2, zs: 5 },
] as const;

export function SleepMoon({ level }: { level: number }) {
  const n = NIGHT[level] ?? NIGHT[0];
  const sweet = level === 1;
  const maskId = `moon-${useId().replace(/:/g, '')}`;
  return (
    <div className="relative" style={{ width: 0, height: 0 }}>
      <svg
        viewBox="-20 -20 40 40"
        width="48"
        height="48"
        className="absolute overflow-visible"
        style={{ left: -24, top: -54 }}
      >
        {sweet && <circle r="18" fill="var(--teal)" opacity="0.22" className="moon-glow" />}
        <mask id={maskId}>
          <rect x="-20" y="-20" width="40" height="40" fill="white" />
          {/* the shadow that carves the crescent; it slides off as the night gets longer */}
          <circle cx={n.cut} cy={-3} r="12" fill="black" className="transition-[cx] duration-500 ease-out" />
        </mask>
        <circle r="13" fill="var(--panel)" stroke="var(--line)" strokeWidth="1.5" opacity="0.6" />
        <circle r="13" fill="var(--diabetes)" mask={`url(#${maskId})`} />
        <circle cx="-4" cy="5" r="1.6" fill="var(--canvas-2)" opacity="0.25" />
      </svg>
      {Array.from({ length: n.zs }, (_, i) => (
        <span
          key={`${level}-${i}`}
          className="sleep-z absolute font-bold text-mute"
          style={{
            left: 14 + (i % 2) * 7,
            top: -54,
            fontSize: `${14 + (i % 3) * 2}px`,
            animationDelay: `${(i * 0.42).toFixed(2)}s`,
            ['--drift' as string]: `${8 + (i % 3) * 4}px`,
          }}
        >
          z
        </span>
      ))}
    </div>
  );
}

/* ---------------- Activity: a sneaker that leans in and picks up speed ---------------- */

// 0 = barely active, 1 = active, 2 = very active.
const STRIDE = [
  { tilt: 0, lines: 0, bob: false },
  { tilt: -10, lines: 2, bob: true },
  { tilt: -20, lines: 4, bob: true },
] as const;

export function ActivityShoe({ level }: { level: number }) {
  const s = STRIDE[level] ?? STRIDE[0];
  return (
    <div className="relative" style={{ width: 0, height: 0 }}>
      <div
        className={`absolute ${s.bob ? 'shoe-bob' : ''}`}
        style={{ left: -28, top: -48, ['--bob-speed' as string]: level === 2 ? '0.45s' : '0.8s' }}
      >
        <svg
          viewBox="-21 -14 42 28"
          width="56"
          height="37"
          className="overflow-visible transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${s.tilt}deg)`, transformOrigin: '70% 90%' }}
        >
          {/* upper, sole and laces of a running shoe, toe pointing right */}
          <path
            d="M-17 5C-18-3-14-9-8-9h4c1 4 5 6 11 7 7 1 11 3 11 7Z"
            fill="var(--teal)"
            stroke="var(--ink)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <rect
            x="-18.5"
            y="4"
            width="38"
            height="5.5"
            rx="2.75"
            fill="var(--panel)"
            stroke="var(--ink)"
            strokeWidth="1.8"
          />
          <path d="M-3-5l3 2M0-6.5l3 2M3-3.5l3 1.5" stroke="var(--on-pulse)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="-12" cy="-3" r="1.6" fill="var(--on-pulse)" />
        </svg>
      </div>
      {Array.from({ length: s.lines }, (_, i) => (
        <span
          key={`${level}-${i}`}
          className="speed-line absolute h-[2px] rounded-full bg-mute"
          style={{
            left: -44 - (i % 2) * 4,
            top: -38 + i * 6,
            width: 10 + (i % 2) * 4,
            animationDelay: `${(i * 0.12).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- Men and women: a balance that tips by the size of the gap ---------------- */

/** `gap` is the men-minus-women difference in points; the beam tips toward the heavier side. */
export function GapScale({ gap }: { gap: number }) {
  const deg = Math.min(30, gap * 2.2);
  const rad = (deg * Math.PI) / 180;
  const L = 22;
  // beam ends after tipping: the men's end (left) goes down
  const lx = -L * Math.cos(rad);
  const ly = L * Math.sin(rad);
  const rx = L * Math.cos(rad);
  const ry = -L * Math.sin(rad);
  const pan = (x: number, y: number, fill: string, letter: string) => (
    <g style={{ transform: `translate(${x}px, ${y}px)` }} className="transition-transform duration-700 ease-out">
      <path d="M0 0L-7 11M0 0L7 11" stroke="var(--mute)" strokeWidth="1" />
      <path d="M-9 11h18a9 6 0 0 1-18 0Z" fill={fill} />
      <text y="15.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--on-pulse)">
        {letter}
      </text>
    </g>
  );
  return (
    <div className="relative" style={{ width: 0, height: 0 }}>
      <svg
        viewBox="-34 -46 68 50"
        width="80"
        height="59"
        className="absolute overflow-visible"
        style={{ left: -40, top: -59 }}
      >
        <path d="M0-36V0M-8 0h16" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
        <g transform="translate(0 -36)">
          <line
            x1={-L}
            y1={0}
            x2={L}
            y2={0}
            stroke="var(--ink)"
            strokeWidth="2.4"
            strokeLinecap="round"
            style={{ transform: `rotate(${-deg}deg)` }}
            className="transition-transform duration-700 ease-out"
          />
          {pan(lx, ly, 'var(--pulse)', 'M')}
          {pan(rx, ry, 'var(--women)', 'W')}
          <circle r="2.6" fill="var(--ink)" />
        </g>
      </svg>
    </div>
  );
}
