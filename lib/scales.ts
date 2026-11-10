// Shared scale and radial math. D3 is used for math only; React renders the SVG.
import { scaleLinear, type ScaleLinear } from 'd3-scale';

export const rad = (deg: number): number => ((deg - 90) * Math.PI) / 180;

/** Round to 2 decimals so server and browser math produce identical SVG attributes. */
export const r2 = (v: number): number => Math.round(v * 100) / 100;

/** Point on a circle. 0 degrees is straight up, clockwise. */
export function pol(cx: number, cy: number, r: number, deg: number): [number, number] {
  return [r2(cx + r * Math.cos(rad(deg))), r2(cy + r * Math.sin(rad(deg)))];
}

/** Value (percent) to radius for the radial map. */
export function radiusScale(domain: [number, number], range: [number, number]): ScaleLinear<number, number> {
  return scaleLinear().domain(domain).range(range).clamp(true);
}

/** Value to length for horizontal vessels. Always starts at zero so length stays honest. */
export function lengthScale(max: number, width: number): ScaleLinear<number, number> {
  return scaleLinear().domain([0, max]).range([0, width]).clamp(true);
}

/** SVG arc path between two angles at radius r. */
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const [x0, y0] = pol(cx, cy, r, a0);
  const [x1, y1] = pol(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1}`;
}
