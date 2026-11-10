'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { gsap, MOTION_OK, ScrollTrigger, EASE_OUT } from '@/lib/motion';
import { useReducedMotion } from './useReducedMotion';

/**
 * Fades and lifts every [data-reveal] element inside the ref as it scrolls in.
 * Uses opacity only (never visibility) so content stays focusable before it shows.
 */
export function useRevealChildren<T extends HTMLElement>(ref: RefObject<T | null>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const items = el.querySelectorAll<HTMLElement>('[data-reveal]');
      if (!items.length) return;
      gsap.set(items, { opacity: 0, y: 28 });
      ScrollTrigger.batch(items, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: EASE_OUT, stagger: 0.08 }),
      });
    });
    return () => mm.revert();
  }, [ref]);
}

/** True once the element has entered the viewport (stays true). */
export function useInViewOnce<T extends Element>(margin = '0px 0px -15% 0px'): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin, seen]);
  return [ref, seen];
}

/** Which of the given section ids is currently in the middle band of the viewport. */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => e !== null);
    // Track every section in the reading band, so scrolling back up hands the label to the one still in view.
    const inBand = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inBand.add(e.target.id);
          else inBand.delete(e.target.id);
        }
        const last = [...ids].reverse().find((id) => inBand.has(id));
        if (last) setActive(last);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

/**
 * Smoothly tweens a list of numbers toward new targets (used when a chart's values
 * change, e.g. the salt lever). Jumps instantly under reduced motion.
 */
export function useTweenedValues(targets: readonly number[], duration = 0.8): number[] {
  const reduced = useReducedMotion();
  const [values, setValues] = useState<number[]>(() => [...targets]);
  const current = useRef<number[]>([...targets]);
  const key = targets.join('|');

  useEffect(() => {
    const to = key.split('|').map(Number);
    if (reduced) {
      current.current = to;
      setValues(to);
      return;
    }
    const from = [...current.current];
    const proxy = { t: 0 };
    const tween = gsap.to(proxy, {
      t: 1,
      duration,
      ease: EASE_OUT,
      onUpdate: () => {
        current.current = to.map((v, i) => (from[i] ?? v) + (v - (from[i] ?? v)) * proxy.t);
        setValues(current.current);
      },
    });
    return () => {
      tween.kill();
    };
  }, [key, reduced, duration]);

  return values;
}
