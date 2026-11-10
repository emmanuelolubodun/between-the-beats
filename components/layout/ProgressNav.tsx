'use client';
import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SECTIONS, type SectionGroup } from '@/lib/stories';
import { useActiveSection } from '@/lib/hooks/useReveal';
import { ThemeToggle } from './ThemeToggle';

const IDS = SECTIONS.map((s) => s.id);
const NONE: readonly string[] = [];
const GROUPS: readonly SectionGroup[] = ['Begin', 'The seven stories', 'After the stories'];
const pad = (n: number) => String(n).padStart(2, '0');

/** Move keyboard and screen-reader focus to a section after jumping to it, without a second scroll. */
function focusSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/**
 * The section menu: a button that always names where the reader is, and opens a numbered,
 * grouped list of every section, so any part of the page is one or two moves away.
 */
function SectionMenu({ onHome, active }: { onHome: boolean; active: string | null }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const activeIndex = SECTIONS.findIndex((s) => s.id === active);
  const current = activeIndex >= 0 ? SECTIONS[activeIndex] : undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    // Start keyboard users on the current section (or the first one).
    const start =
      wrapRef.current?.querySelector<HTMLAnchorElement>('[aria-current="location"]') ??
      wrapRef.current?.querySelector<HTMLAnchorElement>('[data-section-link]');
    start?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // Arrow keys move through the list; Home and End jump to its ends.
  const onListKey = (e: React.KeyboardEvent) => {
    const links = Array.from(wrapRef.current?.querySelectorAll<HTMLAnchorElement>('[data-section-link]') ?? []);
    const at = links.indexOf(document.activeElement as HTMLAnchorElement);
    let next = -1;
    if (e.key === 'ArrowDown') next = Math.min(links.length - 1, at + 1);
    else if (e.key === 'ArrowUp') next = Math.max(0, at - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = links.length - 1;
    if (next >= 0) {
      e.preventDefault();
      links[next]?.focus();
    }
  };

  return (
    <div ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 items-center gap-3 rounded-full border border-line bg-canvas-2 py-1 pl-3 pr-4 t-small font-semibold text-ink hover:border-mute"
      >
        <svg aria-hidden="true" viewBox="0 0 16 12" className="h-3 w-4 text-mute">
          <path d="M1 1h14M1 6h14M1 11h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span>Sections</span>
        {onHome && current && (
          <span className="hidden items-center gap-2 border-l border-line pl-3 font-normal text-mute sm:flex">
            <span className="tabular text-faint">{pad(activeIndex + 1)}</span>
            <span className="max-w-[16ch] truncate">{current.label}</span>
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          onKeyDown={onListKey}
          className="absolute right-4 top-full mt-2 max-h-[min(70vh,640px)] w-[min(360px,calc(100vw-32px))] sm:right-6 overflow-y-auto rounded-2xl border border-line bg-canvas-2 p-3 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.5)]"
        >
          <p className="px-3 pb-2 pt-1 t-caption text-faint">
            {SECTIONS.length} sections. Arrow keys move through the list, Escape closes it.
          </p>
          {GROUPS.map((group) => (
            <div key={group} className="mt-2 first-of-type:mt-0">
              <p className="px-3 py-1.5 t-caption font-semibold uppercase tracking-wide text-faint">{group}</p>
              <ul>
                {SECTIONS.map((s, i) => {
                  if (s.group !== group) return null;
                  const on = onHome && s.id === active;
                  return (
                    <li key={s.id}>
                      <a
                        data-section-link
                        href={onHome ? `#${s.id}` : `/#${s.id}`}
                        aria-current={on ? 'location' : undefined}
                        onClick={() => {
                          setOpen(false);
                          if (onHome) focusSection(s.id);
                        }}
                        className={`flex min-h-11 items-center gap-3 rounded-lg px-3 t-small transition-colors ${
                          on ? 'bg-panel font-semibold text-ink' : 'text-mute hover:bg-panel/70 hover:text-ink'
                        }`}
                      >
                        <span className="w-6 tabular text-faint">{pad(i + 1)}</span>
                        <span
                          aria-hidden="true"
                          className="h-4 w-[3px] shrink-0 rounded-full"
                          style={{ background: s.color ?? 'var(--line)' }}
                        />
                        <span className="flex-1">{s.label}</span>
                        {on && (
                          <span className="flex items-center gap-1.5 t-caption font-normal text-pulse">
                            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-pulse" />
                            Now reading
                          </span>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Small previous/next steppers so the neighbouring sections are one press away. */
function SectionSteps({ active }: { active: string | null }) {
  const at = SECTIONS.findIndex((s) => s.id === active);
  const prev = at > 0 ? SECTIONS[at - 1] : undefined;
  const next = at >= 0 ? SECTIONS[at + 1] : SECTIONS[1];
  const step = (s: (typeof SECTIONS)[number] | undefined, dir: 'up' | 'down') => {
    const label = s ? `${dir === 'up' ? 'Previous' : 'Next'} section: ${s.label}` : undefined;
    return (
      <a
        href={s ? `#${s.id}` : undefined}
        aria-label={label}
        aria-disabled={!s}
        title={label}
        onClick={() => s && focusSection(s.id)}
        className={`flex h-11 w-9 items-center justify-center rounded-full text-mute ${
          s ? 'hover:bg-panel hover:text-ink' : 'pointer-events-none opacity-30'
        }`}
      >
        <svg aria-hidden="true" viewBox="0 0 12 8" className={`h-2 w-3 ${dir === 'up' ? 'rotate-180' : ''}`}>
          <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </a>
    );
  };
  return (
    <div className="hidden items-center min-[560px]:flex">
      {step(prev, 'up')}
      {step(next, 'down')}
    </div>
  );
}

/** Fixed top bar: wordmark, the section menu and steppers, the theme toggle, and a scroll progress line. */
export function ProgressNav() {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const active = useActiveSection(onHome ? IDS : NONE);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="relative mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-6"
      >
        <Link href="/" className="flex min-h-11 items-center gap-3 font-bold tracking-tight text-ink">
          <span aria-hidden="true" className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inset-0 rounded-full bg-pulse" />
            <span className="pulse-beat absolute inset-0 rounded-full bg-pulse/60" />
          </span>
          <span className="whitespace-nowrap max-[380px]:sr-only">Between the Beats</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {onHome && <SectionSteps active={active} />}
          <SectionMenu onHome={onHome} active={active} />
          <ThemeToggle />
        </div>
      </nav>
      <div aria-hidden="true" className="h-px w-full overflow-hidden">
        <div ref={barRef} className="h-px w-full origin-left bg-pulse" style={{ transform: 'scaleX(0)' }} />
      </div>
    </header>
  );
}
