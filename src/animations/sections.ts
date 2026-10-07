import { chapters } from "../config/content";
import { activeChapter } from "../state/experience";
import { gsap, ScrollTrigger, EASE } from "./gsap";

/**
 * Text choreography for every chapter. Each chapter's content sits in a sticky, full-viewport
 * panel; while it's pinned, a scrubbed timeline reveals the type (masked characters rising),
 * holds it, then clears it before the next chapter scrolls in. The panels never visibly
 * "slide up" with content on them, so the page reads as one continuous scene.
 */
export function createChapterAnimations(root: HTMLElement, opts: { horizontal: boolean }) {
  const contexts: gsap.Context[] = [];
  const build = (c: (typeof chapters)[number], i: number) =>
    contexts.push(gsap.context(() => {
      const section = root.querySelector<HTMLElement>(`#${c.id}`);
      if (!section) return;
      const pinned = c.height - 1;
      const isFirst = i === 0;
      const isLast = i === chapters.length - 1;

      const chars = section.querySelectorAll(".char");
      const fades = section.querySelectorAll("[data-fade]");
      const items = section.querySelectorAll("[data-item]");
      const track = section.querySelector<HTMLElement>("[data-track]");

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${pinned * window.innerHeight}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // reveal (the hero is revealed by the intro sequence instead)
      if (!isFirst) {
        tl.fromTo(chars, { yPercent: 108 }, { yPercent: 0, duration: 0.24, stagger: { amount: 0.08 }, ease: EASE.reveal }, 0)
          .fromTo(fades, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.03, ease: "power2.out" }, 0.1);
      }

      // progressive items (FORM / PRECISION / MOTION, spec rows, details)
      if (items.length) {
        tl.fromTo(items, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.14, stagger: 0.12, ease: "power2.out" }, isFirst ? 0 : 0.18);
      }

      // horizontal travel controlled by vertical scroll (chapter 05, desktop/tablet)
      if (track && opts.horizontal) {
        tl.fromTo(track, { x: () => window.innerWidth * 0.15 }, { x: () => -(track.scrollWidth - window.innerWidth * 0.85), duration: 0.9, ease: "none" }, 0.05);
      }

      // clear before the next chapter arrives
      if (!isLast) {
        tl.to(chars, { yPercent: -108, duration: 0.18, stagger: { amount: 0.05 }, ease: "power2.in" }, 0.8)
          .to([...fades, ...items], { autoAlpha: 0, y: -18, duration: 0.15, ease: "power2.in" }, 0.8);
      }
      tl.set({}, {}, 1);

      // chapter counter in the navigation
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && activeChapter.set(c.index),
      });
    }, root));

  // The hero is on screen: build it now. Later chapters are built one per idle slice so setup never
  // becomes a single long main-thread task (their copy is plainly visible until its timeline exists).
  build(chapters[0], 0);
  let next = 1;
  let handle = 0;
  const hasIdle = typeof window.requestIdleCallback === "function";
  const schedule = () => {
    if (next >= chapters.length) return;
    const run = () => {
      build(chapters[next], next);
      next += 1;
      schedule();
    };
    handle = hasIdle ? window.requestIdleCallback(run, { timeout: 400 }) : window.setTimeout(run, 16);
  };
  schedule();

  return () => {
    if (hasIdle) window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
    contexts.forEach((ctx) => ctx.revert());
  };
}

/** Reduced motion: everything visible, no transforms; only the chapter counter is tracked. */
export function createStaticChapters(root: HTMLElement) {
  const ctx = gsap.context(() => {
    chapters.forEach((c) => {
      const section = root.querySelector<HTMLElement>(`#${c.id}`);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && activeChapter.set(c.index),
      });
    });
  }, root);
  return () => ctx.revert();
}

/** Centre of a chapter's pinned (readable) range, in page pixels. */
export function chapterRestY(id: string): number {
  const section = document.getElementById(id);
  const c = chapters.find((ch) => ch.id === id);
  if (!section || !c) return 0;
  const top = section.getBoundingClientRect().top + window.scrollY;
  return id === "experience" ? 0 : top + (c.height - 1) * window.innerHeight * 0.5;
}
