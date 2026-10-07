import { gsap, EASE } from "./gsap";

/** Fullscreen menu: the panel wipes down, links rise out of masks, meta fades in. */
export function createMenuTimeline(panel: HTMLElement, reduced: boolean) {
  const links = panel.querySelectorAll("[data-menu-link]");
  const meta = panel.querySelectorAll("[data-menu-meta]");
  const tl = gsap.timeline({ paused: true });
  if (reduced) {
    tl.set(panel, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" }).fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    return tl;
  }
  tl.set(panel, { autoAlpha: 1 })
    .fromTo(panel, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.0, ease: "expo.inOut" })
    .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.06, ease: EASE.reveal }, 0.45)
    .fromTo(meta, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.05 }, 0.7);
  return tl;
}
