import { useSyncExternalStore } from "react";

let cached: boolean | null = null;

export function detectWebGL(): boolean {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    cached = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}

const noop = () => () => {};

/** Whether WebGL is available (checked once, cached). */
export function useWebGL(): boolean {
  return useSyncExternalStore(noop, detectWebGL, () => false);
}

/** Rough device tier for 3D quality decisions. */
export function isLowPowerDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (
    window.matchMedia("(max-width: 767px)").matches ||
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4 ||
    nav.connection?.saveData === true
  );
}
