import { useSyncExternalStore } from "react";

/** Live boolean for a CSS media query (SSR-safe default false). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

export const MOBILE_QUERY = "(max-width: 767px)";
export const TABLET_QUERY = "(min-width: 768px) and (max-width: 1439px)";
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);
export const useFinePointer = () => useMediaQuery(FINE_POINTER_QUERY);
