'use client';
import { useEffect, useRef } from 'react';
import { PulseCore } from '@/components/core/PulseCore';
import { EcgTrace } from '@/components/core/EcgTrace';
import { gsap, MOTION_OK, EASE_OUT } from '@/lib/motion';

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const q = gsap.utils.selector(el);
      // One orchestrated entrance: the trace fades up, the core blooms, the words arrive.
      gsap.set(q('.hero-ecg'), { opacity: 0, scaleX: 0.2 });
      gsap.set(q('.hero-core'), { opacity: 0, scale: 0.6 });
      gsap.set(q('.hero-line'), { opacity: 0, y: 30 });
      gsap
        .timeline({ delay: 0.15 })
        .to(q('.hero-ecg'), { opacity: 1, scaleX: 1, duration: 1.4, ease: 'power2.inOut' })
        .to(q('.hero-core'), { opacity: 1, scale: 1, duration: 1, ease: 'elastic.out(1, 0.6)' }, 0.65)
        .to(q('.hero-line'), { opacity: 1, y: 0, duration: 0.9, ease: EASE_OUT, stagger: 0.12 }, 0.95);

      // Leaving the hero, the core sinks back and the line fades: scrubbed to scroll.
      gsap.to(q('.hero-stage'), {
        yPercent: 18,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      id="top"
      ref={ref}
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-canvas-2 px-6 pb-24 pt-28"
    >
      <div className="hero-stage relative flex w-full flex-col items-center">
        <div className="hero-ecg pointer-events-none absolute left-1/2 top-[min(22vw,170px)] w-[100vw] -translate-x-1/2 -translate-y-1/2">
          <EcgTrace />
        </div>
        <div className="hero-core relative">
          <PulseCore className="h-[clamp(220px,44vw,340px)] w-[clamp(220px,44vw,340px)]" />
        </div>
        <h1 id="hero-title" className="hero-line t-hero mt-2 text-center text-ink">
          High blood pressure.
        </h1>
        <p className="hero-line mt-6 max-w-[560px] text-center t-body text-mute">
          One of the most common conditions in the world, and usually first met as a single alarming number. This is a
          calmer look at what the data shows.
        </p>
        <a
          href="#stories"
          className="hero-line mt-14 flex min-h-11 flex-col items-center gap-3 t-small text-mute hover:text-ink"
        >
          <span>Scroll to begin</span>
          <span aria-hidden="true" className="relative block h-12 w-px overflow-hidden bg-line">
            <span className="cue-line absolute inset-0 bg-pulse" />
          </span>
        </a>
      </div>
    </section>
  );
}
