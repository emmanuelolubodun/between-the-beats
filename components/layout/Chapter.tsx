'use client';
import { useRef, type ReactNode } from 'react';
import { useRevealChildren } from '@/lib/hooks/useReveal';

interface ChapterProps {
  id: string;
  /** Short context line above the title, e.g. "Where it is". Sentence case. */
  eyebrow?: string;
  /** Accent for the small rule beside the eyebrow (poster style). */
  accent?: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Section shell: hairline above, generous rhythm, staggered reveal of [data-reveal] items. */
export function Chapter({ id, eyebrow, accent = 'var(--pulse)', title, lede, children, className = '' }: ChapterProps) {
  const ref = useRef<HTMLElement>(null);
  useRevealChildren(ref);
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      ref={ref}
      aria-labelledby={headingId}
      className={`scroll-mt-20 border-t border-line py-24 md:py-[120px] ${className}`}
    >
      <div className="mx-auto max-w-[1040px] px-6">
        <header className="max-w-[680px]">
          {eyebrow && (
            <p data-reveal className="mb-4 flex items-center gap-3 t-small font-semibold text-mute">
              <span aria-hidden="true" className="h-5 w-[3px] rounded-full" style={{ background: accent }} />
              {eyebrow}
            </p>
          )}
          <h2 id={headingId} data-reveal className="t-h2 text-ink">
            {title}
          </h2>
          {lede && (
            <div data-reveal className="mt-6 t-body text-mute">
              {lede}
            </div>
          )}
        </header>
        {children}
      </div>
    </section>
  );
}

/** Two columns on wide screens: a sticky text and control rail, and the chart. */
export function StoryGrid({ rail, chart }: { rail: ReactNode; chart: ReactNode }) {
  return (
    <div className="mt-14 grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14">
      <div className="space-y-8 md:sticky md:top-24 md:self-start" data-reveal>
        {rail}
      </div>
      <div data-reveal className="order-first md:order-none">
        {chart}
      </div>
    </div>
  );
}
