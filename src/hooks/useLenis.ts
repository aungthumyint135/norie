import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "../animations/gsap";
import { prefersReducedMotion } from "./useReducedMotion";

let instance: Lenis | null = null;

/** The active Lenis instance (null under reduced motion → native scrolling). */
export const getLenis = () => instance;

/**
 * Smooth scrolling driven by GSAP's ticker so Lenis and ScrollTrigger share one clock.
 * Disabled entirely for reduced motion (native scroll, no inertia).
 */
export function useLenis() {
  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, touchMultiplier: 1.2 });
    instance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      instance = null;
    };
  }, []);
}

/** Scroll to an absolute position, with Lenis when available. */
export function scrollToY(y: number, immediate = false) {
  // force: menu links close the menu (which restarts Lenis) in the same tick as they scroll
  if (instance) instance.scrollTo(y, { duration: immediate ? 0 : 2.2, immediate, force: true, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: "auto" });
}
