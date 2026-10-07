import { gsap, EASE } from "./gsap";

/** Opening sequence once the loader clears: headline characters rise, then the supporting UI. */
export function playHeroIntro(hero: HTMLElement, reduced: boolean) {
  const chars = hero.querySelectorAll(".char");
  const fades = hero.querySelectorAll("[data-fade]");
  if (reduced) {
    gsap.set([chars, fades], { clearProps: "all" });
    return gsap.timeline();
  }
  return gsap
    .timeline({ delay: 0.15 })
    .fromTo(chars, { yPercent: 108 }, { yPercent: 0, duration: 1.4, stagger: 0.028, ease: EASE.reveal })
    .fromTo(fades, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.1, ease: "power3.out" }, 0.55);
}

/** Hide hero content before the intro runs (avoids a flash of the final state). */
export function prepareHero(hero: HTMLElement, reduced: boolean) {
  if (reduced) return;
  gsap.set(hero.querySelectorAll(".char"), { yPercent: 108 });
  gsap.set(hero.querySelectorAll("[data-fade]"), { autoAlpha: 0 });
}
