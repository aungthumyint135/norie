import { chapters } from "../config/content";
import { rig, scroll, type Rig } from "../state/experience";
import { gsap, ScrollTrigger, EASE } from "./gsap";

type Keyframe = Partial<Rig>;

/**
 * Camera + object keyframes, one per chapter (chapter 05 has a start and an end pose because the
 * object travels through the frame while that chapter is pinned). Values are world units / radians.
 */
const DESKTOP: { k: Keyframe[]; motionEnd: Keyframe } = {
  k: [
    // 01 · hero — centred, calm
    { camX: 0, camY: 0.1, camZ: 6.4, lookX: 0, lookY: -0.2, lookZ: 0, fov: 32, objX: 0, objY: 0.25, objRotX: 0.12, objRotY: 0.4, objRotZ: 0, objScale: 1, capLift: 0, ringOpen: 0, key: 2.2, rim: 1.2, fill: 0.4, warmth: 0.2, fog: 0.07, glow: 1, shaft: 0.5, dust: 0.4 },
    // 02 · form — camera approaches, object turns, light warms
    { camX: 0.35, camY: 0.38, camZ: 4.0, lookY: 0.18, fov: 30, objRotY: 2.7, objRotX: 0.22, key: 2.6, rim: 1.5, fill: 0.35, warmth: 0.5, fog: 0.05, glow: 1.35, shaft: 0.85, dust: 0.35 },
    // 03 · silhouette — object slides right, type takes the left
    { camX: 0, camY: 0.12, camZ: 5.6, lookX: 0.62, lookY: 0, fov: 32, objX: 1.45, objRotY: 4.1, objRotX: -0.08, objRotZ: -0.06, key: 2.4, rim: 2.0, fill: 0.45, warmth: 0.3, fog: 0.06, glow: 0.9, shaft: 0.4 },
    // 04 · material — macro on the collar, raking light
    { camX: 0.95, camY: 0.7, camZ: 1.2, lookX: 0.1, lookY: 0.6, fov: 26, objX: 0.25, objY: 0, objRotY: 4.75, objRotX: 0.05, objRotZ: 0, key: 3.4, rim: 2.6, fill: 0.15, warmth: 0.65, fog: 0.025, glow: 0.5, shaft: 0.2, dust: 0.15 },
    // 05 · motion (start) — object enters from the left, parts begin to separate
    { camX: 1.2, camY: 0.5, camZ: 6.0, lookX: -0.8, lookY: 0.1, fov: 34, objX: -2.2, objY: 0, objRotY: 5.6, objRotX: 0.15, capLift: 0.55, ringOpen: 0.6, key: 2.2, rim: 2.2, fill: 0.4, warmth: 0.25, fog: 0.06, glow: 1, shaft: 0.6, dust: 1.1 },
    // 06 · final — recomposed, backlit, pulled back
    { camX: 0, camY: 0.3, camZ: 7.4, lookX: 0, lookY: 0.12, fov: 30, objX: 0, objY: -0.1, objRotY: 9.0, objRotX: 0.1, objRotZ: 0, capLift: 0, ringOpen: 0, key: 1.5, rim: 2.6, fill: 0.3, warmth: 0.4, fog: 0.08, glow: 1.5, shaft: 1.1, dust: 0.3 },
  ],
  // 05 · motion (end) — camera swings around as the object crosses the frame
  motionEnd: { camX: -2.6, camY: 0.9, camZ: 5.0, lookX: 1.0, lookY: 0.2, objX: 2.0, objY: 0.1, objRotY: 8.4, objRotX: -0.1, objRotZ: 0.1, capLift: 1, ringOpen: 1, dust: 1.6 },
};

/** Phones: object lives in the upper half, type below; smaller moves, wider lens. */
const MOBILE: typeof DESKTOP = {
  k: [
    { camX: 0, camY: 0.1, camZ: 8.6, lookX: 0, lookY: 0, lookZ: 0, fov: 38, objX: 0, objY: 0.62, objRotX: 0.12, objRotY: 0.4, objRotZ: 0, objScale: 0.92, capLift: 0, ringOpen: 0, key: 2.3, rim: 1.3, fill: 0.45, warmth: 0.2, fog: 0.06, glow: 1, shaft: 0.5, dust: 0.4 },
    { camX: 0.2, camY: 0.6, camZ: 7.8, lookY: 0.35, fov: 36, objRotY: 2.7, objRotX: 0.22, key: 2.6, rim: 1.5, warmth: 0.5, glow: 1.3, shaft: 0.8 },
    { camX: 0, camY: 0.25, camZ: 7.8, lookX: 0.15, lookY: 0.05, objX: 0.3, objRotY: 4.1, objRotX: -0.08, rim: 2.0, warmth: 0.3, glow: 0.9 },
    { camX: 0.7, camY: 1.15, camZ: 2.1, lookX: 0.05, lookY: 1.0, fov: 30, objX: 0.1, objY: 0.45, objRotY: 4.75, objRotX: 0.05, key: 3.3, rim: 2.5, fill: 0.2, warmth: 0.65, fog: 0.03, glow: 0.5, shaft: 0.2, dust: 0.15 },
    { camX: 0.6, camY: 0.5, camZ: 8.4, lookX: -0.3, lookY: 0.2, fov: 38, objX: -0.8, objY: 0.6, objRotY: 5.6, capLift: 0.5, ringOpen: 0.6, key: 2.2, rim: 2.2, fill: 0.4, warmth: 0.25, fog: 0.06, glow: 1, shaft: 0.6, dust: 0.9 },
    { camX: 0, camY: 0.3, camZ: 9.2, lookX: 0, lookY: 0.15, fov: 36, objX: 0, objY: 0.5, objRotY: 9.0, objRotX: 0.1, objRotZ: 0, capLift: 0, ringOpen: 0, key: 1.6, rim: 2.6, fill: 0.35, warmth: 0.4, fog: 0.07, glow: 1.5, shaft: 1.0, dust: 0.3 },
  ],
  motionEnd: { camX: -0.8, camY: 0.7, camZ: 8.0, lookX: 0.3, lookY: 0.25, objX: 0.8, objY: 0.62, objRotY: 8.4, capLift: 1, ringOpen: 1, dust: 1.2 },
};

/** Tablets: desktop choreography with ~25% less travel. */
function soften(k: Keyframe): Keyframe {
  const out: Keyframe = { ...k };
  if (out.objX !== undefined) out.objX *= 0.75;
  if (out.lookX !== undefined) out.lookX *= 0.75;
  if (out.camX !== undefined) out.camX *= 0.75;
  if (out.camZ !== undefined) out.camZ += 0.7;
  return out;
}
const TABLET: typeof DESKTOP = { k: DESKTOP.k.map(soften), motionEnd: soften(DESKTOP.motionEnd) };

export type Layout = "desktop" | "tablet" | "mobile";
const SETS: Record<Layout, typeof DESKTOP> = { desktop: DESKTOP, tablet: TABLET, mobile: MOBILE };

/** Reduced motion: one stable composition, no scroll-driven camera. */
export function applyStaticComposition(layout: Layout) {
  Object.assign(rig, SETS[layout].k[0], layout === "mobile" ? {} : { objX: 0.9, lookX: 0.35, objRotY: 0.9 });
}

/**
 * Builds a scrubbed timeline over the whole page. Timeline time is measured in viewport heights:
 * chapter i is pinned (readable, scene at rest on keyframe i) for (height - 1) units, then the
 * scene transitions to keyframe i+1 during the 1 unit where the next chapter scrolls in.
 */
export function createSceneTimeline(root: HTMLElement, layout: Layout) {
  const set = SETS[layout];
  Object.assign(rig, set.k[0]);
  const tl = gsap.timeline({ defaults: { ease: EASE.cinema } });

  let t = 0;
  chapters.forEach((c, i) => {
    const pinned = c.height - 1;
    if (c.id === "motion") {
      // object travels through the frame while chapter 05 is pinned
      tl.to(rig, { ...set.motionEnd, duration: pinned, ease: "none" }, t);
    }
    const next = set.k[i + 1];
    if (next) tl.to(rig, { ...next, duration: 1 }, t + pinned);
    t += c.height;
  });
  // pad to the full scroll length so time maps 1:1 to viewport heights
  const total = t - 1;
  tl.set({}, {}, total);

  const st = ScrollTrigger.create({
    trigger: root,
    start: "top top",
    end: "bottom bottom",
    animation: tl,
    scrub: true, // Lenis already smooths; the scene adds its own damping
    onUpdate: (self) => (scroll.progress = self.progress),
  });
  return () => {
    st.kill();
    tl.kill();
  };
}
