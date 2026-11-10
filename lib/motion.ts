'use client';
// GSAP setup shared by every animated component. All scroll motion is registered
// inside gsap.matchMedia(MOTION_OK) so it reverts completely under reduced motion.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const EASE_OUT = 'power3.out';

export { gsap, ScrollTrigger };
