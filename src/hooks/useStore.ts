import { useSyncExternalStore } from "react";

type Store<T> = { get: () => T; subscribe: (l: () => void) => () => void };

/** Subscribe a component to one of the tiny stores in state/experience.ts. */
export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
