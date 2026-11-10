// A moving ECG: a repeating heartbeat waveform that scrolls like a bedside monitor.
// One period scrolls past every 1.6s, the same length as the core's heartbeat, and the
// animation is offset so each spike leaves the core just as it swells. Still under reduced motion.

/** One heartbeat in a 360-unit period, spike at x = 0: P wave, QRS spike, T wave. */
const BEAT: [number, number][] = [
  [-70, 0],
  [-62, -5],
  [-54, 0],
  [-16, 0],
  [-10, 8],
  [-3, -58],
  [5, 38],
  [11, 0],
  [38, 0],
  [52, -12],
  [66, 0],
];
const BASE_PERIOD = 360;

/** Path for `count` periods either side of 0, scaled to the given period and height. */
export function ecgPath(period: number, height: number, count: number): string {
  const sx = period / BASE_PERIOD;
  const sy = height / 58;
  const pts: string[] = [];
  for (let k = -count; k <= count; k++) {
    const o = k * period;
    pts.push(`${(o - period / 2).toFixed(1)},0`);
    for (const [x, y] of BEAT) pts.push(`${(o + x * sx).toFixed(1)},${(y * sy).toFixed(1)}`);
  }
  pts.push(`${(count * period + period / 2).toFixed(1)},0`);
  return `M${pts.join(' L')}`;
}

const PERIOD = 360;
const WIDE_PATH = ecgPath(PERIOD, 52, 7);

/** The full-width trace behind the hero core. Decorative. */
export function EcgTrace({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" width="100%" height="140" className={`ecg-fade ${className}`}>
      <svg x="50%" y="70" overflow="visible">
        <g className="ecg-scroll" style={{ ['--ecg-shift' as string]: `${-PERIOD}px` }}>
          <path
            d={WIDE_PATH}
            fill="none"
            stroke="var(--pulse)"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </svg>
  );
}
