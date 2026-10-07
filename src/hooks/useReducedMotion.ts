import { useMediaQuery } from "./useMediaQuery";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** True when the visitor asked the OS for reduced motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}

export const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
