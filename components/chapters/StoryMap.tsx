'use client';
import { useEffect, useRef } from 'react';
import { CoreGlyph } from '@/components/core/PulseCore';
import { STORIES } from '@/lib/stories';
import { gsap, MOTION_OK } from '@/lib/motion';
import { r2 } from '@/lib/scales';

const W = 1000;
const H = 660;
const CX = W / 2;
const CY = H / 2;
const RX = 330;
const RY = 228;

/** Node position on an ellipse; 0 degrees is straight up, clockwise. */
function at(deg: number, k = 1): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r2(CX + RX * k * Math.cos(a)), r2(CY + RY * k * Math.sin(a))];
}

const ANGLES = STORIES.map((_, i) => -64 + (i * 360) / STORIES.length);

/**
 * The poster in one picture: seven stories branching from one core. Each node is a link
 * to its chapter. The vessels grow with scroll; under reduced motion they are simply drawn.
 */
export function StoryMap() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const q = gsap.utils.selector(el);
      gsap.set(q('.sm-vessel'), { strokeDashoffset: 1 });
      gsap.set(q('.sm-node'), { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' });
      gsap.set(q('.sm-label'), { opacity: 0, y: 10 });
      gsap
        .timeline({
          scrollTrigger: { trigger: q('.sm-stage')[0], start: 'top 80%', end: 'center 55%', scrub: 0.8 },
        })
        .to(q('.sm-vessel'), { strokeDashoffset: 0, stagger: 0.12, duration: 1, ease: 'none' })
        .to(q('.sm-node'), { opacity: 1, scale: 1, stagger: 0.12, duration: 0.4 }, 0.6)
        .to(q('.sm-label'), { opacity: 1, y: 0, stagger: 0.12, duration: 0.4 }, 0.7);
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="stories" ref={ref} aria-labelledby="stories-title" className="scroll-mt-20 bg-canvas-2 pb-24 md:pb-32">
      <div className="mx-auto max-w-[1040px] px-6">
        <h2 id="stories-title" className="t-h3 max-w-[620px] text-ink">
          Seven stories branch from one pulse. Read them in order, or jump to any one.
        </h2>

        {/* wide screens: the radial picture with linked nodes */}
        <div className="sm-stage relative mt-10 hidden md:block">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true" focusable="false">
            <ellipse cx={CX} cy={CY} rx={RX * 0.62} ry={RY * 0.62} fill="none" stroke="var(--line)" />
            <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="var(--line)" strokeDasharray="4 8" />
            {STORIES.map((s, i) => {
              const a = ANGLES[i]!;
              const [x, y] = at(a);
              const [mx, my] = at(a - 14, 0.55);
              const [sx, sy] = at(a, 0.2);
              return (
                <g key={s.slug}>
                  <path
                    className="sm-vessel"
                    d={`M${sx},${sy} Q${mx},${my} ${x},${y}`}
                    pathLength={1}
                    strokeDasharray="1 1"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeOpacity="0.85"
                  />
                  <g className="sm-node">
                    <circle cx={x} cy={y} r="22" fill={s.color} opacity="0.18" />
                    <circle cx={x} cy={y} r="9" fill={s.color} stroke="var(--canvas-2)" strokeWidth="3" />
                  </g>
                </g>
              );
            })}
            <CoreGlyph x={CX} y={CY} r={58} />
          </svg>
          <ol>
            {STORIES.map((s, i) => {
              const a = ANGLES[i]!;
              const [x, y] = at(a);
              const right = x >= CX;
              const nearTop = y < CY - RY * 0.7;
              const nearBottom = y > CY + RY * 0.7;
              return (
                <li
                  key={s.slug}
                  className="sm-label absolute w-[220px]"
                  style={{
                    left: `${(x / W) * 100}%`,
                    top: `${(y / H) * 100}%`,
                    transform: `translate(${right ? '28px' : 'calc(-100% - 28px)'}, ${
                      nearTop ? '-80%' : nearBottom ? '-20%' : '-50%'
                    })`,
                    textAlign: right ? 'left' : 'right',
                  }}
                >
                  <a href={`#${s.anchor}`} className="group block rounded-md p-1">
                    <span className="block t-caption text-faint tabular">{String(i + 1).padStart(2, '0')}</span>
                    <span className="block t-small font-semibold text-ink group-hover:text-pulse">{s.short}</span>
                    <span className="block t-caption text-mute">{s.question}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>

        {/* phones: the same seven links as a list of short vessels */}
        <ol className="mt-10 space-y-2 md:hidden">
          {STORIES.map((s, i) => (
            <li key={s.slug}>
              <a href={`#${s.anchor}`} className="flex min-h-14 items-center gap-4 rounded-lg py-2">
                <span aria-hidden="true" className="flex w-16 shrink-0 items-center">
                  <span
                    className="h-1 flex-1 rounded-full"
                    style={{ background: `linear-gradient(90deg, var(--pulse-deep), ${s.color})` }}
                  />
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-canvas-2" style={{ background: s.color }} />
                </span>
                <span>
                  <span className="block t-small font-semibold text-ink">
                    <span className="sr-only">Story {i + 1}: </span>
                    {s.short}
                  </span>
                  <span className="block t-caption text-mute">{s.question}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
