'use client';
// The connective chapters: the reading guide, trend over panic, the bridge to action, and sources.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Chapter } from '@/components/layout/Chapter';
import { Readout, Toggle } from '@/components/ui/controls';
import { READING_NOTES, SOURCES } from '@/lib/data';
import { STORIES } from '@/lib/stories';
import { gsap, MOTION_OK } from '@/lib/motion';
import { useRevealChildren } from '@/lib/hooks/useReveal';

/* ---------------- How to read ---------------- */

export function ReadingGuide() {
  const ref = useRef<HTMLElement>(null);
  useRevealChildren(ref);
  const notes = [
    { title: 'Two measuring sticks', body: READING_NOTES.thresholds, color: 'var(--reg-americas)' },
    { title: 'Surveys show a link', body: READING_NOTES.surveys, color: 'var(--mute)' },
    { title: 'One real experiment', body: READING_NOTES.trial, color: 'var(--dash)' },
  ];
  return (
    <section
      id="how-to-read"
      ref={ref}
      aria-labelledby="how-title"
      className="scroll-mt-20 border-t border-line bg-canvas-2 py-16 md:py-20"
    >
      <div className="mx-auto max-w-[1040px] px-6">
        <h2 id="how-title" data-reveal className="t-small font-semibold text-mute">
          How to read the numbers
        </h2>
        <ul className="mt-8 grid gap-8 md:grid-cols-3">
          {notes.map((n) => (
            <li key={n.title} data-reveal className="border-l-2 pl-5" style={{ borderColor: n.color }}>
              <p className="t-small font-semibold text-ink">{n.title}</p>
              <p className="mt-2 t-small text-mute">{n.body}</p>
            </li>
          ))}
        </ul>
        <p data-reveal className="mt-8 t-small text-mute">
          Every number is shown as people out of 100: picture a room of 100 adults.
        </p>
      </div>
    </section>
  );
}

/* ---------------- Trend, not panic ---------------- */

// An example two weeks of morning readings, made up to illustrate the idea. Not data.
const EXAMPLE = [132, 128, 135, 130, 127, 158, 131, 129, 126, 130, 127, 125, 128, 124];
const SPIKE = EXAMPLE.indexOf(158);

function TrendLine() {
  const ref = useRef<SVGSVGElement>(null);
  const W = 640;
  const H = 260;
  const x = (i: number) => 30 + (i / (EXAMPLE.length - 1)) * (W - 60);
  const y = (v: number) => H - 30 - ((v - 110) / (165 - 110)) * (H - 60);
  const d = EXAMPLE.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const avg = EXAMPLE.reduce((a, b) => a + b, 0) / EXAMPLE.length;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.fromTo(
        el.querySelector('.tl-path'),
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out' },
      );
      gsap.fromTo(
        el.querySelectorAll('.tl-dot'),
        { opacity: 0 },
        { opacity: 1, stagger: 0.06, duration: 0.3, delay: 0.2 },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`An example of two weeks of morning readings. The top number stays around ${Math.round(avg)} with one spike to 158 on day ${SPIKE + 1}, then settles back. Example values for illustration only.`}
    >
      <rect x="20" y={y(135)} width={W - 40} height={y(125) - y(135)} rx="6" fill="var(--teal)" opacity="0.12" />
      <line x1="20" x2={W - 20} y1={y(avg)} y2={y(avg)} stroke="var(--teal)" strokeDasharray="5 6" strokeWidth="1.5" />
      <text x={W - 24} y={y(avg) - 10} textAnchor="end" fontSize="16" fill="var(--teal)" fontWeight="600">
        usual level
      </text>
      <path
        className="tl-path"
        d={d}
        pathLength={1}
        strokeDasharray="1 1"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {EXAMPLE.map((v, i) => (
        <circle
          key={i}
          className="tl-dot"
          cx={x(i)}
          cy={y(v)}
          r={i === SPIKE ? 7 : 4}
          fill={i === SPIKE ? 'var(--pulse)' : 'var(--ink)'}
          stroke="var(--canvas)"
          strokeWidth="2"
        />
      ))}
      <text x={x(SPIKE)} y={y(158) - 16} textAnchor="middle" fontSize="16" fill="var(--pulse)" fontWeight="600">
        the 158/96 moment
      </text>
      <text x={x(0)} y={H - 4} fontSize="15" fill="var(--faint)">
        day 1
      </text>
      <text x={x(EXAMPLE.length - 1)} y={H - 4} fontSize="15" fill="var(--faint)" textAnchor="end">
        day 14
      </text>
    </svg>
  );
}

export function Trend() {
  const [view, setView] = useState<'single' | 'trend'>('single');
  return (
    <Chapter
      id="trend"
      eyebrow="Trend, not panic"
      accent="var(--teal)"
      title="The line matters more than the moment"
      lede={
        <p>
          Most people meet high blood pressure as one number on one day. One number is a snapshot. The line tells the
          story.
        </p>
      }
    >
      <div className="mt-12 space-y-8" data-reveal>
        <Toggle
          label="Look at"
          value={view}
          onChange={setView}
          options={[
            { value: 'single', label: 'A single reading' },
            { value: 'trend', label: 'The trend' },
          ]}
        />
        <div className="grid items-center gap-10 rounded-2xl border border-line bg-canvas-2 p-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:p-10">
          <div className="min-h-[220px]">
            {view === 'single' ? (
              <p
                className="t-hero text-pulse tabular"
                aria-hidden="true"
                style={{ fontSize: 'clamp(4rem, 2rem + 9vw, 9rem)' }}
              >
                158<span className="text-mute">/</span>96
              </p>
            ) : (
              <TrendLine />
            )}
          </div>
          <Readout>
            {view === 'single' ? (
              <>
                <strong>158/96.</strong> On its own, it looks alarming. But one reading can be pushed up by a rushed
                arrival, stress, caffeine, or a cuff that does not fit. It is often just a bad moment.
              </>
            ) : (
              <>
                <strong>The trend.</strong> Over two weeks, the same person sits close to their usual level. The 158 was
                one bad morning. The steady line is what matters, and what a doctor wants to see.
              </>
            )}
          </Readout>
        </div>
        <p className="t-caption text-faint">
          The readings in this chapter are an example made up to explain the idea. They are not real patient data.
        </p>
      </div>
    </Chapter>
  );
}

/* ---------------- How a reading works ---------------- */

// Facts about measurement, not instructions: nothing here assumes the reader has high blood pressure.
const FACTS: { title: string; body: string; icon: 'cuff' | 'clock' | 'line' }[] = [
  {
    title: 'Cuff size changes the number',
    body: 'A cuff that is too small for the upper arm tends to read high. Cuffs come in sizes matched to arm size.',
    icon: 'cuff',
  },
  {
    title: 'Conditions change the number',
    body: 'Readings settle after a few quiet minutes of rest, seated, feet flat, with the arm supported at heart height.',
    icon: 'clock',
  },
  {
    title: 'Many readings show more than one',
    body: 'Blood pressure moves through the day. Readings taken over days show a pattern that a single visit cannot.',
    icon: 'line',
  },
];

function FactIcon({ icon }: { icon: 'cuff' | 'clock' | 'line' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="h-8 w-8 shrink-0"
      fill="none"
      stroke="var(--teal)"
      strokeWidth="2"
    >
      {icon === 'cuff' && (
        <>
          <rect x="5" y="9" width="22" height="14" rx="4" />
          <path d="M11 9v14M21 9v14" strokeOpacity="0.6" />
        </>
      )}
      {icon === 'clock' && (
        <>
          <circle cx="16" cy="16" r="11" />
          <path d="M16 10v6l4 3" strokeLinecap="round" />
        </>
      )}
      {icon === 'line' && <path d="M4 20h6l3-8 4 12 3-6h8" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

export function Bridge() {
  return (
    <Chapter
      id="act"
      eyebrow="How a reading works"
      accent="var(--pulse)"
      title="A number is a moment. A pattern takes many."
      lede={
        <p>
          Blood pressure is measured in two numbers: the push of each heartbeat (the top number) and the pressure that
          remains between beats (the bottom number). Both move from minute to minute.
        </p>
      }
    >
      <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
        <div data-reveal className="rounded-2xl bg-pulse p-8 text-on-pulse md:p-10">
          <p className="t-h3">Readings at home</p>
          <p className="mt-4 t-body">
            Home monitors make it possible to take many readings over days and weeks, in a calm and familiar place.
            Together they show a pattern, which is what clinicians look at alongside office readings.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/monitoring-your-blood-pressure-at-home"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center rounded-full bg-canvas-2 px-6 t-small font-semibold text-ink hover:bg-canvas"
            >
              How home measurement works (American Heart Association)
            </a>
            <a
              href="https://www.validatebp.org/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center rounded-full border-2 border-on-pulse px-6 t-small font-semibold text-on-pulse hover:bg-on-pulse/10"
            >
              Validated home monitors (U.S.)
            </a>
          </div>
        </div>
        <ul data-reveal className="space-y-7">
          {FACTS.map((f) => (
            <li key={f.title} className="flex gap-4">
              <FactIcon icon={f.icon} />
              <div>
                <p className="t-small font-semibold text-ink">{f.title}</p>
                <p className="mt-1 t-small text-mute">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p data-reveal className="mt-12 max-w-[680px] t-small text-mute">
        This site is the public side of <strong className="text-ink">Pressure Pilot</strong>, an MFA thesis on home
        blood pressure self-monitoring: a way to move from a single number to a readable pattern.
      </p>
    </Chapter>
  );
}

/* ---------------- Sources ---------------- */

const SURVEYS = [
  { name: 'NHANES, National Health and Nutrition Examination Survey', href: 'https://www.cdc.gov/nchs/nhanes' },
  { name: 'NHIS, National Health Interview Survey', href: 'https://www.cdc.gov/nchs/nhis' },
  { name: 'BRFSS, Behavioral Risk Factor Surveillance System', href: 'https://www.cdc.gov/brfss' },
];

export function Sources() {
  return (
    <footer
      id="sources"
      aria-labelledby="sources-title"
      className="scroll-mt-20 border-t border-line bg-canvas-2 py-20"
    >
      <div className="mx-auto max-w-[1040px] px-6">
        <h2 id="sources-title" className="t-h3 text-ink">
          Sources
        </h2>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {SOURCES.map((s, i) => {
            const story = STORIES[i];
            return (
              <li
                key={s.module}
                className="grid gap-1 py-4 md:grid-cols-[200px_minmax(0,1fr)_auto] md:items-baseline md:gap-6"
              >
                <p className="t-small font-semibold text-ink">{s.module}</p>
                <a
                  href={s.link}
                  target="_blank"
                  rel="noreferrer"
                  className="t-small text-mute underline decoration-line underline-offset-4 hover:text-ink"
                >
                  {s.org}
                  {s.year !== 'n/a' ? `, ${s.year}` : ''}
                </a>
                {story && (
                  <Link href={`/stories/${story.slug}`} className="t-small text-faint hover:text-ink">
                    Full story
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-10 t-small font-semibold text-mute">The surveys underneath</p>
        <ul className="mt-3 space-y-2">
          {SURVEYS.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="t-small text-mute underline decoration-line underline-offset-4 hover:text-ink"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-14 grid gap-6 border-t border-line pt-8 t-small text-faint md:grid-cols-2">
          <p>
            This is information design, not medical advice. Questions about a specific reading belong with a doctor or
            nurse.
          </p>
          <p className="md:text-right">
            Between the Beats, by Emmanuel Olubodun. MFA Interaction Design, Purdue. AD 609, Project 2. Based on the
            poster &ldquo;The Pressure We Live In.&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
}
