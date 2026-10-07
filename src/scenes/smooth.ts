import * as THREE from "three";
import { rig, type Rig } from "../state/experience";

/**
 * Damped copy of the GSAP-driven rig. Updated once per frame (before anything reads it), so the
 * scene trails scroll with a soft, cinematic lag instead of snapping to the scrollbar.
 */
export const smooth: Rig = { ...rig };

const keys = Object.keys(rig) as (keyof Rig)[];

export function stepSmooth(dt: number, lambda = 3.2) {
  for (const k of keys) smooth[k] = THREE.MathUtils.damp(smooth[k], rig[k], lambda, dt);
}

export function snapSmooth() {
  Object.assign(smooth, rig);
}
