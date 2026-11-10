import { useId } from 'react';
import { ecgPath } from './EcgTrace';

// The trace inside the core: the same heartbeat, small, scrolling in time with the beat.
const INNER_PERIOD = 64;
const INNER_PATH = ecgPath(INNER_PERIOD, 22, 3);

interface CoreGlyphProps {
  /** Radius of the filled core in SVG units. */
  r?: number;
  ecg?: boolean;
  beating?: boolean;
  x?: number;
  y?: number;
}

/** The core as an SVG group, for use inside a larger chart. Decorative. */
export function CoreGlyph({ r = 50, ecg = true, beating = true, x = 0, y = 0 }: CoreGlyphProps) {
  const id = useId().replace(/:/g, '');
  const k = r / 50;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} aria-hidden="true">
      <defs>
        <radialGradient id={`glow-${id}`}>
          <stop offset="0.35" style={{ stopColor: 'var(--pulse)', stopOpacity: 0.35 }} />
          <stop offset="1" style={{ stopColor: 'var(--pulse)', stopOpacity: 0 }} />
        </radialGradient>
        <clipPath id={`clip-${id}`}>
          <circle r="38" />
        </clipPath>
        <radialGradient id={`fill-${id}`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" style={{ stopColor: 'var(--pulse)' }} />
          <stop offset="1" style={{ stopColor: 'var(--pulse-deep)' }} />
        </radialGradient>
      </defs>
      <circle r="108" fill={`url(#glow-${id})`} />
      {beating && (
        <>
          <circle r="50" className="pulse-ring" fill="none" stroke="var(--pulse)" strokeWidth="1.2" />
          <circle r="50" className="pulse-ring pulse-ring--late" fill="none" stroke="var(--pulse)" strokeWidth="1" />
        </>
      )}
      <circle r="62" fill="none" stroke="var(--pulse)" strokeOpacity="0.18" strokeWidth="1" />
      <circle r="74" fill="none" stroke="var(--pulse)" strokeOpacity="0.1" strokeWidth="1" />
      <g className={beating ? 'pulse-beat' : undefined}>
        <circle r="50" fill={`url(#fill-${id})`} />
        <circle r="50" fill="none" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="1.5" />
        {ecg && (
          <g clipPath={`url(#clip-${id})`}>
            <g
              className={beating ? 'ecg-scroll' : undefined}
              style={{ ['--ecg-shift' as string]: `${-INNER_PERIOD}px` }}
            >
              <path
                d={INNER_PATH}
                fill="none"
                stroke="var(--on-pulse)"
                strokeWidth="3.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          </g>
        )}
      </g>
    </g>
  );
}

interface PulseCoreProps extends Omit<CoreGlyphProps, 'r' | 'x' | 'y'> {
  /** Rendered diameter of the filled core in px (the glow extends beyond it). */
  size?: number;
  className?: string;
}

/**
 * The signature pulsing core as a standalone graphic. Purely decorative: the meaning
 * always lives in nearby text. The heartbeat stops under reduced motion (globals.css).
 */
export function PulseCore({ size = 160, className = '', ...rest }: PulseCoreProps) {
  const box = size * 2.2;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={box}
      height={box}
      viewBox="-110 -110 220 220"
      className={`overflow-visible ${className}`}
    >
      <CoreGlyph {...rest} />
    </svg>
  );
}
