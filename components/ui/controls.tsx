'use client';
import { useId, type ReactNode } from 'react';
import Link from 'next/link';
import { SOURCES } from '@/lib/data';

/* Accessible segmented control: role="group" with aria-pressed buttons. */
export function Toggle<T extends string>({
  label,
  options,
  value,
  onChange,
  hideLabel = false,
}: {
  label: string;
  options: readonly { value: T; label: string; hint?: string; icon?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  hideLabel?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <p id={id} className={hideLabel ? 'sr-only' : 't-small mb-2 font-semibold text-mute'}>
        {label}
      </p>
      <div
        role="group"
        aria-labelledby={id}
        className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-canvas-2 p-1"
      >
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.value)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 t-small font-semibold transition-colors ${
                on ? 'bg-ink text-canvas-2' : 'text-mute hover:text-ink'
              } ${o.icon ? 'pl-1.5' : ''}`}
            >
              {o.icon}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* A wrap of pressable chips, one per data item, so every vessel is reachable by keyboard. */
export function ChipGroup({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: readonly { key: string; label: string; color?: string }[];
  value: string | null;
  onChange: (key: string | null) => void;
}) {
  const id = useId();
  return (
    <div>
      <p id={id} className="t-small mb-2 font-semibold text-mute">
        {label}
      </p>
      <div role="group" aria-labelledby={id} className="flex flex-wrap gap-2">
        {items.map((it) => {
          const on = it.key === value;
          return (
            <button
              key={it.key}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? null : it.key)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 t-small transition-colors ${
                on
                  ? 'border-ink bg-ink font-semibold text-canvas-2'
                  : 'border-line text-mute hover:border-mute hover:text-ink'
              }`}
            >
              {it.color && (
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: it.color }} />
              )}
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Labeled native select. */
export function Select({
  label,
  value,
  onChange,
  children,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  placeholder: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="t-small mb-2 block font-semibold text-mute">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-12 w-full appearance-none rounded-lg border border-line bg-canvas-2 py-2 pl-4 pr-10 t-small text-ink hover:border-mute"
        >
          <option value="">{placeholder}</option>
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 text-mute"
        >
          <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
    </div>
  );
}

/* Stepped range input with visible stops and spoken value text. An optional `thumb` draws a
   custom handle over the native one, which stays in place (invisible) for keyboard and touch. */
export function Slider({
  label,
  stops,
  index,
  onChange,
  thumb,
  accent,
  valueText,
}: {
  label: string;
  stops: readonly string[];
  index: number;
  onChange: (i: number) => void;
  thumb?: (index: number) => ReactNode;
  /** Track fill and ring color (a CSS color); defaults to the DASH green. */
  accent?: string;
  /** Fuller spoken value, e.g. "Under 6 hours a night". Defaults to the stop label. */
  valueText?: (index: number) => string;
}) {
  const id = useId();
  const pct = (index / (stops.length - 1)) * 100;
  return (
    <div>
      <label htmlFor={id} className="t-small mb-2 block font-semibold text-mute">
        {label}
      </label>
      <div className={`relative ${thumb ? 'pt-16' : ''}`}>
        {thumb && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[22px] transition-[left] duration-500 ease-out"
            style={{ left: `calc(13px + (100% - 26px) * ${pct / 100})` }}
          >
            {thumb(index)}
          </div>
        )}
        <input
          id={id}
          type="range"
          min={0}
          max={stops.length - 1}
          step={1}
          value={index}
          aria-valuetext={valueText ? valueText(index) : stops[index]}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`range w-full ${thumb ? 'range--custom' : ''}`}
          style={{ ['--fill' as string]: `${pct}%`, ...(accent ? { ['--accent' as string]: accent } : {}) }}
        />
      </div>
      <div className="mt-1 flex justify-between gap-2 t-caption text-faint" aria-hidden="true">
        {stops.map((s, i) => (
          <button
            key={s}
            type="button"
            tabIndex={-1}
            onClick={() => onChange(i)}
            className={`min-h-8 ${i === 0 ? 'text-left' : i === stops.length - 1 ? 'text-right' : 'text-center'} ${
              i === index ? 'font-semibold text-ink' : 'hover:text-mute'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* The live readout: announced politely, once per change. */
export function Readout({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div aria-live="polite" aria-atomic="true" className={`t-body text-ink ${className}`}>
      {children}
    </div>
  );
}

/* The source line every chart carries. */
export function SourceLine({ index, basis }: { index: number; basis?: string }) {
  const s = SOURCES[index];
  if (!s) return null;
  return (
    <p className="t-caption text-faint">
      {basis && <span className="block">{basis}</span>}
      Source:{' '}
      <a
        href={s.link}
        className="underline decoration-line underline-offset-4 hover:text-mute"
        target="_blank"
        rel="noreferrer"
      >
        {s.org}
        {s.year !== 'n/a' ? `, ${s.year}` : ''}
      </a>
    </p>
  );
}

/* Link to a story's deep-dive page. */
export function ReadMore({ slug, label }: { slug: string; label: string }) {
  return (
    <Link
      href={`/stories/${slug}`}
      className="group inline-flex min-h-11 items-center gap-3 rounded-full border border-line px-5 t-small font-semibold text-ink transition-colors hover:border-pulse"
    >
      <span>{label}</span>
      <svg aria-hidden="true" viewBox="0 0 24 12" className="h-3 w-6 transition-transform group-hover:translate-x-1">
        <path d="M0 6h20M15 1l5 5-5 5" fill="none" stroke="var(--pulse)" strokeWidth="1.8" />
      </svg>
    </Link>
  );
}

/* A short honesty note with a small marker. */
export function Note({ children, tone = 'link' }: { children: ReactNode; tone?: 'link' | 'cause' | 'caution' }) {
  const color = tone === 'cause' ? 'var(--dash)' : tone === 'caution' ? 'var(--diabetes)' : 'var(--mute)';
  return (
    <p className="flex gap-3 t-small text-mute">
      <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
      <span>{children}</span>
    </p>
  );
}
