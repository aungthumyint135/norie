/**
 * Shared, non-React state for the experience.
 *
 * - `rig` holds every scroll-driven scene value. GSAP tweens it; the R3F frame loop reads it.
 *   Nothing here triggers React renders (no setState in animation loops).
 * - A tiny event store carries the rare, discrete changes React does care about
 *   (scene ready, explore mode, active chapter).
 */

export interface Rig {
  camX: number; camY: number; camZ: number;
  lookX: number; lookY: number; lookZ: number;
  fov: number;
  objX: number; objY: number; objZ: number;
  objRotX: number; objRotY: number; objRotZ: number;
  objScale: number;
  capLift: number;      // 0 = seated, 1 = lifted
  ringOpen: number;     // 0 = halo hugs the body, 1 = ring orbits wide
  key: number; rim: number; fill: number;
  warmth: number;       // 0 = neutral studio, 1 = warmer key
  fog: number;          // exponential fog density
  glow: number;         // backdrop light behind the object
  shaft: number;        // volumetric light shaft opacity
  dust: number;         // particle drift speed
}

export const rig: Rig = {
  camX: 0, camY: 0.1, camZ: 6.4,
  lookX: 0, lookY: 0, lookZ: 0,
  fov: 32,
  objX: 0, objY: -0.05, objZ: 0,
  objRotX: 0.12, objRotY: 0.4, objRotZ: 0,
  objScale: 1,
  capLift: 0, ringOpen: 0,
  key: 2.2, rim: 1.2, fill: 0.4,
  warmth: 0.2, fog: 0.07, glow: 1, shaft: 0.5, dust: 0.4,
};

/** Normalised scroll progress (0..1) for anything that wants it without GSAP. */
export const scroll = { progress: 0 };

type Listener = () => void;

function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => value,
    set(next: T) {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export const sceneReady = createStore(false);
export const exploreMode = createStore(false);
export const activeChapter = createStore(1);
export const menuOpen = createStore(false);

/**
 * Commands the explore overlay (DOM) sends to the orbit camera (3D): the keyboard / button
 * alternatives to dragging. The scene installs real handlers while explore mode is active.
 * Lives here, not in the scene module, so the DOM never imports three.js eagerly.
 */
export const exploreApi: { rotate: (dir: 1 | -1) => void; zoom: (dir: 1 | -1) => void } = {
  rotate: () => {},
  zoom: () => {},
};
